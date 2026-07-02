#!/bin/bash

# RAG Service Local Test Runner
# 간단한 로컬 테스트 실행 스크립트

set -e

echo "======================================================================="
echo "🧪 RAG Service Local Test"
echo "======================================================================="
echo ""

# Check if services are needed
echo "📋 Checking requirements..."
echo ""

# Option 1: Try to start with minimal setup
echo "Option 1: Minimal Setup (Health Check Only)"
echo "  - No database required"
echo "  - No MinIO required"
echo "  - Only tests basic API endpoints"
echo ""

# Option 2: Full setup with Docker
echo "Option 2: Full Setup with Docker (Recommended)"
echo "  - PostgreSQL with pgvector"
echo "  - MinIO object storage"
echo "  - Complete API testing"
echo ""
echo "  Commands:"
echo "  $ cd ../docker-compose-dev-spring"
echo "  $ docker-compose up -d postgres minio rag-service"
echo "  $ cd ../rag-service"
echo "  $ python3 test_api_comprehensive.py"
echo ""

# Option 3: Manual setup
echo "Option 3: Manual Setup"
echo "  1. Start PostgreSQL with pgvector extension"
echo "  2. Start MinIO server"
echo "  3. Install Python dependencies:"
echo "     $ pip3 install -r requirements.txt"
echo "  4. Run FastAPI server:"
echo "     $ uvicorn app.main:app --host 0.0.0.0 --port 8001"
echo "  5. Run tests:"
echo "     $ python3 test_api_comprehensive.py"
echo ""

# Check if user wants to run minimal test
read -p "Run minimal health check test? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting minimal test..."

    # Create a simple test server
    python3 << 'EOF'
from fastapi import FastAPI
import uvicorn
import sys

app = FastAPI(title="RAG Service (Test Mode)")

@app.get("/")
def root():
    return {"service": "RAG Service", "version": "0.1.0", "status": "running", "mode": "test"}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "RAG Service", "version": "0.1.0"}

@app.get("/api/v1/info")
def api_info():
    return {
        "api_version": "v1",
        "endpoints": {"health": "/health", "docs": "/docs"},
        "features": {"document_upload": "mock", "vector_search": "mock"}
    }

if __name__ == "__main__":
    print("✅ Starting test server on http://localhost:8001")
    print("📝 Available endpoints:")
    print("   - GET /health")
    print("   - GET /")
    print("   - GET /api/v1/info")
    print("   - GET /docs")
    print("")
    print("🧪 Run tests in another terminal:")
    print("   $ curl http://localhost:8001/health")
    print("")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
    except KeyboardInterrupt:
        print("\n\n✋ Server stopped")
        sys.exit(0)
EOF

else
    echo ""
    echo "ℹ️  Please choose one of the options above to run full tests."
    echo ""
fi
