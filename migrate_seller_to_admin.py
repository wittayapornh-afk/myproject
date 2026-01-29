import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from myapp.models import User

def migrate_seller_to_admin():
    # Update all users with role 'seller' to 'admin'
    users_to_update = User.objects.filter(role='seller')
    count = users_to_update.count()

    if count > 0:
        print(f"Found {count} users with role 'seller'. Updating to 'admin'...")
        updated_count = users_to_update.update(role='admin')
        print(f"Successfully updated {updated_count} users to admin role.")
    else:
        print("No users with role 'seller' found.")

if __name__ == '__main__':
    migrate_seller_to_admin()
