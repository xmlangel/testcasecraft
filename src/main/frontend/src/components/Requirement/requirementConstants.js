// src/components/Requirement/requirementConstants.js
//
// 요구사항 상태·유형·판정 값. 백엔드 Requirement.Status / Requirement.Type /
// RequirementVerdicts 와 같은 이름을 쓴다.

export const REQUIREMENT_STATUSES = [
  { value: "DRAFT", i18nKey: "requirement.status.DRAFT", label: "초안" },
  { value: "REVIEW", i18nKey: "requirement.status.REVIEW", label: "검토 중" },
  { value: "REWORK", i18nKey: "requirement.status.REWORK", label: "재작업" },
  { value: "FINISH", i18nKey: "requirement.status.FINISH", label: "작성 완료" },
  {
    value: "IMPLEMENTED",
    i18nKey: "requirement.status.IMPLEMENTED",
    label: "구현됨",
  },
  { value: "VALID", i18nKey: "requirement.status.VALID", label: "유효" },
  {
    value: "NOT_TESTABLE",
    i18nKey: "requirement.status.NOT_TESTABLE",
    label: "테스트 불가",
  },
  { value: "OBSOLETE", i18nKey: "requirement.status.OBSOLETE", label: "폐기" },
];

export const REQUIREMENT_TYPES = [
  {
    value: "INFORMATIONAL",
    i18nKey: "requirement.type.INFORMATIONAL",
    label: "정보",
  },
  { value: "FEATURE", i18nKey: "requirement.type.FEATURE", label: "기능" },
  {
    value: "USE_CASE",
    i18nKey: "requirement.type.USE_CASE",
    label: "유스케이스",
  },
  {
    value: "USER_INTERFACE",
    i18nKey: "requirement.type.USER_INTERFACE",
    label: "사용자 인터페이스",
  },
  {
    value: "NON_FUNCTIONAL",
    i18nKey: "requirement.type.NON_FUNCTIONAL",
    label: "비기능",
  },
  {
    value: "CONSTRAINT",
    i18nKey: "requirement.type.CONSTRAINT",
    label: "제약",
  },
  {
    value: "SYSTEM_FUNCTION",
    i18nKey: "requirement.type.SYSTEM_FUNCTION",
    label: "시스템 기능",
  },
];

/** 커버리지 판정 → 칩 색 */
export const COVERAGE_META = {
  COVERED: {
    i18nKey: "requirement.coverage.COVERED",
    label: "충족",
    color: "success",
  },
  PARTIAL: {
    i18nKey: "requirement.coverage.PARTIAL",
    label: "부분",
    color: "warning",
  },
  UNCOVERED: {
    i18nKey: "requirement.coverage.UNCOVERED",
    label: "미연결",
    color: "error",
  },
  EXCLUDED: {
    i18nKey: "requirement.coverage.EXCLUDED",
    label: "제외",
    color: "default",
  },
};

/** 리포트 판정 → 칩 색. 순서가 화면의 요약 순서다. */
export const VERDICT_META = {
  PASS: {
    i18nKey: "requirement.verdict.PASS",
    label: "통과",
    color: "success",
  },
  FAIL: { i18nKey: "requirement.verdict.FAIL", label: "실패", color: "error" },
  BLOCKED: {
    i18nKey: "requirement.verdict.BLOCKED",
    label: "차단",
    color: "warning",
  },
  NOT_RUN: {
    i18nKey: "requirement.verdict.NOT_RUN",
    label: "미실행",
    color: "default",
  },
  NOT_IN_PLAN: {
    i18nKey: "requirement.verdict.NOT_IN_PLAN",
    label: "플랜에 없음",
    color: "info",
  },
};

export const findLabel = (list, value, t) => {
  const item = list.find((entry) => entry.value === value);
  return item ? t(item.i18nKey, item.label) : value;
};

/** parentId 트리를 깊이 우선으로 펼쳐 [{spec, depth}] 로 돌려준다. */
export const flattenSpecTree = (specs) => {
  const byParent = new Map();
  specs.forEach((spec) => {
    const key = spec.parentId || null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(spec);
  });
  const ids = new Set(specs.map((spec) => spec.id));
  const out = [];
  const visit = (parentId, depth) => {
    (byParent.get(parentId) || []).forEach((spec) => {
      out.push({ spec, depth });
      visit(spec.id, depth + 1);
    });
  };
  visit(null, 0);
  // 부모가 사라진 문서도 버리지 않고 최상위로 보여 준다
  specs
    .filter((spec) => spec.parentId && !ids.has(spec.parentId))
    .forEach((spec) => {
      out.push({ spec, depth: 0 });
      visit(spec.id, 1);
    });
  return out;
};
