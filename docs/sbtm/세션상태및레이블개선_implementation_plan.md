# SBTM 세션 상태 색상 및 레이블 개선 계획

사용자 요구사항에 따라 SBTM 세션 목록에서 '수행 중'인 세션은 녹색으로, '완료'된 세션(승인, 제출 등)은 회색 계열로 표시되도록 UI를 개선합니다. 또한 칩의 레이블을 영문 상태값(DRAFT, RUNNING 등) 대신 번역된 한글로 표시합니다.

## User Review Required

> [!IMPORTANT]
>
> - '진행중인건 녹색' 요구사항에 맞춰 `RUNNING` 상태를 `success` 색상으로 지정합니다.
> - '완료된것은 회색계열' 요구사항에 맞춰 `SUBMITTED`, `APPROVED`, `ARCHIVED` 상태를 `default` 색상으로 지정합니다.
> - 상태별 번역 텍스트(예: "수행 중", "승인됨")가 적절한지 확인이 필요합니다.

## Proposed Changes

### 백엔드 (I18n 설정)

#### [MODIFY] [ExploratorySessionKeysInitializer.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ExploratorySessionKeysInitializer.java)

- 세션 상태 관련 번역 키 7종 추가:
  - `exploratory.session.status.draft`
  - `exploratory.session.status.running`
  - `exploratory.session.status.paused`
  - `exploratory.session.status.submitted`
  - `exploratory.session.status.approved`
  - `exploratory.session.status.archived`
  - `exploratory.session.status.needsUpdate`

#### [MODIFY] [KoreanTestCaseAndAutomationTranslations.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanTestCaseAndAutomationTranslations.java)

- 추가된 키에 대한 한국어 번역 데이터 추가 (예: "작성 중", "수행 중", "승인됨" 등).

#### [MODIFY] [EnglishTestCaseAndAutomationTranslations.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTestCaseAndAutomationTranslations.java)

- 추가된 키에 대한 영어 번역 데이터 추가.

---

### 프론트엔드 (UI 컴포넌트)

#### [MODIFY] [ExploratorySessionWorkspace.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/ExploratorySessionWorkspace.jsx)

- `statusColor` 객체의 매핑 수정:
  - `RUNNING`: `success` (Green)
  - `PAUSED`: `warning` (Orange)
  - `DRAFT`: `info` (Blue)
  - `SUBMITTED`, `APPROVED`, `ARCHIVED`: `default` (Gray)
  - `NEEDS_UPDATE`: `error` (Red)

#### [MODIFY] [ExploratorySessionListTab.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/exploratory/ExploratorySessionListTab.jsx)

- 세션 카드 내 `Chip`의 `label`을 `t()` 함수를 사용하여 번역된 텍스트로 표시.
- 상태값별 키 매핑 헬퍼 함수 또는 객체 적용.

#### [MODIFY] [ExploratorySessionEditorTab.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/exploratory/ExploratorySessionEditorTab.jsx)

- 상단 제어 바의 상태 칩 레이블에 번역 적용.

#### [MODIFY] [ExploratoryDetailTab.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/exploratory/ExploratoryDetailTab.jsx)

- 상세 화면 헤더의 상태 칩 레이블에 번역 적용.

## Open Questions

- `SUBMITTED`(제출됨) 상태도 완료 계열로 보고 회색으로 처리하는 것이 맞을까요? (현재 계획은 회색입니다)
- `DRAFT` 상태의 색상을 파란색(`info`)으로 제안했는데, 다른 선호하시는 색상이 있으신가요?

## Verification Plan

### Automated Tests

- 없음 (UI 변경 사항이므로 시각적 확인 위주)

### Manual Verification

- 세션 목록 탭에서 상태별 칩 색상 및 한글 텍스트 확인.
- 세션 편집/상세 화면에서 칩 레이블의 일관성 확인.
- 브라우저를 통해 다국어 처리(한/영 전환 시)가 정상인지 확인.
