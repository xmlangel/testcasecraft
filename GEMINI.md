# GEMINI.md (Reorganized)

This file provides guidance to Gemini when working with code in this repository.

---

## 1. 🚀 Project Overview

### 1.1. General
This is a full-stack test case management application built with:
- **Frontend**: React 18 with Material-UI and React Router for SPA navigation
- **Backend**: Spring Boot 3.2.4 with Java 21, PostgreSQL database
- **Authentication**: JWT-based authentication with access/refresh token system
- **Build System**: Gradle with integrated Node.js frontend build
  - **⚠️ IMPORTANT**: `./gradlew bootRun` builds **both frontend and backend** and runs them together
  - Frontend is automatically built and served from `src/main/resources/static/`
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

**Docker Services** (`docker-compose-dev.yml`):
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
- **Docker**: `docker-compose-dev.yml` - Environment variables
- **FastAPI**: `rag-service/app/main.py` - CORS, database, MinIO settings

**Starting Development Environment**:
```bash
# 1. Start Docker infrastructure services (PostgreSQL + MinIO + RAG Service)
cd docker-compose-dev-spring
docker-compose -f docker-compose-dev.yml up -d postgres postgres-rag minio rag-service

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
- `e2e-tests/e2e-testcase-app.js` - 메인 E2E 테스트 스크립트 (UI 검증, 성능 측정)
- `e2e-tests/playwright-test.js` - 기본 Playwright 기능 테스트
- `e2e-tests/authentication/` - 인증 관련 E2E 테스트
- `e2e-tests/dashboard/` - 대시보드 관련 E2E 테스트
- `playwright.config.js` - Playwright 설정 파일
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
**⚠️ 중요**: 새로운 번역을 추가할 때는 **반드시 3개 파일을 모두 수정**해야 합니다.

**번역 키 정의 (Translation Keys)**:
- `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/` - 번역 키 초기화 클래스들
  - `TestCaseKeysInitializer.java` - 테스트케이스 관련 번역 키
  - `DashboardKeysInitializer.java` - 대시보드 관련 번역 키
  - `ProjectKeysInitializer.java` - 프로젝트 관련 번역 키
  - `UserManagementKeysInitializer.java` - 사용자 관리 관련 번역 키
  - 기타: `AuthKeysInitializer`, `CommonKeysInitializer`, `MailKeysInitializer`, `OrganizationKeysInitializer`, `TestExecutionKeysInitializer`, `TestPlanKeysInitializer`, `TestResultKeysInitializer`, `TranslationKeysInitializer`

**번역 데이터 (Translations)**:
- `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanTranslationsInitializer.java` - 한글 번역
- `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTranslationsInitializer.java` - 영어 번역

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
// src/main/java/.../translations/KoreanTranslationsInitializer.java
createTranslationIfNotExists(
    "testcase.spreadsheet.fallback.title",  // 번역 키 (1단계와 동일)
    languageCode,                             // "ko"
    "향상된 스프레드시트 모드",               // 한글 번역
    createdBy
);
```

**3단계: 영어 번역 추가** (English Translations)
```java
// src/main/java/.../translations/EnglishTranslationsInitializer.java
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

// 1. 필드 추가
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
**⚠️ Java Version Requirement**: This project requires **Java 21**. Make sure to set JAVA_HOME before running any Gradle commands.
'''bash
# Java 21 설정 (macOS 예시)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
'''

### 2.2. Development Commands

#### Frontend Development
'''bash
cd src/main/frontend
npm install          # Install dependencies
npm start           # Start development server (port 3000)
npm run build       # Build for production
npm test            # Run Jest tests
'''

#### Backend Development
'''bash
# 기본 개발 명령어
./gradlew bootRun                    # Start Spring Boot application
./gradlew build                      # Build entire project (includes frontend)
./gradlew test                       # Run Java tests
./gradlew allureReport              # Generate Allure test reports
./gradlew appNpmInstall             # Install frontend dependencies
./gradlew appNpmBuild               # Build frontend only
'''

### 2.3. Backend Development Workflow (with H2 Database)

#### H2 Database Configuration
- **기본 계정**: admin/admin, tester/tester
- **H2 콘솔**: http://localhost:8080/h2-console
- **테스트 데이터**: 자동으로 샘플 프로젝트, 테스트케이스, 테스트 결과 생성

#### 🔄 H2 In-Memory Database Characteristics
- **애플리케이션 재시작 시 모든 데이터가 초기화됨**
- **사용자 ID, 조직 ID 등이 매번 새로 생성됨**
- **기존 JWT 토큰은 무효화됨 (사용자 ID 변경으로 인해)**
- **테스트 시에는 항상 새로운 토큰과 새로운 ID를 사용해야 함**

#### ⚠️ User's Responsibility for Building
This is a full-stack application with an integrated build system. The user is responsible for building and running the application.

**Build and Run Command:**
```bash
./gradlew bootRun
```

This command will:
1.  Build the frontend React application.
2.  Build the backend Spring Boot application.
3.  Start the Spring Boot application, which will serve the frontend.

**Gemini will not run the build.** The user must run the build to see the changes.

#### ⚠️ Backend Modification Workflow (Required Steps)
백엔드 코드(Java/Spring Boot)를 수정한 후에는 **반드시** 다음 절차를 순서대로 수행해야 합니다:

**1. Restart Application**
'''bash
# 기존 프로세스 종료
pkill -f "bootRun"

# Java 21 환경 설정 후 재시작
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &

# 시작 대기 (약 20-25초)
sleep 25
'''

**2. Issue New JWT Token**
'''bash
# 매번 새로운 토큰을 발급받아야 함
NEW_TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

echo "새 토큰: $NEW_TOKEN"
'''

**3. Verify New Resource IDs**
'''bash
# 조직 목록에서 새로운 ID 확인 (H2 인메모리 DB로 인해 ID 변경됨)
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations \
  -s | jq '.[] | {id, name}'
'''

**4. Perform API Test**
'''bash
# 새 토큰과 새 ID로 테스트
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations/{새로운_조직_ID} \
  -s | jq '.'
'''

#### 💡 Efficient Development Tips
1. **API 테스트 스크립트 작성**: 위 절차를 스크립트로 만들어 자동화
2. **로그 모니터링**: `tail -f app.log`로 실시간 로그 확인
3. **데이터 초기화 로그 확인**: 애플리케이션 시작 시 데이터 생성 로그 확인

---

## 3. 🧪 Testing Guidelines

### 3.1. Overall Testing Strategy
This project uses a multi-layered testing approach:
- **Backend Unit & Integration Tests**: Using **TestNG**.
- **API Schema Validation**: Ensures API consistency.
- **E2E Tests**: Using **Playwright** (primary) and **Cypress** (secondary).
- **Test Reporting**: Using **Allure** for backend tests and **Playwright Reporter** for E2E tests.

### 3.2. Backend Testing (TestNG)

#### General Commands
'''bash
# Java 21 설정 후 테스트 실행
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

# 로컬 H2 데이터베이스로 테스트
SPRING_PROFILES_ACTIVE=local ./gradlew test

#### API Development Testing Workflow
새로운 API를 개발하거나 기존 API를 수정할 때는 **반드시** 다음 테스트들을 수행해야 합니다:

**1. Unit Tests**
'''bash
./gradlew test --tests "*ControllerTest*"  # 컨트롤러 테스트만 실행
./gradlew test --tests "*ServiceTest*"     # 서비스 테스트만 실행
'''

**2. API Schema Validation Tests**
'''bash


#### API Test Writing Rules
- **Controller Test Location**: `src/test/java/com/testcase/testcasemanagement/api/`
- **Naming Convention**: `{ControllerName}JsonSchemaTest.java`
- **Schema Definition Location**: `src/test/resources/schemas/`
- **Schema File Naming**: `{api-name}-{method}.json` (e.g., `project-get.json`)

#### Test Failure Response
- **Schema Validation Failure**: Check and correct schema files in `src/test/resources/schemas/`
- **Unit Test Failure**: Review and fix business logic
- **Integration Test Failure**: Check the overall flow and dependencies

### 3.3. E2E Testing (Playwright)

#### Overview
Playwright is the primary E2E testing tool for this project, used to validate authentication, UI components, and user flows. E2E 테스트의 요소들에 대한 자세한 내용은 `docs/e2e_md`를 참고하십시오.

#### How to Run E2E Tests

**0. ⚠️ Prerequisite: Correct Directory**
All `npx playwright` commands must be run from the **project root directory**.
'''bash
# 1. Navigate to Project Root (if not already there)
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"
echo "📍 Current Directory: $(pwd)"

# 2. Verify test files exist
ls -la e2e-tests/authentication/
'''

**1. 🔄 Prerequisite: Restart Backend**
Because the H2 database is in-memory, you **must restart the backend** before every test run to ensure a clean state.
'''bash
pkill -f "bootRun"
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &
sleep 25  # Wait for backend to fully start
'''

**2. 🚀 Execute Tests (Standardized Method)**
'''bash
# Run a single test file
npx playwright test e2e-tests/authentication/login-success-test.js --reporter=html

# Run all tests in a directory
npx playwright test e2e-tests/authentication/ --reporter=html

# Run with a single worker for stability
npx playwright test e2e-tests/authentication/login-failure-test.js --reporter=html --workers=1
'''

**3. 📊 View Test Report**
'''bash
# Automatically open the HTML report
npx playwright show-report

# Or open manually
open playwright-report/index.html
'''

#### Debugging E2E Test Failures
1.  **Database Constraint Errors**: Backend restart is required.
2.  **Connection Refused**: Backend did not start completely. Increase the `sleep` duration.
3.  **JWT Token Storage Failure**: Usually a timing issue. The tests have retry logic for this.

#### Success Screenshots
- **Purpose**: Automatically capture the UI state upon successful test completion for visual evidence and regression testing.
- **Location**: `test-results/success-screenshots/`
- **Implementation**: A helper function `takeSuccessScreenshot` is used within the tests.

#### `data-testid` 표준 (ICT-364)
E2E 테스트의 안정성과 유지보수성을 높이기 위해 `data-testid` 속성을 사용합니다. 이 속성은 UI의 기능적 식별자로, 스타일이나 구조 변경에 영향을 받지 않습니다.

**명명 규칙:**
- **형식:** `[컴포넌트]-[세부요소]-[액션]`
- **설명:** 컴포넌트, 세부 요소, 그리고 해당 요소의 역할(예: `button`, `input`, `item`)을 조합하여 명확하게 작성합니다.

**예시:**
- **로그인 페이지**
  - 사용자명 입력 필드: `login-username-input`
  - 로그인 버튼: `login-submit-button`
- **테스트케이스 트리**
  - 새 폴더 추가 버튼: `testcase-tree-add-folder-button`
  - 특정 테스트케이스 아이템 (동적): `testcase-tree-item-${testCase.id}`
- **헤더**
  - 사용자 메뉴 버튼: `header-user-menu-button`
  - 로그아웃 버튼: `header-logout-button`

**적용 원칙:**
- 모든 상호작용 요소(버튼, 입력, 링크 등)에 적용합니다.
- 테스트에서 특정 영역을 식별해야 할 경우 컨테이너 요소에도 적용합니다.

### 3.4. Organization-Project System Testing Guide

This section outlines the specific testing strategy for the Organization-Project management feature.

#### Phase-Based Testing

**Phase 1: Core Data Structure Tests**
- **Entity Tests**: `*EntityTest.java` (JPA mappings, relationships)
- **Relationship Tests**: `*RelationshipTest.java` (Many-to-many, roles)
- **Repository Tests**: `*RepositoryTest.java` (CRUD, custom queries)
- **Security Framework Tests**: `*SecurityTest.java` (Access control, roles)

**Phase 2: Business Logic Tests**
- **Service Layer Tests**: `*ServiceTest.java` (Business logic, transactions, exceptions)
- **Controller API Tests**: `*ControllerTest.java`, `*JsonSchemaTest.java` (Endpoints, schema, auth)

#### Test Checklists & Templates
The original document contains detailed checklists and code templates for each test type (`Entity`, `Repository`, `Service`, `Controller`, `Security`). These should be followed when adding new tests for this feature.

---

## 4.  Jira & Process Guidelines

### 4.1. JIRA Integration Overview
This project is integrated with **JIRA via MCP (Model Context Protocol)**. All development tasks must be tracked as JIRA issues in the **ICT (테스트관리툴)** project.

#### JIRA MCP Server Configuration
- **Server Location**: `d_mcpsvr_jira/`
- **Execution Root**: All JIRA commands must be executed from the **project root directory**.

### 4.2. JIRA Workflow

**⭐ 중요 규칙: JIRA 이슈를 생성, 수정, 또는 코멘트를 추가할 때는 반드시 `docs/JIRA_INTEGRATION.md` 파일의 상세 가이드를 참고하여 작업을 진행해야 합니다.**

**⚠️ IMPORTANT: All JIRA commands must be run from the project root, by `cd`-ing into the `d_mcpsvr_jira` directory, running the python script, and then `cd`-ing back to the project root.**

'''bash
# Standardized JIRA command execution pattern
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

# Example: Starting work on an issue
cd d_mcpsvr_jira
python3 -c "from quick_start import quick_start; quick_start('ICT-XX')"
cd "$PROJECT_ROOT"
echo "✅ JIRA task started. Returned to project root: $(pwd)"
'''

#### Step 0: Search for Similar Issues (⭐ Important)
Before starting a new task, **search JIRA for existing issues** to prevent duplication and leverage past work.
'''bash
# (From project root)
cd d_mcpsvr_jira
# Use the python snippets from the original doc to search by keyword, type, or component
cd ..
'''

#### Step 1: Start Work on an Issue
- **A. Create a new issue**: Use the `safe_create_jira_issue` function in `jira_caller.py`.
- **B. Start an existing issue (🚀 Recommended)**:
'''bash
# (From project root)
cd d_mcpsvr_jira
python3 -c "from quick_start import quick_start; quick_start('ICT-XX')"
cd ..
'''
This automatically transitions the issue to "In Progress" and adds a start comment.

#### Step 2: Update Progress
While working, add progress comments.
'''bash
# (From project root)
cd d_mcpsvr_jira
python3 -c "from jira_workflow import add_progress_comment; add_progress_comment(...)"
cd ..
'''

#### Step 3: Complete Work
**⚠️ Rule**: Do not mark an issue as complete automatically. **Always ask for user confirmation first.**
After the user confirms the fix/feature works, add a completion comment.
'''bash
# (From project root)
cd d_mcpsvr_jira
python3 -c "from jira_workflow import add_completion_comment; add_completion_comment(...)"
cd ..
'''

### 4.3. Bug Fixing Workflow
1.  **Analyze**: Understand the root cause.
2.  **Create JIRA Issue**: Create a "Bug" type issue in JIRA with detailed reproduction steps.
3.  **Fix**: Implement the code changes.
4.  **Test**: Verify the fix and run regression tests.
5.  **Request Confirmation**: Ask the user to verify the fix.
6.  **Close JIRA Issue**: After confirmation, close the issue with a detailed completion comment.

### 4.4. JIRA Best Practices & Rules

#### 4.4.1. Process for Documenting Work Progress
- 작업의 진행 상황과 상세 내용을 JIRA에 코멘트로 업데이트해야 함
- **중요**: JIRA 이슈 상태는 변경하지 않고, 진행 상황 코멘트만 추가
- 작업 진행 상황 코멘트에 다음 사항을 JIRA 이슈에 포함:
  - 수행된 작업의 구체적인 내용
  - 변경된 파일 목록
  - 테스트 결과
  - 향후 추가 작업이 필요한 사항

#### 4.4.2. JIRA Issue Creation Guide (Error Prevention)

**⚠️ 중요**: JIRA 이슈 생성 시 다음 절차를 반드시 따라야 함

##### JIRA 서버 URL 및 링크 생성
- **실제 JIRA 서버**: `https://kwangmyung.atlassian.net` (d_mcpsvr_jira/.env에서 확인)
- **이슈 URL 패턴**: `https://kwangmyung.atlassian.net/browse/{issue_key}`
- **예시**: ICT-167 → `https://kwangmyung.atlassian.net/browse/ICT-167`

'''python
# ✅ 올바른 이슈 URL 생성 방법
def get_issue_url(issue_key):
    jira_server = os.getenv("JIRA_SERVER", "https://kwangmyung.atlassian.net")
    return f"{jira_server}/browse/{issue_key}"

# 이슈 생성 후 URL 출력
new_issue = jira.create_issue(fields=issue_dict)
issue_url = get_issue_url(new_issue.key)
print(f'✅ 이슈 생성 성공: {new_issue.key}')
print(f'이슈 URL: {issue_url}')
'''

##### 기본 이슈 템플릿

'''python
# 🔧 기능 개발 작업 템플릿
feature_task = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [기능명] 구현',
    'description': '''## 📋 작업 개요
[기능 설명]

## 🎯 목표
- [목표 1]
- [목표 2]

## 🛠️ 구현 계획
### Phase 1: [단계명]
- [세부 작업 1]
- [세부 작업 2]

## 📝 승인 기준
- [ ] [승인 기준 1]
- [ ] [승인 기준 2]''',
    'issuetype': {'id': '10003'},  # Task
    'priority': {'id': '3'}  # High
}

# 🐛 버그 수정 템플릿
bug_issue = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [버그 제목]',
    'description': '''## 🐛 문제 상황
[버그 설명]

### 현재 증상
- [증상 1]
- [증상 2]

### 재현 단계
1. [단계 1]
2. [단계 2]

### 예상 원인
- [원인 추정]

### 수정 방향
- [수정 계획]''',
    'issuetype': {'id': '10040'},  # Bug
    'priority': {'id': '2'}  # Medium
}
'''

#### 4.4.3. JIRA Status Management Rules

**⚠️ 상태 변경 제한**: 
- `add_completion_comment()` 함수는 자동으로 이슈를 '완료' 상태로 변경
- **사용자가 명시적으로 완료 처리를 요청하기 전까지는 처리하지 말고 사용자게에 물어보기**
- 대신 `add_issue_comment()` 함수를 사용하여 상태 변경 없이 진행 상황만 기록

**올바른 JIRA 워크플로우**:
'''python
# ✅ 분석/진행 상황 기록 (상태 변경 없음)
add_issue_comment('ICT-XXX', analysis_content, '개발 추정 분석')
add_issue_comment('ICT-XXX', progress_content, '진행 상황 업데이트')

# ❌ 완료 처리 (사용자 요청 시에만)
# add_completion_comment('ICT-XXX', ...) # 자동 상태 변경됨!
'''

### 4.5. Security & Access Control Guidelines

#### Core Security Principles
- **Principle of Least Privilege**: Grant only the minimum necessary permissions.
- **Defense in Depth**: Apply security at multiple layers (Controller, Service).
- **Secure by Default**: Default to denying access.

#### Implementation Rules
- **`@PreAuthorize`**: All controller methods that access protected resources **must** use `@PreAuthorize` with a custom security service check (e.g., `@projectSecurityService.canAccessProject(...)`).
- **Use `Authentication` Principal**: Get the current user from the `Authentication` object, not from request parameters.
- **Filter Data**: Services must filter data to ensure users only see what they are authorized to see.
- **Exception Handling**: Catch `AccessDeniedException` and return a `403 Forbidden` status.

#### Security Checklist
- [ ] Is the current user authenticated?
- [ ] Is resource access verified with `@PreAuthorize`?
- [ ] Are roles (OWNER, ADMIN, etc.) checked correctly?
- [ ] Is response data filtered based on user permissions?
- [ ] Are security-related exceptions handled gracefully?

---

## 5. 🤖 MCP & AI Integration

### 5.1. Overview of Integrated MCP Servers
- **Context7 MCP**: For referencing the latest official documentation and library patterns.
- **Playwright MCP**: For browser automation and E2E testing.
- **Atlassian JIRA MCP**: For issue tracking and project management.

### 5.2. Usage Rules
- **Context7**: Automatically enabled for all code generation requests. Use it to get up-to-date examples.
- **Playwright**: Automatically enabled with `--play` or `--playwright` flags. Recommended for all E2E and UI testing tasks.
- **JIRA**: Follow the workflow described in Section 4.

---

## 6. 📝 Project-Specific Notes

### 6.1. Organization Management System Implementation Status (as of 2025-07-31)
This section in the original document contains a detailed log of solved issues, modified files, and the next work plan for the organization management feature. It highlights key learnings related to:
- H2 database ID regeneration.
- Jackson JSON serialization issues (`@JsonIgnore`, `@JsonManagedReference`).
- Spring Security configuration (`AuthenticationProvider`).
- `CommandLineRunner` execution order.

### 6.2. Communication Language
- **한국어 사용 (필수)**: 이 프로젝트와 관련된 모든 답변, 설명, 주석, 그리고 문서는 **반드시 한국어**로 작성해야 합니다.
- **Korean Language (Mandatory)**: All responses, explanations, comments, and documentation related to this project **MUST** be written in **Korean**.
- **Walkthrough 문서**: Walkthrough artifact(`walkthrough.md`)는 반드시 **한국어**로 작성해야 합니다.
- **Walkthrough Artifacts**: Must be written in **Korean**.
- **Implementation Plan**: 구현 계획(`implementation_plan.md`)의 설명 부분도 **한국어**로 작성해야 합니다.

### 6.3. Documentation Structure
**⚠️ 중요**: This document is the main guide. For details on specific areas, please refer to the `docs/` directory.

#### 📂 Documentation Directory
- **[Docs Home](./docs/README.md)** - Overall document structure and navigation
- **[E2E Epic Structure](./docs/E2E_EPIC_STRUCTURE.md)** - ✅ Detailed structure of Playwright E2E Test Epics (Complete)

#### 🎯 Future Documentation (Planned)
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Overall project architecture
- **[Development Guide](./docs/DEVELOPMENT_GUIDE.md)** - Development environment and workflow
- **[API Guide](./docs/API_GUIDE.md)** - API development guidelines
- **[Security Guide](./docs/SECURITY_GUIDE.md)** - Security and access control
- **[JIRA Integration](./docs/JIRA_INTEGRATION.md)** - JIRA issue management

---

## 7. 🚀 Application Startup Guide

### 7.1. Prerequisites
- **Java 21** installed and configured
- **Docker & Docker Compose** installed
- **Docker services running**: PostgreSQL, MinIO, RAG service (§ 9.2 참조)

### 7.2. Default Login Credentials
```
Username: admin
Password: admin123
```

### 7.5. Troubleshooting Startup Issues


#### Database Connection Issues
- **Docker 서비스 확인**:
  ```bash
  cd docker-compose-dev-spring
  docker-compose -f docker-compose-dev.yml ps
  ```
- **PostgreSQL 컨테이너 로그**:
  ```bash
  docker logs testcasecraft_postgres_spring
  ```
- **연결 테스트**:
  ```bash
  psql -h localhost -p 5434 -U testcase_user -d testcase_management
  # Password: testcase_password
  ```
- **설정 파일 확인**: `src/main/resources/application-dev.yml`

#### Memory Issues
```bash
# Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
./gradlew bootRun
```

### 7.6. E2E Testing Prerequisites

Before running E2E tests, ensure:
1. **Docker services running**: PostgreSQL, MinIO, RAG service
2. **Backend is running**: `./gradlew bootRun`
3. **Application is accessible**: `curl http://localhost:8080`
4. **Database has test data**: Admin user and test projects exist
5. **Playwright dependencies**: `npm install` in project root

#### 완료 판정 기준
```bash
# ✅ 올바른 완료 판정 절차
1. 애플리케이션 실행: ./gradlew bootRun
2. 로컬 접근 확인: curl http://localhost:8080 (200 응답 확인)

# ❌ 잘못된 완료 판정
- API 응답 확인만으로 완료 처리
- 코드 수정만으로 완료 처리  
- 수동 테스트 없이 완료 처리
- 원격 서버 접속으로 테스트 (qaspecialist.shop 등)
```

#### E2E 테스트 환경 설정 규칙
```javascript
// ✅ 올바른 E2E 테스트 설정
const context = await browser.newContext({
  baseURL: 'http://localhost:8080'  // 반드시 localhost 사용
});

await page.goto('/', { timeout: 20000 });  // 상대 경로 사용

// ❌ 잘못된 E2E 테스트 설정
await page.goto('https://qaspecialist.shop');  // 원격 서버 접속 금지
await page.goto('http://localhost:8080');      // 절대 경로보다 baseURL + 상대경로 권장
```

#### 테스트 실패 시 대응
- **테스트 실패**: 이슈를 '진행 중' 상태 유지하고 문제 해결 후 재테스트
- **환경 문제**: 애플리케이션 재시작, 포트 확인, 데이터베이스 상태 점검
- **신규 버그 발견**: 별도 JIRA 이슈 생성하여 추적 관리

**⚠️ 이 조건을 무시하고 완료 처리하는 것은 금지됨**

### 8.0.1. 📚 E2E 테스트 네비게이션 구조 참조 가이드

**🎯 핵심**: E2E 테스트 작성 시 반드시 참조해야 할 애플리케이션 네비게이션 구조입니다.

#### 애플리케이션 네비게이션 플로우
```
로그인(/) → 프로젝트 선택(/projects) → 개별 프로젝트(/projects/{id}) → 탭 선택
```

#### 주요 UI 선택자 참조
- **로그인 폼**: `input[name="username"]`, `input[name="password"]`, `button[type="submit"]`
- **프로젝트 선택**: `button:has-text("프로젝트 열기")`  
- **탭 네비게이션**: `text=대시보드`,`text=테스트케이스`, ,`text=테스트플랜`,`text=테스트실행`, `text=테스트결과`,  `text=자동화 테스트`
- **자동화 테스트 상세**: `button:has-text("상세보기")`, `text=자동화 테스트로 돌아가기`

#### 💡 테스트 작성 시 주의사항
1. **대기 시간**: 각 네비게이션 후 `await page.waitForLoadState('networkidle')` 필수
2. **선택자 정확성**: `first()`, `count()` 메서드로 요소 존재 확인
3. **URL 검증**: 네비게이션 후 URL 패턴 확인 (`includes('/projects/')`, `includes('/automation')`)
4. **프로젝트 데이터**: 테스트 전 최소 1개 프로젝트와 테스트 결과 데이터 필요 -->

**📋 상세 가이드**: **[docs/E2E_TESTING_GUIDE.md](docs/E2E_TESTING_GUIDE.md)** - 완전한 E2E 테스트 작성 및 실행 가이드

### 8.1. JIRA 통합 워크플로우

**📋 완전한 JIRA 가이드**: **[docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md)** 를 반드시 참조하세요.

### 8.1.1. ⚠️ JIRA 완료 처리 권한 규칙

**🚨 중요: JIRA 이슈 완료 처리는 반드시 사용자가 직접 수행해야 합니다.**

#### 📋 완료 처리 권한 구분

**Gemini 역할**:
- ✅ 작업 시작: `quick_start()` 함수로 이슈 상태를 "진행 중"으로 변경
- ✅ 진행 상황 업데이트: `add_issue_comment()` 함수로 작업 진행 내용 기록
- ✅ 코드 구현 및 테스트: 실제 개발 작업 수행
- ✅ 검증 완료: 기능 테스트, 컴파일 확인, E2E 테스트 등

**사용자 역할**:
- ⛔ **최종 완료 처리**: `add_completion_comment()` 및 이슈 상태 변경
- ⛔ **배포 승인**: 운영환경 배포 및 최종 검증
- ⛔ **품질 승인**: 작업 결과 최종 검토 및 승인

**상세 명령어**: [docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md) 참조

#### ⚠️ 금지 사항

**Gemini가 하지 말아야 할 것**:
- ❌ `add_completion_comment()` 자동 호출
- ❌ 이슈 상태를 "완료"로 자동 변경
- ❌ 사용자 확인 없이 완료 처리
- ❌ 운영환경 배포 관련 결정

**이유**:
- 사용자가 최종 품질을 직접 검증해야 함
- 운영환경 배포는 사용자의 책임
- 작업 결과에 대한 최종 승인 권한은 사용자에게 있음

#### 📝 완료 처리 예외 상황

**긴급한 경우에만 사용자가 Gemini에게 명시적으로 완료 처리를 요청할 수 있습니다:**
- "완료 처리해줘", "JIRA 완료해줘" 등 명확한 완료 요청 시
- 단, 이 경우에도 사용자가 먼저 검증을 완료했다는 확인이 필요


**2단계: 체계적 문제 분석**
- **TodoWrite 도구 활용**: 분석 단계를 작업 목록으로 관리
- **근본 원인 분석**: 단순 증상이 아닌 근본 원인 파악
- **영향도 평가**: 수정 범위 및 위험도 분석
- **해결 전략 수립**: 개발환경 → 운영환경 단계적 접근

**3단계: 개발환경 수정 및 검증**
- **개발환경 우선**: H2/로컬 환경에서 먼저 수정 및 테스트
- **단위별 수정**: 한 번에 한 가지 문제만 해결
- **즉시 검증**: 수정 후 바로 기능 테스트 수행

**4단계: 진행 상황 JIRA 업데이트**
```bash
# 주요 진행 사항마다 JIRA 코멘트 추가
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_issue_comment

comment = '''## 📋 진행 상황
- [x] 문제 원인 분석 완료
- [x] 해결책 구현 완료
- [x] 개발환경 검증 완료
- [ ] 운영환경 배포 대기

### ✅ 수정 내용
[구체적인 수정 사항 설명]

### 🧪 검증 결과
[테스트 결과 및 증거]'''

result = add_issue_comment('ICT-XXX', comment, '진행 상황')
print(f'✅ 진행 상황 업데이트: {result}')
"
```

**5단계: 사용자 확인 요청**
- **명확한 현황 전달**: 수정 완료 내용과 필요한 사용자 액션
- **구체적 가이드**: 사용자가 해야 할 정확한 단계 제시
- **검증 방법**: 수정 확인을 위한 테스트 방법 안내

**6단계: 운영환경 배포 지원**
- **배포 가이드**: 운영환경 배포 방법 상세 안내
- **검증 체크리스트**: 배포 후 확인해야 할 항목들
- **롤백 계획**: 문제 발생 시 되돌리는 방법

**7단계: 최종 완료 처리**
```bash
# 사용자 확인 후 JIRA 이슈 완료 처리
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_completion_comment

completion_message = '''🎉 [이슈명] 완료

## 📋 해결 완료 내역
### ✅ 문제 원인
[근본 원인 요약]

### ✅ 해결책
[적용된 해결책]

### ✅ 검증 완료
[개발/운영환경 검증 결과]

### ✅ 수정된 파일
[변경된 파일 목록]

[문제명]이 완전히 해결되었습니다!'''

modified_files = ['file1.java', 'file2.js', 'GEMINI.md']
result = add_completion_comment('ICT-XXX', completion_message, modified_files, {'success': True})
print(f'✅ 완료 처리: {result}')
"
```

#### 🎯 워크플로우 핵심 원칙

**투명성 (Transparency)**
- 모든 진행 사항을 JIRA에 실시간 기록
- 사용자에게 명확한 현황과 다음 단계 전달
- 수정 과정과 근거를 상세히 문서화

**체계성 (Systematic)**
- TodoWrite로 작업 단계 명확히 관리
- 개발환경 → 운영환경 단계적 접근
- 각 단계별 검증 및 확인 절차

**협업 (Collaboration)**
- 사용자의 역할과 Gemini의 역할 명확히 구분
- 사용자 확인 없이 운영환경 변경 금지
- 배포 및 최종 검증은 사용자가 직접 수행

**품질 보증 (Quality Assurance)**
- 근본 원인 해결에 집중 (임시 조치 지양)
- 개발환경에서 충분한 검증 후 운영 적용
- 롤백 계획 및 리스크 관리 포함

**지속성 (Sustainability)**
- 해결 과정을 문서화하여 재발 방지
- 표준 프로세스 지속적 개선
- 팀 전체의 학습 자료로 활용

---
## 9. 🔧 환경별 설정 관리
### 9.1. 환경 구성 개요

이 프로젝트는 **개발(dev)**과 **운영(prod)** 환경을 분리하여 관리합니다:

- **공통 설정**: `application.yml` - 모든 환경에서 공유하는 기본 설정 (기본 프로파일: `dev`)
- **개발 환경**: `application-dev.yml` - 개발 전용 설정 (Docker Compose PostgreSQL, DEBUG 로깅)
- **운영 환경**: `application-prod.yml` - 운영 전용 설정 (PostgreSQL, 프로덕션 최적화)

### 9.2. 개발 환경 실행

#### 1단계: Docker Compose로 인프라 서비스 실행

```bash
cd docker-compose-dev-spring

# PostgreSQL, MinIO, RAG 서비스 시작
docker-compose -f docker-compose-dev.yml up -d postgres postgres-rag minio rag-service

# 서비스 상태 확인
docker-compose -f docker-compose-dev.yml ps
```

**실행되는 서비스:**
- `postgres` (포트 5434) - 메인 PostgreSQL 데이터베이스
- `postgres-rag` (포트 5433) - RAG용 PostgreSQL + pgvector
- `minio` (포트 9000, 9001) - 객체 스토리지
- `rag-service` (포트 8001) - FastAPI RAG 서비스

#### 2단계: Gradle로 Spring Boot 실행

```bash
cd /Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage

# 프론트엔드 빌드 + 백엔드 실행 (dev 프로파일 자동 적용)
./gradlew bootRun

# 또는 특정 프로파일 지정
./gradlew bootRun --args='--spring.profiles.active=prod'
```

**참고**:
- 기본 프로파일은 `dev` (Docker Compose PostgreSQL 사용)
- `./gradlew bootRun`은 프론트엔드를 자동으로 빌드하여 `src/main/resources/static/`에 복사
- 애플리케이션은 **http://localhost:8080**에서 실행
- PostgreSQL 데이터는 `docker-compose-dev-spring/data/postgres/`에 영구 저장

#### 서비스 중지

```bash
cd docker-compose-dev-spring

# 인프라 서비스 중지
docker-compose -f docker-compose-dev.yml down

# 데이터까지 삭제 (주의!)
docker-compose -f docker-compose-dev.yml down -v
```

### 9.6. 환경별 접속 정보

#### 개발 환경
- **애플리케이션**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **액추에이터**: http://localhost:8080/actuator
- **기본 로그인**: admin/admin

#### Docker Compose 서비스
- **PostgreSQL**: localhost:5434
  - Database: `testcase_management`
  - Username: `testcase_user`
  - Password: `testcase_password`
- **PostgreSQL RAG**: localhost:5433
  - Database: `rag_db`
  - Username: `rag_user`
  - Password: `rag_dev_password_123`
- **MinIO Console**: http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin_dev_password_789`
- **MinIO API**: http://localhost:9000
- **RAG Service**: http://localhost:8001/docs

### 9.7. 환경 전환 시 주의사항

#### 개발 → 운영 전환
1. **환경변수 확인**: 모든 필수 환경변수 설정 완료
2. **데이터베이스 준비**: PostgreSQL 서버 및 스키마 준비
3. **Redis 준비**: Redis 서버 설정 및 접근 권한 확인
4. **SSL 인증서**: HTTPS 인증서 설정 (필요시)
5. **방화벽 설정**: 필요한 포트 오픈 (8080, 5432, 5433 6379)

### 9.8. 데이터베이스 설정 및 데이터 유지

#### 환경별 DDL 설정

| 환경 | Profile | 데이터베이스 | DDL 설정 | 데이터 유지 | 설정 파일 |
|------|---------|-------------|----------|-------------|-----------|
| **개발** | `dev` | PostgreSQL (Docker) | `update` | ✅ **유지** | `application-dev.yml` |
| **운영** | `prod` | PostgreSQL | `update` | ✅ **유지** | `application-prod.yml` |

#### ⚠️ 운영 배포 후 DDL 설정 주의사항

**🚨 중요**: 운영환경에 최초 배포가 완료된 후에는 **반드시 `ddl-auto: update`를 유지**해야 합니다.

```yaml
# application-prod.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # ✅ 운영 데이터 보호를 위해 변경 금지
```

#### 개발환경 데이터 관리
- **데이터베이스**: Docker Compose PostgreSQL (localhost:5434)
- **데이터 저장 위치**: `docker-compose-dev-spring/data/postgres/`
- **데이터 유지**: Docker 볼륨에 영구 저장 (컨테이너 재시작해도 유지)
- **데이터 초기화**:
  ```bash
  # 컨테이너와 볼륨 모두 삭제
  cd docker-compose-dev-spring
  docker-compose -f docker-compose-dev.yml down -v

  # 또는 데이터 디렉토리 직접 삭제
  rm -rf data/postgres/
  ```

### 9.9. 보안 고려사항

#### 개발 환경
- 개발용 시크릿 키와 토큰 사용
- 로컬 네트워크에서만 접근 가능하도록 설정
- 민감한 데이터는 테스트 데이터만 사용

#### 운영 환경  
- 강력한 JWT 시크릿 키 사용 (512비트)
- 데이터베이스 암호화 및 백업 정책
- 네트워크 보안
- 정기적인 시크릿 로테이션

#### 🔒 운영 데이터 보호 체크리스트

**배포 전 필수 확인사항**:
1. ✅ `application-prod.yml`에서 `ddl-auto: update` 설정 확인
2. ✅ 환경변수 `DATABASE_PASSWORD`, `JWT_SECRET` 등 설정 확인  
3. ✅ PostgreSQL 백업 정책 수립

**배포 후 금지사항**:
- ❌ `ddl-auto: create-drop` 또는 `create`로 변경 금지
- ❌ 프로덕션 데이터베이스 수동 DROP 금지
- ❌ 환경 변수 없이 애플리케이션 재시작 금지

## 🚨 파일 삭제 금지 정책

**⛔ Gemini 파일 삭제 하지 말고 삭제 필요할시 사용자에게 물어봐**

- **사용자 통지**: 삭제가 필요한 경우 사용자에게 알려주기만 함
- **삭제 요청**: 사용자가 직접 삭제 명령을 내려야 함
- **보안 원칙**: 데이터 보호 및 의도하지 않은 손실 방지

**예시**:
```
❌ 금지: rm, Delete, 파일 삭제 명령 직접 실행
```
