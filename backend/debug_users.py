import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth.models import User
from myapp.models import UserProfile

print("--- User Roles ---")
users = User.objects.all()
for u in users:
    role = "No Profile"
    if hasattr(u, "profile"):
        role = u.profile.role
    print(f"ID: {u.id} | Username: {u.username} | Role: {role} | Staff: {u.is_staff}")
