#!/usr/bin/env python3
"""
Test script for PDF document analysis with Upstage Layout Analysis API
"""

import requests
import uuid
import sys
import os

# Configuration
BASE_URL = "http://localhost:8001/api/v1"
PDF_FILE = "test.pdf"  # 이미 복사한 PDF 파일 사용

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


def upload_pdf(file_path):
    """Upload a PDF document"""
    print_test("Uploading PDF document...")

    project_id = str(uuid.uuid4())

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/pdf')}
            data = {
                'project_id': project_id,
                'uploaded_by': 'pdf_test_user'
            }

            response = requests.post(
                f"{BASE_URL}/documents/upload",
                files=files,
                data=data
            )

        if response.status_code == 201:
            result = response.json()
            print_success("PDF document uploaded successfully!")
            print_info(f"Document ID: {result['id']}")
            print_info(f"File name: {result['file_name']}")
            print_info(f"File size: {result['file_size']} bytes")
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
    print_test("Analyzing PDF document with Upstage API...")

    try:
        response = requests.post(f"{BASE_URL}/documents/{document_id}/analyze")

        if response.status_code == 200:
            result = response.json()
            print_success("PDF document analysis completed!")
            print_info(f"Status: {result['status']}")
            print_info(f"Total chunks: {result['total_chunks']}")

            if result.get('analysis_result'):
                metadata = result['analysis_result']
                print_info(f"Pages analyzed: {metadata.get('pages', 'N/A')}")
                print_info(f"Elements extracted: {len(metadata.get('elements', []))}")

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

            # Display first chunk
            if result['total'] > 0:
                first_chunk = result['chunks'][0]
                print_info(f"\nFirst chunk preview:")
                print(f"  Index: {first_chunk['chunk_index']}")
                print(f"  Text (first 200 chars): {first_chunk['chunk_text'][:200]}...")
                print(f"  Metadata: {first_chunk.get('chunk_metadata', {})}")

            if result['total'] > 1:
                print_info(f"\n... and {result['total'] - 1} more chunks")

            return True
        else:
            print_error(f"Get chunks failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Get chunks error: {e}")
        return False


def main():
    """Run PDF analysis test"""
    print("\n" + "="*60)
    print(f"{BLUE}RAG Service - PDF Document Analysis Test{RESET}")
    print("="*60 + "\n")

    # Check if PDF file exists
    if not os.path.exists(PDF_FILE):
        print_error(f"PDF file not found: {PDF_FILE}")
        print_info("Please ensure test.pdf is in the current directory")
        return

    try:
        # 1. Upload PDF document
        document_id = upload_pdf(PDF_FILE)
        if not document_id:
            print_error("Upload test failed. Stopping tests.")
            return
        print()

        # 2. Analyze document
        analysis_success = analyze_document(document_id)
        print()

        if analysis_success:
            # 3. Get chunks
            get_chunks(document_id)
            print()

            print("="*60)
            print(f"{GREEN}✅ All PDF analysis tests completed successfully!{RESET}")
            print("="*60 + "\n")
        else:
            print("="*60)
            print(f"{RED}❌ PDF analysis test failed{RESET}")
            print("="*60 + "\n")
            print_info("Check if:")
            print_info("  1. Upstage API key is configured correctly")
            print_info("  2. RAG service is running (docker-compose up -d)")
            print_info("  3. PDF file is valid and not corrupted")

        print_info(f"Document ID for reference: {document_id}")

    except Exception as e:
        print_error(f"Test error: {e}")


if __name__ == "__main__":
    main()
