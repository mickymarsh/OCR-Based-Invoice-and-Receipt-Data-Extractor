import pytest
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to import app modules
sys.path.append(str(Path(__file__).parent.parent))

# Try to import the gemini module
try:
    from utils import gemini
    from Janodi import gemini_api
except ImportError:
    print("Failed to import gemini modules. Make sure the project structure is correct.")
    sys.exit(1)

def test_gemini_api_key_loading():
    """Test if the Gemini API key is correctly loaded from environment variables"""
    try:
        api_key = gemini.get_gemini_api_key()
        
        # Check if API key is not empty
        assert api_key, "Gemini API key is empty or None"
        print(f"✅ Gemini API key loaded successfully")
        
        # Don't print the actual key for security reasons
        masked_key = api_key[:4] + '*' * (len(api_key) - 8) + api_key[-4:] if len(api_key) > 8 else "****"
        print(f"   API key format: {masked_key}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to load Gemini API key: {str(e)}")
        return False

def test_gemini_client_initialization():
    """Test if the Gemini client can be initialized"""
    try:
        # Try to configure the client
        genai = gemini.configure_genai()
        
        # Check if genai object is created
        assert genai is not None, "Failed to initialize Gemini client"
        print(f"✅ Gemini client initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize Gemini client: {str(e)}")
        return False

def test_gemini_model_access():
    """Test if we can access the Gemini models"""
    try:
        # Configure client
        genai = gemini.configure_genai()
        
        # Try to access models list
        models = genai.list_models()
        
        # Check if any models are available
        assert len(list(models)) > 0, "No Gemini models available"
        print(f"✅ Successfully accessed Gemini models:")
        
        # Print available models
        model_names = [model.name for model in models]
        print(f"   Available models: {', '.join(model_names[:3])}...")
        return True
    except Exception as e:
        print(f"❌ Failed to access Gemini models: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Gemini API integration...")
    
    # Run tests
    key_test = test_gemini_api_key_loading()
    client_test = test_gemini_client_initialization() if key_test else False
    model_test = test_gemini_model_access() if client_test else False
    
    # Print summary
    print("\nSummary:")
    print(f"{'✅' if key_test else '❌'} API Key Loading")
    print(f"{'✅' if client_test else '❌'} Client Initialization")
    print(f"{'✅' if model_test else '❌'} Model Access")
    
    # Exit with appropriate status
    if key_test and client_test and model_test:
        print("\n🎉 All Gemini API tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️ Some Gemini API tests failed!")
        sys.exit(1)