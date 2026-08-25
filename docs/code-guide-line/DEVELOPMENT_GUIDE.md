# Development Guide

최종 갱신: 2026-08-23 21:40 KST · 기준 스택: Java 21 · Spring Boot 3.5.15 · React 18.3 · Vite 7

React 프론트엔드와 Spring Boot 백엔드가 하나의 산출물로 통합된 테스트 케이스 관리 애플리케이션입니다. 별도 프로세스로 FastAPI RAG 서비스와 MCP 서버가 붙습니다.

## 📋 목차

1. [구성 요소 한눈에 보기](#-구성-요소-한눈에-보기)
2. [개발 환경 설정](#-개발-환경-설정)
3. [인프라스트럭처 (Docker)](#-인프라스트럭처-docker)
4. [백엔드 개발 워크플로우](#-백엔드-개발-워크플로우)
5. [프론트엔드 개발 워크플로우](#-프론트엔드-개발-워크플로우)
6. [RAG 시스템 개발](#-rag-시스템-개발)
7. [MCP 서버](#-mcp-서버)
8. [i18n (다국어) 시스템](#-i18n-다국어-시스템)
9. [테스트 가이드라인](#-테스트-가이드라인)
10. [테스트 주도 개발 (TDD) 가이드라인](#-테스트-주도-개발-tdd-가이드라인)
11. [개발 팁](#-개발-팁)

언어·영역별 상세 규약은 별도 문서입니다.

- [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md)
- [React 코딩 가이드라인](./REACT_CODING_GUIDELINES.md)
- [FastAPI 코딩 가이드라인](./FASTAPI_CODING_GUIDELINES.md)
- [API 개발 가이드](./API_GUIDE.md) · [보안 가이드](./SECURITY_GUIDE.md)
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md) · [API 테스트 가이드](./API_TESTING_GUIDE_SUMMARY.md) · [E2E 테스트 가이드](./E2E_TESTING_GUIDE.md)
- [GitHub Actions 가이드](./GITHUB_ACTION_GUIDE.md)

## 🧩 구성 요소 한눈에 보기

| 구성 요소 | 위치 | 스택 | 포트 |
| :--- | :--- | :--- | :--- |
| 백엔드 + 프론트엔드 서빙 | `src/main/java`, `src/main/frontend` | Spring Boot 3.5.15 / Java 21, React 18.3 / Vite 7 | 8080 |
| RAG 서비스 | `rag-service/` | FastAPI 0.122 / Python | 8001 (호스트) → 8000 (컨테이너) |
| MCP 서버 | `mcp-server/` | TypeScript / `@modelcontextprotocol/sdk` | stdio |
| Jira 앱 | `jiraApp/` | Forge | — |

프론트엔드는 별도 배포물이 아닙니다. `processResources` 가 Vite 빌드 결과를 `src/main/resources/static` 으로 복사하므로 하나의 jar 로 나갑니다.

## 🛠 개발 환경 설정

### 필수 소프트웨어

#### Java 21 (필수)

```bash
# macOS — Amazon Corretto 21
brew install --cask corretto21

export JAVA_HOME=$(/usr/libexec/java_home -v 21)
java -version
```

Gradle toolchain 이 21 로 고정되어 있어 다른 버전이 기본이어도 빌드는 21 로 돕니다. 다만 IDE 설정은 맞춰 둡니다.

#### Docker & Docker Compose (필수)

PostgreSQL·MinIO·RAG 서비스 구동에 필요하고, **백엔드 테스트에도 필요합니다.** Testcontainers 가 테스트용 PostgreSQL 컨테이너를 직접 기동합니다.

```bash
docker --version
docker compose version
```

#### Node.js & npm

Gradle 의 `node` 플러그인이 **Node 24.15.0 / npm 11.12.1** 을 `build/nodejs` 에 내려받아 사용합니다. 그래서 `./gradlew bootRun` 만 할 때는 호스트에 Node 가 없어도 됩니다.

프론트엔드를 직접 개발할 때는 호스트에 Node 를 설치합니다. **CI(`frontend-tests.yml`)가 Node 24 를 쓰므로 로컬도 24 를 권장합니다.**

```bash
node --version   # v24.x 권장
npm --version

cd src/main/frontend
npm install
```

## 🐳 인프라스트럭처 (Docker)

개발용 서비스(DB·스토리지·RAG)는 `docker-compose-build/docker-compose.yml` 로 함께 관리합니다.

### 서비스 요약

> v1.0.93부터 앱 DB 와 RAG DB 가 단일 PostgreSQL(pgvector) 인스턴스로 통합되었습니다 (외부 포트 `5434` 하나).

| 서비스 | 이미지 | 내부 포트 | 호스트 바인딩 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL + pgvector** | `pgvector/pgvector:pg18` | 5432 | `127.0.0.1:5434` | 앱 DB(`testcase_management`) + RAG DB(`rag_db`) |
| **MinIO** | `minio/minio` | 9000 / 9001 | `127.0.0.1:9000` / `127.0.0.1:9001` | S3 호환 저장소 (첨부파일·RAG 문서) / 콘솔 |
| **RAG Service** | `xmlangel/testcasecraft-rag-service` | 8000 | `127.0.0.1:8001` | FastAPI RAG API |
| **App** | `xmlangel/testcasecraft` | `SERVER_PORT` | `HTTP_PORT` / `HTTPS_PORT` | 통합 배포용. 개발 중에는 띄우지 않습니다 |

### ⚠️ 포트는 루프백에만 열린다

세 서비스 모두 `${INTERNAL_BIND_ADDR:-127.0.0.1}` 로 바인딩합니다. 앱과 RAG 는 도커 내부 네트워크(`postgres:5432`·`minio:9000`·`rag-service:8000`)로 붙으므로 외부 노출이 필요하지 않습니다.

`0.0.0.0` 으로 바꾸면 **호스트 방화벽을 우회합니다.** 도커가 iptables 를 직접 조작하기 때문입니다. 원격에서 봐야 하면 SSH 터널을 사용합니다. 자세한 내용은 [보안 가이드](./SECURITY_GUIDE.md)의 인프라 절을 봅니다.

### 인프라 시작하기

```bash
cd docker-compose-build

# 개발에 필요한 것만 (앱은 gradlew 로 띄운다)
docker compose up -d postgres minio rag-service

docker compose ps
```

`.env` 가 필요합니다. `env_example` 을 복사해 만들고 최소한 `MINIO_SECRET_KEY`·`POSTGRES_PASSWORD` 계열을 채웁니다(`MINIO_SECRET_KEY` 는 미설정 시 컨테이너가 기동을 거부합니다).

## 🎯 백엔드 개발 워크플로우

### 실행 명령

프로파일별 실행 태스크가 준비되어 있습니다.

| 명령 | 프로파일 | 대상 DB |
| :--- | :--- | :--- |
| `./gradlew bootRun` | 기본 | `application.yml` 설정 |
| `./gradlew bootRunDev` | `dev` | 로컬 도커 (`localhost:5434`) |
| `./gradlew bootRunLocal` | `local` | 로컬 DB |
| `./gradlew bootRunRemote` | `remote` | 원격 DB |

`bootRun` 은 `processResources` 에 의존하므로 **Vite 프론트엔드 빌드를 먼저 수행**한 뒤 결과물을 `src/main/resources/static` 에 배치하고 서버를 띄웁니다. 프론트엔드를 건드리지 않았어도 이 단계가 매번 돌아 시간이 걸립니다. 백엔드만 반복 수정할 때는 IDE 에서 `TestcasemanagementApplication` 을 직접 실행하는 편이 빠릅니다.

`bootRunDev`·`bootRunLocal`·`bootRunRemote` 는 `classes` 에만 의존하므로 프론트엔드 빌드를 건너뜁니다. 이미 빌드된 static 산출물을 그대로 서빙합니다.

### 빌드 및 테스트

```bash
# 전체 빌드 (프론트엔드 포함)
./gradlew build

# 백엔드 테스트 (TestNG) — api 패키지는 제외되어 있다
./gradlew test

# API 전체 엔드포인트 종합 테스트
./gradlew apiComprehensiveTest

# Allure 리포트
./gradlew allureReport
```

테스트는 `maxParallelForks` 를 `코어/2`(최대 4)로 두고 여러 JVM 에 나눠 돕니다. 포크마다 PostgreSQL 컨테이너가 하나씩 뜨므로 **Docker 데몬이 떠 있어야 하고 메모리 여유가 필요합니다.**

### 표준 개발 워크플로우

1. **인프라 시작**: `cd docker-compose-build && docker compose up -d postgres minio rag-service`
2. **코드 수정**: Java 또는 React
3. **재시작**: 백엔드만 바꿨으면 IDE 재실행 또는 `./gradlew bootRunDev`
4. **프론트엔드 핫 리로드**: `cd src/main/frontend && npm start` 를 별도 터미널에서 실행 (포트 3000, `/api` 는 8080 으로 프록시)

### 스키마 변경 주의

전 프로파일이 Hibernate `ddl-auto: update` 를 사용합니다. Flyway 의존성은 들어 있지만 `enabled: false` 이고 마이그레이션 파일이 없습니다.

`update` 는 **추가만** 반영합니다. 컬럼 삭제·타입 변경·nullable → not-null 전환은 반영되지 않으므로, 그런 변경은 실행할 SQL 을 따로 준비하고 릴리즈 노트에 기록합니다.

## 🎨 프론트엔드 개발 워크플로우

프론트엔드는 `src/main/frontend` 의 React(Vite) 앱입니다. 코딩 규약은 [React 코딩 가이드라인](./REACT_CODING_GUIDELINES.md)이 정본이므로, 여기서는 실행과 구조만 짚습니다.

### 주요 명령어

```bash
cd src/main/frontend

npm start              # 개발 서버 (포트 3000, /api → localhost:8080 프록시)
npm run build          # 프로덕션 빌드 (결과물 build/)

npm test               # Vitest 단위 테스트 1회
npm run test:watch     # Vitest 감시 모드

npm run format         # Prettier 정렬
npm run format:check   # 정렬 검사 (CI 와 동일)
npm run check:dates    # 날짜 포맷을 직접 작성한 자리 검출
```

### ⚠️ 주의사항

- **포트**: 백엔드 API 는 8080, Vite 개발 서버는 3000 입니다.
- **통합 서빙**: `./gradlew bootRun` 으로 띄우면 백엔드가 프론트엔드 정적 파일을 직접 서비스합니다 (http://localhost:8080).
- **개발 모드**: `npm start` 는 `vite.config.js` 의 프록시 설정으로 `/api` 요청을 8080 으로 넘깁니다. 백엔드 주소를 코드에 적지 않습니다.
- **CI 게이트**: `format:check` 와 `npm test` 가 PR 에서 강제됩니다. 커밋 전에 `npm run format` 을 돌립니다.
- **환경 변수**: Vite 이므로 `process.env` 가 아니라 `import.meta.env` 를 사용합니다. 노출할 값은 `VITE_` 접두가 필요합니다.

### 컴포넌트 구조

```
src/
├── api/                # 서비스로 감싸지 않은 소수 호출 (guidesApi)
├── components/         # UI 컴포넌트
│   ├── atoms/          # 기본 원자 컴포넌트
│   ├── molecules/      # 분자 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── navigation/     # 내비게이션
│   ├── admin/          # 관리자 화면
│   └── [Domain]/       # 도메인별 (TestCase, TestResult, JiraIntegration, RAG ...)
├── context/            # React Context + Provider (같은 파일에 함께 정의)
├── hooks/              # 커스텀 훅 (rag/ 하위 포함)
├── services/           # API 서비스 레이어 (apiService 등)
├── constants/          # 색상·상태·오류코드·화면 ID 상수
├── models/             # 데이터 모델 및 도메인 상수
├── types/              # JSDoc 기반 타입 정의
├── utils/              # 유틸리티 (axiosInstance 포함)
├── styles/ · theme.js  # 전역 CSS 와 MUI 테마
├── assets/             # 정적 자원
└── test/setup/         # Vitest 셋업
```

`providers/` 폴더는 없습니다. Provider 는 각 Context 파일 안에 함께 있습니다.

단위 테스트는 대상 파일 옆에 `*.test.jsx` 로 둡니다.

### 컴포넌트 작성 예시

```jsx
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import testCaseService from "../services/testCaseService";
import { useTranslation } from "../context/I18nContext";

const ExampleComponent = ({ projectId }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      // 서비스 레이어를 거친다 (인증 헤더·언어 헤더·토큰 재발급이 붙는다)
      const result = await testCaseService.createTestCase({ ...formData, projectId });
      setData(result);
    } catch (error) {
      console.error("작업 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">{t("example.title", "예제 컴포넌트")}</Typography>
      <Button
        variant="contained"
        onClick={() => handleSubmit({ name: "New TestCase" })}
        disabled={loading}
      >
        {t("common.save", "저장")}
      </Button>
    </Box>
  );
};

export default ExampleComponent;
```

### 스타일링 가이드라인

스타일은 `sx` prop 으로 작성하고 색상은 테마에서 가져옵니다.

```jsx
<Box
  sx={{
    display: "flex",
    p: 2,
    backgroundColor: (theme) => theme.palette.background.paper,
    color: "text.primary",
  }}
>
  <Typography variant="h6">제목</Typography>
</Box>
```

**`makeStyles`·`withStyles` 는 사용하지 않습니다.** MUI v5 에서 `@mui/styles` 로 분리되고 v7 기준으로는 유지되지 않는 API 입니다. 현재 저장소에 사용처가 없으며, 재사용할 스타일은 `styled()` 나 테마 `components` 오버라이드로 만듭니다.

라이트·다크 두 테마가 있으므로 고정 색상값을 넣으면 다크 테마에서 글자가 배경에 묻힙니다.

#### 반응형 디자인

```jsx
import { useMediaQuery, useTheme } from "@mui/material";

const ExampleComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ flexDirection: isMobile ? "column" : "row", p: isMobile ? 1 : 2 }}>
      {/* 반응형 콘텐츠 */}
    </Box>
  );
};
```

## 🧠 RAG 시스템 개발

RAG(Retrieval-Augmented Generation) 시스템은 문서 업로드·파싱·청킹·임베딩·검색과 LLM 분석을 담당합니다.

### 아키텍처 흐름

```
React Frontend
  → Spring Boot (8080)
    → FastAPI RAG Service (내부 rag-service:8000 / 호스트 127.0.0.1:8001)
      → PostgreSQL + pgvector (5434, rag_db)
      → MinIO (9000)
      → LLM API (OpenAI · Anthropic · NVIDIA · Ollama)
```

### 주요 구성 요소

| 층 | 위치 |
| :--- | :--- |
| Frontend | `src/main/frontend/src/components/RAG/`, `hooks/rag/`, `context/RAGContext.jsx` |
| Spring Boot | `controller/RagController.java`, `service/RagServiceImpl.java`, `service/RagChatServiceImpl.java`, `config/RagClientConfig.java` |
| FastAPI | `rag-service/` (라우터 6종 · 서비스 12종) |

Spring Boot 는 RAG 서비스를 WebFlux(`spring-boot-starter-webflux`)로 호출합니다.

### 주의사항

- **RAG 서비스에는 자체 인증이 없습니다.** `/docs`·`/redoc` 이 열려 있으므로 포트를 루프백 밖으로 내보내지 않습니다.
- **임베딩 모델을 바꾸면 차원이 달라집니다.** `EMBEDDING_DIMENSION` 과 `pgvector` 컬럼이 어긋나면 검색이 조용히 엉뚱한 결과를 냅니다. 기존 벡터 재생성 계획과 함께 진행합니다.
- 상세 규약은 [FastAPI 코딩 가이드라인](./FASTAPI_CODING_GUIDELINES.md)을 봅니다.

## 🔌 MCP 서버

`mcp-server/` 에 이 프로젝트의 REST API 를 MCP 도구로 노출하는 TypeScript 서버가 있습니다.

```bash
cd mcp-server

npm install
npm run build      # tsc
npm start          # node dist/index.js (stdio)
npm test           # 빌드 후 스모크 테스트
npm run dev        # tsc --watch
```

REST 엔드포인트의 경로·요청·응답 형태를 바꾸면 이쪽 도구 정의도 함께 확인합니다. 응답 필드 이름이 바뀌면 도구가 조용히 빈 값을 반환합니다.

## 🌐 i18n (다국어) 시스템

번역 키와 값은 코드에 정의하고 앱 기동 시 DB 에 시딩합니다. 프런트는 `/api/i18n/**` 로 읽습니다.

### 위치

| 대상 | 위치 | 개수 |
| :--- | :--- | :--- |
| 키 정의 | `config/i18n/keys/*KeysInitializer.java` | 25 |
| 번역 값 | `config/i18n/translations/{Korean,English}*Translations.java` | 28 |
| 키 등록 | `config/i18n/TranslationKeyDataInitializer.java` | — |
| 값 등록 | `config/i18n/TranslationDataInitializer.java` | — |
| 시딩 색인 | `config/i18n/I18nSeedIndex.java` | — |

### 번역 추가 절차 — 네 단계를 모두 밟는다

1. **키 정의**: `keys/` 의 해당 `*KeysInitializer` 에 키를 추가합니다 (예: `TestCaseKeysInitializer`).
2. **한글 값**: `translations/Korean*Translations` 에 추가합니다.
3. **영문 값**: `translations/English*Translations` 에 추가합니다.
4. **🔴 등록**: 클래스를 **새로** 만들었으면 `TranslationKeyDataInitializer`(키) 또는 `TranslationDataInitializer`(값)에 필드로 주입하고 호출을 추가합니다.

두 초기화 클래스는 하위 Initializer 를 생성자 주입으로 받아 순서대로 호출합니다. 4단계를 빼먹으면 **컴파일은 되고 앱도 뜨지만 그 클래스의 키·값이 DB 에 들어가지 않습니다.** 화면에서는 기본값(두 번째 인자)이 보여 정상처럼 읽히므로, 영어 모드로 바꿔 봐야 드러납니다.

### 시딩 성능

`I18nSeedIndex` 가 키 이름·언어 코드·기존 값을 처음 한 번만 읽어 메모리에 올려 둡니다. 항목마다 DB 를 묻지 않기 위한 색인이며(번역 7,000건 대에서 조회가 2만 번을 넘습니다), 값이 같으면 사용하지 않습니다. 시딩 헬퍼를 손볼 때 이 색인을 우회해 직접 조회하면 그 이득이 사라집니다.

### 프런트 사용

```jsx
const { t } = useTranslation();
return <Button>{t("common.save", "저장")}</Button>;
```

`t()` 로 감싸지 않은 한국어 문자열은 영어 모드에서 그대로 노출됩니다. 하드코딩 검출과 전수 보강 절차는 프로젝트 `CLAUDE.md` 의 i18n 감사 하네스를 사용합니다.

## 🧪 테스트 가이드라인

### 테스트 전략

| 층 | 도구 | 위치 |
| :--- | :--- | :--- |
| 백엔드 단위·통합 | TestNG + Mockito + RestAssured, Testcontainers PostgreSQL | `src/test/java/` |
| 프론트엔드 단위 | Vitest + Testing Library (jsdom) | 대상 파일 옆 `*.test.jsx` |
| E2E | Playwright (Node) | `src/test/e2e/` |

**백엔드 테스트 DB 는 Testcontainers PostgreSQL 입니다.** H2 를 쓰지 않으므로 PostgreSQL 전용 문법을 그대로 검증합니다. 대신 Docker 데몬이 떠 있어야 합니다. 상세는 [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md).

### E2E 테스트 (Playwright)

`src/test/e2e` 에 있고 Page Object Model 패턴을 따릅니다.

```bash
cd src/test/e2e

# 최초 1회
npm install
npx playwright install chromium

# 실행 (백엔드가 8080 에 떠 있어야 한다)
npx playwright test
npx playwright test regression/login.spec.js
```

상세 내용은 [E2E 테스트 가이드](./E2E_TESTING_GUIDE.md)를 봅니다.

### CI 게이트 현황

| 대상 | PR 에서 자동 실행 |
| :--- | :--- |
| 프론트엔드 포맷·Vitest | **예** (`frontend-tests.yml`) |
| 백엔드 `./gradlew test` | 아니오 |
| E2E | 아니오 |

백엔드와 E2E 는 게이트가 없으므로 로컬에서 돌려 확인합니다.

## 🎯 테스트 주도 개발 (TDD) 가이드라인

### 🔄 TDD 사이클

1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 품질 개선

### 백엔드 TDD 예시 (TestNG)

```java
// 1단계: 테스트 먼저 작성
@Test
public void 프로젝트를_생성하면_생성자가_기록된다() {
  // Given
  ProjectCreateRequest request = new ProjectCreateRequest("Test Project", "Description");

  // When
  ProjectDto result = projectService.createProject(request, "admin");

  // Then
  assertEquals(result.getName(), "Test Project");
  assertEquals(result.getCreatedBy(), "admin");
}
```

```java
// 3단계: 테스트를 통과하는 최소 구현
@Service
@RequiredArgsConstructor
public class ProjectService {

  private final ProjectRepository projectRepository;

  public ProjectDto createProject(ProjectCreateRequest request, String currentUser) {
    Project project =
        Project.builder()
            .name(request.getName())
            .description(request.getDescription())
            .createdBy(currentUser)
            .build();
    return ProjectDto.from(projectRepository.save(project));
  }
}
```

TestNG 의 `assertEquals` 는 **인자 순서가 (actual, expected)** 입니다. JUnit 과 반대이므로 실패 메시지가 뒤집혀 읽히지 않게 순서를 맞춥니다.

### 프론트엔드 TDD 예시 (Vitest)

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ProjectForm", () => {
  it("폼이 유효하면 입력값을 그대로 넘긴다", async () => {
    const onSubmit = vi.fn();
    render(<ProjectForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/project name/i), "Test Project");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Test Project", description: "" });
  });
});
```

`vi.fn()`·`vi.mock()` 을 사용합니다(`jest.*` 가 아닙니다). `globals: true` 라 `describe`·`it`·`expect` 는 import 없이도 쓸 수 있습니다.

### TDD 명령어

```bash
# 백엔드 — 특정 테스트 클래스만
./gradlew test --tests "*ProjectServiceTest*"

# 백엔드 — 테스트 후 리포트
./gradlew test allureReport

# 프론트엔드 — 감시 모드
cd src/main/frontend && npm run test:watch

# 프론트엔드 — 특정 파일만
cd src/main/frontend && npm test -- ProjectForm.test.jsx
```

### 📋 TDD 체크리스트

**테스트 작성 시**

- [ ] 테스트가 하나의 기능만 검증하는가
- [ ] Given-When-Then 구조인가
- [ ] 테스트 이름이 무엇을 보장하는지 말하는가
- [ ] 독립적으로 실행 가능한가 (다른 테스트의 데이터에 의존하지 않는가)

**구현 코드 작성 시**

- [ ] 모든 테스트가 통과하는가
- [ ] 테스트를 통과하는 최소한의 코드인가
- [ ] 요청받지 않은 유연성·설정 가능성을 넣지 않았는가

**리팩토링 시**

- [ ] 모든 테스트가 여전히 통과하는가
- [ ] 테스트 코드를 고쳐서 통과시킨 것은 아닌가
- [ ] 중복이 제거되었는가

### 🚫 주의사항

- **테스트 코드를 고쳐 통과시키지 않습니다.** 테스트가 틀렸다고 판단했으면 왜 틀렸는지를 먼저 밝힙니다.
- **구현 세부사항이 아니라 동작을 검증합니다.** 내부 자료구조를 단정하면 리팩토링마다 테스트가 깨집니다.
- **작은 단위로 진행합니다.** 한 번에 하나의 기능씩.

## 💡 개발 팁

### 디버깅 및 로깅

#### 백엔드 로깅

```java
@Service
@Slf4j
public class ExampleService {

  public void someMethod(String parameter) {
    log.info("메서드 실행: {}", parameter);
    log.debug("디버그 정보: {}", debugInfo);
    log.error("오류 발생", exception);
  }
}
```

`@Slf4j` 를 쓰고 파라미터는 `{}` 자리표시자로 넘깁니다. 문자열 연결로 만들면 레벨이 꺼져 있어도 문자열 조립 비용이 듭니다.

**민감값을 로그에 남기지 않습니다**: JWT·API 키·비밀번호·DB 커넥션 문자열·Google 서비스 계정 JSON. 운영 로그 레벨을 INFO 로 두는 이유가 여기 있습니다. DEBUG 로 내리면 커넥션 문자열이 그대로 찍힙니다.

#### 프론트엔드 디버깅

```javascript
// Vite — process.env 가 아니라 import.meta.env
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}
```

React DevTools(Chrome 확장)를 함께 사용합니다. Context 가 열둘이라 리렌더 원인을 추적할 때 Profiler 가 값어치가 있습니다.

### 성능 최적화

#### 백엔드

```java
// N+1 방지 — 연관을 함께 읽는다
@Query("SELECT p FROM Project p JOIN FETCH p.projectUsers pu JOIN FETCH pu.user WHERE p.id = :id")
Optional<Project> findByIdWithUsers(@Param("id") String id);

// 페이징
@GetMapping
public ResponseEntity<Page<ProjectDto>> getProjects(@PageableDefault(size = 20) Pageable pageable) {
  return ResponseEntity.ok(projectService.findAll(pageable));
}
```

`JOIN FETCH` 와 `Pageable` 을 함께 쓰면 Hibernate 가 전체를 읽어 메모리에서 페이징합니다. 페이징이 필요한 조회에는 `@EntityGraph` 나 두 단계 조회를 사용합니다.

`spring-boot-starter-actuator` 와 Micrometer/Prometheus 가 붙어 있으므로 `/actuator/metrics` 로 실제 값을 보고 판단합니다. 인증이 필요합니다(`/actuator/health` 계열만 공개).

#### 프론트엔드

```jsx
import React, { memo, useMemo, useCallback } from "react";

const OptimizedComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => data.map(processItem), [data]);
  const handleClick = useCallback((id) => onUpdate(id), [onUpdate]);

  return <ItemList items={processedData} onClick={handleClick} />;
});
```

대량 목록은 `@tanstack/react-virtual` 로 가상화하고, 표 형태는 `@mui/x-data-grid` 의 자체 가상화를 사용합니다.

### 화면을 추가할 때

**화면 ID 정의가 일곱 곳에 흩어져 있습니다.** 문서 폴더 이름 · `docs/screen_spec/validate.py` · `build_html.py` · `src/main/frontend/src/constants/screenIds.js` · `README.md` 화면 목록 · `ScreenIdKeysInitializer.java` · 한/영 번역 클래스. 화면을 더하거나 이름을 바꿀 때 일곱 곳을 함께 고칩니다.

빠짐없이 반영됐는지는 프로젝트 `CLAUDE.md` 의 화면 커버리지 감사 하네스로 확인합니다.

### 매뉴얼과 함께 고친다

사용자에게 보이는 동작을 바꿨으면 사용자 매뉴얼도 함께 갱신합니다. **한국어판(`docs/manual/new/USER_MANUAL.md`)을 고치면 영문판(`USER_MANUAL_EN.md`)의 같은 절도 고칩니다.** 화면 주소가 바뀌면 16-4절 「화면 주소 모음」이 정본이므로 그 표를 고칩니다.

매뉴얼과 가이드 문서는 `processResources` 가 jar 에 동봉하므로, 도커 배포에서도 앱 안에서 열립니다.

### 버전 올리기

```bash
./gradlew incrementVersion                        # 앱
./gradlew incrementVersion -PtargetComponent=rag  # RAG 서비스
```

앱과 RAG 서비스는 버전이 독립적으로 올라갑니다. 자세한 배포 절차는 [GitHub Actions 가이드](./GITHUB_ACTION_GUIDE.md)를 봅니다.

---

## 📚 관련 문서

- [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md) - 계층·예외·JPA·의존성 규약
- [React 코딩 가이드라인](./REACT_CODING_GUIDELINES.md) - 컴포넌트·Context·MUI·테스트
- [FastAPI 코딩 가이드라인](./FASTAPI_CODING_GUIDELINES.md) - RAG 서비스 규약
- [API 개발 가이드](./API_GUIDE.md) - REST API 설계 표준
- [보안 가이드](./SECURITY_GUIDE.md) - 인증·인가·데이터 보호
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md) - 레이어별 테스트 표준
- [API 테스트 가이드](./API_TESTING_GUIDE_SUMMARY.md) - RestAssured·JSON 스키마
- [E2E 테스트 가이드](./E2E_TESTING_GUIDE.md) - Playwright 시나리오
- [GitHub Actions 가이드](./GITHUB_ACTION_GUIDE.md) - 빌드·릴리즈·배포
