# 사용자 목록 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/UserManagement/UserList.jsx` 파일을 기반으로 사용자 목록 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 통계 카드

- **`Grid container`**
- **각 통계 카드 (`Card`)**
  - 역할: 전체 사용자, 활성 사용자, 비활성 사용자, 최근 가입자 수 등 사용자 통계 표시.
  - Playwright 선택자 예시: `div.MuiCard-root`
  - **제목 (`Typography` body2)**: `전체 사용자`, `활성 사용자`, `비활성 사용자`, `최근 가입`
  - **값 (`Typography` h4)**: 각 통계의 숫자 값 (예: `statistics.totalUsers`)

## 2. 메인 컨텐츠 영역 (테이블 및 필터)

- **`Paper` 컨테이너**
  - Playwright 선택자 예시: `div.MuiPaper-root`

### 2.1. 툴바 (필터 및 액션)

- **`Typography` (h6) - 사용자 관리 제목**
  - 텍스트: `사용자 관리`
  - Playwright 선택자 예시: `h6:has-text("사용자 관리")`
- **검색 입력 (`TextField`)**
  - 플레이스홀더: `이름, 사용자명, 이메일 검색...`
  - 아이콘: `SearchIcon`
  - Playwright 선택자 예시: `input[placeholder="이름, 사용자명, 이메일 검색..."]`
- **역할 필터 (`FormControl` 내 `Select`)**
  - 라벨: `역할`
  - 옵션: `전체`, `ADMIN`, `MANAGER`, `TESTER`, `USER` (각 역할 아이콘 포함)
  - Playwright 선택자 예시: `div#mui-component-select-role` (Select의 ID)
- **상태 필터 (`FormControl` 내 `Select`)**
  - 라벨: `상태`
  - 옵션: `전체`, `활성`, `비활성`
  - Playwright 선택자 예시: `div#mui-component-select-isActive` (Select의 ID)
- **새로고침 버튼 (`IconButton` with `RefreshIcon`)**
  - 툴팁: `새로고침`
  - Playwright 선택자 예시: `button[title="새로고침"]`
- **데이터 내보내기 버튼 (`IconButton` with `DownloadIcon`)**
  - 툴팁: `데이터 내보내기`
  - Playwright 선택자 예시: `button[title="데이터 내보내기"]`
- **초기화 버튼 (`Button`)**
  - 텍스트: `초기화`
  - Playwright 선택자 예시: `button:has-text("초기화")`

### 2.2. 사용자 테이블

- **`TableContainer` 내 `Table`**
- **테이블 헤더 (`TableHead` 내 `TableRow`, `TableCell`)**
  - 컬럼: `사용자명`, `이름`, `이메일`, `역할`, `상태`, `가입일`, `최종 로그인`, `작업`
- **테이블 바디 (`TableBody` 내 `TableRow`)**
  - **각 사용자 행**: `PersonIcon`과 사용자명, 이름, 이메일, 역할 (`Chip`), 상태 (`Chip`), 가입일, 최종 로그인, 작업 (`IconButton` with `ViewIcon`, `MoreIcon`)
- **사용자 없음 메시지 (`Typography`)**: `검색 조건에 맞는 사용자가 없습니다.`
- **검색 조건 초기화 버튼 (`Button`)**: `검색 조건 초기화` (검색 결과 없을 때)

### 2.3. 페이지네이션

- **`TablePagination` 컴포넌트**
  - 역할: 사용자 목록 페이징 처리.
  - Playwright 선택자 예시: `div.MuiTablePagination-root`
  - **표시 텍스트**: `페이지당 행 수:`, `X-Y / Z 중`
  - **행 수 옵션**: `10`, `20`, `50`, `100`

## 3. 사용자 액션 메뉴

- **`Menu` 컴포넌트**
  - 역할: 사용자 테이블의 '더 많은 작업' 버튼 클릭 시 나타나는 메뉴.
  - Playwright 선택자 예시: `ul.MuiMenu-list`
  - **상세 보기 (`MenuItem` with `ViewIcon`)**: `상세 보기`
  - **구분선 (`Divider`)**
  - **활성화/비활성화 (`MenuItem` with `BlockIcon` / `CheckCircleIcon`)**: `비활성화` 또는 `활성화`

## 4. 사용자 상세 다이얼로그

- **`UserDetailDialog` 컴포넌트**
  - 역할: 사용자 상세 정보를 표시하고 관리하는 모달 다이얼로그.
  - 이 컴포넌트의 상세 요소는 `UserDetailDialog.jsx` 파일을 별도로 분석하여 기록합니다.
