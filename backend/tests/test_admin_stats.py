import os
import django
import datetime

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token


User = get_user_model()

def run_test():
    print("🚀 Starting Admin Stats (Dashboard) Test...")
    
    # 1. Provide Admin User
    username = "admin_check"
    password = "password123"
    
    user, created = User.objects.get_or_create(username=username, email="admin@check.com")
    user.set_password(password)
    user.role = 'admin' 
    user.save()
    
    token, _ = Token.objects.get_or_create(user=user)
    print(f"✅ Admin User: {username}")

    api_client = APIClient()
    api_client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    # 2. Test Dashboard Stats API
    try:
        today = datetime.date.today().isoformat()
        print(f"📊 Fetching Stats for date: {today}")
        
        response = api_client.get(f'/api/admin/dashboard-stats/?period=daily&date={today}')
        
        if response.status_code == 200:
            data = response.data
            print("✅ API Response 200 OK")
            
            # Validate Keys
            required_keys = ['total_sales', 'total_orders', 'sales_data', 'pie_data', 'best_sellers']
            missing_keys = [k for k in required_keys if k not in data]
            
            if not missing_keys:
                print("✅ Structure Validation: ALL Required Keys Present")
                print(f"   - Total Sales: {data['total_sales']}")
                print(f"   - Total Orders: {data['total_orders']}")
                print(f"   - Pie Data Points: {len(data['pie_data'])}")
                print(f"   - Sales Data Points: {len(data['sales_data'])}")
            else:
                print(f"❌ Missing Keys in Response: {missing_keys}")
                
        else:
             print(f"❌ API Failed: {response.status_code} - {response.data}")

    except Exception as e:
        print(f"❌ Test Exception: {e}")

if __name__ == "__main__":
    run_test()
