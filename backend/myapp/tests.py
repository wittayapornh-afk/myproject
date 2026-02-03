from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Product, Tag, Order, OrderItem, FlashSale, FlashSaleProduct, Category

User = get_user_model()

class TagAutomationTests(TestCase):
    def setUp(self):
        # 1. Setup Client & Admin User
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin', 
            email='admin@example.com', 
            password='password123'
        )
        self.client.force_authenticate(user=self.admin)
        
        # 2. Setup Category
        self.category = Category.objects.create(name="Test Category")
        
        # 3. Setup Products for different scenarios
        # P1: New Arrival (Created Just Now)
        self.p_new = Product.objects.create(
            title="New Item", price=100, stock=100, category=self.category
        )
        
        # P2: Old Item (> 7 days)
        old_date = timezone.now() - timedelta(days=10)
        self.p_old = Product.objects.create(
            title="Old Item", price=100, stock=100, category=self.category
        )
        self.p_old.created_at = old_date
        self.p_old.save()
        
        # P3: Out of Stock
        self.p_oos = Product.objects.create(
            title="OOS Item", price=100, stock=0, category=self.category
        )
        
        # P4: Last Chance (Stock 3)
        self.p_low = Product.objects.create(
            title="Low Stock Item", price=100, stock=3, category=self.category
        )
        
        # P5: On Sale
        self.p_sale = Product.objects.create(
            title="Sale Item", price=80, original_price=100, stock=10, category=self.category
        )
        
        # P6: Normal Item
        self.p_normal = Product.objects.create(
            title="Normal Item", price=100, stock=50, category=self.category
        )

    def test_new_arrival_logic(self):
        """Test 'New Arrival' tag logic (Created <= 7 days)"""
        url = '/api/tags/automation/run/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        
        self.p_new.refresh_from_db()
        self.p_old.refresh_from_db()
        
        new_tag = Tag.objects.get(name='New Arrival')
        
        self.assertIn(new_tag, self.p_new.tags.all(), "New item should have New Arrival tag")
        self.assertNotIn(new_tag, self.p_old.tags.all(), "Old item should NOT have New Arrival tag")

    def test_stock_status_logic(self):
        """Test 'Out of Stock' and 'Last Chance' logic"""
        url = '/api/tags/automation/run/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        
        self.p_oos.refresh_from_db()
        self.p_low.refresh_from_db()
        self.p_normal.refresh_from_db()
        
        oos_tag = Tag.objects.get(name='Out of Stock')
        last_chance_tag = Tag.objects.get(name='Last Chance')
        
        self.assertIn(oos_tag, self.p_oos.tags.all())
        self.assertIn(last_chance_tag, self.p_low.tags.all())
        
        self.assertNotIn(oos_tag, self.p_normal.tags.all())
        self.assertNotIn(last_chance_tag, self.p_normal.tags.all())

    def test_on_sale_logic(self):
        """Test 'On Sale' tag logic (Price < Original Price)"""
        url = '/api/tags/automation/run/'
        self.client.post(url)
        
        self.p_sale.refresh_from_db()
        self.p_normal.refresh_from_db()
        
        sale_tag = Tag.objects.get(name='On Sale')
        
        self.assertIn(sale_tag, self.p_sale.tags.all())
        self.assertNotIn(sale_tag, self.p_normal.tags.all())

    def test_sales_performance_logic(self):
        """Test 'Best Seller' (>50 in 30d) and 'Hot Selling' (>10 in 48h)"""
        # Create Orders to simulate sales
        # 1. Hot Seller: 15 items sold today
        order1 = Order.objects.create(status='Completed', total_price=1000)
        OrderItem.objects.create(order=order1, product=self.p_normal, quantity=15, price_at_purchase=100)
        
        # 2. Best Seller: 40 items sold 20 days ago + 15 items today = 55 total
        past_date = timezone.now() - timedelta(days=20)
        order2 = Order.objects.create(status='Completed', total_price=4000)
        order2.created_at = past_date # Hack created_at
        order2.save()
        OrderItem.objects.create(order=order2, product=self.p_normal, quantity=40, price_at_purchase=100)
        
        url = '/api/tags/automation/run/'
        self.client.post(url)
        
        self.p_normal.refresh_from_db()
        
        hot_tag = Tag.objects.get(name='Hot Selling')
        best_tag = Tag.objects.get(name='Best Seller')
        
        self.assertIn(hot_tag, self.p_normal.tags.all(), "Should be Hot Selling (>10/48h)")
        self.assertIn(best_tag, self.p_normal.tags.all(), "Should be Best Seller (>50/30d)")

    def test_flash_sale_logic(self):
        """Test 'Flash Sale' tag logic"""
        # Create active Flash Sale
        now = timezone.now()
        fs = FlashSale.objects.create(
            name="Test Flash",
            start_time=now - timedelta(hours=1),
            end_time=now + timedelta(hours=1),
            is_active=True
        )
        FlashSaleProduct.objects.create(
            flash_sale=fs, product=self.p_normal, sale_price=50, quantity_limit=10
        )
        
        url = '/api/tags/automation/run/'
        self.client.post(url)
        
        self.p_normal.refresh_from_db()
        flash_tag = Tag.objects.get(name='Flash Sale')
        
        self.assertIn(flash_tag, self.p_normal.tags.all())
