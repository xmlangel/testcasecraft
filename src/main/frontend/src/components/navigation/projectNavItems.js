// src/components/navigation/projectNavItems.js
//
// 프로젝트 영역 이동 항목의 단일 정의.
// 가로 탭(ProjectHeader)과 좌측 사이드바(ProjectSidebar)가 같은 목록을 쓴다.
// 두 곳에 따로 적으면 항목을 하나 넣을 때 한쪽만 고쳐져 순서가 어긋난다.
//
// ⚠︎ tabIndex 는 "보이는 항목 중 몇 번째"다 — 고정 번호가 아니다.
// App.jsx 가 RAG 비활성 시 탐색 세션을 6으로, 활성 시 7로 다루는 것과 같은 규칙
// (App.jsx EXPLORATORY_TAB). 그래서 이 목록도 번호를 박지 않고 위치로 판단한다.
// 항목을 중간에 끼워 넣으면 그 뒤 항목의 tabIndex 가 밀리므로, App.jsx 의
// 본문 스위치(tabIndex === N)와 handleTabChange 를 함께 고쳐야 한다.

/** 개수 배지를 붙일 항목의 카운트 키 */
export const NAV_COUNT_KEYS = {
  testCases: "testCases",
  testPlans: "testPlans",
  testExecutions: "testExecutions",
};

/**
 * 프로젝트 영역 항목 정의.
 * @typedef {object} ProjectNavItem
 * @property {string} key      안정 식별자
 * @property {string} icon     아이콘 식별자 (렌더 측에서 컴포넌트로 매핑)
 * @property {string} i18nKey  번역 키
 * @property {string} label    번역 누락 시 폴백 한국어
 * @property {string} testId   E2E·단위 테스트용 data-testid (탭·사이드바 공통)
 * @property {string} [countKey] 개수 배지 소스
 * @property {"rag"|"exploratory"} [requires] 조건부 표시 사유
 */
export const PROJECT_NAV_ITEMS = [
  {
    key: "dashboard",
    icon: "dashboard",
    i18nKey: "projectHeader.tabs.dashboard",
    label: "대시보드",
    testId: "tab-dashboard",
  },
  {
    key: "testcases",
    icon: "testcases",
    i18nKey: "projectHeader.tabs.testCases",
    label: "테스트케이스",
    testId: "tab-testcases",
    countKey: NAV_COUNT_KEYS.testCases,
  },
  {
    key: "testplans",
    icon: "testplans",
    i18nKey: "testPlan.tab.label",
    label: "테스트플랜",
    testId: "tab-testplans",
    countKey: NAV_COUNT_KEYS.testPlans,
  },
  {
    key: "executions",
    icon: "executions",
    i18nKey: "projectHeader.tabs.testExecution",
    label: "테스트실행",
    testId: "tab-executions",
    countKey: NAV_COUNT_KEYS.testExecutions,
  },
  {
    key: "results",
    icon: "results",
    i18nKey: "projectHeader.tabs.testResults",
    label: "테스트결과",
    testId: "tab-results",
  },
  {
    key: "automation",
    icon: "automation",
    i18nKey: "projectHeader.tabs.automation",
    label: "자동화 테스트",
    testId: "tab-automation",
  },
  {
    key: "rag",
    icon: "rag",
    i18nKey: "projectHeader.tabs.ragDocuments",
    label: "RAG 문서",
    testId: "tab-rag",
    requires: "rag",
  },
  {
    key: "exploratory",
    icon: "exploratory",
    i18nKey: "projectHeader.tabs.exploratorySessions",
    label: "탐색 세션",
    testId: "tab-exploratory",
    requires: "exploratory",
  },
];

/**
 * 조건에 맞는 항목만 골라낸다. 반환 배열의 위치가 곧 tabIndex 다.
 *
 * @param {{isRagEnabled?: boolean, showExploratory?: boolean}} opts
 * @returns {ProjectNavItem[]}
 */
export const getVisibleNavItems = ({
  isRagEnabled = false,
  showExploratory = false,
} = {}) =>
  PROJECT_NAV_ITEMS.filter((item) => {
    if (item.requires === "rag") return Boolean(isRagEnabled);
    if (item.requires === "exploratory") return Boolean(showExploratory);
    return true;
  });
