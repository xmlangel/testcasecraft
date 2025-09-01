# 프로필 - JIRA 설정 UI 요소

이 문서는 `src/main/frontend/src/components/UserProfileDialog.jsx` 파일 내의 JIRA 설정 탭에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
- **`DialogTitle`**: `프로필`
- **`DialogContent`**
- **`DialogActions`**

## 2. 탭 내비게이션

- **`Tabs` 컴포넌트**
- **`Tab` - 기본 정보**: `기본 정보`
- **`Tab` - 비밀번호**: `비밀번호`
- **`Tab` - JIRA 설정**: `JIRA 설정`

## 3. JIRA 설정 탭 콘텐츠 (`tabValue === 2`)

- **제목 (`Typography` h6)**: `JIRA 설정`
- **설명 (`Typography` body2)**: `JIRA 연동을 위한 설정을 관리합니다.`
- **JIRA 상태 인디케이터 (`Card` 내 `JiraStatusIndicator` 컴포넌트)**
  - 역할: 현재 JIRA 연동 상태를 표시.
  - 이 컴포넌트의 상세 요소는 `JiraIntegration/JiraStatusIndicator.jsx` 파일을 별도로 분석하여 기록합니다.
- **설정 수정 버튼 (`Button`)**: `설정 수정` (기존 설정이 있을 때만 표시)
- **설정 삭제 버튼 (`Button`)**: `설정 삭제` (기존 설정이 있을 때만 표시)

## 4. JIRA 설정 다이얼로그

- **`JiraConfigDialog` 컴포넌트**
  - 역할: JIRA 서버 URL, 사용자명, API 토큰 등 JIRA 연동 설정을 입력하고 저장하는 다이얼로그.
  - 이 컴포넌트의 상세 요소는 `JiraSettings/JiraConfigDialog.jsx` 파일을 별도로 분석하여 기록합니다.

## 5. 공통 에러/성공 메시지

- **`Alert` 컴포넌트**: `error` 메시지 표시.
- **`Alert` 컴포넌트**: `success` 메시지 표시.
