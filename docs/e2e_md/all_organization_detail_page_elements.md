# 조직 상세 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/OrganizationDetail.jsx` 파일을 기반으로 조직 상세 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 페이지 헤더

- **뒤로가기 버튼 (`IconButton` with `ArrowBackIcon`)**
  - 역할: 조직 목록 페이지로 돌아가기.
  - Playwright 선택자 예시: `button[aria-label="back"]` 또는 `svg[data-testid="ArrowBackIcon"]`
- **조직 이름 (`Typography` h4)**
  - 텍스트: `organization.name`
  - Playwright 선택자 예시: `h4.MuiTypography-h4`
- **조직 설명 (`Typography` body1)**
  - 텍스트: `organization.description`
  - Playwright 선택자 예시: `p.MuiTypography-body1`
- **조직 수정 버튼 (`Button` with `EditIcon`)**
  - 텍스트: `조직 수정`
  - Playwright 선택자 예시: `button:has-text("조직 수정")`

## 2. 통계 카드 (프로젝트, 멤버, 그룹)

- **`Grid container`**
  - Playwright 선택자 예시: `div.MuiGrid-container`
- **각 통계 카드 (`Card`)**
  - 역할: 프로젝트 수, 멤버 수, 그룹 수를 표시.
  - Playwright 선택자 예시: `div.MuiCard-root`
  - **아이콘**: `ProjectIcon`, `PersonIcon`, `BusinessIcon`
  - **숫자 (`Typography` h4)**: 각 항목의 개수 (예: `projects.length`)
  - **라벨 (`Typography` body2)**: `프로젝트`, `멤버`, `그룹`

## 3. 탭 내비게이션

- **`Tabs` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiTabs-root`
- **`Tab` - 멤버**
  - 텍스트: `멤버`
  - Playwright 선택자 예시: `button:has-text("멤버")`
- **`Tab` - 프로젝트**
  - 텍스트: `프로젝트`
  - Playwright 선택자 예시: `button:has-text("프로젝트")`
- **`Tab` - 그룹**
  - 텍스트: `그룹`
  - Playwright 선택자 예시: `button:has-text("그룹")`

## 4. 탭 패널 (선택된 탭의 콘텐츠)

### 4.1. 멤버 탭

- **조직 멤버 제목 (`Typography` h6)**: `조직 멤버`
- **멤버 초대 버튼 (`Button` with `PersonAddIcon`)**: `멤버 초대`
- **멤버 테이블 (`TableContainer` 내 `Table`)**
  - **테이블 헤더**: `사용자`, `역할`, `가입일`, `작업`
  - **각 멤버 행**: `Avatar`, 사용자 이름, 사용자명, 역할 (`Chip`), 가입일, 작업 (`IconButton` with `MoreVertIcon`)

### 4.2. 프로젝트 탭

- **조직 프로젝트 제목 (`Typography` h6)**: `조직 프로젝트`
- **프로젝트 생성 버튼 (`Button` with `AddIcon`)**: `프로젝트 생성`
- **프로젝트 없음 메시지 (`Typography`)**: `이 조직에는 아직 프로젝트가 없습니다.`
- **첫 번째 프로젝트 생성 버튼 (`Button`)**: `첫 번째 프로젝트 생성`
- **각 프로젝트 카드 (`Card`)**: 프로젝트 이름, 설명, 소속 조직 표시.

### 4.3. 그룹 탭

- **조직 그룹 제목 (`Typography` h6)**: `조직 그룹`
- **그룹 없음 메시지 (`Typography`)**: `이 조직에는 아직 그룹이 없습니다.`
- **각 그룹 카드 (`Card`)**: 그룹 이름, 설명 표시.

## 5. 멤버 액션 메뉴

- **`Menu` 컴포넌트**
  - 역할: 멤버 테이블에서 '더보기' 버튼 클릭 시 나타나는 메뉴.
  - Playwright 선택자 예시: `ul.MuiMenu-list`
- **멤버 제거 (`MenuItem` with `DeleteIcon`)**: `멤버 제거`

## 6. 멤버 초대 다이얼로그

- **`Dialog` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiDialog-root` (제목: `멤버 초대`)
- **다이얼로그 제목 (`DialogTitle`)**: `멤버 초대`
- **에러 메시지 (`Alert`)**: `inviteError`
- **사용자명 (`TextField`)**: `사용자명` 라벨.
- **역할 선택 (`FormControl` 내 `Select`)**: `역할` 라벨, `멤버`, `관리자` 옵션.
- **취소 버튼 (`Button`)**: `취소`
- **초대 버튼 (`Button`)**: `초대`

## 7. 프로젝트 생성 다이얼로그

- **`Dialog` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiDialog-root` (제목: `조직별 프로젝트 생성`)
- **다이얼로그 제목 (`DialogTitle`)**: `조직별 프로젝트 생성`
- **에러 메시지 (`Alert`)**: `projectError`
- **정보 메시지 (`Alert`)**: `이 프로젝트는 {organization?.name} 조직에 속하게 됩니다.`
- **프로젝트 이름 (`TextField`)**: `프로젝트 이름` 라벨.
- **프로젝트 설명 (`TextField`)**: `프로젝트 설명` 라벨.
- **취소 버튼 (`Button`)**: `취소`
- **생성 버튼 (`Button`)**: `생성`
