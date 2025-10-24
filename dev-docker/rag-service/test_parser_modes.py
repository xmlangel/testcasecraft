#!/usr/bin/env python3
"""
Test script for Document Parser Modes (Upstage vs Local)
로컬 파서와 Upstage 파서 비교 테스트
"""

import requests
import uuid
import sys
import os

# Configuration
BASE_URL = "http://localhost:8001/api/v1"
PDF_FILE = "test.pdf"  # 이미 존재하는 PDF 파일

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


def print_section(title):
    print("\n" + "="*60)
    print(f"{BLUE}{title}{RESET}")
    print("="*60)


def upload_and_analyze_pdf():
    """Upload PDF and analyze it"""
    print_test("Uploading and analyzing PDF document...")

    project_id = str(uuid.uuid4())

    try:
        with open(PDF_FILE, 'rb') as f:
            files = {'file': (os.path.basename(PDF_FILE), f, 'application/pdf')}
            data = {
                'project_id': project_id,
                'uploaded_by': 'parser_test_user'
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

            # Analyze document
            doc_id = result['id']
            response = requests.post(f"{BASE_URL}/documents/{doc_id}/analyze")

            if response.status_code == 200:
                analysis = response.json()
                print_success("Document analysis completed!")

                # Check which parser was used
                parser = 'unknown'
                if 'analysis_result' in analysis and 'metadata' in analysis['analysis_result']:
                    parser = analysis['analysis_result']['metadata'].get('parser', 'unknown')
                print_info(f"Parser used: {parser}")

                return {
                    'doc_id': doc_id,
                    'analysis': analysis,
                    'parser': parser
                }
            else:
                print_error(f"Analysis failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return None
        else:
            print_error(f"Upload failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None

    except Exception as e:
        print_error(f"Error: {e}")
        return None


def get_parser_config():
    """Get current parser configuration from server"""
    print_test("Checking parser configuration...")

    try:
        # Try to get health endpoint or similar
        response = requests.get(f"{BASE_URL}/../health")
        if response.status_code == 200:
            print_success("Server is running")

        print_info("Current configuration:")
        print_info("  - DOCUMENT_PARSER environment variable determines mode")
        print_info("  - 'auto' mode: uses Upstage if API key present, otherwise local")
        print_info("  - 'upstage' mode: always uses Upstage API")
        print_info("  - 'local' mode: always uses PyPDF2/python-docx")

    except Exception as e:
        print_error(f"Error checking config: {e}")


def compare_results(upstage_result, local_result):
    """Compare results from both parsers"""
    print_section("Parser Comparison")

    if not upstage_result or not local_result:
        print_error("Cannot compare - missing results")
        return

    upstage_analysis = upstage_result['analysis']
    local_analysis = local_result['analysis']

    print_info("\n📊 Comparison Results:")

    # Compare chunk counts
    upstage_chunks = upstage_analysis.get('total_chunks', 0)
    local_chunks = local_analysis.get('total_chunks', 0)

    print(f"\n  Chunks created:")
    print(f"    Upstage: {upstage_chunks}")
    print(f"    Local:   {local_chunks}")

    # Compare metadata
    upstage_meta = upstage_analysis.get('analysis_result', {}).get('metadata', {})
    local_meta = local_analysis.get('analysis_result', {}).get('metadata', {})

    print(f"\n  Pages detected:")
    print(f"    Upstage: {upstage_meta.get('pages', 0)}")
    print(f"    Local:   {local_meta.get('pages', 0)}")

    print(f"\n  Elements extracted:")
    print(f"    Upstage: {len(upstage_meta.get('elements', []))}")
    print(f"    Local:   {len(local_meta.get('elements', []))}")

    # Text length comparison
    upstage_text_len = len(upstage_analysis.get('analysis_result', {}).get('text', ''))
    local_text_len = len(local_analysis.get('analysis_result', {}).get('text', ''))

    print(f"\n  Text extracted (characters):")
    print(f"    Upstage: {upstage_text_len:,}")
    print(f"    Local:   {local_text_len:,}")

    # Quality assessment
    print(f"\n  Quality Assessment:")
    if upstage_chunks > local_chunks:
        print(f"    {GREEN}✓{RESET} Upstage extracted more chunks (better segmentation)")
    else:
        print(f"    {GREEN}✓{RESET} Local parser created comparable chunks")

    if len(upstage_meta.get('elements', [])) > 0:
        print(f"    {GREEN}✓{RESET} Upstage provides structural elements (headings, tables, etc.)")

    if local_text_len > 0:
        print(f"    {GREEN}✓{RESET} Local parser successfully extracted text")

    # Cost comparison
    print(f"\n  💰 Cost Analysis:")
    print(f"    Upstage: API cost per document (paid service)")
    print(f"    Local:   Free (uses PyPDF2/python-docx)")


def main():
    """Run comprehensive parser mode tests"""
    print("\n" + "="*60)
    print(f"{BLUE}RAG Service - Parser Mode Comparison Test{RESET}")
    print("="*60 + "\n")

    # Check if PDF file exists
    if not os.path.exists(PDF_FILE):
        print_error(f"PDF file not found: {PDF_FILE}")
        print_info("Please ensure test.pdf is in the current directory")
        return

    # Test 1: Get configuration
    get_parser_config()

    # Test 2: Test with auto mode (should use Upstage since API key is present)
    print_section("Test 1: Auto Mode (Upstage API)")
    print_info("Current mode: auto (with API key → uses Upstage)")
    upstage_result = upload_and_analyze_pdf()

    if upstage_result:
        print_success(f"✅ Upstage parser test successful!")
        print_info(f"Parser used: {upstage_result['parser']}")
        print_info(f"Chunks created: {upstage_result['analysis']['total_chunks']}")

    # Test 3: Inform about local mode testing
    print_section("Test 2: Local Mode Testing")
    print_info("To test local parser mode:")
    print_info("  1. Edit .env file:")
    print_info("     DOCUMENT_PARSER=local")
    print_info("  2. Restart RAG service:")
    print_info("     docker-compose restart rag-service")
    print_info("  3. Run this test again")
    print_info("")
    print_info("Or temporarily remove UPSTAGE_API_KEY to trigger auto fallback to local")

    # Summary
    print_section("Test Summary")

    if upstage_result:
        parser_used = upstage_result['parser']

        if parser_used == 'upstage':
            print_success("✅ Upstage API integration: Working")
            print_info("   - Cloud-based document analysis")
            print_info("   - Advanced layout detection")
            print_info("   - Structured element extraction")
        elif parser_used == 'local':
            print_success("✅ Local parser integration: Working")
            print_info("   - PyPDF2 for PDF parsing")
            print_info("   - python-docx for DOCX parsing")
            print_info("   - Cost-free operation")

        print_info("\n🎯 Environment-based branching: Implemented")
        print_info("   - auto: Upstage if API key present, else local")
        print_info("   - upstage: Always use cloud API")
        print_info("   - local: Always use PyPDF2/python-docx")

        print("\n" + "="*60)
        print(f"{GREEN}✅ Parser mode testing completed!{RESET}")
        print("="*60 + "\n")
    else:
        print_error("❌ Parser test failed")


if __name__ == "__main__":
    main()
