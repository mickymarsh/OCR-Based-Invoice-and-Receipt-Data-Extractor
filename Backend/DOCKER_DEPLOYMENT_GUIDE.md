# 🐳 Docker Deployment Guide for OCR Invoice/Receipt Data Extractor

This guide will help you deploy your OCR-based invoice and receipt data extraction project using Docker, including free hosting options.

## 📋 Prerequisites

- Docker Desktop installed on your machine
- Git installed
- Your project code
- Firebase service account key (`serviceAccountKey.json`)
- Environment variables configured

## 🚀 Quick Start (Local Deployment)

### Option 1: Using the Deployment Script (Recommended)

#### For Windows:
```bash
cd Backend
deploy.bat
```

#### For Linux/Mac:
```bash
cd Backend
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Create environment file:**
   ```bash
   copy env.example .env  # Windows
   cp env.example .env    # Linux/Mac
   ```

3. **Edit the .env file with your actual values:**
   - Firebase credentials
   - Gemini API key
   - SendGrid API key (optional)

4. **Build and start the application:**
   ```bash
   docker-compose up -d --build
   ```

5. **Check if the application is running:**
   ```bash
   docker-compose ps
   ```

6. **Access your application:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs

## 🌐 Free Hosting Options

### 1. Railway (Recommended - Free Tier Available)

Railway offers 500 hours of free compute time per month.

#### Steps:
1. **Sign up at [Railway](https://railway.app/)**
2. **Connect your GitHub repository**
3. **Configure environment variables in Railway dashboard:**
   ```
   FIREBASE_PROJECT_ID=your-project-id
   GEMINI_API_KEY=your-gemini-key
   # ... other variables
   ```
4. **Deploy automatically from GitHub**

#### Railway Configuration:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/`

### 2. Render (Free Tier Available)

Render offers a free tier with 750 hours per month.

#### Steps:
1. **Sign up at [Render](https://render.com/)**
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
   - **Plan:** Free

### 3. Fly.io (Free Tier Available)

Fly.io offers 3 shared-cpu VMs for free.

#### Steps:
1. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Linux/Mac
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create fly.toml configuration:**
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]

   [env]
     PORT = "8080"

   [[services]]
     internal_port = 8080
     protocol = "tcp"

     [[services.ports]]
       port = 80
       handlers = ["http"]
       force_https = true

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]

     [services.concurrency]
       type = "connections"
       hard_limit = 25
       soft_limit = 20

     [[services.tcp_checks]]
       interval = "15s"
       timeout = "2s"
       grace_period = "1s"
   ```

3. **Deploy:**
   ```bash
   fly deploy
   ```

### 4. Google Cloud Run (Free Tier Available)

Google Cloud Run offers 2 million requests per month for free.

#### Steps:
1. **Install Google Cloud CLI**
2. **Create a Cloud Run service:**
   ```bash
   gcloud run deploy ocr-extractor \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### 5. Heroku (Free Tier Discontinued, but Paid Plans Available)

While Heroku's free tier is discontinued, they offer affordable paid plans.

#### Steps:
1. **Install Heroku CLI**
2. **Create Procfile:**
   ```
   web: uvicorn app:app --host 0.0.0.0 --port $PORT
   ```
3. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## 🔧 Configuration for Different Hosts

### Environment Variables Setup

Create a `.env` file with these variables:

```env
# Application Settings
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Firebase Configuration (Required)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Google Gemini API (Required)
GEMINI_API_KEY=your-gemini-api-key

# Optional Services
SENDGRID_API_KEY=your-sendgrid-api-key
SENDER_EMAIL=your-sender-email@example.com
HUGGINGFACE_HUB_TOKEN=your-huggingface-token

# CORS Settings
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Dockerfile Optimizations for Different Platforms

#### For Railway/Render (with buildpack):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE $PORT
CMD uvicorn app:app --host 0.0.0.0 --port $PORT
```

#### For Fly.io:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    libgl1-mesa-glx libgtk-3-0 libjpeg-dev libpng-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD uvicorn app:app --host 0.0.0.0 --port 8080
```

## 📊 Monitoring and Maintenance

### Health Checks

Your application includes health check endpoints:

- **Basic health:** `GET /`
- **Detailed health:** `GET /health` (if implemented)

### Logs Monitoring

#### Local Development:
```bash
docker-compose logs -f
```

#### Production Platforms:
- **Railway:** Built-in logs dashboard
- **Render:** Logs tab in dashboard
- **Fly.io:** `fly logs`
- **Google Cloud Run:** Cloud Logging console

### Performance Optimization

1. **Model Caching:** Models are loaded once and cached in memory
2. **Memory Management:** Garbage collection after each request
3. **Request Timeouts:** Configured for 60 seconds
4. **File Size Limits:** 10MB maximum upload size

## 🔒 Security Considerations

### Production Security Checklist:

- [ ] Use HTTPS (enforced by most platforms)
- [ ] Set strong environment variables
- [ ] Enable CORS restrictions
- [ ] Implement rate limiting
- [ ] Use secure Firebase rules
- [ ] Regular dependency updates

### Rate Limiting

The nginx configuration includes rate limiting:
- API endpoints: 10 requests/second
- Upload endpoints: 2 requests/second

## 🚨 Troubleshooting

### Common Issues:

1. **Memory Issues:**
   ```bash
   # Increase memory limits in docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 4G
   ```

2. **Model Loading Errors:**
   - Ensure HuggingFace token is set
   - Check internet connectivity
   - Verify model names are correct

3. **Firebase Connection Issues:**
   - Verify serviceAccountKey.json is present
   - Check Firebase project ID
   - Ensure proper permissions

4. **Port Issues:**
   - Use `$PORT` environment variable
   - Most platforms assign ports dynamically

### Debug Commands:

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Access container shell
docker-compose exec ocr-backend bash

# Restart service
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

## 📈 Scaling Considerations

### For High Traffic:

1. **Horizontal Scaling:** Use multiple container instances
2. **Load Balancing:** Implement nginx or cloud load balancer
3. **Caching:** Add Redis for model caching
4. **CDN:** Use CloudFlare or similar for static assets

### Resource Requirements:

- **Minimum:** 1GB RAM, 1 CPU core
- **Recommended:** 2GB RAM, 2 CPU cores
- **High Traffic:** 4GB RAM, 4 CPU cores

## 🎯 Next Steps

1. **Set up CI/CD pipeline** for automatic deployments
2. **Implement monitoring** with tools like Sentry
3. **Add automated testing** in the deployment pipeline
4. **Set up backup strategies** for your data
5. **Implement logging aggregation** for better debugging

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Verify environment variables
3. Test locally with Docker
4. Check platform-specific documentation
5. Review this guide for troubleshooting steps

---

**Happy Deploying! 🚀**

Your OCR Invoice/Receipt Data Extractor is now ready for production deployment!
