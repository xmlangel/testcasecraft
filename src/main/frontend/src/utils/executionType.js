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
