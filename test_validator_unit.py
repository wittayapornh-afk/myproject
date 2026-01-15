
import os
import django
import sys
from django.core.exceptions import ValidationError

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.validators import validate_product_name

def test_validation_logic():
    print("Testing Validation Logic...")
    
    # Test Cases
    valid_names = [
        "Product A",
        "สินค้า กขค",
        "Product-123",
        "Product (New)",
        "Product & Co.",
        "Version 2.0"
    ]
    
    caution_names = [
        "Price 50%", 
        "Model #1", 
        "Type/A",
        'Size "L"',
        "O'Connor",
        "Ratio 16:9",
        "Value = 5"
    ]
    
    invalid_names = [
        "Product <New>",
        "Product {v1}",
        "Product [Draft]",
        "Price @ 100",
        "File.txt\\",
        "Product *Special*",
        "Line;End",
        "User?",
        "A|B",
        "^Top"
    ]

    print("\n--- Testing Valid Names ---")
    for name in valid_names:
        try:
            validate_product_name(name)
            print(f"✅ Allowed: {name}")
        except ValidationError as e:
            print(f"❌ FAILED (Should be valid): {name} - {e}")

    print("\n--- Testing Caution Names (Should Pass) ---")
    for name in caution_names:
        try:
            validate_product_name(name)
            print(f"⚠️  Allowed (Caution): {name}")
        except ValidationError as e:
            print(f"❌ FAILED (Should be valid): {name} - {e}")

    print("\n--- Testing Invalid Names ---")
    for name in invalid_names:
        try:
            validate_product_name(name)
            print(f"❌ FAILED (Should be invalid): {name}")
        except ValidationError as e:
            print(f"✅ Caught as expected: {name}")
            # print(f"   Error: {e}")

if __name__ == "__main__":
    test_validation_logic()
