// src/components/RAG/hooks/useDocumentActions.js
import { useState, useCallback } from 'react';
import { DOCUMENT_LIST_CONSTANTS } from '../constants.js';

/**
 * 문서 액션 핸들러 커스텀 훅
 * 문서 삭제, 다운로드, 분석, 임베딩 생성, 미리보기, 청크 보기 등의 액션을 제공합니다.
 * 
 * @param {Object} params
 * @param {Function} params.deleteDocument - 문서 삭제 함수
 * @param {Function} params.downloadDocument - 문서 다운로드 함수
 * @param {Function} params.analyzeDocument - 문서 분석 함수
 * @param {Function} params.generateEmbeddings - 임베딩 생성 함수
 * @param {Function} params.loadDocuments - 문서 목록 새로고침 함수
 * @param {Function} params.setLocalError - 로컬 에러 설정 함수
 * @param {Function} params.onViewChunks - 청크 보기 콜백 (외부에서 제공)
 * @returns {Object} 문서 액션 관리 객체
 */
export function useDocumentActions({
    deleteDocument,
    downloadDocument,
    analyzeDocument,
    generateEmbeddings,
    loadDocuments,
    setLocalError,
    onViewChunks,
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [previewDialogState, setPreviewDialogState] = useState({ open: false, document: null });
    const [chunksDialogState, setChunksDialogState] = useState({ open: false, document: null });

    /**
     * 삭제 다이얼로그 열기
     */
    const handleDeleteClick = useCallback((documentId) => {
        setSelectedDocumentId(documentId);
        setDeleteDialogOpen(true);
    }, []);

    /**
     * 삭제 확인
     */
    const handleDeleteConfirm = useCallback(async () => {
        if (selectedDocumentId) {
            try {
                setLocalError(null);
                await deleteDocument(selectedDocumentId);
                setDeleteDialogOpen(false);
                setSelectedDocumentId(null);
                // 문서 목록 새로고침
                await loadDocuments();
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || '문서 삭제에 실패했습니다.';
                setLocalError(errorMessage);
                setDeleteDialogOpen(false);
                setSelectedDocumentId(null);

                // 자동으로 오류 메시지 제거
                setTimeout(() => {
                    setLocalError(null);
                }, DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
            }
        }
    }, [selectedDocumentId, deleteDocument, loadDocuments, setLocalError]);

    /**
     * 삭제 취소
     */
    const handleDeleteCancel = useCallback(() => {
        setDeleteDialogOpen(false);
        setSelectedDocumentId(null);
    }, []);

    /**
     * 문서 다운로드
     */
    const handleDownloadClick = useCallback(async (documentId, fileName) => {
        try {
            setLocalError(null);
            await downloadDocument(documentId, fileName);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || '문서 다운로드에 실패했습니다.';
            setLocalError(errorMessage);

            // 자동으로 오류 메시지 제거
            setTimeout(() => {
                setLocalError(null);
            }, DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
        }
    }, [downloadDocument, setLocalError]);

    /**
     * 문서 분석
     */
    const handleAnalyzeClick = useCallback(async (doc) => {
        if (!window.confirm(`문서 "${doc.fileName}"을 분석하시겠습니까?`)) {
            return;
        }

        try {
            setLocalError(null);
            await analyzeDocument(doc.id);
            // 문서 목록 새로고침
            await loadDocuments();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || '문서 분석에 실패했습니다.';
            setLocalError(errorMessage);

            // 자동으로 오류 메시지 제거
            setTimeout(() => {
                setLocalError(null);
            }, DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
        }
    }, [analyzeDocument, loadDocuments, setLocalError]);

    /**
     * 임베딩 생성
     */
    const handleGenerateEmbeddingsClick = useCallback(async (doc) => {
        if (!window.confirm(`문서 "${doc.fileName}"의 임베딩을 생성하시겠습니까?`)) {
            return;
        }

        try {
            setLocalError(null);
            await generateEmbeddings(doc.id);
            // 문서 목록 새로고침
            await loadDocuments();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || '임베딩 생성에 실패했습니다.';
            setLocalError(errorMessage);

            // 자동으로 오류 메시지 제거
            setTimeout(() => {
                setLocalError(null);
            }, DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
        }
    }, [generateEmbeddings, loadDocuments, setLocalError]);

    /**
     * PDF 미리보기
     */
    const handlePreviewClick = useCallback(async (doc) => {
        if (!doc || !doc.id || !doc.fileName) return;

        // PDF 파일인지 확인
        const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            return;
        }

        setPreviewDialogState({ open: true, document: doc });
    }, []);

    /**
     * 미리보기 닫기
     */
    const handleClosePreview = useCallback(() => {
        setPreviewDialogState({ open: false, document: null });
    }, []);

    /**
     * 청크 보기
     */
    const handleViewChunksAction = useCallback((doc) => {
        if (!doc) return;
        if (onViewChunks) {
            onViewChunks(doc);
        } else {
            setChunksDialogState({ open: true, document: doc });
        }
    }, [onViewChunks]);

    /**
     * 청크 다이얼로그 닫기
     */
    const handleCloseChunksDialog = useCallback(() => {
        setChunksDialogState({ open: false, document: null });
    }, []);

    return {
        deleteDialogOpen,
        selectedDocumentId,
        previewDialogState,
        chunksDialogState,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleDownloadClick,
        handleAnalyzeClick,
        handleGenerateEmbeddingsClick,
        handlePreviewClick,
        handleClosePreview,
        handleViewChunksAction,
        handleCloseChunksDialog,
    };
}
