# JIRA 설정 다이얼로그 UI 요소

이 문서는 `src/main/frontend/src/components/JiraSettings/JiraConfigDialog.jsx` 파일을 기반으로 JIRA 설정 다이얼로그 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
- **`DialogTitle`**: `JIRA 설정 수정` 또는 `JIRA 설정 추가`
- **`DialogContent`**
- **`DialogActions`**

## 2. 폼 필드

- **`TextField` - JIRA 서버 URL**: `JIRA 서버 URL` 라벨, `LinkIcon`
- **`TextField` - 사용자명 (이메일)**: `사용자명 (이메일)` 라벨
- **`TextField` - API 토큰**: `API 토큰` 라벨, `Visibility` / `VisibilityOff` 토글
- **`TextField` - 테스트 프로젝트 키 (선택사항)**: `테스트 프로젝트 키 (선택사항)` 라벨

## 3. 설정 및 액션

- **저장 전 자동 연결 테스트 스위치 (`FormControlLabel` 내 `Switch`)**: `저장 전 자동으로 연결 테스트 수행`
- **연결 테스트 버튼 (`Button` with `RefreshIcon`)**: `연결 테스트`
- **연결 상태 표시 (`Alert`)**: `연결 성공` 또는 `연결 실패` 메시지, JIRA 버전, 테스트 시각.
- **사용 가능한 프로젝트 목록 (`List`)**: `사용 가능한 프로젝트:` 제목, 각 프로젝트의 키, 이름, 설명.
- **API 토큰 생성 안내 (`Alert`)**: `API 토큰 생성 방법:` 안내.

## 4. 다이얼로그 액션 버튼

- **취소 버튼 (`Button`)**: `취소`
- **저장 버튼 (`Button`)**: `저장`
