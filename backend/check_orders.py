
import os
import django
from django.utils import timezone
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Order

def check_orders():
    print("Checking Orders for 2025...")
    
    # Check all orders
    all_orders = Order.objects.all().count()
    print(f"Total Orders in DB: {all_orders}")
    
    # Check 2025 orders
    orders_2025 = Order.objects.filter(created_at__year=2025).count()
    print(f"Orders in 2025: {orders_2025}")
    
    # List some dates
    print("Sample Order Dates:")
    for o in Order.objects.all().order_by('-created_at')[:10]:
        print(f"ID: {o.id}, Status: {o.status}, Date: {o.created_at}")

    # Check Paid 2025
    paid_2025 = Order.objects.filter(created_at__year=2025, status='Paid').count()
    print(f"Paid Orders in 2025: {paid_2025}")

if __name__ == '__main__':
    check_orders()
