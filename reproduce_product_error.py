
import os
import django
from django.conf import settings
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Product, Category
from myapp.views import products_api
from rest_framework.test import APIRequestFactory
from rest_framework import status

def test_product_special_chars():
    print("Creating test data...")
    # Create category
    cat, _ = Category.objects.get_or_create(name="TestCategory")
    
    # Create product with special chars
    special_title = "Product @#$%^&*()"
    p = Product(
        title=special_title,
        description="Test Desc",
        category=cat,
        price=100.00,
        stock=10
    )
    p.save()
    print(f"Created product: {p.title}")

    # Test API
    factory = APIRequestFactory()
    request = factory.get('/api/products/')
    
    try:
        response = products_api(request)
        print(f"Response Status: {response.status_code}")
        if response.status_code == 200:
            print("Response Data Sample:", response.data['results'][0] if response.data.get('results') else "No results")
        else:
            print("Response Data:", response.data)
            
    except Exception as e:
        print(f"Exception: {e}")

    # Clean up
    p.delete()
    if not Category.objects.filter(name="TestCategory").exclude(id=cat.id).exists():
        cat.delete() # Only delete if we created it (basic check)

if __name__ == "__main__":
    test_product_special_chars()
