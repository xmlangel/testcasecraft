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
    if (!fieldConfig || !state) return '';
    if (fieldConfig.type === 'field') {
        return state[fieldConfig.field] || '';
    }
    if (fieldConfig.type === 'step') {
        const step = state.steps?.find((s) => s.stepNumber === fieldConfig.stepNumber);
        return step?.[fieldConfig.field] || '';
    }
    return '';
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
    if (fieldConfig.type === 'field') {
        return { ...state, [fieldConfig.field]: nextValue };
    }
    if (fieldConfig.type === 'step') {
        return {
            ...state,
            steps: (state.steps || []).map((step) =>
                step.stepNumber === fieldConfig.stepNumber ? { ...step, [fieldConfig.field]: nextValue } : step
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
    if (!htmlContent || typeof htmlContent !== 'string') return [];
    const imgRegex = /<img[^>]+data-attachment-id="([^"]+)"[^>]*>/g;
    const ids = new Set();
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
        ids.add(match[1]);
    }
    return Array.from(ids);
};
