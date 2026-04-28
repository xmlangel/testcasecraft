# React 코딩 가이드라인 (최종 업데이트: 2026-04-28)

이 문서는 TestCaseCraft 프로젝트의 React 프론트엔드 개발을 위한 코딩 스타일과 모범 사례를 정의합니다. 모든 프론트엔드 코드는 이 가이드라인을 준수해야 합니다.

## 📋 목차

1. [디렉토리 구조](#1-디렉토리-구조)
2. [컴포넌트 설계 원칙](#2-컴포넌트-설계-원칙)
3. [상태 관리 (Context API)](#3-상태-관리-context-api)
4. [API 연동 및 서비스 레이어](#4-api-연동-및-서비스-레이어)
5. [UI 및 스타일링 (MUI)](#5-ui-및-스타일링-mui)
6. [다국어 지원 (i18n)](#6-다국어-지원-i18n)
7. [성능 최적화](#7-성능-최적화)
8. [타입 정의 (JSDoc)](#8-타입-정의-jsdoc)

---

## 1. 디렉토리 구조

`src/main/frontend/src` 디렉토리의 표준 구성은 다음과 같습니다.

| 디렉토리 | 설명 |
| :--- | :--- |
| **`components/`** | 재사용 가능한 UI 컴포넌트. 복잡한 컴포넌트는 하위 디렉토리로 구성. |
| **`context/`** | 전역 상태 관리를 위한 React Context 및 Providers. |
| **`hooks/`** | 비즈니스 로직 및 공통 기능을 위한 커스텀 훅. |
| **`services/`** | 백엔드 API 호출을 담당하는 서비스 클래스 및 `apiService`. |
| **`utils/`** | 범용 유틸리티 함수 (날짜 포맷팅, 트리 변환 등). |
| **`types/`** | JSDoc 기반의 타입 정의 파일. |
| **`constants/`** | 전역적으로 사용되는 상수 (컬러, 상태값 등). |
| **`styles/`** | 전역 CSS 및 MUI 테마 설정. |

---

## 2. 컴포넌트 설계 원칙

### 2.1 함수형 컴포넌트 사용
모든 컴포넌트는 **함수형 컴포넌트(Functional Components)**로 작성하며, React Hooks를 활용합니다.

### 2.2 책임의 분리 (Separation of Concerns)
복잡한 컴포넌트는 다음과 같이 책임을 분리하여 설계합니다.
- **비즈니스 로직**: 커스텀 훅(`hooks/`)으로 추출.
- **하위 UI**: 작은 단위의 컴포넌트로 분리.
- **Orchestration**: 메인 컴포넌트에서 훅과 하위 컴포넌트를 조합.

```jsx
// 예시: 복잡한 로직을 훅으로 분리
const TestCaseTree = () => {
  const treeState = useTestCaseTree(); // 상태 및 핸들러 로직
  const actions = useTestCaseActions(); // CRUD 액션 로직

  return (
    <Box>
      <TreeHeader {...} />
      <TreeContent state={treeState} />
      <TreeDialogs actions={actions} />
    </Box>
  );
};
```

### 2.3 Naming Conventions
- **컴포넌트 파일**: PascalCase (예: `TestCaseForm.jsx`)
- **일반 JS 파일**: camelCase (예: `apiService.js`)
- **컴포넌트 이름**: PascalCase

---

## 3. 상태 관리 (Context API)

프로젝트는 **Provider Composition** 패턴을 사용하여 전역 상태를 관리합니다.

### 3.1 Provider 구성
`AppProvider`는 여러 도메인별 Provider를 계층적으로 래핑합니다.
- `AuthProvider`: 사용자 인증 상태
- `ProjectProvider`: 현재 활성화된 프로젝트 정보
- `TestProvider`: 테스트 케이스 및 실행 데이터

### 3.2 Context 사용
컴포넌트에서는 정의된 커스텀 훅을 통해 Context에 접근합니다.

```jsx
import { useAppContext } from "./context/AppContext";

const MyComponent = () => {
  const { activeProject, user } = useAppContext();
  // ...
};
```

---

## 4. API 연동 및 서비스 레이어

### 4.1 apiService 활용
모든 API 요청은 `apiService.js`를 통해 수행됩니다. 이 서비스는 다음과 같은 기능을 자동으로 처리합니다.
- `Authorization` 헤더 자동 추가 (Bearer Token)
- `Accept-Language` 헤더 추가
- 401 에러 시 토큰 자동 갱신 (Silent Refresh)

### 4.2 서비스 클래스 작성
각 도메인(TestCase, Project 등)별로 서비스 클래스를 작성하여 API 엔드포인트를 관리합니다.

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

---

## 5. UI 및 스타일링 (MUI)

### 5.1 Material UI (MUI) 사용
기본 UI 컴포넌트는 `@mui/material`을 사용하며, 스타일링은 주로 `sx` prop을 활용합니다.

```jsx
<Box
  sx={{
    display: 'flex',
    padding: 2,
    backgroundColor: (theme) => theme.palette.background.paper,
    '&:hover': { opacity: 0.8 }
  }}
>
  <Typography variant="h6">제목</Typography>
</Box>
```

### 5.2 테마 활용
하드코딩된 색상보다는 테마(`theme.palette`)의 정의된 색상을 사용합니다.
- `primary.main`, `secondary.main`
- `error.main`, `warning.main`, `success.main`

---

## 6. 다국어 지원 (i18n)

### 6.1 useTranslation 사용
모든 텍스트는 직접 입력하지 않고 `I18nContext`의 `t` 함수를 사용하여 처리합니다.

```jsx
const { t } = useTranslation();

return <Button>{t("common.save", "저장")}</Button>;
```

### 6.2 키 구조
계층 구조를 가진 키를 사용하여 관리합니다 (예: `testcase.form.title`).

---

## 7. 성능 최적화

### 7.1 Memoization
불필요한 리렌더링을 방지하기 위해 `React.memo`, `useMemo`, `useCallback`을 적절히 사용합니다.
- 리스트 아이템 컴포넌트는 반드시 `memo`로 래핑하는 것을 권장합니다.

### 7.2 Virtualization
대량의 데이터를 표시하는 트리나 리스트(예: `TestCaseTree`)는 `react-virtual` 등을 활용한 가상화 기술을 적용합니다.

---

## 8. 타입 정의 (JSDoc)

TypeScript 대신 JSDoc을 사용하여 객체의 구조를 명시하고 자동 완성을 지원합니다.

```jsx
/**
 * @typedef {Object} TestCase
 * @property {string} id - 고유 ID
 * @property {string} name - 이름
 * @property {'folder'|'testcase'} type - 타입
 */

/** @type {TestCase} */
const testCase = { ... };
```

---

## 💡 개발 팁

- **Custom Hooks**: 복잡한 `useEffect`나 상태 관리 로직은 반드시 커스텀 훅으로 분리하여 가독성을 높입니다.
- **Error Handling**: API 호출 시 발생하는 에러는 전역 `api-error` 이벤트를 통해 스낵바로 표시되도록 `apiService`에서 처리됩니다.
- **Testing**: 컴포넌트 변경 시 E2E 테스트(`src/test/e2e`)를 실행하여 회귀 오류가 없는지 확인하세요.
