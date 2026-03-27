# 일반 대시보드 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/OrganizationDashboard.jsx` 파일을 기반으로 일반 대시보드 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 페이지 헤더

- **`Typography` (h4) - 대시보드 제목**
  - 텍스트: `대시보드`
  - Playwright 선택자 예시: `h4:has-text("대시보드")`

## 2. 주요 지표 카드 (`MetricCard` 컴포넌트)

- **`Grid container`**
- **각 지표 카드 (`MetricCard`)**
  - 역할: 총 조직 수, 총 프로젝트 수, 총 테스트케이스 수, 총 사용자 수, 총 프로젝트 참여 수 등 주요 지표 표시.
  - Playwright 선택자 예시: `div.MuiCard-root` (MetricCard의 내부 구조에 따라 다름)
  - **제목 (`Typography`)**: `총 조직 수`, `총 프로젝트 수`, `총 테스트케이스`, `총 사용자 수`, `총 프로젝트 참여`
  - **값 (`Typography` h4)**: 각 지표의 숫자 값 (CountUp 컴포넌트 사용)
  - **아이콘**: `BusinessIcon`, `AssignmentIcon`, `ListAltIcon`, `PersonIcon`, `GroupIcon`

## 3. 탭 내비게이션

- **`Tabs` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiTabs-root`
- **`Tab` - 조직 현황**
  - 텍스트: `조직 현황`
  - Playwright 선택자 예시: `button:has-text("조직 현황")`
- **`Tab` - 테스트 통계**
  - 텍스트: `테스트 통계`
  - Playwright 선택자 예시: `button:has-text("테스트 통계")`
- **`Tab` - 활동 내역**
  - 텍스트: `활동 내역`
  - Playwright 선택자 예시: `button:has-text("활동 내역")`

## 4. 탭 패널 (선택된 탭의 콘텐츠)

### 4.1. 조직 현황 탭

- **조직별 프로젝트 분포 (Bar Chart)**
  - **제목 (`Typography` h6)**: `조직별 프로젝트 분포`
  - **차트 요소**: `BarChart`, `XAxis`, `YAxis`, `ReTooltip`, `Bar` (recharts 라이브러리)
- **조직 목록 (List)**
  - **제목 (`Typography` h6)**: `조직 목록`
  - **목록 항목 (`ListItem`)**: 각 조직의 이름, 프로젝트 수, 멤버 수 표시.

### 4.2. 테스트 통계 탭

- **테스트 결과 분포 (Pie Chart)**
  - **제목 (`Typography` h6)**: `테스트 결과 분포`
  - **차트 요소**: `PieChart`, `Pie`, `Cell`, `ReTooltip`
- **테스트 결과 상세 (Linear Progress Bars)**
  - **제목 (`Typography` h6)**: `테스트 결과 상세`
  - **진행 바**: 각 테스트 결과 유형별 진행률 표시.

### 4.3. 활동 내역 탭

- **최근 활동 (List)**
  - **제목 (`Typography` h6)**: `최근 활동`
  - **목록 항목 (`ListItem`)**: 각 활동의 유형, 사용자, 메시지, 시간, 조직/프로젝트 이름 표시.
- **활발한 멤버 (List)**
  - **제목 (`Typography` h6)**: `활발한 멤버`
  - **목록 항목 (`ListItem`)**: 각 멤버의 이름, 테스트 수, 프로젝트 수 표시.
