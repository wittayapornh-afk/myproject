from django.core.management.base import BaseCommand
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from myapp.models import Order

User = get_user_model()

class Command(BaseCommand):
    help = 'Verify Checkout and Notification Features'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Starting Verification...")

        # 1. Setup User
        username = "test_verify_user"
        email = "test_verify@example.com"
        password = "password123"
        try:
            user = User.objects.get(username=username)
            self.stdout.write(f"✅ User '{username}' found.")
        except User.DoesNotExist:
            user = User.objects.create_user(username=username, email=email, password=password)
            self.stdout.write(f"✅ User '{username}' created.")

        # 2. Setup Client
        client = APIClient()
        client.force_authenticate(user=user)

        # ==========================================
        # 🧪 Test 1: Generate PromptPay Payload
        # ==========================================
        self.stdout.write("\n----------------------------------------------")
        self.stdout.write("🧪 Test 1: get_promptpay_payload")
        self.stdout.write("----------------------------------------------")
        response = client.post('/api/payment/promptpay_payload/', {'amount': 100.50}, format='json')
        if response.status_code == 200 and 'payload' in response.data:
            self.stdout.write(self.style.SUCCESS(f"✅ Success! Payload: {response.data['payload'][:20]}..."))
        else:
            self.stdout.write(self.style.ERROR(f"❌ Failed: {response.status_code} - {response.data}"))

        # ==========================================
        # 🧪 Test 2: Get Notifications (Customer)
        # ==========================================
        self.stdout.write("\n----------------------------------------------")
        self.stdout.write("🧪 Test 2: get_notifications")
        self.stdout.write("----------------------------------------------")
        
        # Create a dummy order for notification
        # Check if order already exists to avoid duplicates
        if not Order.objects.filter(user=user, customer_name="Test Customer").exists():
            Order.objects.create(
                user=user, 
                total_price=500, 
                status='Shipped',
                customer_name="Test Customer",
                customer_tel="0812345678",
                customer_email="test@mail.com",
                shipping_address="123 Test St"
            )
        
        response = client.get('/api/notifications/')
        if response.status_code == 200:
            notis = response.data
            self.stdout.write(self.style.SUCCESS(f"✅ Success! Received {len(notis)} notifications."))
            if len(notis) > 0:
                self.stdout.write(f"   - First Noti: {notis[0]['title']} | {notis[0]['message']}")
        else:
            self.stdout.write(self.style.ERROR(f"❌ Failed: {response.status_code} - {response.data}"))

        self.stdout.write("\n✅ Verification Complete!")
