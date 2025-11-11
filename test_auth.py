#!/usr/bin/env python3
import http.client
import json
import time

# Give server a moment to be ready
time.sleep(2)

# Test /health first
print("=" * 50)
print("Testing /health endpoint...")
print("=" * 50)

conn = http.client.HTTPConnection('localhost', 8080)
conn.request("GET", "/health")
response = conn.getresponse()
print(f"Status: {response.status}")
print(f"Response: {response.read().decode()}")
conn.close()

# Test /auth/signup
print("\n" + "=" * 50)
print("Testing /auth/signup endpoint...")
print("=" * 50)

signup_data = {
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
}

conn = http.client.HTTPConnection('localhost', 8080)
conn.request("POST", "/auth/signup", 
    body=json.dumps(signup_data),
    headers={"Content-Type": "application/json"}
)
response = conn.getresponse()
print(f"Status: {response.status}")
body = response.read().decode()
print(f"Response: {body}")

try:
    json_response = json.loads(body)
    if 'token' in json_response:
        print(f"\n✅ SUCCESS! Token: {json_response['token'][:50]}...")
        token = json_response['token']
    elif 'error' in json_response:
        print(f"\n❌ Error: {json_response['error']}")
except:
    pass

conn.close()

# Test /auth/login
print("\n" + "=" * 50)
print("Testing /auth/login endpoint...")
print("=" * 50)

login_data = {
    "email": "test@example.com",
    "password": "TestPass123"
}

conn = http.client.HTTPConnection('localhost', 8080)
conn.request("POST", "/auth/login",
    body=json.dumps(login_data),
    headers={"Content-Type": "application/json"}
)
response = conn.getresponse()
print(f"Status: {response.status}")
body = response.read().decode()
print(f"Response: {body}")

try:
    json_response = json.loads(body)
    if 'token' in json_response:
        print(f"\n✅ SUCCESS! Token: {json_response['token'][:50]}...")
    elif 'error' in json_response:
        print(f"\n❌ Error: {json_response['error']}")
except:
    pass

conn.close()

print("\n" + "=" * 50)
print("Tests complete!")
print("=" * 50)
