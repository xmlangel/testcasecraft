# 테스트 결과 상세 테이블 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultDetailTable.jsx` 파일을 기반으로 테스트 결과 상세 테이블 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 에러 메시지 표시

- **`Paper` 내 `Typography`**: `테스트 결과를 불러올 수 없습니다`
- **`Button`**: `새로고침`, `다시 시도`

## 2. 메인 헤더 영역

- **`Typography` (h6)**: `테스트 결과 상세 목록`
- **`Typography` (span)**: `필터됨` (필터 적용 시)
- **`Typography` (body2)**: `X개의 테스트 결과`
- **모바일용 빠른 액션 버튼 (`Box`)**
  - `Button` - `컬럼` (`SettingsIcon`)
  - `Button` - `순서`
  - `Button` - `내보내기` (`FileDownloadIcon`)

## 3. 필터 패널

- **`TestResultFilterPanel` 컴포넌트**
  - 역할: 테스트 결과 필터링 옵션 제공.
  - 이 컴포넌트의 상세 요소는 `new-e2e/all_test_result_filter_panel_elements.md` 파일을 참조하세요.

## 4. DataGrid 테이블

- **`DataGrid` 컴포넌트**
  - **컬럼 헤더**: `폴더`, `테스트케이스`, `결과`, `사전설정`, `스텝 정보`, `전체 예상결과`, `실행자`, `비고`, `JIRA ID`, `시행일자`, `JIRA 상태`
  - **테스트케이스 컬럼**: `EditIcon` (편집), `VisibilityIcon` (상세보기) 버튼 포함.
  - **결과 컬럼**: `Chip`으로 결과 상태 표시.
  - **스텝 정보 컬럼**: 각 스텝별 `Card`로 상세 정보 표시.
  - **JIRA ID 컬럼**: `Link` (JIRA URL), `LaunchIcon` (새 탭 열기) 포함.
  - **툴바 (`CustomToolbar` 컴포넌트)**
    - `GridToolbarColumnsButton`, `GridToolbarFilterButton`, `GridToolbarDensitySelector`
    - `Button` - `컬럼 설정` (`SettingsIcon`)
    - `Button` - `순서 변경`
    - `Button` - `기본값`
    - `Button` - `고급 내보내기` (`FileDownloadIcon`)
    - `GridToolbarExport`

## 5. 컬럼 표시/숨김 메뉴

- **`TestResultColumnMenu` 컴포넌트**
  - 역할: 컬럼 표시/숨김 설정 메뉴.
  - 이 컴포넌트의 상세 요소는 `new-e2e/all_test_result_column_menu_elements.md` 파일을 참조하세요.

## 6. 내보내기 다이얼로그

- **`TestResultExportDialog` 컴포넌트**
  - 역할: 테스트 결과 내보내기 기능.
  - 이 컴포넌트의 상세 요소는 `new-e2e/all_test_result_export_dialog_elements.md` 파일을 참조하세요.

## 7. 테스트 결과 편집 다이얼로그

- **`TestResultEditDialog` 컴포넌트**
  - 역할: 테스트 결과 편집 기능.
  - 이 컴포넌트의 상세 요소는 `new-e2e/all_test_result_edit_dialog_elements.md` 파일을 참조하세요.

## 8. 컬럼 순서 변경 다이얼로그

- **`ColumnOrderDialog` 컴포넌트**
  - 역할: 컬럼 순서 변경 기능.
  - 이 컴포넌트의 상세 요소는 `new-e2e/all_column_order_dialog_elements.md` 파일을 참조하세요.
