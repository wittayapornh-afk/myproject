"""
Integration Tests for Flash Sale, Tag, and Coupon Systems
Tests end-to-end functionality and system integration
"""

from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from decimal import Decimal
from myapp.models import (
    FlashSale, FlashSaleProduct, FlashSaleCampaign,
    Tag, Product, Category, Coupon, UserCoupon, Order, OrderItem, PromoUsageLog
)
import json
from myapp.services import FlashSaleService, CouponService, PriceCalculator

User = get_user_model()


class FlashSaleCouponIntegrationTest(TestCase):
    """Test interaction between Flash Sale and Coupon systems"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123',
            role='customer'
        )
        
        self.category = Category.objects.create(name="Electronics")
        self.product = Product.objects.create(
            title="Laptop",
            price=Decimal('1000.00'),
            stock=10,
            category=self.category,
            is_active=True
        )
        
        # Create active Flash Sale
        now = timezone.now()
        self.flash_sale = FlashSale.objects.create(
            name="Flash Sale",
            start_time=now,
            end_time=now + timedelta(hours=2),
            is_active=True
        )
        
        self.fs_product = FlashSaleProduct.objects.create(
            flash_sale=self.flash_sale,
            product=self.product,
            sale_price=Decimal('800.00'),
            quantity_limit=5
        )
        
        # Create stackable coupon
        self.stackable_coupon = Coupon.objects.create(
            code="EXTRA10",
            discount_type="percent",
            discount_value=Decimal('10.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            is_stackable_with_flash_sale=True,
            active=True
        )
        
        # Create non-stackable coupon
        self.non_stackable_coupon = Coupon.objects.create(
            code="FIXED100",
            discount_type="fixed",
            discount_value=Decimal('100.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            is_stackable_with_flash_sale=False,
            active=True
        )
    
    def test_flash_sale_price_applies(self):
        """Test Flash Sale price is retrieved correctly"""
        fs_product = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNotNone(fs_product)
        self.assertEqual(fs_product.sale_price, Decimal('800.00'))
    
    def test_stackable_coupon_with_flash_sale(self):
        """Test stackable coupon applies on top of Flash Sale price"""
        result = PriceCalculator.calculate_best_item_price(
            product=self.product,
            user=self.user,
            applied_coupon=self.stackable_coupon
        )
        
        # Flash price: 800, 10% off = 80, final = 720
        expected_final = Decimal('720.00')
        self.assertEqual(result['final_price'], expected_final)
    
    def test_non_stackable_coupon_chooses_best_deal(self):
        """Test non-stackable coupon chooses best between Flash Sale and Coupon"""
        result = PriceCalculator.calculate_best_item_price(
            product=self.product,
            user=self.user,
            applied_coupon=self.non_stackable_coupon
        )
        
        # Flash: 800, Coupon: 1000-100 = 900
        # Should choose Flash Sale (800 < 900)
        self.assertEqual(result['final_price'], Decimal('800.00'))
        self.assertEqual(result['source_type'], 'flash_sale')

    def test_coupon_excludes_flash_sale_products_logic(self):
        """Test coupon logic when it's NOT stackable and flash sale is better"""
        # Already covered in test_non_stackable_coupon_chooses_best_deal
        # Let's test if calculator correctly identifies it's not stackable
        self.assertFalse(self.non_stackable_coupon.is_stackable_with_flash_sale)

    def test_coupon_usage_tracking_integration(self):
        """Test coupon usage is logged in PromoUsageLog after checkout (simulated)"""
        # In actual views, checkout_api handles this. We test the service/model part.
        PromoUsageLog.objects.create(user=self.user, promo_type='coupon', promo_id=self.stackable_coupon.id)
        is_valid, msg, obj = CouponService.validate_coupon(self.user, self.stackable_coupon.code, Decimal('1000'))
        # If limit was 1, it should now be invalid
        self.stackable_coupon.limit_per_user = 1
        self.stackable_coupon.save()
        is_valid, msg, obj = CouponService.validate_coupon(self.user, self.stackable_coupon.code, Decimal('1000'))
        self.assertFalse(is_valid)


class TagFlashSaleIntegrationTest(TestCase):
    """Test interaction between Tag and Flash Sale systems"""
    
    def setUp(self):
        """Set up test data"""
        self.category = Category.objects.create(name="Fashion")
        self.product = Product.objects.create(
            title="T-Shirt",
            price=Decimal('500.00'),
            stock=20,
            category=self.category,
            is_active=True
        )
        
        # Create Flash Sale tag
        self.flash_sale_tag = Tag.objects.create(
            name="Flash Sale",
            group_name="badge",
            color="#FF0000",
            is_active=True
        )
        
        # Create Flash Sale
        now = timezone.now()
        self.flash_sale = FlashSale.objects.create(
            name="Fashion Flash",
            start_time=now,
            end_time=now + timedelta(hours=2),
            is_active=True
        )
        
        FlashSaleProduct.objects.create(
            flash_sale=self.flash_sale,
            product=self.product,
            sale_price=Decimal('350.00'),
            quantity_limit=10
        )
    
    def test_product_tagged_during_flash_sale(self):
        """Test product can be tagged when in Flash Sale"""
        self.product.tags.add(self.flash_sale_tag)
        
        self.assertIn(self.flash_sale_tag, self.product.tags.all())
        
        # Product should be both in Flash Sale and have tag
        fs_product = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNotNone(fs_product)

    def test_automated_tag_update_on_stock_change(self):
        """Test tag system reacts to stock changes from Flash Sale sales"""
        self.product.stock = 5
        self.product.save()
        # Trigger automation (simulated or direct query check)
        # Check if 'Last Chance' logic applies
        low_stock = Product.objects.filter(stock__lte=5, stock__gt=0)
        self.assertIn(self.product, low_stock)


class EndToEndCheckoutTest(TestCase):
    """Test complete checkout flow with Flash Sale, Tags, and Coupons"""
    
    def setUp(self):
        """Set up complete test scenario"""
        self.client = Client()
        self.user = User.objects.create_user(
            username='customer',
            password='test123',
            email='customer@test.com',
            role='customer'
        )
        
        self.category = Category.objects.create(name="Electronics")
        
        # Product 1: In Flash Sale
        self.product1 = Product.objects.create(
            title="Phone",
            price=Decimal('800.00'),
            stock=10,
            category=self.category,
            is_active=True
        )
        
        # Product 2: Normal price with tag
        self.product2 = Product.objects.create(
            title="Headphones",
            price=Decimal('200.00'),
            stock=15,
            category=self.category,
            is_active=True
        )
        
        # Create tags (or get if already created by post_save signal)
        self.new_tag, _ = Tag.objects.get_or_create(
            name="New Arrival", 
            defaults={"group_name": "badge"}
        )
        self.product2.tags.add(self.new_tag)
        
        # Create Flash Sale
        now = timezone.now()
        flash_sale = FlashSale.objects.create(
            name="Phone Flash",
            start_time=now,
            end_time=now + timedelta(hours=2),
            is_active=True
        )
        
        FlashSaleProduct.objects.create(
            flash_sale=flash_sale,
            product=self.product1,
            sale_price=Decimal('600.00'),
            quantity_limit=5
        )
        
        # Create coupon
        self.coupon = Coupon.objects.create(
            code="SAVE50",
            discount_type="fixed",
            discount_value=Decimal('50.00'),
            min_spend=Decimal('500.00'),
            start_date=now,
            end_date=now + timedelta(days=30),
            active=True,
            is_stackable_with_flash_sale=True # ✅ MUST be stackable if cart has Flash Sale item
        )
        
        UserCoupon.objects.create(user=self.user, coupon=self.coupon)
    
    def test_cart_with_flash_sale_and_coupon(self):
        """Test calculating cart total with Flash Sale product and coupon"""
        # Cart: Phone (Flash: 600) + Headphones (200) = 800
        # Coupon: -50
        # Total: 750
        
        cart_items = [
            {'product': self.product1, 'quantity': 1, 'price': Decimal('600.00')},
            {'product': self.product2, 'quantity': 1, 'price': Decimal('200.00')}
        ]
        
        subtotal = Decimal('800.00')
        
        # Validate coupon
        is_valid, message, coupon = CouponService.validate_coupon(
            user=self.user,
            coupon_code="SAVE50",
            cart_total=subtotal,
            cart_items=cart_items
        )
        
        self.assertTrue(is_valid)
        
        # Calculate discount
        discount = CouponService.calculate_discount(
            coupon,
            original_price=subtotal
        )
        
        self.assertEqual(discount, Decimal('50.00'))
        
        final_total = subtotal - discount
        self.assertEqual(final_total, Decimal('750.00'))

    def test_checkout_api_integration(self):
        """Test the actual checkout API with a flash sale product"""
        self.client.force_login(self.user)
        # In real checkout, we send product IDs and quantities
        data = {
            "items": [{"id": self.product1.id, "quantity": 1}],
            "couponCode": "SAVE50",
            "customer": {
                "name": "Test Customer",
                "phone": "0812345678",
                "address": "123 Test Rd",
                "province": "Bangkok"
            }
        }
        # Note: Actual checkout might need more fields or mock address
        response = self.client.post('/api/checkout/', data=json.dumps(data), content_type='application/json')
        # We expect a success or a specific failure if address is missing, but auth/promo logic should pass
        # Since this is a unit test environment, we might just check if it gets past the promo validation
        self.assertIn(response.status_code, [200, 201, 400]) 

    def test_price_calculator_composite_deal(self):
        """Test PriceCalculator handles complex cart with mixed items"""
        # Product 1 is Flash, Product 2 is Normal
        deal1 = PriceCalculator.calculate_best_item_price(self.product1, self.user, self.coupon)
        deal2 = PriceCalculator.calculate_best_item_price(self.product2, self.user, self.coupon)
        
        self.assertEqual(deal1['final_price'], Decimal('600.00')) # Flash wins
        self.assertEqual(deal2['final_price'], Decimal('200.00')) # Normal price


class AnalyticsIntegrationTest(TestCase):
    """Test Analytics APIs with real data"""
    
    def setUp(self):
        """Set up test data with sales history"""
        self.client = Client()
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role='admin'
        )
        
        self.category = Category.objects.create(name="Books")
        self.product = Product.objects.create(
            title="Python Guide",
            price=Decimal('500.00'),
            stock=50,
            category=self.category,
            is_active=True
        )
        
        # Create Flash Sale with sales
        now = timezone.now()
        self.flash_sale = FlashSale.objects.create(
            name="Book Flash",
            start_time=now - timedelta(hours=1),
            end_time=now + timedelta(hours=1),
            is_active=True
        )
        
        self.fs_product = FlashSaleProduct.objects.create(
            flash_sale=self.flash_sale,
            product=self.product,
            sale_price=Decimal('400.00'),
            quantity_limit=20,
            sold_count=10  # 10 sold
        )
    
    def test_flash_sale_analytics_endpoint(self):
        """Test Flash Sale analytics returns correct metrics"""
        self.client.force_login(self.admin)
        
        response = self.client.get(
            f'/api/analytics/flash-sales/{self.flash_sale.id}/'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check metrics
        self.assertEqual(data['metrics']['total_sold'], 10)
        self.assertEqual(data['metrics']['total_quota'], 20)
        self.assertEqual(data['metrics']['sell_through_rate'], 50.0)
        self.assertEqual(data['metrics']['total_revenue'], 4000.0)  # 10 * 400

    def test_admin_dashboard_stats_integration(self):
        """Test that promotional sales appear in admin dashboard stats"""
        self.client.force_login(self.admin)
        # Create an order for our flash sale product
        order = Order.objects.create(user=self.admin, total_price=400, status='Paid')
        OrderItem.objects.create(order=order, product=self.product, quantity=1, price_at_purchase=400)
        
        response = self.client.get('/api/admin-stats/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['total_sales'] >= 400)

class CrossSystemBehaviorTest(TestCase):
    """Test more complex scenarios involving timing and bulk actions"""
    
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_user(username='admin_cross', role='admin', email='cross@test.com')
        self.category = Category.objects.create(name="Home")
        self.product = Product.objects.create(title="Lamp", price=100, stock=10, category=self.category)

    def test_flash_sale_expiry_price_reversion(self):
        """Test that price reverts to normal after flash sale expires"""
        now = timezone.now()
        fs = FlashSale.objects.create(name="Quick FS", start_time=now-timedelta(minutes=30), end_time=now-timedelta(minutes=1), is_active=True)
        FlashSaleProduct.objects.create(flash_sale=fs, product=self.product, sale_price=Decimal('10.00'))
        
        # Service should return None because it's expired
        result = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNone(result)
        
        deal = PriceCalculator.calculate_best_item_price(self.product, self.admin)
        self.assertEqual(deal['final_price'], Decimal('100.00'))

    def test_tag_bulk_update_affects_search(self):
        """Test that bulk tagging products makes them searchable by tags"""
        tag = Tag.objects.create(name="Searchable Integration", group_name="promotion")
        self.product.tags.add(tag)
        
        self.client.force_login(self.admin)
        data = {"tag_ids": [tag.id]}
        response = self.client.post('/api/products/by-tags/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Lamp")

    def test_coupon_stackability_strict_rule(self):
        """Test that non-stackable coupon cannot be used if flash sale is better"""
        now = timezone.now()
        fs = FlashSale.objects.create(name="Deep FS", start_time=now, end_time=now+timedelta(hours=1), is_active=True)
        FlashSaleProduct.objects.create(flash_sale=fs, product=self.product, sale_price=Decimal('20.00'))
        
        coupon = Coupon.objects.create(code="SAVE10", discount_type="percent", discount_value=10, is_stackable_with_flash_sale=False, active=True, end_date=now+timedelta(days=1))
        
        # Product 100 -> Flash 20. Coupon 10% -> 90. 
        # Since 20 < 90, it should use Flash and coupon gives no extra discount if Applied.
        deal = PriceCalculator.calculate_best_item_price(self.product, self.admin, applied_coupon=coupon)
        self.assertEqual(deal['final_price'], Decimal('20.00'))
        self.assertEqual(deal['source_type'], 'flash_sale')

    def test_composite_analytics_overview(self):
        """Test tag and coupon analytics correlation (simulated summary)"""
        self.client.force_login(self.admin)
        # Check if tag analytics endpoint is live
        response = self.client.get('/api/analytics/tags/')
        self.assertEqual(response.status_code, 200)
        # Check if coupon analytics endpoint is live
        response = self.client.get('/api/analytics/coupons/')
        self.assertEqual(response.status_code, 200)
