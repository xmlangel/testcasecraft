"""
Test script for RAG Service Document Upload API

This script tests the MinIO integration and document upload functionality.
"""

import requests
import os
import sys
from uuid import uuid4
import json

# Configuration
BASE_URL = "http://localhost:8001/api/v1"
TEST_PROJECT_ID = str(uuid4())

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_test(message):
    print(f"{BLUE}[TEST]{RESET} {message}")


def print_success(message):
    print(f"{GREEN}✓{RESET} {message}")


def print_error(message):
    print(f"{RED}✗{RESET} {message}")


def print_info(message):
    print(f"{YELLOW}ℹ{RESET} {message}")


def test_health_check():
    """Test health check endpoint"""
    print_test("Testing health check endpoint...")
    try:
        response = requests.get(f"http://localhost:8001/health")
        if response.status_code == 200:
            print_success(f"Health check OK: {response.json()}")
            return True
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False


def create_test_file(filename="test_document.txt", content="This is a test document for RAG service."):
    """Create a test file for upload"""
    print_info(f"Creating test file: {filename}")
    with open(filename, 'w') as f:
        f.write(content)
    print_success(f"Test file created: {filename}")
    return filename


def test_upload_document(file_path):
    """Test document upload"""
    print_test("Testing document upload...")

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'text/plain')}
            data = {
                'project_id': TEST_PROJECT_ID,
                'uploaded_by': 'test_user'
            }

            response = requests.post(
                f"{BASE_URL}/documents/upload",
                files=files,
                data=data
            )

        if response.status_code == 201:
            result = response.json()
            print_success("Document uploaded successfully!")
            print_info(f"Document ID: {result['id']}")
            print_info(f"File name: {result['file_name']}")
            print_info(f"File size: {result['file_size']} bytes")
            print_info(f"MinIO bucket: {result['minio_bucket']}")
            print_info(f"MinIO object key: {result['minio_object_key']}")
            return result['id']
        else:
            print_error(f"Upload failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None

    except Exception as e:
        print_error(f"Upload error: {e}")
        return None


def test_get_document(document_id):
    """Test getting document metadata"""
    print_test("Testing get document metadata...")

    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}")

        if response.status_code == 200:
            result = response.json()
            print_success("Document metadata retrieved successfully!")
            print_info(f"File name: {result['file_name']}")
            print_info(f"Analysis status: {result['analysis_status']}")
            return True
        else:
            print_error(f"Get document failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Get document error: {e}")
        return False


def test_download_document(document_id, save_path="downloaded_test.txt"):
    """Test document download"""
    print_test("Testing document download...")

    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}/download")

        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print_success(f"Document downloaded successfully to {save_path}")

            # Verify file content
            with open(save_path, 'r') as f:
                content = f.read()
                print_info(f"Downloaded content: {content[:50]}...")

            return True
        else:
            print_error(f"Download failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Download error: {e}")
        return False


def test_list_documents():
    """Test listing documents"""
    print_test("Testing list documents...")

    try:
        response = requests.get(f"{BASE_URL}/documents/?project_id={TEST_PROJECT_ID}")

        if response.status_code == 200:
            result = response.json()
            print_success(f"Documents listed successfully! Total: {result['total']}")
            for doc in result['documents']:
                print_info(f"- {doc['file_name']} (ID: {doc['id']})")
            return True
        else:
            print_error(f"List documents failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"List documents error: {e}")
        return False


def test_delete_document(document_id):
    """Test document deletion"""
    print_test("Testing document deletion...")

    try:
        response = requests.delete(f"{BASE_URL}/documents/{document_id}")

        if response.status_code == 204:
            print_success("Document deleted successfully!")
            return True
        else:
            print_error(f"Delete failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Delete error: {e}")
        return False


def cleanup(files):
    """Clean up test files"""
    print_info("Cleaning up test files...")
    for file_path in files:
        if os.path.exists(file_path):
            os.remove(file_path)
            print_success(f"Removed: {file_path}")


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print(f"{BLUE}RAG Service - Document Upload API Tests{RESET}")
    print("="*60 + "\n")

    # Test files
    test_file = None
    downloaded_file = None

    try:
        # 1. Health check
        if not test_health_check():
            print_error("Service is not running. Please start the RAG service first.")
            sys.exit(1)

        print()

        # 2. Create test file
        test_file = create_test_file()
        print()

        # 3. Upload document
        document_id = test_upload_document(test_file)
        if not document_id:
            print_error("Upload test failed. Stopping tests.")
            return
        print()

        # 4. Get document metadata
        test_get_document(document_id)
        print()

        # 5. List documents
        test_list_documents()
        print()

        # 6. Download document
        downloaded_file = "downloaded_test.txt"
        test_download_document(document_id, downloaded_file)
        print()

        # 7. Delete document
        test_delete_document(document_id)
        print()

        print("="*60)
        print(f"{GREEN}All tests completed!{RESET}")
        print("="*60 + "\n")

    finally:
        # Cleanup
        files_to_remove = [f for f in [test_file, downloaded_file] if f]
        if files_to_remove:
            cleanup(files_to_remove)


if __name__ == "__main__":
    main()
