# 테스트 결과 바 차트 UI 요소

이 문서는 `src/main/frontend/src/components/TestResultBarChart.jsx` 파일을 기반으로 테스트 결과 바 차트 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
- **`CardContent`**

## 2. 로딩 상태

- **`Card` 내 `Typography`**: `제목` 및 `차트 데이터를 불러오는 중...`
- **`LinearProgress`**: 로딩 진행률 표시.

## 3. 데이터 없음 상태

- **`Card` 내 `Typography`**: `제목` 및 `비교할 데이터가 없습니다.`

## 4. 헤더 영역

- **제목 (`Typography` h6)**: `title` (예: `테스트 결과 비교`, `테스트 플랜별 결과 비교`, `실행자별 결과 비교`)
- **정보 툴팁 (`Tooltip` with `Info` icon)**: `테스트 플랜별 또는 실행자별 결과를 비교합니다.`
- **퍼센트 보기 스위치 (`FormControl` 내 `Switch`)**: `퍼센트 보기` 라벨.

## 5. 바 차트 섹션

- **`ResponsiveContainer` 내 `BarChart`**
  - **`CartesianGrid`**
  - **`XAxis`**: 데이터 키 (`name`)
  - **`YAxis`**: 라벨 (`비율 (%)` 또는 `개수 (건)`)
  - **`ReTooltip`**: 커스텀 툴팁.
  - **`Legend`**: 범례.
  - **`Bar` 컴포넌트**: `passCount`, `failCount`, `blockedCount`, `notRunCount` (스택형).

## 6. 하단 정보

- **`Box` 내 `Typography`**: `총 X개 항목 비교`
