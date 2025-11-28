// src/hooks/rag/useRagSearch.js
/**
 * RAG 검색 Custom Hook
 * - 유사도 검색, 고급 검색
 */
import { useCallback } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

export function useRagSearch(state, dispatch, ActionTypes, ensureRagAvailable) {
    const { api } = useAppContext();

    // ============ 유사도 검색 ============
    const searchSimilar = useCallback(async (queryText, projectId, topK = 10, minSimilarity = 0.0) => {
        ensureRagAvailable('searchSimilar');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const response = await api(
                '/api/rag/search/similar',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        queryText,
                        projectId,
                        maxResults: topK,
                        similarityThreshold: minSimilarity,
                    }),
                }
            );

            const data = await response.json();
            dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: data.results || [] });
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });

            return data;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '유사도 검색에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    // ============ 고급 검색 (Hybrid + Rerank) ============
    const searchAdvanced = useCallback(async (
        queryText,
        projectId,
        searchMethod = 'hybrid_rerank',
        options = {}
    ) => {
        ensureRagAvailable('searchAdvanced');

        dispatch({ type: ActionTypes.CLEAR_ERROR });
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        try {
            const {
                maxResults = 10,
                similarityThreshold = 0.6,
                vectorWeight = 0.6,
                bm25Weight = 0.4,
                useReranker = true,
                rerankerTopK = null,
            } = options;

            const response = await api(
                '/api/rag/search/advanced',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        queryText,
                        projectId,
                        searchMethod,
                        maxResults,
                        similarityThreshold,
                        vectorWeight,
                        bm25Weight,
                        useReranker,
                        rerankerTopK,
                    }),
                }
            );

            const data = await response.json();
            dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: data.results || [] });
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });

            return data;
        } catch (error) {
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: error.response?.data?.message || '고급 검색에 실패했습니다.'
            });
            throw error;
        }
    }, [api, ensureRagAvailable, dispatch, ActionTypes]);

    return {
        searchSimilar,
        searchAdvanced,
    };
}
