# React 코딩 가이드라인

최종 갱신: 2026-08-23 21:40 KST · 기준 스택: React 18.3 · MUI 7.3 · Vite 7 · Vitest 2

이 문서는 TestCaseCraft 프론트엔드(`src/main/frontend`)의 코딩 스타일과 모범 사례를 정의합니다.

## 📋 목차

1. [디렉토리 구조](#1-디렉토리-구조)
2. [컴포넌트 설계 원칙](#2-컴포넌트-설계-원칙)
3. [상태 관리 (Context API)](#3-상태-관리-context-api)
4. [API 연동 및 서비스 레이어](#4-api-연동-및-서비스-레이어)
5. [UI 및 스타일링 (MUI)](#5-ui-및-스타일링-mui)
6. [다국어 지원 (i18n)](#6-다국어-지원-i18n)
7. [성능 최적화](#7-성능-최적화)
8. [타입 정의 (JSDoc)](#8-타입-정의-jsdoc)
9. [포맷·테스트·검사](#9-포맷테스트검사)

---

## 1. 디렉토리 구조

`src/main/frontend/src` 의 구성은 다음과 같습니다.

| 디렉토리 | 설명 |
| :--- | :--- |
| **`components/`** | UI 컴포넌트. `atoms/`·`molecules/`·`common/`·`navigation/`·`admin/` 과 도메인별 하위 폴더(`TestCase/`·`TestResult/`·`JiraIntegration/`·`RAG/` 등)로 나뉩니다. |
| **`context/`** | 전역 상태용 React Context. **Provider 는 각 Context 파일 안에 함께 정의**되어 있습니다(별도 `providers/` 폴더는 없습니다). |
| **`hooks/`** | 커스텀 훅. RAG 전용 훅은 `hooks/rag/` 하위. |
| **`services/`** | 백엔드 API 호출 서비스와 `apiService`. |
| **`api/`** | 서비스 레이어로 감싸지 않은 소수 엔드포인트 호출(`guidesApi.js`). 새 코드는 `services/` 를 사용합니다. |
| **`utils/`** | 범용 유틸 (날짜 포맷, 트리 변환, 진행률 계산 등). |
| **`types/`** | JSDoc 기반 타입 정의. |
| **`models/`** | 데이터 모델과 도메인 상수. |
| **`constants/`** | 전역 상수 (`colors.js`·`chartColors.js`·`statusColors.js`·`errorCodes.js`·`screenIds.js`·`llmProviders.js`). |
| **`styles/`**, **`theme.js`** | 전역 CSS 와 MUI 테마 정의. |
| **`assets/`** | 이미지·폰트 등 정적 자원. |
| **`test/setup/`** | Vitest 셋업 (`vitest.setup.js`). |

단위 테스트 파일은 별도 폴더로 모으지 않고 **대상 파일 옆에 `*.test.jsx` 로 둡니다**(예: `components/TestCaseForm.test.jsx`).

---

## 2. 컴포넌트 설계 원칙

### 2.1 함수형 컴포넌트 사용

모든 컴포넌트는 **함수형 컴포넌트**로 작성하며 React Hooks 를 사용합니다.

### 2.2 책임의 분리

복잡한 컴포넌트는 책임을 갈라 설계합니다.

- **비즈니스 로직**: 커스텀 훅(`hooks/`)으로 추출
- **하위 UI**: 작은 컴포넌트로 분리
- **Orchestration**: 메인 컴포넌트에서 훅과 하위 컴포넌트를 조합

```jsx
// 복잡한 로직을 훅으로 분리한 예
const TestCaseTree = () => {
  const treeState = useTestCaseTree();   // 상태 및 핸들러
  const actions = useTestCaseActions();  // CRUD 액션

  return (
    <Box>
      <TreeHeader />
      <TreeContent state={treeState} />
      <TreeDialogs actions={actions} />
    </Box>
  );
};
```

### 2.3 Naming Conventions

- **컴포넌트 파일**: PascalCase (예: `TestCaseForm.jsx`)
- **일반 JS 파일**: camelCase (예: `apiService.js`)
- **커스텀 훅**: `use` 접두 + camelCase (예: `useProjectRole.js`)

---

## 3. 상태 관리 (Context API)

전역 상태는 도메인별 Context 로 나눠 두고 `App.jsx` 에서 계층적으로 감쌉니다.

| Context | 담당 |
| :--- | :--- |
| `AuthContext` | 로그인 사용자·토큰·권한 |
| `ProjectContext` | 현재 활성 프로젝트 |
| `TestContext` | 테스트케이스·실행 데이터 |
| `AppContext` | 위 세 개를 묶어 읽는 조합 훅 |
| `I18nContext` | 언어 선택과 `t()` 함수 |
| `ThemeContext` | 라이트·다크 테마 |
| `JiraContext` | Jira 연동 설정·상태 |
| `LlmConfigContext` | LLM 제공자·모델 설정 |
| `RAGContext` | RAG 문서·대화 상태 |
| `SchedulerContext` | 스케줄러 목록 |
| `InputModeContext` | 폼·스프레드시트 입력 모드 |
| `NavModeContext` | 내비게이션 표시 모드 |

컴포넌트에서는 각 Context 가 내보내는 커스텀 훅으로 접근합니다.

```jsx
import { useAppContext } from "../context/AppContext";

const MyComponent = () => {
  const { activeProject, user } = useAppContext();
  // ...
};
```

Context 를 새로 만들기 전에, 이미 있는 열둘 중 하나에 속하는 상태가 아닌지 확인합니다. Provider 계층이 깊어지면 렌더 범위를 추적하기 어려워집니다.

---

## 4. API 연동 및 서비스 레이어

### 4.1 apiService 활용

API 요청 경로가 두 벌 있습니다. **새 코드는 `services/apiService.js`(fetch 기반)를 사용합니다.**

| 경로 | 파일 | 사용 모듈 수 | 처리 내용 |
| :--- | :--- | :--- | :--- |
| **기본** | `services/apiService.js` | 23 | `Authorization` 헤더, `Accept-Language` 헤더, 401 시 `refreshToken` 으로 재발급 후 재시도, 재발급 실패 시 토큰 삭제 + `auth:logout` 이벤트 |
| 레거시 | `utils/axiosInstance.js` | 7 | `Authorization` 헤더, 401 재발급(중복 호출 방지 promise 캐싱), 403 시 `api-error` 이벤트로 스낵바 표시 |

`fetch` 나 `axios` 를 직접 호출하면 위 처리가 전부 빠집니다. 토큰 만료 시점에 요청이 그냥 실패하고, 사용자에게는 원인이 보이지 않습니다.

### 4.2 서비스 클래스 작성

도메인별로 서비스 클래스를 만들고 그 안에 엔드포인트를 정의합니다.

```jsx
// services/testCaseService.js
import apiService from "./apiService.js";

class TestCaseService {
  async getTestCase(id) {
    const response = await apiService.get(`/api/testcases/${id}`);
    return response.json();
  }
}

export default new TestCaseService();
```

식별자는 전부 **UUID 문자열**입니다. 숫자로 가정한 비교·정렬을 넣지 않습니다.

### 4.3 개발 서버 프록시

`npm start`(Vite dev server, 포트 3000)는 `/api` 요청을 `http://localhost:8080` 으로 프록시합니다(`vite.config.js`). 백엔드 주소를 코드에 적지 않습니다.

---

## 5. UI 및 스타일링 (MUI)

### 5.1 Material UI (MUI 7) 사용

기본 UI 는 `@mui/material` 을 쓰고, 스타일은 **`sx` prop** 으로 작성합니다.

```jsx
<Box
  sx={{
    display: "flex",
    padding: 2,
    backgroundColor: (theme) => theme.palette.background.paper,
    "&:hover": { opacity: 0.8 },
  }}
>
  <Typography variant="h6">제목</Typography>
</Box>
```

**`makeStyles`·`withStyles` 는 사용하지 않습니다.** MUI v5 에서 `@mui/styles` 로 분리되고 v7 기준으로는 유지되지 않는 API 입니다. 현재 저장소에 사용처가 없으며, 새로 들이지 않습니다. 재사용할 스타일은 `styled()` 나 테마 `components` 오버라이드로 만듭니다.

주요 데이터 컴포넌트는 `@mui/x-data-grid`·`@mui/x-tree-view`·`@mui/x-date-pickers`(v7)를 사용합니다. 차트는 `recharts` 입니다.

### 5.2 테마 활용

하드코딩한 색상 대신 테마 값을 사용합니다. 라이트·다크 두 모드가 있으므로 고정 색상을 넣으면 다크 모드에서 글자가 배경에 묻힙니다.

- `primary.main`, `secondary.main`
- `error.main`, `warning.main`, `success.main`
- `background.paper`, `text.primary`, `text.secondary`

상태값 색상은 `constants/statusColors.js`, 차트 색상은 `constants/chartColors.js` 에 모여 있습니다. 같은 상태를 화면마다 다른 색으로 칠하지 않으려면 이 두 파일에서 가져옵니다.

---

## 6. 다국어 지원 (i18n)

### 6.1 useTranslation 사용

모든 표시 문자열은 `I18nContext` 의 `t` 함수를 거칩니다. 두 번째 인자는 키가 없을 때 쓰이는 기본값(한국어)입니다.

```jsx
const { t } = useTranslation();

return <Button>{t("common.save", "저장")}</Button>;
```

`t()` 로 감싸지 않은 한국어 문자열은 영어 모드에서 그대로 노출됩니다. 새 문구를 넣을 때는 **작성 시점에** `t("키", "한국어")` 로 쓰고 백엔드 시드에 키를 추가합니다(추가 절차는 [개발 가이드](./DEVELOPMENT_GUIDE.md)의 i18n 절).

### 6.2 키 구조

점으로 구분한 키를 사용합니다 (예: `testcase.form.title`).

### 6.3 날짜·시간 표시

날짜는 직접 포맷하지 않고 `hooks/useDateFormatter.js` 를 사용합니다. 사용자 시간대(`User.timezone`) 설정을 반영해야 하기 때문입니다. `npm run check:dates` 가 직접 포맷한 자리를 찾아냅니다.

---

## 7. 성능 최적화

### 7.1 Memoization

불필요한 리렌더를 막기 위해 `React.memo`·`useMemo`·`useCallback` 을 사용합니다. 리스트 아이템 컴포넌트는 `memo` 로 감싸는 것을 권장합니다.

### 7.2 Virtualization

대량 데이터를 표시하는 트리·리스트는 **`@tanstack/react-virtual`** 로 가상화합니다. 표 형태는 `@mui/x-data-grid` 의 자체 가상화를 사용합니다.

---

## 8. 타입 정의 (JSDoc)

TypeScript 대신 JSDoc 으로 구조를 명시하고 자동 완성을 확보합니다.

```jsx
/**
 * @typedef {Object} TestCase
 * @property {string} id - 고유 ID (UUID)
 * @property {string} name - 이름
 * @property {'folder'|'testcase'} type - 타입
 */
```

---

## 9. 포맷·테스트·검사

```bash
cd src/main/frontend

npm start              # 개발 서버 (포트 3000, /api → 8080 프록시)
npm run build          # 프로덕션 빌드 (결과물 build/)

npm test               # Vitest 단위 테스트 1회 실행
npm run test:watch     # Vitest 감시 모드

npm run format         # Prettier 로 정렬
npm run format:check   # 정렬 여부만 검사 (CI 와 동일)
npm run check:dates    # 날짜 포맷 직접 작성 자리 검출
```

### CI 게이트

`.github/workflows/frontend-tests.yml` 이 `src/main/frontend/**` 변경이 담긴 PR 과 master push 에서 **`format:check` 와 `npm test` 를 강제**합니다(Node 24). 정렬이 어긋나면 병합 전에 막히므로 커밋 전에 `npm run format` 을 돌립니다.

### 테스트 작성

- 도구: Vitest + `@testing-library/react` + `@testing-library/user-event`, 환경은 jsdom
- 위치: 대상 파일 옆 `*.test.jsx` (`include: src/**/*.{test,spec}.{js,jsx}`)
- Jest 가 아니므로 `jest.fn()` 대신 `vi.fn()`, `jest.mock()` 대신 `vi.mock()` 을 사용합니다. `globals: true` 라 `describe`·`it`·`expect` 는 import 없이 쓸 수 있습니다.

### 환경 변수

Vite 이므로 `process.env` 가 아니라 **`import.meta.env`** 를 사용합니다.

```jsx
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}
```

노출할 값은 `VITE_` 접두가 필요합니다(예: `VITE_API_BASE_URL`). 접두 없는 변수는 빌드 결과에 들어가지 않습니다.

---

## 💡 개발 팁

- **Custom Hooks**: 복잡한 `useEffect` 나 상태 로직은 커스텀 훅으로 분리합니다.
- **Error Handling**: 전역 스낵바는 `App.jsx` 가 `api-error` 이벤트를 받아 띄웁니다. 이 이벤트를 발행하는 것은 `utils/axiosInstance.js` 이고, `apiService` 는 인증 실패 시 `auth:logout` 을 발행합니다. 컴포넌트마다 스낵바를 따로 만들지 않고, 필요하면 `api-error` 를 발행합니다.
- **화면 ID**: 화면을 추가하면 `constants/screenIds.js` 를 포함해 화면 ID 정의 일곱 곳을 함께 고칩니다(목록은 프로젝트 `CLAUDE.md` 의 화면 커버리지 감사 절).
- **회귀 확인**: 컴포넌트를 바꾼 뒤 `src/test/e2e` 의 Playwright 시나리오를 돌려 확인합니다.

---

## 📚 관련 문서

- [개발 가이드](./DEVELOPMENT_GUIDE.md): 환경 설정 및 워크플로우
- [E2E 테스트 가이드](./E2E_TESTING_GUIDE.md): Playwright 시나리오 테스트
- [API 개발 가이드](./API_GUIDE.md): 백엔드 계약
