// src/hooks/rag/useRagDocuments.js
/**
 * RAG 문서 관리 Custom Hook
 * - 문서 업로드, 분석, 삭제, 조회 등 문서 관련 모든 기능
 */
import { useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { API_CONFIG } from '../../utils/apiConstants.js';

import { debugLog } from '../../utils/logger.js';

const IS_RAG_ENABLED = import.meta.env.VITE_ENABLE_RAG !== 'false' && import.meta.env.VITE_USE_DEMO_DATA !== 'true';

export function useRagDocuments(state, dispatch, ActionTypes, ensureRagAvailable, requestCache) {
    const { api } = useAppContext();

    // ============ 문서 업로드 ============
    const uploadDocument = useCallback(async (file, projectId, uploadedBy = null) => {
        ensureRagAvailable('uploadDocument');

        const uploadingFile = {
            id: Date.now(),
            name: file.name,
            size: file.size,
            progress: 0,
        };

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.ADD_UPLOADING_FILE, payload: uploadingFile });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', projectId);
            if (uploadedBy) {
                formData.append('uploadedBy', uploadedBy);
            }

            const response = await api(
                `/api/rag/documents/upload`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': undefined, // Browser will set multipart/form-data automatically
                    },
                    body: formData,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        dispatch({
                            type: ActionTypes.SET_UPLOADING_FILES,
                            payload: state.uploadingFiles.map(f =>
                                f.id === uploadingFile.id ? { ...f, progress: percentCompleted } : f
                            )
                        });
                    },
                }
            );

            const uploadedDoc = await response.json();
            dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: uploadedDoc });
            dispatch({ type: ActionTypes.REMOVE_UPLOADING_FILE, payload: uploadingFile.id });
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });

            return uploadedDoc;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '문서 업로드에 실패했습니다.'
            });
            dispatch({ type: ActionTypes.REMOVE_UPLOADING_FILE, payload: uploadingFile.id });
            throw error;
        }
    }, [api, state.uploadingFiles, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 분석 ============
    const analyzeDocument = useCallback(async (documentId, parser = 'pymupdf4llm') => {
        ensureRagAvailable('analyzeDocument');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const url = `/api/rag/documents/${documentId}/analyze?parser=${encodeURIComponent(parser)}`;
            const response = await api(url, { method: 'POST', body: JSON.stringify(null) });

            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            const result = await response.json();
            return result;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '문서 분석에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 분석 완료 대기 (폴링) ============
    const waitForDocumentAnalysis = useCallback(async (
        documentId,
        { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
    ) => {
        ensureRagAvailable('waitForDocumentAnalysis');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        const startedAt = Date.now();

        try {
            while (Date.now() - startedAt < timeoutMs) {
                let document;

                try {
                    const response = await api(`/api/rag/documents/${documentId}`);
                    document = await response.json();

                    if (document) {
                        dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
                        dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: document });
                    }
                } catch (error) {
                    const message = error?.message
                        || 'Document analysis status check failed.';
                    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
                    throw new Error(message);
                }

                const status = document?.analysisStatus?.toLowerCase();
                if (status === 'completed') {
                    return document;
                }

                if (status === 'failed') {
                    const message = '문서 분석에 실패했습니다.';
                    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
                    throw new Error(message);
                }

                await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }

            const timeoutMessage = '문서 분석이 제한 시간 내에 완료되지 않았습니다.';
            dispatch({ type: ActionTypes.SET_ERROR, payload: timeoutMessage });
            throw new Error(timeoutMessage);
        } finally {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 임베딩 생성 완료 대기 (폴링) ============
    const waitForEmbeddingGeneration = useCallback(async (
        documentId,
        { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
    ) => {
        ensureRagAvailable('waitForEmbeddingGeneration');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        const startedAt = Date.now();

        try {
            while (Date.now() - startedAt < timeoutMs) {
                let document;

                try {
                    const response = await api(`/api/rag/documents/${documentId}`);
                    document = await response.json();

                    if (document) {
                        dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
                        dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: document });
                    }
                } catch (error) {
                    const message = error.response?.data?.message
                        || error.message
                        || '임베딩 상태 조회에 실패했습니다.';
                    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
                    throw new Error(message);
                }

                const status = document?.embeddingStatus?.toLowerCase();
                if (status === 'completed') {
                    return document;
                }

                if (status === 'failed') {
                    const message = '임베딩 생성에 실패했습니다.';
                    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
                    throw new Error(message);
                }

                await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }

            const timeoutMessage = '임베딩 생성이 제한 시간 내에 완료되지 않았습니다.';
            dispatch({ type: ActionTypes.SET_ERROR, payload: timeoutMessage });
            throw new Error(timeoutMessage);
        } finally {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 임베딩 생성 ============
    const generateEmbeddings = useCallback(async (documentId, systemPrompt = null) => {
        ensureRagAvailable('generateEmbeddings');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const response = await api(
                `/api/rag/embeddings/generate?documentId=${documentId}`,
                {
                    method: 'POST',
                    body: JSON.stringify({}),
                }
            );

            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            const result = await response.json();
            return result;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '임베딩 생성에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 ID로 조회 ============
    const fetchDocumentById = useCallback(async (documentId) => {
        ensureRagAvailable('fetchDocumentById');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const response = await api(`/api/rag/documents/${documentId}`);
            const document = await response.json();

            dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: document });
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });

            return document;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '문서 조회에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 목록 조회 (페이지네이션) ============
    const listDocuments = useCallback(async (projectId, page = 1, pageSize = 20) => {
        ensureRagAvailable('listDocuments');

        const cacheKey = `listDocuments:${projectId}:${page}:${pageSize}`;
        if (requestCache && requestCache.current.has(cacheKey)) {
            debugLog('useRagDocuments', 'Skipping duplicate listDocuments call:', cacheKey);
            return requestCache.current.get(cacheKey);
        }

        const promise = (async () => {
            dispatch({ type: ActionTypes.CLEAR_ERROR });
            dispatch({ type: ActionTypes.SET_LOADING, payload: true });

            try {
                const url = `/api/rag/documents?projectId=${encodeURIComponent(projectId)}&page=${page}&size=${pageSize}`;
                const response = await api(url);
                const data = await response.json();

                const documents = data.items || data.documents || [];
                const total = data.total || 0;

                dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: documents });
                dispatch({
                    type: ActionTypes.SET_PAGINATION,
                    payload: { total, page, pageSize }
                });
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });

                return { documents, total, page, pageSize };
            } catch (error) {
                dispatch({
                    type: ActionTypes.SET_ERROR,
                    payload: error.response?.data?.message || '문서 목록 조회에 실패했습니다.'
                });
                throw error;
            } finally {
                requestCache.current.delete(cacheKey);
            }
        })();

        if (requestCache) {
            requestCache.current.set(cacheKey, promise);
        }
        return promise;

    }, [api, ensureRagAvailable, dispatch, ActionTypes, requestCache]);

    // ============ 문서 삭제 ============
    const deleteDocument = useCallback(async (documentId) => {
        ensureRagAvailable('deleteDocument');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            await api(`/api/rag/documents/${documentId}`, { method: 'DELETE' });

            dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: documentId });
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '문서 삭제에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 다운로드 ============
    const downloadDocument = useCallback(async (documentId, fileName) => {
        ensureRagAvailable('downloadDocument');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const response = await api(`/api/rag/documents/${documentId}/download`);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'document.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '문서 다운로드에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 청크 조회 ============
    const getDocumentChunks = useCallback(async (documentId, page = 1, pageSize = 20) => {
        ensureRagAvailable('getDocumentChunks');

        try {
            const url = `/api/rag/documents/${documentId}/chunks?page=${page}&page_size=${pageSize}`;
            const response = await api(url);
            return await response.json();
        } catch (error) {
            console.error('청크 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ 문서 Blob 조회 (미리보기용) ============
    const fetchDocumentBlob = useCallback(async (documentId) => {
        ensureRagAvailable('fetchDocumentBlob');

        try {
            const response = await api(`/api/rag/documents/${documentId}/download`);
            return await response.blob();
        } catch (error) {
            console.error('문서 Blob 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    return {
        uploadDocument,
        analyzeDocument,
        waitForDocumentAnalysis,
        waitForEmbeddingGeneration,
        generateEmbeddings,
        fetchDocumentById,
        listDocuments,
        deleteDocument,
        downloadDocument,
        getDocumentChunks,
        fetchDocumentBlob,
    };
}
