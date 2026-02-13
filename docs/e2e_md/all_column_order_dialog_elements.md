# 컬럼 순서 변경 다이얼로그 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/ColumnOrderDialog.jsx` 파일을 기반으로 컬럼 순서 변경 다이얼로그 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
- **`DialogTitle`**
- **`DialogContent`**
- **`DialogActions`**

## 2. 다이얼로그 제목 영역

- **아이콘 (`DragIcon`)**
- **제목 (`Typography` h6)**: `컬럼 순서 변경`
- **설명 (`Typography` body2)**: `위/아래 화살표 버튼을 사용하여 컬럼 순서를 변경하세요`

## 3. 컬럼 목록

- **`List` 컴포넌트**
- **각 컬럼 항목 (`ListItem`)**
  - **순서 번호 (`Typography`)**: `X` (예: `1`, `2`)
  - **컬럼 표시 이름 (`ListItemText` primary)**: `getColumnDisplayName(fieldName)`
  - **컬럼 필드 이름 (`ListItemText` secondary)**: `fieldName`
  - **표시/숨김 상태 칩 (`Chip`)**: `표시` 또는 `숨김`
  - **위로 이동 버튼 (`IconButton` with `ArrowUpIcon`)**
  - **아래로 이동 버튼 (`IconButton` with `ArrowDownIcon`)**

## 4. 다이얼로그 액션 버튼

- **취소 버튼 (`Button`)**: `취소`
- **순서 적용 버튼 (`Button`)**: `순서 적용`
