@echo off
setlocal enabledelayedexpansion

echo 🤖 Starting Docker deployment with pre-downloaded models for OCR Invoice/Receipt Data Extractor...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from template...
    if exist env.example (
        copy env.example .env >nul
        echo [WARNING] Please edit .env file with your actual configuration values.
        echo [WARNING] Required: Firebase credentials, Gemini API key, etc.
        pause
    ) else (
        echo [ERROR] env.example file not found. Please create .env file manually.
        pause
        exit /b 1
    )
)

REM Check if serviceAccountKey.json exists
if not exist serviceAccountKey.json (
    echo [WARNING] serviceAccountKey.json not found.
    echo [WARNING] Please ensure your Firebase service account key is in the Backend directory.
    pause
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist temp mkdir temp
if not exist models mkdir models
if not exist logs mkdir logs

REM Build and start the application with models
echo [INFO] Building Docker image with pre-downloaded models...
echo [WARNING] This may take 10-15 minutes due to model downloads...
docker-compose -f docker-compose-with-models.yml build --no-cache
if errorlevel 1 (
    echo [ERROR] Failed to build Docker image with models.
    pause
    exit /b 1
)

echo [INFO] Starting the application with models...
docker-compose -f docker-compose-with-models.yml up -d
if errorlevel 1 (
    echo [ERROR] Failed to start the application.
    pause
    exit /b 1
)

REM Wait for the application to start
echo [INFO] Waiting for application to start...
timeout /t 15 /nobreak >nul

REM Check if the application is running
docker-compose -f docker-compose-with-models.yml ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] Application failed to start. Check the logs:
    docker-compose -f docker-compose-with-models.yml logs
    pause
    exit /b 1
) else (
    echo [SUCCESS] Application with models is running!
    echo [INFO] You can access the API at: http://localhost:8000
    echo [INFO] API documentation at: http://localhost:8000/docs
    
    echo [INFO] Showing recent logs:
    docker-compose -f docker-compose-with-models.yml logs --tail=20
    
    echo [INFO] Performing health check...
    curl -f http://localhost:8000/ >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Health check failed. Check the logs with: docker-compose -f docker-compose-with-models.yml logs
    ) else (
        echo [SUCCESS] Health check passed! Application with models is responding.
    )
)

echo.
echo [SUCCESS] 🎉 Deployment with models completed successfully!
echo.
echo 📋 Useful commands:
echo   View logs:           docker-compose -f docker-compose-with-models.yml logs -f
echo   Stop application:    docker-compose -f docker-compose-with-models.yml down
echo   Restart application: docker-compose -f docker-compose-with-models.yml restart
echo   Update application:  docker-compose -f docker-compose-with-models.yml up -d --build
echo   Shell access:        docker-compose -f docker-compose-with-models.yml exec ocr-backend-with-models bash
echo.
echo 🌐 Access your application:
echo   API:                 http://localhost:8000
echo   Documentation:       http://localhost:8000/docs
echo   Health check:        http://localhost:8000/
echo.
echo 🤖 Models included:
echo   - Invoice model: Mickeymarsh02/layoutlmv3-multimodel-finetuned-invoices03
echo   - Receipt model: janodis/layoutlmv3-refinetuned-receipts
echo   - EasyOCR models for English
echo   - Cluster pipeline model
echo.
pause
