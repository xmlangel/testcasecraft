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

### 8.2. 🔄 표준 오류 수정 워크플로우

**오류 수정 시 표준 프로세스를 따라 체계적이고 투명한 문제 해결을 수행합니다.**

#### 📋 워크플로우 단계

**1단계: 문제 분석 및 JIRA 이슈 생성**
```bash
# 오류 발생 시 즉시 JIRA 이슈 생성
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

jira = get_jira_client()
bug_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [간단한 문제 요약]',
    'description': '''## 🐛 문제 상황
[오류 메시지 및 발생 조건]

### 환경 정보
- 발생 환경: [개발/운영]
- 재현 단계: [구체적인 재현 방법]

### 영향도
- 심각도: [High/Medium/Low]
- 범위: [영향받는 기능 범위]''',
    'issuetype': {'id': '10040'},  # 버그 타입
    'priority': {'id': '2'}  # High
}
new_issue = jira.create_issue(fields=bug_dict)
print(f'✅ 이슈 생성: {new_issue.key}')
"
```

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

#### 📚 워크플로우 활용 예시

이 워크플로우는 다음과 같은 상황에서 활용됩니다:
- 🐛 **버그 수정**: 기능 오류, 성능 문제, 호환성 이슈
- 🔧 **시스템 개선**: 아키텍처 개선, 보안 강화, 성능 최적화
- 🆕 **기능 추가**: 새로운 요구사항 구현 및 기존 기능 확장
- 📋 **환경 문제**: 배포, 설정, 의존성 관련 문제

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

### 9.8. 데이터베이스 설정 및 데이터 유지

#### 환경별 DDL 설정

| 환경 | Profile | DDL 설정 | 데이터 유지 | 설정 파일 |
|------|---------|----------|-------------|-----------|
| **개발(H2)** | `dev` | `create-drop` | ❌ 매번 리셋 | `application-dev.yml` |
| **개발(PostgreSQL)** | `dev-postgresql` | `update` | ✅ **유지** | `application-dev-postgresql.yml` |
| **운영** | `prod` | `update` | ✅ **유지** | `application-prod.yml` |

#### ⚠️ 운영 배포 후 DDL 설정 주의사항

**🚨 중요**: 운영환경에 최초 배포가 완료된 후에는 **반드시 `ddl-auto: update`를 유지**해야 합니다.

```yaml
# application-prod.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # ✅ 운영 데이터 보호를 위해 절대 변경 금지
```

**DDL 설정별 동작**:
- `create-drop`: 시작 시 DROP → CREATE, 종료 시 DROP (❌ **운영 금지**)
- `create`: 시작 시 DROP → CREATE (❌ **운영 금지**)  
- `update`: 스키마 변경사항만 적용, 데이터 유지 (✅ **운영 권장**)
- `validate`: 스키마 검증만, 변경 없음 (✅ 운영 대안)
- `none`: 아무것도 하지 않음 (수동 관리 시)

#### 개발환경 데이터 유지
- **H2 환경** (`dev`): 테스트 목적으로 매번 초기화
- **PostgreSQL 환경** (`dev-postgresql`): 개발 중 데이터 유지로 작업 효율성 향상

### 9.9. 보안 고려사항

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

### 9.10. 운영환경 배포 주의사항

**⚠️ 중요**: 운영환경 배포 및 시작은 **사용자가 직접 수행**해야 합니다.

#### 운영환경 배포 방식
- **Docker 기반 배포**: 운영환경은 반드시 Docker를 통해 배포
- **배포 스크립트**: `deploy-http.sh` 또는 `deploy-https.sh` 사용
- **환경 설정**: `.env.prod` 파일 기반 환경변수 관리
- **PostgreSQL + Redis**: 운영 데이터베이스 및 캐시 시스템

#### 🔒 운영 데이터 보호 체크리스트

**배포 전 필수 확인사항**:
1. ✅ `application-prod.yml`에서 `ddl-auto: update` 설정 확인
2. ✅ 환경변수 `DATABASE_PASSWORD`, `JWT_SECRET` 등 설정 확인  
3. ✅ PostgreSQL 백업 정책 수립
4. ✅ Redis 데이터 백업 계획 확인
5. ✅ 로그 모니터링 및 알림 설정

**배포 후 금지사항**:
- ❌ `ddl-auto: create-drop` 또는 `create`로 변경 금지
- ❌ 프로덕션 데이터베이스 수동 DROP 금지
- ❌ 환경 변수 없이 애플리케이션 재시작 금지

#### Claude Code 작업 범위
- **개발환경 테스트**: `./gradlew bootRun --args="--spring.profiles.active=dev"`로 H2 환경에서 기능 검증
- **PostgreSQL 개발환경**: `dev-postgresql` 프로파일로 PostgreSQL 테스트
- **코드 수정 및 빌드**: `./gradlew build` 까지만 수행
- **테스트 자동화**: 개발환경에서 API 및 기능 테스트 수행

#### 사용자 작업 범위
- **운영환경 시작**: `./deploy-http.sh` 실행
- **운영환경 검증**: 실제 PostgreSQL 환경에서 최종 테스트
- **배포 승인**: 운영환경 테스트 완료 후 배포 결정
- **운영 데이터 관리**: 백업, 모니터링, 보안 정책 관리