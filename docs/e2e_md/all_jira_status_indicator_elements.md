# JIRA 상태 인디케이터 UI 요소

이 문서는 `src/main/frontend/src/components/JiraIntegration/JiraStatusIndicator.jsx` 파일을 기반으로 JIRA 연결 상태를 표시하는 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 컴팩트 모드 (`compact = true`)

- **`Chip` 컴포넌트**: `JIRA` 라벨, 상태 아이콘 (로딩, 경고, 성공, 에러), 색상.
  - **툴팁**: 상세 상태 메시지.
  - **클릭 가능**: `showDetails`가 true일 때 팝오버 열기.
- **로딩 스피너 (`CircularProgress`)**: 새로고침 중일 때 표시.
- **팝오버 (Chip 클릭 시 열림)**
  - **제목 (`Typography` subtitle1)**: `JIRA 연결 상태`
  - **상태 아이콘 및 텍스트 (`Typography`)**: `확인 중...`, `JIRA 미설정`, `연결됨`, `연결 실패`
  - **상세 상태 텍스트 (`Typography`)**: `JIRA 서버와 정상적으로 연결되었습니다.` 등.
  - **연결 정보 (`Typography`)**: `서버:`, `사용자:`, `마지막 확인:`, `업데이트:`
  - **새로고침 버튼 (`Button` with `RefreshIcon`)**: `새로고침`
  - **설정 버튼 (`Button` with `SettingsIcon`)**: `설정`

## 2. 전체 모드 (`compact = false`)

- **상태 아이콘 및 제목 (`Typography` h6)**: `JIRA 연결 상태`
- **상태 칩 (`Chip`)**: `JIRA 미설정`, `연결됨`, `연결 실패`
- **액션 버튼들**
  - **새로고침 버튼 (`IconButton` with `RefreshIcon`)**: `상태 새로고침` 툴팁.
  - **JIRA 설정 버튼 (`IconButton` with `SettingsIcon`)**: `JIRA 설정` 툴팁.
- **상세 상태 메시지 (`Alert`)**: `JIRA 서버와 정상적으로 연결되었습니다.` 등.
- **연결 정보 (`Box`)**: `서버:`, `사용자:`, `마지막 테스트:`, `마지막 업데이트:`
- **JIRA 설정 안내 (`Alert`)**: `JIRA와 연동하려면 먼저 설정을 완료해주세요.`
  - **JIRA 설정하기 버튼 (`Button` with `SettingsIcon`)**: `JIRA 설정하기`
