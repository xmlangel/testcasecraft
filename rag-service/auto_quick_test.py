#!/usr/bin/env python3
"""Auto test runner for mock server"""
import time
import requests
import sys
from multiprocessing import Process

def start_mock_server():
    """Start minimal FastAPI server"""
    from fastapi import FastAPI
    import uvicorn

    app = FastAPI(title="RAG Service (Test Mode)")

    @app.get("/")
    def root():
        return {"service": "RAG Service", "version": "0.1.0", "status": "running"}

    @app.get("/health")
    def health():
        return {"status": "healthy", "service": "RAG Service", "version": "0.1.0"}

    @app.get("/api/v1/info")
    def info():
        return {"api_version": "v1", "features": {"document_upload": "enabled"}}

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="error")

def test_endpoints():
    """Test basic endpoints"""
    print("\n" + "="*70)
    print("🧪 Testing Mock RAG Service")
    print("="*70 + "\n")

    tests = [
        ("GET /health", "http://localhost:8001/health"),
        ("GET /", "http://localhost:8001/"),
        ("GET /api/v1/info", "http://localhost:8001/api/v1/info"),
    ]

    passed = 0
    failed = 0

    for test_name, url in tests:
        try:
            response = requests.get(url, timeout=2)
            data = response.json()
            print(f"✓ {test_name}")
            print(f"  Status: {response.status_code}")
            print(f"  Response: {data}")
            passed += 1
        except Exception as e:
            print(f"✗ {test_name}")
            print(f"  Error: {e}")
            failed += 1

    print("\n" + "="*70)
    print(f"Results: {passed}/{len(tests)} passed")
    print("="*70 + "\n")

    return failed == 0

# Start server
print("🚀 Starting mock server on port 8001...")
server = Process(target=start_mock_server)
server.start()

# Wait for startup
time.sleep(2)

try:
    # Run tests
    success = test_endpoints()
    sys.exit(0 if success else 1)
finally:
    # Cleanup
    print("🛑 Stopping server...")
    server.terminate()
    server.join()
    print("✅ Server stopped\n")
