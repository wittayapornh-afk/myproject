from django.contrib.auth.models import User
from myapp.models import UserProfile

def migrate_roles():
    mapping = {
        'super_admin': 'admin',  # Old Super Admin -> New Admin
        'admin': 'seller',       # Old Admin -> New Seller
        'user': 'new_user'       # Old User -> New New User
    }
    
    count = 0
    profiles = UserProfile.objects.all()
    for p in profiles:
        if p.role in mapping:
            print(f"Migrating {p.user.username}: {p.role} -> {mapping[p.role]}")
            p.role = mapping[p.role]
            p.save()
            count += 1
            
            # Update is_staff if needed
            if p.role in ['admin', 'seller']:
                p.user.is_staff = True
            else:
                p.user.is_staff = False
            p.user.save()

    print(f"Migrated {count} users.")

migrate_roles()
