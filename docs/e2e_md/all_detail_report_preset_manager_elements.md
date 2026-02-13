# 상세 리포트 프리셋 관리자 UI 요소

이 문서는 `src/main/frontend/src/components/TestCase/DetailReportPresetManager.jsx` 파일을 기반으로 상세 리포트 프리셋 관리자 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 헤더 영역

- **아이콘 (`FolderOpenIcon`)**
- **제목 (`Typography` h6)**: `필터 프리셋`
- **`Button` - 현재 필터 저장**: `현재 필터 저장` (`SaveIcon`)

## 2. 에러 메시지 표시

- **`Alert` 컴포넌트**: 에러 메시지 표시.

## 3. 프리셋 목록

- **`Paper` 내 `List`**: 저장된 프리셋 목록.
  - **각 프리셋 항목 (`ListItem`)**
    - **아이콘**: `StarIcon` (기본 프리셋) 또는 `StarBorderIcon` (사용자 정의 프리셋).
    - **프리셋 이름 (`Typography`)**: `preset.name`
    - **기본 프리셋 칩 (`Chip`)**: `기본` (기본 프리셋인 경우).
    - **설명 (`Typography`)**: `preset.description`
    - **더보기 메뉴 버튼 (`IconButton` with `MoreVertIcon`)**

## 4. 컨텍스트 메뉴 (프리셋 액션)

- **`Menu` 컴포넌트**
- **`MenuItem` - 적용**: `적용` (`FolderOpenIcon`)
- **`MenuItem` - 이름 수정**: `이름 수정` (`EditIcon`) (사용자 정의 프리셋만)
- **`MenuItem` - 삭제**: `삭제` (`DeleteIcon`) (사용자 정의 프리셋만)

## 5. 프리셋 저장 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `필터 프리셋 저장`
- **프리셋 이름 입력 (`TextField`)**: `프리셋 이름` 라벨.
- **설명 (`Typography`)**: `현재 설정된 필터 조건이 프리셋으로 저장됩니다.`
- **취소 버튼 (`Button`)**: `취소`
- **저장 버튼 (`Button`)**: `저장`

## 6. 프리셋 편집 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `프리셋 이름 수정`
- **프리셋 이름 입력 (`TextField`)**: `프리셋 이름` 라벨.
- **취소 버튼 (`Button`)**: `취소`
- **수정 버튼 (`Button`)**: `수정`
