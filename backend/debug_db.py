import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Coupon, FlashSale

print("--- DEBUGGING COUPONS ---")
coupons = Coupon.objects.all()
print(f"Total Coupons: {coupons.count()}")
for c in coupons:
    print(f"ID: {c.id}, Code: {c.code}, Active: {c.active}, Start: {c.start_date}, End: {c.end_date}, Used: {c.used_count}/{c.usage_limit}")

print("\n--- DEBUGGING FLASH SALES ---")
flash_sales = FlashSale.objects.all()
print(f"Total Flash Sales: {flash_sales.count()}")
for f in flash_sales:
    print(f"ID: {f.id}, Name: {f.name}, Active: {f.is_active}, Start: {f.start_time}, End: {f.end_time}")
