// src/components/RAG/hooks/useJobHistory.js
import { useState, useCallback } from 'react';
import { DOCUMENT_LIST_CONSTANTS } from '../constants.js';

/**
 * 작업 이력 관리 커스텀 훅
 * 문서별 LLM 분석 작업 이력을 조회하고 표시합니다.
 * 
 * @param {Object} params
 * @param {string} params.projectId - 프로젝트 ID
 * @param {Function} params.listLlmAnalysisJobs - LLM 분석 작업 목록 조회 함수
 * @param {Function} params.setLocalError - 로컬 에러 설정 함수
 * @returns {Object} 작업 이력 관리 객체
 */
export function useJobHistory({ projectId, listLlmAnalysisJobs, setLocalError }) {
    const [jobHistoryDialogOpen, setJobHistoryDialogOpen] = useState(false);
    const [selectedJobHistory, setSelectedJobHistory] = useState(null);
    const [loadingJobHistory, setLoadingJobHistory] = useState(false);

    /**
     * 작업 이력 보기
     */
    const handleViewJobHistory = useCallback(async (doc) => {
        setSelectedJobHistory({
            documentId: doc.id,
            fileName: doc.fileName,
            jobs: [],
        });
        setJobHistoryDialogOpen(true);
        setLoadingJobHistory(true);

        try {
            // 해당 문서의 모든 작업 이력 조회 (페이지 크기를 크게 설정하여 모든 작업 조회)
            const response = await listLlmAnalysisJobs(
                projectId,
                null,
                1,
                DOCUMENT_LIST_CONSTANTS.JOB_HISTORY_MAX_SIZE
            );

            // documentId로 필터링
            const filteredJobs = response.jobs?.filter(job => job.documentId === doc.id) || [];

            setSelectedJobHistory({
                documentId: doc.id,
                fileName: doc.fileName,
                jobs: filteredJobs,
            });
        } catch (err) {
            console.error('작업 이력 조회 실패:', err);
            setLocalError('작업 이력 조회에 실패했습니다.');
            setTimeout(() => setLocalError(null), DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
        } finally {
            setLoadingJobHistory(false);
        }
    }, [projectId, listLlmAnalysisJobs, setLocalError]);

    /**
     * 작업 이력 다이얼로그 닫기
     */
    const handleCloseJobHistory = useCallback(() => {
        setJobHistoryDialogOpen(false);
        setSelectedJobHistory(null);
    }, []);

    return {
        jobHistoryDialogOpen,
        selectedJobHistory,
        loadingJobHistory,
        handleViewJobHistory,
        handleCloseJobHistory,
    };
}
