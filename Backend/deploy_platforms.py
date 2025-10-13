#!/usr/bin/env python3
"""
Multi-Platform Deployment Script for OCR Invoice/Receipt Data Extractor
Supports Railway, Render, Fly.io, and Google Cloud Run
"""

import os
import sys
import subprocess
import json
from pathlib import Path

class PlatformDeployer:
    def __init__(self):
        self.platforms = {
            'railway': self.deploy_railway,
            'render': self.deploy_render,
            'fly': self.deploy_fly,
            'gcp': self.deploy_gcp,
            'heroku': self.deploy_heroku
        }
    
    def check_requirements(self, platform):
        """Check if required tools are installed for each platform"""
        requirements = {
            'railway': ['railway'],
            'render': ['git'],
            'fly': ['flyctl'],
            'gcp': ['gcloud'],
            'heroku': ['heroku']
        }
        
        missing = []
        for tool in requirements.get(platform, []):
            if not self.check_command_exists(tool):
                missing.append(tool)
        
        if missing:
            print(f"❌ Missing required tools for {platform}: {', '.join(missing)}")
            print("Please install the missing tools and try again.")
            return False
        return True
    
    def check_command_exists(self, command):
        """Check if a command exists in PATH"""
        try:
            subprocess.run([command, '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def create_railway_config(self):
        """Create Railway configuration"""
        railway_config = {
            "build": {
                "builder": "NIXPACKS"
            },
            "deploy": {
                "startCommand": "uvicorn app:app --host 0.0.0.0 --port $PORT",
                "healthcheckPath": "/",
                "healthcheckTimeout": 300,
                "restartPolicyType": "ON_FAILURE",
                "restartPolicyMaxRetries": 10
            }
        }
        
        with open('railway.json', 'w') as f:
            json.dump(railway_config, f, indent=2)
        
        print("✅ Created railway.json configuration")
    
    def create_render_config(self):
        """Create Render configuration"""
        render_config = """name: ocr-invoice-extractor
services:
- type: web
  name: ocr-backend
  env: python
  buildCommand: pip install -r requirements.txt
  startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
  healthCheckPath: /
  envVars:
  - key: ENVIRONMENT
    value: production
  - key: PYTHON_VERSION
    value: 3.11.0
"""
        
        with open('render.yaml', 'w') as f:
            f.write(render_config)
        
        print("✅ Created render.yaml configuration")
    
    def create_fly_config(self):
        """Create Fly.io configuration"""
        fly_config = """app = "ocr-invoice-extractor"
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
"""
        
        with open('fly.toml', 'w') as f:
            f.write(fly_config)
        
        print("✅ Created fly.toml configuration")
    
    def deploy_railway(self):
        """Deploy to Railway"""
        print("🚂 Deploying to Railway...")
        
        if not self.check_requirements('railway'):
            return False
        
        self.create_railway_config()
        
        try:
            # Login to Railway
            subprocess.run(['railway', 'login'], check=True)
            
            # Initialize project if not already done
            if not Path('railway.toml').exists():
                subprocess.run(['railway', 'init'], check=True)
            
            # Deploy
            subprocess.run(['railway', 'up'], check=True)
            
            print("✅ Successfully deployed to Railway!")
            print("🌐 Your app should be available at the Railway URL")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Railway deployment failed: {e}")
            return False
    
    def deploy_render(self):
        """Deploy to Render"""
        print("🎨 Deploying to Render...")
        
        self.create_render_config()
        
        print("📋 Render deployment steps:")
        print("1. Go to https://render.com/")
        print("2. Connect your GitHub repository")
        print("3. Create a new Web Service")
        print("4. Use the following settings:")
        print("   - Build Command: pip install -r requirements.txt")
        print("   - Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT")
        print("   - Environment: Python 3.11")
        print("   - Plan: Free")
        print("5. Add your environment variables")
        print("6. Deploy!")
        
        return True
    
    def deploy_fly(self):
        """Deploy to Fly.io"""
        print("🪰 Deploying to Fly.io...")
        
        if not self.check_requirements('fly'):
            print("Please install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/")
            return False
        
        self.create_fly_config()
        
        try:
            # Login to Fly.io
            subprocess.run(['flyctl', 'auth', 'login'], check=True)
            
            # Launch the app
            subprocess.run(['flyctl', 'launch', '--no-deploy'], check=True)
            
            # Deploy
            subprocess.run(['flyctl', 'deploy'], check=True)
            
            print("✅ Successfully deployed to Fly.io!")
            print("🌐 Your app should be available at the Fly.io URL")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Fly.io deployment failed: {e}")
            return False
    
    def deploy_gcp(self):
        """Deploy to Google Cloud Run"""
        print("☁️ Deploying to Google Cloud Run...")
        
        if not self.check_requirements('gcp'):
            print("Please install Google Cloud CLI: https://cloud.google.com/sdk/docs/install")
            return False
        
        try:
            # Deploy to Cloud Run
            subprocess.run([
                'gcloud', 'run', 'deploy', 'ocr-extractor',
                '--source', '.',
                '--platform', 'managed',
                '--region', 'us-central1',
                '--allow-unauthenticated'
            ], check=True)
            
            print("✅ Successfully deployed to Google Cloud Run!")
            print("🌐 Your app should be available at the Cloud Run URL")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Google Cloud Run deployment failed: {e}")
            return False
    
    def deploy_heroku(self):
        """Deploy to Heroku"""
        print("🟣 Deploying to Heroku...")
        
        if not self.check_requirements('heroku'):
            print("Please install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli")
            return False
        
        # Create Procfile
        with open('Procfile', 'w') as f:
            f.write('web: uvicorn app:app --host 0.0.0.0 --port $PORT\n')
        
        print("✅ Created Procfile for Heroku")
        
        try:
            # Login to Heroku
            subprocess.run(['heroku', 'login'], check=True)
            
            # Create app (if not exists)
            subprocess.run(['heroku', 'create'], check=True)
            
            # Deploy
            subprocess.run(['git', 'add', '.'], check=True)
            subprocess.run(['git', 'commit', '-m', 'Deploy to Heroku'], check=True)
            subprocess.run(['git', 'push', 'heroku', 'main'], check=True)
            
            print("✅ Successfully deployed to Heroku!")
            print("🌐 Your app should be available at the Heroku URL")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Heroku deployment failed: {e}")
            return False
    
    def show_help(self):
        """Show help information"""
        print("🐳 OCR Invoice/Receipt Data Extractor - Platform Deployment")
        print("=" * 60)
        print()
        print("Available platforms:")
        for platform in self.platforms.keys():
            print(f"  - {platform}")
        print()
        print("Usage:")
        print("  python deploy_platforms.py <platform>")
        print()
        print("Examples:")
        print("  python deploy_platforms.py railway")
        print("  python deploy_platforms.py render")
        print("  python deploy_platforms.py fly")
        print()
        print("Before deploying:")
        print("  1. Ensure your .env file is configured")
        print("  2. Make sure serviceAccountKey.json is present")
        print("  3. Commit your changes to git")
        print()

def main():
    """Main function"""
    if len(sys.argv) != 2:
        deployer = PlatformDeployer()
        deployer.show_help()
        sys.exit(1)
    
    platform = sys.argv[1].lower()
    deployer = PlatformDeployer()
    
    if platform not in deployer.platforms:
        print(f"❌ Unknown platform: {platform}")
        deployer.show_help()
        sys.exit(1)
    
    # Check if .env exists
    if not Path('.env').exists():
        print("⚠️  Warning: .env file not found. Make sure to configure environment variables on your platform.")
    
    # Check if serviceAccountKey.json exists
    if not Path('serviceAccountKey.json').exists():
        print("⚠️  Warning: serviceAccountKey.json not found. Make sure to configure Firebase credentials on your platform.")
    
    # Deploy to the specified platform
    success = deployer.platforms[platform]()
    
    if success:
        print("\n🎉 Deployment completed successfully!")
        print("\n📋 Next steps:")
        print("  1. Configure environment variables on your platform")
        print("  2. Test your deployed application")
        print("  3. Set up monitoring and logging")
    else:
        print("\n❌ Deployment failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
