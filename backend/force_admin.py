import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth.models import User
from myapp.models import UserProfile

users = User.objects.all()
for u in users:
    print(f"Checking {u.username}...")
    try:
        if not hasattr(u, 'profile'):
            UserProfile.objects.create(user=u, role='admin')
            print(f"Created profile for {u.username} with role 'admin'")
        else:
            # Force update if it looks like an admin account or is 'sa5556' (from screenshot)
            # Or just update everyone for debugging purposes if safe? 
            # Better: Update 'admin', 'root' or similar. 
            # In screenshot, user is 'sa5556'.
            if u.is_superuser or u.username in ['admin', 'sa5556']:
                u.profile.role = 'admin'
                u.profile.save()
                u.is_staff = True
                u.save()
                print(f"Updated {u.username} to role 'admin' and is_staff=True")
            
            print(f"Final State: {u.username} -> {u.profile.role}")
            
    except Exception as e:
        print(f"Error updating {u.username}: {e}")
