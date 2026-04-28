# Development Guide (최종 업데이트: 2026-04-28)

이 프로젝트는 React 기반 프론트엔드와 Spring Boot 기반 백엔드가 통합된 테스트 케이스 관리 애플리케이션입니다.

## 📋 목차

1. [개발 환경 설정](#-개발-환경-설정)
2. [인프라스트럭처 (Docker)](#-인프라스트럭처-docker)
3. [백엔드 개발 워크플로우](#-백엔드-개발-워크플로우)
4. [프론트엔드 개발 워크플로우](#-프론트엔드-개발-워크플로우)
5. [RAG 시스템 개발](#-rag-시스템-개발)
6. [i18n (다국어) 시스템](#-i18n-다국어-시스템)
7. [JIRA 및 프로세스 가이드](#-jira-및-프로세스-가이드)
8. [테스트 가이드라인](#-테스트-가이드라인)
9. [개발 팁](#-개발-팁)
10. [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md)
11. [FastAPI 코딩 가이드라인](./FASTAPI_CODING_GUIDELINES.md)
12. [React 코딩 가이드라인](./REACT_CODING_GUIDELINES.md)

## 🛠 개발 환경 설정

### 필수 소프트웨어

#### Java 21 (필수)

이 프로젝트는 **Java 21**을 사용합니다.

```bash
# macOS - Amazon Corretto 21 설치 예시
brew install --cask corretto21

# JAVA_HOME 설정 (사용자의 환경에 맞게 설정)
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# 설정 확인
java -version
```

#### Docker & Docker Compose (필수)

PostgreSQL, MinIO, RAG 서비스 실행을 위해 필요합니다.

```bash
# Docker Desktop 설치 확인
docker --version
docker-compose --version
```

#### Node.js & npm (프론트엔드 개발용)

```bash
# Node.js v18+ 및 npm v9+ 권장
node --version
npm --version

# 프론트엔드 의존성 설치
cd src/main/frontend
npm install
```

## 🐳 인프라스트럭처 (Docker)

개발 환경 구동을 위해 필요한 모든 서비스(DB, Storage, RAG)는 Docker Compose로 통합 관리됩니다.

### 서비스 요약

| 서비스             | 내부 포트 | 외부 포트     | 설명                                     |
| :----------------- | :-------- | :------------ | :--------------------------------------- |
| **PostgreSQL**     | 5432      | **5434**      | 메인 애플리케이션용 데이터베이스         |
| **PostgreSQL RAG** | 5432      | **5433**      | pgvector 확장이 포함된 RAG용 DB          |
| **MinIO**          | 9000/9001 | **9000/9001** | S3 호환 파일 저장소 (첨부파일, RAG 문서) |
| **RAG Service**    | 8000      | **8001**      | FastAPI 기반 RAG API 서버                |

### 인프라 시작하기

```bash
cd docker-compose-build

# 모든 서비스 백그라운드 실행
docker-compose -f docker-compose.yml up -d postgres postgres-rag minio rag-service

# 서비스 상태 확인
docker-compose ps
```

## 🎯 백엔드 개발 워크플로우

### 기본 개발 명령어

#### 애플리케이션 통합 실행 (프론트엔드 포함)

이 명령어를 실행하면 `src/main/frontend`를 자동으로 빌드하여 `src/main/resources/static`에 배치하고, 백엔드 서버를 시작합니다.

```bash
# 전체 프로젝트 실행 (기본 포트 8080)
./gradlew bootRun
```

#### 빌드 및 테스트

```bash
# 전체 프로젝트 빌드
./gradlew build

# Java 단위 테스트 실행 (TestNG)
./gradlew test

# Allure 리포트 생성
./gradlew allureReport
```

### 표준 개발 워크플로우

1. **인프라 시작**: `docker-compose -f docker-compose.yml up -d`를 먼저 실행합니다.
2. **코드 수정**: Java 또는 React 코드를 수정합니다.
3. **재시작**: `./gradlew bootRun`을 다시 실행하여 변경 사항을 확인합니다.
   - 프론트엔드만 수정했고 핫 리로드(Hot Reload)가 필요한 경우, `src/main/frontend`에서 `npm start`를 별도로 실행할 수 있습니다.

## 🎨 프론트엔드 개발 워크플로우

### 프로젝트 구조

프론트엔드는 `src/main/frontend` 디렉토리에 위치한 React (Vite) 앱입니다.

### 주요 개발 명령어

```bash
cd src/main/frontend

# 개발 서버 시작 (포트 3000, 핫 리로드 지원)
npm start

# 프로덕션 빌드 (결과물은 build/ 폴더에 생성됨)
npm run build
```

### ⚠️ 주의사항

- **포트 정보**: 백엔드 API는 **8080**번 포트에서 실행됩니다.
- **통합 서빙**: `./gradlew bootRun`을 통해 실행하면 백엔드가 프론트엔드 정적 파일을 직접 서비스합니다. (http://localhost:8080)
- **개발 모드**: `npm start`로 프론트엔드를 실행하면 `proxy` 설정에 의해 API 요청이 8080으로 전달됩니다.

### React 개발 패턴

#### 컴포넌트 구조

```
src/
├── components/          # 화면 및 UI 컴포넌트
│   ├── atoms/          # 기본 원자 컴포넌트 (Button, Input 등)
│   ├── molecules/      # 분자 컴포넌트 (FormField, IconButton 등)
│   ├── common/         # 공통 컴포넌트
│   └── [Domain]/       # 도메인별 컴포넌트 (TestCase, TestPlan 등)
├── context/            # React Context 정의
├── providers/          # Context Provider 조합 및 관리
├── hooks/              # 커스텀 훅
├── services/           # API 서비스 레이어 (apiService 등)
├── types/              # JSDoc 기반 타입 정의
├── utils/              # 유틸리티 함수
└── models/             # 데이터 모델 및 상수
```

#### 컴포넌트 작성 예시

```jsx
import React, { useState } from "react";
import testCaseService from "../services/testCaseService";
import { Button, TextField, Box, Typography } from "@mui/material";
import { useTranslation } from "../context/I18nContext";

const ExampleComponent = ({ projectId }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      // 서비스 레이어 활용 (권장)
      const result = await testCaseService.createTestCase({
        ...formData,
        projectId
      });
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
      {/* MUI 컴포넌트 사용 */}
      <Button variant="contained" onClick={() => handleSubmit({ name: "New TestCase" })} disabled={loading}>
        {t("common.save", "저장")}
      </Button>
    </Box>
  );
};

export default ExampleComponent;
```

// apiService를 직접 사용하는 경우 (인증 토큰 자동 포함)
import apiService from "./services/apiService";

const fetchData = async () => {
  const response = await apiService.get("/api/some-endpoint");
  return await response.json();
};

### 스타일링 가이드라인

#### Material-UI 테마 활용

```jsx
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// 컴포넌트에서 테마 사용
const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
  },
}));
```

#### 반응형 디자인

```jsx
import { useMediaQuery, useTheme } from "@mui/material";

const ExampleComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        flexDirection: isMobile ? "column" : "row",
        padding: isMobile ? 1 : 2,
      }}
    >
      {/* 반응형 콘텐츠 */}
    </Box>
  );
};
```

## 🧠 RAG 시스템 개발

RAG(Retrieval-Augmented Generation) 시스템은 문서 업로드, 임베딩, 유사성 검색 기능을 제공합니다.

### 아키텍처 흐름

`React Frontend` → `Spring Boot (8080)` → `FastAPI RAG Service (8001)` → `PostgreSQL (5433)` + `MinIO (9000)`

### 주요 구성 요소

- **Frontend Layer**: `src/main/frontend/src/components/RAG/`
- **Spring Boot Layer**: `controller/RagController.java`, `service/RagService.java`
- **FastAPI Layer**: `rag-service/` 디렉토리 (Docker 서비스명: `rag-service`)

## 🌐 i18n (다국어) 시스템

새로운 번역을 추가할 때는 **반드시 다음 4개 파일을 모두 수정** 해야 합니다.

1. **번역 키 정의**: `src/main/java/.../config/i18n/keys/` 폴더 내 관련 Initializer (예: `TestCaseKeysInitializer.java`)
2. **한글 번역 추가**: `KoreanTestCaseAndAutomationTranslations.java`
3. **영어 번역 추가**: `EnglishTestCaseAndAutomationTranslations.java`
4. **🔴 Initializer 등록**: `TranslationKeyDataInitializer.java`의 `initialize()` 메서드에 새로운 Initializer 호출을 반드시 추가해야 합니다.

## 🧪 테스트 가이드라인

### 테스트 전략

- **백엔드**: TestNG를 이용한 단위 및 통합 테스트
- **프론트엔드**: Vitest/Jest를 이용한 컴포넌트 테스트
- **E2E 테스트**: Playwright를 이용한 시나리오 기반 테스트

### E2E 테스트 (Playwright)

E2E 테스트는 `src/test/e2e` 디렉토리에 위치하며, Page Object Model(POM) 패턴을 따릅니다.

```bash
cd src/test/e2e

# 테스트 실행
npx playwright test

# 특정 시나리오 실행
npx playwright test regression/login.spec.js
```

 상세 내용은 **[docs/E2E_TESTING_GUIDE.md](../E2E_TESTING_GUIDE.md)**를 참조하세요.

## 🎯 테스트 주도 개발 (TDD) 가이드라인

### TDD 워크플로우 개요

**테스트 주도 개발(Test-Driven Development)**은 테스트를 먼저 작성하고, 테스트를 통과하는 코드를 작성하는 개발 방법론입니다.

#### 🔄 TDD 사이클

1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 품질 개선

### ✅ 단계별 TDD 실행 방법

#### 1단계: Claude에게 테스트 먼저 작성 요청하기

```
📝 사용자 요청 예시:
"테스트 주도 개발을 하고 있습니다.
[기능 설명]에 대한 테스트를 먼저 작성해주세요.
예상되는 입력/출력 사례를 바탕으로 테스트만 작성하고,
아직 구현 코드는 작성하지 마세요."
```

**중요한 점**:

- **"테스트 주도 개발을 하고 있다"**고 Claude에게 명확히 알려주세요
- 그래야 아직 없는 기능에 대해 **추측성 구현(모킹)**을 하지 않고, 테스트만 정확히 작성합니다

#### 2단계: 테스트 실행 → 실패 확인

```
📝 사용자 지시 예시:
"작성한 테스트를 실행하고 실패하는지 확인해주세요.
아직 구현 코드는 작성하지 말고, 테스트 실행 결과만 확인해주세요."
```

**목적**: 테스트만 검증하고 넘어가게 하기 위함

#### 3단계: 테스트를 통과하는 코드 작성 지시

```
📝 사용자 지시 예시:
"이제 테스트를 통과하도록 코드를 작성해주세요.
조건:
- 테스트 코드는 수정하지 말 것
- 모든 테스트가 통과할 때까지 계속 반복
- 실패하는 테스트가 있으면 코드를 수정해서 다시 시도"
```

**특징**: Claude는 일반적으로 몇 번의 "코드 작성 → 테스트 실행 → 수정" 루프를 거쳐서 점점 개선해 나갑니다.

#### 4단계: (선택) Sub-agent로 검증 요청

```
📝 사용자 지시 예시:
"테스트에만 맞춘 오버피팅 코드가 아닌지 Sub-agent를 활용해
추가 검증을 해주세요."
```

### 🎯 TDD 실행 예시

#### 백엔드 TDD 예시 (TestNG)

```java
// 1단계: 테스트 먼저 작성
@Test
public void should_create_project_successfully() {
    // Given
    ProjectCreateRequest request = new ProjectCreateRequest("Test Project", "Description");
    String currentUser = "admin";

    // When
    ProjectDto result = projectService.createProject(request, currentUser);

    // Then
    assertThat(result.getName()).isEqualTo("Test Project");
    assertThat(result.getDescription()).isEqualTo("Description");
    assertThat(result.getCreatedBy()).isEqualTo("admin");
}

// 2단계: 테스트 실행 → 실패 확인
// 3단계: 테스트를 통과하는 코드 작성
@Service
public class ProjectService {
    public ProjectDto createProject(ProjectCreateRequest request, String currentUser) {
        // 테스트를 통과하는 최소한의 구현
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(currentUser);

        Project savedProject = projectRepository.save(project);
        return ProjectDto.from(savedProject);
    }
}
```

#### 프론트엔드 TDD 예시 (Jest)

```javascript
// 1단계: 테스트 먼저 작성
describe("ProjectForm Component", () => {
  test("should submit project data when form is valid", async () => {
    // Given
    const mockOnSubmit = jest.fn();
    render(<ProjectForm onSubmit={mockOnSubmit} />);

    // When
    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: "Test Project" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Then
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Project",
        description: "",
      });
    });
  });
});

// 2단계: 테스트 실행 → 실패 확인
// 3단계: 테스트를 통과하는 컴포넌트 작성
const ProjectForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

### 🔧 TDD 명령어 및 도구

#### 백엔드 TDD 명령어

```bash
# 특정 테스트 클래스만 실행
./gradlew test --tests "*ProjectServiceTest*"

# 테스트 후 리포트 생성
./gradlew test allureReport

# 테스트 감시 모드 (파일 변경 시 자동 실행)
./gradlew test --continuous
```

#### 프론트엔드 TDD 명령어

```bash
cd src/main/frontend

# Jest 테스트 감시 모드
npm test -- --watch

# 특정 테스트 파일만 실행
npm test -- ProjectForm.test.js

# 커버리지 리포트 생성
npm test -- --coverage
```

### 📋 TDD 체크리스트

#### ✅ 테스트 작성 시

- [ ] 테스트는 하나의 기능만 검증하는가?
- [ ] Given-When-Then 구조로 작성되었는가?
- [ ] 테스트 이름이 무엇을 검증하는지 명확한가?
- [ ] 테스트가 독립적으로 실행 가능한가?

#### ✅ 구현 코드 작성 시

- [ ] 모든 테스트가 통과하는가?
- [ ] 테스트를 통과하는 최소한의 코드인가?
- [ ] 추측성 구현이 아닌 테스트 기반 구현인가?
- [ ] 코드가 읽기 쉽고 유지보수가 가능한가?

#### ✅ 리팩토링 시

- [ ] 모든 테스트가 여전히 통과하는가?
- [ ] 코드 중복이 제거되었는가?
- [ ] 코드 구조가 개선되었는가?
- [ ] 성능이나 가독성이 향상되었는가?

### 🚫 TDD 주의사항

#### 피해야 할 것들

- **테스트 없이 구현 시작하기**: 항상 테스트부터 작성
- **복잡한 테스트 작성**: 단순하고 명확한 테스트 선호
- **구현 세부사항 테스트**: 동작과 결과에 집중
- **테스트 코드 수정**: 테스트는 고정하고 구현 코드만 수정

#### 권장사항

- **작은 단위로 진행**: 한 번에 하나의 작은 기능씩
- **빠른 피드백**: 테스트 실행이 빠르도록 유지
- **명확한 테스트 이름**: 무엇을 테스트하는지 명확히 표현
- **독립적인 테스트**: 테스트 간 의존성 제거

## 💡 개발 팁

### 디버깅 및 로깅

#### 백엔드 로깅

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ExampleService {
    private static final Logger logger = LoggerFactory.getLogger(ExampleService.class);

    public void someMethod() {
        logger.info("메서드 실행: {}", parameter);
        logger.debug("디버그 정보: {}", debugInfo);
        logger.error("오류 발생", exception);
    }
}
```

#### 프론트엔드 디버깅

```javascript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// React DevTools 활용
// Chrome Extension: React Developer Tools 설치
```

### 성능 최적화

#### 백엔드 최적화

```java
// JPA 쿼리 최적화
@Query("SELECT p FROM Project p JOIN FETCH p.users WHERE p.id = :id")
Project findByIdWithUsers(@Param("id") Long id);

// 페이징 처리
@GetMapping
public Page<ProjectDto> getProjects(Pageable pageable) {
    return projectService.findAll(pageable);
}
```

#### 프론트엔드 최적화

```jsx
import React, { memo, useMemo, useCallback } from "react";

// 컴포넌트 메모이제이션
const OptimizedComponent = memo(({ data, onUpdate }) => {
  // 계산 비용이 큰 값 메모이제이션
  const processedData = useMemo(() => {
    return data.map((item) => processItem(item));
  }, [data]);

  // 콜백 메모이제이션
  const handleClick = useCallback(
    (id) => {
      onUpdate(id);
    },
    [onUpdate],
  );

  return <div>{/* 컴포넌트 내용 */}</div>;
});
```

### 코드 품질 관리

#### ESLint 설정 (프론트엔드)

```json
// .eslintrc.json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

#### Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2
}
```

### 환경별 설정 관리

#### 백엔드 프로파일

```yaml
# application.yml
spring:
  profiles:
    active: dev

---
# 운영 환경
spring:
  profiles: prod
  datasource:
    url: jdbc:postgresql://${DATABASE_HOST:localhost}:${DATABASE_PORT:5432}/${DATABASE_NAME:testcase_management}
```

---

## 📚 관련 문서

 - **[메인 가이드](../../AGENTS.md)** - 프로젝트 전체 개요
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인
- **[E2E 테스트 가이드](./E2E_TESTING_GUIDE.md)** - E2E 테스트 작성 및 실행
- **[GitHub Actions 가이드](./GITHUB_ACTION_GUIDE.md)** - Docker 빌드 및 배포 자동화
- [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md) - 상세한 Java 백엔드 개발 규칙
- [FastAPI 코딩 가이드라인](./FASTAPI_CODING_GUIDELINES.md) - 상세한 Python/FastAPI 개발 규칙
- [React 코딩 가이드라인](./REACT_CODING_GUIDELINES.md) - 상세한 React 프론트엔드 개발 규칙
