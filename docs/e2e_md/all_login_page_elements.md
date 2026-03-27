# 로그인 페이지의 모든 UI 요소

이 문서는 `src/main/frontend/src/components/Login.jsx` 파일을 기반으로 로그인 페이지에 존재하는 모든 주요 UI 요소를 식별하고 기록합니다. Playwright를 사용하여 페이지를 검사할 때 발견할 수 있는 요소들을 포함합니다.

## 1. 페이지 구조 및 컨테이너

- **`Box` (최상위 컨테이너)**

  - 역할: 전체 페이지 레이아웃 (중앙 정렬, 배경색)
  - Playwright 선택자 예시: `body > div` 또는 `div[style*="min-height: 100vh"]`

- **`Paper` (로그인/회원가입 폼 컨테이너)**
  - 역할: 폼을 감싸는 카드 형태의 UI
  - Playwright 선택자 예시: `div.MuiPaper-root`

## 2. 언어 전환 버튼

- **`Box` (언어 전환 버튼 컨테이너)**
  - 역할: 언어 전환 버튼을 우상단에 배치
  - Playwright 선택자 예시: `div[style*="position: absolute"]`
- **`LanguageSwitcher` 컴포넌트**
  - 역할: 언어 변경 기능 제공
  - Playwright 선택자 예시: `button[aria-label="Language switcher"]` (실제 구현에 따라 다름)

## 3. 폼 제목

- **`Typography` (h5)**
  - 텍스트: `로그인` 또는 `회원가입` (현재 모드에 따라)
  - Playwright 선택자 예시: `h5.MuiTypography-h5` 또는 `h5:has-text("로그인")`

## 4. 입력 필드 (TextField 컴포넌트)

### 4.1. 아이디 (Username)

- **라벨 텍스트**: `아이디`
- **`name` 속성**: `username`
- **Playwright 선택자 예시**: `input[name="username"]` 또는 `label:has-text("아이디") + input`

### 4.2. 비밀번호 (Password)

- **라벨 텍스트**: `비밀번호`
- **`name` 속성**: `password`
- **`type` 속성**: `password`
- **Playwright 선택자 예시**: `input[name="password"]` 또는 `label:has-text("비밀번호") + input`

### 4.3. 회원가입 모드 전용 필드 (mode === 'register' 일 때만 표시)

- **비밀번호 확인 (Confirm Password)**
  - 라벨 텍스트: `비밀번호 확인`
  - `name` 속성: `confirm`
  - `type` 속성: `password`
  - Playwright 선택자 예시: `input[name="confirm"]`
- **이름 (Name)**
  - 라벨 텍스트: `이름`
  - `name` 속성: `name`
  - Playwright 선택자 예시: `input[name="name"]`
- **이메일 (Email)**
  - 라벨 텍스트: `이메일`
  - `name` 속성: `email`
  - Playwright 선택자 예시: `input[name="email"]`

## 5. 메시지 표시 영역 (Alert 컴포넌트)

- **에러 메시지 (Error Alert)**
  - 역할: 로그인/회원가입 실패 시 에러 메시지 표시
  - Playwright 선택자 예시: `div.MuiAlert-standardError`
- **정보/성공 메시지 (Info/Success Alert)**
  - 역할: 회원가입 성공 등 정보성 메시지 표시
  - Playwright 선택자 예시: `div.MuiAlert-standardSuccess`

## 6. 버튼

### 6.1. 로그인 모드 버튼 (mode === 'login' 일 때만 표시)

- **로그인 버튼 (Login Button)**
  - 텍스트: `로그인`
  - `type` 속성: `submit`
  - Playwright 선택자 예시: `button:has-text("로그인")`
- **회원가입 버튼 (Register Button)**
  - 텍스트: `회원가입`
  - Playwright 선택자 예시: `button:has-text("회원가입")`

### 6.2. 회원가입 모드 버튼 (mode === 'register' 일 때만 표시)

- **회원가입 버튼 (Register Button)**
  - 텍스트: `회원가입`
  - `type` 속성: `submit`
  - Playwright 선택자 예시: `button:has-text("회원가입")`
- **로그인으로 돌아가기 버튼 (Back to Login Button)**
  - 텍스트: `로그인으로 돌아가기`
  - Playwright 선택자 예시: `button:has-text("로그인으로 돌아가기")`

## 7. 로딩 인디케이터

- **`CircularProgress` 컴포넌트**
  - 역할: 로그인/회원가입 처리 중 로딩 스피너 표시
  - Playwright 선택자 예시: `span.MuiCircularProgress-root`
