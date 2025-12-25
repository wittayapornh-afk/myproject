import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Order

print(f"Total Orders: {Order.objects.count()}")
for o in Order.objects.all():
    print(f"Order #{o.id}: Status={o.status}, User={o.user.username}")
