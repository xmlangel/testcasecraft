# 테스트 결과 트렌드 섹션 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultTrendSection.jsx` 파일을 기반으로 테스트 결과 트렌드 섹션 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 아코디언 구조

- **`Accordion` 컴포넌트**
- **`AccordionSummary`**: `트렌드 분석` 제목, `RefreshIcon` 버튼.

## 2. 아코디언 상세 내용 (확장 시 콘텐츠)

### 2.1. 컨트롤 패널
- **기간 선택 (`FormControl` 내 `Select`)**: `기간` 라벨, 옵션 (`최근 7일`, `최근 30일`, `최근 90일`)
- **단위 선택 (`FormControl` 내 `Select`)**: `단위` 라벨, 옵션 (`일별`, `주별`, `월별`)
- **분석 유형 선택 (`ButtonGroup`)**: `시간별 추이` (`TimelineIcon`), `실행자별` (`BarChartIcon`), `테스트플랜별` (`PieChartIcon`)

### 2.2. 요약 카드
- **`Grid` 내 `Card`**: `총 테스트 실행`, `평균 Pass Rate`, `활성 실행자`, `테스트 플랜`
  - **값 (`Typography` h6)**: 각 지표의 숫자 값.
  - **라벨 (`Typography` body2)**: 각 지표의 설명.
  - **Pass Rate 트렌드 아이콘**: `TrendingUpIcon` 또는 `TrendingDownIcon`.

### 2.3. 차트 렌더링
- **로딩 상태**: `CircularProgress` 및 `Typography` (`추이 데이터를 불러오는 중...`)
- **데이터 없음 상태**: `Alert` (`선택한 기간에 데이터가 없습니다.`, `실행자 데이터가 없습니다.`, `테스트 플랜 데이터가 없습니다.`)
- **시간별 추이 차트 (`LineChart` 또는 `AreaChart`)**: `Pass Rate 추이`, `결과 분포 (누적)`
- **실행자별 차트 (`BarChart`)**: `실행자별 테스트 결과`, `실행자별 Pass Rate`
- **테스트플랜별 차트 (`PieChart` 또는 `BarChart`)**: `테스트플랜별 분포`, `플랜별 Pass Rate`
