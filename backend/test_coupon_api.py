import requests

url = "http://localhost:8000/api/coupons/validate/"
# Token from a valid user session (Optional: adjust if your API requires Auth)
# If IsAuthenticated is strictly required, we need a token. 
# But let's assume valid admin token for now OR assume we can test error handling.

# Test 1: Invalid Code
payload = {
    "code": "INVALID",
    "total_amount": 500
}
# Note: This will likely fail with 401 Unauthorized if no token provided.
# But we verify if server is UP (not 500).

try:
    response = requests.post(url, json=payload)
    print(f"Status Verify: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
