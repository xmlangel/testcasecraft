#!/usr/bin/env python3
"""
Quick Test for RAG Service

로컬에서 빠르게 테스트할 수 있는 간단한 스크립트입니다.
실제 데이터베이스나 MinIO 없이 API 구조만 검증합니다.
"""

import subprocess
import sys
import time
import requests
from multiprocessing import Process

def start_mock_server():
    """Start a minimal FastAPI server for testing"""
    from fastapi import FastAPI
    import uvicorn

    app = FastAPI(title="RAG Service (Test Mode)")

    @app.get("/")
    def root():
        return {
            "service": "RAG Service",
            "version": "0.1.0",
            "status": "running",
            "environment": "test"
        }

    @app.get("/health")
    def health_check():
        return {
            "status": "healthy",
            "service": "RAG Service",
            "version": "0.1.0"
        }

    @app.get("/api/v1/info")
    def api_info():
        return {
            "api_version": "v1",
            "endpoints": {
                "health": "/health",
                "docs": "/docs",
                "redoc": "/redoc"
            },
            "features": {
                "document_upload": "enabled",
                "vector_search": "enabled",
                "similar_testcases": "enabled"
            }
        }

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="error")


def test_endpoints():
    """Test basic endpoints"""
    print("\n" + "="*70)
    print("🧪 Testing RAG Service Endpoints")
    print("="*70 + "\n")

    base_url = "http://localhost:8001"

    tests = [
        ("GET /health", f"{base_url}/health"),
        ("GET /", f"{base_url}/"),
        ("GET /api/v1/info", f"{base_url}/api/v1/info"),
    ]

    passed = 0
    failed = 0

    for test_name, url in tests:
        try:
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                print(f"✓ {test_name}: PASS ({response.status_code})")
                passed += 1
            else:
                print(f"✗ {test_name}: FAIL ({response.status_code})")
                failed += 1
        except Exception as e:
            print(f"✗ {test_name}: ERROR ({e})")
            failed += 1

    print("\n" + "="*70)
    print(f"Results: {passed} passed, {failed} failed")
    print("="*70 + "\n")

    return failed == 0


def main():
    print("\n" + "="*70)
    print("🚀 RAG Service Quick Test")
    print("="*70)
    print("\n📋 This script will:")
    print("  1. Start a minimal FastAPI server on port 8001")
    print("  2. Test basic endpoints (/, /health, /api/v1/info)")
    print("  3. Show results")
    print("\n⚠️  Note: This is a mock server for quick testing.")
    print("   For full API testing, use Docker Compose setup.")
    print("\n" + "="*70 + "\n")

    input("Press Enter to continue or Ctrl+C to cancel...")

    # Start server in background
    print("\n🔄 Starting mock server...")
    server_process = Process(target=start_mock_server)
    server_process.start()

    # Wait for server to start
    time.sleep(2)

    try:
        # Run tests
        success = test_endpoints()

        # Keep server running
        print("\n📝 Server is running at http://localhost:8001")
        print("   - Swagger UI: http://localhost:8001/docs")
        print("   - ReDoc: http://localhost:8001/redoc")
        print("\nPress Ctrl+C to stop the server...")

        server_process.join()

    except KeyboardInterrupt:
        print("\n\n✋ Stopping server...")
        server_process.terminate()
        server_process.join()
        print("✅ Server stopped\n")
        return 0 if success else 1

    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        server_process.terminate()
        server_process.join()
        return 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n✋ Cancelled by user\n")
        sys.exit(0)
