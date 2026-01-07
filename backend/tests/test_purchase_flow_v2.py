import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth import get_user_model
from myapp.models import Product, Order
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

User = get_user_model()

def run_test():
    print("🚀 Starting Purchase Flow Test...")
    
    # 1. Provide Test User
    email = "testrunner@example.com"
    username = "testrunner"
    password = "password123"
    
    user, created = User.objects.get_or_create(username=username, email=email)
    user.set_password(password)
    user.role = 'user'
    user.save()
    
    token, _ = Token.objects.get_or_create(user=user)
    print(f"✅ User setup: {username} (Token: {token.key[:5]}...)")

    # 2. Setup Product
    product, created = Product.objects.get_or_create(title="Test Product Flow", defaults={
        'price': 100,
        'stock': 10,
        'description': 'For testing',
        'category': 'Test'
    })
    # Reset stock heavily
    product.stock = 10
    product.save()
    
    print(f"✅ Product ready: {product.title} (Stock: {product.stock})")

    # 3. Simulate Checkout (Create Order)
    api_client = APIClient()
    api_client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    payload = {
        "items": [
            {"id": product.id, "quantity": 2}
        ],
        "customer": {
            "name": "Test Customer",
            "tel": "0812345678",
            "address": "123 Test Street"
        },
        "paymentMethod": "Transfer"
    }

    try:
        print("🛒 Sending Create Order Request...")
        response = api_client.post('/api/orders/create/', payload, format='json')
        
        if response.status_code == 201:
            order_id = response.data['order_id']
            print(f"✅ Order Created! ID: {order_id}")
            
            # 4. Verify Stock Deduction
            product.refresh_from_db()
            print(f"📦 Stock after order: {product.stock}")
            if product.stock == 8:
                print("✅ Stock deduction logic PASSED (10 - 2 = 8)")
            else:
                print(f"❌ Stock deduction FAILED. Expected 8, got {product.stock}")

            # 5. Verify QR Code Payload
            print("💳 Checking QR Payload generation...")
            # Call my-orders
            resp_orders = api_client.get('/api/orders/my-orders/')
            if resp_orders.status_code == 200:
                recent_order = next((o for o in resp_orders.data if o['id'] == order_id), None)
                if recent_order:
                    if recent_order.get('promptpay_payload'):
                        print(f"✅ PromptPay QR Payload Generated: {recent_order['promptpay_payload'][:20]}...")
                    else:
                        print("❌ PromptPay QR Payload MISSING")
                else:
                    print("❌ Order not found in My Orders list")
            
        else:
            print(f"❌ Create Order Failed: {response.status_code} - {response.data}")

    except Exception as e:
        print(f"❌ Test Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
