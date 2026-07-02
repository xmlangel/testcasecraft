# TestCaseCraft 아키텍처 문서

> 작성일: 2026-04-28
> 버전: 1.0.73
> 대상 독자: 개발자, 아키텍트, 운영자

---

## 1. 개요

TestCaseCraft는 테스트케이스 관리, 테스트 실행, 탐색적 테스트, RAG 기반 문서 분석을 통합 제공하는 풀스택 애플리케이션이다.

- **Frontend**: React 18 SPA (Material-UI, Vite)
- **Backend**: Spring Boot 3.4.12 (Java 21)
- **RAG Service**: FastAPI (Python) + pgvector
- **Database**: PostgreSQL (메인 + RAG 전용 인스턴스)
- **Object Storage**: MinIO (S3 호환)
- **Auth**: JWT (Access + Refresh Token)
- **Build**: Gradle + Node.js 통합 빌드

## 2. 시스템 아키텍처 (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (SPA)                          │
│   React 18 + MUI + React Router + Axios + Recharts              │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Spring Boot 3.4.12 (Java 21) - Port 8080           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Filter: JWT / API Key  →  Security Context              │   │
│  │  Controller (50+) → Service (68+) → Repository (49+)     │   │
│  │  AOP / Audit / Scheduler / WebClient / Actuator          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────┬───────────────────────┘
             │ JDBC                       │ WebClient (Reactor Netty)
             ▼                            ▼
   ┌──────────────────────┐    ┌──────────────────────────┐
   │  PostgreSQL+pgvector │    │   FastAPI RAG Service     │
   │  (port 5434, 단일)    │    │   Port 8001               │
   │  testcase_management │    │   문서 파싱 / 임베딩 / 검색  │
   │  (앱 DB)              │    └──────────┬────────────────┘
   └──────────▲───────────┘               │
              │ rag_db (동일 인스턴스)      │
              └──────────────┐┌───────────┴────────────────┐
                             ││                            ▼
                             ▼▼                  ┌────────────────────┐
                    ┌──────────────────┐         │  MinIO (S3)        │
                    │ PostgreSQL+pgvec │         │  ports 9000/9001   │
                    │ (port 5434, rag_db)│       │  문서/첨부파일       │
                    │ 벡터 DB (통합)     │        └────────────────────┘
                    └──────────────────┘
```

> v1.0.93부터 앱 DB(`testcase_management`)와 RAG 벡터 DB(`rag_db`)는 위와 같이 **동일한 단일 PostgreSQL(pgvector) 인스턴스**(host 포트 `5434`)에 두 데이터베이스로 함께 존재합니다.

## 3. 프론트엔드 아키텍처

### 3.1. 기술 스택

| 영역 | 라이브러리 |
|------|-----------|
| 프레임워크 | React 18.3 |
| UI | Material-UI 7 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-tree-view`) |
| 라우팅 | React Router 7 |
| HTTP | Axios |
| 차트/시각화 | Recharts |
| 스프레드시트 | react-datasheet-grid, react-spreadsheet |
| 마크다운 | @uiw/react-md-editor, remark-gfm |
| PDF/Export | jspdf, html2canvas, xlsx |
| 빌드 | Vite 7 |

### 3.2. 디렉터리 구조

```
src/main/frontend/src/
├── App.jsx                # 라우팅 진입점
├── index.jsx              # ReactDOM 마운트
├── api/                   # 도메인별 API 래퍼 (guidesApi 등)
├── services/              # REST 호출 서비스 (24개)
│   ├── apiService.js          # Axios 인스턴스 + 인터셉터
│   ├── authService.js         # 로그인/토큰 갱신
│   ├── testCaseService.js
│   ├── testPlanService.js
│   ├── testExecutionService.js
│   ├── testResultService.js
│   ├── projectService.js
│   ├── organizationService.js
│   ├── jiraService.js
│   ├── junitResultService.js
│   ├── dashboardService.js
│   └── ...
├── context/               # 전역 상태 (Context API, 11개)
│   ├── AppContext.jsx         # 앱 전역 상태
│   ├── AuthContext.jsx        # 인증/사용자
│   ├── ProjectContext.jsx     # 현재 프로젝트
│   ├── I18nContext.jsx        # 다국어 (t() 훅)
│   ├── ThemeContext.jsx       # 라이트/다크
│   ├── RAGContext.jsx
│   ├── JiraContext.jsx
│   ├── LlmConfigContext.jsx
│   ├── SchedulerContext.jsx
│   └── ...
├── components/            # 화면 단위 컴포넌트 (59개)
│   ├── TestCase/              # 테스트케이스 트리/폼
│   ├── TestPlan*              # 테스트플랜
│   ├── TestExecution/         # 실행
│   ├── TestResult/            # 결과/통계
│   ├── Dashboard.jsx          # 프로젝트 대시보드
│   ├── SystemDashboard.jsx
│   ├── ProjectManager.jsx     # 프로젝트 허브
│   ├── RAG/                   # RAG 문서 관리
│   ├── JiraIntegration/, JiraSettings/, JiraStatus/
│   ├── JUnit/, JunitResult/
│   ├── ExploratorySessionWorkspace.jsx
│   ├── MailSettings/, Settings/
│   └── Login.jsx, ProtectedRoute.jsx
├── hooks/                 # 커스텀 훅
├── providers/             # Context Provider 조합
├── models/                # 데이터 모델 / 데모 데이터
├── utils/                 # 트리 연산, 진척도 계산
├── constants/, types/, theme.js
└── styles/, App.css, index.css
```

### 3.3. 라우팅 패턴

- 인증: `/` (로그인) → `/projects` → `/projects/:projectId` → 탭 전환
- 테스트케이스: `/projects/:projectId/testcases/:testCaseId`
- `ProtectedRoute.jsx`로 비인증 접근 차단

### 3.4. 상태 관리

- 전역: Context API (`AppContext`, `AuthContext`, `ProjectContext` 등)
- 서버 상태: 각 service 모듈의 axios 호출 + 컴포넌트 로컬 state
- 다국어: `I18nContext`의 `t(key, fallback, params)` 훅

### 3.5. 빌드/배포 통합

- Gradle `appNpmBuild` 태스크가 `vite build` 실행 → `src/main/frontend/build`
- `processResources`가 결과물을 `src/main/resources/static/`으로 복사
- Spring Boot가 동일 8080 포트에서 SPA 서빙

## 4. 백엔드 아키텍처

### 4.1. 패키지 구조

```
com.testcase.testcasemanagement/
├── TestcasemanagementApplication.java  # @SpringBootApplication
├── controller/   (50개)   REST 엔드포인트
├── service/      (68개)   비즈니스 로직
├── repository/   (49개)   Spring Data JPA
├── model/        (49개)   JPA 엔티티
├── dto/                   요청/응답 DTO
├── mapper/                Entity ↔ DTO 변환
├── config/                Spring 설정 / 초기화
│   ├── SecurityConfig         # Spring Security 6
│   ├── JwtAuthenticationFilter
│   ├── ApiKeyAuthenticationFilter
│   ├── RagClientConfig        # WebClient (RAG)
│   ├── MinIOClientConfig      # MinIO SDK
│   ├── AsyncConfig            # 비동기 처리
│   ├── SchedulingConfig
│   ├── DataInitializer        # 기본 데이터 시드
│   ├── I18nDataInitializer    # 번역 키/번역 시드
│   ├── OpenApiConfig          # Swagger
│   └── i18n/                  # 번역 키/번역 초기화 모듈
├── security/              도메인 보안 검증 서비스
├── filter/                Servlet Filter
├── exception/             전역 예외 핸들러
├── audit/                 감사 로그 (AOP)
├── event/                 도메인 이벤트
├── scheduler/             Cron / Async 작업
├── health/, actuator/     헬스/모니터링
└── api/, util/
```

### 4.2. 레이어 책임

| 레이어 | 책임 |
|-------|------|
| Controller | HTTP 요청 검증, DTO 매핑, 응답 포맷팅 |
| Service | 트랜잭션 경계, 비즈니스 규칙, 외부 시스템 호출(WebClient, MinIO) |
| Repository | JPA 쿼리, Native Query |
| Model | JPA 엔티티 (`@Entity`, 감사 필드) |
| Mapper | 엔티티 ↔ DTO 변환 |
| Config | Bean 정의, 보안, 비동기, 스케줄러, 초기화 |

### 4.3. 핵심 도메인 모델

```
Organization 1 ─── N Project 1 ─── N TestCase
                       │              │
                       │              ├── N TestStep
                       │              ├── N TestCaseAttachment
                       │              └── N TestCaseVersion
                       │
                       ├── N TestPlan ─── N TestExecution ─── N TestResult
                       │                                          └── N TestResultAttachment
                       │
                       ├── N TestSession (탐색적 테스트)
                       │       ├── N TestSessionTest
                       │       ├── N TestSessionBug
                       │       ├── N TestSessionNote
                       │       ├── N TestSessionAttachment
                       │       ├── N TestSessionInterruption
                       │       └── N TestSessionApproval
                       │
                       ├── N TestCharter
                       └── N JunitTestSuite ─── N JunitTestCase ─── N JunitTestResult

User ─── N OrganizationUser / ProjectUser   (다대다 멤버십 + 권한)
Group ─── N GroupMember

JiraConfig, LlmConfig, LlmTemplate, GoogleConfig, MailSettings, SchedulerConfig
TranslationKey ─── N Translation (Language)
AuditLog, RefreshToken, SystemSetting, EmailVerificationToken
PageVisitMetric, DailyVisitSummary, UserActivity (분석/감사)
```

### 4.4. 주요 도메인 모듈

- **인증/인가**: `AuthController`, `JwtAuthenticationFilter`, `RefreshToken`, `ApiKeyAuthenticationFilter`
- **테스트케이스**: 트리 구조(부모-자식, `parentId`+`displayOrder`), 버전 관리, 첨부, 스프레드시트 모드, **드래그앤드롭 재구성** (`POST /api/testcases/{id}/move`, `POST /api/testcases/move-batch` — 이동 시 `tc_move_audit_log` 동기 기록. 상세 설계: `docs/plan/TREE_DND_REORGANIZE_PLAN.md`. 기존 우클릭 메뉴/순서 편집 모드와 공존)
- **테스트플랜/실행/결과**: 실행 계획 → 실행 → 결과 기록 + 통계
- **탐색적 테스트(SBTM)**: `TestSession`, `TestCharter` 기반 세션 추적
- **JUnit 결과**: XML 파싱, 비동기 처리, 버전 관리
- **JIRA 연동**: 설정/배치/모니터링/상태 집계 + 스케줄러
- **RAG**: `RagController`, `RagChatController`, `RagAdminController` → FastAPI 호출
- **LLM 설정**: 프로바이더/모델/프롬프트 템플릿 관리
- **다국어(i18n)**: 번역 키/번역 동적 로딩 + 카테고리별 Initializer
- **모니터링/감사**: `MonitoringController`, `AuditLogController`, AOP 기반 감사
- **스케줄러**: 동적 스케줄러 등록 (`DynamicSchedulerService`)
- **메일**: SMTP 발송 + 템플릿 + 이메일 검증

### 4.5. 주요 의존성

- Spring Boot Starters: web, data-jpa, security, validation, mail, webflux, actuator, aop
- 인증: jjwt 0.11.5, spring-security-oauth2-client/jose
- DB: postgresql 42.7.3, Flyway 9.22 (옵션)
- 객체 저장: minio 8.6.0
- 문서 처리: Apache POI 5.5 (Excel), iText 7.2.5 (PDF, 한글 폰트)
- CSV: opencsv 5.8, commons-csv 1.14
- 모니터링: micrometer-prometheus, spring-boot-starter-actuator
- Rate Limiting: resilience4j 2.1
- API 문서: springdoc-openapi 2.8.3
- Google: google-api-services-sheets, google-auth-library, google-oauth-client
- 스키마 검증: networknt json-schema-validator 1.0.83

## 5. RAG 서비스 아키텍처

### 5.1. 위치 및 기술

- 디렉터리: `rag-service/`
- 프레임워크: FastAPI (Python)
- 벡터 DB: PostgreSQL + pgvector 확장
- 객체 저장: MinIO (`rag-documents` 버킷)

### 5.2. 모듈 구조

```
rag-service/app/
├── main.py                # FastAPI 앱 + CORS + 라우터 등록
├── core/
│   ├── config.py              # 환경설정 (Settings)
│   └── database.py            # SQLAlchemy 엔진/세션
├── api/v1/                # REST 라우터
├── models/                # ORM 모델
│   ├── RAGDocument
│   ├── RAGEmbedding
│   ├── RAGConversationMessage
│   ├── LlmAnalysisJob
│   ├── LlmAnalysisResult
│   └── AnalysisSummary
├── schemas/               # Pydantic 스키마
└── services/
    ├── document_service.py    # 문서 CRUD
    ├── upstage_service.py     # 파싱/청킹
    ├── embedding_service.py   # OpenAI 임베딩
    └── minio_service.py       # 파일 IO
```

### 5.3. API 그룹

- `/api/v1/documents/` - 업로드/조회/삭제
- `/api/v1/embeddings/` - 청크 임베딩 생성/재처리
- `/api/v1/search/` - 벡터 유사도 검색

### 5.4. 문서 파서 옵션

| Parser | 설명 | API Key |
|--------|------|---------|
| `pypdf2` | 기본 로컬 파서 | 불필요 |
| `pymupdf` | 빠른 로컬 파서 | 불필요 |
| `pymupdf4llm` | LLM 친화적 마크다운 추출 (기본 권장) | 불필요 |
| `upstage` | 클라우드 고급 레이아웃 분석 | 필요 |

환경변수 `DOCUMENT_PARSER`로 선택.

### 5.5. 데이터 플로우

```
[Upload]
React → Spring Boot → FastAPI(/documents) → MinIO + RAGDocument

[Analyze]
FastAPI ─ get from MinIO ─→ Parser ─→ chunks ─→ DB

[Embed]
FastAPI ─ chunks ─→ OpenAI Embedding ─→ pgvector

[Search]
Query → 임베딩 → pgvector cosine 유사도 → 상위 N개 chunk 반환
```

### 5.6. 필드 네이밍 컨벤션

- Spring Boot / Frontend: `camelCase`
- FastAPI: `snake_case`
- 매핑: Spring DTO에서 Jackson `@JsonProperty` / `@JsonAlias` 사용

## 6. 보안 아키텍처

### 6.1. 인증 흐름

```
[Login]
POST /api/auth/login
  → AuthController → AuthService
  → 비밀번호 검증 → JWT Access Token + Refresh Token 발급
  → RefreshToken 엔티티 저장

[Authenticated Request]
Authorization: Bearer <access>
  → JwtAuthenticationFilter
  → 토큰 검증 → SecurityContext 주입

[Refresh]
POST /api/auth/refresh
  → 만료된 access + 유효한 refresh
  → 새 access 발급
```

### 6.2. 인증 방식

- 사용자: JWT Bearer Token (`JwtAuthenticationFilter`)
- 외부 시스템: API Key (`ApiKeyAuthenticationFilter` + `ServiceApiKey` 엔티티)
- OAuth2 Client: Google 연동용

### 6.3. 인가

- Spring Security `SecurityConfig` 기반 URL 권한
- 도메인 인가: `ProjectSecurityService`, `OrganizationSecurityService`, `GroupSecurityService`
- `@PreAuthorize` + 커스텀 SpEL로 리소스 소유권 검증

### 6.4. 보안 강화

- BouncyCastle `jdk18on` 1.79 강제 사용 (jdk15on 취약점 차단)
- commons-lang3 3.18.0 (CVE 패치)
- Tomcat embed 10.1.54
- Resilience4j Rate Limiting
- 비밀번호: 단방향 해시
- 민감 정보: `EncryptionService` / `EncryptionUtil` (대칭 암호화)
- 감사 로그: `AuditLog` + AOP

### 6.5. 입력 검증

- `spring-boot-starter-validation` (Bean Validation)
- DTO 단위 `@NotNull`, `@Size`, `@Pattern`
- JSON 스키마 검증: `networknt json-schema-validator`

## 7. 다국어(i18n) 아키텍처

### 7.1. 구성 요소

- `TranslationKey` (키, 카테고리, 설명, 기본값)
- `Translation` (키 + 언어코드 → 번역 텍스트)
- `Language` (지원 언어 마스터)
- `I18nService`, `I18nController` (런타임 조회/캐시)

### 7.2. 초기화 흐름

```
TranslationKeyDataInitializer (CommandLineRunner)
  ├─ TestCaseKeysInitializer
  ├─ DashboardKeysInitializer
  ├─ ProjectKeysInitializer
  ├─ UserManagementKeysInitializer
  ├─ AuthKeysInitializer
  ├─ CommonKeysInitializer
  ├─ OrganizationKeysInitializer
  ├─ TestPlanKeysInitializer
  ├─ TestExecutionKeysInitializer
  ├─ TestResultKeysInitializer
  ├─ MailKeysInitializer
  ├─ RAGKeysInitializer
  ├─ AttachmentKeysInitializer
  ├─ SchedulerKeysInitializer
  ├─ ExploratorySessionKeysInitializer
  ├─ JiraIntegrationKeysInitializer
  ├─ ExtendedUIKeysInitializer
  └─ TranslationManagementKeysInitializer

I18nDataInitializer
  ├─ Korean*Translations
  └─ English*Translations
```

### 7.3. 번역 추가 4단계

1. Keys Initializer에 `createTranslationKeyIfNotExists`
2. Korean Translations에 `createTranslationIfNotExists("ko", ...)`
3. English Translations에 `createTranslationIfNotExists("en", ...)`
4. **`TranslationKeyDataInitializer`에 등록** (필드 + `initialize()` 호출)

> 4단계 누락 시 키가 DB에 저장되지 않아 한국어로만 표시됨.

### 7.4. 프론트엔드 사용

```jsx
const { t } = useI18n();
t("testcase.spreadsheet.fallback.title", "향상된 스프레드시트 모드");
```

## 8. 통합/외부 시스템

### 8.1. JIRA 연동

- `JiraConfig`로 사이트별 설정
- `JiraApiService` REST 호출
- `JiraSyncSchedulerService` 주기적 동기화
- `JiraBatchProcessingService` 대량 처리
- `JiraStatusAggregationService` 상태 집계
- `JiraAuditLogService` 감사 추적

### 8.2. LLM 연동

- `LlmConfig` (프로바이더/모델/API 키 - 암호화)
- `LlmTemplate` (프롬프트 템플릿)
- RAG Service와 협업하여 청크 기반 LLM 분석

### 8.3. 메일

- `MailSettings`로 SMTP 설정 동적 관리
- `MailService` + `EmailVerificationService` (이메일 검증 토큰)

### 8.4. Google Sheets

- google-api-services-sheets / google-auth-library
- `GoogleConfig` 엔티티로 OAuth2 인증 정보 관리
- 테스트케이스 → Google Sheets 내보내기

### 8.5. JUnit XML

- `JunitXmlParserService` 파싱
- `JunitAsyncProcessingService` 비동기 처리
- `JunitVersionControlService` 버전 관리

## 9. 인프라 아키텍처

### 9.1. Docker Compose 서비스 (`docker-compose-build/docker-compose.yml`)

| 서비스 | 이미지 | 포트 | 역할 |
|--------|-------|------|------|
| `app` | `xmlangel/testcasecraft:1.0.73` | 8080 | Spring Boot + 프론트엔드 |
| `rag-service` | `xmlangel/testcasecraft-rag-service:1.0.11` | 8001 | FastAPI |
| `postgres` | pgvector/pgvector:pg18 | 5434 | 통합 단일 인스턴스 — 앱 DB(`testcase_management`) + RAG 벡터 DB(`rag_db`) |
| `minio` | minio | 9000/9001 | 객체 저장 |

### 9.2. 환경 프로파일

| 프로파일 | 설정 파일 | 용도 |
|---------|----------|------|
| `dev` | `application-dev.yml` | 로컬 Docker 인프라 |
| `local` | `application-local.yml` | 로컬 DB 직접 사용 |
| `remote` | `application-remote.yml` | 원격 DB 연동 |
| `prod` | `application-prod.yml` | 운영 |
| `translation` | `application-translation.yml` | 번역 데이터 초기화 전용 |

### 9.3. 빌드/배포 파이프라인

```
incrementVersion ─→ build.gradle / package.json / docker-compose.yml / RAG config 동기화
       │
       ▼
appNpmInstall ─→ appNpmBuild (vite) ─→ build/
       │
       ▼
processResources (build/ → src/main/resources/static/)
       │
       ▼
bootJar / Docker build ─→ xmlangel/testcasecraft:<ver>
       │
       ▼
docker-compose up
```

### 9.4. 모니터링/관측

- Spring Boot Actuator (`/actuator/health`, `/actuator/prometheus`)
- Micrometer Prometheus Registry
- `MonitoringController`, `MonitoringConfig`, `MetricsConfig`
- 헬스체크: Docker Compose `healthcheck`로 컨테이너 상태 추적
- 사용 메트릭: `PageVisitMetric`, `DailyVisitSummary`, `UserActivity`

## 10. 비기능 요구사항(NFR)

| 항목 | 정책 |
|------|------|
| 인증 | JWT Access(짧음) + Refresh(김) 2단 토큰 |
| 가용성 | Docker `restart: always`, healthcheck 기반 자동 복구 |
| 보안 | OWASP Top 10 대응, BouncyCastle/Tomcat 취약점 패치 강제 |
| 확장성 | 도메인별 Service 분리, 비동기(`AsyncConfig`), 스케줄러 분리 |
| 파일 크기 | 업로드 기본 100MB (`MAX_FILE_SIZE` env로 조정) |
| 테스트 | TestNG + Allure, 단위/통합/성능/부하/API 종합 테스트 분리 |
| E2E | Playwright MCP, `localhost:8080` 기준 |
| 다국어 | 한국어/영어 기본, DB 기반 동적 추가 가능 |
| 시간대 | `Asia/Seoul` (Jackson) |

## 11. 개발/운영 시 주의사항

1. **`./gradlew bootRun`이 프론트엔드까지 빌드** - 별도 Vite dev server 불필요
2. **개발 전제조건**: Docker Compose로 PostgreSQL/MinIO/RAG 실행 필수
3. **Unit Test = TestNG** (JUnit 아님)
4. **번역 추가 시 4단계 모두 수행** - 특히 `TranslationKeyDataInitializer` 등록
5. **E2E 테스트는 `localhost:8080` 사용** - 원격 서버(qaspecialist.shop 등) 금지
6. **API 필드 네이밍 매핑 주의** - Spring(camelCase) ↔ FastAPI(snake_case)
7. **버전 증가는 `incrementVersion` Gradle 태스크** 사용 - 다중 파일 동기화

## 12. 디렉터리 빠른 참조

| 경로 | 내용 |
|------|------|
| `src/main/java/.../controller/` | REST 엔드포인트 50개 |
| `src/main/java/.../service/` | 비즈니스 로직 68개 |
| `src/main/java/.../model/` | JPA 엔티티 49개 |
| `src/main/java/.../config/i18n/` | 다국어 초기화 모듈 |
| `src/main/frontend/src/components/` | React 컴포넌트 59개 |
| `src/main/frontend/src/services/` | API 클라이언트 24개 |
| `src/main/frontend/src/context/` | 전역 상태 11개 |
| `rag-service/app/` | FastAPI RAG 서비스 |
| `docker-compose-build/` | 운영 Docker Compose |
| `docs/` | 가이드/매뉴얼/릴리즈 노트 |
| `src/test/e2e/` | Playwright E2E 시나리오 |

---

> 본 문서는 코드베이스 스냅샷 기반이며, 구조 변경 시 함께 갱신해야 한다.
> 관련 문서: `docs/PROJECT_OVERVIEW.md`, `docs/RAG_SERVICE_STRUCTURE.md`, `docs/SECURITY_GUIDE.md`, `docs/E2E_TESTING_GUIDE.md`, `docs/code-guide-line/DEVELOPMENT_GUIDE.md`
