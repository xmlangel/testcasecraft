# 테스트 결과 내보내기 다이얼로그 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultExportDialog.jsx` 파일을 기반으로 테스트 결과 내보내기 다이얼로그 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
- **`DialogTitle`**: `테스트 결과 내보내기`
- **`DialogContent`**
- **`DialogActions`**

## 2. 내보내기 형식 선택

- **제목 (`Typography` h6)**: `📄 내보내기 형식 선택`
- **각 형식 옵션 카드 (`Grid` 내 `Card`)**
  - **아이콘 (`Typography` h3)**: `📊`, `📋`, `📈`
  - **제목 (`Typography` h6)**: `Excel (.xlsx)`, `PDF (.pdf)`, `CSV (.csv)`
  - **설명 (`Typography` body2)**: 각 형식에 대한 설명.
  - **특징 칩 (`Chip`)**: 각 형식의 특징 (예: `통계 차트 포함`).

## 3. 내보내기 정보 요약

- **제목 (`Typography` h6)**: `📋 내보내기 정보`
- **총 데이터 건수 (`Typography` 및 `Chip`)**: `📊 총 데이터 건수: X건`
- **표시 컬럼 수 (`Typography` 및 `Chip`)**: `🔍 표시 컬럼 수: X개`
- **내보낼 컬럼 (`Typography`)**: `📂 내보낼 컬럼: 컬럼1, 컬럼2, ...`
- **형식별 안내 메시지 (`Alert`)**: Excel, PDF, CSV 형식에 따른 안내 메시지.

## 4. 내보내기 진행 상태

- **`CircularProgress` 및 `Typography`**: `파일을 생성하고 있습니다... 잠시만 기다려주세요` (내보내기 중일 때만 표시).

## 5. 다이얼로그 액션 버튼

- **취소 버튼 (`Button`)**: `취소`
- **내보내기 버튼 (`Button` with `FileDownloadIcon`)**: `Excel 내보내기`, `PDF 내보내기`, `CSV 내보내기` (선택된 형식에 따라 텍스트 변경).
