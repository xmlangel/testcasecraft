# CLAUDE.md (Reorganized)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `.claude-mcp.json` - Playwright MCP 서버 설정

#### Configuration
- `build.gradle` - Main build configuration with frontend integration
- `src/main/frontend/package.json` - Frontend dependencies and scripts
- `src/test/resources/allure.properties` - Allure reporting configuration

#### Redis & Performance Testing Files (ICT-130)
- `docker-compose.yml` - Redis Docker environment configuration
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

[... rest of the existing content remains the same ...]

## 7. 🚀 Application Startup Guide

### 7.1. Prerequisites
- **Java 21** installed and configured
- **PostgreSQL** database running
- **Redis** server running (for caching, ICT-130)
- **Node.js** for frontend build (handled by Gradle)

### 7.2. Database Setup
```sql
-- PostgreSQL database creation
CREATE DATABASE testcase_management;
CREATE USER testcase_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE testcase_management TO testcase_user;
```

### 7.3. Application Startup Sequence

#### Step 1: Start Redis (Optional but Recommended)
```bash
# Using Docker
docker run -d --name redis-testcase -p 6379:6379 redis:latest

# Or start existing Redis container
docker start redis-testcase
```

#### Step 2: Start Backend Application
```bash
# Method 1: Using Gradle (Recommended)
./gradlew bootRun

# Method 2: Background execution for testing
./gradlew bootRun > app.log 2>&1 &

# Method 3: Build and run JAR
./gradlew build
java -jar build/libs/testcasemanagement-0.0.1-SNAPSHOT.jar
```

#### Step 3: Verify Application Startup
```bash
# Check if backend is running (should return HTML)
curl -s http://localhost:3000 | head -10

# Check if ports are available
lsof -ti:3000  # Frontend port
lsof -ti:8083  # Backend API port
```

#### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Console** (if enabled): http://localhost:8083/h2-console

### 7.4. Default Login Credentials
```
Username: admin
Password: admin
```

### 7.5. Troubleshooting Startup Issues

#### Port Already in Use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process using port 8083  
lsof -ti:8083 | xargs kill -9
```

#### Database Connection Issues
- Check PostgreSQL is running: `psql -h localhost -U testcase_user -d testcase_management`
- Verify database credentials in `src/main/resources/application.yml`
- Check firewall settings for database port (default: 5432)

#### Memory Issues
```bash
# Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
./gradlew bootRun
```

### 7.6. E2E Testing Prerequisites

Before running E2E tests, ensure:
1. **Backend is running**: `./gradlew bootRun`
2. **Application is accessible**: `curl http://localhost:3000`
3. **Database has test data**: Admin user and test projects exist
4. **Playwright dependencies**: `npm install` in project root

#### E2E Test Execution
```bash
# Run specific E2E test
cd e2e-tests
node spreadsheet-step-test.js

# Run all E2E tests
npm run test:e2e
```

## 8. Process Guidelines

### 8.1. Jira Workflow Additions

#### Process for Documenting Work Progress
- 작업의 진행 상황과 상세 내용을 JIRA에 코멘트로 업데이트해야 함
- **중요**: JIRA 이슈 상태는 변경하지 않고, 진행 상황 코멘트만 추가
- 작업 진행 상황 코멘트에 다음 사항을 JIRA 이슈에 포함:
  - 수행된 작업의 구체적인 내용
  - 변경된 파일 목록
  - 테스트 결과
  - 향후 추가 작업이 필요한 사항

#### JIRA 이슈 생성 가이드라인 (오류 방지)

**⚠️ 중요**: JIRA 이슈 생성 시 다음 절차를 반드시 따라야 함

##### JIRA 서버 URL 및 링크 생성
- **실제 JIRA 서버**: `https://kwangmyung.atlassian.net` (d_mcpsvr_jira/.env에서 확인)
- **이슈 URL 패턴**: `https://kwangmyung.atlassian.net/browse/{issue_key}`
- **예시**: ICT-167 → `https://kwangmyung.atlassian.net/browse/ICT-167`

```python
# ✅ 올바른 이슈 URL 생성 방법
def get_issue_url(issue_key):
    jira_server = os.getenv("JIRA_SERVER", "https://kwangmyung.atlassian.net")
    return f"{jira_server}/browse/{issue_key}"

# 이슈 생성 후 URL 출력
new_issue = jira.create_issue(fields=issue_dict)
issue_url = get_issue_url(new_issue.key)
print(f'✅ 이슈 생성 성공: {new_issue.key}')
print(f'이슈 URL: {issue_url}')
```

##### 8-2. 기본 이슈 템플릿

```python
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
    'issuetype': {'id': '10003'},
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
    'issuetype': {'id': '10040'},  # 버그 타입
    'priority': {'id': '2'}  # Medium
}
```

#### 8-3. JIRA 상태 관리 중요 규칙

**⚠️ 상태 변경 제한**: 
- `add_completion_comment()` 함수는 자동으로 이슈를 '완료' 상태로 변경
- **사용자가 명시적으로 완료 처리를 요청하기 전까지는 절대 사용 금지**
- 대신 `add_issue_comment()` 함수를 사용하여 상태 변경 없이 진행 상황만 기록

**올바른 JIRA 워크플로우**:
```python
# ✅ 분석/진행 상황 기록 (상태 변경 없음)
add_issue_comment('ICT-XXX', analysis_content, '개발 추정 분석')
add_issue_comment('ICT-XXX', progress_content, '진행 상황 업데이트')

# ❌ 완료 처리 (사용자 요청 시에만)
# add_completion_comment('ICT-XXX', ...) # 자동 상태 변경됨!
```