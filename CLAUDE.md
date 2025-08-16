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
**⚠️ 중요**: JIRA 통합 관련 상세 가이드는 **[docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md)**를 반드시 참조하세요.

- `d_mcpsvr_jira/` - JIRA 연동 모듈 디렉토리 (설정 및 사용법은 JIRA_INTEGRATION.md 참조)
- `d_mcpsvr_jira/.env` - JIRA 인증 정보 (설정 방법은 JIRA_INTEGRATION.md § 2 참조)

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
# Method 1: Using Development Script (Recommended for Dev)
./start-dev.sh

# Method 2: Using Gradle Dev Tasks (ICT-216 개선)
./gradlew bootRunDev              # 개발용 빌드 + 실행 (dev 프로파일)
./gradlew buildDev                # 개발용 빌드만 실행
./gradlew appNpmBuildDev          # 프론트엔드만 개발용 빌드

# Method 3: Traditional Gradle (기본값이 이제 localhost)
./gradlew bootRun

# Method 4: Background execution for testing
./gradlew bootRun > app.log 2>&1 &

# Method 5: Build and run JAR
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

### 8.0. 🧪 E2E Testing Requirements (필수 조건)

#### 🚨 중요: 이슈 완료 전 E2E 테스트 통과 필수

**모든 버그 수정 및 기능 구현 작업은 반드시 E2E 테스트 통과를 확인한 후 완료 처리해야 함**

#### E2E 테스트 실행 조건
1. **애플리케이션 정상 실행**: 백엔드 서버 (8080 포트) 정상 동작 확인
2. **로컬 환경 필수**: 모든 E2E 테스트는 반드시 `http://localhost:8080`으로 접근해야 함
3. **원격 서버 접속 금지**: 외부 서버 (qaspecialist.shop 등)로의 접속 시도는 테스트 실패 원인
4. **Playwright 테스트 성공**: 해당 기능의 E2E 테스트가 실제로 통과해야 함
5. **API 호출 검증**: 브라우저에서 실제 API 호출이 성공적으로 이루어져야 함
6. **UI 동작 확인**: 사용자 관점에서 기능이 정상 동작해야 함

#### E2E 테스트 파일 위치
- `e2e-tests/` 디렉토리 하위의 모든 테스트 파일
- 각 ICT 이슈별 전용 테스트 파일 (예: `ict-215-junit-test.js`)
- 기능별 테스트 파일 (예: `dashboard/`, `authentication/`)

#### 완료 판정 기준
```bash
# ✅ 올바른 완료 판정 절차
1. 애플리케이션 실행: ./gradlew bootRun
2. 로컬 접근 확인: curl http://localhost:8080 (200 응답 확인)
3. E2E 테스트 실행: node e2e-tests/[테스트파일명].js
4. 테스트 통과 확인: 모든 검증 단계 성공 (localhost 접근만 허용)
5. JIRA 이슈 완료 처리

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

### 8.1. JIRA 통합 워크플로우

**📋 완전한 JIRA 가이드**: **[docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md)** 를 반드시 참조하세요.

#### 핵심 JIRA 워크플로우 요약
1. **작업 시작**: 이슈 생성 및 "진행 중" 상태 변경
2. **진행 상황 업데이트**: `add_issue_comment()` 사용 (상태 변경 없음)
3. **완료 처리**: 사용자 확인 후 `add_completion_comment()` 사용

#### ⚠️ 중요 규칙
- **모든 JIRA 명령어는 프로젝트 루트에서 실행**: `PYTHONPATH="./d_mcpsvr_jira" python3 -c`
- **상태 변경 제한**: 사용자 명시적 요청 전까지 `add_completion_comment()` 사용 금지
- **오류 처리**: JIRA 작업 오류 시 즉시 작업 중지 및 사용자 확인 요청

#### 표준 실행 패턴
```bash
# 1. 작업 시작
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from quick_start import quick_start
try:
    quick_start('ICT-XXX')
    print('✅ 이슈 시작 완료')
except Exception as e:
    print(f'❌ 이슈 시작 실패: {str(e)}')
"

# 2. 진행 상황 업데이트
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_issue_comment
try:
    result = add_issue_comment('ICT-XXX', '작업 진행 상황...', '진행 상황')
    print(f'✅ 진행 상황 업데이트: {result}')
except Exception as e:
    print(f'❌ 업데이트 실패: {str(e)}')
"
```

**상세 설정, 템플릿, 오류 해결**: [docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md) 참조

---

## 9. 🔧 환경별 설정 관리

### 9.1. 환경 구성 개요

이 프로젝트는 **개발(dev)**과 **운영(prod)** 환경을 분리하여 관리합니다:

- **공통 설정**: `application.yml` - 모든 환경에서 공유하는 기본 설정
- **개발 환경**: `application-dev.yml` - 개발 전용 설정 (H2, 디버그 로깅)
- **운영 환경**: `application-prod.yml` - 운영 전용 설정 (PostgreSQL, Redis, 보안 강화)

### 9.2. 개발 환경 실행

#### 방법 1: 스크립트 사용 (권장)
```bash
# 개발 환경 시작
./start-dev.sh
```

#### 방법 2: 직접 실행
```bash
# 환경 변수 설정
export SPRING_PROFILES_ACTIVE=dev
export JIRA_ENCRYPTION_KEY="5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y="

# Gradle 실행
./gradlew bootRun --args="--spring.profiles.active=dev"
```

#### 개발 환경 특징
- **데이터베이스**: H2 인메모리 (자동 초기화)
- **포트**: 8080 (애플리케이션), 8083 (액추에이터)
- **H2 콘솔**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **로깅**: DEBUG 레벨, SQL 로깅 활성화
- **JIRA 보안**: HTTPS 강제 비활성화, SSL 검증 스킵

### 9.3. 운영 환경 실행

#### 환경 변수 설정
운영 환경 실행 전 필수 환경 변수를 설정해야 합니다:

```bash
# 필수 환경 변수 (예시)
export JWT_SECRET="your_very_strong_512_bit_secret_key"
export JIRA_ENCRYPTION_KEY="your_32_byte_base64_encoded_key"
export DATABASE_PASSWORD="your_strong_db_password"
export REDIS_PASSWORD="your_redis_password"
```

#### 방법 1: 스크립트 사용 (권장)
```bash
# 운영 환경 시작
./start-prod.sh
```

#### 방법 2: JAR 직접 실행
```bash
# JAR 빌드
./gradlew bootJar

# 운영 환경으로 실행
java -jar -Xmx2g -Xms1g \
     -Dspring.profiles.active=prod \
     build/libs/testcasemanagement-0.0.1-SNAPSHOT.jar
```

#### 운영 환경 특징
- **데이터베이스**: PostgreSQL (영속성)
- **캐시**: Redis (성능 최적화)
- **보안**: HTTPS 강제, JWT 환경변수 필수
- **로깅**: INFO 레벨, 파일 로깅, 로테이션
- **모니터링**: 제한된 액추에이터 엔드포인트 노출
- **JIRA 보안**: HTTPS 강제, SSL 검증 활성화

### 9.4. 환경 변수 설정 가이드

#### 개발 환경 설정 파일
```bash
# .env.dev.example 파일을 .env.dev로 복사
cp .env.dev.example .env.dev
# 필요한 값들을 수정
```

#### 운영 환경 설정 파일
```bash
# .env.prod.example 파일을 .env.prod로 복사
cp .env.prod.example .env.prod
# 실제 운영 값들로 수정 (보안 주의!)
```

### 9.5. 주요 환경별 차이점

| 설정 항목 | 개발(dev) | 운영(prod) |
|----------|----------|-----------|
| 데이터베이스 | H2 인메모리 | PostgreSQL |
| 캐시 | 비활성화 | Redis |
| 로그 레벨 | DEBUG | INFO |
| JWT 만료시간 | 1시간/1일 | 15분/7일 |
| HTTPS 강제 | 비활성화 | 활성화 |
| 액추에이터 | 모든 엔드포인트 | 제한된 엔드포인트 |
| JIRA SSL 검증 | 스킵 | 활성화 |
| 환경변수 필수성 | 선택적 | 필수 |

### 9.6. 환경별 접속 정보

#### 개발 환경
- **애플리케이션**: http://localhost:8080
- **H2 콘솔**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **액추에이터**: http://localhost:8083/actuator
- **기본 로그인**: admin/admin

#### 운영 환경
- **애플리케이션**: https://your-domain:8080 (또는 설정된 포트)
- **액추에이터**: https://your-domain:8083/actuator (제한된 엔드포인트)
- **로그 파일**: `/var/log/testcase/application.log`

### 9.7. 환경 전환 시 주의사항

#### 개발 → 운영 전환
1. **환경변수 확인**: 모든 필수 환경변수 설정 완료
2. **데이터베이스 준비**: PostgreSQL 서버 및 스키마 준비
3. **Redis 준비**: Redis 서버 설정 및 접근 권한 확인
4. **SSL 인증서**: HTTPS 인증서 설정 (필요시)
5. **방화벽 설정**: 필요한 포트 오픈 (8080, 8083, 5432, 6379)

#### 문제 해결
- **프로파일 확인**: `SPRING_PROFILES_ACTIVE` 환경변수 값 검증
- **로그 확인**: 각 환경의 로그 레벨과 위치 확인
- **데이터베이스 연결**: 연결 문자열과 인증 정보 검증
- **포트 충돌**: 사용 중인 포트 확인 (`lsof -ti:8080`)

### 9.8. 보안 고려사항

#### 개발 환경
- 개발용 시크릿 키와 토큰 사용
- 로컬 네트워크에서만 접근 가능하도록 설정
- 민감한 데이터는 테스트 데이터만 사용

#### 운영 환경  
- 강력한 JWT 시크릿 키 사용 (512비트)
- 데이터베이스 암호화 및 백업 정책
- Redis 인증 및 네트워크 보안
- 정기적인 시크릿 로테이션
- 감사 로그 활성화 및 모니터링