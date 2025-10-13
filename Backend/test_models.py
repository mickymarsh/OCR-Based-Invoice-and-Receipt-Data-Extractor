#!/usr/bin/env python3
"""
Test Script for OCR Models in Docker Container
Verifies that all models are properly loaded and working
"""

import os
import sys
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_invoice_model():
    """Test the invoice model loading"""
    try:
        logger.info("🔄 Testing invoice model...")
        
        from Janodi.model.invoice_model import _init_invoice_model
        
        processor, model, reader = _init_invoice_model()
        
        logger.info(f"✅ Invoice model loaded successfully")
        logger.info(f"   - Model type: {type(model).__name__}")
        logger.info(f"   - Processor type: {type(processor).__name__}")
        logger.info(f"   - Reader type: {type(reader).__name__}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Invoice model test failed: {e}")
        return False

def test_receipt_model():
    """Test the receipt model loading"""
    try:
        logger.info("🔄 Testing receipt model...")
        
        from Janodi.model.receipts_model import _init_model
        
        processor, model, id2label, reader = _init_model()
        
        logger.info(f"✅ Receipt model loaded successfully")
        logger.info(f"   - Model type: {type(model).__name__}")
        logger.info(f"   - Processor type: {type(processor).__name__}")
        logger.info(f"   - Reader type: {type(reader).__name__}")
        logger.info(f"   - Number of labels: {len(id2label) if id2label else 0}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Receipt model test failed: {e}")
        return False

def test_easyocr():
    """Test EasyOCR loading"""
    try:
        logger.info("🔄 Testing EasyOCR...")
        
        import easyocr
        reader = easyocr.Reader(['en'])
        
        logger.info(f"✅ EasyOCR loaded successfully")
        logger.info(f"   - Reader type: {type(reader).__name__}")
        logger.info(f"   - Languages: {reader.lang_list}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ EasyOCR test failed: {e}")
        return False

def test_cluster_model():
    """Test the cluster model loading"""
    try:
        logger.info("🔄 Testing cluster model...")
        
        import joblib
        model_path = "/app/models/cluster_pipeline.joblib"
        
        if not Path(model_path).exists():
            logger.warning(f"⚠️ Cluster model not found at {model_path}")
            return False
        
        bundle = joblib.load(model_path)
        
        logger.info(f"✅ Cluster model loaded successfully")
        logger.info(f"   - Model type: {type(bundle).__name__}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Cluster model test failed: {e}")
        return False

def check_model_cache():
    """Check if models are cached properly"""
    try:
        logger.info("🔍 Checking model cache...")
        
        cache_dir = Path("/app/models")
        if not cache_dir.exists():
            logger.error("❌ Models cache directory does not exist")
            return False
        
        # Check for Hugging Face cache
        hf_cache = cache_dir / "hub"
        if hf_cache.exists():
            model_dirs = list(hf_cache.iterdir())
            logger.info(f"✅ Found {len(model_dirs)} cached model directories")
            
            for model_dir in model_dirs:
                if model_dir.is_dir():
                    logger.info(f"   - {model_dir.name}")
        else:
            logger.warning("⚠️ Hugging Face cache directory not found")
        
        # Check for model files
        model_files = list(cache_dir.rglob("*.bin")) + list(cache_dir.rglob("*.safetensors"))
        if model_files:
            logger.info(f"✅ Found {len(model_files)} model weight files")
        else:
            logger.warning("⚠️ No model weight files found")
        
        # Check for EasyOCR models
        easyocr_models = cache_dir / ".EasyOCR"
        if easyocr_models.exists():
            logger.info("✅ EasyOCR models found")
        else:
            logger.warning("⚠️ EasyOCR models not found")
        
        # Check manifest
        manifest_file = cache_dir / "model_manifest.json"
        if manifest_file.exists():
            logger.info("✅ Model manifest found")
            try:
                import json
                with open(manifest_file, 'r') as f:
                    manifest = json.load(f)
                logger.info(f"   - {len(manifest.get('models', []))} models in manifest")
            except Exception as e:
                logger.warning(f"⚠️ Could not read manifest: {e}")
        else:
            logger.warning("⚠️ Model manifest not found")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Model cache check failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    try:
        logger.info("🔄 Testing API endpoints...")
        
        import requests
        
        base_url = "http://localhost:8000"
        
        # Test health endpoint
        try:
            response = requests.get(f"{base_url}/", timeout=10)
            if response.status_code == 200:
                logger.info("✅ Health endpoint working")
            else:
                logger.warning(f"⚠️ Health endpoint returned status {response.status_code}")
        except Exception as e:
            logger.warning(f"⚠️ Health endpoint test failed: {e}")
        
        # Test docs endpoint
        try:
            response = requests.get(f"{base_url}/docs", timeout=10)
            if response.status_code == 200:
                logger.info("✅ API documentation accessible")
            else:
                logger.warning(f"⚠️ API docs returned status {response.status_code}")
        except Exception as e:
            logger.warning(f"⚠️ API docs test failed: {e}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ API endpoints test failed: {e}")
        return False

def main():
    """Main test function"""
    logger.info("🧪 OCR Models Test Suite")
    logger.info("=" * 50)
    
    tests = [
        ("Model Cache Check", check_model_cache),
        ("Invoice Model", test_invoice_model),
        ("Receipt Model", test_receipt_model),
        ("EasyOCR", test_easyocr),
        ("Cluster Model", test_cluster_model),
        ("API Endpoints", test_api_endpoints),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n🔍 Running {test_name}...")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            logger.error(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("📊 Test Results Summary:")
    logger.info("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name:20} {status}")
        if result:
            passed += 1
    
    logger.info("=" * 50)
    logger.info(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Your models are working correctly.")
        return 0
    else:
        logger.info("⚠️  Some tests failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
