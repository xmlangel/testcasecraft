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
- `.claude-mcp.json` - Playwright MCP 서버 설정

#### Configuration
- `build.gradle` - Main build configuration with frontend integration
- `src/main/frontend/package.json` - Frontend dependencies and scripts
- `src/test/resources/allure.properties` - Allure reporting configuration

---

## 2. 💻 Development Environment & Workflow

### 2.1. Prerequisites
**⚠️ Java Version Requirement**: This project requires **Java 21**. Make sure to set JAVA_HOME before running any Gradle commands.
```bash
# Java 21 설정 (macOS 예시)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
```

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
./gradlew bootRun                    # Start Spring Boot application
./gradlew build                      # Build entire project (includes frontend)
./gradlew test                       # Run Java tests
./gradlew allureReport              # Generate Allure test reports
./gradlew appNpmInstall             # Install frontend dependencies
./gradlew appNpmBuild               # Build frontend only
```

### 2.3. Backend Development Workflow (with H2 Database)

#### H2 Database Configuration
- **기본 계정**: admin/admin, tester/tester
- **H2 콘솔**: http://localhost:8080/h2-console
- **JDBC URL**: jdbc:h2:mem:testdb
- **테스트 데이터**: 자동으로 샘플 프로젝트, 테스트케이스, 테스트 결과 생성

#### 🔄 H2 In-Memory Database Characteristics
- **애플리케이션 재시작 시 모든 데이터가 초기화됨**
- **사용자 ID, 조직 ID 등이 매번 새로 생성됨**
- **기존 JWT 토큰은 무효화됨 (사용자 ID 변경으로 인해)**
- **테스트 시에는 항상 새로운 토큰과 새로운 ID를 사용해야 함**

#### ⚠️ Backend Modification Workflow (Required Steps)
백엔드 코드(Java/Spring Boot)를 수정한 후에는 **반드시** 다음 절차를 순서대로 수행해야 합니다:

**1. Restart Application**
```bash
# 기존 프로세스 종료
pkill -f "bootRun"

# Java 21 환경 설정 후 재시작
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &

# 시작 대기 (약 20-25초)
sleep 25
```

**2. Issue New JWT Token**
```bash
# 매번 새로운 토큰을 발급받아야 함
NEW_TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

echo "새 토큰: $NEW_TOKEN"
```

**3. Verify New Resource IDs**
```bash
# 조직 목록에서 새로운 ID 확인 (H2 인메모리 DB로 인해 ID 변경됨)
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations \
  -s | jq '.[] | {id, name}'
```

**4. Perform API Test**
```bash
# 새 토큰과 새 ID로 테스트
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations/{새로운_조직_ID} \
  -s | jq '.'
```

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
```bash
# Java 21 설정 후 테스트 실행
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

# 전체 백엔드 테스트 실행 및 Allure 리포트 생성
./gradlew test allureReport

# 로컬 H2 데이터베이스로 테스트
SPRING_PROFILES_ACTIVE=local ./gradlew test

# 테스트 프로파일로 테스트 실행 (VM Option 사용)
./gradlew test -Dspring.profiles.active=test
```

#### API Development Testing Workflow
새로운 API를 개발하거나 기존 API를 수정할 때는 **반드시** 다음 테스트들을 수행해야 합니다:

**1. Unit Tests**
```bash
./gradlew test --tests "*ControllerTest*"  # 컨트롤러 테스트만 실행
./gradlew test --tests "*ServiceTest*"     # 서비스 테스트만 실행
```

**2. API Schema Validation Tests**
```bash
# JSON 스키마 기반 API 응답 검증
./gradlew test --tests "*JsonSchemaTest*"
```

**3. API Documentation and Report Generation**
```bash
./gradlew test allureReport      # 테스트 결과를 Allure 리포트로 생성
```

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
Playwright is the primary E2E testing tool for this project, used to validate authentication, UI components, and user flows.

#### How to Run E2E Tests

**0. ⚠️ Prerequisite: Correct Directory**
All `npx playwright` commands must be run from the **project root directory**.
```bash
# 1. Navigate to Project Root (if not already there)
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"
echo "📍 Current Directory: $(pwd)"

# 2. Verify test files exist
ls -la e2e-tests/authentication/
```

**1. 🔄 Prerequisite: Restart Backend**
Because the H2 database is in-memory, you **must restart the backend** before every test run to ensure a clean state.
```bash
pkill -f "bootRun"
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &
sleep 25  # Wait for backend to fully start
```

**2. 🚀 Execute Tests (Standardized Method)**
```bash
# Run a single test file
npx playwright test e2e-tests/authentication/login-success-test.js --reporter=html

# Run all tests in a directory
npx playwright test e2e-tests/authentication/ --reporter=html

# Run with a single worker for stability
npx playwright test e2e-tests/authentication/login-failure-test.js --reporter=html --workers=1
```

**3. 📊 View Test Report**
```bash
# Automatically open the HTML report
npx playwright show-report

# Or open manually
open playwright-report/index.html
```

#### Debugging E2E Test Failures
1.  **Database Constraint Errors**: Backend restart is required.
2.  **Connection Refused**: Backend did not start completely. Increase the `sleep` duration.
3.  **JWT Token Storage Failure**: Usually a timing issue. The tests have retry logic for this.

#### Success Screenshots
- **Purpose**: Automatically capture the UI state upon successful test completion for visual evidence and regression testing.
- **Location**: `test-results/success-screenshots/`
- **Implementation**: A helper function `takeSuccessScreenshot` is used within the tests.

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

**✅ RECOMMENDED: Use absolute path method to avoid directory change errors**

```bash
# Standardized JIRA command execution pattern (ABSOLUTE PATH METHOD)
JIRA_DIR="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira"

# Example: Starting work on an issue
PYTHONPATH="$JIRA_DIR" python3 -c "
import sys
sys.path.insert(0, '$JIRA_DIR')
from quick_start import quick_start
quick_start('ICT-XX')
"

# Example: Adding progress comment
PYTHONPATH="$JIRA_DIR" python3 -c "
import sys
sys.path.insert(0, '$JIRA_DIR')
from jira_workflow import add_progress_comment
add_progress_comment('ICT-XX', 'Progress message', ['task1', 'task2'])
"
```

**🚫 DEPRECATED: Directory changing method (causes frequent errors)**
```bash
# AVOID - This causes directory path issues and file not found errors
cd d_mcpsvr_jira
python3 -c "from quick_start import quick_start; quick_start('ICT-XX')"
cd ..
```

#### Step 0: Search for Similar Issues (⭐ Important)
Before starting a new task, **search JIRA for existing issues** to prevent duplication and leverage past work.
```bash
JIRA_DIR="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira"
# Use the python snippets with absolute path to search by keyword, type, or component
```

#### Step 1: Start Work on an Issue
- **A. Create a new issue**: Use the `safe_create_jira_issue` function in `jira_caller.py`.
- **B. Start an existing issue (🚀 Recommended)**:
```bash
JIRA_DIR="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira"
PYTHONPATH="$JIRA_DIR" python3 -c "
import sys
sys.path.insert(0, '$JIRA_DIR')
from quick_start import quick_start
quick_start('ICT-XX')
"
```
This automatically transitions the issue to "In Progress" and adds a start comment.

#### Step 2: Update Progress
While working, add progress comments.
```bash
JIRA_DIR="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira"
PYTHONPATH="$JIRA_DIR" python3 -c "
import sys
sys.path.insert(0, '$JIRA_DIR')
from jira_workflow import add_progress_comment
add_progress_comment('ICT-XX', 'Progress message', ['current_task_1', 'current_task_2'])
"
```

#### Step 3: Complete Work
**⚠️ Rule**: Do not mark an issue as complete automatically. **Always ask for user confirmation first.**
After the user confirms the fix/feature works, add a completion comment.
```bash
JIRA_DIR="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/d_mcpsvr_jira"
PYTHONPATH="$JIRA_DIR" python3 -c "
import sys
sys.path.insert(0, '$JIRA_DIR')
from jira_workflow import add_completion_comment
add_completion_comment('ICT-XX', 'Completion message', ['modified_file1.js'], {'success': True})
"
```

### 4.3. Bug Fixing Workflow
1.  **Analyze**: Understand the root cause.
2.  **Create JIRA Issue**: Create a "Bug" type issue in JIRA with detailed reproduction steps.
3.  **Fix**: Implement the code changes.
4.  **Test**: Verify the fix and run regression tests.
5.  **Request Confirmation**: Ask the user to verify the fix.
6.  **Close JIRA Issue**: After confirmation, close the issue with a detailed completion comment.

### 4.4. Security & Access Control Guidelines

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
**⚠️ 중요**: CLAUDE.md 파일이 각 영역별 상세 문서는 `docs/` 디렉토리에서 확인하세요.

#### 📂 문서 디렉토리
- **[문서 홈](./docs/README.md)** - 전체 문서 구조 및 네비게이션
- **[E2E Epic 구조](./docs/E2E_EPIC_STRUCTURE.md)** - ✅ Playwright E2E 테스트 Epic 상세 구조 (완료)
---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
