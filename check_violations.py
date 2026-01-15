
import os
import django
import sys
import re

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import Product

def check_existing_products():
    print("Scanning for products verifying new naming rules...")
    
    # Forbidden: ` < > { } [ ] | ^ ~ ; ? @ \ *
    forbidden_pattern = r"[`<>{}\[\]|^~;?@\\*]"
    
    products = Product.objects.all()
    violation_count = 0
    
    print("-" * 60)
    print(f"{'ID':<6} | {'Status':<10} | {'Title'}")
    print("-" * 60)

    for p in products:
        if re.search(forbidden_pattern, p.title):
            found = re.findall(forbidden_pattern, p.title)
            unique_found = sorted(list(set(found)))
            print(f"{p.id:<6} | {'INVALID':<10} | {p.title}")
            print(f"       Found forbidden chars: {' '.join(unique_found)}")
            violation_count += 1
            
    print("-" * 60)
    print(f"Total violations found: {violation_count}")

if __name__ == "__main__":
    check_existing_products()
