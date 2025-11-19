import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAppContext } from './AppContext';

const LlmConfigContext = createContext();

export const useLlmConfig = () => {
  const context = useContext(LlmConfigContext);
  if (!context) {
    throw new Error('useLlmConfig must be used within LlmConfigProvider');
  }
  return context;
};

const parseApiResponse = async (response, actionDescription) => {
  const raw = await response.text();
  let parsed = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      const snippet = raw.slice(0, 160).replace(/\s+/g, ' ').trim();
      console.error(`Invalid JSON received while trying to ${actionDescription}:`, parseError, snippet);

      if (!response.ok) {
        throw new Error(`Failed to ${actionDescription}: ${response.status} ${response.statusText}`);
      }

      throw new Error(`Failed to ${actionDescription}: server returned unexpected content${snippet ? ` - ${snippet}` : ''}`);
    }
  }

  const isWrappedResponse =
    parsed &&
    typeof parsed === 'object' &&
    (Object.prototype.hasOwnProperty.call(parsed, 'success') ||
      Object.prototype.hasOwnProperty.call(parsed, 'data') ||
      Object.prototype.hasOwnProperty.call(parsed, 'errorMessage'));

  const succeeded =
    response.ok &&
    (!isWrappedResponse || parsed.success !== false);

  if (!succeeded) {
    const errorMessage =
      (isWrappedResponse && (parsed?.errorMessage || parsed?.message)) ||
      parsed?.message ||
      `${response.status} ${response.statusText}`;
    throw new Error(`Failed to ${actionDescription}: ${errorMessage}`);
  }

  if (isWrappedResponse) {
    return {
      data: parsed.data ?? null,
      metadata: parsed.metadata ?? null,
      pagination: parsed.pagination ?? null,
      raw: parsed
    };
  }

  return {
    data: parsed,
    metadata: null,
    pagination: null,
    raw: parsed
  };
};

export const LlmConfigProvider = ({ children }) => {
  const { api, user } = useAppContext();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAdmin = (user?.role ?? null) === 'ADMIN';

  /**
   * 모든 LLM 설정 조회
   */
  const fetchConfigs = useCallback(async (options = {}) => {
    const { includeInactive, endpoint } = options;
    setLoading(true);
    setError(null);
    try {
      let requestPath = endpoint;
      if (!requestPath) {
        const shouldIncludeInactive = includeInactive ?? isAdmin;
        requestPath = shouldIncludeInactive ? '/api/llm-configs' : '/api/llm-configs/active';
      }

      const response = await api(requestPath);

      const { data } = await parseApiResponse(response, 'fetch LLM configs');
      const safeList = Array.isArray(data) ? data : [];
      setConfigs(safeList);
      return safeList;
    } catch (err) {
      console.error('Error fetching LLM configs:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, isAdmin]);

  /**
   * 특정 LLM 설정 조회
   */
  const fetchConfigById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/api/llm-configs/${id}`);

      const { data } = await parseApiResponse(response, 'fetch LLM config');
      return data;
    } catch (err) {
      console.error('Error fetching LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * 기본 LLM 설정 조회
   */
  const fetchDefaultConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api('/api/llm-configs/default');

      const { data } = await parseApiResponse(response, 'fetch default LLM config');
      return data;
    } catch (err) {
      console.error('Error fetching default LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * LLM 설정 생성
   */
  const createConfig = useCallback(async (configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api('/api/llm-configs', {
        method: 'POST',
        body: JSON.stringify(configData)
      });

      const { data } = await parseApiResponse(response, 'create LLM config');
      // 목록 새로고침
      await fetchConfigs();
      return data;
    } catch (err) {
      console.error('Error creating LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchConfigs]);

  /**
   * LLM 설정 수정
   */
  const updateConfig = useCallback(async (id, configData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/api/llm-configs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(configData)
      });

      const { data } = await parseApiResponse(response, 'update LLM config');
      // 목록 새로고침
      await fetchConfigs();
      return data;
    } catch (err) {
      console.error('Error updating LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchConfigs]);

  /**
   * LLM 설정 삭제
   */
  const deleteConfig = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/api/llm-configs/${id}`, {
        method: 'DELETE'
      });

      await parseApiResponse(response, 'delete LLM config');

      // 목록 새로고침
      await fetchConfigs();
    } catch (err) {
      console.error('Error deleting LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchConfigs]);

  /**
   * 기본 설정으로 지정
   */
  const setDefaultConfig = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/api/llm-configs/${id}/set-default`, {
        method: 'PUT'
      });

      const { data } = await parseApiResponse(response, 'set default LLM config');
      // 목록 새로고침
      await fetchConfigs();
      return data;
    } catch (err) {
      console.error('Error setting default LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchConfigs]);

  /**
   * 연결 테스트
   */
  const testConnection = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/api/llm-configs/${id}/test-connection`, {
        method: 'POST'
      });

      const { data } = await parseApiResponse(response, 'test LLM connection');
      // 목록 새로고침
      await fetchConfigs();
      return data;
    } catch (err) {
      console.error('Error testing LLM connection:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchConfigs]);

  /**
   * 저장하지 않고 설정 테스트 (다이얼로그용)
   */
  const testUnsavedSettings = useCallback(async (configData) => {
    setError(null);
    try {
      const response = await api('/api/llm-configs/test-settings', {
        method: 'POST',
        body: JSON.stringify(configData)
      });

      await parseApiResponse(response, 'test unsaved LLM settings');
      return true;
    } catch (err) {
      console.error('Error testing unsaved LLM settings:', err);
      setError(err.message);
      throw err;
    }
  }, [api]);

  /**
   * 활성/비활성 토글
   */
  const toggleActive = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/api/llm-configs/${id}/toggle-active`, {
        method: 'PUT'
      });

      const { data } = await parseApiResponse(response, 'toggle LLM config');
      // 목록 새로고침
      await fetchConfigs();
      return data;
    } catch (err) {
      console.error('Error toggling LLM config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchConfigs]);

  // 컴포넌트 마운트 시 LLM 설정 목록 자동 로드
  useEffect(() => {
    if (!user) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    fetchConfigs().catch(err => {
      console.error('Failed to load LLM configs on mount:', err);
    });
  }, [user, fetchConfigs]);

  const value = {
    configs,
    loading,
    error,
    fetchConfigs,
    fetchConfigById,
    fetchDefaultConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    testConnection,
    testUnsavedSettings,
    toggleActive
  };

  return (
    <LlmConfigContext.Provider value={value}>
      {children}
    </LlmConfigContext.Provider>
  );
};
