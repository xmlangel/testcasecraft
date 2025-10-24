#!/usr/bin/env python3
"""JIRA ICT-381 진행 상황 업데이트"""

import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_issue_comment

comment = """## 📋 ICT-381 진행 상황 업데이트

### ✅ 완료된 작업

#### 1. Embedding Service 구현
- **파일**: `dev-docker/rag-service/app/services/embedding_service.py`
- **모델**: Sentence Transformers (paraphrase-multilingual-mpnet-base-v2)
- **벡터 차원**: 768차원
- **기능**:
  - 단일 텍스트 임베딩 생성
  - 배치 임베딩 생성
  - 코사인 유사도 계산

#### 2. POST /api/v1/embeddings/generate API 구현
- **파일**: `dev-docker/rag-service/app/api/v1/embeddings.py`
- **기능**:
  - 문서의 모든 청크에 대한 임베딩 자동 생성
  - 768차원 벡터를 PostgreSQL에 저장
  - 배치 처리로 성능 최적화

#### 3. POST /api/v1/search/similar API 구현
- **파일**: `dev-docker/rag-service/app/api/v1/search.py`
- **기능**:
  - 쿼리 텍스트 임베딩 생성
  - 저장된 모든 임베딩과 코사인 유사도 계산
  - 유사도 임계값 기반 필터링 (기본값: 0.7)
  - 상위 N개 결과 반환 (기본값: 10개)
  - 프로젝트별 필터링 지원

#### 4. 의존성 문제 해결
- **수정 파일**: `dev-docker/rag-service/requirements.txt`
- **변경 사항**:
  - sentence-transformers: 2.2.2 → 2.7.0
  - huggingface_hub: 명시적 버전 추가 (>=0.20.0)
- **이유**: ImportError 해결 (cached_download 함수 호환성)

#### 5. Docker 재배포
- Docker 이미지 재빌드 완료
- RAG 서비스 정상 작동 확인

### ✅ 통합 테스트 결과

**테스트 파일**: `dev-docker/rag-service/test_embedding_search.py`

**테스트 시나리오**:
1. ✅ 문서 업로드 (test-pypdf2.txt)
2. ✅ 문서 분석 (1개 청크 생성)
3. ✅ 임베딩 생성 (768차원 벡터 1개)
4. ✅ 유사도 검색 (3개 쿼리 테스트)

**검색 결과**:
- "PyPDF2 parser": 90.2% 유사도
- "parser test": 83.1% 유사도
- "document testing": 79.2% 유사도

### 📝 수정된 파일 목록
1. `dev-docker/rag-service/app/services/embedding_service.py` - 신규 생성
2. `dev-docker/rag-service/app/api/v1/embeddings.py` - 구현 완료
3. `dev-docker/rag-service/app/api/v1/search.py` - 구현 완료
4. `dev-docker/rag-service/requirements.txt` - 의존성 업데이트
5. `dev-docker/rag-service/test_embedding_search.py` - 통합 테스트 추가

### 🚀 다음 단계
- 사용자 최종 검증 필요
- 운영 환경 배포 준비 완료
"""

try:
    result = add_issue_comment('ICT-381', comment, '진행 상황')
    print(f'✅ JIRA 진행 상황 업데이트 성공: {result}')
except Exception as e:
    print(f'❌ JIRA 업데이트 실패: {str(e)}')
    sys.exit(1)
