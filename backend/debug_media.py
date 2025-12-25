
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Product

try:
    p = Product.objects.get(id=1)
    print(f"Product: {p.title}")
    print(f"Thumbnail Field: {p.thumbnail}")
    if p.thumbnail:
        print(f"Thumbnail URL: {p.thumbnail.url}")
        print(f"Thumbnail Path: {p.thumbnail.path}")
    else:
        print("No thumbnail")
except Exception as e:
    print(f"Error: {e}")
