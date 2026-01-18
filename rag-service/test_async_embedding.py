#!/usr/bin/env python3
"""
Test script for asynchronous embedding generation

This script tests that the RAG service can handle multiple concurrent requests
while embedding generation is in progress.

테스트 시나리오:
1. 문서 업로드
2. 문서 분석 (청크 생성)
3. 임베딩 생성 시작 (비동기)
4. 임베딩 진행 중에도 다른 API 요청이 정상 처리되는지 확인
5. 임베딩 상태 조회 API 테스트
"""

import asyncio
import aiohttp
import time
import uuid
from datetime import datetime

RAG_API_URL = "http://localhost:8001/api/v1"


async def upload_document(session, project_id=None):
    """문서 업로드"""
    print("\n📤 Step 1: Uploading test document...")

    # UUID 생성 (project_id가 없으면)
    if not project_id:
        project_id = str(uuid.uuid4())
        print(f"   Generated project_id: {project_id}")

    # 간단한 테스트 문서 생성
    test_content = "\n\n".join([
        f"Test Paragraph {i}: " + ("This is a test sentence. " * 20)
        for i in range(10)  # 10개 문단 생성
    ])

    data = aiohttp.FormData()
    data.add_field('file',
                   test_content.encode('utf-8'),
                   filename='test_async.txt',
                   content_type='text/plain')
    data.add_field('project_id', str(project_id))
    data.add_field('uploaded_by', 'test-user')

    async with session.post(f"{RAG_API_URL}/documents/upload", data=data) as response:
        if response.status in [200, 201]:
            result = await response.json()
            doc_id = result.get('id') or result.get('document_id')
            print(f"✅ Document uploaded: {doc_id}")
            return doc_id
        else:
            text = await response.text()
            print(f"❌ Upload failed: {response.status} - {text}")
            return None


async def analyze_document(session, doc_id):
    """문서 분석 (청크 생성)"""
    print(f"\n🔍 Step 2: Analyzing document {doc_id}...")

    payload = {
        "parser_mode": "pymupdf4llm",
        "chunk_size": 500,
        "chunk_overlap": 50
    }

    async with session.post(f"{RAG_API_URL}/documents/{doc_id}/analyze", json=payload) as response:
        if response.status in [200, 202]:
            result = await response.json()
            print(f"✅ Document analysis started (async)")

            # 분석 완료까지 대기 (최대 30초)
            for i in range(30):
                await asyncio.sleep(1)
                async with session.get(f"{RAG_API_URL}/documents/{doc_id}") as doc_response:
                    if doc_response.status == 200:
                        doc_data = await doc_response.json()
                        if doc_data.get('analysis_status') == 'completed':
                            # 청크 개수 조회
                            async with session.get(f"{RAG_API_URL}/documents/{doc_id}/chunks") as chunks_response:
                                if chunks_response.status == 200:
                                    chunks_data = await chunks_response.json()
                                    total_chunks = chunks_data.get('total', 0)
                                    print(f"✅ Document analyzed: {total_chunks} chunks created")
                                    return total_chunks
                        elif doc_data.get('analysis_status') == 'failed':
                            print(f"❌ Analysis failed")
                            return 0

            print("⚠️  Analysis timeout")
            return 0
        else:
            text = await response.text()
            print(f"❌ Analysis failed: {response.status} - {text}")
            return 0


async def start_embedding(session, doc_id):
    """임베딩 생성 시작 (비동기)"""
    print(f"\n⚡ Step 3: Starting embedding generation for {doc_id}...")

    payload = {"document_id": doc_id}

    start_time = time.time()
    async with session.post(f"{RAG_API_URL}/embeddings/generate", json=payload) as response:
        response_time = time.time() - start_time

        if response.status == 202:
            result = await response.json()
            print(f"✅ Embedding generation started (response time: {response_time:.3f}s)")
            print(f"   Message: {result['message']}")
            print(f"   Total chunks: {result['total_chunks']}")
            return True
        else:
            text = await response.text()
            print(f"❌ Embedding start failed: {response.status} - {text}")
            return False


async def check_embedding_status(session, doc_id):
    """임베딩 상태 조회"""
    async with session.get(f"{RAG_API_URL}/embeddings/status/{doc_id}") as response:
        if response.status == 200:
            return await response.json()
        else:
            return None


async def test_concurrent_requests(session, doc_id):
    """임베딩 진행 중 다른 요청 처리 테스트"""
    print(f"\n🔄 Step 4: Testing concurrent requests while embedding is in progress...")

    # 여러 요청을 동시에 실행
    tasks = []

    # 1. 문서 목록 조회
    tasks.append(session.get(f"{RAG_API_URL}/documents/"))

    # 2. 문서 상세 정보 조회
    tasks.append(session.get(f"{RAG_API_URL}/documents/{doc_id}"))

    # 3. 청크 목록 조회
    tasks.append(session.get(f"{RAG_API_URL}/documents/{doc_id}/chunks?skip=0&limit=10"))

    # 4. 임베딩 상태 조회
    tasks.append(session.get(f"{RAG_API_URL}/embeddings/status/{doc_id}"))

    start_time = time.time()
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    total_time = time.time() - start_time

    success_count = 0
    for i, response in enumerate(responses):
        if isinstance(response, Exception):
            print(f"   ❌ Request {i+1} failed: {response}")
        elif response.status == 200:
            success_count += 1
            print(f"   ✅ Request {i+1} succeeded ({response.status})")
        else:
            print(f"   ⚠️  Request {i+1} returned {response.status}")

    print(f"\n📊 Concurrent request results:")
    print(f"   - Total requests: {len(tasks)}")
    print(f"   - Successful: {success_count}")
    print(f"   - Total time: {total_time:.3f}s")
    print(f"   - Average time: {total_time/len(tasks):.3f}s per request")

    return success_count == len(tasks)


async def monitor_embedding_progress(session, doc_id, check_interval=2, max_duration=60):
    """임베딩 진행 상황 모니터링"""
    print(f"\n👀 Step 5: Monitoring embedding progress...")

    start_time = time.time()
    last_status = None

    while True:
        elapsed = time.time() - start_time
        if elapsed > max_duration:
            print(f"\n⚠️  Timeout after {max_duration}s")
            break

        status_data = await check_embedding_status(session, doc_id)
        if not status_data:
            print("   ❌ Failed to get status")
            await asyncio.sleep(check_interval)
            continue

        current_status = status_data.get('status')
        progress = status_data.get('progress_percentage', 0)
        embedded = status_data.get('embedded_chunks', 0)
        total = status_data.get('total_chunks', 0)

        if current_status != last_status:
            print(f"\n   📍 Status changed: {last_status} → {current_status}")
            last_status = current_status

        print(f"   [{datetime.now().strftime('%H:%M:%S')}] "
              f"Progress: {progress:.1f}% ({embedded}/{total} chunks) - {current_status}")

        if current_status == "completed":
            print(f"\n✅ Embedding generation completed!")
            if 'completed_at' in status_data:
                print(f"   Completed at: {status_data['completed_at']}")
            break
        elif current_status == "failed":
            print(f"\n❌ Embedding generation failed!")
            if 'error_message' in status_data:
                print(f"   Error: {status_data['error_message']}")
            break

        await asyncio.sleep(check_interval)

    return last_status == "completed"


async def main():
    """메인 테스트 함수"""
    print("=" * 70)
    print("🧪 Testing Asynchronous Embedding Generation")
    print("=" * 70)

    async with aiohttp.ClientSession() as session:
        # Step 1: 문서 업로드
        doc_id = await upload_document(session)
        if not doc_id:
            return False

        # Step 2: 문서 분석
        chunk_count = await analyze_document(session, doc_id)
        if chunk_count == 0:
            return False

        # Step 3: 임베딩 생성 시작 (비동기)
        if not await start_embedding(session, doc_id):
            return False

        # Step 4: 임베딩 진행 중 다른 요청 테스트
        concurrent_success = await test_concurrent_requests(session, doc_id)

        # Step 5: 임베딩 진행 상황 모니터링
        embedding_success = await monitor_embedding_progress(session, doc_id)

        # 결과 출력
        print("\n" + "=" * 70)
        print("📋 Test Results Summary")
        print("=" * 70)
        print(f"✅ Document upload:              SUCCESS")
        print(f"✅ Document analysis:            SUCCESS ({chunk_count} chunks)")
        print(f"✅ Async embedding start:        SUCCESS")
        print(f"{'✅' if concurrent_success else '❌'} Concurrent requests:         {'SUCCESS' if concurrent_success else 'FAILED'}")
        print(f"{'✅' if embedding_success else '❌'} Embedding completion:        {'SUCCESS' if embedding_success else 'FAILED'}")
        print("=" * 70)

        return concurrent_success and embedding_success


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
