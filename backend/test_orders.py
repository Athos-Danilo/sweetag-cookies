import asyncio
import httpx
import json
import sqlite3

async def test_workflow():
    base_url = "http://localhost:8000"
    
    # Need to clean up DB for a fresh test or just register a random user
    import time
    random_str = str(int(time.time()))
    
    async with httpx.AsyncClient() as client:
        # 1. Register a test user
        print(f"Registering user with whatsapp: {random_str}...")
        resp = await client.post(f"{base_url}/api/auth/register", json={
            "whatsapp": random_str,
            "nome": "Test User",
            "aceitaNotificacoes": True
        })
        
        if resp.status_code != 200:
            print(f"Failed to register user: {resp.text}")
            return
            
        data = resp.json()
        token = data.get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("User registered successfully. Token obtained.")
        
        # 2. Create an address
        print("Creating an address...")
        resp = await client.post(f"{base_url}/api/addresses", headers=headers, json={
            "title": "Clínica Psicologia",
            "department": "Psicologia",
            "block": "A",
            "room": "101",
            "is_default": True
        })
        
        if resp.status_code != 201:
            print(f"Failed to create address: {resp.text}")
            return
            
        address = resp.json()
        address_id = address.get("id")
        print(f"Address created successfully with ID: {address_id}")
        
        # 3. Create an order
        print("Creating an order...")
        resp = await client.post(f"{base_url}/api/orders", headers=headers, json={
            "address_id": address_id,
            "total": 30.0,
            "payment_method": "Pix",
            "items": [
                {
                    "name": "Cookie Lacan",
                    "quantity": 2,
                    "price": 10.0
                },
                {
                    "name": "Cookie Freud",
                    "quantity": 1,
                    "price": 10.0
                }
            ]
        })
        
        if resp.status_code != 201:
            print(f"Failed to create order: {resp.text}")
            return
            
        order = resp.json()
        print(f"Order created successfully with ID: {order.get('id')}")
        
        # 4. Fetch orders history
        print("Fetching orders history...")
        resp = await client.get(f"{base_url}/api/orders", headers=headers)
        if resp.status_code != 200:
            print(f"Failed to fetch orders: {resp.text}")
            return
            
        orders = resp.json()
        print(f"Fetched {len(orders)} orders.")
        print("First order details:")
        print(json.dumps(orders[0], indent=2, ensure_ascii=False))
        print("\nWorkflow completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_workflow())
