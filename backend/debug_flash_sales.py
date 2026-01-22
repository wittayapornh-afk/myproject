import os
import django
import sys

# Setup Django Environment
sys.path.append('c:/Users/HP/Documents/myproject-main/myproject/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import FlashSale, FlashSaleProduct
from myapp.serializers import FlashSaleSerializer

print("Checking Flash Sales...")
flash_sales = FlashSale.objects.all()
print(f"Found {flash_sales.count()} flash sales.")

for fs in flash_sales:
    print(f"Checking Flash Sale ID: {fs.id}, Name: {fs.name}")
    try:
        serializer = FlashSaleSerializer(fs)
        data = serializer.data
        print(f"  - Serializer OK.")
    except Exception as e:
        print(f"  - Serializer FAILED: {e}")
        # Dig deeper
        products = fs.products.all()
        for p in products:
             print(f"    - Product Link ID: {p.id}")
             try:
                 print(f"      - Product: {p.product}")
                 print(f"      - Title: {p.product.title}")
             except Exception as inner_e:
                 print(f"      - Product Access Error: {inner_e}")

print("Done.")
