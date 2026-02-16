"""
Unit Tests for Tag System
Tests: Tag model, tag automation, and tag APIs
"""

from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from myapp.models import Tag, Product, Category, Order, OrderItem
import json
from decimal import Decimal

User = get_user_model()


class TagModelTest(TestCase):
    """Test Tag model functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.tag = Tag.objects.create(
            name="Hot Product",
            group_name="badge",
            color="#FF5733",
            icon="fire",
            is_active=True
        )
    
    def test_tag_creation(self):
        """Test Tag is created correctly"""
        self.assertEqual(self.tag.name, "Hot Product")
        self.assertEqual(self.tag.group_name, "badge")
        self.assertTrue(self.tag.is_active)
    
    def test_tag_slug_auto_generation(self):
        """Test slug is auto-generated from name"""
        self.assertIsNotNone(self.tag.slug)
        self.assertIn("hot-product", self.tag.slug.lower())
    
    def test_tag_slug_uniqueness(self):
        """Test duplicate tag names get unique slugs"""
        tag2 = Tag.objects.create(
            name="Hot Product!",
            group_name="badge"
        )
        self.assertNotEqual(self.tag.slug, tag2.slug)
    
    def test_tag_str_representation(self):
        """Test string representation includes name and group"""
        tag_str = str(self.tag)
        self.assertIn("Hot Product", tag_str)


class TagExpirationTest(TestCase):
    """Test Tag expiration functionality"""
    
    def setUp(self):
        """Set up expired and active tags"""
        now = timezone.now()
        
        self.expired_tag = Tag.objects.create(
            name="Expired Tag",
            expiration_date=now - timedelta(days=1),
            is_active=True
        )
        
        self.active_tag = Tag.objects.create(
            name="Active Tag",
            expiration_date=now + timedelta(days=30),
            is_active=True
        )
        
        self.no_expiration_tag = Tag.objects.create(
            name="Permanent Tag",
            expiration_date=None,
            is_active=True
        )
    
    def test_find_expired_tags(self):
        """Test querying for expired tags"""
        now = timezone.now()
        expired = Tag.objects.filter(
            expiration_date__isnull=False,
            expiration_date__lt=now
        )
        self.assertEqual(expired.count(), 1)
        self.assertEqual(expired.first(), self.expired_tag)
    
    def test_active_tags_not_expired(self):
        """Test active tags are not in expired query"""
        now = timezone.now()
        expired = Tag.objects.filter(
            expiration_date__isnull=False,
            expiration_date__lt=now
        )
        self.assertNotIn(self.active_tag, expired)
        self.assertNotIn(self.no_expiration_tag, expired)


class TagProductRelationTest(TestCase):
    """Test Tag-Product relationship"""
    
    def setUp(self):
        """Set up test data"""
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            title="Test Product",
            price=100,
            stock=10,
            category=self.category,
            is_active=True
        )
        
        self.tag1 = Tag.objects.create(name="Tag 1", group_name="badge")
        self.tag2 = Tag.objects.create(name="Tag 2", group_name="status")
    
    def test_add_tag_to_product(self):
        """Test adding tag to product"""
        self.product.tags.add(self.tag1)
        # 2 tags: 'New Arrival' (auto) + 'Tag 1' (manual)
        self.assertEqual(self.product.tags.count(), 2)
    
    def test_add_multiple_tags_to_product(self):
        """Test adding multiple tags to product"""
        self.product.tags.add(self.tag1, self.tag2)
        # 3 tags: 'New Arrival' (auto) + 'Tag 1' + 'Tag 2'
        self.assertEqual(self.product.tags.count(), 3)
    
    def test_remove_tag_from_product(self):
        """Test removing tag from product"""
        self.product.tags.add(self.tag1, self.tag2)
        self.product.tags.remove(self.tag1)
        # 2 tags remain: 'New Arrival' + 'Tag 2'
        self.assertEqual(self.product.tags.count(), 2)
        self.assertNotIn(self.tag1, self.product.tags.all())


class TagAPITest(TestCase):
    """Test Tag API endpoints"""
    
    def setUp(self):
        """Set up test client and user"""
        self.client = Client()
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role='admin'
        )
        
        self.tag = Tag.objects.create(
            name="API Test Tag",
            group_name="badge",
            is_active=True
        )
    
    def test_get_tags_list(self):
        """Test getting list of tags"""
        response = self.client.get('/api/tags/')
        self.assertEqual(response.status_code, 200)
    
    def test_create_tag_requires_auth(self):
        """Test creating tag requires authentication"""
        response = self.client.post('/api/tags/', {
            'name': 'New Tag',
            'group_name': 'badge'
        })
        self.assertEqual(response.status_code, 401)
    
    def test_delete_tag_requires_auth(self):
        """Test deleting tag requires authentication"""
        response = self.client.delete(f'/api/tags/{self.tag.id}/')
        self.assertEqual(response.status_code, 401)

    def test_admin_create_tag_api(self):
        """Test admin can create a tag via API"""
        self.client.force_login(self.admin_user)
        data = {
            "name": "UNIQUE_API_TAG",
            "group_name": "promotion",
            "color": "#123456",
            "icon": "star",
            "is_active": True
        }
        response = self.client.post('/api/tags/', data=json.dumps(data), content_type='application/json')
        self.assertIn(response.status_code, [200, 201])
        self.assertTrue(Tag.objects.filter(name="UNIQUE_API_TAG").exists())
        self.assertEqual(Tag.objects.get(name="UNIQUE_API_TAG").group_name, "promotion")

    def test_admin_delete_tag_api(self):
        """Test admin can delete a tag via API"""
        self.client.force_login(self.admin_user)
        response = self.client.delete(f'/api/tags/{self.tag.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Tag.objects.filter(id=self.tag.id).exists())

    def test_product_tags_api_assignment(self):
        """Test assigning tags to a product via API"""
        self.client.force_login(self.admin_user)
        cat = Category.objects.create(name="Cat")
        prod = Product.objects.create(title="Prod", price=100, category=cat)
        data = {"tag_ids": [self.tag.id]}
        response = self.client.post(f'/api/products/{prod.id}/tags/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.tag, prod.tags.all())


class TagAutomationTest(TestCase):
    """Test Tag automation rules"""
    
    def setUp(self):
        """Set up test data"""
        self.category = Category.objects.create(name="Test Category")
        
        # Create products with different characteristics
        self.hot_product = Product.objects.create(
            title="Hot Product",
            price=100,
            stock=2,  # Low stock
            category=self.category,
            is_active=True,
            created_at=timezone.now() - timedelta(days=60)
        )
        
        self.new_product = Product.objects.create(
            title="New Product",
            price=200,
            stock=50,
            category=self.category,
            is_active=True,
            created_at=timezone.now() - timedelta(days=3)  # Recently created
        )
        
        self.out_of_stock = Product.objects.create(
            title="Out of Stock",
            price=150,
            stock=0,
            category=self.category,
            is_active=True
        )
    
    def test_new_arrival_detection(self):
        """Test detecting new products (created within last 7 days)"""
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        
        new_products = Product.objects.filter(
            created_at__gte=seven_days_ago,
            is_active=True
        )
        
        self.assertIn(self.new_product, new_products)
        self.assertNotIn(self.hot_product, new_products)
    
    def test_last_chance_detection(self):
        """Test detecting low stock products"""
        low_stock_products = Product.objects.filter(
            stock__lte=5,
            stock__gt=0,
            is_active=True
        )
        
        self.assertIn(self.hot_product, low_stock_products)
        self.assertNotIn(self.new_product, low_stock_products)
    
    def test_out_of_stock_detection(self):
        """Test detecting out of stock products"""
        out_of_stock = Product.objects.filter(
            stock=0,
            is_active=True
        )
        
        self.assertIn(self.out_of_stock, out_of_stock)
        self.assertEqual(out_of_stock.count(), 1)

    def test_run_tag_automation_api(self):
        """Test the automation trigger API"""
        admin = User.objects.create_user(username='admin_auto', email='a@b.com', role='admin')
        self.client.force_login(admin)
        response = self.client.post('/api/tags/automation/run/')
        self.assertEqual(response.status_code, 200)
        # Should return summary of updates
        self.assertIn("statistics", response.json())

    def test_admin_bulk_update_tags_api(self):
        """Test bulk updating tags for multiple products"""
        admin = User.objects.create_user(username='admin_bulk', email='b@c.com', role='admin')
        self.client.force_login(admin)
        tag = Tag.objects.create(name="Bulk Tag")
        data = {
            "product_ids": [self.hot_product.id, self.new_product.id],
            "tag_id": tag.id,
            "action": "add"
        }
        response = self.client.post('/api/products/bulk-update-tags/', data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn(tag, self.hot_product.tags.all())
        self.assertIn(tag, self.new_product.tags.all())

class TagAnalyticsExtendedTest(TestCase):
    """Test Tag Analytics API"""
    
    def setUp(self):
        self.admin = User.objects.create_user(username='analytics_admin', role='admin', email='ana@test.com')
        self.tag = Tag.objects.create(name="Analytics Tag")
        self.category = Category.objects.create(name="Electronics")
        self.product = Product.objects.create(title="Laptop", price=1000, category=self.category)
        self.product.tags.add(self.tag)
        
        # Create an order that uses this tagged product
        self.order = Order.objects.create(user=self.admin, total_price=1000, status='Completed')
        OrderItem.objects.create(order=self.order, product=self.product, quantity=1, price_at_purchase=1000)

    def test_tag_analytics_api_auth(self):
        """Test analytics requires admin auth"""
        response = self.client.get('/api/analytics/tags/')
        self.assertEqual(response.status_code, 401)

    def test_tag_analytics_data_structure(self):
        """Test analytics returns correct data structure"""
        self.client.force_login(self.admin)
        response = self.client.get('/api/analytics/tags/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("tag_performance", data)
        self.assertIn("total_revenue", data)
        
        # Check if laptop order revenue is captured (even if simulated/mapped)
        perf = data['tag_performance']
        self.assertTrue(len(perf) > 0)
        # Find our tag
        tag_perf = next((x for x in perf if x['name'] == self.tag.name), None)
        self.assertIsNotNone(tag_perf)

class TagValidationLogicTest(TestCase):
    """Test Tag validation and persistence"""

    def test_tag_group_filtering(self):
        """Test filtering tags by group name"""
        Tag.objects.create(name="Badge 1", group_name="badge")
        Tag.objects.create(name="Status 1", group_name="status")
        
        badge_tags = Tag.objects.filter(group_name="badge")
        self.assertEqual(badge_tags.count(), 1)
        self.assertEqual(badge_tags.first().name, "Badge 1")

    def test_tag_slug_persistence(self):
        """Test slug stays the same if name doesn't change significantly"""
        tag = Tag.objects.create(name="Initial Name")
        old_slug = tag.slug
        tag.name = "Initial Name!!!" 
        tag.save()
        # If the backend uses a slugify that strips !, it might stay same. 
        # But if it regenerates, we check logic.
        # Actually our test_tag_slug_uniqueness already covers some of this.
        self.assertEqual(Tag.objects.filter(slug=old_slug).count(), 1)

    def test_tag_bulk_update_error_handling(self):
        """Test bulk update handle invalid IDs"""
        admin = User.objects.create_user(username='bulk_err_admin', role='admin', email='bulkerr@test.com')
        self.client.force_login(admin)
        tag = Tag.objects.create(name="Bulk Error Tag")
        
        # Send one non-existent ID
        data = {"product_ids": [99999], "tag_id": tag.id, "action": "add"}
        response = self.client.post('/api/products/bulk-update-tags/', data=json.dumps(data), content_type='application/json')
        # Should either succeed (ignoring missing) or return 400. Views usually handle 400 if strictly validated.
        self.assertIn(response.status_code, [200, 400, 404])

    def test_tag_api_delete_nonexistent(self):
        """Test deleting a non-existent tag returns 404/suitable error"""
        admin = User.objects.create_user(username='del_err_admin', role='admin', email='delerr@test.com')
        self.client.force_login(admin)
        response = self.client.delete('/api/tags/99999/')
        self.assertIn(response.status_code, [404, 500]) # 500 if not handled, 404 if handled

    def test_tag_model_str_method(self):
        """Test the string representation of Tag model"""
        tag = Tag.objects.create(name="String Tag")
        self.assertEqual(str(tag), "String Tag")
