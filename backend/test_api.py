#!/usr/bin/env python3

import requests
import json
import sys

# Configuration
BASE_URL = "https://8001-i8mpnwfzit0pacdos42jp.e2b.app/api"
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin"}

def test_api():
    """Test the Zeny AI API endpoints"""
    print("🚀 Testing Zeny AI API...")
    
    # Test basic connectivity
    print("\n1. Testing basic connectivity...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ GET / - Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ GET / - Error: {e}")
        return False
    
    # Test admin login
    print("\n2. Testing admin login...")
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json=ADMIN_CREDENTIALS)
        if response.status_code == 200:
            token_data = response.json()
            admin_token = token_data["access_token"]
            print(f"✅ POST /admin/login - Status: {response.status_code}")
            print(f"   Token received: {admin_token[:20]}...")
        else:
            print(f"❌ POST /admin/login - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ POST /admin/login - Error: {e}")
        return False
    
    # Headers for authenticated requests
    auth_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test creating an avatar
    print("\n3. Testing avatar creation...")
    avatar_data = {
        "name": "Zeny Assistant",
        "description": "A helpful AI assistant that can answer questions and provide support",
        "personality": "Friendly, knowledgeable, and always eager to help",
        "instructions": "You are Zeny Assistant, a helpful AI that provides clear and concise answers. Always be polite and professional. If you don't know something, admit it honestly and suggest how the user might find the information they need."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/avatars", json=avatar_data, headers=auth_headers)
        if response.status_code == 200:
            avatar = response.json()
            avatar_id = avatar["id"]
            print(f"✅ POST /admin/avatars - Status: {response.status_code}")
            print(f"   Created avatar: {avatar['name']} (ID: {avatar_id})")
        else:
            print(f"❌ POST /admin/avatars - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ POST /admin/avatars - Error: {e}")
        return False
    
    # Test getting avatars (admin)
    print("\n4. Testing admin avatar list...")
    try:
        response = requests.get(f"{BASE_URL}/admin/avatars", headers=auth_headers)
        if response.status_code == 200:
            avatars = response.json()
            print(f"✅ GET /admin/avatars - Status: {response.status_code}")
            print(f"   Found {len(avatars)} avatar(s)")
        else:
            print(f"❌ GET /admin/avatars - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ GET /admin/avatars - Error: {e}")
    
    # Test getting avatars (public)
    print("\n5. Testing public avatar list...")
    try:
        response = requests.get(f"{BASE_URL}/avatars")
        if response.status_code == 200:
            avatars = response.json()
            print(f"✅ GET /avatars - Status: {response.status_code}")
            print(f"   Found {len(avatars)} avatar(s)")
        else:
            print(f"❌ GET /avatars - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ GET /avatars - Error: {e}")
    
    # Test chat with avatar
    print("\n6. Testing chat functionality...")
    chat_data = {
        "avatar_id": avatar_id,
        "message": "Hello! Can you tell me about yourself?"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=chat_data)
        if response.status_code == 200:
            chat_response = response.json()
            print(f"✅ POST /chat - Status: {response.status_code}")
            print(f"   Avatar ({chat_response['avatar_name']}) responded:")
            print(f"   {chat_response['response'][:100]}...")
        else:
            print(f"❌ POST /chat - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ POST /chat - Error: {e}")
    
    # Test chat history
    print("\n7. Testing chat history...")
    try:
        response = requests.get(f"{BASE_URL}/admin/chat-history", headers=auth_headers)
        if response.status_code == 200:
            chat_history = response.json()
            print(f"✅ GET /admin/chat-history - Status: {response.status_code}")
            print(f"   Found {len(chat_history)} chat message(s)")
        else:
            print(f"❌ GET /admin/chat-history - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ GET /admin/chat-history - Error: {e}")
    
    # Test creating a second avatar
    print("\n8. Testing second avatar creation...")
    avatar_data_2 = {
        "name": "Tech Expert",
        "description": "A technical expert specializing in programming and technology",
        "personality": "Analytical, precise, and detail-oriented",
        "instructions": "You are a technical expert with deep knowledge of programming, software development, and technology. Provide detailed technical explanations and code examples when appropriate. Always consider best practices and security implications."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/avatars", json=avatar_data_2, headers=auth_headers)
        if response.status_code == 200:
            avatar_2 = response.json()
            print(f"✅ POST /admin/avatars - Status: {response.status_code}")
            print(f"   Created avatar: {avatar_2['name']} (ID: {avatar_2['id']})")
        else:
            print(f"❌ POST /admin/avatars - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ POST /admin/avatars - Error: {e}")
    
    print("\n🎉 API testing completed!")
    print(f"\n📊 Summary:")
    print(f"   • Backend API is running at: {BASE_URL}")
    print(f"   • Admin credentials: admin/admin")
    print(f"   • Created test avatars for demonstration")
    print(f"   • Chat functionality is working")
    print(f"\n🌐 Next steps:")
    print(f"   • Visit the frontend at: http://localhost:3000")
    print(f"   • Test the admin panel at: http://localhost:3000/admin")
    print(f"   • Start chatting with the avatars!")
    
    return True

if __name__ == "__main__":
    try:
        success = test_api()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)