#!/usr/bin/env python3
"""
Docker Test Script for OCR Invoice/Receipt Data Extractor
Tests the Docker container functionality
"""

import requests
import time
import sys
import os
from PIL import Image
import io

def test_health_endpoint(base_url="http://localhost:8000"):
    """Test the health endpoint"""
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_docs_endpoint(base_url="http://localhost:8000"):
    """Test the API documentation endpoint"""
    try:
        response = requests.get(f"{base_url}/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API documentation accessible")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (400, 300), color='white')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes.getvalue()

def test_upload_endpoint(base_url="http://localhost:8000"):
    """Test the file upload endpoint"""
    try:
        # Create a test image
        image_data = create_test_image()
        
        # Prepare the file upload
        files = {"files": ("test_image.png", image_data, "image/png")}
        
        print("🔄 Testing file upload...")
        response = requests.post(f"{base_url}/api/upload", files=files, timeout=60)
        
        if response.status_code == 200:
            print("✅ File upload working")
            result = response.json()
            print(f"   Response: {result}")
            return True
        else:
            print(f"❌ File upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ File upload error: {e}")
        return False

def test_cors_headers(base_url="http://localhost:8000"):
    """Test CORS headers"""
    try:
        response = requests.options(f"{base_url}/api/upload", timeout=10)
        if "Access-Control-Allow-Origin" in response.headers:
            print("✅ CORS headers present")
            return True
        else:
            print("❌ CORS headers missing")
            return False
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Docker Container for OCR Invoice/Receipt Data Extractor")
    print("=" * 60)
    
    # Get base URL from command line argument or use default
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    print(f"Testing against: {base_url}")
    print()
    
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("API Documentation", test_docs_endpoint),
        ("CORS Headers", test_cors_headers),
        ("File Upload", test_upload_endpoint),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"🔍 Testing {test_name}...")
        try:
            result = test_func(base_url)
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
        print()
    
    # Summary
    print("=" * 60)
    print("📊 Test Results Summary:")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if result:
            passed += 1
    
    print("=" * 60)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Docker container is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the logs and configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
