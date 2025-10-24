// src/context/RAGContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../utils/apiConstants.js';

const RAGContext = createContext();

const initialState = {
  documents: [],
  activeDocument: null,
  searchResults: [],
  uploadingFiles: [],
  loading: false,
  error: null,
};

const ActionTypes = {
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  SET_ACTIVE_DOCUMENT: 'SET_ACTIVE_DOCUMENT',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_UPLOADING_FILES: 'SET_UPLOADING_FILES',
  ADD_UPLOADING_FILE: 'ADD_UPLOADING_FILE',
  REMOVE_UPLOADING_FILE: 'REMOVE_UPLOADING_FILE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

function ragReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case ActionTypes.ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };
    case ActionTypes.SET_ACTIVE_DOCUMENT:
      return { ...state, activeDocument: action.payload };
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    case ActionTypes.SET_UPLOADING_FILES:
      return { ...state, uploadingFiles: action.payload };
    case ActionTypes.ADD_UPLOADING_FILE:
      return { ...state, uploadingFiles: [...state.uploadingFiles, action.payload] };
    case ActionTypes.REMOVE_UPLOADING_FILE:
      return {
        ...state,
        uploadingFiles: state.uploadingFiles.filter(file => file.id !== action.payload)
      };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

export function RAGProvider({ children }) {
  const [state, dispatch] = useReducer(ragReducer, initialState);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const uploadDocument = useCallback(async (file, projectId, uploadedBy = null) => {
    const uploadingFile = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      progress: 0,
    };

    dispatch({ type: ActionTypes.ADD_UPLOADING_FILE, payload: uploadingFile });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      if (uploadedBy) {
        formData.append('uploadedBy', uploadedBy);
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/documents/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
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

      dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: response.data });
      dispatch({ type: ActionTypes.REMOVE_UPLOADING_FILE, payload: uploadingFile.id });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('문서 업로드 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 업로드에 실패했습니다.'
      });
      dispatch({ type: ActionTypes.REMOVE_UPLOADING_FILE, payload: uploadingFile.id });
      throw error;
    }
  }, [getAuthHeaders, state.uploadingFiles]);

  const analyzeDocument = useCallback(async (documentId, parser = 'auto') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}/analyze`,
        null,
        {
          params: { parser },
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      return response.data;
    } catch (error) {
      console.error('문서 분석 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 분석에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders]);

  const generateEmbeddings = useCallback(async (documentId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/embeddings/generate`,
        null,
        {
          params: { documentId },
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      return response.data;
    } catch (error) {
      console.error('임베딩 생성 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '임베딩 생성에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders]);

  const searchSimilar = useCallback(async (queryText, projectId, topK = 10, minSimilarity = 0.0) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/search/similar`,
        {
          queryText,
          projectId,
          topK,
          minSimilarity,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: response.data.results || [] });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('유사도 검색 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '유사도 검색에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders]);

  const getDocument = useCallback(async (documentId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: response.data });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('문서 조회 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 조회에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders]);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const value = {
    state,
    uploadDocument,
    analyzeDocument,
    generateEmbeddings,
    searchSimilar,
    getDocument,
    clearError,
  };

  return (
    <RAGContext.Provider value={value}>
      {children}
    </RAGContext.Provider>
  );
}

export function useRAG() {
  const context = useContext(RAGContext);
  if (!context) {
    throw new Error('useRAG must be used within a RAGProvider');
  }
  return context;
}

export default RAGContext;
