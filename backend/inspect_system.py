import os
import django
import sys
from django.db import connection

# Setup Django Environment
sys.path.append('c:/Users/HP/Documents/myproject-main/myproject/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.apps import apps
from myapp.models import FlashSale, FlashSaleProduct, Product
from myapp.serializers import FlashSaleSerializer

print("="*50)
print("🔎 SYSTEM INSPECTION")
print("="*50)

# 1. Database Tables vs Models
print("\n--- 1. Database Tables Inspection ---")
all_models = apps.get_models()
model_tables = [model._meta.db_table for model in all_models]

with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES")
    db_tables = [row[0] for row in cursor.fetchall()]

unused_tables = [t for t in db_tables if t not in model_tables and t != 'django_migrations' and not t.startswith('auth_') and not t.startswith('django_')]

print(f"Total Tables in DB: {len(db_tables)}")
print(f"Total Models in App: {len(model_tables)}")

if unused_tables:
    print("\n⚠️  POTENTIALLY UNUSED TABLES (Not mapped to any Django Model):")
    for t in unused_tables:
        print(f"  - {t}")
else:
    print("\n✅ All tables seem to be in use (or are standard Django tables).")

# 2. Flash Sale Debugging
print("\n--- 2. Flash Sale API Debug ---")
print("Attempting to serialize all Flash Sales to find the 500 Error cause...")

flash_sales = FlashSale.objects.all().order_by('-start_time')
print(f"Found {flash_sales.count()} flash sales.")

for fs in flash_sales:
    print(f"\nChecking Flash Sale ID: {fs.id} | Name: {fs.name}")
    try:
        # Simulate what the view does
        serializer = FlashSaleSerializer(fs)
        data = serializer.data
        print(f"  ✅ Serializer OK. Products: {len(data['products'])}")
        
        # Deep check products
        for p_data in data['products']:
             # Access fields that might error if missing
             p_name = p_data.get('product_name')
             p_img = p_data.get('product_image')
             # print(f"    - Product: {p_name} | Image: {p_img}")
             
    except Exception as e:
        print(f"  ❌ SERIALIZER ERROR: {e}")
        import traceback
        traceback.print_exc()
        
        # Diagnose specific product issues within this flash sale
        print("  🔍 Diagnosing Products in this Flash Sale:")
        fs_products = FlashSaleProduct.objects.filter(flash_sale=fs)
        for fsp in fs_products:
            print(f"    - FlashSaleProduct ID: {fsp.id} -> Product ID: {fsp.product_id}")
            try:
                prod = fsp.product
                print(f"      - Product Title: {prod.title}")
                print(f"      - Product Thumbnail: {prod.thumbnail}")
                if prod.thumbnail:
                    print(f"      - Product Thumbnail URL: {prod.thumbnail.url}")
            except Product.DoesNotExist:
                 print("      ❌ Product Does Not Exist (Orphaned Record)")
            except Exception as inner_e:
                 print(f"      ❌ Product Access Error: {inner_e}")

print("\n\nInspection Complete.")
