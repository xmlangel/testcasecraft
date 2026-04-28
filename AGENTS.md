# AGENTS.md (Unified Guidelines)

This file provides comprehensive guidance for AI Agents when working with code in this repository.
**This is the SINGLE SOURCE OF TRUTH for all agent instructions.**

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

상세한 시스템 아키텍처 정보는 **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** 문서를 참고하세요.

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

#### i18n (다국어) 시스템 파일

**⚠️ 중요**: 새로운 번역을 추가할 때는 **반드시 모든 관련 파일을 수정**해야 합니다.

**번역 키 정의 (Translation Keys)**:

- `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/` - 번역 키 초기화 클래스들
- `src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationKeyDataInitializer.java` - **반드시 여기에 등록 필수**

**🔧 번역 추가 4단계 프로세스**:

1. **번역 키 추가**: `keys/` 하위의 적절한 `KeysInitializer` 클래스에 키 추가
2. **한글 번역 추가**: `translations/` 하위의 관련 `Korean...Translations` 클래스에 번역 추가
3. **영어 번역 추가**: `translations/` 하위의 관련 `English...Translations` 클래스에 번역 추가
4. **🔴 Initializer 등록 (CRITICAL)**: 새로운 `KeysInitializer`를 만든 경우 `TranslationKeyDataInitializer.java`에 필드 추가 및 `initialize()` 메서드 호출 필수

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
npm run build       # Build for production
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

1. **Restart Application**: `pkill -f "bootRun"` 후 재시작 (또는 IDE의 재시작 버튼 활용)
2. **Session Verification**: 서버 재시작 시 기존 JWT 토큰은 데이터베이스에 유지되나, 안정적인 테스트를 위해 재로그인 권장
3. **Database State**: PostgreSQL 데이터는 유지되므로, 스키마 변경 시 `ddl-auto: update` 설정 확인 필수

---

## 3. 🧪 Testing Guidelines

### 3.1. Overall Testing Strategy

- **Backend Unit & Integration Tests**: TestNG
- **API Schema Validation**: JSON Schema
- **E2E Tests**: Playwright
- **Reporting**: Allure (Backend), Playwright Reporter (E2E)

### 3.2. Backend Testing (TestNG)

```bash
# 로컬 데이터베이스로 테스트
SPRING_PROFILES_ACTIVE=local ./gradlew test

# 특정 테스트 실행
./gradlew test --tests "*ControllerTest*"
```

### 3.3. E2E Testing (Playwright)

#### Overview

Playwright is the primary E2E testing tool. See `docs/E2E_TESTING_GUIDE.md` for full details.

#### Prerequisites

1. **Docker services running**: PostgreSQL, MinIO, RAG service
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

# 2. Run Tests
npm run test:ict-138 --prefix src/test/e2e
```

#### E2E Navigation Structure & Selectors

- **Flow**: 로그인(/) → 프로젝트 선택(/projects) → 개별 프로젝트(/projects/{id}) → 탭 선택
- **Selectors**:
  - `data-testid` 사용 권장 (예: `login-submit-button`, `testcase-tree-item-${id}`)
  - Text selector: `text=대시보드`, `button:has-text("저장")`

#### Test Rules

- **환경 설정**: `baseURL: 'http://localhost:8080'` 사용 (원격 서버 접속 금지)
- **완료 판정**: API 응답 확인만으로는 부족하며, 실제 UI 동작 검증 필요.

---

---

## 4. 🤖 MCP & AI Integration

- **Context7**: Documentation & Patterns
- **Playwright**: E2E Testing

---

## 5. 📝 Project-Specific Notes

- **Communication Language**: **ALWAYS use Korean (한국어)** for all responses, comments, and artifacts.
- **Artifacts**: `walkthrough.md`, `implementation_plan.md` must be in **Korean**.

---

## 6. 🚀 Application Startup Guide

### 6.1. Prerequisites

- **Java 21** installed and configured
- **Docker & Docker Compose** installed
- **Docker services running**: PostgreSQL, MinIO, RAG service

### 6.2. Starting Infrastructure (Docker)

```bash
cd docker-compose-build
docker-compose -f docker-compose.yml up -d postgres postgres-rag minio rag-service
```

### 6.3. Starting Application (Spring Boot + Frontend)

```bash
cd .. # Project Root
./gradlew bootRun
```

- Runs on **http://localhost:8080**
- Basic login: admin / admin123

### 6.4. Troubleshooting Startup Issues

- **Database Connection Issues**: `docker-compose -f docker-compose.yml ps` 로 상태 확인 및 로그 점검
- **Memory Issues**: `export JAVA_OPTS="-Xmx2g -Xms1g"` 로 힙 메모리 증설

---

## 7. 🚨 File Deletion Policy

**⛔ Agent 파일 삭제 금지 (사용자 승인 필수)**

- **원칙**: Agent는 파일을 직접 삭제(`rm`)하지 않습니다.
- **절차**: 삭제가 필요한 경우 사용자에게 이유를 설명하고 승인을 요청합니다.

---

## 8. 🚨 프로세스 종료 및 빌드 정책

**⛔ Agent는 프로세스 종료 및 빌드 명령을 직접 실행하지 않음**

- **프로세스 종료**: 사용자가 직접 Java 프로세스 종료 (`pkill`, `kill` 등)
- **애플리케이션 빌드**: 사용자가 직접 `./gradlew clean` 및 `./gradlew bootRun` 실행
- **Agent 역할**: 문제 진단, 명령어 가이드 제공, 코드 수정 및 검증
