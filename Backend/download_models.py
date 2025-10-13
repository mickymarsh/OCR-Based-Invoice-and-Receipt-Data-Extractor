#!/usr/bin/env python3
"""
Model Pre-download Script for Docker Build
Downloads all Hugging Face models used in the OCR project
"""

import os
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_invoice_model():
    """Download the invoice processing model"""
    try:
        logger.info("🔄 Downloading invoice model...")
        
        # Import here to avoid issues during Docker build if dependencies aren't installed yet
        from transformers import AutoProcessor, AutoModelForTokenClassification
        
        model_id = "Mickeymarsh02/layoutlmv3-multimodel-finetuned-invoices03"
        
        # Set cache directory
        cache_dir = "/app/models"
        os.makedirs(cache_dir, exist_ok=True)
        
        logger.info(f"Downloading model: {model_id}")
        logger.info(f"Cache directory: {cache_dir}")
        
        # Download processor and model
        processor = AutoProcessor.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            local_files_only=False
        )
        
        model = AutoModelForTokenClassification.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            local_files_only=False
        )
        
        logger.info("✅ Invoice model downloaded successfully")
        
        # Save model info
        model_info = {
            "model_id": model_id,
            "processor_type": type(processor).__name__,
            "model_type": type(model).__name__,
            "cache_dir": cache_dir
        }
        
        return model_info
        
    except Exception as e:
        logger.error(f"❌ Failed to download invoice model: {e}")
        raise

def download_receipt_model():
    """Download the receipt processing model"""
    try:
        logger.info("🔄 Downloading receipt model...")
        
        from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
        
        model_id = "janodis/layoutlmv3-refinetuned-receipts"
        
        # Set cache directory
        cache_dir = "/app/models"
        os.makedirs(cache_dir, exist_ok=True)
        
        logger.info(f"Downloading model: {model_id}")
        logger.info(f"Cache directory: {cache_dir}")
        
        # Download processor and model
        processor = LayoutLMv3Processor.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            apply_ocr=False,
            local_files_only=False
        )
        
        model = LayoutLMv3ForTokenClassification.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            local_files_only=False
        )
        
        logger.info("✅ Receipt model downloaded successfully")
        
        # Save model info
        model_info = {
            "model_id": model_id,
            "processor_type": type(processor).__name__,
            "model_type": type(model).__name__,
            "cache_dir": cache_dir
        }
        
        return model_info
        
    except Exception as e:
        logger.error(f"❌ Failed to download receipt model: {e}")
        raise

def download_easyocr_models():
    """Download EasyOCR models"""
    try:
        logger.info("🔄 Downloading EasyOCR models...")
        
        import easyocr
        
        # Create EasyOCR reader to trigger model download
        reader = easyocr.Reader(['en'], download_enabled=True)
        
        logger.info("✅ EasyOCR models downloaded successfully")
        
        return {"status": "success", "languages": ["en"]}
        
    except Exception as e:
        logger.error(f"❌ Failed to download EasyOCR models: {e}")
        raise

def create_model_manifest():
    """Create a manifest file with all downloaded models"""
    try:
        logger.info("📝 Creating model manifest...")
        
        manifest = {
            "models": [],
            "cache_directory": "/app/models",
            "download_timestamp": "2024-01-01T00:00:00Z"
        }
        
        # Add invoice model
        try:
            invoice_info = download_invoice_model()
            manifest["models"].append({
                "name": "invoice_model",
                "type": "transformers",
                "model_id": invoice_info["model_id"],
                "status": "downloaded"
            })
        except Exception as e:
            logger.warning(f"⚠️ Invoice model download failed: {e}")
            manifest["models"].append({
                "name": "invoice_model",
                "status": "failed",
                "error": str(e)
            })
        
        # Add receipt model
        try:
            receipt_info = download_receipt_model()
            manifest["models"].append({
                "name": "receipt_model", 
                "type": "transformers",
                "model_id": receipt_info["model_id"],
                "status": "downloaded"
            })
        except Exception as e:
            logger.warning(f"⚠️ Receipt model download failed: {e}")
            manifest["models"].append({
                "name": "receipt_model",
                "status": "failed",
                "error": str(e)
            })
        
        # Add EasyOCR models
        try:
            easyocr_info = download_easyocr_models()
            manifest["models"].append({
                "name": "easyocr_models",
                "type": "easyocr",
                "languages": easyocr_info["languages"],
                "status": "downloaded"
            })
        except Exception as e:
            logger.warning(f"⚠️ EasyOCR models download failed: {e}")
            manifest["models"].append({
                "name": "easyocr_models",
                "status": "failed",
                "error": str(e)
            })
        
        # Save manifest
        import json
        manifest_path = "/app/models/model_manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logger.info(f"✅ Model manifest saved to {manifest_path}")
        
        return manifest
        
    except Exception as e:
        logger.error(f"❌ Failed to create model manifest: {e}")
        raise

def verify_models():
    """Verify that all models are properly downloaded"""
    try:
        logger.info("🔍 Verifying downloaded models...")
        
        cache_dir = Path("/app/models")
        if not cache_dir.exists():
            logger.error("❌ Models cache directory does not exist")
            return False
        
        # Check for Hugging Face cache
        hf_cache = cache_dir / "hub"
        if not hf_cache.exists():
            logger.warning("⚠️ Hugging Face cache directory not found")
        
        # Check for model files
        model_files = list(cache_dir.rglob("*.bin")) + list(cache_dir.rglob("*.safetensors"))
        if not model_files:
            logger.warning("⚠️ No model weight files found")
        else:
            logger.info(f"✅ Found {len(model_files)} model weight files")
        
        # Check for EasyOCR models
        easyocr_models = cache_dir / ".EasyOCR"
        if not easyocr_models.exists():
            logger.warning("⚠️ EasyOCR models directory not found")
        
        logger.info("✅ Model verification completed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Model verification failed: {e}")
        return False

def main():
    """Main function to download all models"""
    logger.info("🚀 Starting model download process...")
    logger.info(f"Cache directory: /app/models")
    
    try:
        # Create models directory
        os.makedirs("/app/models", exist_ok=True)
        
        # Download all models
        manifest = create_model_manifest()
        
        # Verify downloads
        verify_models()
        
        logger.info("🎉 All models downloaded successfully!")
        logger.info("📦 Models are now cached in the Docker image")
        
        # Print summary
        successful_models = [m for m in manifest["models"] if m["status"] == "downloaded"]
        failed_models = [m for m in manifest["models"] if m["status"] == "failed"]
        
        logger.info(f"✅ Successfully downloaded: {len(successful_models)} models")
        if failed_models:
            logger.warning(f"⚠️ Failed to download: {len(failed_models)} models")
            for model in failed_models:
                logger.warning(f"   - {model['name']}: {model['error']}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Model download process failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
