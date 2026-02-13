# 테스트 결과 컬럼 메뉴 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultColumnMenu.jsx` 파일을 기반으로 테스트 결과 테이블의 컬럼 표시/숨김 설정을 위한 메뉴 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 메뉴 구조

- **`Menu` 컴포넌트**

## 2. 메뉴 헤더

- **`Box` 컨테이너**
- **아이콘 (`SettingsIcon`)**
- **제목 (`Typography` subtitle1)**: `컬럼 표시 설정`
- **설명 (`Typography` caption)**: `표시할 컬럼을 선택해주세요`

## 3. 전역 가시성 버튼

- **`Box` 컨테이너**
- **`Button` - 전체 표시**: `전체 표시`
- **`Button` - 필수만 표시**: `필수만 표시`

## 4. 컬럼별 설정

- **`Box` 컨테이너 (스크롤 가능)**
- **각 컬럼 항목 (`MenuItem`)**
  - **체크박스 (`Checkbox`)**: 컬럼 표시/숨김 토글.
  - **컬럼 이름 (`Typography`)**: `col.headerName`
  - **필수 컬럼 표시 (`Typography` caption)**: `필수 컬럼` (필수 컬럼인 경우).
  - **컬럼 순서 번호 (`Typography` caption)**: `X` (예: `1`, `2`).

## 5. 푸터 요약

- **`Box` 컨테이너**
- **표시 중 컬럼 수 (`Typography` caption)**: `📊 표시 중: X/Y개 컬럼`
- **팁 메시지 (`Typography` caption)**: `💡 팁: 테스트케이스와 결과는 필수 컬럼으로 항상 표시됩니다`
