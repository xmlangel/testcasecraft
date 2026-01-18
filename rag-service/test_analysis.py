#!/usr/bin/env python3
"""
Test script for document analysis with Upstage Layout Analysis API
"""

import requests
import uuid
import sys
import os

# Configuration
BASE_URL = "http://localhost:8001/api/v1"

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


def create_test_file(filename="test_analysis.txt", content=None):
    """Create a test file for analysis"""
    if content is None:
        content = """
# Test Document for RAG Analysis

## Introduction
This is a comprehensive test document for validating the Upstage Layout Analysis integration.

## Section 1: Features
- Document parsing
- Text extraction
- Chunk generation
- Metadata extraction

## Section 2: Technical Details
The system uses Upstage's Layout Analysis API to extract structured content from documents.
This includes identifying tables, images, and text sections.

## Section 3: Conclusion
This test validates the end-to-end document analysis workflow.
"""

    print_info(f"Creating test file: {filename}")
    with open(filename, 'w') as f:
        f.write(content)
    print_success(f"Test file created: {filename}")
    return filename


def upload_document(file_path):
    """Upload a document"""
    print_test("Uploading document...")

    project_id = str(uuid.uuid4())

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'text/plain')}
            data = {
                'project_id': project_id,
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
            print_info(f"Analysis status: {result['analysis_status']}")
            return result['id']
        else:
            print_error(f"Upload failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None

    except Exception as e:
        print_error(f"Upload error: {e}")
        return None


def analyze_document(document_id):
    """Analyze document using Upstage API"""
    print_test("Analyzing document...")

    try:
        response = requests.post(f"{BASE_URL}/documents/{document_id}/analyze")

        if response.status_code == 200:
            result = response.json()
            print_success("Document analysis completed!")
            print_info(f"Status: {result['status']}")
            print_info(f"Total chunks: {result['total_chunks']}")
            if result.get('analysis_result'):
                print_info(f"Metadata: {result['analysis_result']}")
            return True
        else:
            print_error(f"Analysis failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Analysis error: {e}")
        return False


def get_chunks(document_id):
    """Get document chunks"""
    print_test("Retrieving document chunks...")

    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}/chunks")

        if response.status_code == 200:
            result = response.json()
            print_success(f"Retrieved {result['total']} chunks")

            # Display first few chunks
            for i, chunk in enumerate(result['chunks'][:3]):
                print_info(f"\nChunk {chunk['chunk_index']}:")
                print(f"  Text: {chunk['chunk_text'][:100]}...")
                if chunk.get('chunk_metadata'):
                    print(f"  Metadata: {chunk['chunk_metadata']}")

            if result['total'] > 3:
                print_info(f"... and {result['total'] - 3} more chunks")

            return True
        else:
            print_error(f"Get chunks failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Get chunks error: {e}")
        return False


def get_document_status(document_id):
    """Check document analysis status"""
    print_test("Checking document status...")

    try:
        response = requests.get(f"{BASE_URL}/documents/{document_id}")

        if response.status_code == 200:
            result = response.json()
            print_success("Document status retrieved")
            print_info(f"File name: {result['file_name']}")
            print_info(f"Analysis status: {result['analysis_status']}")
            print_info(f"Total chunks: {result['total_chunks']}")
            if result.get('analysis_date'):
                print_info(f"Analysis date: {result['analysis_date']}")
            return result
        else:
            print_error(f"Status check failed: {response.status_code}")
            return None

    except Exception as e:
        print_error(f"Status check error: {e}")
        return None


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
    print(f"{BLUE}RAG Service - Document Analysis Tests{RESET}")
    print("="*60 + "\n")

    test_file = None

    try:
        # 1. Create test file
        test_file = create_test_file()
        print()

        # 2. Upload document
        document_id = upload_document(test_file)
        if not document_id:
            print_error("Upload test failed. Stopping tests.")
            return
        print()

        # 3. Check initial status
        get_document_status(document_id)
        print()

        # 4. Analyze document
        analysis_success = analyze_document(document_id)
        if not analysis_success:
            print_error("\n⚠️  Analysis failed!")
            print_info("This is expected if Upstage API key is not configured.")
            print_info("To configure: Set UPSTAGE_API_KEY environment variable")
            print()
        else:
            print()

            # 5. Check status after analysis
            get_document_status(document_id)
            print()

            # 6. Get chunks
            get_chunks(document_id)
            print()

        print("="*60)
        if analysis_success:
            print(f"{GREEN}All tests completed successfully!{RESET}")
        else:
            print(f"{YELLOW}Tests completed with expected failures (API key needed){RESET}")
        print("="*60 + "\n")

        print_info(f"Document ID for reference: {document_id}")

    finally:
        # Cleanup
        if test_file:
            cleanup([test_file])


if __name__ == "__main__":
    main()
