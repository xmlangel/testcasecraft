# 세션 목록 UI 개선 및 실데이터 연동 계획

`docs/sbtm/` 디렉토리의 설계 문서와 현재 구현된 API/프론트엔드 코드를 바탕으로, 세션 목록(탭 2)의 가독성을 높이고 기능을 완성하기 위한 계획입니다.

## User Review Required

> [!IMPORTANT] > **디자인 변경 사항**: 현재 단순 `ListItem` 기반의 목록을 정보 밀도가 높고 가독성이 좋은 **카드(Card) 형태**로 전환할 예정입니다. 카드 디자인은 `vibrant colors`와 `glassmorphism` 스타일을 참고하여 프리미엄하게 구성합니다.
> **기능 추가**: 목록에서 세션을 클릭했을 때 '세션 상세' 또는 '편집'으로 자동 이동하는 내비게이션 로직을 추가합니다.

## Proposed Changes

### 1. 프론트엔드 (React)

#### [MODIFY] [ExploratorySessionListTab.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/exploratory/ExploratorySessionListTab.jsx)

- `ListItem` 대신 `Card` 컴포넌트 도입 (MUI Card)
- 세션 상태별 테두리 또는 좌측 바 컬러 강조 (HSL 컬러 활용)
- 테스터, 기간, 차터 정보를 아이콘과 함께 구조화하여 표시
- "순수 실행 시간" 및 "시간 배분(차트 또는 칩)" 요약 정보 추가
- 클릭 시 해당 세션을 선택하고 보기 모드로 전환하는 핸들러 추가 (`onSelectSession`)

#### [MODIFY] [ExploratorySessionWorkspace.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/ExploratorySessionWorkspace.jsx)

- 세션 목록 탭에서 세션 선택 시 `DetailTab` 또는 `EditorTab`으로 전환하는 로직 구현
- 선택된 세션 상태(`selectedSessionId`) 및 상세 데이터 로딩 로직 추가

#### [MODIFY] [ExploratoryDetailTab.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/exploratory/ExploratoryDetailTab.jsx)

- 현재 비어있는 상세 탭에 선택된 세션의 실데이터 표시 로직 추가 (Markdown 기반 미션 및 노트 렌더링)

---

### 2. 백엔드 (Spring Boot) - 필요한 경우

- 현재 API(`GET /api/projects/{projectId}/sessions`)가 충분한 정보를 제공하고 있으므로, 프론트엔드 연동에 집중하되 필요시 DTO 확장 검토.

## Open Questions

- 세션 목록에서 **한 페이지에 표시할 개수**를 몇 개로 하는 것이 좋을까요? (현재 기본값 20개)
- 상세 보기 탭으로 이동할 때, **읽기 전용 상세 화면**을 먼저 보여줄까요, 아니면 바로 **편집 화면**으로 이동할까요?

## Verification Plan

### Automated Tests

- `npm run build`를 통한 빌드 성공 여 확인
- Playwright를 사용한 목록 필터링 동작 검증 (예정)

### Manual Verification

1. 탐색 세션 > 세션 목록 탭 진입
2. 카드 UI 레이아웃 확인 (상태, 시간, 테스터 등)
3. 필터(상태, 테스터, 기간) 작동 여부 확인
4. 세션 클릭 시 상세/편집 화면으로 정상 이동하는지 확인
