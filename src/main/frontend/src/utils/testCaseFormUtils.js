/**
 * TestCaseForm 컴포넌트에서 사용하는 유틸리티 함수들
 */

/**
 * 필드 설정에 따라 상태에서 값을 조회합니다.
 * @param {object} fieldConfig - 필드 설정 객체 (type, field, stepNumber)
 * @param {object} state - 테스트케이스 상태 객체
 * @returns {string} 필드 값
 */
export const resolveFieldValue = (fieldConfig, state) => {
  if (!fieldConfig || !state) return "";
  if (fieldConfig.type === "field") {
    return state[fieldConfig.field] || "";
  }
  if (fieldConfig.type === "step") {
    const step = state.steps?.find(
      (s) => s.stepNumber === fieldConfig.stepNumber,
    );
    return step?.[fieldConfig.field] || "";
  }
  return "";
};

/**
 * 필드 설정에 따라 상태를 업데이트합니다.
 * @param {object} state - 현재 상태
 * @param {object} fieldConfig - 필드 설정 객체
 * @param {string} nextValue - 새로운 값
 * @returns {object} 업데이트된 상태
 */
export const applyFieldValueToState = (state, fieldConfig, nextValue) => {
  if (!state || !fieldConfig) return state;
  if (fieldConfig.type === "field") {
    return { ...state, [fieldConfig.field]: nextValue };
  }
  if (fieldConfig.type === "step") {
    return {
      ...state,
      steps: (state.steps || []).map((step) =>
        step.stepNumber === fieldConfig.stepNumber
          ? { ...step, [fieldConfig.field]: nextValue }
          : step,
      ),
    };
  }
  return state;
};

/**
 * HTML 본문에서 data-attachment-id 속성을 가진 이미지 태그를 추출하여 attachment ID 목록을 반환합니다.
 * @param {string} htmlContent - HTML 문자열
 * @returns {string[]} attachment ID 배열
 */
export const extractAttachmentIds = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== "string") return [];
  const imgRegex = /<img[^>]+data-attachment-id="([^"]+)"[^>]*>/g;
  const ids = new Set();
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids);
};

/**
 * 테스트 단계 삭제 후 stepNumber 를 1..N 으로 재번호하고, stepNumber 로 키잉된
 * 검증 에러도 새 번호로 재매핑한다.
 *
 * 단순 filter 만 하면 번호에 구멍이 생겨(1,3,4) 단계 이동 버튼 비활성화 로직
 * (stepNumber===1 / ===steps.length)이 오작동하므로, 삭제·추가·이동이 모두
 * 1..N 연속 번호 규약을 따르도록 한다.
 *
 * @param {Array<{stepNumber:number}>} steps 현재 단계 목록
 * @param {number} stepNumberToRemove 삭제할 단계 번호
 * @param {Object} stepErrors stepNumber→에러 맵 (errors.steps)
 * @returns {{steps: Array, stepErrors: Object}} 재번호된 단계와 재매핑된 에러
 */
/**
 * 부모 폴더 이동 시 "옛 부모에서 상속된 태그"(현재 태그 ∩ 옛 부모 태그)를 구한다.
 * 이동 후 정리 대상 후보가 되는 태그 목록.
 *
 * @param {string[]} currentTags 현재 테스트케이스 태그
 * @param {string[]} oldParentTags 이동 전 부모 폴더의 태그
 * @returns {string[]} 교집합(상속된) 태그
 */
export const getCommonInheritedTags = (currentTags, oldParentTags) => {
  const current = currentTags || [];
  const parent = oldParentTags || [];
  return current.filter((tag) => parent.includes(tag));
};

export const removeStepAndRenumber = (
  steps,
  stepNumberToRemove,
  stepErrors = {},
) => {
  const remaining = (steps || [])
    .filter((s) => s.stepNumber !== stepNumberToRemove)
    .sort((a, b) => a.stepNumber - b.stepNumber);
  const newSteps = [];
  const newErrors = {};
  remaining.forEach((s, i) => {
    const newNumber = i + 1;
    newSteps.push({ ...s, stepNumber: newNumber });
    if (stepErrors && stepErrors[s.stepNumber] !== undefined) {
      newErrors[newNumber] = stepErrors[s.stepNumber];
    }
  });
  return { steps: newSteps, stepErrors: newErrors };
};
