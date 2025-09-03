#!/usr/bin/env python3

import google.generativeai as genai

# Configure Gemini
genai.configure(api_key='AIzaSyA5DClgaFghusD3zcpsb_tQUyBCpzskfg0')

print("Available Gemini models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✅ {model.name}")
        print(f"   Display Name: {model.display_name}")
        print(f"   Description: {model.description}")
        print()