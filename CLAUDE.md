# CLAUDE.md (Reorganized)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

[... rest of the existing content remains the same ...]

## 7. 🚀 Application Startup Guide

### 7.1. Prerequisites
- **Java 21** installed and configured
- **Docker & Docker Compose** installed
- **Docker services running**: PostgreSQL, MinIO, RAG service (§ 9.2 참조)

### 7.2. Default Login Credentials
```
Username: admin
Password: admin
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

**Claude Code 역할**:
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

**Claude Code가 하지 말아야 할 것**:
- ❌ `add_completion_comment()` 자동 호출
- ❌ 이슈 상태를 "완료"로 자동 변경
- ❌ 사용자 확인 없이 완료 처리
- ❌ 운영환경 배포 관련 결정

**이유**:
- 사용자가 최종 품질을 직접 검증해야 함
- 운영환경 배포는 사용자의 책임
- 작업 결과에 대한 최종 승인 권한은 사용자에게 있음

#### 📝 완료 처리 예외 상황

**긴급한 경우에만 사용자가 Claude Code에게 명시적으로 완료 처리를 요청할 수 있습니다:**
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

modified_files = ['file1.java', 'file2.js', 'CLAUDE.md']
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
- 사용자의 역할과 Claude Code의 역할 명확히 구분
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

**⛔ Claude Code 파일 삭제 하지 말고 삭제 필요할시 사용자에게 물어봐**

- **사용자 통지**: 삭제가 필요한 경우 사용자에게 알려주기만 함
- **삭제 요청**: 사용자가 직접 삭제 명령을 내려야 함
- **보안 원칙**: 데이터 보호 및 의도하지 않은 손실 방지

**예시**:
```
❌ 금지: rm, Delete, 파일 삭제 명령 직접 실행
```

## 🚨 프로세스 종료 및 빌드 정책

**⛔ Claude Code는 프로세스 종료 및 빌드 명령을 직접 실행하지 않음**

### 사용자 책임 범위
- **프로세스 종료**: 사용자가 직접 Java 프로세스 종료 (`pkill`, `kill` 등)
- **애플리케이션 빌드**: 사용자가 직접 `./gradlew clean` 및 `./gradlew bootRun` 실행
- **포트 충돌 해결**: 사용자가 직접 포트 충돌 확인 및 해결

### Claude Code 역할
- **문제 진단**: 프로세스 상태 확인 및 문제점 진단
- **가이드 제공**: 사용자가 수행해야 할 명령어 안내
- **코드 수정**: 소스 코드 수정 및 검증

**예시**:
```
❌ 금지: pkill, kill, ./gradlew bootRun 직접 실행
✅ 허용: 코드 수정, 문제 진단, 명령어 안내
```