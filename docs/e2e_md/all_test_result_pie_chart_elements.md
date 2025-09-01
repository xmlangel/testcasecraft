# 테스트 결과 파이 차트 UI 요소

이 문서는 `src/main/frontend/src/components/TestResultPieChart.jsx` 파일을 기반으로 테스트 결과 파이 차트 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
- **`CardContent`**

## 2. 로딩 상태

- **`Card` 내 `Typography`**: `테스트 결과 분포` 및 `차트 데이터를 불러오는 중...`
- **`LinearProgress`**: 로딩 진행률 표시.

## 3. 데이터 없음 상태

- **`Card` 내 `Typography`**: `테스트 결과 분포` 및 `차트 데이터가 없습니다.`

## 4. 파이 차트 섹션

- **제목 (`Typography` h6)**: `테스트 결과 분포`
- **`ResponsiveContainer` 내 `PieChart`**
  - **`Pie` 컴포넌트**: 실제 파이 차트.
  - **`Cell` 컴포넌트**: 각 파이 조각 (색상으로 구분).
  - **`ReTooltip` 컴포넌트**: 마우스 오버 시 상세 정보 표시.
- **범례 (`List`)**
  - **각 결과 타입 항목 (`ListItem`)**: `성공`, `실패`, `차단됨`, `미실행`
    - **아이콘 (`ListItemIcon` 내 `Circle`)**: 각 결과 타입의 색상 원.
    - **텍스트 (`ListItemText`)**: 라벨 (예: `성공`) 및 개수와 비율 (예: `X건 (Y%)`)

## 5. 총계

- **`Box` 내 `Typography`**: `총 테스트 케이스: X건`
