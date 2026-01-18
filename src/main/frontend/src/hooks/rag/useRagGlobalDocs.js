// src/hooks/rag/useRagGlobalDocs.js
/**
 * RAG 전역 문서 관리 Custom Hook
 * - 전역 문서 등록/승인/거부
 */
import { useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

export function useRagGlobalDocs(state, dispatch, ActionTypes, ensureRagAvailable) {
    const { api } = useAppContext();

    // ============ 전역 문서 목록 조회 ============
    const listGlobalDocuments = useCallback(async (page = 1, pageSize = 20) => {
        ensureRagAvailable('listGlobalDocuments');

        try {
            const url = `/api/rag/global-documents?page=${page}&page_size=${pageSize}`;
            const response = await api(url);
            return await response.json();
        } catch (error) {
            console.error('전역 문서 목록 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ 전역 문서 등록 요청 생성 ============
    const createGlobalDocumentRequest = useCallback(async (documentId, reason = '') => {
        ensureRagAvailable('createGlobalDocumentRequest');

        try {
            const response = await api(
                '/api/rag/global-documents/requests',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        document_id: documentId,
                        reason,
                    }),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('전역 문서 요청 생성 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '전역 문서 요청 생성에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 전역 문서 등록 요청 목록 ============
    const listGlobalDocumentRequests = useCallback(async (status = null, page = 1, pageSize = 20) => {
        ensureRagAvailable('listGlobalDocumentRequests');

        try {
            let url = `/api/rag/global-document-requests?page=${page}&page_size=${pageSize}`;
            if (status) {
                url += `&status=${encodeURIComponent(status)}`;
            }
            const response = await api(url);
            return await response.json();
        } catch (error) {
            console.error('전역 문서 요청 목록 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    // ============ 전역 문서 요청 승인 ============
    const approveGlobalDocumentRequest = useCallback(async (requestId) => {
        ensureRagAvailable('approveGlobalDocumentRequest');

        try {
            const response = await api(
                `/api/rag/global-document-requests/${requestId}/approve`,
                { method: 'POST', body: JSON.stringify({}) }
            );
            return await response.json();
        } catch (error) {
            console.error('전역 문서 요청 승인 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '전역 문서 요청 승인에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 전역 문서 요청 거부 ============
    const rejectGlobalDocumentRequest = useCallback(async (requestId, reason = '') => {
        ensureRagAvailable('rejectGlobalDocumentRequest');

        try {
            const response = await api(
                `/api/rag/global-document-requests/${requestId}/reject`,
                {
                    method: 'POST',
                    body: JSON.stringify({ reason }),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('전역 문서 요청 거부 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '전역 문서 요청 거부에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 전역 문서 삭제 ============
    const deleteGlobalDocument = useCallback(async (documentId) => {
        ensureRagAvailable('deleteGlobalDocument');

        try {
            await api(`/api/rag/global-documents/${documentId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('전역 문서 삭제 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '전역 문서 삭제에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 문서 업데이트 ============
    const updateDocument = useCallback(async (documentId, updateData) => {
        ensureRagAvailable('updateDocument');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(updateData),
                }
            );

            const document = await response.json();
            dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
            return document;
        } catch (error) {
            console.error('문서 업데이트 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '문서 업데이트에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 프로젝트 문서를 공통 문서로 이동 (관리자용) ============
    const promoteDocumentToGlobal = useCallback(async (documentId, reason = null) => {
        ensureRagAvailable('promoteDocumentToGlobal');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}/promote-to-global`,
                {
                    method: 'POST',
                    body: JSON.stringify({ reason }),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('문서를 공통 문서로 이동 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '문서를 공통 문서로 이동하는 데 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 공통 문서 등록 요청 (일반 사용자용) ============
    const requestPromoteDocument = useCallback(async (documentId, message = null) => {
        ensureRagAvailable('requestPromoteDocument');

        try {
            const response = await api(
                `/api/rag/documents/${documentId}/global-request`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        message: message,
                    }),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('공통 문서 등록 요청 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.message || '공통 문서 등록 요청에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    return {
        listGlobalDocuments,
        createGlobalDocumentRequest,
        listGlobalDocumentRequests,
        approveGlobalDocumentRequest,
        rejectGlobalDocumentRequest,
        deleteGlobalDocument,
        updateDocument,
        promoteDocumentToGlobal,
        requestPromoteDocument,
    };
}
