---
name: frontend-react-mui
description: "Use when creating or modifying React 18 UI components, Material-UI(MUI) layouts, state management, or Axios API client code for the testcasecraft frontend."
---

# React 18 & MUI 프론트엔드 개발 표준 스킬

`testcasecraft`의 프론트엔드(`src/main/frontend/src/`) 개발 시 이 스킬 가이드를 따르십시오.

## 1. 코딩 가이드라인 준수

모든 프론트엔드 코드는 `docs/code-guide-line/REACT_CODING_GUIDELINES.md`를 엄격하게 준수해야 합니다.

- React Context API를 통한 전역 상태(Context) 관리 규격을 따릅니다.
- MUI (`@mui/material`) 컴포넌트를 우선적으로 사용하여 디자인 일관성을 유지합니다.

## 2. 컴포넌트 및 API 통신 구조

- **API 분리**: API 통신 코드는 컴포넌트 내부에 직접 작성하지 않고, `src/services/` 폴더에 모듈화하여 `Axios` 인스턴스를 사용합니다.
- **에러 핸들링**: 백엔드에서 내려오는 다국어 에러 메시지 형식이나 HTTP 상태 코드(400, 401, 500 등)를 컴포넌트 단에서 catch하여 Snackbar/Dialog 등으로 우아하게 노출해야 합니다.

## 3. 코드 컨벤션 및 린팅 방지

- 모든 코드는 `npm run lint` 시 경고가 발생하지 않도록 의존성 배열(`useEffect` dependency) 및 변수 선언(unused variables 방지)에 신경 씁니다.
- HTML 시맨틱 요소와 ARIA 라벨을 활용하여 a11y(접근성) 웹 표준을 준수합니다.
