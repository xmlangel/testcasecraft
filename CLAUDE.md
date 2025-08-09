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

# Check API health
curl -s http://localhost:8083/actuator/health

# Check if ports are available
lsof -ti:3000  # Frontend port
lsof -ti:8083  # Backend API port
```

#### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8083
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
- 하나의 작업이 끝나면 작업내역을 지라에 기입하는 것을 추가해줌
- 모든 작업 완료 후에는 반드시 해당 작업의 진행 상황과 상세 내용을 JIRA에 코멘트로 업데이트해야 함
- **중요**: JIRA 이슈 상태는 변경하지 않고, 진행 상황 코멘트만 추가
- 작업 진행 상황 코멘트에 다음 사항을 JIRA 이슈에 포함:
  - 수행된 작업의 구체적인 내용
  - 변경된 파일 목록
  - 테스트 결과
  - 진행률 (예: 70% 완료)
  - 향후 추가 작업이 필요한 사항

#### JIRA 이슈 생성 가이드라인 (오류 방지)

**⚠️ 중요**: JIRA 이슈 생성 시 다음 절차를 반드시 따라야 함

##### 1. 사전 검증 절차
```python
# 1단계: 프로젝트 이슈 타입 확인
meta = jira.createmeta(projectKeys='ICT', expand='projects.issuetypes.fields')
# 2단계: 사용 가능한 이슈 타입 ID 확인
available_types = [(it['id'], it['name']) for it in meta['projects'][0]['issuetypes']]
```

##### 2. 검증된 이슈 타입 ID (ICT 프로젝트)
- **에픽**: `10005` (Epic)
- **작업**: `10003` (Task) - 일반 작업용
- **하위 작업**: `10006` (Subtask) - 하위 작업용 (부모 필요)
- **스토리**: `10042` (Story)
- **버그**: `10040` (Bug)

##### 3. 에픽 생성 방법
```python
# ✅ 올바른 에픽 생성
epic_dict = {
    'project': {'key': 'ICT'},
    'summary': '에픽 제목',
    'description': '상세 설명',
    'issuetype': {'id': '10005'}  # 에픽 타입
}
epic = jira.create_issue(fields=epic_dict)
```

##### 4. 일반 작업 생성 방법
```python
# ✅ 올바른 작업 생성
task_dict = {
    'project': {'key': 'ICT'},
    'summary': '작업 제목',
    'description': '상세 설명',
    'issuetype': {'id': '10003'}  # 작업 타입
}
task = jira.create_issue(fields=task_dict)
```

##### 5. 계층 구조 제약사항
- **에픽 → 하위 작업**: ❌ 불가능 ("해당 상위 업무 항목은 적절한 계층 구조에 속하지 않습니다")
- **에픽 → 작업**: ✅ Epic Link로 연결 (수동 설정 필요)
- **작업 → 하위 작업**: ✅ 가능

##### 6. Epic Link 설정 (현재 프로젝트에서는 사용 불가)
```python
# ⚠️ Epic Link 필드가 화면에 없어서 설정 불가
# customfield_10014 오류 발생 시 수동으로 JIRA UI에서 설정 필요
```

##### 7. 권장 워크플로우
1. **에픽 생성**: 큰 기능 단위 (issuetype: '10005')
2. **작업들 생성**: 세부 구현 단위 (issuetype: '10003')
3. **수동 연결**: JIRA UI에서 Epic Link 설정
4. **하위 작업 생성**: 필요 시 작업 하위에 생성 (issuetype: '10006', parent 설정)

##### 8. 오류 대응 방법
- **"선택한 이슈 유형이 올바르지 않습니다"** → 이슈 타입 ID 재확인
- **"해당 상위 업무 항목은 적절한 계층 구조에 속하지 않습니다"** → 계층 구조 변경
- **"Field cannot be set"** → 필수 필드 확인 또는 수동 설정

##### 9. 테스트 생성 패턴
```python
# 안전한 이슈 생성 패턴
try:
    # 먼저 메타데이터 확인
    meta = jira.createmeta(projectKeys='ICT')
    
    # 이슈 생성
    issue_dict = {
        'project': {'key': 'ICT'},
        'summary': '제목',
        'description': '설명',
        'issuetype': {'id': '10003'}  # 검증된 작업 타입
    }
    
    new_issue = jira.create_issue(fields=issue_dict)
    print(f'✅ 이슈 생성 성공: {new_issue.key}')
    
except Exception as e:
    print(f'❌ 이슈 생성 실패: {str(e)}')
```

##### 10. 실제 성공 사례 (ICT-138)
```python
# ICT-138 에픽 생성 (성공)
epic_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-138: 테스트케이스 스프레드시트 형태 일괄 입력 기능',
    'description': '사용자가 테스트케이스를 스프레드시트 형태로 일괄 입력할 수 있는 기능',
    'issuetype': {'id': '10005'}  # 에픽
}

# ICT-139~143 작업들 생성 (성공)
task_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-139: 입력 모드 토글 UI 컴포넌트 개발',
    'description': '상세 구현 내용...',
    'issuetype': {'id': '10003'}  # 작업
}
```