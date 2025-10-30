# 테스트 케이스 관리자 - QWEN.md

## 프로젝트 개요 (Project Overview)

테스트 케이스 관리자는 테스트 케이스를 관리하기 위한 풀스택 웹 애플리케이션입니다. 프론트엔드는 React로, 백엔드는 Spring Boot로 구축되었습니다. 이 프로젝트는 프로젝트 관리, 테스트 케이스 생성, 실행 추적을 위한 기능을 갖춘 포괄적인 테스트 케이스 관리 시스템을 제공합니다.

### 주요 기술 (Key Technologies)
- **프론트엔드**: React 18, Material-UI, React Router, Context API
- **백엔드**: Spring Boot 3.2.4 (Java 21), JWT 인증, PostgreSQL
- **인증**: JWT 기반 인증 (액세스/리프레시 토큰 시스템)
- **빌드 도구**: Gradle (백엔드) + npm (프론트엔드) 통합 빌드
- **데이터베이스**: PostgreSQL (운영), H2 (개발) 
- **API 문서화**: Swagger/OpenAPI
- **테스트**: TestNG (단위 테스트), Playwright (E2E 테스트), Allure 리포트
- **배포**: Docker Compose (Nginx 리버스 프록시 포함)
- **RAG 시스템**: FastAPI 기반의 RAG (Retrieval-Augmented Generation) 시스템
- **다국어 지원**: 완전한 i18n 시스템 (한글/영어 지원)

### 프로젝트 구조 (Project Structure)
```
.
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
├── src
│   ├── main
│   │   ├── frontend
│   │   │   ├── public
│   │   │   │   └── index.html
│   │   │   ├── src
│   │   │   │   ├── components
│   │   │   │   ├── context
│   │   │   │   ├── models
│   │   │   │   └── utils
│   │   │   ├── package.json
│   │   │   └── ...
│   │   ├── java
│   │   │   └── com/testcase/testcasemanagement
│   │   │       ├── controller
│   │   │       ├── model
│   │   │       ├── repository
│   │   │       ├── service
│   │   │       ├── config
│   │   │       │   └── i18n
│   │   │       │       ├── keys
│   │   │       │       └── translations
│   │   │       └── ...
│   │   └── resources
│   │       ├── application.yml
│   │       └── static
│   └── test
│       ├── java
│       └── resources
├── e2e-tests/
├── d_mcpsvr_jira/
├── dev-docker/ (RAG 서비스 포함)
├── docker-compose-dev/
└── ...
```

## 아키텍처 (Architecture)

### 프론트엔드 구조
- **React SPA**: `src/main/frontend/`에 위치, URL 기반 라우팅
- **Context 기반 상태 관리**: AppContext.jsx에서 전역 상태 및 API 통합 제공
- **JWT 인증**: 자동 토큰 갱신 및 세션 관리
- **컴포넌트 계층**: App → ProjectManager → TestCaseTree/Forms → 개별 컴포넌트
- **Material-UI 컴포넌트**: 일관된 스타일 및 레이아웃
- **URL 기반 네비게이션**: `/projects/:projectId/testcases/:testCaseId` 패턴

### 백엔드 구조
- **Spring Boot REST API**: 표준 계층 아키텍처
  - **Controllers**: HTTP 요청 및 응답 처리
  - **Services**: 비즈니스 로직 구현
  - **Repositories**: Spring Data JPA를 사용한 데이터 접근 계층
  - **DTOs**: API 통신을 위한 데이터 전송 객체
  - **Models**: JPA 엔티티 (데이터베이스 테이블 표현)

### RAG (Retrieval-Augmented Generation) 시스템 아키텍처
**Three-Tier 서비스 통합**: React 프론트엔드 → Spring Boot 백엔드 → FastAPI RAG 서비스

**아키텍처 흐름**:
```
프론트엔드 (React)
    ↓ HTTP/REST
Spring Boot 백엔드 (포트 8080)
    ↓ WebClient
FastAPI RAG 서비스 (포트 8001)
    ↓
PostgreSQL (pgvector) + MinIO (S3)
```

**주요 구성 요소**:
- **프론트엔드 계층** (`src/main/frontend/src/components/RAG/`)
  - `RAGDocumentManager.jsx` - 주요 RAG UI 컨테이너
  - `DocumentUpload.jsx` - 파일 업로드 (드래그 앤 드롭)
  - `DocumentList.jsx` - 업로드된 문서 테이블
  - `SimilarTestCases.jsx` - 벡터 유사도 검색 UI
  - `RAGContext.jsx` - RAG 상태 관리를 위한 React Context

- **Spring Boot 계층** (`src/main/java/com/testcase/testcasemanagement/`)
  - `controller/RagController.java` - REST 엔드포인트 (`/api/rag/...`)
  - `service/RagService.java` & `RagServiceImpl.java` - 비즈니스 로직
  - `dto/rag/` - snake_case/camelCase 매핑을 위한 Jackson 어노테이션 DTO
  - `config/RagClientConfig.java` - WebClient 구성

- **FastAPI RAG 서비스** (`dev-docker/rag-service/`)
  - **위치**: `dev-docker/` 디렉토리 (Docker Compose 스택)
  - **엔드포인트**: `/api/v1/documents/`, `/api/v1/embeddings/`, `/api/v1/search/`
  - **문서 파서**:
    - `pypdf2` - 기본 로컬 파서 (기본값, 안정적)
    - `pymupdf` - 빠른 로컬 파서
    - `pymupdf4llm` - LLM 최적화 마크다운 추출
    - `upstage` - 고급 레이아웃 분석이 있는 클라우드 API (API 키 필요)
  - **서비스**:
    - `document_service.py` - 문서 CRUD 작업
    - `upstage_service.py` - 문서 파싱 및 청킹
    - `embedding_service.py` - OpenAI를 사용한 벡터 임베딩
    - `minio_service.py` - MinIO 파일 저장소 작업
  - **데이터베이스**: pgvector 확장 기능이 있는 PostgreSQL (벡터 유사도 검색)
  - **저장소**: MinIO 오브젝트 스토리지 (문서 파일)

**도커 서비스** (`dev-docker/docker-compose.yml`):
- `postgres-rag` - pgvector가 있는 PostgreSQL (포트 5433)
- `minio` - S3 호환 오브젝트 저장소 (포트 9000/9001)
- `rag-service` - FastAPI 애플리케이션 (포트 8001)

**RAG 워크플로우**:
1. **업로드**: React → Spring Boot → FastAPI → MinIO + PostgreSQL
2. **분석**: FastAPI가 MinIO에서 검색 → 파서가 텍스트 추출 → DB에 청크 저장
3. **임베딩**: FastAPI가 청크에 대한 벡터 생성 → pgvector에 저장
4. **검색**: 쿼리 → 벡터 유사도 검색 → 관련 청크 반환

**API 필드 네이밍**:
- **프론트엔드/Spring Boot**: camelCase (`projectId`, `uploadedBy`, `fileName`)
- **FastAPI**: snake_case (`project_id`, `uploaded_by`, `file_name`)
- **매핑**: DTO의 Jackson `@JsonProperty` 및 `@JsonAlias` 어노테이션

**구성**:
- **Spring Boot**: `application.yml` - `rag.api.url=http://localhost:8001`
- **도커**: `dev-docker/docker-compose.yml` - 환경 변수
- **FastAPI**: `dev-docker/rag-service/app/main.py` - CORS, 데이터베이스, MinIO 설정

**RAG 서비스 시작**:
```bash
# 도커 서비스 시작 (PostgreSQL + MinIO + FastAPI)
cd dev-docker
docker-compose up -d

# Spring Boot 시작 (프론트엔드 빌드 포함)
./gradlew bootRun

# 액세스
# - 애플리케이션: http://localhost:8080
# - FastAPI 문서: http://localhost:8001/docs
# - MinIO 콘솔: http://localhost:9001
```

## 다국어 (i18n) 시스템

**⚠️ 주의**: 새로운 번역을 추가할 때는 **반드시 3개 파일을 모두 수정**해야 합니다.

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

## 빌드 및 실행 (Building and Running)

### 사전 요구 사항 (Prerequisites)
- Java 21 이상 설치 및 구성
- Node.js 20.11.1 이상
- PostgreSQL
- Docker 및 Docker Compose (도커 배포용)

### 개발 설정 (Development Setup)

#### 방법 1: H2 개발 환경 (기본값)
```bash
# H2 인메모리 데이터베이스로 시작
./start-dev.sh start

# http://localhost:8080에서 애플리케이션 액세스
# 로그인: admin / admin
# H2 콘솔: http://localhost:8080/h2-console
```

#### 방법 2: PostgreSQL 개발 환경
```bash
# 도커 기반 PostgreSQL로 시작
./start-dev-postgresql.sh start

# http://localhost:8080에서 애플리케이션 액세스
# 로그인: admin / admin
# PostgreSQL: localhost:5433
```

#### 방법 3: 직접 명령줄 (Gradle 사용 - 권장)
```bash
# 백엔드 빌드 및 실행 (프론트엔드도 자동 빌드)
./gradlew bootRun

# 프론트엔드 별도로 빌드 (별도 개발이 필요한 경우)
cd src/main/frontend
npm install
npm start
```

### 도커 기반 개발 환경
```bash
# docker-compose-dev 디렉토리로 이동
cd docker-compose-dev

# 전체 환경 시작 (PostgreSQL + Spring Boot + Nginx)
./manage.sh start

# 또는 docker-compose 직접 사용
docker-compose up -d
```

### 운영 배포
```bash
# HTTP 배포
./deploy-http.sh

# HTTPS 배포 (SSL 인증서 포함)
./deploy-https.sh
```

## 주요 기능 (Key Features)

### 프론트엔드 (React)
- **프레임워크**: 상태 관리를 위한 Context API를 사용한 React
- **UI 라이브러리**: Material-UI 컴포넌트
- **데이터 저장**: 로컬 저장소를 위한 localStorage (프로젝트 이름: "only front local storage"에서 확인 가능)
- **라우팅**: React Router
- **데이터 그리드**: 스프레드시트 형태의 데이터 관리를 위한 AG-Grid
- **파일 처리**: Excel (xlsx), PDF 내보내기 기능
- **국제화**: 다국어 지원

### 백엔드 (Spring Boot)
- **프레임워크**: Spring Boot 3.2.4
- **데이터베이스**: JPA/Hibernate를 사용한 PostgreSQL
- **인증**: JWT 기반 인증
- **API**: 포괄적인 보안 기능이 있는 RESTful 엔드포인트
- **문서화**: Swagger/OpenAPI 통합
- **모니터링**: Prometheus 메트릭을 사용한 Actuator 엔드포인트
- **이메일**: 알림용 SMTP 지원
- **파일 업로드**: JUnit XML을 포함한 다양한 파일 형식 지원
- **Google 통합**: Google Sheets API 지원

### 데이터베이스 지원
- **개발**: H2 인메모리 또는 파일 기반 데이터베이스
- **개발**: 도커 기반 PostgreSQL
- **운영**: 적절한 연결 풀링을 사용한 PostgreSQL

### 테스트 및 품질 보증
- **E2E 테스트**: `e2e-tests/` 디렉토리의 Playwright 기반 테스트
- **단위 테스트**: TestNG 기반 테스트
- **성능 테스트**: 부하 및 성능 테스트 기능
- **Allure 보고서**: 테스트 보고서 및 시각화

## 환경 구성 (Environment Configuration)

### 개발 환경 변수 (.env.dev)
- JWT_SECRET: JWT 토큰 생성용 (512비트 이상 권장)
- JIRA_ENCRYPTION_KEY: JIRA 통합 암호화용 (Base64 인코딩 필요)
- 데이터베이스 연결 매개변수
- 프론트엔드 API 기본 URL 구성

### 환경별 설정 관리

#### 공통 설정: `application.yml` - 모든 환경에서 공유하는 기본 설정
#### 개발 환경: `application-dev.yml` - 개발 전용 설정 (디버그 로깅)
#### 운영 환경: `application-prod.yml` - 운영 전용 설정 (PostgreSQL)

#### 개발 환경 특징
- **포트**: 8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **로깅**: DEBUG 레벨, SQL 로깅 활성화
- **JIRA 보안**: HTTPS 강제 비활성화, SSL 검증 스킵

#### 환경별 접속 정보

**개발 환경**
- **애플리케이션**: http://localhost:8080
- **H2 콘솔**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **액추에이터**: http://localhost:8080/actuator
- **기본 로그인**: admin/admin

### 데이터베이스 설정 및 데이터 유지

#### 환경별 DDL 설정

| 환경 | Profile | DDL 설정 | 데이터 유지 | 설정 파일 |
|------|---------|----------|-------------|-----------|
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

### 기본 로그인 자격 증명
- 사용자 이름: `admin`
- 비밀번호: `admin`

## 개발 규칙 (Development Conventions)

### 코드 구조
- **프론트엔드**: `src/main/frontend/src/components`에서 구성 기반 아키텍처
- **백엔드**: 컨트롤러, 서비스, 리포지토리 및 모델을 사용한 MVC 패턴
- **구성**: Spring 프로파일을 사용한 프로파일 기반 구성

### API 엔드포인트
- **기본 URL**: `/api/`
- **인증**: `/api/auth/` (로그인, 등록, 토큰 갱신)
- **프로젝트**: `/api/projects/`
- **테스트 케이스**: `/api/testcases/`
- **사용자**: `/api/users/`
- **조직**: `/api/organizations/`
- **문서화**: `/swagger-ui.html` 및 `/api-docs`

### 보안
- 리프레시 토큰을 사용한 JWT 기반 인증
- 역할 기반 액세스 제어
- 비밀번호 해싱
- 입력 유효성 검사 및 정화
- 보안 파일 업로드 처리

### 데이터베이스 마이그레이션
- JPA/Hibernate는 스키마 생성 및 업데이트를 처리함
- 서로 다른 환경을 위한 프로파일별 구성

## 테스트 (Testing)

### 테스트 실행
```bash
# 모든 백엔드 테스트 실행
./gradlew test

# 특정 테스트 프로파일 실행
./gradlew performanceTest  # 성능 테스트
./gradlew loadTest        # 부하 테스트

# 프론트엔드 테스트 실행
cd src/main/frontend
npm test

# E2E 테스트 실행
npm run test:ict-138  # 특정 E2E 테스트
```

### 테스트 범주
- 단위 테스트 (TestNG - **JUnit이 아님**)
- 통합 테스트
- E2E 테스트 (Playwright)
- 성능 테스트
- 부하 테스트
- API 유효성 검사 테스트
- JSON 스키마 검증

### E2E 테스트 요구 사항
#### 🚨 중요: 이슈 완료 전 E2E 테스트 통과 필수
**모든 버그 수정 및 기능 구현 작업은 반드시 E2E 테스트 통과를 확인한 후 완료 처리해야 함**

#### E2E 테스트 실행 조건
1. **애플리케이션 정상 실행**: 백엔드 서버 (8080 포트) 정상 동작 확인
2. **로컬 환경 필수**: 모든 E2E 테스트는 반드시 `http://localhost:8080`으로 접근해야 함
3. **원격 서버 접속 금지**: 외부 서버 (qaspecialist.shop 등)로의 접속 시도는 테스트 실패 원인
4. **Playwright 테스트 성공**: 해당 기능의 E2E 테스트가 실제로 통과해야 함
5. **API 호출 검증**: 브라우저에서 실제 API 호출이 성공적으로 이루어져야 함
6. **UI 동작 확인**: 사용자 관점에서 기능이 정상 동작해야 함

## 배포 (Deployment)

### Docker Compose 옵션
1. **개발**: H2 데이터베이스와 전체 개발 도구
2. **PostgreSQL 개발**: Spring Boot와 도커 기반 PostgreSQL
3. **운영**: Nginx 리버스 프록시, SSL 지원이 있는 전체 스택
4. **HTTP/HTTPS**: 적절한 보안이 있는 다른 배포 프로파일

### 운영환경 배포 주의사항

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

**배포 후 금지사항**:
- ❌ `ddl-auto: create-drop` 또는 `create`로 변경 금지
- ❌ 프로덕션 데이터베이스 수동 DROP 금지
- ❌ 환경 변수 없이 애플리케이션 재시작 금지

### 빌드 프로세스
Gradle 빌드 프로세스는 자동으로:
1. React 프론트엔드 빌드
2. 백엔드 정적 리소스에 프론트엔드 빌드 복사
3. 실행 가능한 JAR 파일 생성
4. 적절한 환경 변수 설정

### 빌드 프로세스
Gradle 빌드 프로세스는 자동으로:
1. React 프론트엔드 빌드
2. 백엔드 정적 리소스에 프론트엔드 빌드 복사
3. 실행 가능한 JAR 파일 생성
4. 적절한 환경 변수 설정

## 특별 기능

### ICT 관련 기능
- 대량 테스트 케이스 입력을 위한 스프레드시트 모드
- 성능 모니터링 및 분석
- 유효성 검사 오류 처리
- 저장 및 롤백 메커니즘

### JIRA 통합
**⚠️ 중요**: JIRA 통합 관련 상세 가이드는 **[docs/JIRA_INTEGRATION.md](docs/JIRA_INTEGRATION.md)**를 반드시 참조하세요.

- `d_mcpsvr_jira/` - JIRA 연동 모듈 디렉토리
- `d_mcpsvr_jira/.env` - JIRA 인증 정보
- 암호화된 JIRA 자격 증명 저장
- JIRA 이슈에 자동 코멘트
- JIRA 업데이트의 배치 처리

#### ⚠️ JIRA 완료 처리 권한 규칙
**🚨 중요: JIRA 이슈 완료 처리는 반드시 사용자가 직접 수행해야 합니다.**

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

### 파일 처리
- Excel 가져오기/내보내기 (XLSX 형식)
- PDF 생성
- JUnit XML 업로드 및 파싱
- 이미지 첨부 및 스크린샷

### 모니터링 및 관찰성
- 애플리케이션 메트릭을 위한 Actuator 엔드포인트
- 성능 모니터링
- 상태 확인
- 포괄적인 로깅

### 파일 삭제 금지 정책
**⛔ Claude Code 파일 삭제 절대 금지**
- **절대 금지**: Claude Code는 어떤 파일도 직접 삭제하지 않음
- **사용자 통지**: 삭제가 필요한 경우 사용자에게 알려주기만 함
- **삭제 요청**: 사용자가 직접 삭제 명령을 내려야 함
- **보안 원칙**: 데이터 보호 및 의도하지 않은 손실 방지