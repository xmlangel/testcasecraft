// src/hooks/rag/useRagLlmAnalysis.js
/**
 * RAG LLM 분석 관리 Custom Hook
 * - LLM 가용성 확인, 분석 작업 관리
 * - 원래 버그 수정: checkLlmAvailability에서 getAuthHeaders is not defined 에러 해결
 */
import { useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { API_CONFIG } from '../../utils/apiConstants.js';

const IS_RAG_ENABLED = import.meta.env.VITE_ENABLE_RAG !== 'false' && import.meta.env.VITE_USE_DEMO_DATA !== 'true';

export function useRagLlmAnalysis(state, dispatch, ActionTypes, ensureRagAvailable) {
    const { api } = useAppContext();

    // ============ LLM 가용성 확인 ⭐ (원래 버그 수정!) ============
    const checkLlmAvailability = useCallback(async () => {
        if (!IS_RAG_ENABLED) {
            dispatch({ type: ActionTypes.SET_LLM_AVAILABLE, payload: false });
            return false;
        }

        dispatch({ type: ActionTypes.SET_LLM_CHECK_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });

        try {
            // 🔧 수정: api()를 사용하여 자동 토큰 관리
            const response = await api('/api/llm-configs/check-availability');

            if (!response.ok) {
                throw new Error('LLM 설정 확인 실패');
            }

            const result = await response.json();
            const isAvailable = result.data === true;

            dispatch({ type: ActionTypes.SET_LLM_AVAILABLE, payload: isAvailable });

            if (!isAvailable) {
                dispatch({
                    type: ActionTypes.SET_ERROR,
                    payload: '기본 LLM 설정이 없습니다. AI 질의응답을 사용하려면 관리자가 LLM을 기본값으로 설정해야 합니다.',
                });
            }
            return isAvailable;
        } catch (error) {
            console.error('LLM 가용성 확인 실패:', error);
            dispatch({ type: ActionTypes.SET_LLM_AVAILABLE, payload: false });
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || 'LLM 설정 확인에 실패했습니다.',
            });
            return false;
        } finally {
            dispatch({ type: ActionTypes.SET_LLM_CHECK_LOADING, payload: false });
        }
    }, [api, dispatch, ActionTypes]);

    // ============ LLM 분석 비용 추정 ============
    const estimateAnalysisCost = useCallback(async (documentId, config = {}) => {
        ensureRagAvailable('estimateAnalysisCost');

        try {
            const response = await api(
                '/api/rag/llm-analysis/estimate-cost',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        document_id: documentId,
                        llm_provider: config.llmProvider,
                        llm_model: config.llmModel,
                        prompt_template: config.promptTemplate,
                        max_tokens: config.maxTokens,
                    }),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('비용 추정 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '비용 추정에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ LLM 분석 시작 ============
    const startLlmAnalysis = useCallback(async (documentId, config = {}) => {
        ensureRagAvailable('startLlmAnalysis');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}/llm-analysis`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        llm_provider: config.llmProvider,
                        llm_model: config.llmModel,
                        llm_base_url: config.llmBaseUrl,
                        prompt_template: config.promptTemplate,
                        chunk_batch_size: config.chunkBatchSize || 10,
                        pause_after_batch: config.pauseAfterBatch !== false,
                        max_tokens: config.maxTokens,
                        temperature: config.temperature || 0.7,
                    })
                }
            );
            return await response.json();
        } catch (error) {
            console.error('LLM 분석 시작 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || 'LLM 분석 시작에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ LLM 분석 상태 조회 ============
    const getLlmAnalysisStatus = useCallback(async (documentId) => {
        ensureRagAvailable('getLlmAnalysisStatus');

        try {
            const response = await api(`/api/rag/documents/${documentId}/llm-analysis-status`);
            return await response.json();
        } catch (error) {
            console.error('분석 상태 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ LLM 분석 작업 목록 ============
    const listLlmAnalysisJobs = useCallback(async (documentId, skip = 0, limit = 100) => {
        ensureRagAvailable('listLlmAnalysisJobs');

        try {
            const url = `/api/rag/documents/${documentId}/llm-analysis-jobs?skip=${skip}&limit=${limit}`;
            const response = await api(url);
            return await response.json();
        } catch (error) {
            console.error('분석 작업 목록 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ 분석 일시정지 ============
    const pauseAnalysis = useCallback(async (documentId) => {
        ensureRagAvailable('pauseAnalysis');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}/pause-analysis`,
                { method: 'POST', body: JSON.stringify({}) }
            );
            return await response.json();
        } catch (error) {
            console.error('분석 일시정지 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '분석 일시정지에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 분석 재개 ============
    const resumeAnalysis = useCallback(async (documentId) => {
        ensureRagAvailable('resumeAnalysis');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}/resume-analysis`,
                { method: 'POST', body: JSON.stringify({}) }
            );
            return await response.json();
        } catch (error) {
            console.error('분석 재개 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '분석 재개에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 분석 취소 ============
    const cancelAnalysis = useCallback(async (documentId) => {
        ensureRagAvailable('cancelAnalysis');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}/cancel-analysis`,
                { method: 'POST', body: JSON.stringify({}) }
            );
            return await response.json();
        } catch (error) {
            console.error('분석 취소 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '분석 취소에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ LLM 분석 결과 조회 ============
    const getLlmAnalysisResults = useCallback(async (documentId, skip = 0, limit = 50) => {
        ensureRagAvailable('getLlmAnalysisResults');

        try {
            const url = `/api/rag/documents/${documentId}/llm-analysis-results?skip=${skip}&limit=${limit}`;
            const response = await api(url);
            return await response.json();
        } catch (error) {
            console.error('분석 결과 조회 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '분석 결과 조회에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 분석 요약 생성 ============
    const createAnalysisSummary = useCallback(async (summaryData) => {
        ensureRagAvailable('createAnalysisSummary');

        try {
            const response = await api(
                '/api/rag/analysis-summaries',
                {
                    method: 'POST',
                    body: JSON.stringify(summaryData),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('분석 요약 생성 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '분석 요약 생성에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 분석 요약 조회 ============
    const getAnalysisSummary = useCallback(async (summaryId) => {
        ensureRagAvailable('getAnalysisSummary');

        try {
            const response = await api(`/api/rag/analysis-summaries/${summaryId}`);
            return await response.json();
        } catch (error) {
            console.error('분석 요약 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ 분석 요약 목록 조회 ============
    const listAnalysisSummaries = useCallback(async (filters = {}) => {
        ensureRagAvailable('listAnalysisSummaries');

        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `/api/rag/analysis-summaries${queryParams ? `?${queryParams}` : ''}`;
            const response = await api(url);
            return await response.json();
        } catch (error) {
            console.error('분석 요약 목록 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ 분석 요약 수정 ============
    const updateAnalysisSummary = useCallback(async (summaryId, summaryData) => {
        ensureRagAvailable('updateAnalysisSummary');

        try {
            const response = await api(
                `/api/rag/analysis-summaries/${summaryId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(summaryData),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('분석 요약 수정 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '분석 요약 수정에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 분석 요약 삭제 ============
    const deleteAnalysisSummary = useCallback(async (summaryId) => {
        ensureRagAvailable('deleteAnalysisSummary');

        try {
            await api(`/api/rag/analysis-summaries/${summaryId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('분석 요약 삭제 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '분석 요약 삭제에 실패했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    return {
        checkLlmAvailability,
        estimateAnalysisCost,
        startLlmAnalysis,
        getLlmAnalysisStatus,
        listLlmAnalysisJobs,
        pauseAnalysis,
        resumeAnalysis,
        cancelAnalysis,
        getLlmAnalysisResults,
        createAnalysisSummary,
        getAnalysisSummary,
        listAnalysisSummaries,
        updateAnalysisSummary,
        deleteAnalysisSummary,
    };
}
