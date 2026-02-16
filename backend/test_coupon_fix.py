import requests
import json

url = "http://localhost:8000/api/coupons/validate/"
# We need a valid token? Or try without auth first.
# The endpoint requires IsAuthenticated.
# So we need to simulate a login or just check if it rejects 401 (which means server is up).
# But to test the 400->200 logic, we need to pass authentication.

# Let's try to login first if possible, or use a hardcoded token if I can find one (unlikely).
# Better: Use a manage.py command or shell script to test the view directly? 
# No, runserver must be running.
# Is runserver running?
# The user had `docker-compose up` running in step 4065! 
# So localhost:8000 should be accessible.

def test_coupon():
    try:
        # 1. Login to get token (using admin/password or whatever is default)
        # If we can't login, we can't test.
        # Let's assume standard admin:admin or similar? Or create a user?
        # Creating a user via script is safer.
        
        # Actually, let's just try to hit the endpoint. 
        # If we get 403/401, we know server is up.
        # If we want to test logic, we need auth.
        
        print("Testing Coupon Validation API...")
        response = requests.post(url, json={"code": "INVALID"})
        print(f"Status without auth: {response.status_code}")
        
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_coupon()
