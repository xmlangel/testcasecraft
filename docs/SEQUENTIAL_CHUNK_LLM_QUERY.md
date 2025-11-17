# 청크 순차 LLM 질의 기능 설계 문서

## 📋 목차
1. [기능 개요](#기능-개요)
2. [현재 RAG 시스템 상태](#현재-rag-시스템-상태)
3. [최적 아키텍처 설계](#최적-아키텍처-설계)
4. [구현 위치 및 파일 구조](#구현-위치-및-파일-구조)
5. [API 명세](#api-명세)
6. [구현 단계](#구현-단계)
7. [코드 예시](#코드-예시)

---

## 기능 개요

### 🎯 목적
RAG 시스템에 업로드된 문서의 모든 청크를 순차적으로 LLM에게 질의하여 다양한 분석 작업을 수행합니다.

### ⚠️ 사용자 명시적 요청 필수

**중요 원칙**:
- 이 기능은 **사용자가 명시적으로 요청할 때만** 실행됩니다
- 사용자가 단순히 질문하는 경우 **절대 자동 실행하지 않습니다**
- 실행 전 **반드시 비용 경고**를 표시하고 사용자 확인을 받습니다

**비용 경고 시스템**:
- 분석 시작 전 **예상 토큰 사용량 및 비용** 계산
- OpenAI, Anthropic 등 유료 API 사용 시 **상세 비용 고지**
- 청크 개수, 평균 청크 크기, LLM 모델에 따른 비용 추정

**배치 확인 메커니즘**:
- **10개 청크 단위**로 처리 후 자동 일시정지
- 사용자에게 **계속 진행 여부** 확인 요청
- 중간에 **중단 및 재개** 가능
- 처리된 청크까지의 **실제 비용** 표시

### 💡 활용 사례
- **문서 요약**: 전체 청크를 요약하여 문서 개요 생성
- **QA 생성**: 각 청크에서 질문-답변 쌍 자동 생성
- **번역**: 청크별 번역 수행
- **리뷰/분석**: 기술 문서 검토, 코드 리뷰 등
- **키워드 추출**: 각 청크에서 핵심 키워드 추출
- **분류**: 청크별 카테고리 분류

### 🔄 기존 RAG vs 새로운 기능

| 구분 | 기존 RAG 채팅 | 청크 순차 LLM 질의 (신규) |
|------|--------------|--------------------------|
| **트리거** | 사용자 질문 입력 | 문서 ID 입력 |
| **처리 대상** | 유사도 높은 상위 N개 청크 | 문서의 **모든** 청크 |
| **처리 방식** | 단일 LLM 질의 | 청크별 순차 LLM 질의 |
| **결과** | 단일 응답 | 청크별 분석 결과 배열 |
| **용도** | 질의응답 | 문서 전체 분석/가공 |

---

## 현재 RAG 시스템 상태

### ✅ 이미 구현된 기능

#### 1. **청크 순차 조회 API** (FastAPI)
```python
# 엔드포인트: GET /api/v1/documents/{document_id}/chunks
# 파라미터: skip (offset), limit (페이지 크기)
# 응답: chunk_index 순서로 정렬된 청크 리스트
```

#### 2. **LLM 통합** (Spring Boot)
- **LlmClient 인터페이스**: 다양한 LLM 제공자 지원
  - `OpenAIClient`
  - `OllamaClient`
  - `OpenRouterClient`
  - `PerplexityClient`
  - `OpenWebUIClient`
- **LlmClientFactory**: LLM 클라이언트 생성 및 관리
- **RagChatServiceImpl**: RAG + LLM 통합 로직

#### 3. **비동기 처리** (FastAPI)
- `BackgroundTasks`를 사용한 비차단 작업 처리
- 예: 임베딩 생성 (`POST /api/v1/embeddings/generate`)
- 상태 폴링 API 패턴 구현됨

#### 4. **데이터베이스 구조**
```sql
-- RAGDocument 테이블
- id (UUID)
- project_id (UUID)
- file_name (VARCHAR)
- analysis_status (VARCHAR) -- 'pending', 'processing', 'completed'
- total_chunks (INTEGER)

-- RAGEmbedding 테이블
- id (UUID)
- document_id (UUID, FK)
- chunk_index (INTEGER) -- ⭐ 순서 보장
- chunk_text (TEXT) -- ⭐ 실제 텍스트
- chunk_metadata (JSONB)
- embedding (VECTOR(768))
```

### ❌ 현재 없는 기능
- **문서 전체 청크를 순차적으로 LLM에게 분석**하는 기능
- FastAPI 레이어의 LLM API 직접 호출 로직
- **비용 추정 및 경고** 시스템
- **배치 확인 및 중단/재개** 메커니즘
- **분석 결과 요약(Summary) CRUD** 기능

---

## 최적 아키텍처 설계

### 🏗️ 하이브리드 방식 (권장)

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                             │
│ - 컴포넌트: DocumentAnalysis.jsx                             │
│ - 기능: "문서 전체 분석" 버튼, 진행 상황 표시                 │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP POST
               │ /api/rag/documents/{id}/analyze-with-llm
┌──────────────▼──────────────────────────────────────────────┐
│ Spring Boot Backend (프록시 + 권한 관리)                     │
│ - 컨트롤러: RagController.java                               │
│ - 서비스: RagServiceImpl.java                                │
│ - 역할: 사용자 권한 검증, FastAPI 요청 전달                   │
└──────────────┬──────────────────────────────────────────────┘
               │ WebClient
               │ POST /api/v1/documents/{id}/analyze-chunks-with-llm
┌──────────────▼──────────────────────────────────────────────┐
│ FastAPI RAG Service (핵심 처리 로직)                         │
│ - 라우터: llm_analysis.py                                    │
│ - 서비스: llm_analysis_service.py                            │
│ - LLM 클라이언트: llm_client.py                               │
│ 처리 흐름:                                                    │
│ 1. PostgreSQL에서 청크 순차 조회 (chunk_index 정렬)          │
│ 2. 각 청크를 LLM에게 질의 (OpenAI SDK 등)                     │
│ 3. 결과 수집 및 DB 저장                                       │
│ 4. 상태 업데이트 (processing → completed)                     │
└──────────────┬──────────────────────────────────────────────┘
               │
    ┌──────────┴────────┐
    ▼                   ▼
PostgreSQL          OpenAI/Anthropic API
(청크 데이터)       (LLM 질의)
```

### 🎯 레이어별 역할

| 레이어 | 역할 | 이유 |
|--------|------|------|
| **FastAPI** | 핵심 처리 로직 | 청크 데이터 직접 접근, Python asyncio 효율적 |
| **Spring Boot** | 프록시 + 권한 관리 | 기존 인증/인가 시스템 활용, 비즈니스 로직 통합 |
| **Frontend** | UI + UX | 사용자 친화적 인터페이스, 진행 상황 표시 |

---

## 구현 위치 및 파일 구조

### 📁 FastAPI 레이어 (핵심)

```
rag-service/
├── app/
│   ├── routers/
│   │   ├── llm_analysis.py          # 신규 생성 ⭐ (분석 작업 API)
│   │   └── analysis_summary.py      # 신규 생성 ⭐ (요약 CRUD API)
│   ├── services/
│   │   ├── llm_client.py             # 신규 생성 ⭐ (LLM 클라이언트)
│   │   ├── llm_analysis_service.py   # 신규 생성 ⭐ (분석 로직)
│   │   ├── cost_estimator.py         # 신규 생성 ⭐ (비용 추정)
│   │   └── analysis_summary_service.py # 신규 생성 ⭐ (요약 CRUD)
│   ├── models/
│   │   └── llm_analysis.py           # 신규 생성 (DB 모델)
│   │       - LlmAnalysisJob          # 분석 작업 메타데이터
│   │       - LlmAnalysisResult       # 청크별 분석 결과
│   │       - AnalysisSummary         # 정리된 요약 (임시 저장)
│   └── schemas/
│       ├── llm_analysis.py           # 신규 생성 (Pydantic)
│       └── analysis_summary.py       # 신규 생성 (Pydantic)
├── requirements.txt                   # 수정 (openai, anthropic 추가)
└── main.py                            # 수정 (라우터 등록)
```

### 📁 Spring Boot 레이어 (프록시)

```
src/main/java/com/testcase/testcasemanagement/
├── controller/
│   └── RagController.java             # 수정 (엔드포인트 추가)
├── service/
│   ├── RagService.java                # 수정 (메서드 추가)
│   └── RagServiceImpl.java            # 수정 (구현 추가)
└── dto/rag/
    ├── RagLlmAnalysisRequest.java     # 신규 생성 ⭐
    ├── RagLlmAnalysisResponse.java    # 신규 생성 ⭐
    ├── RagLlmAnalysisStatusResponse.java # 신규 생성 ⭐
    ├── RagCostEstimateRequest.java    # 신규 생성 ⭐ (비용 추정)
    ├── RagCostEstimateResponse.java   # 신규 생성 ⭐
    ├── RagAnalysisSummaryRequest.java # 신규 생성 ⭐ (요약 CRUD)
    └── RagAnalysisSummaryResponse.java # 신규 생성 ⭐
```

### 📁 Frontend 레이어 (UI)

```
src/main/frontend/src/components/RAG/
├── DocumentAnalysis.jsx               # 신규 생성 ⭐ (분석 시작 다이얼로그)
│   - 비용 경고 다이얼로그             # 비용 추정 표시
│   - 배치 확인 다이얼로그             # 10개 단위 확인
│   - 진행 상황 표시                   # 실시간 업데이트
├── AnalysisSummaryManager.jsx         # 신규 생성 ⭐ (요약 CRUD UI)
│   - 요약 목록 테이블                 # 저장된 요약 리스트
│   - 요약 작성/편집 다이얼로그        # 새 요약 작성
│   - 요약 상세보기                    # 요약 내용 표시
│   - 삭제 확인 다이얼로그             # 요약 삭제
├── RAGDocumentManager.jsx             # 수정 (버튼 통합)
└── RAGContext.jsx                     # 수정 (API 호출 추가)
```

---

## API 명세

### 1. FastAPI 엔드포인트

#### 1.0. 비용 추정 (분석 시작 전)

**요청**:
```http
POST /api/v1/documents/{document_id}/estimate-analysis-cost
Content-Type: application/json

{
  "llm_provider": "openai",
  "llm_model": "gpt-4",
  "prompt_template": "다음 텍스트를 요약하세요:\n\n{chunk_text}",
  "max_tokens": 500
}
```

**응답**:
```json
{
  "document_id": "uuid-here",
  "total_chunks": 120,
  "estimated_input_tokens": 180000,
  "estimated_output_tokens": 60000,
  "estimated_total_tokens": 240000,
  "cost_breakdown": {
    "input_cost_usd": 1.80,
    "output_cost_usd": 3.60,
    "total_cost_usd": 5.40
  },
  "cost_per_chunk_usd": 0.045,
  "model_pricing": {
    "provider": "openai",
    "model": "gpt-4",
    "input_price_per_1k": 0.01,
    "output_price_per_1k": 0.06
  },
  "warnings": [
    "이 작업은 약 $5.40의 비용이 발생할 수 있습니다.",
    "실제 비용은 청크 크기에 따라 달라질 수 있습니다."
  ]
}
```

#### 1.1. 청크 분석 시작

**요청**:
```http
POST /api/v1/documents/{document_id}/analyze-chunks-with-llm
Content-Type: application/json

{
  "llm_provider": "openai",           # "openai", "anthropic", "ollama" 등
  "llm_model": "gpt-4",                # "gpt-4", "claude-3-sonnet" 등
  "llm_api_key": "sk-...",             # API 키 (선택, 서버 설정 사용 가능)
  "llm_base_url": null,                # 커스텀 엔드포인트 (선택)
  "prompt_template": "다음 텍스트를 요약하세요:\n\n{chunk_text}",
  "chunk_batch_size": 10,              # 한 번에 처리할 청크 수 (10개 권장)
  "pause_after_batch": true,           # 배치마다 일시정지 (기본값: true)
  "max_tokens": 500,                   # LLM 응답 최대 토큰
  "temperature": 0.7                   # LLM 온도
}
```

**응답**:
```json
{
  "status": "processing",
  "document_id": "uuid-here",
  "total_chunks": 120,
  "message": "분석이 시작되었습니다. 진행 상황을 확인하세요."
}
```

#### 1.2. 분석 진행 상황 조회

**요청**:
```http
GET /api/v1/documents/{document_id}/llm-analysis-status
```

**응답**:
```json
{
  "document_id": "uuid-here",
  "status": "processing",              # "pending", "processing", "completed", "failed"
  "progress": {
    "total_chunks": 120,
    "processed_chunks": 45,
    "percentage": 37.5
  },
  "started_at": "2025-11-11T10:30:00Z",
  "completed_at": null,
  "error_message": null
}
```

#### 1.3. 분석 결과 조회

**요청**:
```http
GET /api/v1/documents/{document_id}/llm-analysis-results?skip=0&limit=50
```

**응답**:
```json
{
  "document_id": "uuid-here",
  "results": [
    {
      "chunk_index": 0,
      "chunk_text": "원본 텍스트...",
      "llm_response": "LLM 응답 텍스트...",
      "tokens_used": 450,
      "processing_time_ms": 1200
    },
    {
      "chunk_index": 1,
      "chunk_text": "원본 텍스트...",
      "llm_response": "LLM 응답 텍스트...",
      "tokens_used": 380,
      "processing_time_ms": 980
    }
  ],
  "total": 120,
  "skip": 0,
  "limit": 50
}
```

#### 1.4. 분석 일시정지

**요청**:
```http
POST /api/v1/documents/{document_id}/pause-analysis
```

**응답**:
```json
{
  "document_id": "uuid-here",
  "status": "paused",
  "processed_chunks": 10,
  "total_chunks": 120,
  "actual_cost_so_far": {
    "total_tokens_used": 15000,
    "total_cost_usd": 0.45
  },
  "message": "분석이 일시정지되었습니다. 재개하려면 resume-analysis를 호출하세요."
}
```

#### 1.5. 분석 재개

**요청**:
```http
POST /api/v1/documents/{document_id}/resume-analysis
```

**응답**:
```json
{
  "document_id": "uuid-here",
  "status": "processing",
  "processed_chunks": 10,
  "remaining_chunks": 110,
  "message": "분석이 재개되었습니다."
}
```

#### 1.6. 분석 취소

**요청**:
```http
POST /api/v1/documents/{document_id}/cancel-analysis
```

**응답**:
```json
{
  "document_id": "uuid-here",
  "status": "cancelled",
  "processed_chunks": 10,
  "total_cost_usd": 0.45,
  "message": "분석이 취소되었습니다. 지금까지 처리된 결과는 보존됩니다."
}
```

---

### 1.7. 분석 요약 CRUD

#### 1.7.1. 요약 생성 (임시 저장)

**요청**:
```http
POST /api/v1/analysis-summaries
Content-Type: application/json

{
  "document_id": "uuid-here",
  "job_id": "uuid-here",
  "title": "문서 요약 - 2025-11-11",
  "summary_content": "전체 문서에 대한 요약 내용...",
  "tags": ["요약", "자동생성"],
  "is_public": false
}
```

**응답**:
```json
{
  "id": "uuid-here",
  "document_id": "uuid-here",
  "job_id": "uuid-here",
  "title": "문서 요약 - 2025-11-11",
  "summary_content": "전체 문서에 대한 요약 내용...",
  "tags": ["요약", "자동생성"],
  "is_public": false,
  "created_at": "2025-11-11T10:30:00Z",
  "updated_at": "2025-11-11T10:30:00Z"
}
```

#### 1.7.2. 요약 목록 조회

**요청**:
```http
GET /api/v1/analysis-summaries?document_id={document_id}&skip=0&limit=20
```

**응답**:
```json
{
  "summaries": [
    {
      "id": "uuid-here",
      "document_id": "uuid-here",
      "title": "문서 요약 - 2025-11-11",
      "tags": ["요약", "자동생성"],
      "created_at": "2025-11-11T10:30:00Z"
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 20
}
```

#### 1.7.3. 요약 상세 조회

**요청**:
```http
GET /api/v1/analysis-summaries/{summary_id}
```

**응답**:
```json
{
  "id": "uuid-here",
  "document_id": "uuid-here",
  "job_id": "uuid-here",
  "title": "문서 요약 - 2025-11-11",
  "summary_content": "전체 문서에 대한 요약 내용...",
  "tags": ["요약", "자동생성"],
  "is_public": false,
  "created_at": "2025-11-11T10:30:00Z",
  "updated_at": "2025-11-11T10:30:00Z"
}
```

#### 1.7.4. 요약 수정

**요청**:
```http
PUT /api/v1/analysis-summaries/{summary_id}
Content-Type: application/json

{
  "title": "수정된 요약 제목",
  "summary_content": "수정된 요약 내용...",
  "tags": ["요약", "수정됨"]
}
```

**응답**:
```json
{
  "id": "uuid-here",
  "title": "수정된 요약 제목",
  "summary_content": "수정된 요약 내용...",
  "tags": ["요약", "수정됨"],
  "updated_at": "2025-11-11T11:00:00Z"
}
```

#### 1.7.5. 요약 삭제

**요청**:
```http
DELETE /api/v1/analysis-summaries/{summary_id}
```

**응답**:
```json
{
  "message": "요약이 삭제되었습니다.",
  "deleted_id": "uuid-here"
}
```

---

### 2. Spring Boot 프록시 엔드포인트

#### 2.1. 청크 분석 시작 (프록시)

**요청**:
```http
POST /api/rag/documents/{documentId}/analyze-with-llm
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "llmProvider": "openai",
  "llmModel": "gpt-4",
  "promptTemplate": "다음 텍스트를 요약하세요:\n\n{chunk_text}",
  "chunkBatchSize": 10,
  "maxTokens": 500,
  "temperature": 0.7
}
```

**응답**:
```json
{
  "status": "processing",
  "documentId": "uuid-here",
  "totalChunks": 120,
  "message": "분석이 시작되었습니다."
}
```

#### 2.2. 진행 상황 조회 (프록시)

**요청**:
```http
GET /api/rag/documents/{documentId}/llm-analysis-status
Authorization: Bearer {jwt-token}
```

**응답**:
```json
{
  "documentId": "uuid-here",
  "status": "processing",
  "totalChunks": 120,
  "processedChunks": 45,
  "percentage": 37.5,
  "startedAt": "2025-11-11T10:30:00Z",
  "completedAt": null,
  "errorMessage": null
}
```

---

## 구현 단계

### Phase 1: FastAPI 백엔드 (핵심 로직)

#### Step 1.1: 의존성 추가
```bash
# rag-service/requirements.txt
openai==1.12.0
anthropic==0.18.0
```

#### Step 1.2: LLM 클라이언트 생성
**파일**: `rag-service/app/services/llm_client.py`

주요 기능:
- 다양한 LLM 제공자 통합 (OpenAI, Anthropic, Ollama)
- 통일된 인터페이스
- 재시도 로직 및 에러 핸들링

#### Step 1.3: 분석 서비스 생성
**파일**: `rag-service/app/services/llm_analysis_service.py`

주요 기능:
- 청크 순차 조회
- 배치 처리 (동시 N개 청크)
- LLM 질의 및 결과 수집
- 진행 상황 업데이트
- 결과 DB 저장

#### Step 1.4: DB 모델 추가
**파일**: `rag-service/app/models/llm_analysis.py`

테이블:
- `llm_analysis_jobs`: 분석 작업 메타데이터
- `llm_analysis_results`: 청크별 분석 결과
- `analysis_summaries`: 정리된 요약 (임시 저장)

**DB 스키마 상세**:
```sql
-- 분석 작업 메타데이터
CREATE TABLE llm_analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, processing, paused, completed, failed, cancelled
    llm_provider VARCHAR(50) NOT NULL,
    llm_model VARCHAR(100) NOT NULL,
    prompt_template TEXT NOT NULL,
    chunk_batch_size INTEGER DEFAULT 10,
    pause_after_batch BOOLEAN DEFAULT true,
    total_chunks INTEGER,
    processed_chunks INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 4) DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    paused_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 청크별 분석 결과
CREATE TABLE llm_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES llm_analysis_jobs(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    llm_response TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, chunk_index)
);

-- 분석 요약 (사용자가 정리한 내용)
CREATE TABLE analysis_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    job_id UUID REFERENCES llm_analysis_jobs(id) ON DELETE SET NULL,
    user_id UUID,  -- 작성자 (선택)
    title VARCHAR(255) NOT NULL,
    summary_content TEXT NOT NULL,
    tags VARCHAR(100)[],  -- 태그 배열
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_llm_analysis_jobs_document_id ON llm_analysis_jobs(document_id);
CREATE INDEX idx_llm_analysis_jobs_status ON llm_analysis_jobs(status);
CREATE INDEX idx_llm_analysis_results_job_id ON llm_analysis_results(job_id);
CREATE INDEX idx_llm_analysis_results_chunk_index ON llm_analysis_results(job_id, chunk_index);
CREATE INDEX idx_analysis_summaries_document_id ON analysis_summaries(document_id);
CREATE INDEX idx_analysis_summaries_user_id ON analysis_summaries(user_id);
```

#### Step 1.5: API 라우터 생성
**파일**: `rag-service/app/routers/llm_analysis.py`

엔드포인트:
- `POST /analyze-chunks-with-llm`: 분석 시작
- `GET /llm-analysis-status`: 진행 상황
- `GET /llm-analysis-results`: 결과 조회

#### Step 1.6: 라우터 등록
**파일**: `rag-service/app/main.py`

```python
from app.routers import llm_analysis

app.include_router(
    llm_analysis.router,
    prefix="/api/v1/documents",
    tags=["llm-analysis"]
)
```

---

### Phase 2: Spring Boot 프록시

#### Step 2.1: DTO 생성
**파일들**:
- `RagLlmAnalysisRequest.java`
- `RagLlmAnalysisResponse.java`
- `RagLlmAnalysisStatusResponse.java`

#### Step 2.2: 서비스 메서드 추가
**파일**: `RagServiceImpl.java`

메서드:
```java
public RagLlmAnalysisResponse analyzeDocumentWithLlm(UUID documentId, RagLlmAnalysisRequest request);
public RagLlmAnalysisStatusResponse getLlmAnalysisStatus(UUID documentId);
public RagLlmAnalysisResultsResponse getLlmAnalysisResults(UUID documentId, int skip, int limit);
```

#### Step 2.3: 컨트롤러 엔드포인트 추가
**파일**: `RagController.java`

엔드포인트:
- `POST /api/rag/documents/{documentId}/analyze-with-llm`
- `GET /api/rag/documents/{documentId}/llm-analysis-status`
- `GET /api/rag/documents/{documentId}/llm-analysis-results`

---

### Phase 3: Frontend UI

#### Step 3.1: 새 컴포넌트 생성
**파일**: `DocumentAnalysis.jsx`

기능:
- "문서 전체 분석" 버튼
- 분석 설정 다이얼로그 (LLM 선택, 프롬프트 입력)
- 진행 상황 표시 (프로그레스 바 + 실시간 업데이트)
- 결과 테이블 및 다운로드

#### Step 3.2: RAG Context 확장
**파일**: `RAGContext.jsx`

추가 함수:
```javascript
const startLlmAnalysis = async (documentId, config) => { ... };
const getLlmAnalysisStatus = async (documentId) => { ... };
const getLlmAnalysisResults = async (documentId, skip, limit) => { ... };
```

#### Step 3.3: 통합
**파일**: `RAGDocumentManager.jsx`

DocumentList에 "전체 분석" 버튼 추가

---

## 코드 예시

### 0. FastAPI - 비용 추정 서비스

```python
# rag-service/app/services/cost_estimator.py

from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.rag import RAGEmbedding

class CostEstimator:
    """LLM API 비용 추정 서비스"""

    # LLM 가격표 (USD per 1K tokens)
    PRICING = {
        "openai": {
            "gpt-4": {"input": 0.01, "output": 0.06},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        },
        "anthropic": {
            "claude-3-opus": {"input": 0.015, "output": 0.075},
            "claude-3-sonnet": {"input": 0.003, "output": 0.015},
            "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
        },
        "ollama": {
            # 로컬 모델은 비용 없음
            "*": {"input": 0, "output": 0}
        }
    }

    def __init__(self, db: Session):
        self.db = db

    def estimate_analysis_cost(
        self,
        document_id: str,
        llm_provider: str,
        llm_model: str,
        prompt_template: str,
        max_tokens: int
    ) -> Dict:
        """분석 비용 추정"""

        # 1. 청크 조회
        chunks = self.db.query(RAGEmbedding)\
            .filter(RAGEmbedding.document_id == document_id)\
            .all()

        total_chunks = len(chunks)

        # 2. 평균 청크 크기 계산 (토큰 추정)
        total_chunk_length = sum(len(chunk.chunk_text) for chunk in chunks)
        avg_chunk_length = total_chunk_length / total_chunks if total_chunks > 0 else 0

        # 대략 1 token = 4 characters (영어 기준)
        avg_chunk_tokens = int(avg_chunk_length / 4)

        # 3. 프롬프트 오버헤드 추정
        prompt_overhead = len(prompt_template.replace("{chunk_text}", "")) / 4

        # 4. 총 입력/출력 토큰 추정
        estimated_input_tokens_per_chunk = int(avg_chunk_tokens + prompt_overhead)
        estimated_output_tokens_per_chunk = max_tokens

        total_input_tokens = estimated_input_tokens_per_chunk * total_chunks
        total_output_tokens = estimated_output_tokens_per_chunk * total_chunks
        total_tokens = total_input_tokens + total_output_tokens

        # 5. 비용 계산
        pricing = self._get_pricing(llm_provider, llm_model)

        input_cost = (total_input_tokens / 1000) * pricing["input"]
        output_cost = (total_output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost

        cost_per_chunk = total_cost / total_chunks if total_chunks > 0 else 0

        # 6. 경고 메시지 생성
        warnings = self._generate_warnings(total_cost, total_chunks, llm_provider)

        return {
            "document_id": document_id,
            "total_chunks": total_chunks,
            "estimated_input_tokens": total_input_tokens,
            "estimated_output_tokens": total_output_tokens,
            "estimated_total_tokens": total_tokens,
            "cost_breakdown": {
                "input_cost_usd": round(input_cost, 4),
                "output_cost_usd": round(output_cost, 4),
                "total_cost_usd": round(total_cost, 4)
            },
            "cost_per_chunk_usd": round(cost_per_chunk, 4),
            "model_pricing": {
                "provider": llm_provider,
                "model": llm_model,
                "input_price_per_1k": pricing["input"],
                "output_price_per_1k": pricing["output"]
            },
            "warnings": warnings
        }

    def _get_pricing(self, provider: str, model: str) -> Dict[str, float]:
        """모델 가격 조회"""
        if provider not in self.PRICING:
            # 기본값
            return {"input": 0.01, "output": 0.03}

        if model in self.PRICING[provider]:
            return self.PRICING[provider][model]

        # Ollama 등 로컬 모델
        if "*" in self.PRICING[provider]:
            return self.PRICING[provider]["*"]

        # 기본값
        return {"input": 0.01, "output": 0.03}

    def _generate_warnings(self, total_cost: float, total_chunks: int, provider: str) -> List[str]:
        """경고 메시지 생성"""
        warnings = []

        if provider == "ollama":
            warnings.append("로컬 모델을 사용하므로 API 비용이 발생하지 않습니다.")
        else:
            if total_cost > 10:
                warnings.append(f"⚠️ 높은 비용 경고: 이 작업은 약 ${total_cost:.2f}의 비용이 발생할 수 있습니다.")
            elif total_cost > 1:
                warnings.append(f"이 작업은 약 ${total_cost:.2f}의 비용이 발생할 수 있습니다.")
            else:
                warnings.append(f"예상 비용: 약 ${total_cost:.2f}")

        warnings.append(f"총 {total_chunks}개 청크를 처리합니다.")
        warnings.append("실제 비용은 청크 크기와 LLM 응답 길이에 따라 달라질 수 있습니다.")

        return warnings
```

---

### 1. FastAPI - LLM 클라이언트

```python
# rag-service/app/services/llm_client.py

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import openai
import anthropic

class BaseLlmClient(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """LLM에게 질의하고 응답 반환"""
        pass

class OpenAIClient(BaseLlmClient):
    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.client = openai.AsyncOpenAI(api_key=api_key)
        self.model = model

    async def generate(self, prompt: str, max_tokens: int = 500, temperature: float = 0.7):
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature
        )
        return {
            "text": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens,
            "model": self.model
        }

class AnthropicClient(BaseLlmClient):
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229"):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = model

    async def generate(self, prompt: str, max_tokens: int = 500, temperature: float = 0.7):
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        return {
            "text": response.content[0].text,
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
            "model": self.model
        }

class LlmClientFactory:
    @staticmethod
    def create_client(provider: str, api_key: str, model: str) -> BaseLlmClient:
        if provider == "openai":
            return OpenAIClient(api_key, model)
        elif provider == "anthropic":
            return AnthropicClient(api_key, model)
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
```

---

### 2. FastAPI - 분석 서비스

```python
# rag-service/app/services/llm_analysis_service.py

import asyncio
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.rag import RAGEmbedding
from app.models.llm_analysis import LlmAnalysisJob, LlmAnalysisResult
from app.services.llm_client import LlmClientFactory

class LlmAnalysisService:
    def __init__(self, db: Session):
        self.db = db

    async def analyze_document_chunks(
        self,
        document_id: UUID,
        llm_provider: str,
        llm_model: str,
        llm_api_key: str,
        prompt_template: str,
        chunk_batch_size: int = 10,
        max_tokens: int = 500,
        temperature: float = 0.7
    ):
        # 1. 작업 생성
        job = LlmAnalysisJob(
            document_id=document_id,
            status="processing",
            started_at=datetime.utcnow()
        )
        self.db.add(job)
        self.db.commit()

        try:
            # 2. LLM 클라이언트 생성
            llm_client = LlmClientFactory.create_client(
                llm_provider, llm_api_key, llm_model
            )

            # 3. 청크 순차 조회
            chunks = self.db.query(RAGEmbedding)\
                .filter(RAGEmbedding.document_id == document_id)\
                .order_by(RAGEmbedding.chunk_index)\
                .all()

            total_chunks = len(chunks)
            job.total_chunks = total_chunks
            self.db.commit()

            # 4. 배치 처리
            for i in range(0, total_chunks, chunk_batch_size):
                batch = chunks[i:i + chunk_batch_size]
                tasks = []

                for chunk in batch:
                    # 프롬프트 생성
                    prompt = prompt_template.format(chunk_text=chunk.chunk_text)

                    # 비동기 LLM 호출
                    task = self._process_chunk(
                        llm_client, job.id, chunk, prompt, max_tokens, temperature
                    )
                    tasks.append(task)

                # 배치 실행
                await asyncio.gather(*tasks)

                # 진행 상황 업데이트
                job.processed_chunks = min(i + chunk_batch_size, total_chunks)
                self.db.commit()

            # 5. 완료 처리
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            self.db.commit()

        except Exception as e:
            # 에러 처리
            job.status = "failed"
            job.error_message = str(e)
            self.db.commit()
            raise

    async def _process_chunk(
        self,
        llm_client,
        job_id: UUID,
        chunk: RAGEmbedding,
        prompt: str,
        max_tokens: int,
        temperature: float
    ):
        """단일 청크 처리"""
        start_time = datetime.utcnow()

        # LLM 질의
        response = await llm_client.generate(prompt, max_tokens, temperature)

        processing_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        # 결과 저장
        result = LlmAnalysisResult(
            job_id=job_id,
            chunk_index=chunk.chunk_index,
            chunk_text=chunk.chunk_text,
            llm_response=response["text"],
            tokens_used=response["tokens_used"],
            processing_time_ms=processing_time_ms
        )
        self.db.add(result)
        self.db.commit()
```

---

### 3. FastAPI - 라우터

```python
# rag-service/app/routers/llm_analysis.py

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.services.llm_analysis_service import LlmAnalysisService
from app.schemas.llm_analysis import (
    LlmAnalysisRequest,
    LlmAnalysisResponse,
    LlmAnalysisStatusResponse
)

router = APIRouter()

@router.post("/{document_id}/analyze-chunks-with-llm", response_model=LlmAnalysisResponse)
async def analyze_chunks_with_llm(
    document_id: UUID,
    request: LlmAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """청크 순차 LLM 분석 시작"""

    # 문서 존재 확인
    from app.models.rag import RAGDocument
    document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # 백그라운드 태스크 시작
    service = LlmAnalysisService(db)
    background_tasks.add_task(
        service.analyze_document_chunks,
        document_id=document_id,
        llm_provider=request.llm_provider,
        llm_model=request.llm_model,
        llm_api_key=request.llm_api_key,
        prompt_template=request.prompt_template,
        chunk_batch_size=request.chunk_batch_size,
        max_tokens=request.max_tokens,
        temperature=request.temperature
    )

    return LlmAnalysisResponse(
        status="processing",
        document_id=document_id,
        total_chunks=document.total_chunks,
        message="분석이 시작되었습니다."
    )

@router.get("/{document_id}/llm-analysis-status", response_model=LlmAnalysisStatusResponse)
async def get_llm_analysis_status(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    """분석 진행 상황 조회"""
    from app.models.llm_analysis import LlmAnalysisJob

    job = db.query(LlmAnalysisJob)\
        .filter(LlmAnalysisJob.document_id == document_id)\
        .order_by(LlmAnalysisJob.started_at.desc())\
        .first()

    if not job:
        raise HTTPException(status_code=404, detail="No analysis job found")

    percentage = 0
    if job.total_chunks > 0:
        percentage = (job.processed_chunks / job.total_chunks) * 100

    return LlmAnalysisStatusResponse(
        document_id=document_id,
        status=job.status,
        total_chunks=job.total_chunks,
        processed_chunks=job.processed_chunks,
        percentage=round(percentage, 2),
        started_at=job.started_at,
        completed_at=job.completed_at,
        error_message=job.error_message
    )
```

---

### 4. Spring Boot - DTO

```java
// src/main/java/com/testcase/testcasemanagement/dto/rag/RagLlmAnalysisRequest.java

package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagLlmAnalysisRequest {

    @JsonProperty("llm_provider")
    private String llmProvider;  // "openai", "anthropic" 등

    @JsonProperty("llm_model")
    private String llmModel;  // "gpt-4", "claude-3-sonnet" 등

    @JsonProperty("llm_api_key")
    private String llmApiKey;  // API 키 (선택)

    @JsonProperty("llm_base_url")
    private String llmBaseUrl;  // 커스텀 엔드포인트 (선택)

    @JsonProperty("prompt_template")
    private String promptTemplate;  // "{chunk_text}" 플레이스홀더 포함

    @JsonProperty("chunk_batch_size")
    private Integer chunkBatchSize;  // 동시 처리 청크 수

    @JsonProperty("max_tokens")
    private Integer maxTokens;  // LLM 응답 최대 토큰

    @JsonProperty("temperature")
    private Double temperature;  // LLM 온도
}
```

---

### 5. Frontend - DocumentAnalysis 컴포넌트

```jsx
// src/main/frontend/src/components/RAG/DocumentAnalysis.jsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  LinearProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useRAG } from '../../context/RAGContext';

export default function DocumentAnalysis({ document, open, onClose }) {
  const { startLlmAnalysis, getLlmAnalysisStatus } = useRAG();

  const [analyzing, setAnalyzing] = useState(false);
  const [config, setConfig] = useState({
    llmProvider: 'openai',
    llmModel: 'gpt-4',
    promptTemplate: '다음 텍스트를 요약하세요:\n\n{chunk_text}',
    chunkBatchSize: 10,
    maxTokens: 500,
    temperature: 0.7
  });
  const [progress, setProgress] = useState({
    status: 'idle',
    percentage: 0,
    processedChunks: 0,
    totalChunks: 0
  });

  const handleStartAnalysis = async () => {
    try {
      setAnalyzing(true);
      await startLlmAnalysis(document.id, config);

      // 진행 상황 폴링
      const interval = setInterval(async () => {
        const status = await getLlmAnalysisStatus(document.id);
        setProgress(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setAnalyzing(false);
        }
      }, 2000);

    } catch (error) {
      console.error('분석 시작 실패:', error);
      setAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>문서 전체 분석 (LLM)</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            문서: {document.fileName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            전체 청크 수: {document.totalChunks}
          </Typography>
        </Box>

        {/* LLM 설정 */}
        <Select
          fullWidth
          label="LLM 제공자"
          value={config.llmProvider}
          onChange={(e) => setConfig({...config, llmProvider: e.target.value})}
          disabled={analyzing}
          sx={{ mb: 2 }}
        >
          <MenuItem value="openai">OpenAI</MenuItem>
          <MenuItem value="anthropic">Anthropic</MenuItem>
          <MenuItem value="ollama">Ollama</MenuItem>
        </Select>

        <TextField
          fullWidth
          label="모델"
          value={config.llmModel}
          onChange={(e) => setConfig({...config, llmModel: e.target.value})}
          disabled={analyzing}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="프롬프트 템플릿"
          value={config.promptTemplate}
          onChange={(e) => setConfig({...config, promptTemplate: e.target.value})}
          disabled={analyzing}
          helperText="{chunk_text} 플레이스홀더를 사용하세요"
          sx={{ mb: 2 }}
        />

        {/* 진행 상황 */}
        {analyzing && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              진행 상황: {progress.processedChunks} / {progress.totalChunks} ({progress.percentage}%)
            </Typography>
            <LinearProgress variant="determinate" value={progress.percentage} sx={{ mt: 1 }} />
          </Box>
        )}

        {progress.status === 'completed' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            분석이 완료되었습니다!
          </Alert>
        )}

        {progress.status === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            분석 실패: {progress.errorMessage}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={analyzing}>
          닫기
        </Button>
        <Button
          onClick={handleStartAnalysis}
          variant="contained"
          disabled={analyzing}
        >
          {analyzing ? '분석 중...' : '분석 시작'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 테스트 시나리오

### 1. 단위 테스트

#### FastAPI - LLM 클라이언트 테스트
```python
async def test_openai_client():
    client = OpenAIClient(api_key="test-key", model="gpt-4")
    response = await client.generate("Hello", max_tokens=10)
    assert "text" in response
    assert "tokens_used" in response
```

#### Spring Boot - 프록시 테스트
```java
@Test
void testAnalyzeDocumentWithLlm() {
    RagLlmAnalysisRequest request = new RagLlmAnalysisRequest();
    request.setLlmProvider("openai");
    request.setLlmModel("gpt-4");

    RagLlmAnalysisResponse response = ragService.analyzeDocumentWithLlm(documentId, request);
    assertEquals("processing", response.getStatus());
}
```

---

### 2. 통합 테스트

#### E2E 시나리오
```javascript
// e2e-tests/rag-llm-analysis-test.js

test('문서 전체 LLM 분석', async () => {
  // 1. 로그인
  await page.goto('/');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin');
  await page.click('button[type="submit"]');

  // 2. 프로젝트 선택
  await page.click('button:has-text("프로젝트 열기")');

  // 3. RAG 문서 관리 탭
  await page.click('text=RAG 문서');

  // 4. 문서 선택 및 분석 시작
  await page.click('button:has-text("전체 분석")');
  await page.fill('textarea[label="프롬프트 템플릿"]', '요약하세요: {chunk_text}');
  await page.click('button:has-text("분석 시작")');

  // 5. 진행 상황 확인
  await page.waitForSelector('text=진행 상황:', { timeout: 5000 });

  // 6. 완료 대기
  await page.waitForSelector('text=분석이 완료되었습니다!', { timeout: 60000 });
});
```

---

## 성능 고려사항

### 1. 청크 배치 처리
- **병렬 처리**: `chunk_batch_size` 파라미터로 동시 N개 청크 처리
- **권장값**: 5-10 (LLM API 레이트 리밋 고려)

### 2. LLM API 최적화
- **재시도 로직**: 네트워크 오류 시 exponential backoff
- **타임아웃 설정**: 30-60초 (긴 응답 대비)
- **캐싱**: 동일한 청크 재처리 방지

### 3. 데이터베이스 최적화
- **인덱스**: `llm_analysis_jobs(document_id)`, `llm_analysis_results(job_id, chunk_index)`
- **페이지네이션**: 결과 조회 시 `skip`/`limit` 필수

### 4. 비용 관리
- **토큰 카운팅**: 각 청크별 토큰 사용량 기록
- **총 비용 추정**: 분석 시작 전 예상 비용 계산 및 표시
- **제한 설정**: 최대 청크 수 또는 최대 비용 한도 설정

---

## 보안 고려사항

### 1. API 키 관리
- **환경변수**: API 키는 환경변수 또는 시크릿 관리 시스템에 저장
- **사용자 키**: 사용자가 자신의 API 키를 입력할 수 있도록 옵션 제공
- **암호화**: DB에 저장 시 암호화 필수

### 2. 권한 관리
- **프로젝트 권한**: 사용자가 해당 프로젝트의 문서만 분석 가능
- **리소스 제한**: 사용자당 동시 분석 작업 수 제한

### 3. 데이터 프라이버시
- **민감 정보**: 청크에 민감 정보 포함 여부 경고
- **로그 관리**: LLM 요청/응답 로그에서 민감 정보 제거

---

## 향후 확장 계획

### 1. 스트리밍 응답
- LLM 응답을 실시간 스트리밍으로 표시
- SSE (Server-Sent Events) 활용

### 2. 커스텀 파이프라인
- 여러 LLM을 순차적으로 적용 (예: 요약 → 키워드 추출 → 분류)
- 파이프라인 템플릿 저장 및 재사용

### 3. 결과 후처리
- 분석 결과 병합 및 최종 보고서 생성
- 차트 및 시각화 생성

### 4. 다국어 지원
- i18n 시스템과 통합
- UI 텍스트 다국어 지원

---

## 참고 자료

### 문서
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Spring WebClient](https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html)

### 프로젝트 내부 문서
- `CLAUDE.md` - 프로젝트 전체 가이드
- `docs/JIRA_INTEGRATION.md` - JIRA 워크플로우
- `docs/E2E_TESTING_GUIDE.md` - E2E 테스트 가이드

---

## 체크리스트

### Phase 1: FastAPI 백엔드
- [ ] 의존성 추가 (`openai`, `anthropic`)
- [ ] **비용 추정 서비스** 구현 (`cost_estimator.py`) ⭐
- [ ] LLM 클라이언트 구현 (`llm_client.py`)
- [ ] **분석 서비스** 구현 (`llm_analysis_service.py`)
  - [ ] 배치 확인 로직 (10개 단위)
  - [ ] 일시정지/재개 메커니즘
  - [ ] 실시간 비용 추적
- [ ] **요약 CRUD 서비스** 구현 (`analysis_summary_service.py`) ⭐
- [ ] DB 모델 추가 (`models/llm_analysis.py`)
  - [ ] `LlmAnalysisJob` (작업 메타데이터)
  - [ ] `LlmAnalysisResult` (청크별 결과)
  - [ ] `AnalysisSummary` (요약 CRUD) ⭐
- [ ] Pydantic 스키마 추가 (`schemas/llm_analysis.py`, `schemas/analysis_summary.py`)
- [ ] 라우터 구현 (`routers/llm_analysis.py`, `routers/analysis_summary.py`)
  - [ ] 비용 추정 API
  - [ ] 분석 시작/상태/결과 API
  - [ ] 일시정지/재개/취소 API ⭐
  - [ ] 요약 CRUD API ⭐
- [ ] 라우터 등록 (`main.py`)
- [ ] 단위 테스트 작성

### Phase 2: Spring Boot 프록시
- [ ] DTO 생성
  - [ ] `RagLlmAnalysisRequest`, `Response`, `StatusResponse`
  - [ ] `RagCostEstimateRequest`, `Response` ⭐
  - [ ] `RagAnalysisSummaryRequest`, `Response` ⭐
- [ ] 서비스 메서드 추가 (`RagServiceImpl`)
  - [ ] 비용 추정 프록시
  - [ ] 분석 시작/상태/결과 프록시
  - [ ] 일시정지/재개/취소 프록시 ⭐
  - [ ] 요약 CRUD 프록시 ⭐
- [ ] 컨트롤러 엔드포인트 추가 (`RagController`)
- [ ] 통합 테스트 작성

### Phase 3: Frontend UI
- [ ] **비용 경고 다이얼로그** 컴포넌트 생성 ⭐
  - [ ] 예상 비용 표시
  - [ ] 사용자 확인 필수
- [ ] **배치 확인 다이얼로그** 컴포넌트 생성 ⭐
  - [ ] 10개 단위 처리 후 일시정지
  - [ ] 계속/중단 선택
  - [ ] 실제 비용 표시
- [ ] `DocumentAnalysis.jsx` 컴포넌트 생성
  - [ ] 비용 추정 API 호출
  - [ ] 비용 경고 표시
  - [ ] 진행 상황 실시간 업데이트
  - [ ] 일시정지/재개/취소 버튼
- [ ] **`AnalysisSummaryManager.jsx` 컴포넌트 생성** ⭐
  - [ ] 요약 목록 테이블
  - [ ] 요약 작성/편집 다이얼로그
  - [ ] 요약 상세보기
  - [ ] 삭제 확인 다이얼로그
- [ ] `RAGContext.jsx`에 API 함수 추가
  - [ ] 비용 추정, 분석 시작/상태/결과
  - [ ] 일시정지/재개/취소
  - [ ] 요약 CRUD
- [ ] `RAGDocumentManager.jsx`에 버튼 통합
- [ ] E2E 테스트 작성
  - [ ] 비용 경고 시나리오
  - [ ] 배치 확인 시나리오
  - [ ] 요약 CRUD 시나리오

### 배포
- [ ] Docker 이미지 빌드 (FastAPI)
- [ ] 환경변수 설정 (API 키 등)
- [ ] 데이터베이스 마이그레이션 (3개 테이블)
- [ ] 프로덕션 테스트
  - [ ] 비용 추정 정확도 검증
  - [ ] 배치 확인 메커니즘 테스트
  - [ ] 요약 CRUD 기능 테스트

---

## 작성 정보

- **작성일**: 2025-11-11
- **작성자**: Claude Code
- **문서 버전**: 2.0
- **관련 브랜치**: `claude/sequential-chunk-llm-query-011CV1cEoEhqf8YgDgK1DkGv`

---

## 변경 이력

### Version 2.0 (2025-11-11)
**주요 개선사항**:
1. ✅ **사용자 명시적 요청 필수** 원칙 추가
   - 사용자가 명시적으로 요청할 때만 실행
   - 단순 질문 시 자동 실행 금지

2. ✅ **비용 경고 시스템** 추가
   - 분석 시작 전 비용 추정 API (`/estimate-analysis-cost`)
   - LLM 제공자별 가격표 (OpenAI, Anthropic, Ollama)
   - 예상 토큰 사용량 및 USD 비용 계산
   - 경고 메시지 자동 생성

3. ✅ **배치 확인 메커니즘** 추가
   - 10개 청크 단위로 자동 일시정지
   - 사용자에게 계속 진행 여부 확인
   - 일시정지/재개/취소 API 추가
   - 실제 비용 실시간 추적

4. ✅ **분석 결과 요약 CRUD** 추가
   - `analysis_summaries` 테이블 추가
   - 요약 생성/조회/수정/삭제 API
   - 임시 저장 및 사용자 삭제 기능
   - 태그 및 공개 여부 관리

5. ✅ **DB 스키마 확장**
   - `llm_analysis_jobs`: `pause_after_batch`, `paused_at` 컬럼 추가
   - `llm_analysis_jobs`: `total_tokens_used`, `total_cost_usd` 컬럼 추가
   - `analysis_summaries`: 새 테이블 추가

6. ✅ **Frontend UI 확장**
   - 비용 경고 다이얼로그 컴포넌트
   - 배치 확인 다이얼로그 컴포넌트
   - `AnalysisSummaryManager.jsx` (요약 CRUD UI)

7. ✅ **코드 예시 추가**
   - `CostEstimator` 서비스 (비용 추정)
   - 배치 확인 로직

### Version 1.0 (2025-11-11)
- 초기 설계 문서 작성
- 기본 아키텍처 및 API 명세
- FastAPI + Spring Boot + React 구조

---

## 질문 및 피드백

이 문서에 대한 질문이나 피드백이 있으시면 JIRA 이슈를 생성하거나 개발 팀에 문의하세요.

---

## 부록: 사용 시나리오

### 시나리오 1: 비용 인식 문서 요약

1. **사용자**: "이 문서를 전체 요약해줘" (명시적 요청)
2. **시스템**: 비용 추정 API 호출
3. **시스템**: "예상 비용 $5.40, 120개 청크 처리. 계속하시겠습니까?" (비용 경고)
4. **사용자**: "확인" 클릭
5. **시스템**: 10개 청크 처리 후 일시정지
6. **시스템**: "10개 처리 완료, 실제 비용 $0.45. 계속하시겠습니까?" (배치 확인)
7. **사용자**: "계속" 클릭
8. **반복**: 120개 청크 모두 처리될 때까지 반복
9. **사용자**: 결과를 확인하고 요약 작성 다이얼로그에서 정리
10. **사용자**: "문서 핵심 요약" 제목으로 저장

### 시나리오 2: 중간 취소 및 재개

1. **사용자**: 문서 분석 시작
2. **시스템**: 30개 청크 처리 후 배치 확인
3. **사용자**: "일시정지" 클릭 (긴급 업무 발생)
4. **시스템**: 상태를 "paused"로 변경, 실제 비용 $1.35 표시
5. **1시간 후 사용자**: "재개" 버튼 클릭
6. **시스템**: 31번 청크부터 계속 처리
7. **완료 후**: 요약 저장 및 공유

### 시나리오 3: 비용 초과 방지

1. **사용자**: 대용량 문서 (500개 청크) 분석 시도
2. **시스템**: "예상 비용 $22.50" 경고 표시
3. **사용자**: "너무 비싸다, 취소" 클릭
4. **대안**: 사용자가 일부 챕터만 선택하여 재분석 (100개 청크, $4.50)
