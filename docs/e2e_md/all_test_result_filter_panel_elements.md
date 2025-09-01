# 테스트 결과 필터 패널 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/TestResultFilterPanel.jsx` 파일을 기반으로 테스트 결과 필터 패널 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 Paper 구조

- **`Paper` 컴포넌트**

## 2. 헤더 영역

- **필터 아이콘 (`FilterListIcon`)**
- **제목 (`Typography` h6)**: `테스트 결과 필터`
- **새로고침 버튼 (`Button` with `RefreshIcon`)**: `새로고침`

## 3. 에러 메시지 표시

- **`Alert` 컴포넌트**
  - 역할: 필터 로딩 또는 적용 중 발생한 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 4. 필터 옵션

- **테스트 플랜 선택 (`FormControl` 내 `Select`)**
  - 라벨: `테스트 플랜`
  - 옵션: `전체 보기`, 각 테스트 플랜 이름 (이름, 설명 포함)
- **테스트 실행 선택 (`FormControl` 내 `Select`)**
  - 라벨: `테스트 실행`
  - 옵션: `전체 보기`, 각 테스트 실행 이름 (이름, 상태 칩, 시작일 포함)

## 5. 액션 버튼

- **필터 적용 버튼 (`Button` with `FilterListIcon`)**: `필터 적용`
- **초기화 버튼 (`Button` with `ClearIcon`)**: `초기화`

## 6. 적용된 필터 표시

- **구분선 (`Divider`)**
- **텍스트 (`Typography`)**: `적용된 필터:`
- **플랜 필터 칩 (`Chip`)**: `플랜: {플랜이름}` (삭제 버튼 포함)
- **실행 필터 칩 (`Chip`)**: `실행: {실행이름}` (삭제 버튼 포함)
