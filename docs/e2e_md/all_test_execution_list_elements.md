# 테스트 실행 목록 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/TestExecutionList.jsx` 파일을 기반으로 테스트 실행 목록 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
- **`CardContent`**

## 2. 헤더 영역

- **`Typography` (h6) - 실행 이력 제목**
  - 텍스트: `실행 이력`
  - Playwright 선택자 예시: `h6:has-text("실행 이력")`
- **`Button` - 새 실행 버튼**
  - 텍스트: `새 실행`
  - 아이콘: `AddIcon`
  - Playwright 선택자 예시: `button:has-text("새 실행")`

## 3. 로딩 상태

- **`CircularProgress`**: `로딩 중...`

## 4. 에러 메시지 표시

- **`Alert` 컴포넌트**
  - 역할: 테스트 실행 로딩 또는 작업 중 발생한 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 5. 실행 없음 상태

- **`Typography`**: `실행 이력이 없습니다.`
  - Playwright 선택자 예시: `p:has-text("실행 이력이 없습니다.")`

## 6. 테스트 실행 목록

- **`List` 컴포넌트**
- **각 실행 항목 (`ListItem`)**
  - **실행 이름 (`Typography`)**: `execution.name`
  - **상태 칩 (`Chip`)**: `Not Started`, `In Progress`, `Completed`
  - **테스트 플랜 이름 (`Typography`)**: `testPlan.name`
  - **진행률 (`LinearProgress`)**: `progress` 값에 따른 진행률 바.
  - **진행률 퍼센트 (`Typography`)**: `progress` 퍼센트 값.
  - **실행 버튼 (`IconButton` with `PlayArrowIcon`)**: `실행` 툴팁
  - **삭제 버튼 (`IconButton` with `DeleteIcon`)**: `삭제` 툴팁
  - **전체화면 보기 버튼 (`IconButton` with `VisibilityIcon`)**: `전체화면 보기` 툴팁

## 7. 페이지네이션

- **`Pagination` 컴포넌트**
  - 역할: 테스트 실행 목록 페이징 처리.
  - Playwright 선택자 예시: `ul.MuiPagination-ul`
  - **버튼**: `1`, `2`, `...`, `마지막 페이지`, `처음 페이지`

## 8. 삭제 확인 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `실행 삭제`
- **확인 메시지 (`DialogContentText`)**: `정말로 이 실행을 삭제하시겠습니까?`
- **취소 버튼 (`Button`)**: `취소`
- **삭제 버튼 (`Button`)**: `삭제`
