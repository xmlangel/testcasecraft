"""
RAG Service - Embedding & Search Integration Test
Tests the complete workflow:
1. Upload document
2. Analyze document (create chunks)
3. Generate embeddings
4. Search similar chunks
"""

import requests
import json
import time
from pathlib import Path

# API configuration
BASE_URL = "http://localhost:8001"
API_V1 = f"{BASE_URL}/api/v1"

# Test data
TEST_PROJECT_ID = "550e8400-e29b-41d4-a716-446655440000"  # UUID format
TEST_FILE_PATH = "/tmp/test-pypdf2.txt"

def create_test_file():
    """Create a simple test file"""
    test_content = """# PyPDF2 Parser Test Document

This document tests explicit PyPDF2 parser selection.

Testing: ?parser=pypdf2

Expected parser: pypdf2
"""
    with open(TEST_FILE_PATH, "w") as f:
        f.write(test_content)
    print(f"✅ Created test file: {TEST_FILE_PATH}")

def test_1_upload_document():
    """Step 1: Upload a document"""
    print("\n" + "="*80)
    print("Step 1: Upload Document")
    print("="*80)

    url = f"{API_V1}/documents/upload"

    with open(TEST_FILE_PATH, 'rb') as f:
        files = {'file': ('test-pypdf2.txt', f, 'text/plain')}
        data = {'project_id': TEST_PROJECT_ID}

        response = requests.post(url, files=files, data=data)

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

    assert response.status_code in [200, 201], f"Upload failed: {response.text}"
    document_id = response.json()['id']
    print(f"✅ Document uploaded successfully: {document_id}")

    return document_id

def test_2_analyze_document(document_id):
    """Step 2: Analyze document to create chunks"""
    print("\n" + "="*80)
    print("Step 2: Analyze Document")
    print("="*80)

    url = f"{API_V1}/documents/{document_id}/analyze"

    payload = {
        "chunk_size": 500,
        "chunk_overlap": 50
    }

    response = requests.post(url, json=payload)

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

    assert response.status_code == 200, f"Analysis failed: {response.text}"
    result = response.json()
    assert result['total_chunks'] > 0, "No chunks created"
    print(f"✅ Document analyzed: {result['total_chunks']} chunks created")

    return result

def test_3_generate_embeddings(document_id):
    """Step 3: Generate embeddings for all chunks"""
    print("\n" + "="*80)
    print("Step 3: Generate Embeddings")
    print("="*80)

    url = f"{API_V1}/embeddings/generate"

    payload = {
        "document_id": document_id
    }

    response = requests.post(url, json=payload)

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

    assert response.status_code == 200, f"Embedding generation failed: {response.text}"
    result = response.json()
    assert result['embeddings_generated'] > 0, "No embeddings generated"
    print(f"✅ Embeddings generated: {result['embeddings_generated']} embeddings")

    return result

def test_4_search_similar(query_text):
    """Step 4: Search for similar chunks"""
    print("\n" + "="*80)
    print("Step 4: Search Similar Chunks")
    print("="*80)

    url = f"{API_V1}/search/similar"

    payload = {
        "query_text": query_text,
        "project_id": TEST_PROJECT_ID,
        "similarity_threshold": 0.5,
        "max_results": 5
    }

    response = requests.post(url, json=payload)

    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

    assert response.status_code == 200, f"Search failed: {response.text}"
    result = response.json()
    print(f"✅ Search completed: {result['total_results']} results found")

    # Display results
    if result['results']:
        print("\nSearch Results:")
        for i, res in enumerate(result['results'], 1):
            print(f"\n--- Result {i} ---")
            print(f"Similarity Score: {res['similarity_score']:.4f}")
            print(f"File: {res['file_name']}")
            print(f"Chunk Index: {res['chunk_index']}")
            print(f"Text Preview: {res['chunk_text'][:100]}...")

    return result

def run_integration_test():
    """Run complete integration test"""
    print("\n" + "="*80)
    print("RAG Service - Embedding & Search Integration Test")
    print("="*80)

    try:
        # Step 0: Create test file
        create_test_file()

        # Step 1: Upload document
        document_id = test_1_upload_document()

        # Wait a bit for file processing
        time.sleep(1)

        # Step 2: Analyze document
        analysis_result = test_2_analyze_document(document_id)

        # Wait for analysis to complete
        time.sleep(1)

        # Step 3: Generate embeddings
        embedding_result = test_3_generate_embeddings(document_id)

        # Wait for embedding generation
        time.sleep(2)

        # Step 4: Search similar chunks
        search_queries = [
            "PyPDF2 parser",
            "parser test",
            "document testing"
        ]

        for query in search_queries:
            print(f"\n📝 Query: {query}")
            search_result = test_4_search_similar(query)

        print("\n" + "="*80)
        print("✅ All Integration Tests Passed!")
        print("="*80)

        return True

    except Exception as e:
        print("\n" + "="*80)
        print(f"❌ Integration Test Failed: {str(e)}")
        print("="*80)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_integration_test()
    exit(0 if success else 1)
