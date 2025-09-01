# 테스트 결과 통계 카드 UI 요소

이 문서는 `src/main/frontend/src/components/TestResultStatisticsCard.jsx` 파일을 기반으로 테스트 결과 통계 카드 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
- **`CardContent`**

## 2. 로딩/에러/빈 상태

- **`Card` 내 `Typography`**: `로딩 중...`, `에러: {error}`, `데이터 없음`

## 3. 메인 통계 섹션

- **제목 (`Typography` h6)**: `테스트 결과 통계`
- **주요 지표 (`Grid container`)**
  - **성공률 (`Box`)**
    - `Typography` (body2): `성공률`
    - `Typography` (h5): `statistics.passRate` (CountUp 컴포넌트)
  - **총 테스트 (`Box`)**
    - `Typography` (body2): `총 테스트`
    - `Typography` (h5): `statistics.totalTests` (CountUp 컴포넌트)

## 4. 상세 통계 섹션

- **`Grid container`**
- **각 통계 항목 (`Box`)**
  - **아이콘**: `CheckCircle`, `Cancel`, `Block`, `PauseCircle` (각 결과 상태에 따라)
  - **라벨 (`Typography` caption)**: `성공`, `실패`, `차단됨`, `미실행`
  - **값 (`Typography` body2)**: `item.value` (CountUp 컴포넌트) 및 `item.percentage`
