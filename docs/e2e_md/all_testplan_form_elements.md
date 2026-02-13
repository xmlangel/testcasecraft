# 테스트 플랜 폼 UI 요소

이 문서는 `src/main/frontend/src/components/TestPlanForm.jsx` 파일을 기반으로 테스트 플랜 폼 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 다이얼로그 구조

- **`Dialog` 컴포넌트**
- **`DialogTitle`**: `테스트 플랜 수정` 또는 `새 테스트 플랜 생성`
- **`DialogContent`**
- **`DialogActions`**

## 2. 에러 메시지 표시

- **`Alert` 컴포넌트**
  - 역할: 폼 유효성 검사 또는 저장 중 발생한 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 3. 기본 정보 입력 섹션

- **`TextField` - 플랜 이름**
  - 라벨: `플랜 이름`
  - Playwright 선택자 예시: `input[label="플랜 이름"]`
- **`TextField` - 설명**
  - 라벨: `설명`
  - Playwright 선택자 예시: `textarea[label="설명"]`

## 4. 테스트케이스 선택 섹션

- **`Paper` 컨테이너**
- **`Typography` - 테스트케이스 선택 제목**
  - 텍스트: `테스트케이스 선택 (X개 선택됨)`
  - Playwright 선택자 예시: `h6:has-text("테스트케이스 선택")`
- **`TestCaseTree` 컴포넌트**
  - 역할: 테스트케이스를 트리 구조로 표시하고 선택할 수 있도록 함.
  - 이 컴포넌트의 상세 요소는 `e2e-tests/new-e2e/all_testcase_tree_elements.md` 파일을 참조하세요.
- **`Typography` - 프로젝트 선택 안내**
  - 텍스트: `프로젝트를 먼저 선택해주세요`
  - Playwright 선택자 예시: `p:has-text("프로젝트를 먼저 선택해주세요")`

## 5. 다이얼로그 액션 버튼

- **취소 버튼 (`Button`)**
  - 텍스트: `취소`
  - Playwright 선택자 예시: `button:has-text("취소")`
- **저장 버튼 (`Button`)**
  - 텍스트: `저장` 또는 `처리 중...`
  - Playwright 선택자 예시: `button:has-text("저장")`
