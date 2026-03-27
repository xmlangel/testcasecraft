# 대시보드 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/Dashboard.jsx` 파일을 기반으로 대시보드 페이지에 존재하는 모든 주요 UI 요소를 식별하고 기록합니다.

## 1. 페이지 구조 및 컨테이너

- **`Box` (메인 컨테이너)**
  - 역할: 전체 대시보드 레이아웃을 감싸는 최상위 컨테이너.
  - Playwright 선택자 예시: `div[sx="PAGE_CONTAINER_SX.main"]` 또는 `body > div > div`
- **`Grid` (레이아웃 그리드)**
  - 역할: 대시보드 카드 및 차트 섹션의 레이아웃을 구성.
  - Playwright 선택자 예시: `div.MuiGrid-container`
- **`Paper` / `StyledPaper` (카드/섹션 컨테이너)**
  - 역할: 각 대시보드 위젯(차트, 요약 등)을 감싸는 컨테이너.
  - Playwright 선택자 예시: `div.MuiPaper-root`

## 2. 대시보드 제목 및 상태

- **`Typography` (h5) - 대시보드 제목**
  - 텍스트: `대시보드` (번역 키: `dashboard.title`)
  - Playwright 선택자 예시: `h5:has-text("대시보드")`
- **`Chip` - 최근 업데이트 시간**
  - 텍스트: `최근 업데이트: {{date}}` (번역 키: `dashboard.lastUpdate`)
  - Playwright 선택자 예시: `span.MuiChip-label:has-text("최근 업데이트")`
- **`Chip` - 새로고침 버튼**
  - 텍스트: `새로고침` (번역 키: `dashboard.refresh.button`)
  - Playwright 선택자 예시: `span.MuiChip-label:has-text("새로고침")`

## 3. 로딩 및 에러/데이터 없음 상태 메시지

- **로딩 메시지 (`Box` 내 `Typography`)**
  - 텍스트: `📊 대시보드 데이터를 불러오는 중...` (번역 키: `dashboard.loading`)
  - Playwright 선택자 예시: `div[role="alert"]:has-text("데이터를 불러오는 중")`
- **에러 메시지 (`Box` 내 `Typography` 및 `Chip`)**
  - 텍스트: 다양한 에러 메시지 (예: `dashboardError.message`)
  - Playwright 선택자 예시: `div[role="alert"][sx*="error.50"]`
  - 관련 `Chip` 버튼: `다시 시도`, `로그인 페이지로`, `상세 정보`
- **데이터 없음 메시지 (`Box` 내 `Typography`)**
  - 텍스트: `📋 대시보드 데이터가 없습니다. 프로젝트에 테스트 결과가 있는지 확인해주세요.` (번역 키: `dashboard.noData`)
  - Playwright 선택자 예시: `div[role="alert"][sx*="warning.50"]`

## 4. 프로젝트 정보 요약

- **`Paper` (프로젝트 요약 컨테이너)**
  - Playwright 선택자 예시: `div.MuiPaper-root[sx*="primary.50"]`
- **`Typography` (h6) - 프로젝트 이름**
  - 텍스트: `activeProject.name`
  - Playwright 선택자 예시: `h6.MuiTypography-h6`
- **`Chip` - 총 테스트케이스**
  - 텍스트: `총 테스트케이스: {{count}}개` (번역 키: `dashboard.totalTestCases`)
  - Playwright 선택자 예시: `span.MuiChip-label:has-text("총 테스트케이스")`
- **`Chip` - 프로젝트 멤버**
  - 텍스트: `프로젝트 멤버: {{count}}명` (번역 키: `dashboard.projectMembers`)
  - Playwright 선택자 예시: `span.MuiChip-label:has-text("프로젝트 멤버")`

## 5. 차트 및 데이터 섹션

### 5.1. 최근 테스트케이스 결과 (Pie Chart)

- **제목**: `최근 테스트케이스 결과` (번역 키: `dashboard.chart.recentTestResults`)
- **차트 요소**: `PieChart`, `Pie`, `Cell`, `ReTooltip` (recharts 라이브러리)
- **완료율**: `CountUp` 컴포넌트 (예: `80% 완료`)
- **실패율**: `Chip` 컴포넌트 (예: `실패 20%`)
- **개별 결과 수**: `CountUp` 컴포넌트와 함께 `성공`, `실패`, `차단됨`, `건너뜀`, `미실행` 텍스트 (번역 키: `dashboard.status.pass` 등)

### 5.2. 테스트케이스 결과 추이 (Line Chart)

- **제목**: `테스트케이스 결과 추이` (번역 키: `dashboard.chart.testResultTrend`)
- **시간 범위 선택 (`FormControl`, `Select`)**: `최근 15일` (번역 키: `dashboard.time.last15Days`)
- **차트 요소**: `LineChart`, `XAxis`, `YAxis`, `ReTooltip`, `Legend`, `Line`
- **데이터 없음 메시지**: `데이터 로딩 중...` 또는 `표시할 데이터가 없습니다.`

### 5.3. 오픈 테스트런별 테스트케이스 결과 (Bar Chart)

- **제목**: `오픈 테스트런별 테스트케이스 결과` (번역 키: `dashboard.chart.openTestRunResults`)
- **차트 요소**: `BarChart`, `XAxis`, `YAxis`, `ReTooltip`, `Legend`, `Bar`
- **데이터 없음 메시지**: `데이터 로딩 중...` 또는 `진행 중인 테스트런이 없습니다.`

### 5.4. 오픈 테스트런 담당자별 테스트케이스 결과 (Vertical Bar Chart)

- **제목**: `오픈 테스트런 담당자별 테스트케이스 결과` (번역 키: `dashboard.chart.assigneeResults`)
- **차트 요소**: `BarChart`, `XAxis`, `YAxis`, `ReTooltip`, `Legend`, `Bar`

### 5.5. 테스트 플랜별 최근 테스트 결과

- **제목**: `테스트 플랜별 최근 테스트 결과` (번역 키: `dashboard.chart.testPlanResults`)
- **`TestPlanSelector` 컴포넌트**: 테스트 플랜 선택 드롭다운 (커스텀 컴포넌트)
- **`RecentTestResults` 컴포넌트**: 최근 테스트 결과 목록 (커스텀 컴포넌트)
- **메시지**: `프로젝트를 선택해주세요.`

### 5.6. 오픈 테스트런 미실행 테스트케이스 추이 (Line Chart)

- **제목**: `오픈 테스트런 미실행 테스트케이스 추이` (번역 키: `dashboard.chart.notRunTrend`)
- **시간 범위 선택**: `최근 15일`
- **차트 요소**: `LineChart`, `XAxis`, `YAxis`, `ReTooltip`, `Line`
- **데이터 없음 메시지**: `데이터 로딩 중...` 또는 `표시할 데이터가 없습니다.`
