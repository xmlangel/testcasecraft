# RAG Service 코드 구조 상세 가이드

## 📋 목차

1. [개요](#1-개요)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [핵심 컴포넌트](#3-핵심-컴포넌트)
4. [API 엔드포인트](#4-api-엔드포인트)
5. [데이터 모델](#5-데이터-모델)
6. [서비스 레이어](#6-서비스-레이어)
7. [설정 및 환경](#7-설정-및-환경)
8. [테스트 코드](#8-테스트-코드)
9. [데이터 흐름](#9-데이터-흐름)

---

## 1. 개요

RAG Service는 FastAPI 기반의 문서 처리 및 벡터 검색 서비스입니다.

### 주요 기능

- **문서 업로드 및 저장**: MinIO를 사용한 객체 스토리지
- **문서 파싱**: 4가지 파서 지원 (Upstage API, PyMuPDF4LLM, PyMuPDF, PyPDF2)
- **텍스트 임베딩**: Sentence Transformers를 이용한 벡터 생성
- **벡터 검색**: PostgreSQL + pgvector를 통한 유사도 검색
- **대화 관리**: 검색 기반 대화 컨텍스트 저장

### 기술 스택

```
FastAPI (0.104.1)          - REST API 프레임워크
PostgreSQL + pgvector      - 벡터 데이터베이스
MinIO (7.2.0)              - S3 호환 객체 스토리지
Sentence Transformers      - 텍스트 임베딩 (768차원)
LangChain                  - 텍스트 청킹
```

---

## 2. 프로젝트 구조

```
rag-service/
├── app/                              # 메인 애플리케이션 코드
│   ├── __init__.py
│   ├── main.py                       # FastAPI 애플리케이션 진입점
│   ├── core/                         # 핵심 설정
│   │   ├── __init__.py
│   │   ├── config.py                 # 환경 설정 (Settings)
│   │   └── database.py               # 데이터베이스 연결
│   ├── models/                       # SQLAlchemy ORM 모델
│   │   ├── __init__.py
│   │   ├── rag_document.py           # 문서 메타데이터 모델
│   │   ├── rag_embedding.py          # 임베딩 벡터 모델
│   │   └── rag_conversation_message.py  # 대화 메시지 모델
│   ├── schemas/                      # Pydantic 스키마 (DTO)
│   │   ├── __init__.py
│   │   ├── document.py               # 문서 관련 스키마
│   │   ├── embedding.py              # 임베딩 관련 스키마
│   │   ├── search.py                 # 검색 관련 스키마
│   │   └── conversation.py           # 대화 관련 스키마
│   ├── api/                          # API 라우터
│   │   ├── __init__.py
│   │   └── v1/                       # API v1 엔드포인트
│   │       ├── __init__.py           # API 라우터 통합
│   │       ├── documents.py          # 문서 업로드/관리 API
│   │       ├── embeddings.py         # 임베딩 생성/관리 API
│   │       ├── search.py             # 벡터 검색 API
│   │       └── conversations.py      # 대화 관리 API
│   └── services/                     # 비즈니스 로직 서비스
│       ├── __init__.py
│       ├── upstage_service.py        # 문서 파싱 서비스 (4가지 파서)
│       ├── embedding_service.py      # 임베딩 생성 서비스
│       └── minio_service.py          # MinIO 스토리지 서비스
│
├── requirements.txt                  # Python 의존성
├── Dockerfile                        # Docker 이미지 빌드
├── README_PARSER.md                  # 파서 사용법 가이드
├── PARSER_COMPARISON.md              # 파서 비교 문서
│
└── (테스트 스크립트들)
    ├── quick_test.py                 # 빠른 API 테스트
    ├── test_api.py                   # API 통합 테스트
    ├── test_api_comprehensive.py     # 종합 API 테스트
    ├── test_embedding_search.py      # 임베딩 검색 테스트
    ├── test_parser_modes.py          # 파서 모드 테스트
    ├── test_pdf_analysis.py          # PDF 분석 테스트
    ├── test_async_embedding.py       # 비동기 임베딩 테스트
    └── test_validation.py            # 검증 테스트
```

---

## 3. 핵심 컴포넌트

### 3.1. main.py - FastAPI 애플리케이션

**위치**: `rag-service/app/main.py`

**주요 역할**:

- FastAPI 애플리케이션 초기화
- CORS 미들웨어 설정 (모든 오리진 허용)
- API 라우터 등록 (`/api/v1` 프리픽스)
- 데이터베이스 테이블 자동 생성 (startup 이벤트)

**주요 엔드포인트**:

```python
GET  /                   # 서비스 정보
GET  /health             # 헬스 체크
GET  /api/v1/info        # API 정보
GET  /docs               # Swagger UI (자동 생성)
GET  /redoc              # ReDoc (자동 생성)
```

**설정 정보**:

- App Name: "RAG Service"
- Version: "0.1.0"
- Description: "RAG (Retrieval-Augmented Generation) Service for Test Case Management"

---

## 4. API 엔드포인트

### 4.1. Documents API (`/api/v1/documents`)

**파일**: `rag-service/app/api/v1/documents.py`

| 메서드   | 경로                      | 설명                               |
| -------- | ------------------------- | ---------------------------------- |
| `POST`   | `/`                       | 문서 업로드 (MinIO 저장)           |
| `GET`    | `/`                       | 문서 목록 조회 (프로젝트별 필터링) |
| `GET`    | `/{document_id}`          | 특정 문서 조회                     |
| `DELETE` | `/{document_id}`          | 문서 삭제 (MinIO + DB)             |
| `POST`   | `/{document_id}/analyze`  | 문서 분석 (파싱 + 청킹)            |
| `GET`    | `/{document_id}/download` | 문서 다운로드 URL 생성             |

**주요 기능**:

1. **업로드**: MultipartForm 파일 업로드 → MinIO 저장 → DB 메타데이터 저장
2. **분석**: 문서 파싱 → 텍스트 추출 → 청킹 → DB 저장
3. **다운로드**: MinIO presigned URL 생성 (1시간 유효)

### 4.2. Embeddings API (`/api/v1/embeddings`)

**파일**: `rag-service/app/api/v1/embeddings.py`

| 메서드   | 경로                      | 설명                             |
| -------- | ------------------------- | -------------------------------- |
| `POST`   | `/document/{document_id}` | 문서의 청크들에 대한 임베딩 생성 |
| `GET`    | `/document/{document_id}` | 문서의 모든 임베딩 조회          |
| `POST`   | `/text`                   | 단일 텍스트 임베딩 생성          |
| `DELETE` | `/document/{document_id}` | 문서의 모든 임베딩 삭제          |

**주요 기능**:

1. **배치 임베딩**: 문서의 모든 청크를 한 번에 벡터화
2. **단일 임베딩**: 검색 쿼리용 벡터 생성
3. **768차원 벡터**: `paraphrase-multilingual-mpnet-base-v2` 모델 사용

### 4.3. Search API (`/api/v1/search`)

**파일**: `rag-service/app/api/v1/search.py`

| 메서드 | 경로                 | 설명                                |
| ------ | -------------------- | ----------------------------------- |
| `POST` | `/similar`           | 벡터 유사도 검색 (코사인 유사도)    |
| `POST` | `/similar-testcases` | 유사 테스트케이스 검색 (프로젝트별) |

**주요 기능**:

1. **벡터 검색**: pgvector의 코사인 유사도 검색 (`<=>` 연산자)
2. **필터링**: 프로젝트 ID, 유사도 임계값, 결과 개수 제한
3. **정렬**: 유사도 점수 기준 내림차순

### 4.4. Conversations API (`/api/v1/conversations`)

**파일**: `rag-service/app/api/v1/conversations.py`

| 메서드 | 경로                             | 설명                    |
| ------ | -------------------------------- | ----------------------- |
| `POST` | `/messages`                      | 대화 메시지 저장        |
| `GET`  | `/project/{project_id}/messages` | 프로젝트 대화 이력 조회 |

**주요 기능**:

- 사용자 질문 및 AI 응답 저장
- 프로젝트별 대화 컨텍스트 관리

---

## 5. 데이터 모델

### 5.1. RAGDocument (문서 메타데이터)

**파일**: `rag-service/app/models/rag_document.py`

**테이블**: `rag_documents`

| 컬럼               | 타입        | 설명                                              |
| ------------------ | ----------- | ------------------------------------------------- |
| `id`               | UUID        | 문서 ID (PK)                                      |
| `project_id`       | UUID        | 프로젝트 ID (인덱스)                              |
| `file_name`        | String(512) | 파일명                                            |
| `file_path`        | Text        | 파일 경로                                         |
| `file_type`        | String(50)  | 파일 확장자 (pdf, docx, txt 등)                   |
| `file_size`        | BigInteger  | 파일 크기 (bytes)                                 |
| `upload_date`      | DateTime    | 업로드 날짜                                       |
| `uploaded_by`      | String(255) | 업로드 사용자                                     |
| `minio_bucket`     | String(255) | MinIO 버킷명                                      |
| `minio_object_key` | Text        | MinIO 객체 키                                     |
| `analysis_status`  | String(50)  | 분석 상태 (pending, analyzing, completed, failed) |
| `analysis_date`    | DateTime    | 분석 완료 날짜                                    |
| `total_chunks`     | Integer     | 청크 개수                                         |
| `metadata`         | JSONB       | 추가 메타데이터 (JSON)                            |
| `created_at`       | DateTime    | 생성 시각                                         |
| `updated_at`       | DateTime    | 수정 시각                                         |

**관계**:

- `embeddings`: RAGEmbedding 1:N (cascade delete)

### 5.2. RAGEmbedding (임베딩 벡터)

**파일**: `rag-service/app/models/rag_embedding.py`

**테이블**: `rag_embeddings`

| 컬럼             | 타입        | 설명                         |
| ---------------- | ----------- | ---------------------------- |
| `id`             | UUID        | 임베딩 ID (PK)               |
| `document_id`    | UUID        | 문서 ID (FK, cascade delete) |
| `chunk_index`    | Integer     | 청크 순서                    |
| `chunk_text`     | Text        | 청크 텍스트                  |
| `chunk_metadata` | JSONB       | 청크 메타데이터 (JSON)       |
| `embedding`      | Vector(768) | 임베딩 벡터 (pgvector)       |
| `created_at`     | DateTime    | 생성 시각                    |

**관계**:

- `document`: RAGDocument N:1

**인덱스**:

- `document_id`: 외래키 인덱스
- `embedding`: 벡터 유사도 검색용 인덱스 (ivfflat/hnsw)

### 5.3. RAGConversationMessage (대화 메시지)

**파일**: `rag-service/app/models/rag_conversation_message.py`

**테이블**: `rag_conversation_messages`

| 컬럼         | 타입        | 설명                   |
| ------------ | ----------- | ---------------------- |
| `id`         | UUID        | 메시지 ID (PK)         |
| `project_id` | UUID        | 프로젝트 ID            |
| `user_id`    | String(255) | 사용자 ID              |
| `message`    | Text        | 메시지 내용            |
| `role`       | String(50)  | 역할 (user, assistant) |
| `context`    | JSONB       | 검색 컨텍스트 (JSON)   |
| `created_at` | DateTime    | 생성 시각              |

---

## 6. 서비스 레이어

### 6.1. UpstageService (문서 파싱)

**파일**: `rag-service/app/services/upstage_service.py`

**지원 파서**:

| 파서          | 설명                        | 장점                               | 단점                       |
| ------------- | --------------------------- | ---------------------------------- | -------------------------- |
| `upstage`     | Upstage Layout Analysis API | 고급 레이아웃 분석, 표/이미지 인식 | API 키 필요, 네트워크 의존 |
| `pymupdf4llm` | PyMuPDF4LLM (LLM 최적화)    | LLM용 마크다운 추출, 고품질        | 임시 파일 필요             |
| `pymupdf`     | PyMuPDF (fitz)              | 빠르고 안정적, 풍부한 기능         | 기본 텍스트 추출           |
| `pypdf2`      | PyPDF2 (기본)               | 의존성 적음, 간단                  | 복잡한 PDF 처리 약함       |

**주요 메서드**:

```python
async def analyze_document(file_content: bytes, file_name: str) -> Dict[str, Any]
    """문서 파싱 (자동 파서 선택)"""

def create_chunks(text: str, metadata: Optional[Dict]) -> List[Dict[str, Any]]
    """텍스트 청킹 (RecursiveCharacterTextSplitter)"""
    # chunk_size=1000, chunk_overlap=200

async def analyze_and_chunk(file_content: bytes, file_name: str) -> Dict[str, Any]
    """파싱 + 청킹 통합 실행"""
```

**청킹 설정**:

```python
RecursiveCharacterTextSplitter(
    chunk_size=1000,        # 청크당 1000자
    chunk_overlap=200,      # 200자 겹침
    length_function=len,
    separators=["\n\n", "\n", " ", ""]
)
```

### 6.2. EmbeddingService (임베딩 생성)

**파일**: `rag-service/app/services/embedding_service.py`

**모델**: `paraphrase-multilingual-mpnet-base-v2` (Sentence Transformers)

- **차원**: 768
- **다국어 지원**: 한국어, 영어 등 50+ 언어
- **성능**: 약 15,000 토큰/초

**주요 메서드**:

```python
def load_model()
    """모델 지연 로딩 (Lazy Loading)"""

def generate_embedding(text: str) -> List[float]
    """단일 텍스트 임베딩 (768차원)"""

def generate_embeddings_batch(texts: List[str]) -> List[List[float]]
    """배치 임베딩 (진행바 표시)"""

def compute_similarity(embedding1: List[float], embedding2: List[float]) -> float
    """코사인 유사도 계산 (0-1 정규화)"""
```

**싱글톤 패턴**:

```python
_embedding_service_instance = None

def get_embedding_service() -> EmbeddingService:
    """전역 인스턴스 반환"""
```

### 6.3. MinIOService (객체 스토리지)

**파일**: `rag-service/app/services/minio_service.py`

**설정** (기본값):

- Endpoint: `host.docker.internal:9000`
- Bucket: `rag-documents`
- Secure: `False` (HTTP)

**주요 메서드**:

```python
async def upload_file(file: UploadFile, object_key: str, content_type: str) -> dict
    """파일 업로드"""

def download_file(object_key: str) -> BinaryIO
    """파일 다운로드 (스트림)"""

def delete_file(object_key: str) -> bool
    """파일 삭제 (존재하지 않아도 True 반환)"""

def get_file_metadata(object_key: str) -> dict
    """파일 메타데이터 조회"""

def generate_presigned_url(object_key: str, expires: timedelta) -> str
    """임시 다운로드 URL 생성 (기본 1시간)"""
```

**자동 버킷 생성**:

```python
def _ensure_bucket_exists()
    """시작 시 버킷 존재 확인 및 생성"""
```

---

## 7. 설정 및 환경

### 7.1. config.py (환경 설정)

**파일**: `rag-service/app/core/config.py`

**주요 설정**:

```python
class Settings(BaseSettings):
    # 애플리케이션
    APP_NAME: str = "RAG Service"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # 데이터베이스
    DATABASE_URL: str = "postgresql://rag_user:***@postgres-rag:5432/rag_db"

    # MinIO
    MINIO_ENDPOINT: str = "host.docker.internal:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "***"
    MINIO_BUCKET: str = "rag-documents"
    MINIO_SECURE: bool = False

    # 문서 파서 (upstage, pymupdf4llm, pymupdf, pypdf2, auto)
    DOCUMENT_PARSER: str = "pymupdf4llm"
    UPSTAGE_API_KEY: Optional[str] = None

    # 임베딩 모델
    EMBEDDING_PROVIDER: str = "sentence-transformers"
    EMBEDDING_MODEL: str = "paraphrase-multilingual-mpnet-base-v2"
    EMBEDDING_DIMENSION: int = 768

    # Ollama (선택적)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_EMBEDDING_MODEL: str = "llama2"

    # 벡터 검색
    SIMILARITY_THRESHOLD: float = 0.7
    MAX_SEARCH_RESULTS: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True
```

**환경 변수 우선순위**:

1. `.env` 파일
2. 시스템 환경 변수
3. 기본값 (코드 내)

### 7.2. database.py (데이터베이스)

**파일**: `rag-service/app/core/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy 엔진 생성
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False  # SQL 로깅 (개발 시 True)
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ORM 베이스 클래스
Base = declarative_base()

# Dependency Injection용
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**pgvector 확장**:

```sql
-- 데이터베이스 초기화 시 실행 필요
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 8. 테스트 코드

### 8.1. 테스트 스크립트 목록

| 파일                        | 설명                                         |
| --------------------------- | -------------------------------------------- |
| `quick_test.py`             | 기본 API 테스트 (업로드, 분석, 임베딩, 검색) |
| `test_api.py`               | API 통합 테스트                              |
| `test_api_comprehensive.py` | 종합 API 테스트 (27개 테스트 케이스)         |
| `test_embedding_search.py`  | 임베딩 생성 및 검색 테스트                   |
| `test_parser_modes.py`      | 4가지 파서 모드 비교 테스트                  |
| `test_pdf_analysis.py`      | PDF 분석 테스트                              |
| `test_async_embedding.py`   | 비동기 임베딩 성능 테스트                    |
| `test_validation.py`        | 입력 검증 테스트                             |
| `auto_quick_test.py`        | 자동화된 빠른 테스트                         |

### 8.2. 테스트 실행 예시

```bash
# 빠른 API 테스트
python rag-service/quick_test.py

# 종합 테스트
python rag-service/test_api_comprehensive.py

# 파서 비교 테스트
python rag-service/test_parser_modes.py
```

---

## 9. 데이터 흐름

### 9.1. 문서 업로드 및 분석 플로우

```
1. 사용자 → POST /api/v1/documents/
   ├─ 파일 업로드 (MultipartForm)
   ├─ MinIOService.upload_file()
   │  └─ MinIO 저장: {project_id}/{uuid}/{filename}
   ├─ RAGDocument 생성 (status="pending")
   └─ 응답: document_id

2. 사용자 → POST /api/v1/documents/{document_id}/analyze
   ├─ MinIOService.download_file()
   ├─ UpstageService.analyze_document()
   │  ├─ 파서 선택 (upstage, pymupdf4llm, pymupdf, pypdf2)
   │  ├─ 텍스트 추출
   │  └─ create_chunks() - 청킹 (1000자/200자 겹침)
   ├─ RAGDocument 업데이트 (status="completed", total_chunks=N)
   └─ 응답: analysis_result + chunks
```

### 9.2. 임베딩 생성 플로우

```
3. 사용자 → POST /api/v1/embeddings/document/{document_id}
   ├─ RAGDocument 조회 (분석 완료 확인)
   ├─ EmbeddingService.generate_embeddings_batch()
   │  ├─ 모델 로딩 (paraphrase-multilingual-mpnet-base-v2)
   │  ├─ 배치 임베딩 생성 (768차원)
   │  └─ 정규화
   ├─ RAGEmbedding 삽입 (pgvector)
   │  └─ INSERT INTO rag_embeddings (chunk_text, embedding)
   └─ 응답: embedding_count
```

### 9.3. 벡터 검색 플로우

```
4. 사용자 → POST /api/v1/search/similar
   ├─ 검색 쿼리 임베딩
   │  └─ EmbeddingService.generate_embedding(query_text)
   ├─ pgvector 유사도 검색
   │  └─ SELECT * FROM rag_embeddings
   │      ORDER BY embedding <=> query_embedding
   │      LIMIT max_results
   ├─ 유사도 점수 계산 (코사인 유사도)
   ├─ 필터링 (similarity_threshold, project_id)
   └─ 응답: similar_chunks (정렬된 결과)
```

### 9.4. 대화 저장 플로우

```
5. 사용자 → POST /api/v1/conversations/messages
   ├─ RAGConversationMessage 생성
   │  ├─ role: "user" or "assistant"
   │  ├─ context: {search_results, similarity_scores}
   │  └─ INSERT INTO rag_conversation_messages
   └─ 응답: message_id

6. 사용자 → GET /api/v1/conversations/project/{project_id}/messages
   ├─ SELECT * FROM rag_conversation_messages
   │  WHERE project_id = ?
   │  ORDER BY created_at DESC
   └─ 응답: conversation_history
```

---

## 10. 주요 의존성

### 10.1. requirements.txt

```
# FastAPI 및 ASGI 서버
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# 데이터베이스
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pgvector==0.2.4
alembic==1.12.1

# MinIO 객체 스토리지
minio==7.2.0

# 임베딩 모델
sentence-transformers==2.7.0
torch==2.1.1
transformers==4.35.2
huggingface_hub>=0.20.0

# 텍스트 청킹
langchain>=0.1.0
langchain-text-splitters>=0.0.1

# 문서 파서 (선택적)
PyPDF2==3.0.1
python-docx==1.1.0
PyMuPDF==1.24.9
PyMuPDF4LLM==0.0.5

# 유틸리티
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.25.2
python-json-logger==2.0.7
```

### 10.2. Docker 컨테이너

**docker-compose-dev.yml** (dev-docker 디렉토리):

```yaml
services:
  postgres-rag:
    image: pgvector/pgvector:pg16
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: rag_db
      POSTGRES_USER: rag_user
      POSTGRES_PASSWORD: rag_dev_password_123

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000" # API
      - "9001:9001" # Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin_dev_password_789

  rag-service:
    build: ../rag-service
    ports:
      - "8001:8000"
    environment:
      DATABASE_URL: postgresql://rag_user:***@postgres-rag:5432/rag_db
      MINIO_ENDPOINT: minio:9000
    depends_on:
      - postgres-rag
      - minio
```

---

## 11. API 호출 예시

### 11.1. 문서 업로드

```bash
curl -X POST "http://localhost:8001/api/v1/documents/" \
  -F "file=@document.pdf" \
  -F "project_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "uploaded_by=user@example.com"
```

**응답**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "file_name": "document.pdf",
  "file_type": "pdf",
  "file_size": 102400,
  "analysis_status": "pending",
  "upload_date": "2025-01-15T10:30:00Z"
}
```

### 11.2. 문서 분석

```bash
curl -X POST "http://localhost:8001/api/v1/documents/{document_id}/analyze"
```

**응답**:

```json
{
  "document_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "total_chunks": 15,
  "analysis": {
    "text": "Document content...",
    "markdown": "# Title\n\nContent...",
    "metadata": {
      "file_name": "document.pdf",
      "file_type": "pdf",
      "pages": 5,
      "parser": "pymupdf4llm"
    }
  }
}
```

### 11.3. 임베딩 생성

```bash
curl -X POST "http://localhost:8001/api/v1/embeddings/document/{document_id}"
```

**응답**:

```json
{
  "document_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "embeddings_created": 15,
  "status": "completed"
}
```

### 11.4. 유사도 검색

```bash
curl -X POST "http://localhost:8001/api/v1/search/similar" \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "로그인 기능 테스트",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "top_k": 5,
    "similarity_threshold": 0.7
  }'
```

**응답**:

```json
{
  "results": [
    {
      "chunk_id": "chunk-uuid-1",
      "document_id": "doc-uuid-1",
      "chunk_text": "로그인 기능 테스트 시나리오...",
      "similarity_score": 0.92,
      "chunk_metadata": {
        "chunk_index": 3,
        "file_name": "test_cases.pdf"
      }
    }
  ],
  "total_results": 5,
  "query_text": "로그인 기능 테스트"
}
```

---

## 12. 개발 가이드

### 12.1. 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
cd rag-service
pip install -r requirements.txt

# 2. .env 파일 생성
cat > .env << EOF
APP_ENV=development
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql://rag_user:rag_dev_password_123@localhost:5433/rag_db
MINIO_ENDPOINT=localhost:9000
DOCUMENT_PARSER=pymupdf4llm
EOF

# 3. Docker 서비스 시작 (PostgreSQL + MinIO)
cd dev-docker
docker-compose up -d postgres-rag minio

# 4. FastAPI 실행
cd ../rag-service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 5. 접속 확인
curl http://localhost:8001/health
curl http://localhost:8001/docs  # Swagger UI
```

### 12.2. 파서 모드 변경

**환경 변수로 변경**:

```bash
export DOCUMENT_PARSER=upstage
export UPSTAGE_API_KEY=your_api_key_here
```

**코드에서 직접 변경**:

```python
from app.services.upstage_service import UpstageService

# 특정 파서 지정
service = UpstageService(parser="pymupdf4llm")

# 자동 선택 (API 키가 있으면 upstage 우선)
service = UpstageService(parser="auto")
```

### 12.3. 디버깅

**로그 레벨 변경**:

```bash
export LOG_LEVEL=DEBUG
```

**SQLAlchemy 쿼리 로깅**:

```python
# app/core/database.py
engine = create_engine(
    settings.DATABASE_URL,
    echo=True  # SQL 쿼리 출력
)
```

---

## 13. 문제 해결 (Troubleshooting)

### 13.1. 일반적인 오류

| 오류 메시지                                          | 원인                     | 해결 방법                           |
| ---------------------------------------------------- | ------------------------ | ----------------------------------- |
| `Connection refused (MinIO)`                         | MinIO 서비스 미실행      | `docker-compose up -d minio`        |
| `Connection refused (PostgreSQL)`                    | DB 서비스 미실행         | `docker-compose up -d postgres-rag` |
| `ModuleNotFoundError: No module named 'pymupdf4llm'` | 의존성 미설치            | `pip install -r requirements.txt`   |
| `Bucket does not exist`                              | MinIO 버킷 미생성        | 자동 생성됨 (재시작 확인)           |
| `pgvector extension not found`                       | pgvector 미설치          | `CREATE EXTENSION vector;`          |
| `Embedding dimension mismatch`                       | 모델 변경 시 차원 불일치 | 데이터베이스 재생성 또는 컬럼 변경  |

### 13.2. 성능 최적화

**임베딩 속도 향상**:

```python
# GPU 사용 (CUDA 설치 필요)
import torch
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer(model_name, device=device)
```

**벡터 검색 인덱스 생성**:

```sql
-- IVFFlat 인덱스 (근사 검색, 빠름)
CREATE INDEX ON rag_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- HNSW 인덱스 (정확도 높음)
CREATE INDEX ON rag_embeddings USING hnsw (embedding vector_cosine_ops);
```

**데이터베이스 커넥션 풀 조정**:

```python
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
```

---

## 14. 참고 문서

- **FastAPI 공식 문서**: https://fastapi.tiangolo.com/
- **pgvector**: https://github.com/pgvector/pgvector
- **Sentence Transformers**: https://www.sbert.net/
- **MinIO**: https://min.io/docs/
- **Upstage API**: https://upstage.ai/
- **LangChain**: https://python.langchain.com/

---

## 15. 연락처 및 지원

프로젝트 관련 문의: [프로젝트 저장소](https://github.com/xmlangel/testcase-management-tool)

---

**문서 버전**: 1.0
**마지막 업데이트**: 2025-11-05
**작성자**: Claude Code
