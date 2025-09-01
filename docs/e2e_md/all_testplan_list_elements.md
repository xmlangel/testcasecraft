# 테스트 플랜 목록 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/TestPlanList.jsx` 파일을 기반으로 테스트 플랜 목록 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
- **`CardContent`**

## 2. 프로젝트 선택 확인 (초기 상태)

- **`Typography`**: `프로젝트를 먼저 선택하세요.`
  - Playwright 선택자 예시: `p:has-text("프로젝트를 먼저 선택하세요.")`

## 3. 헤더 영역

- **`Typography` (h6) - 프로젝트 이름**
  - 텍스트: `activeProject?.name`
  - Playwright 선택자 예시: `h6.MuiTypography-h6`
- **`Button` - 테스트 플랜 추가 버튼**
  - 텍스트: `테스트 플랜 추가`
  - 아이콘: `Add`
  - Playwright 선택자 예시: `button:has-text("테스트 플랜 추가")`

## 4. 에러 메시지 표시

- **`Alert` 컴포넌트**
  - 역할: 테스트 플랜 로딩 또는 작업 중 발생한 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 5. 로딩 상태

- **`CircularProgress`**: `로딩 중...`

## 6. 테스트 플랜 없음 상태

- **`Typography`**: `등록된 테스트 플랜이 없습니다.`
  - Playwright 선택자 예시: `p:has-text("등록된 테스트 플랜이 없습니다.")`

## 7. 테스트 플랜 테이블

- **`TableContainer` 내 `Table`**
- **테이블 헤더 (`TableHead` 내 `TableRow`, `TableCell`)**
  - 컬럼: `ID`, `이름`, `설명`, `테스트케이스 수`, `생성일`, `실행`, `수정`, `삭제`
- **테이블 바디 (`TableBody` 내 `TableRow`)**
  - **각 테스트 플랜 행**: `ID`, `이름`, `설명`, `테스트케이스 수`, `생성일`
  - **실행 버튼 (`IconButton` with `PlayArrow`)**: `실행` 툴팁
  - **수정 버튼 (`IconButton` with `Edit`)**: `수정` 툴팁
  - **삭제 버튼 (`IconButton` with `Delete`)**: `삭제` 툴팁

## 8. 페이지네이션

- **`Pagination` 컴포넌트**
  - 역할: 테스트 플랜 목록 페이징 처리.
  - Playwright 선택자 예시: `ul.MuiPagination-ul`
  - **버튼**: `1`, `2`, `...`, `마지막 페이지`, `처음 페이지`

## 9. 테스트 실행 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `테스트 실행 - {selectedTestPlan?.name}`
- **로딩 스피너 (`CircularProgress`)**: 실행 로딩 중 표시.
- **새 실행 생성 버튼 (`Button` with `Add`)**: `새 실행 생성`
- **실행 이력 없음 메시지 (`Typography`)**: `이 테스트 플랜의 실행 이력이 없습니다.`
- **실행 목록 (`List` 내 `ListItem`)**: 각 실행의 이름, 상태, 진행률 표시.
  - **실행 이름 (`Typography`)**: `execution.name`
  - **상태 칩 (`Chip`)**: `Not Started`, `In Progress`, `Completed`
  - **진행률 (`LinearProgress`)**: `progress` 값에 따른 진행률 바.
  - **편집 버튼 (`IconButton` with `PlayArrow`)**: `편집` 툴팁
  - **전체화면 보기 버튼 (`IconButton` with `Visibility`)**: `전체화면 보기` 툴팁
- **닫기 버튼 (`Button`)**: `닫기`

## 10. 삭제 확인 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `테스트 플랜 삭제`
- **확인 메시지 (`DialogContentText`)**: `정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.`
- **취소 버튼 (`Button`)**: `취소`
- **삭제 버튼 (`Button`)**: `삭제`
