# 테스트 결과 편집 다이얼로그 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultEditDialog.jsx` 파일을 기반으로 테스트 결과 편집 다이얼로그 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
- **`DialogTitle`**: `테스트 결과 편집`
- **`DialogContent`**
- **`DialogActions`**

## 2. 다이얼로그 제목 영역

- **아이콘 (`EditIcon`)**
- **제목 (`Typography`)**: `테스트 결과 편집`
- **상태 칩 (`Chip`)**: `activeEdit.editStatus` (예: `DRAFT`, `PENDING`, `APPROVED`, `APPLIED`, `REVERTED`)

## 3. 로딩/에러 상태

- **`LinearProgress`**: 로딩 중일 때 표시.
- **`Alert`**: 에러 메시지 표시.

## 4. 권한 정보

- **`Alert`**: `현재 편집 권한이 없습니다.`

## 5. 원본 데이터 섹션

- **`Card` 컴포넌트**
- **제목 (`Typography` h6)**: `원본 데이터`
- **테스트케이스명 (`Typography`)**: `testCase?.name`
- **결과 (`Chip`)**: `testResult?.result`
- **비고 (`Typography`)**: `testResult?.notes`
- **JIRA ID (`Typography`)**: `testResult?.jiraIssueKey`

## 6. 편집 폼 섹션

- **제목 (`Typography` h6)**: `편집 내용`
- **테스트케이스명 (`TextField`)**: `editedTestCaseName`
- **테스트 결과 (`FormControl` 내 `Select`)**: `editedResult` (옵션: `통과`, `실패`, `차단됨`, `실행 안됨`)
- **JIRA 이슈 키 (`TextField`)**: `editedJiraIssueKey` (JIRA 검증 상태 아이콘 및 헬퍼 텍스트 포함)
- **JIRA 이슈 URL (`TextField`)**: `editedJiraIssueUrl`
- **비고 (`TextField`)**: `editedNotes`
- **태그 입력**: `TextField` (태그 추가), `Button` (추가), `Chip` (추가된 태그, 삭제 버튼 포함)
- **편집 이유 (`TextField`)**: `editReason` (필수)
- **임시저장/승인 요청 스위치 (`FormControlLabel` 내 `Switch`)**: `saveAsDraft` 상태에 따라 `임시저장` 또는 `승인 요청`

## 7. 편집 이력 섹션

- **`Card` 컴포넌트**
- **제목 (`Typography` h6)**: `편집 이력`
- **`Typography`**: `편집 이력이 없습니다.`
- **각 편집 항목 (`List` 내 `ListItem`)**
  - 상태 아이콘
  - 상태 칩, 버전, 편집자 이름
  - 편집 이유, 생성일
  - **액션 버튼**: `승인`, `거부`, `적용`, `되돌리기` (상태 및 권한에 따라 조건부 표시)

## 8. 다이얼로그 액션 버튼

- **취소 버튼 (`Button`)**: `취소`
- **저장 버튼 (`Button`)**: `임시저장` 또는 `승인 요청` (스위치 상태에 따라 텍스트 변경)
