# 테스트 실행 폼 UI 요소

이 문서는 `src/main/frontend/src/components/TestExecutionForm.jsx` 파일을 기반으로 테스트 실행 폼 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 헤더 영역

- **`Typography` (h5) - 제목**
  - 텍스트: `테스트 실행: {execution?.name}` 또는 `테스트 실행 등록`
  - Playwright 선택자 예시: `h5:has-text("테스트 실행")`
- **`Button` - 목록 버튼**
  - 텍스트: `목록`
  - Playwright 선택자 예시: `button:has-text("목록")`
- **`Button` - 취소 버튼**
  - 텍스트: `취소`
  - Playwright 선택자 예시: `button:has-text("취소")`
- **`Button` - 저장 버튼**
  - 텍스트: `저장`
  - Playwright 선택자 예시: `button:has-text("저장")`

## 2. 기본 실행 정보 섹션

- **`TextField` - 실행명**
  - 라벨: `실행명`
  - Playwright 선택자 예시: `input[label="실행명"]`
- **`FormControl` (Select) - 테스트 계획**
  - 라벨: `테스트 계획`
  - Playwright 선택자 예시: `div[label="테스트 계획"]`
  - 옵션: `선택`, 각 테스트 계획 이름
- **`TextField` - 설명**
  - 라벨: `설명`
  - Playwright 선택자 예시: `textarea[label="설명"]`

## 3. 실행 요약 섹션

- **`Paper` 컨테이너**
- **`Typography` (subtitle1) - 실행 정보 제목**
  - 텍스트: `실행 정보`
  - Playwright 선택자 예시: `h6:has-text("실행 정보")`
- **`StatusInfoItem` 컴포넌트**: `상태`, `시작일시`, `종료일시`
- **상태 카운트 칩 (`Chip`)**: `Pass`, `Fail`, `NotRun`, `Blocked`
- **총 항목 수 (`Typography`)**: `총 X 건`
- **진행률 (`LinearProgress`)**: 진행률 바
- **진행률 퍼센트 (`Typography`)**: `X%`
- **`Button` - 실행시작 버튼**: `실행시작`
- **`Button` - 실행완료 버튼**: `실행완료`

## 4. 테스트 케이스 결과 테이블 (페이지네이션)

- **`Paper` 컨테이너**
- **컬럼 헤더**: `폴더/케이스`, `케이스명`, `결과`, `실행일시`, `실행자`, `비고`, `JIRA ID`, `결과입력`, `이전결과`
- **각 테스트 케이스/폴더 행**:
  - 아이콘: `FolderIcon` 또는 `DescriptionIcon`
  - 이름 (`Typography`)
  - 결과 아이콘 (`getResultIcon`)
  - 실행일시 (`Typography`)
  - 실행자 (`Typography`)
  - 비고 (`Typography`)
  - JIRA ID (`Typography` 링크)
  - **`Button` - 결과입력 버튼**: `결과입력`
  - **`Button` - 이전결과 버튼**: `이전결과`
- **페이지 정보 (`Typography`)**: `총 X개 항목 중 Y-Z개 표시`, `페이지 A / B`
- **`Pagination` 컴포넌트**: 페이지네이션 컨트롤

## 5. 테스트 결과 폼 다이얼로그

- **`TestResultForm` 컴포넌트**
  - 역할: 테스트 케이스 결과 입력 폼.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 6. 이전 결과 다이얼로그

- **`PreviousResultsDialog` 컴포넌트**
  - 역할: 특정 테스트 케이스의 이전 실행 결과 목록 표시.
  - **다이얼로그 제목 (`DialogTitle`)**: `이전 실행 결과`
  - **결과 테이블**: `실행일시`, `결과`, `실행ID`, `실행명`, `실행자`, `비고`, `JIRA ID`
  - **닫기 버튼 (`Button`)**: `닫기`

## 7. 스낵바 메시지

- **`Snackbar` 내 `Alert`**: `saveError` 메시지.
