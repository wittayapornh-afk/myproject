"""
Unit Tests for Coupon System
Tests: Coupon model, validation, discount calculation, and APIs
"""

from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from decimal import Decimal
from myapp.models import Coupon, UserCoupon, Product, Category, PromoUsageLog
import json
from myapp.services import CouponService

User = get_user_model()


class CouponModelTest(TestCase):
    """Test Coupon model functionality"""
    
    def setUp(self):
        """Set up test data"""
        now = timezone.now()
        self.coupon = Coupon.objects.create(
            code="TEST10",
            discount_type="percent",
            discount_value=Decimal('10.00'),
            min_spend=Decimal('100.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            usage_limit=100,
            active=True
        )
    
    def test_coupon_creation(self):
        """Test Coupon is created correctly"""
        self.assertEqual(self.coupon.code, "TEST10")
        self.assertEqual(self.coupon.discount_type, "percent")
        self.assertTrue(self.coupon.active)
    
    def test_coupon_is_valid_when_active(self):
        """Test is_valid returns True for valid coupon"""
        self.assertTrue(self.coupon.is_valid())
    
    def test_coupon_is_invalid_when_inactive(self):
        """Test is_valid returns False when inactive"""
        self.coupon.active = False
        self.coupon.save()
        self.assertFalse(self.coupon.is_valid())
    
    def test_coupon_is_invalid_when_expired(self):
        """Test is_valid returns False when expired"""
        self.coupon.end_date = timezone.now() - timedelta(days=1)
        self.coupon.save()
        self.assertFalse(self.coupon.is_valid())
    
    def test_coupon_is_invalid_before_start_date(self):
        """Test is_valid returns False before start date"""
        self.coupon.start_date = timezone.now() + timedelta(days=1)
        self.coupon.save()
        self.assertFalse(self.coupon.is_valid())

    def test_coupon_invalid_when_usage_limit_reached(self):
        """Test is_valid returns False when usage limit reached"""
        self.coupon.used_count = 100
        self.coupon.save()
        self.assertFalse(self.coupon.is_valid())


class CouponValidationTest(TestCase):
    """Test CouponService validation"""
    
    def setUp(self):
        """Set up test data"""
        now = timezone.now()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123',
            role='customer'
        )
        
        self.coupon = Coupon.objects.create(
            code="VALID10",
            discount_type="percent",
            discount_value=Decimal('10.00'),
            min_spend=Decimal('100.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            usage_limit=100,
            total_supply=100,
            limit_per_user=5,
            active=True
        )
    
    def test_validate_coupon_success(self):
        """Test successful coupon validation"""
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="VALID10",
            cart_total=Decimal('150.00')
        )
        self.assertTrue(is_valid)
        self.assertEqual(coupon, self.coupon)
    
    def test_validate_coupon_fails_min_spend(self):
        """Test validation fails when min spend not met"""
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="VALID10",
            cart_total=Decimal('50.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("ยอดซื้อไม่ถึงขั้นต่ำ", message)
    
    def test_validate_coupon_fails_invalid_code(self):
        """Test validation fails for invalid code"""
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="INVALID",
            cart_total=Decimal('150.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("ไม่พบรหัสคูปอง", message)

    def test_validate_coupon_fails_usage_limit_per_user(self):
        """Test validation fails when user usage limit reached"""
        self.coupon.limit_per_user = 1
        self.coupon.save()
        
        # Log one usage
        PromoUsageLog.objects.create(
            user=self.user,
            promo_type='coupon',
            promo_id=self.coupon.id
        )
        
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="VALID10",
            cart_total=Decimal('150.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("ครบตามจำนวนที่กำหนด", message)

    def test_validate_coupon_fails_total_supply_reached(self):
        """Test validation fails when total supply is reached"""
        self.coupon.total_supply = 10
        self.coupon.used_count = 10
        self.coupon.save()
        
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="VALID10",
            cart_total=Decimal('150.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("สิทธิ์ของคูปองนี้ถูกใช้จองเต็มหมดแล้ว", message)


class CouponDiscountCalculationTest(TestCase):
    """Test discount calculation for different coupon types"""
    
    def test_fixed_discount(self):
        """Test fixed amount discount calculation"""
        coupon = Coupon(
            discount_type="fixed",
            discount_value=Decimal('50.00')
        )
        discount = CouponService.calculate_discount(
            coupon, 
            original_price=Decimal('200.00')
        )
        self.assertEqual(discount, Decimal('50.00'))
    
    def test_percent_discount(self):
        """Test percentage discount calculation"""
        coupon = Coupon(
            discount_type="percent",
            discount_value=Decimal('10.00')
        )
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('200.00')
        )
        self.assertEqual(discount, Decimal('20.00'))
    
    def test_capped_percent_discount(self):
        """Test capped percentage discount"""
        coupon = Coupon(
            discount_type="capped_percent",
            discount_value=Decimal('20.00'),
            max_discount_amount=Decimal('50.00')
        )
        # 20% of 500 = 100, but capped at 50
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('500.00')
        )
        self.assertEqual(discount, Decimal('50.00'))
    
    def test_free_shipping_discount(self):
        """Test free shipping discount equals shipping cost"""
        coupon = Coupon(
            discount_type="free_shipping",
            discount_value=Decimal('0.00')
        )
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('200.00'),
            shipping_cost=Decimal('50.00')
        )
        self.assertEqual(discount, Decimal('50.00'))
    
    def test_tiered_discount(self):
        """Test tiered discount calculation"""
        coupon = Coupon(
            discount_type="tiered",
            tiered_rules=[
                {'min': 1000, 'disc': 200},
                {'min': 500, 'disc': 100},
                {'min': 200, 'disc': 50}
            ]
        )
        
        # Test tier 1 (1000+)
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('1200.00')
        )
        self.assertEqual(discount, Decimal('200.00'))
        
        # Test tier 2 (500-999)
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('600.00')
        )
        self.assertEqual(discount, Decimal('100.00'))

    def test_tiered_discount_no_tier_met(self):
        """Test tiered discount when no tier is met"""
        coupon = Coupon(
            discount_type="tiered",
            tiered_rules=[{'min': 1000, 'disc': 200}, {'min': 500, 'disc': 100}]
        )
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('400.00')
        )
        self.assertEqual(discount, Decimal('0.00'))

    def test_tiered_discount_boundary_values(self):
        """Test tiered discount exactly at boundary"""
        coupon = Coupon(
            discount_type="tiered",
            tiered_rules=[{'min': 500, 'disc': 100}]
        )
        discount = CouponService.calculate_discount(
            coupon,
            original_price=Decimal('500.00')
        )
        self.assertEqual(discount, Decimal('100.00'))


class CouponAPITest(TestCase):
    """Test Coupon API endpoints"""
    
    def setUp(self):
        """Set up test client and user"""
        self.client = Client()
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role='admin'
        )
        self.normal_user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='user123',
            role='customer'
        )
        
        now = timezone.now()
        self.coupon = Coupon.objects.create(
            code="API10",
            discount_type="percent",
            discount_value=Decimal('10.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            active=True
        )
    
    def test_admin_coupon_list_requires_auth(self):
        """Test admin coupon list requires authentication"""
        response = self.client.get('/api/admin/coupons/')
        self.assertEqual(response.status_code, 401)
    
    def test_admin_coupon_list_requires_admin_role(self):
        """Test admin coupon list requires admin role"""
        self.client.force_login(self.normal_user)
        response = self.client.get('/api/admin/coupons/')
        self.assertEqual(response.status_code, 403)
    
    def test_get_public_coupons(self):
        """Test public can get public coupons"""
        self.coupon.is_public = True
        self.coupon.save()
        
        response = self.client.get('/api/coupons-public/')
        self.assertEqual(response.status_code, 200)

    def test_admin_create_coupon(self):
        """Test admin can create a new coupon via API"""
        self.client.force_login(self.admin_user)
        data = {
            "code": "UNIQUE_NEW_API",
            "discount_type": "fixed",
            "discount_value": "100.00",
            "min_spend": "500.00",
            "usage_limit": 100,
            "start_date": timezone.now().isoformat(),
            "end_date": (timezone.now() + timedelta(days=10)).isoformat()
        }
        response = self.client.post('/api/admin/coupons/', data=json.dumps(data), content_type='application/json')
        self.assertIn(response.status_code, [200, 201])
        self.assertTrue(Coupon.objects.filter(code="UNIQUE_NEW_API").exists())

    def test_admin_update_coupon(self):
        """Test admin can update coupon via API"""
        self.client.force_login(self.admin_user)
        data = {"discount_value": "15.00"}
        response = self.client.put(f'/api/admin/coupons/{self.coupon.id}/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.coupon.refresh_from_db()
        self.assertEqual(self.coupon.discount_value, Decimal('15.00'))

    def test_admin_delete_coupon(self):
        """Test admin can delete coupon via API"""
        self.client.force_login(self.admin_user)
        response = self.client.delete(f'/api/admin/coupons/{self.coupon.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Coupon.objects.filter(id=self.coupon.id).exists())


class RoleBasedCouponTest(TestCase):
    """Test role-based coupon restrictions"""
    
    def setUp(self):
        """Set up users with different roles"""
        self.new_user = User.objects.create_user(
            username='newuser',
            email='newuser@test.com',
            role='new_user'
        )
        self.customer = User.objects.create_user(
            username='customer',
            email='customer@test.com',
            role='customer'
        )
        
        now = timezone.now()
        self.new_user_coupon = Coupon.objects.create(
            code="NEWUSER20",
            discount_type="percent",
            discount_value=Decimal('20.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            allowed_roles=['new_user'],
            active=True
        )
    
    def test_coupon_valid_for_allowed_role(self):
        """Test coupon is valid for allowed role"""
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.new_user,
            coupon_code="NEWUSER20",
            cart_total=Decimal('100.00')
        )
        self.assertTrue(is_valid)
    
    def test_coupon_invalid_for_disallowed_role(self):
        """Test coupon is invalid for disallowed role"""
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.customer,
            coupon_code="NEWUSER20",
            cart_total=Decimal('100.00')
        )
        self.assertFalse(is_valid)
        self.assertTrue("สมาชิกใหม่เท่านั้น" in message or "ไม่ได้รับสิทธิ์" in message)

class AdvancedCouponValidationTest(TestCase):
    """Test advanced logic like daily limits and category exclusions"""

    def setUp(self):
        self.user = User.objects.create_user(username='advuser', email='adv@test.com')
        self.category = Category.objects.create(name="Gadgets")
        self.product = Product.objects.create(title="Phone", price=1000, category=self.category)
        
        now = timezone.now()
        self.coupon = Coupon.objects.create(
            code="ADVANCED",
            discount_type="fixed",
            discount_value=Decimal('100.00'),
            end_date=now + timedelta(days=5),
            active=True
        )

    def test_coupon_limit_per_user_per_day(self):
        """Test daily limit restriction"""
        self.coupon.limit_per_user_per_day = 1
        self.coupon.save()
        
        # Log one usage today
        PromoUsageLog.objects.create(
            user=self.user,
            promo_type='coupon',
            promo_id=self.coupon.id,
            timestamp=timezone.now()
        )
        
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="ADVANCED",
            cart_total=Decimal('1000.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("ครบโควต้าต่อวันแล้ว", message)

    def test_coupon_exclude_category(self):
        """Test validation fails when cart only has excluded categories"""
        self.coupon.conditions = {"exclude_categories": [self.category.id]}
        self.coupon.min_spend = Decimal('500.00')
        self.coupon.save()
        
        cart_items = [{"product": self.product, "price": 1000, "quantity": 1}]
        
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="ADVANCED",
            cart_total=Decimal('1000.00'),
            cart_items=cart_items
        )
        self.assertFalse(is_valid)
        self.assertIn("สินค้าที่ร่วมรายการไม่ถึงขั้นต่ำ", message)

    def test_coupon_allowed_roles_restriction(self):
        """Test coupon restricted to specific roles"""
        self.coupon.allowed_roles = ["vip", "super_admin"]
        self.coupon.save()
        
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user, # user role is 'customer'
            coupon_code="ADVANCED",
            cart_total=Decimal('1000.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("เฉพาะสมาชิกกลุ่มพิเศษ", message)

    def test_coupon_user_usage_tracking(self):
        """Test tracking usage count for a specific user"""
        # Collect coupon first
        UserCoupon.objects.create(user=self.user, coupon=self.coupon, status='active')
        
        # Success first time
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="ADVANCED",
            cart_total=Decimal('1000.00')
        )
        self.assertTrue(is_valid)
        
        # Simulate usage
        UserCoupon.objects.filter(user=self.user, coupon=self.coupon).update(status='used')
        
        # Fail second time
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="ADVANCED",
            cart_total=Decimal('1000.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("ใช้คูปองนี้ไปแล้ว", message)

    def test_coupon_usage_limit_total(self):
        """Test total usage limit for the coupon"""
        self.coupon.usage_limit = 5
        self.coupon.used_count = 5
        self.coupon.save()
        
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="ADVANCED",
            cart_total=Decimal('1000.00')
        )
        self.assertFalse(is_valid)
        self.assertIn("คูปองนี้ถูกใช้งานครบจำนวนแล้ว", message)
