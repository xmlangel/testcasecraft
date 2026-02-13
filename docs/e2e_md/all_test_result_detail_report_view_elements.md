# 테스트 결과 상세 리포트 뷰 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultDetailReportView.jsx` 파일을 기반으로 테스트 결과 상세 리포트 뷰 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 헤더 영역

- **제목 (`Typography` h5)**: `상세 리포트`
- **새로고침 버튼 (`Button` with `RefreshIcon`)**: `새로고침`
- **내보내기 버튼 (`Button` with `FileDownloadIcon`)**: `내보내기`

## 2. 통계 카드

- **`Grid` 내 `Card`**: `총 테스트 케이스`, `실행률`, `통과율`, `평균 실행시간`
  - **제목 (`Typography`)**: 각 통계의 제목
  - **값 (`Typography`)**: 각 통계의 값
  - **아이콘**: `AssessmentIcon`, `TimelineIcon`, `PieChartIcon`, `BarChartIcon`

## 3. 필터 프리셋 관리자

- **`DetailReportPresetManager` 컴포넌트**
  - 역할: 필터 프리셋을 관리하고 적용하는 기능 제공.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 4. 고급 필터 패널

- **`Paper` 내 `Accordion`**: `고급 필터`
  - **`AccordionSummary`**: `고급 필터` 제목, `필터 적용됨` 칩 (필터 적용 시)
  - **`AccordionDetails`**: 필터 옵션들
    - **검색 필터**: `통합 검색` (`TextField`), `테스트 결과` (`Select`)
    - **날짜 필터**: `시작 날짜` (`TextField`), `종료 날짜` (`TextField`)
    - **고급 옵션**: `비고 있음` (`Checkbox`), `JIRA 이슈 연결됨` (`Checkbox`), `최근 7일 이내` (`Checkbox`)
    - **복합 검색 조건**: `제외할 검색어` (`TextField`), `날짜 범위` (`Select`), `정규표현식 사용` (`Checkbox`), `대소문자 구분` (`Checkbox`), `완전 일치` (`Checkbox`)
    - **성능 최적화**: `가상 스크롤링` (`Checkbox`), `지연 로딩` (`Checkbox`), `캐시 초기화` (`Button`)
    - **필터 액션**: `검색` (`Button`), `초기화` (`Button`)

## 5. 데이터 그리드

- **`Paper` 내 `DataGrid`**: 테스트 결과 상세 목록 표시.
  - **컬럼 헤더**: `폴더`, `테스트케이스`, `결과`, `실행 일시`, `실행자`, `비고`, `JIRA`, `JIRA 상태` (가시성 설정에 따라 추가 컬럼 표시)
  - **행 없음 오버레이**: `조건에 맞는 테스트 결과가 없습니다` 메시지 및 `필터 초기화` 버튼.
  - **로딩 오버레이**: `데이터를 불러오는 중...` 메시지.

## 6. JIRA 연동 리포트 섹션

- **`JiraIntegrationReportSection` 컴포넌트**
  - 역할: JIRA 연동 관련 리포트 섹션.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 7. 테스트 결과 추이 섹션

- **`TestResultTrendSection` 컴포넌트**
  - 역할: 테스트 결과 추이 분석 섹션.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 8. 내보내기 다이얼로그

- **`TestResultExportDialog` 컴포넌트**
  - 역할: 테스트 결과 내보내기 기능 제공.
  - 이 컴포넌트의 상세 요소는 `new-e2e/all_test_result_export_dialog_elements.md` 파일을 참조하세요.
