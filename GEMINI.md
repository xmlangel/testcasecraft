# GEMINI.md (Reorganized)

This file provides guidance to Gemini when working with code in this repository.

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

### 1.3. Key Components
- **Test Case Management**: Hierarchical tree structure with parent-child relationships
- **Test Plan Management**: Collections of test cases for execution planning
- **Test Execution**: Running test plans and recording results
- **Project Management**: Multi-project support with user authentication
- **Dashboard**: Progress tracking and reporting with charts

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

#### E2E Testing Files
- `src/test/e2e/e2e-testcase-app.js` - 메인 E2E 테스트 스크립트 (UI 검증, 성능 측정)
- `src/test/e2e/playwright-test.js` - 기본 Playwright 기능 테스트
- `src/test/e2e/authentication/` - 인증 관련 E2E 테스트
- `src/test/e2e/dashboard/` - 대시보드 관련 E2E 테스트
- `src/test/e2e/playwright.config.js` - Playwright 설정 파일
- `playwright-report/` - Playwright 테스트 리포트
- `.claude-mcp.json` - Playwright MCP 서버 설정

#### Configuration
- `build.gradle` - Main build configuration with frontend integration
- `src/main/frontend/package.json` - Frontend dependencies and scripts
- `src/test/resources/allure.properties` - Allure reporting configuration

#### JIRA Integration Files
**⚠️ 중요**: JIRA 통합 관련 상세 가이드는 **[docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md)**를 반드시 참조하세요.

- `d_mcpsvr_jira/` - JIRA 연동 모듈 디렉토리 (설정 및 사용법은 JIRA_INTEGRATION.md 참조)
- `d_mcpsvr_jira/.env` - JIRA 인증 정보 (설정 방법은 JIRA_INTEGRATION.md § 2 참조)

#### i18n (다국어) 시스템 파일

**⚠️ 중요**: 새로운 번역을 추가할 때는 **반드시 모든 관련 파일을 수정**해야 합니다.

**번역 키 정의 (Translation Keys)**:
- `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/` - 번역 키 초기화 클래스들
  - `TestCaseKeysInitializer.java` - 테스트케이스 관련
  - `DashboardKeysInitializer.java` - 대시보드 관련
  - `ProjectKeysInitializer.java` - 프로젝트 관련
  - `UserManagementKeysInitializer.java` - 사용자 관리 관련
  - `AuthKeysInitializer.java` - 인증 관련
  - `CommonKeysInitializer.java` - 공통 UI 요소
  - `OrganizationKeysInitializer.java` - 조직 관련
  - `TestPlanKeysInitializer.java` - 테스트 플랜 관련
  - `TestExecutionKeysInitializer.java` - 테스트 실행 관련
  - `TestResultKeysInitializer.java` - 테스트 결과 관련
  - `MailKeysInitializer.java` - 메일 관련
  - `RAGKeysInitializer.java` - RAG 시스템 관련
  - `AttachmentKeysInitializer.java` - 첨부파일 관련
  - `SchedulerKeysInitializer.java` - 스케줄러 관련
  - `ExploratorySessionKeysInitializer.java` - 탐색적 세션 관련
  - `JiraIntegrationKeysInitializer.java` - JIRA 연동 관련
  - `ExtendedUIKeysInitializer.java` - 확장 UI 요소 관련
  - `TranslationManagementKeysInitializer.java` - 번역 관리 관련

**번역 데이터 (Translations)**:
- `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/` - 언어별 번역 구현체
  - `KoreanTestCaseAndAutomationTranslations.java` / `EnglishTestCaseAndAutomationTranslations.java`
  - `KoreanLoginDashboardAndProjectTranslations.java` / `EnglishLoginDashboardAndProjectTranslations.java`
  - `KoreanOrganizationAndUserManagementTranslations.java` / `EnglishOrganizationAndUserManagementTranslations.java`
  - `KoreanAdvancedFeaturesAndCommonUITranslations.java` / `EnglishAdvancedFeaturesAndCommonUITranslations.java`
  - `KoreanJiraIntegrationTranslations.java` / `EnglishJiraIntegrationTranslations.java`
  - `KoreanTestExecutionTranslations.java` / `EnglishTestExecutionTranslations.java`
  - `KoreanTestResultTranslations.java` / `EnglishTestResultTranslations.java`
  - `KoreanTranslationManagementTranslations.java` / `EnglishTranslationManagementTranslations.java`

**프론트엔드 사용**:
- `src/main/frontend/src/context/I18nContext.jsx` - i18n Context 및 Hook
- React 컴포넌트에서 `useI18n()` hook으로 `t()` 함수 사용

**🔧 번역 추가 4단계 프로세스**:

**1단계: 번역 키 추가** (Keys Initializer)
```java
// src/main/java/.../keys/TestCaseKeysInitializer.java
createTranslationKeyIfNotExists(
    "testcase.spreadsheet.fallback.title",  // 번역 키
    "testcase",                               // 카테고리
    "향상된 스프레드시트 모드 제목",          // 한글 설명
    "향상된 스프레드시트 모드"                // 기본값 (한글)
);
```

**2단계: 한글 번역 추가** (Korean Translations)
```java
// src/main/java/.../translations/KoreanTestCaseAndAutomationTranslations.java
createTranslationIfNotExists(
    "testcase.spreadsheet.fallback.title",  // 번역 키 (1단계와 동일)
    languageCode,                             // "ko"
    "향상된 스프레드시트 모드",               // 한글 번역
    createdBy
);
```

**3단계: 영어 번역 추가** (English Translations)
```java
// src/main/java/.../translations/EnglishTestCaseAndAutomationTranslations.java
createTranslationIfNotExists(
    "testcase.spreadsheet.fallback.title",  // 번역 키 (1단계와 동일)
    languageCode,                             // "en"
    "Enhanced Spreadsheet Mode",             // 영어 번역
    createdBy
);
```

**🔴 4단계: Initializer 등록 (CRITICAL - 이 단계를 빠뜨리면 번역이 작동하지 않음!)**

```java
// src/main/java/.../config/i18n/TranslationKeyDataInitializer.java

// 1. 필드 추가 (새로운 KeysInitializer를 만든 경우)
private final YourNewKeysInitializer yourNewKeysInitializer;

// 2. initialize() 메서드에 호출 추가
@Transactional
public void initialize() {
    // ... 기존 initializer들 ...
    yourNewKeysInitializer.initialize();  // 👈 이 줄을 반드시 추가!
    // ...
}
```

**5단계: React 컴포넌트에서 사용**
```jsx
import { useI18n } from '../context/I18nContext';

function MyComponent() {
  const { t } = useI18n();

  return (
    <div>
      {t('testcase.spreadsheet.fallback.title', '향상된 스프레드시트 모드')}
    </div>
  );
}
```

**⚠️ 주의사항**:
1. **번역 키는 반드시 먼저 생성**되어야 합니다 (Keys Initializer)
2. **3개 파일 모두 수정**하지 않으면 번역이 데이터베이스에 저장되지 않습니다
3. **번역 키 이름은 3개 파일에서 정확히 동일**해야 합니다
4. **🔴 TranslationKeyDataInitializer에 등록 필수**: 새로운 KeysInitializer를 만들었다면 **반드시** `TranslationKeyDataInitializer.java`에 필드를 추가하고 `initialize()` 메서드에서 호출해야 합니다. 이 단계를 빠뜨리면 번역 키가 DB에 저장되지 않아 한국어로만 표시됩니다.
5. **서버 재시작**이 필요합니다 (CommandLineRunner가 애플리케이션 시작 시 실행됨)
6. **매개변수 치환**은 `{count}`, `{title}` 등의 형식으로 사용합니다

**번역 키 카테고리**:
- `testcase` - 테스트케이스 관련
- `dashboard` - 대시보드 관련
- `project` - 프로젝트 관련
- `user` - 사용자 관리 관련
- `common` - 공통 UI 요소
- `auth` - 인증 관련
- `mail` - 메일 설정 관련
- `organization` - 조직 관련
- `testPlan` - 테스트 플랜 관련
- `testExecution` - 테스트 실행 관련
- `testResult` - 테스트 결과 관련
- `translation` - 번역 관리 페이지 관련

---

## 2. 💻 Development Environment & Workflow

### 2.1. Prerequisites
**⚠️ Java Version Requirement**: This project requires **Java 21**.
See **Section 7** for detailed startup instructions.

### 2.2. Development Commands

#### Frontend Development
```bash
cd src/main/frontend
npm install          # Install dependencies
npm start           # Start development server (port 3000)
npm run build       # Build for production
npm test            # Run Jest tests
```

#### Backend Development
```bash
# 기본 개발 명령어
./gradlew bootRun                    # Start Spring Boot application (includes frontend)
./gradlew build                      # Build entire project
./gradlew test                       # Run Java tests
./gradlew allureReport              # Generate Allure test reports
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

### 3.2. Backend Testing (TestNG)
```bash
# 로컬 H2 데이터베이스로 테스트
SPRING_PROFILES_ACTIVE=local ./gradlew test

# 특정 테스트 실행
./gradlew test --tests "*ControllerTest*"
```

### 3.3. E2E Testing (Playwright)

#### Overview
Playwright is the primary E2E testing tool. See `docs/E2E_TESTING_GUIDE.md` for full details.

#### Prerequisites
1. **Docker services running**: PostgreSQL, MinIO, RAG service (See Section 7)
2. **Backend is running**: `./gradlew bootRun`
3. **Application is accessible**: `curl http://localhost:8080`
4. **Database has test data**: Admin user and test projects exist

#### How to Run E2E Tests
**⚠️ Important**: Run from **project root directory**.

```bash
# 1. Restart Backend (Required for clean state)
pkill -f "bootRun"
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &
sleep 25

# 2. Run Tests (Run from root with --prefix or cd into directory)
npm run test:ict-138 --prefix src/test/e2e
# OR
npx playwright test src/test/e2e/authentication/ -c src/test/e2e/playwright.config.js
```

#### E2E Navigation Structure & Selectors
- **Flow**: 로그인(/) → 프로젝트 선택(/projects) → 개별 프로젝트(/projects/{id}) → 탭 선택
- **Selectors**:
  - `data-testid` 사용 권장 (예: `login-submit-button`, `testcase-tree-item-${id}`)
  - Text selector: `text=대시보드`, `button:has-text("저장")`

#### Test Rules
- **환경 설정**: `baseURL: 'http://localhost:8080'` 사용 (원격 서버 접속 금지)
- **실패 대응**: 테스트 실패 시 이슈를 '진행 중' 유지. 환경 문제(DB 등) 확인 후 재테스트.
- **완료 판정**: API 응답 확인만으로는 부족하며, 실제 UI 동작 검증 필요.

---

## 4. Jira & Process Guidelines

### 4.1. JIRA Integration Overview
All tasks must be tracked in JIRA (Project: ICT).
- **Server**: `d_mcpsvr_jira/`
- **Execution**: Run python scripts from `d_mcpsvr_jira` directory.

### 4.2. JIRA Workflow

**⭐ 중요 규칙: `docs/JIRA_INTEGRATION.md` 참조 필수**

1. **Search**: Check for existing issues.
2. **Start**: `quick_start('ICT-XX')` (Transitions to "In Progress")
3. **Update**: `add_progress_comment(...)` (Log progress, changed files)
4. **Complete**: **See Rules Below**

### 4.3. ⚠️ JIRA Completion Rules (CRITICAL)

**🚨 중요: JIRA 이슈 완료 처리는 반드시 사용자가 직접 수행해야 합니다.**

#### Gemini 역할
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

**예외**: 사용자가 "완료 처리해줘"라고 명시적으로 요청한 경우에만 수행.

### 4.4. Bug Fixing Workflow
1. **Analyze** -> 2. **Create Issue (Bug)** -> 3. **Fix** -> 4. **Test** -> 5. **Request Confirmation**

---

## 5. 🤖 MCP & AI Integration
- **Context7**: Documentation & Patterns
- **Playwright**: E2E Testing
- **JIRA**: Issue Tracking

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

# PostgreSQL, MinIO, RAG 서비스 시작
docker-compose -f docker-compose.yml up -d postgres postgres-rag minio rag-service

# 서비스 상태 확인
docker-compose -f docker-compose.yml ps
```

**Services:**
- PostgreSQL (5434), PostgreSQL RAG (5433)
- MinIO (9000/9001)
- RAG Service (8001)

### 7.3. Starting Application (Spring Boot + Frontend)

```bash
cd .. # Project Root

# 프론트엔드 빌드 + 백엔드 실행
./gradlew bootRun
```
- Runs on **http://localhost:8080**
- Frontend is automatically built and served
- Basic login: admin / admin123

### 7.4. Troubleshooting Startup Issues

#### Database Connection Issues
- **Docker 서비스 확인**: `docker-compose -f docker-compose.yml ps`
- **PostgreSQL 컨테이너 로그**: `docker logs testcasecraft_postgres_spring`
- **연결 테스트**: `psql -h localhost -p 5434 -U testcase_user -d testcase_management`

#### Memory Issues
```bash
# Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
./gradlew bootRun
```

### 7.5. Database & Data Management
- **Dev Data**: Persisted in `docker-compose-build/data/postgres/`.
- **DDL Auto**:
  - Dev/Prod: `update` (**⚠️ DO NOT CHANGE to create-drop in Prod**)

### 7.6. Security Checklist for Prod
1. ✅ `ddl-auto: update` confirmed
2. ✅ Strong `JWT_SECRET` & `DATABASE_PASSWORD`
3. ✅ Backup policy in place

---

## 8. 🚨 File Deletion Policy

**⛔ Gemini 파일 삭제 금지 (사용자 승인 필수)**

- **원칙**: Gemini는 파일을 직접 삭제(`rm`)하지 않습니다.
- **절차**: 삭제가 필요한 경우 사용자에게 이유를 설명하고 승인을 요청하거나, 사용자가 직접 삭제하도록 안내합니다.
- **보안 원칙**: 데이터 보호 및 의도하지 않은 손실 방지
