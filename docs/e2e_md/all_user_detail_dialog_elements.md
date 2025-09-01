# 사용자 상세 정보 다이얼로그 UI 요소

이 문서는 `src/main/frontend/src/components/UserManagement/UserDetailDialog.jsx` 파일을 기반으로 사용자 상세 정보 다이얼로그에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
  - 역할: 사용자 상세 정보를 표시하고 편집하는 모달 다이얼로그의 최상위 컨테이너.
  - Playwright 선택자 예시: `div.MuiDialog-root`
- **`DialogTitle`**
  - 역할: 다이얼로그의 제목 영역. 사용자 이름, 사용자명, 액션 버튼 포함.
  - Playwright 선택자 예시: `h2.MuiDialogTitle-root`
- **`DialogContent`**
  - 역할: 사용자 상세 정보의 주요 내용 영역.
  - Playwright 선택자 예시: `div.MuiDialogContent-root`
- **`DialogActions`**
  - 역할: 다이얼로그 하단의 액션 버튼 영역.
  - Playwright 선택자 예시: `div.MuiDialogActions-root`

## 2. 다이얼로그 제목 영역 (사용자 헤더 및 액션 버튼)

- **사용자 아바타 (`Avatar`)**
  - 역할: 사용자의 역할 아이콘과 이니셜 표시.
  - Playwright 선택자 예시: `div.MuiAvatar-root`
- **사용자 이름 (`Typography` h6)**
  - 텍스트: `user.name`
  - Playwright 선택자 예시: `h6.MuiTypography-h6`
- **사용자명 (`Typography` body2)**
  - 텍스트: `@user.username`
  - Playwright 선택자 예시: `p.MuiTypography-body2`
- **액션 버튼 (편집 모드에 따라 조건부 렌더링)**
  - **편집 모드 (`isEditing`이 true일 때)**
    - **저장 버튼 (`IconButton` with `SaveIcon`)**: `저장`
    - **취소 버튼 (`IconButton` with `CancelIcon`)**: `취소`
  - **보기 모드 (`isEditing`이 false일 때)**
    - **편집 버튼 (`IconButton` with `EditIcon`)**: `편집`
    - **비밀번호 변경 버튼 (`IconButton` with `SecurityIcon`)**: `비밀번호 변경`

## 3. 에러 메시지

- **`Alert` 컴포넌트**
  - 역할: 로컬 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 4. 기본 정보 섹션

- **`Card` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiCard-root` (이 섹션의 카드)
- **섹션 제목 (`Typography` h6)**: `기본 정보`
- **이름 (`TextField`)**: `이름` 라벨, `PersonIcon`
- **이메일 (`TextField`)**: `이메일` 라벨, `EmailIcon`
- **역할 (`FormControl` 내 `Select`)**: `역할` 라벨, `Select` 옵션 (멤버, 관리자 등)
- **계정 활성화 (`FormControlLabel` 내 `Switch`)**: `계정 활성화` 라벨.

## 5. 상태 정보 섹션

- **`Card` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiCard-root` (이 섹션의 카드)
- **섹션 제목 (`Typography` h6)**: `상태 정보`
- **역할 (`ListItem`)**: `SecurityIcon`과 함께 역할 `Chip` 표시.
- **계정 상태 (`ListItem`)**: `CheckCircleIcon` 또는 `BlockIcon`과 함께 계정 상태 `Chip` 표시.
- **활동 상태 (`ListItem`)**: `HistoryIcon`과 함께 활동 상태 `Chip` 표시 (조건부 렌더링).

## 6. 시간 정보 섹션

- **`Card` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiCard-root` (이 섹션의 카드)
- **섹션 제목 (`Typography` h6)**: `시간 정보`
- **가입일 (`ListItem`)**: `TimeIcon`과 함께 가입일 표시.
- **최종 수정일 (`ListItem`)**: `TimeIcon`과 함께 최종 수정일 표시.
- **최종 로그인 (`ListItem`)**: `TimeIcon`과 함께 최종 로그인 시간 표시.
- **미접속 일수 (`ListItem`)**: `InfoIcon`과 함께 미접속 일수 표시 (조건부 렌더링).

## 7. 다이얼로그 액션 버튼

- **닫기 버튼 (`Button`)**: `닫기`
- **저장 버튼 (`Button`)**: `저장` (편집 모드일 때만 표시).

## 8. 확인 다이얼로그

- **`ConfirmDialog` 컴포넌트**
  - 역할: 사용자에게 확인을 요청하는 모달 다이얼로그 (예: 편집 취소 시).
  - Playwright 선택자 예시: `div.MuiDialog-root` (ConfirmDialog의 내부 구조에 따라 다름)

## 9. 비밀번호 변경 다이얼로그

- **`AdminPasswordChangeDialog` 컴포넌트**
  - 역할: 관리자가 사용자의 비밀번호를 변경할 수 있는 모달 다이얼로그.
  - Playwright 선택자 예시: `div.MuiDialog-root` (AdminPasswordChangeDialog의 내부 구조에 따라 다름)
