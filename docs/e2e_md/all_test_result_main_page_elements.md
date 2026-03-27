# 테스트 결과 메인 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/TestResultMainPage.jsx` 파일을 기반으로 테스트 결과 메인 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 페이지 헤더

- **아이콘 (`BarChartIcon`)**
- **제목 (`Typography` h4/h5)**: `테스트 결과`
  - Playwright 선택자 예시: `h4:has-text("테스트 결과")`
- **설명 (`Typography` body1/body2)**: `프로젝트의 모든 테스트 결과를 통합하여 분석하고 관리할 수 있습니다.`
- **구분선 (`Divider`)**

## 2. 탭 내비게이션

- **`Tabs` 컴포넌트**
- **`Tab` - 통계 대시보드**
  - 아이콘: `AssessmentIcon`
  - 라벨: `통계 대시보드` (모바일: `통계`)
  - 캡션: `Pass/Fail/NotRun/Blocked 결과 분포를 시각화하여 한눈에 파악할 수 있습니다`
  - Playwright 선택자 예시: `button:has-text("통계 대시보드")`
- **`Tab` - 추이 분석**
  - 아이콘: `TrendingUpIcon`
  - 라벨: `추이 분석` (모바일: `추이`)
  - 캡션: `테스트 플랜별, 실행자별 결과 비교 및 성능 추이 분석이 가능합니다`
  - Playwright 선택자 예시: `button:has-text("추이 분석")`
- **`Tab` - 상세 테이블**
  - 아이콘: `TableViewIcon`
  - 라벨: `상세 테이블` (모바일: `테이블`)
  - 캡션: `전체 테스트 결과를 테이블 형태로 상세하게 확인할 수 있습니다`
  - Playwright 선택자 예시: `button:has-text("상세 테이블")`
- **`Tab` - 상세 리포트**
  - 아이콘: `DescriptionIcon`
  - 라벨: `상세 리포트` (모바일: `리포트`)
  - 캡션: `폴더별, 케이스별 상세 결과와 JIRA 연동 상태 관리를 지원합니다`
  - Playwright 선택자 예시: `button:has-text("상세 리포트")`

## 3. 탭 콘텐츠 (조건부 렌더링)

### 3.1. 통계 대시보드 탭

- **`TestResultStatisticsDashboard` 컴포넌트**
  - 역할: 테스트 결과 통계 대시보드 표시.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

### 3.2. 추이 분석 탭

- **`TestResultTrendAnalysis` 컴포넌트**
  - 역할: 테스트 결과 추이 분석 차트 표시.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

### 3.3. 상세 테이블 탭

- **`TestResultDetailTable` 컴포넌트**
  - 역할: 전체 테스트 결과를 테이블 형태로 표시.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.

### 3.4. 상세 리포트 탭

- **`TestResultDetailReportView` 컴포넌트**
  - 역할: 폴더별, 케이스별 상세 결과 리포트 표시.
  - 이 컴포넌트의 상세 요소는 별도로 분석하여 기록합니다.
