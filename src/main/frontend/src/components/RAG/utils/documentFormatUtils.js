// src/components/RAG/utils/documentFormatUtils.js

/**
 * 날짜 배열을 포맷팅된 문자열로 변환
 * Java LocalDateTime 배열 형식: [year, month, day, hour, minute, second, nanosecond]
 * 
 * @param {Array<number>} dateArray - 날짜 배열
 * @returns {string} 포맷팅된 날짜 문자열 또는 '-'
 */
export function formatDateArray(dateArray) {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return '-';
    try {
        // Java LocalDateTime 배열 형식: [year, month, day, hour, minute, second, nanosecond]
        const [year, month, day, hour = 0, minute = 0] = dateArray;
        const date = new Date(year, month - 1, day, hour, minute);
        if (isNaN(date.getTime())) {
            return '-';
        }
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return '-';
    }
}

/**
 * LLM 분석 상태의 진행률 요약을 포맷팅
 * 
 * @param {Object} llmState - LLM 분석 상태 객체
 * @param {number} llmState.progress - 진행률 (0-100)
 * @param {number} llmState.analyzedChunks - 분석된 청크 수
 * @param {number} llmState.totalChunks - 전체 청크 수
 * @returns {string} 포맷팅된 진행률 문자열 (예: "75.0% (15/20 청크)")
 */
export function formatProgressSummary(llmState) {
    if (!llmState) return '';
    const progressValue = Number.isFinite(llmState.progress) ? llmState.progress : 0;
    const boundedProgress = Math.min(Math.max(progressValue, 0), 100).toFixed(1);
    const analyzed = llmState.analyzedChunks ?? 0;
    const total = llmState.totalChunks ?? 0;
    const chunkInfo = total > 0 ? ` (${analyzed}/${total} 청크)` : '';
    return `${boundedProgress}%${chunkInfo}`;
}

/**
 * 진행률에 따른 색상 코드 반환
 * 
 * @param {number} progress - 진행률 (0-100)
 * @returns {string} MUI 색상 코드 ('success', 'primary', 'warning')
 */
export function getProgressColor(progress = 0) {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'warning';
}
