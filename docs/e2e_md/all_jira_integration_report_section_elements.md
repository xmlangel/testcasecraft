# JIRA 연동 리포트 섹션 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/JiraIntegrationReportSection.jsx` 파일을 기반으로 JIRA 연동 리포트 섹션 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 아코디언 구조

- **`Accordion` 컴포넌트**
- **`AccordionSummary`**: `JIRA 연동 리포트` 제목, `RefreshIcon` 버튼.

## 2. 아코디언 상세 내용 (확장 시 콘텐츠)

### 2.1. 요약 카드
- **`Grid` 내 `Card`**: `연결된 케이스`, `미연결 케이스`, `총 JIRA 이슈`, `연동률`
  - **아이콘**: `LinkIcon`, `LinkOffIcon`, `AssignmentIcon`, `CheckCircleIcon`
  - **값 (`Typography` h6)**: 각 지표의 숫자 또는 퍼센트 값.
  - **라벨 (`Typography` body2)**: 각 지표의 설명.

### 2.2. 상태 차트
- **`Paper` 내 `Typography`**: `JIRA 상태별 분포` (파이 차트)
- **`Paper` 내 `Typography`**: `상태별 케이스 수` (바 차트)
- **`Alert`**: `JIRA 연동 데이터가 없습니다.`

### 2.3. JIRA 이슈 상세
- **`Typography` h6**: `JIRA 이슈 상세`
- **`Alert`**: `연결된 JIRA 이슈가 없습니다.`
- **이슈 상세 테이블 (`TableContainer` 내 `Table`)**
  - **테이블 헤더**: `JIRA 이슈`, `상태`, `연결된 케이스`, `Pass`, `Fail`, `기타`, `액션`
  - **각 이슈 행**: `BugReportIcon`, 이슈 키, 상태 칩, 연결된 케이스 수, Pass/Fail/기타 결과 칩, `OpenInNewIcon` 버튼.

### 2.4. 미연결 테스트 케이스
- **`Typography` h6**: `미연결 테스트 케이스`
- **`Alert`**: `모든 테스트 케이스가 JIRA 이슈와 연결되어 있습니다.`
- **`Alert`**: `X개의 테스트 케이스가 JIRA 이슈와 연결되지 않았습니다.`
- **미연결 케이스 테이블 (`TableContainer` 내 `Table`)**
  - **테이블 헤더**: `폴더 경로`, `테스트 케이스`, `결과`, `실행 일시`
  - **각 케이스 행**: 폴더 경로, 테스트 케이스명, 결과 칩, 실행 일시.
- **`Typography`**: `... 및 X개 더` (10개 초과 시).
