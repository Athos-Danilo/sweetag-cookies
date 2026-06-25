import requests

url_login = "http://localhost:8000/api/auth/login"
payload_login = {
    "whatsapp": "(11) 99999-9999"
}

print("Testing rate limiter on login endpoint (limit: 5/minute)...")
for i in range(1, 7):
    response = requests.post(url_login, json=payload_login)
    print(f"Request #{i} | Status Code: {response.status_code} | Response: {response.text.strip()}")
