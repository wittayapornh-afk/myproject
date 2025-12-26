import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
new_password = 'password123'

try:
    try:
        user = User.objects.get(username=username)
        print(f"Found user '{username}'. Resetting password...")
        user.set_password(new_password)
        user.is_active = True
        user.role = 'admin'
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"Successfully reset password for '{username}' to '{new_password}'")
    except User.DoesNotExist:
        print(f"User '{username}' does not exist. Creating new admin user...")
        User.objects.create_superuser(username=username, email='admin@example.com', password=new_password)
        print(f"Created new superuser '{username}' with password '{new_password}'")

    # Double check
    u = User.objects.get(username=username)
    print(f"Verification: User '{u.username}' is active={u.is_active}, role={u.role}")

except Exception as e:
    print(f"Error: {e}")
