# TestCaseCraft 프로젝트 구조 매뉴얼

## 1. 📋 프로젝트 개요

### 1.1 기본 정보

- **프로젝트명**: TestCaseCraft (테스트케이스 관리 시스템)
- **버전**: 0.0.2-SNAPSHOT
- **아키텍처**: Full-Stack 웹 애플리케이션
- **기술 스택**:
  - **Frontend**: React 18 + Material-UI + React Router
  - **Backend**: Spring Boot 3.2.4 + Java 21 + PostgreSQL
  - **Build**: Gradle + Node.js 통합 빌드
  - **Testing**: TestNG + Allure + Playwright

### 1.2 프로젝트 목적

- 테스트케이스의 계층적 관리 및 조직화
- 테스트 계획 수립 및 실행 관리
- 테스트 결과 추적 및 리포팅
- 다중 프로젝트 및 조직 지원
- JIRA 통합을 통한 이슈 관리

## 2. 🏗️ 전체 아키텍처

```
TestCaseCraft/
├── 📁 Frontend (React SPA)          # 사용자 인터페이스
├── 📁 Backend (Spring Boot API)     # 비즈니스 로직 및 데이터
├── 📁 Database (PostgreSQL)         # 데이터 저장소
├── 📁 Build System (Gradle)         # 통합 빌드 시스템
├── 📁 Testing (E2E + Unit)          # 테스트 프레임워크
└── 📁 Integration (JIRA)            # 외부 시스템 연동
```

### 2.1 아키텍처 특징

- **SPA (Single Page Application)**: React 기반 클라이언트 사이드 라우팅
- **RESTful API**: Spring Boot로 구현된 REST API 서버
- **JWT 인증**: 토큰 기반 인증 및 세션 관리
- **계층형 구조**: Controller → Service → Repository → Entity 패턴
- **통합 빌드**: Frontend와 Backend를 하나의 JAR로 패키징

## 3. 📂 디렉토리 구조 상세

### 3.1 루트 디렉토리

```
TestCaseCraft/
├── 📄 build.gradle                  # 메인 빌드 설정
├── 📄 CLAUDE.md                     # AI 어시스턴트 가이드
├── 📄 README.md                     # 프로젝트 설명서
├── 📄 playwright.config.js          # E2E 테스트 설정
├── 📄 package.json                  # Node.js 의존성 (E2E)
├── 📁 src/                          # 소스 코드
├── 📁 docs/                         # 문서화
├── 📁 e2e-tests/                    # E2E 테스트
├── 📁 scripts/                      # 배포/관리 스크립트
├── 📁 docker-compose-*/             # Docker 환경 설정
└── 📁 d_mcpsvr_jira/               # JIRA 통합 모듈
```

### 3.2 소스 코드 구조 (`src/`)

```
src/
├── main/
│   ├── frontend/                    # React 프론트엔드
│   │   ├── public/                  # 정적 파일
│   │   ├── src/                     # React 소스
│   │   └── package.json             # Frontend 의존성
│   ├── java/                        # Spring Boot 백엔드
│   │   └── com.testcase.testcasemanagement/
│   └── resources/                   # 설정 파일 및 리소스
└── test/
    ├── java/                        # Java 단위 테스트
    ├── front/                       # Frontend 테스트
    └── resources/                   # 테스트 리소스
```

## 4. 🎨 Frontend 구조 (React)

### 4.1 프론트엔드 디렉토리 (`src/main/frontend/src/`)

```
frontend/src/
├── 📄 App.jsx                       # 메인 애플리케이션 컴포넌트
├── 📄 index.jsx                     # React DOM 렌더링
├── 📁 components/                   # React 컴포넌트
│   ├── common/                      # 공통 컴포넌트
│   ├── dashboard/                   # 대시보드 컴포넌트
│   ├── testcase/                    # 테스트케이스 관리
│   ├── testplan/                    # 테스트계획 관리
│   ├── testexecution/               # 테스트실행 관리
│   └── project/                     # 프로젝트 관리
├── 📁 context/                      # React Context (상태 관리)
├── 📁 hooks/                        # Custom React Hooks
├── 📁 services/                     # API 호출 서비스
├── 📁 utils/                        # 유틸리티 함수
├── 📁 models/                       # 데이터 모델 정의
└── 📁 constants/                    # 상수 정의
```

### 4.2 주요 컴포넌트

- **App.jsx**: 라우팅 및 인증 관리
- **AppContext.jsx**: 전역 상태 관리 (프로젝트, 사용자, API 토큰)
- **Dashboard/**: 프로젝트별 대시보드 및 통계
- **TestCase/**: 계층형 테스트케이스 트리 관리
- **TestPlan/**: 테스트 계획 생성 및 관리
- **TestExecution/**: 테스트 실행 및 결과 입력

### 4.3 기술 스택

- **React 18**: 함수형 컴포넌트 + Hooks
- **Material-UI 5**: 디자인 시스템 및 컴포넌트 라이브러리
- **React Router 7**: 클라이언트 사이드 라우팅
- **Axios**: HTTP 클라이언트 (API 호출)
- **React Beautiful DnD**: 드래그 앤 드롭
- **Recharts**: 차트 및 데이터 시각화

## 5. ⚙️ Backend 구조 (Spring Boot)

### 5.1 백엔드 디렉토리 (`src/main/java/com/testcase/testcasemanagement/`)

```
backend/
├── 📄 TestcasemanagementApplication.java  # 메인 애플리케이션
├── 📁 controller/                   # REST API 컨트롤러
│   ├── AuthController.java          # 인증 관련 API
│   ├── ProjectController.java       # 프로젝트 관리 API
│   ├── TestCaseController.java      # 테스트케이스 API
│   ├── TestPlanController.java      # 테스트계획 API
│   └── TestExecutionController.java # 테스트실행 API
├── 📁 service/                      # 비즈니스 로직
├── 📁 repository/                   # 데이터 액세스 레이어
├── 📁 model/                        # JPA 엔티티
├── 📁 dto/                          # 데이터 전송 객체
├── 📁 config/                       # 설정 클래스
├── 📁 security/                     # 보안 관련
└── 📁 exception/                    # 예외 처리
```

### 5.2 레이어 구조

1. **Controller Layer**: HTTP 요청/응답 처리
2. **Service Layer**: 비즈니스 로직 구현
3. **Repository Layer**: 데이터베이스 액세스 (Spring Data JPA)
4. **Model Layer**: JPA 엔티티 정의

### 5.3 주요 기능 모듈

- **Authentication**: JWT 기반 인증 및 권한 관리
- **Project Management**: 다중 프로젝트 및 조직 지원
- **Test Case Management**: 계층형 테스트케이스 구조
- **Test Planning**: 테스트 계획 및 실행 관리
- **Reporting**: 테스트 결과 분석 및 리포팅

## 6. 🗄️ 데이터베이스 설계

### 6.1 주요 엔티티

```sql
-- 조직 관리
Organization (조직)
├── Project (프로젝트)
└── User (사용자)

-- 테스트 관리
TestCase (테스트케이스)
├── TestCaseVersion (버전 관리)
└── TestStep (테스트 단계)

-- 테스트 계획 및 실행
TestPlan (테스트계획)
├── TestPlanTestCase (계획-케이스 연결)
└── TestExecution (테스트실행)
    └── TestResult (테스트결과)
```

### 6.2 관계형 설계

- **1:N 관계**: Organization → Project, Project → TestCase
- **계층형 구조**: TestCase의 parent-child 관계
- **다대다 관계**: TestPlan ↔ TestCase (TestPlanTestCase)
- **버전 관리**: TestCase → TestCaseVersion

## 7. 🔧 빌드 시스템 (Gradle)

### 7.1 통합 빌드 프로세스

```gradle
1. Frontend Build (React)
   ├── npm install        # 의존성 설치
   ├── npm run build      # React 애플리케이션 빌드
   └── Copy to static/    # Spring Boot static 리소스로 복사

2. Backend Build (Spring Boot)
   ├── Java 컴파일        # Java 소스 컴파일
   ├── 테스트 실행        # 단위 테스트 실행
   └── JAR 패키징        # 실행 가능한 JAR 생성
```

### 7.2 주요 Gradle Task

- **`./gradlew bootRun`**: 개발 서버 실행
- **`./gradlew build`**: 전체 빌드 (Frontend + Backend)
- **`./gradlew test`**: 단위 테스트 실행
- **`./gradlew performanceTest`**: 성능 테스트
- **`./gradlew allureReport`**: 테스트 리포트 생성

## 8. 🧪 테스팅 구조

### 8.1 테스트 계층

```
Testing/
├── 📁 Unit Tests (TestNG)           # Java 단위 테스트
│   ├── Service Layer Tests         # 비즈니스 로직 테스트
│   ├── Repository Tests            # 데이터 레이어 테스트
│   └── API Integration Tests       # API 통합 테스트
├── 📁 Frontend Tests (Jest)         # React 컴포넌트 테스트
└── 📁 E2E Tests (Playwright)        # 엔드투엔드 테스트
    ├── Authentication Tests        # 로그인/로그아웃
    ├── Dashboard Tests            # 대시보드 기능
    ├── TestCase Management        # 테스트케이스 관리
    └── User Scenarios            # 사용자 시나리오
```

### 8.2 테스트 도구

- **TestNG**: Java 단위 테스트 프레임워크
- **Allure**: 테스트 결과 리포팅
- **Playwright**: 브라우저 자동화 (E2E 테스트)
- **Rest Assured**: API 테스트
- **H2**: 테스트용 인메모리 데이터베이스

## 9. 🔌 통합 시스템

### 9.1 JIRA 통합 (`d_mcpsvr_jira/`)

```
JIRA Integration/
├── 📄 jira_workflow.py             # JIRA API 워크플로우
├── 📄 improved_jira_creator.py     # 이슈 생성 자동화
├── 📁 databases/                   # 로컬 SQLite 캐시
└── 📁 e2e-tests/                   # JIRA 통합 E2E 테스트
```

**기능**:

- 자동 이슈 생성 및 상태 업데이트
- 테스트 결과와 JIRA 이슈 연동
- 워크플로우 자동화

### 9.2 외부 API 통합

- **Google Sheets API**: 테스트케이스 일괄 가져오기/내보내기
- **SMTP**: 이메일 알림
- **File Upload**: JUnit XML, Excel 파일 업로드

## 10. 🚀 배포 및 환경 관리

### 10.1 환경 설정

```
Environments/
├── 📁 Development (개발)
│   ├── H2 Database              # 인메모리 DB
│   ├── Debug Logging           # 상세 로깅
│   └── Hot Reload             # 코드 변경 자동 반영
├── 📁 Testing (테스트)
│   ├── PostgreSQL             # 실제 DB 환경
│   └── Performance Monitoring # 성능 모니터링
└── 📁 Production (운영)
    ├── Docker Deployment      # 컨테이너 배포
    ├── HTTPS/SSL             # 보안 통신
    └── Monitoring & Logging   # 운영 모니터링
```

### 10.2 배포 스크립트

- **`start-dev.sh`**: 개발 환경 시작
- **`start-dev-postgresql.sh`**: PostgreSQL 개발 환경
- **`docker-compose-*/manage.sh`**: Docker 환경 관리

## 11. 📊 모니터링 및 성능

### 11.1 성능 모니터링 (ICT-130)

- **Spring Actuator**: 애플리케이션 상태 모니터링
- **Prometheus**: 메트릭 수집
- **Performance Tests**: 대시보드 API 부하 테스트
- **Load Testing**: 시스템 부하 테스트

### 11.2 로깅 시스템

- **개발**: DEBUG 레벨, SQL 로깅
- **운영**: INFO 레벨, 구조화된 로그
- **파일 기반**: 애플리케이션별 로그 파일 분리

## 12. 🔐 보안 및 인증

### 12.1 인증 시스템

- **JWT (JSON Web Token)**: 상태 비저장 토큰 인증
- **Access Token + Refresh Token**: 토큰 갱신 메커니즘
- **Role-Based Access Control**: 역할 기반 권한 관리

### 12.2 보안 기능

- **Password Encoding**: BCrypt 해시화
- **CORS 설정**: 크로스 오리진 요청 제어
- **HTTPS Support**: SSL/TLS 암호화 통신
- **SQL Injection 방지**: Prepared Statement 사용

## 13. 📈 확장성 및 유지보수

### 13.1 확장 포인트

- **모듈형 구조**: 기능별 독립적 개발 가능
- **API First**: REST API를 통한 다양한 클라이언트 지원
- **데이터베이스 독립성**: JPA 추상화를 통한 DB 변경 용이성
- **플러그인 아키텍처**: JIRA 외 다른 시스템 통합 가능

### 13.2 유지보수 지원

- **코드 품질**: SonarQube 정적 분석
- **자동 테스트**: CI/CD 파이프라인 통합
- **문서화**: API 문서 (Swagger), 기술 문서
- **버전 관리**: 시맨틱 버저닝 적용

## 14. 🛠️ 개발 도구 및 IDE 설정

### 14.1 권장 개발 도구

- **IDE**: IntelliJ IDEA (Spring Boot), VS Code (React)
- **Database**: DBeaver, pgAdmin
- **API Testing**: Postman, Swagger UI
- **Version Control**: Git, GitHub

### 14.2 개발 환경 설정

```bash
# 개발 환경 시작
./gradlew bootRunDev

# E2E 테스트 실행
npm run test:e2e

# 테스트 리포트 생성
./gradlew allureReport
```

## 15. 📚 관련 문서

### 15.1 프로젝트 문서

- **`CLAUDE.md`**: AI 어시스턴트 통합 가이드
- **`docs/API_GUIDE.md`**: API 사용법
- **`docs/DEVELOPMENT_GUIDE.md`**: 개발 가이드
- **`docs/E2E_TESTING_GUIDE.md`**: E2E 테스트 가이드
- **`docs/JIRA_INTEGRATION.md`**: JIRA 통합 가이드

### 15.2 운영 문서

- **`docker-compose-*/README.md`**: Docker 배포 가이드
- **`scripts/`**: 배포 및 관리 스크립트
- **`docs/manual/`**: 사용자 매뉴얼

---

## 🎯 결론

TestCaseCraft는 현대적인 웹 기술을 사용하여 구축된 **포괄적인 테스트 관리 시스템**입니다.

**핵심 특징**:

- ✅ **모던 기술 스택**: React 18 + Spring Boot 3 + Java 21
- ✅ **통합 빌드**: Frontend와 Backend 단일 JAR 패키징
- ✅ **확장 가능한 아키텍처**: 모듈형 설계 및 API 우선
- ✅ **포괄적 테스팅**: Unit + Integration + E2E 테스트
- ✅ **외부 시스템 연동**: JIRA, Google Sheets 등
- ✅ **운영 준비**: Docker, 모니터링, 보안 기능

이 매뉴얼을 통해 개발자들이 프로젝트 구조를 빠르게 이해하고 효율적으로 개발할 수 있을 것입니다.
