# 테스트케이스 하이브리드 폼 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestCaseHybridForm.jsx` 파일을 기반으로 테스트케이스 하이브리드 폼 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다. 이 컴포넌트는 테스트케이스 입력 모드(개별 폼, 기본 스프레드시트, 고급 스프레드시트)를 전환하는 역할을 합니다.

## 1. 입력 모드 토글

- **`InputModeToggle` 컴포넌트**
  - 역할: 테스트케이스 입력 방식을 전환하는 버튼 그룹.
  - Playwright 선택자 예시: `div[data-testid="input-mode-toggle"]` (실제 구현에 따라 다름)
  - **모드**: `form` (개별 폼), `spreadsheet` (기본 스프레드시트), `advanced-spreadsheet` (고급 스프레드시트)
  - **버튼 텍스트**: 각 모드를 나타내는 텍스트 (예: `폼`, `스프레드시트`, `고급 스프레드시트`)

## 2. 모드에 따른 컴포넌트 렌더링

### 2.1. 개별 폼 모드 (`inputMode === 'form'`)
- **`TestCaseForm` 컴포넌트**
  - 역할: 단일 테스트케이스를 상세하게 입력하고 수정하는 폼.
  - 이 컴포넌트의 상세 요소는 `src/main/frontend/src/components/TestCaseForm.jsx` 파일을 별도로 분석하여 기록합니다.

### 2.2. 기본 스프레드시트 모드 (`inputMode === 'spreadsheet'`)
- **`TestCaseSpreadsheet` 컴포넌트**
  - 역할: 여러 테스트케이스를 스프레드시트 형태로 일괄 입력하고 수정하는 인터페이스.
  - 이 컴포넌트의 상세 요소는 `src/main/frontend/src/components/TestCase/TestCaseSpreadsheet.jsx` 파일을 별도로 분석하여 기록합니다.

### 2.3. 고급 스프레드시트 모드 (`inputMode === 'advanced-spreadsheet'`)
- **`TestCaseDatasheetGrid` 컴포넌트**
  - 역할: 고급 기능을 포함한 스프레드시트 형태의 테스트케이스 관리 인터페이스.
  - 이 컴포넌트의 상세 요소는 `src/main/frontend/src/components/TestCase/TestCaseDatasheetGrid.jsx` 파일을 별도로 분석하여 기록합니다.
