# AGENTS.md (Unified Guidelines)

This file provides comprehensive guidance for AI Agents when working with code in this repository.

---

## 1. 🚀 Project Overview

### 1.1. General

This is a full-stack test case management application built with:

- **Frontend**: React 18 with Material-UI and React Router for SPA navigation
- **Backend**: Spring Boot 3.4.12 with Java 21, PostgreSQL database
- **Authentication**: JWT-based authentication with access/refresh token system
- **Build System**: Gradle with integrated Node.js frontend build
  - **⚠️ IMPORTANT**: `./gradlew bootRun` builds **both frontend and backend** and runs them together
  - Frontend is automatically built (Vite build to `src/main/frontend/build`) and served from `src/main/resources/static/`
  - **DO NOT** run frontend dev server separately unless specifically needed for hot-reload development
  - Application runs on **port 8080** (backend serves frontend static files)
  - **개발 환경 전제조건**: Docker Compose로 PostgreSQL, MinIO, RAG 서비스 실행 필요
- **Testing**: TestNG with Allure reporting, Playwright MCP for automated browser testing and UI validation
- **Unit Testing Framework**: TestNG (NOT JUnit) - 모든 단위 테스트는 TestNG로 작성

### 1.2. Architecture

#### Frontend Structure

- **React SPA** located in `src/main/frontend/` with URL-based routing
- **Context-based state management** with AppContext.jsx providing global state and API integration
- **JWT Authentication** with automatic token refresh and session management
- **Component hierarchy**: App → ProjectManager → TestCaseTree/Forms → Individual components
- **Material-UI components** for consistent styling and layout
- **URL-based navigation**: `/projects/:projectId/testcases/:testCaseId` pattern

#### Backend Structure

- **Spring Boot REST API** with standard layered architecture:
  - Controllers: Handle HTTP requests and responses
  - Services: Business logic implementation
  - Repositories: Data access layer using Spring Data JPA
  - DTOs: Data transfer objects for API communication
  - Models: JPA entities representing database tables

#### RAG (Retrieval-Augmented Generation) System Architecture

**Three-Tier Service Integration**: React Frontend → Spring Boot Backend → FastAPI RAG Service

**Architecture Flow**:

```
Frontend (React)
    ↓ HTTP/REST
Spring Boot Backend (Port 8080)
    ↓ WebClient
FastAPI RAG Service (Port 8001)
    ↓
PostgreSQL (pgvector) + MinIO (S3)
```

**Key Components**:

- **Frontend Layer** (`src/main/frontend/src/components/RAG/`)

  - `RAGDocumentManager.jsx` - Main RAG UI container
  - `DocumentUpload.jsx` - File upload with drag-and-drop
  - `DocumentList.jsx` - Uploaded documents table
  - `SimilarTestCases.jsx` - Vector similarity search UI
  - `RAGContext.jsx` - React context for RAG state management

- **Spring Boot Layer** (`src/main/java/com/testcase/testcasemanagement/`)

  - `controller/RagController.java` - REST endpoints (`/api/rag/...`)
  - `service/RagService.java` & `RagServiceImpl.java` - Business logic
  - `dto/rag/` - DTOs with Jackson annotations for snake_case/camelCase mapping
  - `config/RagClientConfig.java` - WebClient configuration

- **FastAPI RAG Service** (`rag-service/`)
  - **Location**: `rag-service/` directory (Docker Compose stack)
  - **Endpoints**: `/api/v1/documents/`, `/api/v1/embeddings/`, `/api/v1/search/`
  - **Document Parsers**:
    - `pypdf2` - Basic local parser (default, stable)
    - `pymupdf` - Fast local parser
    - `pymupdf4llm` - LLM-optimized markdown extraction
    - `upstage` - Cloud API with advanced layout analysis (requires API key)
  - **Services**:
    - `document_service.py` - Document CRUD operations
    - `upstage_service.py` - Document parsing and chunking
    - `embedding_service.py` - Vector embeddings with OpenAI
    - `minio_service.py` - MinIO file storage operations
  - **Database**: PostgreSQL with pgvector extension for vector similarity search
  - **Storage**: MinIO object storage for document files

**Docker Services** (`docker-compose.yml`):

- `postgres` - Main PostgreSQL (port 5434)
- `postgres-rag` - PostgreSQL with pgvector (port 5433)
- `minio` - S3-compatible object storage (ports 9000/9001)
- `rag-service` - FastAPI application (port 8001)

**RAG Workflow**:

1. **Upload**: React → Spring Boot → FastAPI → MinIO + PostgreSQL
2. **Analyze**: FastAPI retrieves from MinIO → Parser extracts text → Chunks stored in DB
3. **Embed**: FastAPI generates vectors for chunks → Stores in pgvector
4. **Search**: Query → Vector similarity search → Return relevant chunks

**API Field Naming**:

- **Frontend/Spring Boot**: camelCase (`projectId`, `uploadedBy`, `fileName`)
- **FastAPI**: snake_case (`project_id`, `uploaded_by`, `file_name`)
- **Mapping**: Jackson `@JsonProperty` and `@JsonAlias` annotations in DTOs

**Configuration**:

- **Spring Boot**: `application.yml` - `rag.api.url=http://localhost:8001`
- **Docker**: `docker-compose.yml` - Environment variables
- **FastAPI**: `rag-service/app/main.py` - CORS, database, MinIO settings

**Starting Development Environment**:

```bash
# 1. Start Docker infrastructure services (PostgreSQL + MinIO + RAG Service)
cd docker-compose-build
docker-compose -f docker-compose.yml up -d postgres postgres-rag minio rag-service

# 2. Start Spring Boot application (includes frontend build)
cd ..
./gradlew bootRun

# Access
 - Application: http://localhost:8080
 - FastAPI Docs: http://localhost:8001/docs
 - MinIO Console: http://localhost:9001
```

### 1.4. Key Files and Locations

#### Frontend Key Files

- `src/main/frontend/src/App.jsx` - Main application component with routing
- `src/main/frontend/src/context/AppContext.jsx` - Global state management
- `src/main/frontend/src/components/` - All React components
- `src/main/frontend/src/models/` - Data models and demo data
- `src/main/frontend/src/utils/` - Utility functions for tree operations and progress calculation

#### Backend Key Files

- `src/main/java/com/testcase/testcasemanagement/` - Main application package
- `src/main/resources/application.yml` - Spring configuration
- `src/test/java/` - Java test files with JSON schema validation
- `src/test/resources/schemas/` - JSON schemas for API testing

#### JIRA Integration Files

**⚠️ 중요**: JIRA 통합 관련 상세 가이드는 **[docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md)**를 반드시 참조하세요.

- `d_mcpsvr_jira/` - JIRA 연동 모듈 디렉토리 (설정 및 사용법은 JIRA_INTEGRATION.md 참조)
- `d_mcpsvr_jira/.env` - JIRA 인증 정보 (설정 방법은 JIRA_INTEGRATION.md § 2 참조)

#### i18n (다국어) 시스템 파일

**⚠️ 중요**: 새로운 번역을 추가할 때는 **반드시 3개 파일을 모두 수정**해야 합니다.

**🔧 번역 추가 4단계 프로세스**:

**1단계: 번역 키 추가** (Keys Initializer)
**2단계: 한글 번역 추가** (Korean Translations)
**3단계: 영어 번역 추가** (English Translations)
**🔴 4단계: Initializer 등록 (CRITICAL)**: `TranslationKeyDataInitializer.java` 에 필드 추가 및 `initialize()` 호출 필수

---

## 2. 💻 Development Environment & Workflow

### 2.1. Prerequisites

**⚠️ Java Version Requirement**: This project requires **Java 21**.

### 2.2. Development Commands

#### Frontend Development

```bash
cd src/main/frontend
npm install          # Install dependencies
npm start           # Start development server (port 3000)
```

#### Backend Development

```bash
# 기본 개발 명령어
./gradlew bootRun                    # Start Spring Boot application (includes frontend)
./gradlew test                       # Run Java tests
```

#### ⚠️ Backend Modification Workflow (Required Steps)

백엔드 코드 수정 후에는 **반드시** 다음 절차를 수행해야 합니다:

1. **Restart Application**: `pkill -f "bootRun"` 후 재시작
2. **Issue New JWT Token**: 서버 재시작 시 H2 DB 초기화로 토큰 만료됨
3. **Verify New Resource IDs**: ID가 1부터 다시 시작되므로 확인 필요

---

## 3. 🧪 Testing Guidelines

### 3.1. Overall Testing Strategy

- **Backend Unit & Integration Tests**: TestNG
- **API Schema Validation**: JSON Schema
- **E2E Tests**: Playwright
- **Reporting**: Allure (Backend), Playwright Reporter (E2E)

---

## 4. Jira & Process Guidelines

### 4.1. JIRA Integration Overview

All tasks must be tracked in JIRA (Project: ICT).

- **Server**: `d_mcpsvr_jira/`
- **Execution**: Run python scripts from `d_mcpsvr_jira` directory.

### 4.2. JIRA Workflow

**⭐ 중요 규칙: `docs/JIRA_INTEGRATION.md` 참조 필수**

### 4.3. ⚠️ JIRA Completion Rules (CRITICAL)

**🚨 중요: JIRA 이슈 완료 처리는 반드시 사용자가 직접 수행해야 합니다.**

#### Agent 역할

- ✅ 작업 시작 및 진행 상황 업데이트
- ✅ 코드 구현 및 검증 (테스트 통과)
- ✅ 사용자에게 완료 확인 요청

#### 사용자 역할

- ⛔ **최종 완료 처리**: `add_completion_comment()` 호출 및 이슈 닫기
- ⛔ **배포 승인**: 운영환경 배포 결정

#### 🚫 금지 사항 (Prohibitions)

- ❌ `add_completion_comment()` 자동 호출 금지
- ❌ 이슈 상태를 "완료"로 자동 변경 금지
- ❌ 사용자 확인 없이 완료 처리 금지

---

## 6. 📝 Project-Specific Notes

- **Communication Language**: **ALWAYS use Korean (한국어)** for all responses, comments, and artifacts.
- **Artifacts**: `walkthrough.md`, `implementation_plan.md` must be in **Korean**.

---

## 7. 🚀 Application Startup Guide

### 7.1. Prerequisites

- **Java 21** installed and configured
- **Docker & Docker Compose** installed
- **Docker services running**: PostgreSQL, MinIO, RAG service

### 7.2. Starting Infrastructure (Docker)

```bash
cd docker-compose-build
docker-compose -f docker-compose.yml up -d postgres postgres-rag minio rag-service
```

### 7.3. Starting Application (Spring Boot + Frontend)

```bash
cd .. # Project Root
./gradlew bootRun
```

---

## 8. 🚨 File Deletion Policy

**⛔ Agent 파일 삭제 금지 (사용자 승인 필수)**

- **원칙**: Agent는 파일을 직접 삭제(`rm`)하지 않습니다.
- **절차**: 삭제가 필요한 경우 사용자에게 이유를 설명하고 승인을 요청하거나, 사용자가 직접 삭제하도록 안내합니다.
- **보안 원칙**: 데이터 보호 및 의도하지 않은 손실 방지
