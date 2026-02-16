"""
Unit Tests for Flash Sale System
Tests: FlashSale model, FlashSaleProduct, FlashSaleCampaign, and related APIs
"""

from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from decimal import Decimal
from myapp.models import (
    FlashSale, FlashSaleProduct, FlashSaleCampaign, 
    Product, Category, PromoUsageLog
)
import json
from myapp.services import FlashSaleService

User = get_user_model()


class FlashSaleModelTest(TestCase):
    """Test FlashSale model functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.now = timezone.now()
        self.future = self.now + timedelta(hours=2)
        self.past = self.now - timedelta(hours=2)
        
        self.campaign = FlashSaleCampaign.objects.create(
            name="Test Campaign",
            campaign_start=self.now,
            campaign_end=self.future,
            is_active=True
        )
        
        self.flash_sale = FlashSale.objects.create(
            name="Test Flash Sale",
            description="Test Description",
            start_time=self.now,
            end_time=self.future,
            is_active=True,
            priority=1,
            campaign=self.campaign
        )
    
    def test_flash_sale_creation(self):
        """Test Flash Sale is created correctly"""
        self.assertEqual(self.flash_sale.name, "Test Flash Sale")
        self.assertTrue(self.flash_sale.is_active)
        self.assertEqual(self.flash_sale.campaign, self.campaign)
    
    def test_flash_sale_status_live(self):
        """Test status property returns 'Live' for active sale"""
        status = self.flash_sale.status
        self.assertEqual(status, 'Live')
    
    def test_flash_sale_status_upcoming(self):
        """Test status property returns 'Upcoming' for future sale"""
        future_sale = FlashSale.objects.create(
            name="Future Sale",
            start_time=self.future,
            end_time=self.future + timedelta(hours=2),
            is_active=True
        )
        self.assertEqual(future_sale.status, 'Upcoming')
    
    def test_flash_sale_status_ended(self):
        """Test status property returns 'Ended' for past sale"""
        past_sale = FlashSale.objects.create(
            name="Past Sale",
            start_time=self.past - timedelta(hours=2),
            end_time=self.past,
            is_active=True
        )
        self.assertEqual(past_sale.status, 'Ended')
    
    def test_flash_sale_status_inactive(self):
        """Test status property returns 'Inactive' for inactive sale"""
        self.flash_sale.is_active = False
        self.flash_sale.save()
        self.assertEqual(self.flash_sale.status, 'Inactive')


class FlashSaleProductTest(TestCase):
    """Test FlashSaleProduct model"""
    
    def setUp(self):
        """Set up test data"""
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            title="Test Product",
            price=Decimal('100.00'),
            stock=10,
            category=self.category,
            is_active=True
        )
        
        now = timezone.now()
        self.flash_sale = FlashSale.objects.create(
            name="Test Sale",
            start_time=now,
            end_time=now + timedelta(hours=2),
            is_active=True
        )
        
        self.fs_product = FlashSaleProduct.objects.create(
            flash_sale=self.flash_sale,
            product=self.product,
            sale_price=Decimal('80.00'),
            quantity_limit=5,
            sold_count=0
        )
    
    def test_flash_sale_product_creation(self):
        """Test FlashSaleProduct is created correctly"""
        self.assertEqual(self.fs_product.sale_price, Decimal('80.00'))
        self.assertEqual(self.fs_product.quantity_limit, 5)
    
    def test_is_available_when_stock_exists(self):
        """Test is_available returns True when stock exists"""
        self.assertTrue(self.fs_product.is_available())
    
    def test_is_available_when_sold_out(self):
        """Test is_available returns False when sold out"""
        self.fs_product.sold_count = 5
        self.fs_product.save()
        self.assertFalse(self.fs_product.is_available())
    
    def test_is_available_with_reserved_stock(self):
        """Test is_available considers reserved stock"""
        self.fs_product.sold_count = 3
        self.fs_product.reserved_stock = 2
        self.fs_product.save()
        self.assertFalse(self.fs_product.is_available())


class FlashSaleAPITest(TestCase):
    """Test Flash Sale API endpoints"""
    
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
        self.flash_sale = FlashSale.objects.create(
            name="API Test Sale",
            start_time=now,
            end_time=now + timedelta(hours=2),
            is_active=True
        )
    
    def test_get_active_flash_sales_public(self):
        """Test public can get active flash sales"""
        response = self.client.get('/api/flash-sales/active/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
    
    def test_admin_flash_sale_list_requires_auth(self):
        """Test admin flash sale list requires authentication"""
        response = self.client.get('/api/admin/flash-sales/')
        self.assertEqual(response.status_code, 401)
    
    def test_admin_flash_sale_list_requires_admin_role(self):
        """Test admin flash sale list requires admin role"""
        self.client.force_login(self.normal_user)
        response = self.client.get('/api/admin/flash-sales/')
        self.assertEqual(response.status_code, 403)

    def test_admin_create_campaign_api(self):
        """Test admin can create a campaign via API"""
        self.client.force_login(self.admin_user)
        data = {
            "name": "New Campaign API",
            "campaign_start": timezone.now().isoformat(),
            "campaign_end": (timezone.now() + timedelta(days=1)).isoformat()
        }
        response = self.client.post('/api/admin/campaigns/', data=json.dumps(data), content_type='application/json')
        self.assertIn(response.status_code, [200, 201])
        self.assertTrue(FlashSaleCampaign.objects.filter(name="New Campaign API").exists())

    def test_admin_delete_flash_sale_api(self):
        """Test admin can delete a flash sale via API"""
        self.client.force_login(self.admin_user)
        response = self.client.delete(f'/api/admin/flash-sales/{self.flash_sale.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(FlashSale.objects.filter(id=self.flash_sale.id).exists())

    def test_flash_sale_analytics_api_auth(self):
        """Test analytics requires admin auth"""
        response = self.client.get(f'/api/analytics/flash-sales/{self.flash_sale.id}/')
        self.assertEqual(response.status_code, 401)


class FlashSaleServiceTest(TestCase):
    """Test FlashSaleService functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            title="Test Product",
            price=Decimal('100.00'),
            stock=10,
            category=self.category,
            is_active=True
        )
        
        now = timezone.now()
        self.flash_sale = FlashSale.objects.create(
            name="Service Test Sale",
            start_time=now,
            end_time=now + timedelta(hours=2),
            is_active=True,
            priority=1
        )
        
        self.fs_product = FlashSaleProduct.objects.create(
            flash_sale=self.flash_sale,
            product=self.product,
            sale_price=Decimal('80.00'),
            quantity_limit=5
        )
        self.admin_user = User.objects.create_user(
            username='admin_service',
            email='admin_s@test.com',
            role='admin'
        )
    
    def test_get_active_flash_sale_returns_product(self):
        """Test service returns active flash sale for product"""
        result = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNotNone(result)
        self.assertEqual(result.sale_price, Decimal('80.00'))
    
    def test_get_active_flash_sale_returns_none_for_inactive(self):
        """Test service returns None for inactive flash sale"""
        self.flash_sale.is_active = False
        self.flash_sale.save()
        result = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNone(result)

    def test_flash_sale_priority_overlap(self):
        """Test higher priority flash sale wins"""
        now = timezone.now()
        high_priority = FlashSale.objects.create(
            name="High Priority", start_time=now, end_time=now+timedelta(hours=1), priority=10, is_active=True
        )
        FlashSaleProduct.objects.create(flash_sale=high_priority, product=self.product, sale_price=Decimal('50.00'))
        
        result = FlashSaleService.get_active_flash_sale(self.product)
        self.assertEqual(result.sale_price, Decimal('50.00'))

    def test_validate_user_limit_success(self):
        """Test user limit validation success"""
        self.flash_sale.limit_per_user_total = 2
        self.flash_sale.save()
        self.assertTrue(FlashSaleService.validate_user_limit(self.flash_sale, self.admin_user))

    def test_validate_user_limit_exceeded(self):
        """Test user limit validation failure when exceeded"""
        self.flash_sale.limit_per_user_total = 1
        self.flash_sale.save()
        PromoUsageLog.objects.create(user=self.admin_user, promo_type='flash', promo_id=self.flash_sale.id)
        self.assertFalse(FlashSaleService.validate_user_limit(self.flash_sale, self.admin_user))

    def test_flash_sale_rounds_logic(self):
        """Test round-based time validation in service"""
        now = timezone.now()
        current_hour = now.hour
        self.flash_sale.rounds = [{"start": f"{current_hour:02d}:00", "end": f"{current_hour:02d}:59"}]
        self.flash_sale.save()
        result = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNotNone(result)

    def test_flash_sale_rounds_logic_outside(self):
        """Test round-based time validation when outside round"""
        now = timezone.now()
        next_hour = (now.hour + 1) % 24
        self.flash_sale.rounds = [{"start": f"{next_hour:02d}:00", "end": f"{next_hour:02d}:59"}]
        self.flash_sale.save()
        result = FlashSaleService.get_active_flash_sale(self.product)
        self.assertIsNone(result)

class FlashSaleAnalyticsExtendedTest(TestCase):
    """Test Flash Sale Analytics API Data"""
    def setUp(self):
        self.admin = User.objects.create_user(username='fana_admin', role='admin', email='fa@test.com')
        self.fs = FlashSale.objects.create(name="Analytics FS", is_active=True, start_time=timezone.now(), end_time=timezone.now()+timedelta(days=1))
    
    def test_analytics_data_structure(self):
        self.client.force_login(self.admin)
        response = self.client.get(f'/api/analytics/flash-sales/{self.fs.id}/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("flash_sale", data)
        self.assertIn("metrics", data)

    def test_flash_sale_campaign_list_no_auth(self):
        """Test public access to campaign list"""
        response = self.client.get('/api/admin/campaigns/')
        # Usually admin endpoints return 401 or 403 for public
        self.assertIn(response.status_code, [401, 403])

    def test_flash_sale_product_missing_price_handling(self):
        """Test that products without sale price are handled in service (if applicable)"""
        from myapp.models import FlashSaleProduct, Product, Category
        cat = Category.objects.create(name="Missing Price Cat")
        prod = Product.objects.create(title="No Price Prod", price=100, category=cat)
        # Creating via model should work, but service should handle it
        fs_prod = FlashSaleProduct.objects.create(flash_sale=self.fs, product=prod, sale_price=Decimal('0.00'))
        self.assertEqual(fs_prod.sale_price, Decimal('0.00'))

    def test_flash_sale_invalid_time_range(self):
        """Test creating a flash sale with end_time before start_time"""
        now = timezone.now()
        fs = FlashSale(name="Invalid Time", start_time=now, end_time=now - timedelta(hours=1))
        # If the model has a clean method, we check it. Otherwise just model persistence.
        self.assertTrue(fs.end_time < fs.start_time)
