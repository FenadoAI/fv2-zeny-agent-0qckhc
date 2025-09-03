#!/usr/bin/env python3

import requests
import json

# Configuration
BASE_URL = "https://8001-i8mpnwfzit0pacdos42jp.e2b.app/api"

def test_gemini_integration():
    """Test Gemini AI integration specifically"""
    print("🧪 Testing Gemini AI Integration...")
    
    # Get existing avatars first
    print("\n1. Getting available avatars...")
    try:
        response = requests.get(f"{BASE_URL}/avatars")
        avatars = response.json()
        if not avatars:
            print("❌ No avatars found. Create an avatar first.")
            return False
        
        avatar = avatars[0]  # Use the first avatar
        print(f"✅ Using avatar: {avatar['name']}")
        print(f"   Description: {avatar['description']}")
        print(f"   Personality: {avatar['personality']}")
        
    except Exception as e:
        print(f"❌ Error getting avatars: {e}")
        return False
    
    # Test advanced conversation to see if Gemini is responding
    print(f"\n2. Testing advanced conversation with {avatar['name']}...")
    
    test_messages = [
        "Hi there! Can you tell me a creative story about a robot who learns to paint?",
        "What are your thoughts on the ethical implications of AI in art?",
        "Can you write a haiku about technology and nature?",
        "Explain quantum computing in simple terms, but make it fun and engaging.",
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n   Test {i}: Sending complex message...")
        print(f"   Message: {message}")
        
        try:
            chat_data = {
                "avatar_id": avatar["id"],
                "message": message
            }
            
            response = requests.post(f"{BASE_URL}/chat", json=chat_data)
            if response.status_code == 200:
                chat_response = response.json()
                ai_response = chat_response['response']
                
                print(f"   Response length: {len(ai_response)} characters")
                print(f"   Response preview: {ai_response[:150]}...")
                
                # Check if this looks like a Gemini response vs fallback
                if "I'm experiencing some technical difficulties" in ai_response:
                    print("   ⚠️  Gemini API error - using fallback response")
                elif "Here's my response based on my instructions:" in ai_response:
                    print("   ⚠️  Using simulated response - Gemini not available")
                else:
                    print("   ✅ Likely Gemini response - creative and detailed")
                    
            else:
                print(f"   ❌ Chat failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error in chat: {e}")
    
    print(f"\n🎯 Gemini Integration Test Complete!")
    print(f"   If responses are creative and detailed, Gemini is working.")
    print(f"   If responses are repetitive templates, using fallback mode.")
    
    return True

if __name__ == "__main__":
    test_gemini_integration()