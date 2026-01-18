// src/components/RAG/hooks/useDocumentList.js
import { useState, useCallback } from 'react';
import { DOCUMENT_LIST_CONSTANTS } from '../constants.js';

/**
 * 문서 목록 관리 커스텀 훅
 * 페이지네이션과 문서 로드 기능을 제공합니다.
 * 
 * @param {Object} params
 * @param {string} params.projectId - 프로젝트 ID
 * @param {Function} params.listDocuments - 문서 목록 조회 함수
 * @param {Function} params.setLocalError - 로컬 에러 설정 함수
 * @returns {Object} 문서 목록 관리 객체
 */
export function useDocumentList({ projectId, listDocuments, setLocalError }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DOCUMENT_LIST_CONSTANTS.DEFAULT_ROWS_PER_PAGE);
    const [isRefreshing, setIsRefreshing] = useState(false);

    /**
     * 문서 목록 로드
     */
    const loadDocuments = useCallback(async () => {
        if (projectId) {
            try {
                setLocalError(null);
                // API는 1-based 페이지를 사용하므로 +1
                await listDocuments(projectId, page + 1, rowsPerPage);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '문서 목록 조회에 실패했습니다.';
                setLocalError(errorMessage);

                // 자동으로 오류 메시지 제거
                setTimeout(() => {
                    setLocalError(null);
                }, DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
            }
        }
    }, [projectId, page, rowsPerPage, listDocuments, setLocalError]);

    /**
     * 문서 목록 새로고침
     */
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await loadDocuments();
        } finally {
            setIsRefreshing(false);
        }
    }, [loadDocuments]);

    /**
     * 페이지 변경 핸들러
     */
    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    /**
     * 페이지당 행 수 변경 핸들러
     */
    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    return {
        page,
        rowsPerPage,
        isRefreshing,
        loadDocuments,
        handleRefresh,
        handleChangePage,
        handleChangeRowsPerPage,
    };
}
