// 실행 유형(executionType) 화면 정규화 (ICT-493).
// 선택지는 Manual·Automation·Hybrid 셋이다. 예전 가져오기·API 등록으로 들어온
// "Automated" 같은 변형은 DB 값을 바꾸지 않고 화면에서 읽을 때만 맞춘다.
// 화면 상태에 정규화된 값이 들어가므로 저장하면 정본 값으로 나간다.

export const EXECUTION_TYPES = Object.freeze([
  "Manual",
  "Automation",
  "Hybrid",
]);

const ALIASES = Object.freeze({
  manual: "Manual",
  automation: "Automation",
  automated: "Automation",
  hybrid: "Hybrid",
});

const isAutomatedFlag = (isAutomated) =>
  isAutomated === true || isAutomated === "Y";

/**
 * 실행 유형을 선택지 값으로 맞춘다.
 * 값이 비어 있으면 isAutomated 로 정하고, 알 수 없는 값은 그대로 돌려준다.
 */
export const normalizeExecutionType = (executionType, isAutomated) => {
  const raw = typeof executionType === "string" ? executionType.trim() : "";
  if (!raw) {
    return isAutomatedFlag(isAutomated) ? "Automation" : "Manual";
  }
  return ALIASES[raw.toLowerCase()] || raw;
};

// ICT-494 tl-5: 화면에서는 실행 유형 하나만 고른다. 자동화 여부(isAutomated)는 실행 유형을 따른다.
// Automation·Hybrid 는 자동화, Manual 은 수동이다. DB 열 isAutomated 는 그대로 두고 저장할 때 함께 맞춘다.
const AUTOMATED_EXECUTION_TYPES = Object.freeze(["Automation", "Hybrid"]);

/** 실행 유형이 자동화(Automation·Hybrid)인지 */
export const isAutomatedExecutionType = (executionType) =>
  AUTOMATED_EXECUTION_TYPES.includes(normalizeExecutionType(executionType));

/**
 * 케이스를 자동화 케이스로 볼지. 실행 유형이 있으면 실행 유형을 따르고,
 * 비어 있으면 isAutomated 로 정한다(normalizeExecutionType 과 같은 규칙).
 */
export const isAutomatedCase = (testCase) =>
  isAutomatedExecutionType(
    normalizeExecutionType(testCase?.executionType, testCase?.isAutomated),
  );

/**
 * 실행 유형을 바꿀 때 함께 저장할 두 값. isAutomated 는 실행 유형에서 정한다.
 * 알 수 없는 실행 유형이면 그대로 두고 isAutomated 는 false 로 둔다.
 */
export const executionTypeFields = (executionType) => {
  const normalized = normalizeExecutionType(executionType);
  return {
    executionType: normalized,
    isAutomated: isAutomatedExecutionType(normalized),
  };
};

/**
 * 저장할 케이스 값. isAutomated 를 실행 유형에 맞춘다.
 * 두 값이 어긋난 예전 케이스(isAutomated=true + Manual 등)도 다시 저장하면 실행 유형 쪽으로 맞춰진다.
 */
export const withExecutionTypeFields = (testCase) => ({
  ...testCase,
  ...executionTypeFields(
    normalizeExecutionType(testCase?.executionType, testCase?.isAutomated),
  ),
});
