# 테스트 플랜 UI 요소

이 문서는 `src/main/frontend/src/components/TestPlanForm.jsx` 파일을 기반으로 테스트 플랜 생성 및 수정 다이얼로그에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 테스트 플랜 생성/수정 다이얼로그

- **`Dialog` 컴포넌트**

  - 역할: 테스트 플랜을 생성하거나 수정하는 전체 다이얼로그 창.
  - Playwright 선택자 예시: `div[role="dialog"]`

- **`DialogTitle` - 다이얼로그 제목**

  - 텍스트: `새 테스트 플랜 생성` 또는 `테스트 플랜 수정`
  - Playwright 선택자 예시: `h2:has-text("새 테스트 플랜 생성")` 또는 `h2:has-text("테스트 플랜 수정")`

- **`Alert` - 에러 메시지**
  - 역할: 유효성 검사 실패 또는 저장 중 발생한 오류 메시지를 표시합니다.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 2. 기본 정보 입력 섹션

- **`TextField` - 플랜 이름**

  - 라벨: `플랜 이름`
  - 특징: 필수 입력 항목입니다.
  - Playwright 선택자 예시: `input[label="플랜 이름"]`

- **`TextField` - 설명**
  - 라벨: `설명`
  - 특징: 여러 줄 입력이 가능한 텍스트 필드입니다.
  - Playwright 선택자 예시: `textarea[label="설명"]`

## 3. 테스트케이스 선택 섹션

- **`Paper` - 선택 영역 컨테이너**

  - 역할: 테스트케이스 선택 컴포넌트를 감싸는 컨테이너입니다.
  - Playwright 선택자 예시: `div.MuiPaper-root:has(> h6:has-text("테스트케이스 선택"))`

- **`Typography` - 선택된 테스트케이스 개수**

  - 텍스트: `테스트케이스 선택 (X개 선택됨)`
  - Playwright 선택자 예시: `h6:has-text("테스트케이스 선택")`

- **`TestCaseTree` - 테스트케이스 트리**

  - 역할: 프로젝트 내의 테스트케이스를 계층 구조로 표시하고 선택할 수 있게 하는 커스텀 컴포넌트입니다.
  - Playwright 선택자 예시 (루트 노드): `div[role="tree"]`

- **`Typography` - 프로젝트 미선택 시 메시지**
  - 텍스트: `프로젝트를 먼저 선택해주세요`
  - 역할: 활성화된 프로젝트가 없을 때 표시됩니다.
  - Playwright 선택자 예시: `p:has-text("프로젝트를 먼저 선택해주세요")`

## 4. 다이얼로그 액션 버튼

- **`Button` - 취소 버튼**

  - 텍스트: `취소`
  - Playwright 선택자 예시: `button:has-text("취소")`

- **`Button` - 저장 버튼**

  - 텍스트 (기본): `저장`
  - 텍스트 (로딩 중): `처리 중...`
  - Playwright 선택자 예시: `button:has-text("저장")` 또는 `button:has-text("처리 중...")`

- **`CircularProgress` - 로딩 아이콘**
  - 역할: 저장 버튼 클릭 시 나타나는 로딩 스피너입니다.
  - Playwright 선택자 예시: `button:has-text("처리 중...") > span.MuiCircularProgress-root`
