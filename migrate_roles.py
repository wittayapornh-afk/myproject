
import os
import sys
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import User

# Update roles
users_to_update = User.objects.filter(role='super_admin')
count = users_to_update.count()

if count > 0:
    print(f"Found {count} users with role 'super_admin'. Updating to 'admin'...")
    updated_count = users_to_update.update(role='admin')
    print(f"Successfully updated {updated_count} users.")
else:
    print("No users with role 'super_admin' found. logic already clean or empty.")
