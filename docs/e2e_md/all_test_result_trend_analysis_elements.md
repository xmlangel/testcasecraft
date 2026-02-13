# 테스트 결과 추이 분석 UI 요소

이 문서는 `src/main/frontend/src/components/TestResultTrendAnalysis.jsx` 파일을 기반으로 테스트 결과 추이 분석 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 로딩/에러/데이터 없음 상태

- **`CircularProgress` 및 `Typography`**: `추이 데이터를 불러오는 중...`
- **`Alert`**: 에러 메시지 표시.
- **`TimelineIcon` 및 `Typography`**: `추이 데이터가 없습니다`

## 2. 컨트롤 섹션

- **기간 선택 (`FormControl` 내 `Select`)**
  - 라벨: `기간`
  - 옵션: `최근 7일`, `최근 15일`, `최근 30일`, `최근 60일`, `최근 90일`
- **차트 타입 선택 (`ToggleButtonGroup`)**
  - `라인` (`ShowChartIcon`)
  - `영역` (`BarChartIcon`)
- **요약 통계 카드 (`Grid` 내 `Card`)**
  - `평균 성공률`
  - `평균 완료율`
  - `데이터 포인트`
  - `성공률 변화`
- **비교 필터 패널 (`ComparisonFilterPanel` 컴포넌트)**
  - 역할: 테스트 플랜별 또는 실행자별 비교 필터링 옵션 제공.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 3. 추이 차트 섹션

- **`Card` 및 `CardContent`**
- **차트 제목 (`Typography` h6)**: `테스트 결과 변화 추이`, `테스트 플랜별 결과 비교`, `실행자별 결과 비교` (선택된 모드에 따라 변경)
- **결과 타입 칩 (`Chip`)**: `PASS`, `FAIL`, `BLOCKED`, `NOTRUN` 등 (색상으로 구분)
- **전체 추이 차트 (LineChart 또는 AreaChart)**
  - `ResponsiveContainer` 내 `LineChart` 또는 `AreaChart`
  - `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
  - `Line` 또는 `Area` 컴포넌트: `PASS`, `FAIL`, `BLOCKED`, `NOTRUN`, `SKIPPED`
- **비교 차트 (LineChart)**
  - `ResponsiveContainer` 내 `LineChart`
  - `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
  - `Line` 컴포넌트: `전체 성공률` (회색 점선)
  - `Line` 컴포넌트: 선택된 항목들의 비교 라인 (예: `Plan X`, `User Y`)
  - **메시지 (`Typography`)**: `비교할 테스트 플랜을 선택해주세요` 또는 `비교할 실행자를 선택해주세요`

## 4. 성공률 및 완료율 추이 차트

- **`Card` 및 `CardContent`**
- **제목 (`Typography` h6)**: `성공률 및 완료율 추이`
- **`ResponsiveContainer` 내 `LineChart`**
  - `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
  - `Line` 컴포넌트: `성공률`
  - `Line` 컴포넌트: `완료율`
