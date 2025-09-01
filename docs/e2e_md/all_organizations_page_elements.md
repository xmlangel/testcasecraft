# 조직 관리 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/OrganizationList.jsx` 파일을 기반으로 조직 관리 페이지에 존재하는 모든 주요 UI 요소를 식별하고 기록합니다.

## 1. 페이지 구조 및 메인 요소

- **`Box` (메인 컨테이너)**
  - 역할: 조직 목록 페이지의 전체 레이아웃을 감싸는 최상위 컨테이너.
  - Playwright 선택자 예시: `div[sx="PAGE_CONTAINER_SX.main"]`
- **`Typography` (h4) - 조직 관리 제목**
  - 텍스트: `조직 관리`
  - Playwright 선택자 예시: `h4:has-text("조직 관리")`
- **`Button` - 새 조직 생성 버튼**
  - 텍스트: `새 조직 생성`
  - 아이콘: `AddIcon`
  - Playwright 선택자 예시: `button:has-text("새 조직 생성")`
- **`CircularProgress` (로딩 스피너)**
  - 역할: 조직 목록 로딩 중 표시.
  - Playwright 선택자 예시: `span.MuiCircularProgress-root`

## 2. 에러 메시지 표시

- **`Alert` 컴포넌트**
  - 역할: 조직 목록 로딩 실패 시 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root`
  - **에러 제목 (`Typography`)**: `errorDetails?.title` (예: `접근 권한 없음`)
  - **에러 내용 (`Typography`)**: `error` 메시지
  - **상세 설명 (`Typography`)**: `errorDetails.description`
  - **발생 시간 (`Typography`)**: `errorDetails.timestamp`
  - **관련 `Chip` 버튼**: `다시 시도`, `로그인 페이지로`, `상세 정보`

## 3. 조직 없음 상태

- **`Box` (조직 없음 메시지 컨테이너)**
  - 역할: 조직이 하나도 없을 때 표시되는 안내 메시지.
  - Playwright 선택자 예시: `div[text-align="center"]`
- **`BusinessIcon`**
  - Playwright 선택자 예시: `svg[data-testid="BusinessIcon"]`
- **`Typography` (h6) - 조직 없음 제목**
  - 텍스트: `조직이 없습니다`
  - Playwright 선택자 예시: `h6:has-text("조직이 없습니다")`
- **`Typography` (body2) - 안내 메시지**
  - 텍스트: `새 조직을 생성하여 프로젝트와 팀을 관리해보세요.`
- **`Button` - 첫 번째 조직 생성 버튼**
  - 텍스트: `첫 번째 조직 생성`
  - 아이콘: `AddIcon`
  - Playwright 선택자 예시: `button:has-text("첫 번째 조직 생성")`

## 4. 조직 목록 (카드 그리드)

- **`Grid container`**
  - Playwright 선택자 예시: `div.MuiGrid-container`
- **`Card` (각 조직 카드)**
  - 역할: 개별 조직의 정보를 표시하는 카드.
  - Playwright 선택자 예시: `div.MuiCard-root`
  - **조직 이름 (`Typography` h6)**: `org.name`
  - **사용자 역할 (`Chip`)**: `org.userRole` (예: `OWNER`, `ADMIN`)
  - **더보기 메뉴 버튼 (`IconButton` with `MoreVertIcon`)**: 조직 수정/삭제 메뉴를 여는 버튼.
    - Playwright 선택자 예시: `button[aria-label="settings"]` 또는 `svg[data-testid="MoreVertIcon"]`
  - **조직 설명 (`Typography` body2)**: `org.description`
  - **프로젝트 수 (`Tooltip` 내 `Box`와 `AssignmentIcon`)**: `(org.projects && org.projects.length) || 0`
  - **멤버 수 (`Tooltip` 내 `Box`와 `PersonIcon`)**: `(org.organizationUsers && org.organizationUsers.length) || 0`
  - **조직 보기 버튼 (`Button`)**: 해당 조직의 상세 페이지로 이동.
    - 텍스트: `조직 보기`
    - Playwright 선택자 예시: `button:has-text("조직 보기")`

## 5. 조직 액션 메뉴

- **`Menu` 컴포넌트**
  - 역할: 조직 카드에서 '더보기' 버튼 클릭 시 나타나는 메뉴.
  - Playwright 선택자 예시: `ul.MuiMenu-list`
  - **수정 (`MenuItem`)**: `EditIcon`과 함께 `수정` 텍스트.
  - **삭제 (`MenuItem`)**: `DeleteIcon`과 함께 `삭제` 텍스트.

## 6. 조직 생성/수정 다이얼로그

- **`Dialog` 컴포넌트**
  - 역할: 새 조직 생성 또는 기존 조직 수정 시 사용되는 모달 다이얼로그.
  - Playwright 선택자 예시: `div.MuiDialog-root`
  - **다이얼로그 제목 (`DialogTitle`)**: `조직 수정` 또는 `새 조직 생성`
  - **폼 에러 (`Alert`)**: `formError` 메시지.
  - **조직 이름 (`TextField`)**: `조직 이름` 라벨.
  - **설명 (`TextField`)**: `설명` 라벨.
  - **취소 버튼 (`Button`)**: `취소` 텍스트.
  - **수정/생성 버튼 (`Button`)**: `수정` 또는 `생성` 텍스트.

## 7. 삭제 확인 다이얼로그

- **`Dialog` 컴포넌트**
  - 역할: 조직 삭제 시 최종 확인을 위한 모달 다이얼로그.
  - Playwright 선택자 예시: `div.MuiDialog-root` (생성/수정 다이얼로그와 동일한 선택자일 수 있으므로 컨텍스트 필요)
  - **다이얼로그 제목 (`DialogTitle`)**: `조직 삭제 확인`
  - **확인 메시지 (`Typography`)**: `'{deletingOrg?.name}' 조직을 정말 삭제하시겠습니까?`
  - **경고 메시지 (`Typography`)**: `이 작업은 되돌릴 수 없습니다.`
  - **취소 버튼 (`Button`)**: `취소` 텍스트.
  - **삭제 버튼 (`Button`)**: `삭제` 텍스트.
