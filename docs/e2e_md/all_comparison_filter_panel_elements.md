# 비교 필터 패널 UI 요소

이 문서는 `src/main/frontend/src/components/ComparisonFilterPanel.jsx` 파일을 기반으로 비교 필터 패널 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
- **`CardContent`**

## 2. 로딩/에러 상태

- **`CircularProgress` 및 `Typography`**: `필터 옵션을 불러오는 중...`
- **`Alert`**: 에러 메시지 표시.

## 3. 헤더 영역

- **아이콘 (`CompareArrowsIcon`)**
- **제목 (`Typography` h6)**: `비교 분석 필터`

## 4. 비교 모드 선택

- **`Typography` (subtitle2)**: `비교 기준`
- **`ToggleButtonGroup`**
  - **`ToggleButton` - 전체 추이**: `전체 추이` (`AssessmentIcon`)
  - **`ToggleButton` - 플랜별 비교**: `플랜별 비교` (`TimelineIcon`)
  - **`ToggleButton` - 실행자별 비교**: `실행자별 비교` (`GroupIcon`)

## 5. 비교 대상 선택

- **구분선 (`Divider`)**
- **`FormControl` 내 `InputLabel`**: `비교할 테스트 플랜` 또는 `비교할 실행자`
- **`Select` 컴포넌트 (다중 선택)**
  - **선택된 항목 칩 (`Chip`)**: 선택된 테스트 플랜 또는 실행자 이름.
  - **옵션 (`MenuItem`)**: 각 테스트 플랜 또는 실행자 이름.
    - **체크박스 (`Checkbox`)**: 항목 선택 여부.
    - **항목 텍스트 (`ListItemText`)**: 항목 이름 및 설명.
- **선택 안내 메시지 (`Alert`)**: `비교할 테스트 플랜을 선택해주세요 (최대 5개)` 또는 `비교할 실행자를 선택해주세요 (최대 10개)`
- **선택된 항목 수 (`Typography`)**: `X개 항목이 선택됨`

## 6. 필터 적용 정보

- **`Typography`**: `필터 설정이 자동으로 차트에 적용됩니다.`
