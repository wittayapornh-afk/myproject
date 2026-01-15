import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Order, OrderItem, Product, User, Category

# List of Provinces (Thai Names match AdminHighchartsMap mapping)
PROVINCES = [
    # Top Tier (High Sales)
    "กรุงเทพมหานคร", "เชียงใหม่", "ชลบุรี", "ภูเก็ต", "ขอนแก่น",
    # Mid Tier
    "นครราชสีมา", "สงขลา", "อุดรธานี", "ประจวบคีรีขันธ์", "ระยอง", "พระนครศรีอยุธยา",
    # Low Tier
    "แม่ฮ่องสอน", "น่าน", "เลย", "ตาก", "กาญจนบุรี", "สุราษฎร์ธานี", "กระบี่", "พังงา", "อุบลราชธานี"
]

def generate_data():
    print("🚀 Starting Map Data Generation...")
    
    # Ensure we have a product
    product = Product.objects.first()
    if not product:
        print("⚠️ No products found. Creating test product...")
        
        # Ensure Category
        category, created = Category.objects.get_or_create(name="Furniture", defaults={'slug': 'furniture-test'})
        
        product = Product.objects.create(
            title="Sofa Test Map",
            price=2500,
            stock=1000,
            description="Generated for Map Testing",
            category=category
        )
        # Handle slug generation signal if exists, or assume model handles it.
        # If model expects slug field:
        if hasattr(product, 'slug') and not product.slug:
            product.slug = 'sofa-test-map'
            product.save()

    # Ensure we have a user
    user = User.objects.first()
    if not user:
        user = User.objects.create_user(username='test_data_user', email='test@data.com', password='password')

    count = 0
    for province in PROVINCES:
        # Determine number of orders based on "Tier" (simple random logic)
        num_orders = random.randint(1, 10) 
        if province in ["กรุงเทพมหานคร", "เชียงใหม่", "ภูเก็ต"]:
            num_orders = random.randint(15, 30) # High volume
        elif province in ["ชลบุรี", "ขอนแก่น", "นครราชสีมา"]:
            num_orders = random.randint(8, 15) # Mid volume
            
        print(f"📍 Generating {num_orders} orders for {province}...")

        for _ in range(num_orders):
            # Create Order
            order = Order.objects.create(
                user=user,
                customer_name=f"Customer {province}",
                customer_address=f"123 Test Road, {province}",
                customer_tel="0812345678",
                shipping_province=province, # Critical for Map
                shipping_postcode="10000",
                total_price=0, # Will update
                status='shipped', # Valid status for stats
                created_at=timezone.now() - timedelta(days=random.randint(0, 30))
            )
            
            # Create Items (High value for Top Tier to trigger colors)
            qty = random.randint(1, 5)
            price = product.price
            
            # Boost price for specific provinces to ensure they hit "High" status (>100k)
            if province == "กรุงเทพมหานคร" and random.choice([True, False]):
                 qty = 20 # Big order
            
            item = OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                price_at_purchase=price
            )
            
            # Update total
            order.total_price = item.price_at_purchase * item.quantity
            order.save()
            
            count += 1

    print(f"✅ Generated {count} orders across {len(PROVINCES)} provinces.")

if __name__ == "__main__":
    generate_data()
