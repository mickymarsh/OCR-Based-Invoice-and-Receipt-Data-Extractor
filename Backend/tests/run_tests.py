#!/usr/bin/env python
"""
Test Runner Script

This script runs all tests for the OCR-Based Invoice and Receipt Data Extractor backend.
It provides a nice colorful interface and summary of test results.

Usage:
    python run_tests.py [OPTIONS]

Options:
    --api-only       Run only API endpoint tests
    --recovery       Run recovery tests to verify system after recovery
    --verbose, -v    Show verbose test output
    --help, -h       Show this help message
"""

import os
import sys
import subprocess
import argparse
import time
from pathlib import Path

try:
    from colorama import Fore, Style, init
    init()  # Initialize colorama
except ImportError:
    # Create dummy colorama classes if not installed
    class DummyFore:
        def __getattr__(self, name):
            return ""
    class DummyStyle:
        def __getattr__(self, name):
            return ""
    Fore = DummyFore()
    Style = DummyStyle()

# Ensure we're running from the Backend directory
script_dir = Path(__file__).parent
os.chdir(script_dir.parent)

def print_banner():
    """Print a nice banner for the test runner"""
    banner = f"""
{Fore.CYAN}╔══════════════════════════════════════════════════════════╗
║                    API TEST RUNNER                        ║
║        OCR-Based Invoice and Receipt Data Extractor       ║
╚══════════════════════════════════════════════════════════╝{Style.RESET_ALL}
"""
    print(banner)

def check_dependencies():
    """Check that all required dependencies are installed"""
    required_packages = ["pytest", "requests", "colorama"]
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"{Fore.YELLOW}Missing required packages: {', '.join(missing)}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Please install them using:{Style.RESET_ALL}")
        print(f"{Fore.GREEN}pip install {' '.join(missing)}{Style.RESET_ALL}")
        return False
    
    return True

def check_server_running():
    """Check if the FastAPI server is running"""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        # Try to connect to localhost:8000
        s.connect(("localhost", 8000))
        s.close()
        return True
    except socket.error:
        s.close()
        print(f"{Fore.RED}ERROR: FastAPI server is not running!{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Please start the server with:{Style.RESET_ALL}")
        print(f"{Fore.GREEN}uvicorn app:app --reload{Style.RESET_ALL}")
        return False

def run_api_tests(verbose=False):
    """Run API endpoint tests using pytest"""
    print(f"\n{Fore.CYAN}Running API endpoint tests...{Style.RESET_ALL}")
    
    cmd = ["python", "-m", "pytest", "tests/test_api_endpoints.py"]
    if verbose:
        cmd.append("-v")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"{Fore.GREEN}All API tests passed!{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}Some API tests failed!{Style.RESET_ALL}")
    
    if verbose or result.returncode != 0:
        print("\n" + result.stdout)
        if result.stderr:
            print(f"{Fore.RED}Errors:{Style.RESET_ALL}")
            print(result.stderr)
    
    return result.returncode == 0

def run_recovery_tests():
    """Run API recovery test script"""
    print(f"\n{Fore.CYAN}Running API recovery tests...{Style.RESET_ALL}")
    
    cmd = ["python", "tests/api_recovery_test.py"]
    result = subprocess.run(cmd)
    
    if result.returncode == 0:
        print(f"{Fore.GREEN}All API recovery tests passed!{Style.RESET_ALL}")
        return True
    else:
        print(f"{Fore.YELLOW}Some API recovery tests failed.{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Check the output above for details on which endpoints failed.{Style.RESET_ALL}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Run tests for OCR backend")
    parser.add_argument("--api-only", action="store_true", help="Run only API endpoint tests")
    parser.add_argument("--recovery", action="store_true", help="Run recovery tests")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show verbose test output")
    args = parser.parse_args()
    
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Check if server is running
    if not check_server_running():
        return 1
    
    all_passed = True
    
    # Run tests based on arguments
    if args.recovery:
        run_recovery_tests()
    elif args.api_only:
        all_passed = run_api_tests(args.verbose)
    else:
        # Run all tests by default
        all_passed = run_api_tests(args.verbose)
        if all_passed:
            run_recovery_tests()
    
    if all_passed:
        print(f"\n{Fore.GREEN}✅ All tests completed successfully!{Style.RESET_ALL}")
        return 0
    else:
        print(f"\n{Fore.RED}❌ Some tests failed!{Style.RESET_ALL}")
        return 1

if __name__ == "__main__":
    sys.exit(main())