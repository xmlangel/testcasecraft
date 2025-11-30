// src/components/RAG/hooks/useLlmAnalysisStates.js
import { useState, useCallback } from 'react';
import { calculateProgress } from '../utils/llmAnalysisUtils.js';

/**
 * LLM 분석 상태 관리 커스텀 훅
 * 각 문서의 LLM 분석 상태를 조회하고 관리합니다.
 * 
 * @param {Object} params
 * @param {Array} params.documents - 문서 배열
 * @param {Function} params.getLlmAnalysisStatus - LLM 분석 상태 조회 함수
 * @param {Function} params.pauseAnalysis - 분석 일시정지 함수
 * @param {Function} params.resumeAnalysis - 분석 재개 함수
 * @param {Function} params.cancelAnalysis - 분석 취소 함수
 * @param {Function} params.showStatusNotice - 상태 알림 표시 함수
 * @param {Function} params.setLocalError - 로컬 에러 설정 함수
 * @param {Function} params.t - 번역 함수
 * @returns {Object} LLM 분석 상태 관리 객체
 */
export function useLlmAnalysisStates({
    documents,
    getLlmAnalysisStatus,
    pauseAnalysis,
    resumeAnalysis,
    cancelAnalysis,
    showStatusNotice,
    setLocalError,
    t,
}) {
    const [llmAnalysisStates, setLlmAnalysisStates] = useState({});

    /**
     * LLM 분석 상태 조회
     */
    const loadLlmAnalysisStates = useCallback(async () => {
        if (!documents || documents.length === 0) {
            return;
        }

        const newStates = {};

        // 각 문서의 LLM 분석 상태 조회
        await Promise.all(
            documents.map(async (doc) => {
                // testcase_로 시작하는 문서는 제외
                if (doc.fileName?.startsWith('testcase_')) {
                    return;
                }

                try {
                    const status = await getLlmAnalysisStatus(doc.id);
                    const totalChunks = status.progress?.totalChunks || doc.totalChunks || 0;
                    const processedChunks = status.progress?.processedChunks || 0;
                    const progress = calculateProgress(processedChunks, totalChunks);

                    newStates[doc.id] = {
                        status: status.status || 'not_started',
                        progress,
                        analyzedChunks: processedChunks,
                        totalChunks,
                        // 작업 상세 정보
                        llmProvider: status.llmProvider,
                        llmModel: status.llmModel,
                        totalCostUsd: status.totalCostUsd,
                        totalTokens: status.totalTokens,
                        startedAt: status.startedAt,
                        completedAt: status.completedAt,
                        errorMessage: status.errorMessage,
                    };
                } catch (err) {
                    // 404 에러는 분석 작업이 없는 것으로 처리
                    if (err.response?.status === 404) {
                        newStates[doc.id] = {
                            status: 'not_started',
                            progress: 0,
                            analyzedChunks: 0,
                            totalChunks: doc.totalChunks || 0,
                        };
                    } else {
                        console.error(`LLM 분석 상태 조회 실패 (${doc.fileName}):`, err);
                        newStates[doc.id] = {
                            status: 'error',
                            progress: 0,
                            analyzedChunks: 0,
                            totalChunks: doc.totalChunks || 0,
                        };
                    }
                }
            })
        );

        setLlmAnalysisStates(newStates);
    }, [documents, getLlmAnalysisStatus]);

    /**
     * 작업 제어: 일시정지
     */
    const handlePauseJob = useCallback(async (documentId) => {
        const llmState = llmAnalysisStates[documentId];
        if (!llmState || llmState.status !== 'processing') {
            showStatusNotice(t('rag.document.alert.pauseUnavailable', '진행 중인 작업만 일시정지할 수 있습니다.'), 'warning');
            return;
        }
        try {
            await pauseAnalysis(documentId);
            await loadLlmAnalysisStates(); // 상태 새로고침
        } catch (err) {
            console.error('일시정지 실패:', err);
            setLocalError('일시정지에 실패했습니다.');
            setTimeout(() => setLocalError(null), 5000);
        }
    }, [llmAnalysisStates, pauseAnalysis, loadLlmAnalysisStates, showStatusNotice, setLocalError, t]);

    /**
     * 작업 제어: 재개
     */
    const handleResumeJob = useCallback(async (documentId) => {
        const llmState = llmAnalysisStates[documentId];
        if (!llmState) {
            showStatusNotice(t('rag.document.alert.statusLoading', '작업 상태를 불러오는 중입니다. 잠시 후 다시 시도해주세요.'), 'info');
            return;
        }
        if (llmState.status === 'processing' || llmState.status === 'pending' || llmState.status === 'resuming') {
            const progressValue = Number.isFinite(llmState.progress) ? llmState.progress : 0;
            const analyzed = llmState.analyzedChunks ?? 0;
            const total = llmState.totalChunks ?? 0;
            const progressSummary = total > 0 ? `${progressValue.toFixed(1)}% (${analyzed}/${total} 청크)` : `${progressValue.toFixed(1)}%`;
            const defaultMessage = progressSummary
                ? `이미 분석이 진행 중입니다. (진행율: ${progressSummary})`
                : '이미 분석이 진행 중입니다.';
            showStatusNotice(
                progressSummary
                    ? t('rag.document.alert.alreadyProcessingWithProgress', defaultMessage)
                    : t('rag.document.alert.alreadyProcessing', defaultMessage),
                'info'
            );
            return;
        }
        if (llmState.status !== 'paused') {
            showStatusNotice(t('rag.document.alert.resumeUnavailable', '일시정지된 작업만 재개할 수 있습니다.'), 'warning');
            return;
        }
        try {
            await resumeAnalysis(documentId);
            await loadLlmAnalysisStates(); // 상태 새로고침
        } catch (err) {
            console.error('재개 실패:', err);
            setLocalError('재개에 실패했습니다.');
            setTimeout(() => setLocalError(null), 5000);
        }
    }, [llmAnalysisStates, resumeAnalysis, loadLlmAnalysisStates, showStatusNotice, setLocalError, t]);

    /**
     * 작업 제어: 취소
     */
    const handleCancelJob = useCallback(async (documentId, documentName) => {
        if (!window.confirm(`"${documentName}" 문서의 분석을 취소하시겠습니까? 지금까지의 결과는 보존됩니다.`)) {
            return;
        }

        try {
            await cancelAnalysis(documentId);
            await loadLlmAnalysisStates(); // 상태 새로고침
        } catch (err) {
            console.error('취소 실패:', err);
            setLocalError('취소에 실패했습니다.');
            setTimeout(() => setLocalError(null), 5000);
        }
    }, [cancelAnalysis, loadLlmAnalysisStates, setLocalError]);

    return {
        llmAnalysisStates,
        loadLlmAnalysisStates,
        handlePauseJob,
        handleResumeJob,
        handleCancelJob,
    };
}
