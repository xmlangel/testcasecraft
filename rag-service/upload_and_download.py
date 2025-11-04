#!/usr/bin/env python3
"""
간단한 파일 업로드 및 다운로드 테스트 스크립트
"""

import requests
import uuid
import sys

# Configuration
BASE_URL = "http://localhost:8001/api/v1"

def upload_file(file_path, project_id, uploaded_by="testuser"):
    """파일 업로드"""
    print(f"📤 Uploading file: {file_path}")

    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {
            'project_id': project_id,
            'uploaded_by': uploaded_by
        }

        response = requests.post(
            f"{BASE_URL}/documents/upload",
            files=files,
            data=data
        )

    if response.status_code == 201:
        result = response.json()
        print(f"✅ Upload successful!")
        print(f"   Document ID: {result['id']}")
        print(f"   File name: {result['file_name']}")
        print(f"   File size: {result['file_size']} bytes")
        return result['id']
    else:
        print(f"❌ Upload failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None


def list_documents(project_id=None):
    """문서 목록 조회"""
    print("\n📋 Listing documents...")

    params = {}
    if project_id:
        params['project_id'] = project_id

    response = requests.get(f"{BASE_URL}/documents/", params=params)

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Found {result['total']} document(s):")
        for doc in result['documents']:
            print(f"\n   📄 {doc['file_name']}")
            print(f"      ID: {doc['id']}")
            print(f"      Size: {doc['file_size']} bytes")
            print(f"      Uploaded: {doc['upload_date']}")
        return result['documents']
    else:
        print(f"❌ List failed: {response.status_code}")
        return []


def download_file(document_id, save_path):
    """파일 다운로드"""
    print(f"\n📥 Downloading document: {document_id}")

    response = requests.get(f"{BASE_URL}/documents/{document_id}/download")

    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        print(f"✅ Downloaded to: {save_path}")
        print(f"   Size: {len(response.content)} bytes")
        return True
    else:
        print(f"❌ Download failed: {response.status_code}")
        return False


def main():
    """메인 실행"""
    print("="*60)
    print("RAG Service - File Upload & Download Test")
    print("="*60)

    # 1. 프로젝트 ID 생성
    project_id = str(uuid.uuid4())
    print(f"\n🆔 Project ID: {project_id}")

    # 2. 테스트 파일 생성
    test_file = "test_upload.txt"
    with open(test_file, 'w') as f:
        f.write("This is a test file for RAG service upload.\n")
        f.write("File created for testing MinIO integration.\n")
    print(f"📝 Created test file: {test_file}")

    # 3. 파일 업로드
    document_id = upload_file(test_file, project_id)
    if not document_id:
        sys.exit(1)

    # 4. 문서 목록 조회
    list_documents(project_id)

    # 5. 파일 다운로드
    download_path = f"downloaded_{test_file}"
    download_file(document_id, download_path)

    # 6. 다운로드된 파일 확인
    print("\n📂 Downloaded file content:")
    with open(download_path, 'r') as f:
        print(f.read())

    # 7. 정리
    import os
    os.remove(test_file)
    os.remove(download_path)
    print(f"\n🧹 Cleaned up test files")

    print("\n" + "="*60)
    print("✅ Test completed successfully!")
    print(f"🔑 Your Document ID was: {document_id}")
    print("="*60)


if __name__ == "__main__":
    main()
