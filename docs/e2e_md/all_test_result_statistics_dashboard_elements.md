# 테스트 결과 통계 대시보드 UI 요소

이 문서는 `src/main/frontend/src/components/TestResultStatisticsDashboard.jsx` 파일을 기반으로 테스트 결과 통계 대시보드 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 필터 패널

- **`StatisticsFilterPanel` 컴포넌트**
  - 역할: 테스트 플랜, 실행, 날짜 범위, 보기 유형 등 통계 필터링 옵션 제공.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 2. 메인 대시보드 콘텐츠

### 2.1. 개요 모드 (`filters.viewType === 'overview'`)
- **`TestResultStatisticsCard` 컴포넌트**
  - 역할: 전체 테스트 결과 통계 (실행률, 성공률 등) 표시.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.
- **`TestResultPieChart` 컴포넌트**
  - 역할: 테스트 결과 분포를 파이 차트 형태로 시각화.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

### 2.2. 비교 모드 (`filters.viewType !== 'overview'`)
- **`TestResultStatisticsCard` 컴포넌트**
  - 역할: 전체 테스트 결과 통계 표시 (개요 모드와 동일).
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.
- **`TestResultBarChart` 컴포넌트**
  - 역할: 테스트 플랜별 또는 실행자별 결과 비교 데이터를 막대 차트로 시각화.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

## 3. 통계 요약 패널

- **`Paper` 컨테이너**
- **제목 (`Typography` h6)**: `통계 요약`
- **구분선 (`Divider`)**
- **각 요약 지표 (`Typography`)**:
  - `실행률`
  - `성공률`
  - `JIRA 연동률`
  - `최종 업데이트`

## 4. 에러 스낵바

- **`Snackbar` 내 `Alert`**: 에러 메시지 표시.
