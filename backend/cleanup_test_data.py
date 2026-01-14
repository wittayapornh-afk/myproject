import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth import get_user_model
from myapp.models import Product, Order, OrderItem
from django.db.models import Q

User = get_user_model()

def cleanup():
    print("🧹 Starting Cleanup...")

    # 1. Users
    test_users = User.objects.filter(
        Q(username__icontains='test') | 
        Q(email__icontains='test') |
        Q(first_name__icontains='test') |
        Q(last_name__icontains='test')
    )
    print(f"Found {test_users.count()} Test Users")
    for u in test_users:
        print(f" - Deleting User: {u.username} ({u.email})")
    test_users.delete()

    # 2. Products
    test_products = Product.objects.filter(title__icontains='test')
    print(f"Found {test_products.count()} Test Products")
    for p in test_products:
        print(f" - Deleting Product: {p.title}")
    test_products.delete()

    # 3. Orders (Explicit checks for 'test' in customer name/tel if not linked to user)
    test_orders = Order.objects.filter(
        Q(customer_name__icontains='test') |
        Q(customer_address__icontains='test')
    )
    print(f"Found {test_orders.count()} Test Orders (by details)")
    for o in test_orders:
        print(f" - Deleting Order: #{o.id} - {o.customer_name}")
    test_orders.delete()
    
    # 4. Cleanup Admin Logs for deleted objects (Optional, but good for cleanliness)
    # AdminLog.objects.filter(action__icontains='test').delete()

    print("✅ Cleanup Complete!")

if __name__ == "__main__":
    cleanup()
