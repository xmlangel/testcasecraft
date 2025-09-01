# 상단 메뉴 (글로벌 내비게이션) UI 요소

이 문서는 `src/main/frontend/src/App.jsx` 파일에 정의된 상단 메뉴(AppBar/Toolbar)의 주요 UI 요소를 식별하고 기록합니다.

## 1. 앱 바 (AppBar) 및 툴바 (Toolbar)

- **`AppBar`**
  - 역할: 애플리케이션의 최상단 바.
  - Playwright 선택자 예시: `header.MuiAppBar-root`
- **`Toolbar`**
  - 역할: 앱 바 내의 콘텐츠를 정렬하는 컨테이너.
  - Playwright 선택자 예시: `div.MuiToolbar-root`

## 2. 애플리케이션 제목

- **`Typography` (h6) - 애플리케이션 이름**
  - 텍스트: `TestCaseCraft`
  - Playwright 선택자 예시: `h6:has-text("TestCaseCraft")`

## 3. 내비게이션 버튼

- **`Button` - 대시보드**
  - 텍스트: `대시보드`
  - Playwright 선택자 예시: `button:has-text("대시보드")`
- **`Button` - 조직 관리**
  - 텍스트: `조직 관리`
  - 조건부 렌더링: `hasManagementAccess(user)`
  - Playwright 선택자 예시: `button:has-text("조직 관리")`
- **`Button` - 사용자 관리**
  - 텍스트: `사용자 관리`
  - 조건부 렌더링: `hasManagementAccess(user)`
  - Playwright 선택자 예시: `button:has-text("사용자 관리")`
- **`Button` - 다국어 관리**
  - 텍스트: `다국어 관리`
  - 조건부 렌더링: `user?.role === 'ADMIN'`
  - Playwright 선택자 예시: `button:has-text("다국어 관리")`
- **`Button` - 프로젝트 선택**
  - 텍스트: `프로젝트 선택`
  - Playwright 선택자 예시: `button:has-text("프로젝트 선택")`

## 4. 언어 선택기

- **`LanguageSwitcher` 컴포넌트**
  - 역할: 애플리케이션 언어를 변경하는 기능 제공.
  - Playwright 선택자 예시: `div[data-testid="language-switcher"]` (실제 구현에 따라 다름)

## 5. JIRA 상태 인디케이터

- **`JiraStatusIndicator` 컴포넌트**
  - 역할: JIRA 연동 상태를 표시.
  - Playwright 선택자 예시: `div[data-testid="jira-status-indicator"]` (실제 구현에 따라 다름)

## 6. 사용자 메뉴

- **`IconButton` - 사용자 아바타**
  - 역할: 사용자 메뉴를 열기 위한 버튼.
  - Playwright 선택자 예시: `button[aria-label="user menu"]` 또는 `div.MuiAvatar-root`
- **`Menu` 컴포넌트**
  - 역할: 사용자 아바타 클릭 시 나타나는 드롭다운 메뉴.
  - Playwright 선택자 예시: `ul.MuiMenu-list`
  - **`MenuItem` - 프로필**
    - 텍스트: `프로필`
    - Playwright 선택자 예시: `li:has-text("프로필")`
  - **`MenuItem` - 로그아웃**
    - 텍스트: `로그아웃`
    - Playwright 선택자 예시: `li:has-text("로그아웃")`
