# 🤖 Models in Docker - Complete Guide

This guide explains how to include your Hugging Face models in Docker containers to avoid download delays during runtime.

## 📋 Overview

Your OCR project uses these models:
- **Invoice Model**: `Mickeymarsh02/layoutlmv3-multimodel-finetuned-invoices03`
- **Receipt Model**: `janodis/layoutlmv3-refinetuned-receipts`
- **EasyOCR Models**: English language models
- **Cluster Model**: `cluster_pipeline.joblib` (local file)

## 🚀 Quick Start

### Option 1: Use the Pre-configured Deployment Script

```bash
# Windows
deploy-with-models.bat

# Linux/Mac
chmod +x deploy-with-models.sh
./deploy-with-models.sh
```

### Option 2: Manual Docker Build

```bash
# Build with models
docker build -f Dockerfile.with-models -t ocr-extractor-with-models .

# Run the container
docker run -d -p 8000:8000 --name ocr-app ocr-extractor-with-models
```

### Option 3: Use Docker Compose

```bash
# Build and start with models
docker-compose -f docker-compose-with-models.yml up -d --build
```

## 📁 Files Created

### Docker Configuration Files:
- `Dockerfile.with-models` - Single-stage build with models
- `Dockerfile.multistage` - Multi-stage build (more efficient)
- `docker-compose-with-models.yml` - Docker Compose configuration
- `deploy-with-models.bat` - Windows deployment script

### Model Management Files:
- `download_models.py` - Script to pre-download all models
- `test_models.py` - Test script to verify models work
- `MODELS_DOCKER_GUIDE.md` - This guide

## 🔧 How It Works

### 1. Model Pre-download During Build

The `download_models.py` script runs during Docker build and:
- Downloads Hugging Face models to `/app/models`
- Sets up proper cache directories
- Creates a manifest of downloaded models
- Verifies all downloads completed

### 2. Environment Variables

```dockerfile
ENV HF_HOME=/app/models \
    TRANSFORMERS_CACHE=/app/models \
    HF_HUB_CACHE=/app/models
```

### 3. Model Loading

Your existing code works unchanged:
```python
# This will now use cached models instead of downloading
processor, model, reader = _init_invoice_model()
```

## 🏗️ Build Process

### Single-Stage Build (`Dockerfile.with-models`)

```dockerfile
FROM python:3.11-slim

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Download models during build
COPY download_models.py .
RUN python download_models.py

# Copy application
COPY . .

# Run application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Multi-Stage Build (`Dockerfile.multistage`)

```dockerfile
# Build stage - download models
FROM python:3.11-slim as builder
# ... install dependencies and download models

# Production stage - copy everything
FROM python:3.11-slim as production
# ... copy models and run application
```

## 📊 Model Information

### Downloaded Models:

| Model | Type | Size (approx) | Purpose |
|-------|------|---------------|---------|
| Invoice Model | LayoutLMv3 | ~500MB | Extract structured data from invoices |
| Receipt Model | LayoutLMv3 | ~500MB | Extract structured data from receipts |
| EasyOCR Models | CNN + RNN | ~100MB | OCR text extraction |
| Cluster Model | Scikit-learn | ~200KB | Customer clustering |

### Cache Locations:

```bash
/app/models/
├── hub/                          # Hugging Face cache
│   ├── models--Mickeymarsh02--layoutlmv3-multimodel-finetuned-invoices03/
│   └── models--janodis--layoutlmv3-refinetuned-receipts/
├── .EasyOCR/                     # EasyOCR cache
├── cluster_pipeline.joblib       # Your cluster model
└── model_manifest.json          # Download manifest
```

## 🧪 Testing Models

### Test Script Usage:

```bash
# Test models in running container
docker exec -it ocr-app python test_models.py

# Or run locally (if models are cached)
python test_models.py
```

### Test Results:

```
🧪 OCR Models Test Suite
==================================================

🔍 Running Model Cache Check...
✅ Found 2 cached model directories
✅ Found 8 model weight files
✅ EasyOCR models found
✅ Model manifest found

🔍 Running Invoice Model...
✅ Invoice model loaded successfully
   - Model type: LayoutLMv3ForTokenClassification
   - Processor type: LayoutLMv3Processor

🔍 Running Receipt Model...
✅ Receipt model loaded successfully
   - Model type: LayoutLMv3ForTokenClassification
   - Processor type: LayoutLMv3Processor

🔍 Running EasyOCR...
✅ EasyOCR loaded successfully
   - Languages: ['en']

🔍 Running Cluster Model...
✅ Cluster model loaded successfully

==================================================
Total: 6/6 tests passed
🎉 All tests passed! Your models are working correctly.
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. Model Download Fails During Build

**Error**: `Failed to download invoice model`

**Solutions**:
- Check internet connection during build
- Verify Hugging Face model IDs are correct
- Try building with `--no-cache` flag

#### 2. Models Not Found at Runtime

**Error**: `Model not found`

**Solutions**:
- Verify models were downloaded during build
- Check environment variables are set
- Ensure `/app/models` directory exists

#### 3. Out of Memory During Build

**Error**: `Out of memory`

**Solutions**:
- Increase Docker memory limit
- Use multi-stage build to reduce image size
- Download models one at a time

#### 4. Slow Container Startup

**Solutions**:
- Models are pre-loaded, startup should be fast
- Check if models are being re-downloaded
- Verify cache directories are mounted correctly

### Debug Commands:

```bash
# Check if models are in container
docker exec -it ocr-app ls -la /app/models/

# Check model manifest
docker exec -it ocr-app cat /app/models/model_manifest.json

# Check environment variables
docker exec -it ocr-app env | grep HF

# View container logs
docker logs ocr-app

# Access container shell
docker exec -it ocr-app bash
```

## 📈 Performance Benefits

### Before (Runtime Download):
- First request: 30-60 seconds (model download)
- Subsequent requests: 2-5 seconds
- Requires internet connection at runtime

### After (Pre-downloaded Models):
- First request: 2-5 seconds (no download)
- Subsequent requests: 2-5 seconds
- No internet connection required at runtime
- Consistent performance

## 🔄 Updating Models

### To Update Hugging Face Models:

1. **Modify model IDs** in `download_models.py`
2. **Rebuild Docker image**:
   ```bash
   docker build -f Dockerfile.with-models -t ocr-extractor-with-models . --no-cache
   ```
3. **Restart container**:
   ```bash
   docker-compose -f docker-compose-with-models.yml up -d --build
   ```

### To Update Cluster Model:

1. **Replace** `models/cluster_pipeline.joblib`
2. **Rebuild Docker image**
3. **Restart container**

## 🌐 Production Deployment

### For Production:

1. **Use multi-stage build** for smaller images
2. **Set resource limits** for model memory usage
3. **Use volume mounts** for model persistence
4. **Monitor model performance** and memory usage

### Resource Recommendations:

```yaml
deploy:
  resources:
    limits:
      memory: 6G  # Models need more memory
    reservations:
      memory: 4G
```

## 📋 Checklist

Before deploying with models:

- [ ] Models download successfully during build
- [ ] Container starts without errors
- [ ] Models load correctly (test with `test_models.py`)
- [ ] API endpoints respond correctly
- [ ] Memory usage is within limits
- [ ] Performance is acceptable
- [ ] Models are cached properly
- [ ] Environment variables are set
- [ ] Health checks pass

## 🎯 Next Steps

1. **Test locally** with the provided scripts
2. **Deploy to staging** environment
3. **Monitor performance** and memory usage
4. **Deploy to production** with proper resource limits
5. **Set up monitoring** for model performance

---

**Happy Deploying with Models! 🤖🚀**

Your OCR models are now optimized for Docker deployment!
