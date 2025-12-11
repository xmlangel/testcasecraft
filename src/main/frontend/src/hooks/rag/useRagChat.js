// src/hooks/rag/useRagChat.js
/**
 * RAG 채팅 및 스레드 관리 Custom Hook
 * - 채팅, 스트리밍, 스레드 및 카테고리 관리
 */
import { useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { API_CONFIG } from '../../utils/apiConstants.js';
import { debugLog } from '../../utils/logger.js';

const IS_RAG_ENABLED = import.meta.env.VITE_ENABLE_RAG !== 'false' && import.meta.env.VITE_USE_DEMO_DATA !== 'true';

export function useRagChat(state, dispatch, ActionTypes, ensureRagAvailable, requestCache) {
    const { api, ensureValidToken } = useAppContext(); // ensureValidToken 추가

    // ============ 채팅 스레드 목록 조회 ============
    const listChatThreads = useCallback(async (projectId) => {
        ensureRagAvailable('listChatThreads');

        const cacheKey = `listChatThreads:${projectId}`;
        if (requestCache && requestCache.current.has(cacheKey)) {
            debugLog('useRagChat', '⏭️ [listChatThreads] Deduplicating request for:', projectId);
            return requestCache.current.get(cacheKey);
        }

        const promise = (async () => {
            try {
                const url = `/api/rag/chat/conversations/threads?projectId=${encodeURIComponent(projectId)}`;
                const response = await api(url);
                const data = await response.json();

                // 백엔드가 배열을 직접 반환하는 경우와 객체로 감싼 경우 모두 처리
                const threads = Array.isArray(data) ? data : (data.threads || []);
                debugLog('useRagChat', '🔧 [listChatThreads] Parsed threads:', threads.length);
                dispatch({ type: ActionTypes.SET_THREADS, payload: threads });
                return threads;
            } catch (error) {
                console.error('스레드 목록 조회 실패:', error);
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

    // ============ 채팅 카테고리 목록 조회 ============
    const listChatCategories = useCallback(async (projectId) => {
        ensureRagAvailable('listChatCategories');

        const cacheKey = `listChatCategories:${projectId}`;
        if (requestCache && requestCache.current.has(cacheKey)) {
            debugLog('useRagChat', '⏭️ [listChatCategories] Deduplicating request for:', projectId);
            return requestCache.current.get(cacheKey);
        }

        const promise = (async () => {
            try {
                const url = `/api/rag/chat/conversations/categories?projectId=${encodeURIComponent(projectId)}`;
                const response = await api(url);
                const data = await response.json();

                const categories = data.categories || [];
                dispatch({ type: ActionTypes.SET_CATEGORIES, payload: categories });
                return categories;
            } catch (error) {
                console.error('카테고리 목록 조회 실패:', error);
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

    // ============ 스레드 메시지 조회 ============
    const fetchThreadMessages = useCallback(async (threadId) => {
        ensureRagAvailable('fetchThreadMessages');

        dispatch({ type: ActionTypes.SET_THREAD_LOADING, payload: true });

        try {
            const response = await api(`/api/rag/chat/conversations/threads/${threadId}/messages`);
            const data = await response.json();
            const messages = data || [];

            dispatch({
                type: ActionTypes.SET_THREAD_MESSAGES,
                payload: { threadId, messages },
            });
            dispatch({ type: ActionTypes.SET_THREAD_LOADING, payload: false });

            return messages;
        } catch (error) {
            console.error('스레드 메시지 조회 실패:', error);
            dispatch({ type: ActionTypes.SET_THREAD_LOADING, payload: false });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 채팅 스레드 생성 ============
    const createChatThread = useCallback(async ({ projectId, title, description, categoryIds }) => {
        ensureRagAvailable('createChatThread');

        try {
            const response = await api(
                '/api/rag/chat/conversations/threads',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        project_id: projectId,
                        title,
                        description,
                        category_ids: categoryIds,
                    }),
                }
            );

            const thread = await response.json();
            dispatch({ type: ActionTypes.UPSERT_THREAD, payload: thread });
            return thread;
        } catch (error) {
            console.error('스레드 생성 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 채팅 스레드 수정 ============
    const updateChatThread = useCallback(async ({ threadId, title, description, archived, categoryIds }) => {
        ensureRagAvailable('updateChatThread');

        try {
            const response = await api(
                `/api/rag/chat/conversations/threads/${threadId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title,
                        description,
                        archived,
                        category_ids: categoryIds,
                    }),
                }
            );

            const thread = await response.json();
            dispatch({ type: ActionTypes.UPSERT_THREAD, payload: thread });
            return thread;
        } catch (error) {
            console.error('스레드 수정 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 채팅 스레드 삭제 ============
    const deleteChatThread = useCallback(async (threadId) => {
        ensureRagAvailable('deleteChatThread');

        try {
            await api(`/api/rag/chat/conversations/threads/${threadId}`, { method: 'DELETE' });
            dispatch({ type: ActionTypes.REMOVE_THREAD, payload: threadId });
        } catch (error) {
            console.error('스레드 삭제 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 카테고리 수정 ============
    const updateThreadCategory = useCallback(async (threadId, categoryId, categoryName) => {
        ensureRagAvailable('updateThreadCategory');

        try {
            const response = await api(
                `/api/rag/chat/conversations/threads/${threadId}/category`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        category_id: categoryId,
                        category_name: categoryName,
                    }),
                }
            );

            const thread = await response.json();
            dispatch({ type: ActionTypes.UPSERT_THREAD, payload: thread });
            return thread;
        } catch (error) {
            console.error('카테고리 수정 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 카테고리 삭제 ============
    const deleteThreadCategory = useCallback(async (threadId) => {
        ensureRagAvailable('deleteThreadCategory');

        try {
            const response = await api(
                `/api/rag/chat/conversations/threads/${threadId}/category`,
                { method: 'DELETE' }
            );

            const thread = await response.json();
            dispatch({ type: ActionTypes.UPSERT_THREAD, payload: thread });
            return thread;
        } catch (error) {
            console.error('카테고리 삭제 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 일반 채팅 (응답 한 번에) ============
    const chat = useCallback(async (projectId, message, options = {}) => {
        ensureRagAvailable('chat');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const {
                conversationHistory,
                threadId,
                categoryIds,
                persistConversation: persistOverride,
                ...requestOptions
            } = options || {};

            const resolvedThreadId = threadId ?? state.selectedThreadId;
            const resolvedCategoryIds = categoryIds;
            const shouldPersist = persistOverride ?? state.persistConversation;

            const payload = {
                projectId,
                message,
                ...requestOptions,
                persistConversation: shouldPersist,
            };

            if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
                payload.conversationHistory = conversationHistory;
            }

            if (shouldPersist) {
                if (resolvedThreadId) {
                    payload.threadId = resolvedThreadId;
                }
                if (Array.isArray(resolvedCategoryIds) && resolvedCategoryIds.length > 0) {
                    payload.categoryIds = resolvedCategoryIds;
                }
            }

            const response = await api(
                '/api/rag/chat',
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                }
            );

            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            return await response.json();
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '채팅 요청에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, state.persistConversation, state.selectedThreadId, dispatch, ActionTypes]);

    // ============ 스트리밍 채팅 (SSE) ============
    const chatStream = useCallback(async (
        projectId,
        message,
        onChunk,
        onComplete,
        onError,
        options = {}
    ) => {
        ensureRagAvailable('chatStream');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const {
                onContext,
                conversationHistory,
                threadId,
                categoryIds,
                persistConversation: persistOverride,
                signal,
                ...requestOptions
            } = options || {};

            const resolvedThreadId = threadId ?? state.selectedThreadId;
            const resolvedCategoryIds = categoryIds;
            const shouldPersist = persistOverride ?? state.persistConversation;

            const payload = {
                projectId,
                message,
                ...requestOptions,
                persistConversation: shouldPersist,
            };

            if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
                payload.conversationHistory = conversationHistory;
            }

            if (shouldPersist) {
                if (resolvedThreadId) {
                    payload.threadId = resolvedThreadId;
                }
                if (Array.isArray(resolvedCategoryIds) && resolvedCategoryIds.length > 0) {
                    payload.categoryIds = resolvedCategoryIds;
                }
            }

            const onContextCallback = typeof onContext === 'function' ? onContext : null;

            // 🔧 토큰 검증 및 갱신 (SSE 시작 전)
            let validToken;
            try {
                validToken = await ensureValidToken();
            } catch (error) {
                console.error('토큰 검증 실패:', error);
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                if (onError) {
                    onError(error);
                } else {
                    dispatch({
                        type: ActionTypes.SET_ERROR,
                        payload: error.message || '인증에 실패했습니다. 다시 로그인해주세요.'
                    });
                }
                throw error;
            }

            // SSE 요청 시작 (검증된 토큰 사용)
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/rag/chat/stream`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${validToken}`,
                    },
                    body: JSON.stringify(payload),
                    signal,
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('스트리밍 응답을 지원하지 않는 환경입니다.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let currentEvent = null;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
                    if (onComplete) onComplete();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEvent = line.substring(6).trim();
                    } else if (line.startsWith('data:')) {
                        const data = line.substring(5).trim();

                        if (!data || data === '[DONE]') {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);

                            if (currentEvent === 'context' && onContextCallback) {
                                onContextCallback(parsed);
                            } else if (currentEvent === 'message' || currentEvent === 'chunk') {
                                if (onChunk) {
                                    onChunk(parsed.content || parsed.chunk || '');
                                }
                            }
                        } catch (parseError) {
                            console.error('SSE 파싱 에러:', parseError, data);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('스트리밍 채팅 에러:', error);
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            if (onError) {
                onError(error);
            } else {
                dispatch({
                    type: ActionTypes.SET_ERROR,
                    payload: error.message || '채팅 스트리밍에 실패했습니다.'
                });
            }
            throw error;
        }
    }, [ensureValidToken, ensureRagAvailable, state.persistConversation, state.selectedThreadId, dispatch, ActionTypes]);

    // ============ 채팅 메시지 편집 ============
    const editChatMessage = useCallback(async ({ messageId, content, metadata }) => {
        ensureRagAvailable('editChatMessage');

        try {
            const response = await api(
                `/api/rag/chat/conversations/messages/${messageId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        content,
                        metadata: metadata || {},
                    }),
                }
            );
            return await response.json();
        } catch (error) {
            console.error('채팅 메시지 편집 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '채팅 메시지를 편집하지 못했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 채팅 메시지 삭제 ============
    const deleteChatMessage = useCallback(async (messageId) => {
        ensureRagAvailable('deleteChatMessage');
        if (!messageId) {
            throw new Error('messageId가 필요합니다.');
        }

        try {
            await api(`/api/rag/chat/conversations/messages/${messageId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('채팅 메시지 삭제 실패:', error);
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '채팅 메시지를 삭제하지 못했습니다.',
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 특정 스레드 조회 ============
    const getChatThread = useCallback(async (threadId) => {
        ensureRagAvailable('getChatThread');

        try {
            const response = await api(`/api/rag/chat/conversations/threads/${threadId}`);
            return await response.json();
        } catch (error) {
            console.error('스레드 조회 실패:', error);
            throw error;
        }
    }, [api, ensureRagAvailable]);

    return {
        listChatThreads,
        listChatCategories,
        fetchThreadMessages,
        createChatThread,
        updateChatThread,
        deleteChatThread,
        updateThreadCategory,
        deleteThreadCategory,
        chat,
        chatStream,
        editChatMessage,
        deleteChatMessage,
        getChatThread,
    };
}
