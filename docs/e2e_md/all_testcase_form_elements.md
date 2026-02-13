# 테스트케이스 폼 UI 요소

이 문서는 `src/main/frontend/src/components/TestCaseForm.jsx` 파일을 기반으로 테스트케이스 폼 컴포넌트에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 카드 구조

- **`Card` 컴포넌트**
  - 역할: 테스트케이스 상세 정보를 담는 메인 컨테이너.
  - Playwright 선택자 예시: `div.MuiCard-root`
- **`CardContent`**
- **`CardActions`**

## 2. 초기 상태 메시지

- **`Typography` - 프로젝트 선택 안내**
  - 텍스트: `프로젝트를 먼저 선택하세요.`
  - Playwright 선택자 예시: `p:has-text("프로젝트를 먼저 선택하세요.")`
- **`Typography` - 테스트케이스 선택/생성 안내**
  - 텍스트: `테스트케이스를 선택하거나 새로 만드세요.`
  - Playwright 선택자 예시: `p:has-text("테스트케이스를 선택하거나 새로 만드세요.")`

## 3. 폴더 모드 (테스트 폴더)

- **제목 (`Typography` h6)**: `테스트 폴더 수정` 또는 `테스트 폴더 생성`
- **저장 버튼 (`Button`)**: `저장` (상단 및 하단)
- **`Accordion` - ID, Parent 섹션**
  - **제목 (`Typography` subtitle2)**: `ID, Parent`
  - **`TextField` - Project ID**: `Project ID` 라벨
  - **`TextField` - ID**: `ID` 라벨
  - **`TextField` - Parent ID**: `Parent ID` 라벨
  - **`TextField` - Parent**: `Parent` 라벨
  - **`TextField` - 순서**: `순서` 라벨

## 4. 테스트케이스 모드 (기본값)

- **제목 (`Typography` h6)**: `테스트케이스 수정` 또는 `테스트케이스 생성`
- **저장 버튼 (`Button`)**: `저장` (상단)
- **`Accordion` - ID, Parent 섹션**: (폴더 모드와 동일)
- **`Accordion` - 테스트케이스 정보 섹션**
  - **제목 (`Typography` subtitle2)**: `테스트케이스 정보`
  - **`TextField` - 이름**: `이름` 라벨
  - **`TextField` - 설명**: `설명` 라벨
  - **`TextField` - Pre-condition**: `Pre-condition` 라벨
- **테스트 스텝 섹션**
  - **제목 (`Typography` subtitle1)**: `테스트 스텝`
  - **스텝 테이블 (`TableContainer` 내 `Table`)**
    - **테이블 헤더**: `No.`, `Step`, `Expected`, `삭제 아이콘 컬럼`
    - **스텝 없음 메시지 (`Typography`)**: `스텝을 추가하세요.`
    - **각 스텝 행**: `TextField` (Step 설명), `TextField` (예상 결과), `IconButton` (삭제)
  - **스텝 추가 버튼 (`Button` with `AddIcon`)**: `스텝 추가`
- **`TextField` - Expected Results (전체 예상 결과)**: `Expected Results` 라벨
- **저장 버튼 (`Button`)**: `저장` (하단)

## 5. 스낵바 메시지

- **성공 스낵바 (`Snackbar` 내 `Alert`)**: `저장되었습니다.`
- **에러 스낵바 (`Snackbar` 내 `Alert`)**: `snackbarError` 메시지.

## 6. 로딩 스피너

- **`CircularProgress`**: 저장 중일 때 표시.
