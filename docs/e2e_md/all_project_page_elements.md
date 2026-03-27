# 프로젝트 관리 페이지 UI 요소

이 문서는 `src/main/frontend/src/components/EnhancedProjectManager.jsx` 파일을 기반으로 프로젝트 관리 페이지에 존재하는 주요 UI 요소를 식별하고 기록합니다.

## 1. 메인 페이지 헤더

- **`Typography` (h4) - 프로젝트 관리 제목**
  - 텍스트: `프로젝트 관리`
  - Playwright 선택자 예시: `h4:has-text("프로젝트 관리")`
- **`Button` - 새 프로젝트 생성 버튼**
  - 텍스트: `새 프로젝트 생성`
  - 아이콘: `AddIcon`
  - Playwright 선택자 예시: `button:has-text("새 프로젝트 생성")`

## 2. 에러 메시지 표시

- **`Alert` 컴포넌트**
  - 역할: 프로젝트 로딩 또는 작업 중 발생한 에러 메시지 표시.
  - Playwright 선택자 예시: `div.MuiAlert-root[severity="error"]`

## 3. 탭 내비게이션

- **`Tabs` 컴포넌트**
  - Playwright 선택자 예시: `div.MuiTabs-root`
- **`Tab` - 조직별 프로젝트**
  - 텍스트: `조직별 프로젝트`
  - Playwright 선택자 예시: `button:has-text("조직별 프로젝트")`
- **`Tab` - 독립 프로젝트**
  - 텍스트: `독립 프로젝트`
  - Playwright 선택자 예시: `button:has-text("독립 프로젝트")`
- **`Tab` - 전체 프로젝트**
  - 텍스트: `전체 프로젝트`
  - Playwright 선택자 예시: `button:has-text("전체 프로젝트")`

## 4. 탭 패널 (선택된 탭의 콘텐츠)

### 4.1. 조직별 프로젝트 탭

- **조직별 프로젝트 없음 메시지 (`Typography`)**: `조직별 프로젝트가 없습니다`
- **조직별 섹션 (`Box`)**: 각 조직별로 프로젝트를 그룹화하여 표시.
  - **조직 이름 (`Typography` h5)**: `org.name`
  - **프로젝트 수 (`Chip`)**: `X개 프로젝트`
  - **프로젝트 추가 버튼 (`Button`)**: `프로젝트 추가`
  - **이 조직에는 아직 프로젝트가 없습니다 메시지 (`Typography`)**: `이 조직에는 아직 프로젝트가 없습니다.`
  - **각 프로젝트 카드 (`ProjectCard` 컴포넌트)**: 개별 프로젝트 정보 표시.

### 4.2. 독립 프로젝트 탭

- **독립 프로젝트 제목 (`Typography` h5)**: `독립 프로젝트`
- **독립 프로젝트 없음 메시지 (`Typography`)**: `독립 프로젝트가 없습니다`
- **첫 번째 독립 프로젝트 생성 버튼 (`Button`)**: `첫 번째 독립 프로젝트 생성`
- **각 프로젝트 카드 (`ProjectCard` 컴포넌트)**: 개별 프로젝트 정보 표시.

### 4.3. 전체 프로젝트 탭

- **전체 프로젝트 제목 (`Typography` h5)**: `전체 프로젝트`
- **프로젝트 없음 메시지 (`Typography`)**: `프로젝트가 없습니다`
- **프로젝트 생성 버튼 (`Button`)**: `프로젝트 생성`
- **각 프로젝트 카드 (`ProjectCard` 컴포넌트)**: 개별 프로젝트 정보 표시.

## 5. 프로젝트 카드 (`ProjectCard` 컴포넌트)

- **`Card` 컴포넌트**
- **프로젝트 이름 (`Typography` h6)**: `project.name`
- **프로젝트 코드 (`Chip`)**: `project.code`
- **더보기 메뉴 버튼 (`IconButton` with `MoreVertIcon`)**: 프로젝트 수정/이전/삭제 메뉴를 여는 버튼.
- **소속 조직 정보 (`Box`)**: `BusinessIcon`과 조직 이름 또는 `PublicIcon`과 `독립 프로젝트` 텍스트.
- **프로젝트 설명 (`Typography` body2)**: `project.description`
- **테스트케이스 수 (`Tooltip` 내 `Box`와 `ListAltIcon`)**: `project.testCaseCount`
- **멤버 수 (`Tooltip` 내 `Box`와 `PersonIcon`)**: `project.memberCount`
- **자동화 테스트 결과 수 (`Tooltip` 내 `Box`와 `JunitIcon`)**: `junitSummaries[project.id]`
- **프로젝트 열기 버튼 (`Button` with `LaunchIcon`)**: `프로젝트 열기`

## 6. 프로젝트 액션 메뉴

- **`Menu` 컴포넌트**
- **수정 (`MenuItem` with `EditIcon`)**: `수정`
- **조직 이전 (`MenuItem` with `TransferIcon`)**: `조직 이전`
- **삭제 (`MenuItem` with `DeleteIcon`)**: `삭제`
- **강제 삭제 (`MenuItem` with `DeleteForeverIcon`)**: `강제 삭제`

## 7. 프로젝트 생성/수정 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `프로젝트 수정` 또는 `새 프로젝트 생성`
- **폼 에러 (`Alert`)**: `formError` 메시지.
- **프로젝트 이름 (`TextField`)**: `프로젝트 이름` 라벨.
- **프로젝트 코드 (`TextField`)**: `프로젝트 코드` 라벨.
- **소속 조직 (`FormControl` 내 `Select`)**: `소속 조직` 라벨, `독립 프로젝트 (조직 없음)` 및 조직 목록 옵션.
- **설명 (`TextField`)**: `설명` 라벨.
- **취소 버튼 (`Button`)**: `취소`
- **수정/생성 버튼 (`Button`)**: `수정` 또는 `생성`

## 8. 프로젝트 이전 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `프로젝트 조직 이전`
- **설명 (`Typography`)**: `프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 만들 수 있습니다.`
- **대상 조직 (`FormControl` 내 `Select`)**: `대상 조직` 라벨, `독립 프로젝트로 전환` 및 조직 목록 옵션.
- **취소 버튼 (`Button`)**: `취소`
- **이전 버튼 (`Button`)**: `이전`

## 9. 프로젝트 삭제 확인 다이얼로그

- **`Dialog` 컴포넌트**
- **다이얼로그 제목 (`DialogTitle`)**: `프로젝트 삭제 확인` 또는 `프로젝트 강제 삭제 확인`
- **확인 메시지 (`Typography`)**: `프로젝트를 정말 삭제하시겠습니까?`
- **강제 삭제 경고 (`Alert`)**: `⚠️ 강제 삭제 경고` 및 상세 메시지.
- **취소 버튼 (`Button`)**: `취소`
- **삭제/강제 삭제 버튼 (`Button`)**: `삭제` 또는 `강제 삭제`
