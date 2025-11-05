#!/usr/bin/env python3
"""
Comprehensive API Test Suite for RAG Service

Tests all endpoints:
- Documents API
- Embeddings API
- Conversations API
- Search API

RAG 서비스의 모든 API 엔드포인트 테스트
"""

import requests
import json
import time
import os
import sys
from uuid import uuid4
from typing import Optional, Dict, Any

# Configuration
BASE_URL = "http://localhost:8001/api/v1"
HEALTH_URL = "http://localhost:8001/health"

# Test data
TEST_PROJECT_ID = str(uuid4())
TEST_UPLOADED_BY = "test_user"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0
}


def print_header(message: str):
    """Print section header"""
    print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
    print(f"{BOLD}{CYAN}{message}{RESET}")
    print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")


def print_test(message: str):
    """Print test description"""
    print(f"{BLUE}[TEST]{RESET} {message}")


def print_success(message: str):
    """Print success message"""
    print(f"{GREEN}✓{RESET} {message}")


def print_error(message: str):
    """Print error message"""
    print(f"{RED}✗{RESET} {message}")


def print_info(message: str):
    """Print info message"""
    print(f"{YELLOW}ℹ{RESET} {message}")


def record_test(passed: bool):
    """Record test result"""
    test_results["total"] += 1
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1


def print_test_summary():
    """Print final test summary"""
    print_header("TEST SUMMARY")
    print(f"Total tests: {test_results['total']}")
    print(f"{GREEN}Passed: {test_results['passed']}{RESET}")
    print(f"{RED}Failed: {test_results['failed']}{RESET}")
    print(f"{YELLOW}Skipped: {test_results['skipped']}{RESET}")

    if test_results['failed'] == 0:
        print(f"\n{GREEN}{BOLD}🎉 All tests passed!{RESET}")
        return True
    else:
        print(f"\n{RED}{BOLD}❌ Some tests failed{RESET}")
        return False


# ============================================================================
# Health Check
# ============================================================================

def test_health_check() -> bool:
    """Test health check endpoint"""
    print_test("Testing health check endpoint...")
    try:
        response = requests.get(HEALTH_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check OK: {data.get('status', 'N/A')}")
            record_test(True)
            return True
        else:
            print_error(f"Health check failed: {response.status_code}")
            record_test(False)
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        record_test(False)
        return False


# ============================================================================
# Documents API Tests
# ============================================================================

def create_test_file(filename: str = "test_document.txt",
                     content: str = "This is a test document for RAG service testing. " * 50) -> str:
    """Create a test file for upload"""
    print_info(f"Creating test file: {filename}")
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print_success(f"Test file created: {filename} ({len(content)} bytes)")
    return filename


def test_upload_document(file_path: str) -> Optional[str]:
    """Test document upload"""
    print_test("Testing document upload...")

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'text/plain')}
            data = {
                'project_id': TEST_PROJECT_ID,
                'uploaded_by': TEST_UPLOADED_BY
            }

            response = requests.post(
                f"{BASE_URL}/documents/upload",
                files=files,
                data=data,
                timeout=30
            )

        if response.status_code == 201:
            result = response.json()
            document_id = result['id']
            print_success(f"Document uploaded successfully!")
            print_info(f"  Document ID: {document_id}")
            print_info(f"  File name: {result['file_name']}")
            print_info(f"  File size: {result['file_size']} bytes")
            record_test(True)
            return document_id
        else:
            print_error(f"Upload failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return None

    except Exception as e:
        print_error(f"Upload error: {e}")
        record_test(False)
        return None


def test_get_document(document_id: str) -> bool:
    """Test getting document metadata"""
    print_test(f"Testing get document metadata for {document_id}...")

    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}", timeout=10)

        if response.status_code == 200:
            result = response.json()
            print_success("Document metadata retrieved successfully!")
            print_info(f"  File name: {result.get('file_name', 'N/A')}")
            print_info(f"  Analysis status: {result.get('analysis_status', 'N/A')}")
            record_test(True)
            return True
        else:
            print_error(f"Get document failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Get document error: {e}")
        record_test(False)
        return False


def test_list_documents() -> bool:
    """Test listing documents"""
    print_test("Testing list documents...")

    try:
        response = requests.get(
            f"{BASE_URL}/documents/",
            params={"project_id": TEST_PROJECT_ID},
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            total = result.get('total', 0)
            print_success(f"Documents listed successfully! Total: {total}")
            for doc in result.get('documents', []):
                print_info(f"  - {doc.get('file_name', 'N/A')} (ID: {doc.get('id', 'N/A')})")
            record_test(True)
            return True
        else:
            print_error(f"List documents failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"List documents error: {e}")
        record_test(False)
        return False


def test_list_documents_pagination() -> bool:
    """Test listing documents with pagination"""
    print_test("Testing list documents with pagination (page/page_size)...")

    try:
        response = requests.get(
            f"{BASE_URL}/documents/",
            params={
                "project_id": TEST_PROJECT_ID,
                "page": 1,
                "page_size": 10
            },
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            print_success(f"Pagination test passed!")
            print_info(f"  Page: {result.get('page', 'N/A')}")
            print_info(f"  Page size: {result.get('page_size', 'N/A')}")
            print_info(f"  Total: {result.get('total', 0)}")
            record_test(True)
            return True
        else:
            print_error(f"Pagination test failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Pagination test error: {e}")
        record_test(False)
        return False


def test_analyze_document(document_id: str) -> bool:
    """Test document analysis"""
    print_test(f"Testing document analysis for {document_id}...")

    try:
        response = requests.post(
            f"{BASE_URL}/documents/{document_id}/analyze",
            params={"parser": "pymupdf"},
            timeout=10
        )

        if response.status_code == 202:
            result = response.json()
            print_success("Document analysis started!")
            print_info(f"  Status: {result.get('status', 'N/A')}")
            print_info(f"  Message: {result.get('message', 'N/A')}")

            # Wait for analysis to complete
            print_info("Waiting for analysis to complete...")
            max_wait = 30  # seconds
            for i in range(max_wait):
                time.sleep(1)
                doc_response = requests.get(f"{BASE_URL}/documents/{document_id}", timeout=10)
                if doc_response.status_code == 200:
                    doc_data = doc_response.json()
                    status = doc_data.get('analysis_status', 'unknown')
                    if status == 'completed':
                        print_success(f"Analysis completed! Total chunks: {doc_data.get('total_chunks', 0)}")
                        record_test(True)
                        return True
                    elif status == 'failed':
                        print_error("Analysis failed!")
                        record_test(False)
                        return False

            print_error("Analysis timeout")
            record_test(False)
            return False
        else:
            print_error(f"Analysis start failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Analysis error: {e}")
        record_test(False)
        return False


def test_get_document_chunks(document_id: str) -> bool:
    """Test getting document chunks"""
    print_test(f"Testing get document chunks for {document_id}...")

    try:
        response = requests.get(
            f"{BASE_URL}/documents/{document_id}/chunks",
            params={"skip": 0, "limit": 10},
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            total = result.get('total', 0)
            chunks = result.get('chunks', [])
            print_success(f"Chunks retrieved successfully! Total: {total}, Retrieved: {len(chunks)}")
            if chunks:
                first_chunk = chunks[0]
                print_info(f"  First chunk index: {first_chunk.get('chunk_index', 'N/A')}")
                print_info(f"  First chunk text preview: {first_chunk.get('chunk_text', '')[:50]}...")
            record_test(True)
            return True
        else:
            print_error(f"Get chunks failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Get chunks error: {e}")
        record_test(False)
        return False


def test_download_document(document_id: str, save_path: str = "downloaded_test.txt") -> bool:
    """Test document download"""
    print_test(f"Testing document download for {document_id}...")

    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}/download", timeout=10)

        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print_success(f"Document downloaded to {save_path}")
            print_info(f"  Downloaded size: {len(response.content)} bytes")
            record_test(True)
            return True
        else:
            print_error(f"Download failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Download error: {e}")
        record_test(False)
        return False


def test_update_document(document_id: str) -> bool:
    """Test document update (PATCH)"""
    print_test(f"Testing document update for {document_id}...")

    try:
        payload = {
            "metadata": {
                "custom_field": "test_value",
                "updated": "true"
            }
        }

        response = requests.patch(
            f"{BASE_URL}/documents/{document_id}",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            print_success("Document updated successfully!")
            print_info(f"  Document ID: {result.get('id', 'N/A')}")
            print_info(f"  Analysis status: {result.get('analysis_status', 'N/A')}")
            if result.get('meta_data'):
                print_info(f"  Metadata: {result.get('meta_data')}")
            record_test(True)
            return True
        else:
            print_error(f"Update failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Update error: {e}")
        record_test(False)
        return False


# ============================================================================
# Embeddings API Tests
# ============================================================================

def test_generate_embeddings(document_id: str) -> bool:
    """Test embedding generation"""
    print_test(f"Testing embedding generation for {document_id}...")

    try:
        payload = {"document_id": document_id}
        response = requests.post(
            f"{BASE_URL}/embeddings/generate",
            json=payload,
            timeout=10
        )

        if response.status_code == 202:
            result = response.json()
            print_success("Embedding generation started!")
            print_info(f"  Message: {result.get('message', 'N/A')}")
            print_info(f"  Total chunks: {result.get('total_chunks', 0)}")

            # Wait for embeddings to complete
            print_info("Waiting for embeddings to complete...")
            print_info(f"  Checking status endpoint: {BASE_URL}/embeddings/status/{document_id}")
            max_wait = 90  # seconds (increased from 60)
            check_interval = 3  # seconds
            max_attempts = max_wait // check_interval

            for i in range(max_attempts):
                time.sleep(check_interval)
                try:
                    status_response = requests.get(
                        f"{BASE_URL}/embeddings/status/{document_id}",
                        timeout=10
                    )
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        status = status_data.get('status', 'unknown')
                        progress = status_data.get('progress_percentage', 0)
                        embedded = status_data.get('embedded_chunks', 0)
                        total = status_data.get('total_chunks', 0)
                        print_info(f"  [{i+1}/{max_attempts}] Progress: {progress:.1f}% ({embedded}/{total}) - Status: {status}")

                        if status == 'completed':
                            print_success(f"Embeddings completed! {embedded} chunks embedded")
                            record_test(True)
                            return True
                        elif status == 'failed':
                            print_error(f"Embeddings failed: {status_data.get('error_message', 'Unknown error')}")
                            record_test(False)
                            return False
                    else:
                        print_error(f"  [{i+1}/{max_attempts}] Status check failed: {status_response.status_code}")
                        if i == 0:  # Only print response on first error
                            print_error(f"  Response: {status_response.text}")
                except Exception as status_error:
                    print_error(f"  [{i+1}/{max_attempts}] Status check error: {status_error}")

            print_error(f"Embedding generation timeout after {max_wait} seconds")
            print_info("  Note: Embedding generation may still be running in background")
            record_test(False)
            return False
        else:
            print_error(f"Embedding generation start failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Embedding generation error: {e}")
        record_test(False)
        return False


def test_get_embedding_status(document_id: str) -> bool:
    """Test getting embedding status"""
    print_test(f"Testing get embedding status for {document_id}...")

    try:
        response = requests.get(f"{BASE_URL}/embeddings/status/{document_id}", timeout=10)

        if response.status_code == 200:
            result = response.json()
            print_success("Embedding status retrieved!")
            print_info(f"  Status: {result.get('status', 'N/A')}")
            print_info(f"  Progress: {result.get('progress_percentage', 0):.1f}%")
            print_info(f"  Embedded chunks: {result.get('embedded_chunks', 0)}/{result.get('total_chunks', 0)}")
            record_test(True)
            return True
        else:
            print_error(f"Get embedding status failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Get embedding status error: {e}")
        record_test(False)
        return False


# ============================================================================
# Conversations API Tests
# ============================================================================

def test_create_conversation_message() -> Optional[str]:
    """Test creating conversation message"""
    print_test("Testing create conversation message...")

    message_id = str(uuid4())
    thread_id = str(uuid4())

    try:
        payload = {
            "message_id": message_id,
            "project_id": TEST_PROJECT_ID,
            "thread_id": thread_id,
            "role": "assistant",
            "question": "What is a test case?",
            "answer": "A test case is a set of conditions or variables under which a tester will determine whether an application is working correctly.",
            "combined_text": "Question: What is a test case? Answer: A test case is a set of conditions or variables under which a tester will determine whether an application is working correctly.",
            "metadata": {
                "threadTitle": "Test Case Discussion",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }

        response = requests.post(
            f"{BASE_URL}/conversations/messages",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            print_success("Conversation message created!")
            print_info(f"  Message ID: {result.get('message_id', 'N/A')}")
            print_info(f"  Status: {result.get('status', 'N/A')}")
            record_test(True)
            return message_id
        else:
            print_error(f"Create conversation message failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return None

    except Exception as e:
        print_error(f"Create conversation message error: {e}")
        record_test(False)
        return None


def test_delete_conversation_message(message_id: str) -> bool:
    """Test deleting conversation message"""
    print_test(f"Testing delete conversation message {message_id}...")

    try:
        response = requests.delete(
            f"{BASE_URL}/conversations/messages/{message_id}",
            timeout=10
        )

        if response.status_code == 204:
            print_success("Conversation message deleted!")
            record_test(True)
            return True
        else:
            print_error(f"Delete conversation message failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Delete conversation message error: {e}")
        record_test(False)
        return False


# ============================================================================
# Search API Tests
# ============================================================================

def test_search_similar_chunks(document_id: str) -> bool:
    """Test searching for similar chunks"""
    print_test("Testing search for similar chunks...")

    try:
        payload = {
            "query_text": "test document",
            "project_id": TEST_PROJECT_ID,
            "similarity_threshold": 0.3,
            "max_results": 5
        }

        response = requests.post(
            f"{BASE_URL}/search/similar",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            total_results = result.get('total_results', 0)
            results = result.get('results', [])
            print_success(f"Search completed! Found {total_results} results")

            for i, res in enumerate(results[:3]):  # Show top 3
                print_info(f"  Result {i+1}:")
                print_info(f"    Similarity: {res.get('similarity_score', 0):.4f}")
                print_info(f"    Source type: {res.get('source_type', 'N/A')}")
                print_info(f"    Text preview: {res.get('chunk_text', '')[:50]}...")

            record_test(True)
            return True
        else:
            print_error(f"Search failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Search error: {e}")
        record_test(False)
        return False


def test_search_with_filters() -> bool:
    """Test search with various filters"""
    print_test("Testing search with filters...")

    try:
        payload = {
            "query_text": "test",
            "project_id": TEST_PROJECT_ID,
            "similarity_threshold": 0.5,
            "max_results": 10
        }

        response = requests.post(
            f"{BASE_URL}/search/similar",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            print_success(f"Search with filters completed! Found {result.get('total_results', 0)} results")
            record_test(True)
            return True
        else:
            print_error(f"Search with filters failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Search with filters error: {e}")
        record_test(False)
        return False


# ============================================================================
# Cleanup
# ============================================================================

def test_delete_document(document_id: str) -> bool:
    """Test document deletion"""
    print_test(f"Testing document deletion for {document_id}...")

    try:
        response = requests.delete(f"{BASE_URL}/documents/{document_id}", timeout=10)

        if response.status_code == 204:
            print_success("Document deleted!")
            record_test(True)
            return True
        else:
            print_error(f"Delete failed: {response.status_code}")
            record_test(False)
            return False

    except Exception as e:
        print_error(f"Delete error: {e}")
        record_test(False)
        return False


def cleanup_files(files: list):
    """Clean up test files"""
    print_info("\nCleaning up test files...")
    for file_path in files:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print_success(f"  Removed: {file_path}")
            except Exception as e:
                print_error(f"  Failed to remove {file_path}: {e}")


# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all tests"""
    print_header("RAG Service - Comprehensive API Test Suite")

    test_file = None
    downloaded_file = None
    document_id = None
    conversation_message_id = None

    try:
        # 1. Health Check
        print_header("1. Health Check")
        if not test_health_check():
            print_error("\nService is not running. Please start the RAG service first.")
            print_info("Start command: cd rag-service && uvicorn app.main:app --host 0.0.0.0 --port 8001")
            sys.exit(1)

        # 2. Documents API Tests
        print_header("2. Documents API Tests")

        # Create test file
        test_file = create_test_file()

        # Upload document
        document_id = test_upload_document(test_file)
        if not document_id:
            print_error("Document upload failed. Stopping tests.")
            return False

        # Get document
        test_get_document(document_id)

        # List documents
        test_list_documents()

        # List documents with pagination
        test_list_documents_pagination()

        # Analyze document
        test_analyze_document(document_id)

        # Get document chunks
        test_get_document_chunks(document_id)

        # Download document
        downloaded_file = "downloaded_test.txt"
        test_download_document(document_id, downloaded_file)

        # Update document
        test_update_document(document_id)

        # 3. Embeddings API Tests
        print_header("3. Embeddings API Tests")

        # Generate embeddings
        test_generate_embeddings(document_id)

        # Get embedding status
        test_get_embedding_status(document_id)

        # 4. Conversations API Tests
        print_header("4. Conversations API Tests")

        # Create conversation message
        conversation_message_id = test_create_conversation_message()

        # 5. Search API Tests
        print_header("5. Search API Tests")

        # Search similar chunks
        test_search_similar_chunks(document_id)

        # Search with filters
        test_search_with_filters()

        # 6. Cleanup Tests
        print_header("6. Cleanup Tests")

        # Delete conversation message
        if conversation_message_id:
            test_delete_conversation_message(conversation_message_id)

        # Delete document
        test_delete_document(document_id)

        # Print summary
        success = print_test_summary()
        return success

    except KeyboardInterrupt:
        print_error("\n\nTests interrupted by user")
        return False

    except Exception as e:
        print_error(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        # Cleanup files
        files_to_remove = [f for f in [test_file, downloaded_file] if f]
        if files_to_remove:
            cleanup_files(files_to_remove)


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
