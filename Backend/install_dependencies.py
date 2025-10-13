#!/usr/bin/env python3
"""
Dependency Installation Script for OCR Invoice/Receipt Data Extractor
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def upgrade_pip():
    """Upgrade pip to latest version"""
    return run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip")

def install_requirements(requirements_file="requirements.txt"):
    """Install requirements from file"""
    if not Path(requirements_file).exists():
        print(f"❌ Requirements file {requirements_file} not found")
        return False
    
    return run_command(f"{sys.executable} -m pip install -r {requirements_file}", f"Installing dependencies from {requirements_file}")

def install_essential_packages():
    """Install essential packages individually"""
    essential_packages = [
        "fastapi",
        "uvicorn[standard]",
        "pydantic",
        "python-multipart",
        "python-dotenv",
        "firebase-admin",
        "google-generativeai",
        "easyocr",
        "opencv-python",
        "pillow",
        "torch",
        "torchvision",
        "transformers",
        "scikit-learn",
        "pandas",
        "numpy",
        "joblib",
        "requests"
    ]
    
    print("🔄 Installing essential packages...")
    for package in essential_packages:
        success = run_command(f"{sys.executable} -m pip install {package}", f"Installing {package}")
        if not success:
            print(f"⚠️  Failed to install {package}, continuing...")
    
    return True

def verify_installation():
    """Verify that key packages can be imported"""
    test_imports = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("pydantic", "Pydantic"),
        ("firebase_admin", "Firebase Admin"),
        ("easyocr", "EasyOCR"),
        ("cv2", "OpenCV"),
        ("PIL", "Pillow"),
        ("torch", "PyTorch"),
        ("transformers", "Transformers"),
        ("sklearn", "Scikit-learn"),
        ("pandas", "Pandas"),
        ("numpy", "NumPy")
    ]
    
    print("\n🔍 Verifying installation...")
    failed_imports = []
    
    for module_name, display_name in test_imports:
        try:
            __import__(module_name)
            print(f"✅ {display_name} imported successfully")
        except ImportError as e:
            print(f"❌ {display_name} import failed: {e}")
            failed_imports.append(display_name)
    
    if failed_imports:
        print(f"\n⚠️  Failed to import: {', '.join(failed_imports)}")
        return False
    else:
        print("\n🎉 All packages imported successfully!")
        return True

def main():
    """Main installation function"""
    print("🐍 OCR Invoice/Receipt Data Extractor - Dependency Installation")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Upgrade pip
    upgrade_pip()
    
    # Try to install from requirements.txt first
    if Path("requirements.txt").exists():
        print("\n📦 Found requirements.txt, installing from file...")
        if install_requirements("requirements.txt"):
            verify_installation()
            print("\n🎉 Installation completed successfully!")
            return
    
    # Fallback to essential packages
    print("\n📦 Installing essential packages individually...")
    install_essential_packages()
    verify_installation()
    
    print("\n🎉 Installation completed!")
    print("\n📋 Next steps:")
    print("1. Configure your .env file with API keys")
    print("2. Place your serviceAccountKey.json file")
    print("3. Run: uvicorn app:app --reload")

if __name__ == "__main__":
    main()
