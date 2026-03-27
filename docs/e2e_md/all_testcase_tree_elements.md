# 테스트케이스 트리 UI 요소

이 문서는 `src/main/frontend/src/components/TestCaseTree.jsx` 파일을 기반으로 테스트케이스 트리 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 툴바

- **`Toolbar`**
- **`Typography` (h6) - 테스트케이스 제목**
  - 텍스트: `테스트케이스`
  - Playwright 선택자 예시: `h6:has-text("테스트케이스")`
- **새로 추가 버튼 (`IconButton` with `AddIcon`)**
  - Playwright 선택자 예시: `button[data-testid="add-top-button"]`
- **선택 삭제 버튼 (`IconButton` with `DeleteForeverIcon`)**
  - 툴팁: `선택 삭제`
  - Playwright 선택자 예시: `button[title="선택 삭제"]`
- **리프레시 버튼 (`IconButton` with `RefreshIcon`)**
  - 툴팁: `리프레시`
  - Playwright 선택자 예시: `button[title="리프레시"]`
- **순서 저장/편집 버튼 (`IconButton` with `SaveIcon` / `EditIcon`)**
  - 툴팁: `순서 저장` 또는 `순서 편집`
  - Playwright 선택자 예시: `button[title="순서 저장"]` 또는 `button[title="순서 편집"]`
- **순서 편집 취소 버튼 (`IconButton` with `CloseIcon`)**
  - 툴팁: `취소`
  - Playwright 선택자 예시: `button[title="취소"]`

## 2. 전체 선택 체크박스

- **`FormControlLabel` 내 `Checkbox`**
  - 라벨: `전체 선택`
  - Playwright 선택자 예시: `label:has-text("전체 선택") input[type="checkbox"]`

## 3. 루트 추가 입력

- **`Box` 내 `Typography` - 루트**
  - 텍스트: `루트`
- **새 항목 이름 입력 (`TextField`)**
  - 플레이스홀더: `folder` 또는 `testcase`
- **추가 확인 버튼 (`IconButton` with `AddIcon`)**
  - Playwright 선택자 예시: `button[data-testid="confirm-add-button"]`
- **추가 취소 버튼 (`IconButton` with `CloseIcon`)**

## 4. 트리 뷰

- **`TreeView` 컴포넌트**
- **`TreeItem` (각 노드)**
  - **체크박스**: 노드 선택용.
  - **아이콘**: `FolderIcon` (폴더) 또는 `DescriptionIcon` (테스트케이스).
  - **이름 (`Typography`)**: `node.name`
  - **표시 순서 (`Typography`)**: `#nodeOrder`
  - **순서 이동 버튼**: `ArrowUpwardIcon` (위로), `ArrowDownwardIcon` (아래로).
  - **테스트케이스 수 (`Typography`)**: 폴더 내 테스트케이스 수.
  - **컨텍스트 메뉴 버튼 (`IconButton` with `MoreVertIcon`)**

## 5. 컨텍스트 메뉴

- **`Menu` 컴포넌트**
- **루트 컨텍스트 메뉴 항목 (nodeId가 null일 때)**
  - `MenuItem` - `폴더 추가` (`FolderIcon`)
  - `MenuItem` - `테스트케이스 추가` (`DescriptionIcon`)
- **노드 컨텍스트 메뉴 항목 (nodeId가 null이 아닐 때)**
  - `MenuItem` - `하위 폴더 추가` (`FolderIcon`)
  - `MenuItem` - `하위 테스트케이스 추가` (`DescriptionIcon`)
  - `MenuItem` - `이름 변경` (`EditIcon`)
  - `MenuItem` - `삭제` (`DeleteIcon`)

## 6. 다이얼로그

### 6.1. 선택 삭제 확인 다이얼로그

- **`DialogTitle`**: `선택 삭제`
- **확인 메시지 (`DialogContentText`)**: `X개 항목(하위 포함)을 삭제하시겠습니까?`
- **취소 버튼 (`Button`)**: `취소`
- **삭제 버튼 (`Button`)**: `삭제`

### 6.2. 단일 삭제 확인 다이얼로그

- **`DialogTitle`**: `삭제 확인`
- **확인 메시지 (`DialogContentText`)**: `정말로 삭제하시겠습니까? (하위 항목 포함)`
- **취소 버튼 (`Button`)**: `취소`
- **삭제 버튼 (`Button`)**: `삭제`

### 6.3. 에러 다이얼로그

- **`DialogTitle`**: `오류`
- **에러 메시지 (`DialogContentText`)**: `errorMessage`
- **닫기 버튼 (`Button`)**: `닫기`

## 7. 로딩/빈 상태 메시지

- **`CircularProgress` 및 `Typography`**: `로딩 중...`
- **`Typography`**: `프로젝트를 선택하세요.`
- **`Typography`**: `테스트케이스가 없습니다.`
