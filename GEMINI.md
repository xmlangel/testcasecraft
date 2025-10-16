# GEMINI.md (Reorganized)

This file provides guidance to Gemini when working with code in this repository.

---

## 1. 🚀 Project Overview

### 1.1. General
This is a full-stack test case management application built with:
- **Frontend**: React 18 with Material-UI and React Router for SPA navigation
- **Backend**: Spring Boot 3.2.4 with Java 21, PostgreSQL database
- **Caching**: Redis cache system for performance optimization (ICT-130)
- **Authentication**: JWT-based authentication with access/refresh token system
- **Build System**: Gradle with integrated Node.js frontend build
- **Testing**: TestNG with Allure reporting, Cypress for E2E tests, Playwright MCP for automated browser testing and UI validation
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

#### Configuration
- `build.gradle` - Main build configuration with frontend integration
- `src/main/frontend/package.json` - Frontend dependencies and scripts
- `src/test/resources/allure.properties` - Allure reporting configuration

#### Redis & Performance Testing Files (ICT-130)
- `redis.conf` - Redis server optimization settings
- `start-redis.sh` - Redis startup script
- `docker-redis-guide.md` - Complete Redis setup and usage guide
- `src/main/java/com/testcase/testcasemanagement/config/CacheConfig.java` - Spring Cache + Redis configuration
- `src/main/java/com/testcase/testcasemanagement/config/MetricsConfig.java` - API performance monitoring
- `src/test/java/com/testcase/testcasemanagement/performance/DashboardApiLoadTest.java` - Comprehensive load testing

#### JIRA Integration Files
- `d_mcpsvr_jira/jira_caller.py` - JIRA API 연동 클라이언트
- `d_mcpsvr_jira/jira_workflow.py` - JIRA 워크플로우 관리
- `d_mcpsvr_jira/.env` - JIRA 인증 정보 (JIRA_SERVER, JIRA_USER, JIRA_API_TOKEN)

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

**🔧 번역 추가 3단계 프로세스**:

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

**4단계: React 컴포넌트에서 사용**
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
4. **서버 재시작**이 필요합니다 (CommandLineRunner가 애플리케이션 시작 시 실행됨)
5. **매개변수 치환**은 `{count}`, `{title}` 등의 형식으로 사용합니다

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
- **사용자가 명시적으로 완료 처리를 요청하기 전까지는 절대 사용 금지**
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
- **한국어 사용**: 이 프로젝트와 관련된 모든 답변과 설명은 한국어로 제공해주세요.
- **Korean Language**: Please provide all responses and explanations related to this project in Korean.

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
- **PostgreSQL** database running
- **Redis** server running (for caching, ICT-130)
- **Node.js** for frontend build (handled by Gradle)

### 7.2. Database Setup
'''sql
-- PostgreSQL database creation
CREATE DATABASE testcase_management;
CREATE USER testcase_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE testcase_management TO testcase_user;
'''

### 7.3. Application Startup Sequence

#### Step 1: Start Redis (Optional but Recommended)
'''bash
# Using Docker
docker run -d --name redis-testcase -p 6379:6379 redis:latest

# Or start existing Redis container
docker start redis-testcase
'''

#### Step 2: Start Backend Application
'''bash
# Method 1: Using Gradle (Recommended)
./gradlew bootRun

# Method 2: Background execution for testing
./gradlew bootRun > app.log 2>&1 &

# Method 3: Build and run JAR
./gradlew build
java -jar build/libs/testcasemanagement-0.0.1-SNAPSHOT.jar
'''

#### Step 3: Verify Application Startup
'''bash
# Check if backend is running (should return HTML)
curl -s http://localhost:3000 | head -10

# Check if ports are available
lsof -ti:3000  # Frontend port
lsof -ti:8083  # Backend API port
'''

#### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Console** (if enabled): http://localhost:8083/h2-console

### 7.4. Default Login Credentials
'''
Username: admin
Password: admin
'''

### 7.5. Troubleshooting Startup Issues

#### Port Already in Use
'''bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process using port 8083  
lsof -ti:8083 | xargs kill -9
'''

#### Database Connection Issues
- Check PostgreSQL is running: `psql -h localhost -U testcase_user -d testcase_management`
- Verify database credentials in `src/main/resources/application.yml`
- Check firewall settings for database port (default: 5432)

#### Memory Issues
'''bash
# Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
./gradlew bootRun
'''

### 7.6. E2E Testing Prerequisites

Before running E2E tests, ensure:
1.  **Backend is running**: `./gradlew bootRun`
2.  **Application is accessible**: `curl http://localhost:3000`
3.  **Database has test data**: Admin user and test projects exist
4.  **Playwright dependencies**: `npm install` in project root

#### E2E Test Execution
'''bash
# Run specific E2E test
cd e2e-tests
node spreadsheet-step-test.js

# Run all E2E tests
npm run test:e2e
'''

## 8. 🔧 환경별 설정 관리

### 8.1. 환경 구성 개요

이 프로젝트는 Spring Boot의 프로파일 기능을 사용하여 여러 환경을 관리합니다. 각 환경은 고유한 설정을 가지며, 셸 스크립트를 통해 쉽게 전환할 수 있습니다.

- **공통 설정**: `src/main/resources/application.yml`
  - 모든 환경에서 공유하는 기본 설정을 정의합니다.
- **H2 개발 환경 (`dev`)**: `src/main/resources/application-dev.yml`
  - H2 인메모리 데이터베이스를 사용하는 빠른 개발 환경입니다.
  - `./start-dev.sh` 스크립트로 실행합니다.
- **PostgreSQL 개발 환경 (`dev-postgresql`)**: `src/main/resources/application-dev-postgresql.yml`
  - Docker 기반의 PostgreSQL을 사용하는, 운영 환경과 유사한 개발 환경입니다.
  - `./start-dev-postgresql.sh` 스크립트로 실행합니다.
- **운영 환경 (`prod`)**: `src/main/resources/application-prod.yml`
  - 실제 운영을 위한 설정입니다. (PostgreSQL, Redis, 보안 강화)
  - `./start-prod.sh` 스크립트로 실행합니다.

### 8.2. 개발 환경 실행 (`dev` 프로파일)

`./start-dev.sh` 스크립트는 `dev` 프로파일을 활성화하여 H2 인메모리 데이터베이스를 사용하는 개발 환경을 시작합니다.

#### 실행 방법
```bash
# H2 개발 환경 시작
./start-dev.sh start
```

#### 참고 설정 파일
1.  `src/main/resources/application.yml` (공통 설정)
2.  `src/main/resources/application-dev.yml` (`dev` 프로파일 설정)

#### `dev` 환경 특징
- **데이터베이스**: H2 인메모리 (애플리케이션 재시작 시 데이터 초기화)
- **H2 콘솔**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **특징**: 빠른 시작과 테스트에 용이하며, DB 스키마 변경 시에도 유연하게 대처 가능합니다.

### 8.3. PostgreSQL 개발 환경 실행 (`dev-postgresql` 프로파일)

`./start-dev-postgresql.sh` 스크립트는 `dev-postgresql` 프로파일을 활성화하고 Docker를 사용하여 PostgreSQL 데이터베이스를 실행합니다.

#### 실행 방법
```bash
# PostgreSQL 개발 환경 시작
./start-dev-postgresql.sh start
```

#### 참고 설정 파일
1.  `src/main/resources/application.yml` (공통 설정)
2.  `src/main/resources/application-dev-postgresql.yml` (`dev-postgresql` 프로파일 설정)

#### `dev-postgresql` 환경 특징
- **데이터베이스**: PostgreSQL (Docker 컨테이너, 데이터 유지)
- **DB 포트**: `localhost:5433`
- **특징**: 운영 환경과 거의 동일한 환경에서 개발하여 데이터 정합성 및 호환성 문제를 미리 해결할 수 있습니다.

### 8.4. 운영 환경 실행 (`prod` 프로파일)

`./start-prod.sh` 스크립트는 실제 서비스 운영을 위한 `prod` 프로파일을 활성화합니다.

#### 실행 방법
```bash
# 운영 환경 시작 (필수 환경변수 설정 후)
./start-prod.sh
```
#### `prod` 환경 특징
- **데이터베이스**: PostgreSQL (영속성)
- **캐시**: Redis (성능 최적화)
- **보안**: HTTPS 강제, JWT 환경변수 필수
- **로깅**: INFO 레벨, 파일 로깅 및 로테이션

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
