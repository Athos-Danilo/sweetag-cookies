import asyncio
from datetime import date, timedelta
import httpx
import json

async def test_schedule():
    base_url = "http://localhost:8000"
    tomorrow = str(date.today() + timedelta(days=1))
    
    # Random WhatsApp number to get a fresh user
    import time
    random_str = str(int(time.time()))
    
    async with httpx.AsyncClient() as client:
        # 1. Register a test user
        print(f"Registering user with whatsapp: {random_str}...")
        resp = await client.post(f"{base_url}/api/auth/register", json={
            "whatsapp": random_str,
            "nome": "Scheduled Test User",
            "aceitaNotificacoes": True
        })
        
        if resp.status_code != 200:
            print(f"Failed to register user: {resp.text}")
            return
            
        data = resp.json()
        token = data.get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("User registered successfully.")
        
        # 2. Create an address
        print("Creating an address...")
        resp = await client.post(f"{base_url}/api/addresses", headers=headers, json={
            "title": "Bloco B",
            "department": "Psicologia",
            "block": "B",
            "room": "202",
            "is_default": True
        })
        
        if resp.status_code != 201:
            print(f"Failed to create address: {resp.text}")
            return
            
        address = resp.json()
        address_id = address.get("id")
        
        # 3. Fetch Calendar Availability before ordering
        print("\nFetching calendar availability (BEFORE)...")
        cal_resp = await client.get(f"{base_url}/api/availability/calendar")
        print("Calendar response:")
        print(json.dumps(cal_resp.json(), indent=2))
        
        # 4. Schedule a valid order of 2 cookies (should succeed)
        print(f"\nScheduling 2 cookies for date: {tomorrow}...")
        sch_resp = await client.post(f"{base_url}/api/orders/schedule", headers=headers, json={
            "address_id": address_id,
            "total": 20.0,
            "payment_method": "Pix",
            "scheduled_date": tomorrow,
            "items": [
                {
                    "product_id": 1,
                    "name": "Cookie Lacan",
                    "quantity": 2,
                    "price": 10.0
                }
            ]
        })
        
        print(f"Schedule Response Code: {sch_resp.status_code}")
        if sch_resp.status_code == 201:
            order_data = sch_resp.json()
            print("Scheduled Order created successfully:")
            print(f"Order ID: {order_data.get('id')} | Status: {order_data.get('status')} | Scheduled Date: {order_data.get('scheduled_date')}")
        else:
            print(f"Failed to schedule: {sch_resp.text}")
            return
            
        # 5. Fetch Calendar Availability after ordering
        print("\nFetching calendar availability (AFTER scheduling 2)...")
        cal_resp2 = await client.get(f"{base_url}/api/availability/calendar")
        print("Calendar response:")
        print(json.dumps(cal_resp2.json(), indent=2))
        
        # 6. Try to schedule an order of 9 cookies (exceeding limit of 10, total would be 11, remaining is 8)
        print(f"\nScheduling 9 cookies for date: {tomorrow} (should fail)...")
        fail_resp = await client.post(f"{base_url}/api/orders/schedule", headers=headers, json={
            "address_id": address_id,
            "total": 90.0,
            "payment_method": "Pix",
            "scheduled_date": tomorrow,
            "items": [
                {
                    "product_id": 1,
                    "name": "Cookie Lacan",
                    "quantity": 9,
                    "price": 10.0
                }
            ]
        })
        print(f"Exceed Limit Response Code: {fail_resp.status_code} (Expected 400)")
        print(f"Exceed Limit Response: {fail_resp.text}")

if __name__ == "__main__":
    asyncio.run(test_schedule())
