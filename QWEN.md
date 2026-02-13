# 테스트 케이스 관리자 - QWEN.md

이 파일은 Qwen이 이 저장소의 코드로 작업할 때 지침을 제공합니다.

---

## 1. 🚀 프로젝트 개요 (Project Overview)

### 1.1. 일반 사항 (General)
이 프로젝트는 다음과 같이 구성된 풀스택 테스트 케이스 관리 애플리케이션입니다:
- **프론트엔드**: React 18, Material-UI, React Router (SPA 내부 탐색용)
- **백엔드**: Spring Boot 3.4.12 (Java 21), PostgreSQL 데이터베이스
- **인증**: JWT 기반 인증 (액세스/리프레시 토큰 시스템)
- **빌드 시스템**: Gradle (Node.js 프론트엔드 빌드 통합)
  - **⚠️ 중요**: `./gradlew bootRun`은 **프론트엔드와 백엔드를 모두** 빌드하고 (Vite 빌드: `src/main/frontend/build`) 함께 실행합니다.
  - 프론트엔드는 자동으로 빌드되어 `src/main/resources/static/`에서 서비스됩니다.
  - 핫 리로드 개발을 위해 특별히 필요한 경우가 아니면 프론트엔드 개발 서버를 별도로 실행하지 마세요.
  - 애플리케이션은 **8080 포트**에서 실행됩니다 (백엔드가 프론트엔드 정적 파일을 서비스함).
  - **개발 환경 전제조건**: Docker Compose로 PostgreSQL, MinIO, RAG 서비스 실행 필요
- **테스트**: TestNG (Allure 리포팅 포함), 자동화된 브라우저 테스트 및 UI 검증을 위한 Playwright MCP
- **단위 테스트 프레임워크**: TestNG (JUnit 아님) - 모든 단위 테스트는 TestNG로 작성

### 1.2. 아키텍처 (Architecture)

#### 프론트엔드 구조 (Frontend Structure)
- **React SPA**: `src/main/frontend/`에 위치, URL 기반 라우팅
- **Context 기반 상태 관리**: AppContext.jsx에서 전역 상태 및 API 통합 제공
- **JWT 인증**: 자동 토큰 갱신 및 세션 관리
- **컴포넌트 계층**: App → ProjectManager → TestCaseTree/Forms → 개별 컴포넌트
- **Material-UI 컴포넌트**: 일관된 스타일 및 레이아웃
- **URL 기반 탐색**: `/projects/:projectId/testcases/:testCaseId` 패턴

#### 백엔드 구조 (Backend Structure)
- **Spring Boot REST API**: 표준 계층형 아키텍처
  - Controllers: HTTP 요청 및 응답 처리
  - Services: 비즈니스 로직 구현
  - Repositories: Spring Data JPA를 사용한 데이터 액세스 계층
  - DTOs: API 통신을 위한 데이터 전송 객체
  - Models: 데이터베이스 테이블을 나타내는 JPA 엔티티

#### RAG (Retrieval-Augmented Generation) 시스템 아키텍처
**3계층 서비스 통합**: React 프론트엔드 → Spring Boot 백엔드 → FastAPI RAG 서비스

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
  - `DocumentUpload.jsx` - 드래그 앤 드롭 파일 업로드
  - `DocumentList.jsx` - 업로드된 문서 테이블
  - `SimilarTestCases.jsx` - 벡터 유사도 검색 UI
  - `RAGContext.jsx` - RAG 상태 관리를 위한 React 컨텍스트

- **Spring Boot 계층** (`src/main/java/com/testcase/testcasemanagement/`)
  - `controller/RagController.java` - REST 엔드포인트 (`/api/rag/...`)
  - `service/RagService.java` & `RagServiceImpl.java` - 비즈니스 로직
  - `dto/rag/` - snake_case/camelCase 매핑을 위한 Jackson 어노테이션이 있는 DTO
  - `config/RagClientConfig.java` - WebClient 설정

- **FastAPI RAG 서비스** (`rag-service/`)
  - **위치**: `rag-service/` 디렉토리 (Docker Compose 스택)
  - **엔드포인트**: `/api/v1/documents/`, `/api/v1/embeddings/`, `/api/v1/search/`
  - **문서 파서**: `pypdf2`, `pymupdf`, `pymupdf4llm`, `upstage`
  - **서비스**: 문서 CRUD, 파싱, 임베딩(OpenAI), MinIO 저장소 작업
  - **데이터베이스**: pgvector 확장 기능이 있는 PostgreSQL (벡터 유사도 검색)
  - **저장소**: MinIO 오브젝트 스토리지 (문서 파일)

**도커 서비스** (`docker-compose.yml`):
- `postgres` - 메인 PostgreSQL (포트 5434)
- `postgres-rag` - pgvector가 있는 PostgreSQL (포트 5433)
- `minio` - S3 호환 오브젝트 스토리지 (포트 9000/9001)
- `rag-service` - FastAPI 애플리케이션 (포트 8001)

**RAG 워크플로우**:
1. **업로드**: React → Spring Boot → FastAPI → MinIO + PostgreSQL
2. **분석**: FastAPI가 MinIO에서 데이터 검색 → 파서가 텍스트 추출 → DB에 청크 저장
3. **임베딩**: FastAPI가 청크에 대한 벡터 생성 → pgvector에 저장
4. **검색**: 쿼리 → 벡터 유사도 검색 → 관련 청크 반환

---

## 2. 💻 개발 환경 및 워크플로우 (Development Environment & Workflow)

### 2.1. 사전 요구 사항 (Prerequisites)
**⚠️ Java 버전 요구 사항**: 이 프로젝트는 **Java 21**이 필요합니다.

### 2.2. 개발 명령어 (Development Commands)

#### 프론트엔드 개발
```bash
cd src/main/frontend
npm install          # 의존성 설치
npm start           # 개발 서버 시작 (3000 포트)
```

#### 백엔드 개발
```bash
# 기본 개발 명령어
./gradlew bootRun                    # Spring Boot 애플리케이션 시작 (프론트엔드 포함)
./gradlew test                       # Java 테스트 실행
```

---

## 4. Jira 및 프로세스 지침 (Jira & Process Guidelines)

### 4.1. JIRA 통합 개요
모든 작업은 JIRA(프로젝트: ICT)에서 추적되어야 합니다.
- **서버**: `d_mcpsvr_jira/`
- **실행**: `d_mcpsvr_jira` 디렉토리에서 파이썬 스크립트 실행

### 4.2. JIRA 워크플로우

**⭐ 중요 규칙: `docs/JIRA_INTEGRATION.md` 참조 필수**

### 4.3. ⚠️ JIRA 완료 처리 규칙 (CRITICAL)

**🚨 중요: JIRA 이슈 완료 처리는 반드시 사용자가 직접 수행해야 합니다.**

#### Qwen 역할
- ✅ 작업 시작 및 진행 상황 업데이트
- ✅ 코드 구현 및 검증 (테스트 통과)
- ✅ 사용자에게 완료 확인 요청

#### 사용자 역할
- ⛔ **최종 완료 처리**: `add_completion_comment()` 호출 및 이슈 닫기
- ⛔ **배포 승인**: 운영 환경 배포 결정

#### 🚫 금지 사항 (Prohibitions)
- ❌ `add_completion_comment()` 자동 호출 금지
- ❌ 이슈 상태를 "완료"로 자동 변경 금지
- ❌ 사용자 확인 없이 완료 처리 금지

---

## 6. 📝 프로젝트 지침 (Project-Specific Notes)
- **통신 언어**: 모든 응답, 주석 및 아티팩트에 **항상 한국어를 사용**하세요.
- **아티팩트**: `walkthrough.md`, `implementation_plan.md`는 **한국어**로 작성되어야 합니다.

---

## 7. 🚀 애플리케이션 시작 가이드 (Application Startup Guide)

### 7.1. 사전 요구 사항
- **Java 21** 설치 및 구성
- **Docker & Docker Compose** 설치
- **Docker 서비스 실행**: PostgreSQL, MinIO, RAG 서비스 인프라 서비스

### 7.2. 인프라 시작 (Docker)

```bash
cd docker-compose-build
docker-compose -f docker-compose.yml up -d postgres postgres-rag minio rag-service
```

### 7.3. 애플리케이션 시작 (Spring Boot + Frontend)

```bash
cd .. # 프로젝트 루트
./gradlew bootRun
```

---

## 8. 🚨 파일 삭제 정책 (File Deletion Policy)

**⛔ Qwen 파일 삭제 금지 (사용자 승인 필수)**

- **원칙**: Qwen은 파일을 직접 삭제(`rm`)하지 않습니다.
- **절차**: 삭제가 필요한 경우 사용자에게 이유를 설명하고 승인을 요청하거나, 사용자가 직접 삭제하도록 안내합니다.
- **보안 원칙**: 데이터 보호 및 의도하지 않은 손실 방지