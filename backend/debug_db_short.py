import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
from myapp.models import Coupon

print("--- COUPONS ---")
for c in Coupon.objects.all():
    print(f"[{c.id}] Code:{c.code} Act:{c.active} Used:{c.used_count}/{c.usage_limit} Start:{c.start_date.strftime('%Y-%m-%d')} End:{c.end_date.strftime('%Y-%m-%d')}")
