import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

const LlmConfigContext = createContext();

export const useLlmConfig = () => {
  const context = useContext(LlmConfigContext);
  if (!context) {
    throw new Error("useLlmConfig must be used within LlmConfigProvider");
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
      const snippet = raw.slice(0, 160).replace(/\s+/g, " ").trim();
      console.error(
        `Invalid JSON received while trying to ${actionDescription}:`,
        parseError,
        snippet,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${actionDescription}: ${response.status} ${response.statusText}`,
        );
      }

      throw new Error(
        `Failed to ${actionDescription}: server returned unexpected content${
          snippet ? ` - ${snippet}` : ""
        }`,
      );
    }
  }

  const isWrappedResponse =
    parsed &&
    typeof parsed === "object" &&
    (Object.prototype.hasOwnProperty.call(parsed, "success") ||
      Object.prototype.hasOwnProperty.call(parsed, "data") ||
      Object.prototype.hasOwnProperty.call(parsed, "errorMessage"));

  const succeeded =
    response.ok && (!isWrappedResponse || parsed.success !== false);

  if (!succeeded) {
    const errorMessage =
      (isWrappedResponse && (parsed?.errorMessage || parsed?.message)) ||
      parsed?.message ||
      `${response.status} ${response.statusText}`;
    const error = new Error(`Failed to ${actionDescription}: ${errorMessage}`);
    // 서버가 내려준 식별자·원문을 붙여 둔다. 호출부가 문구 매칭 없이 원인을 구분해
    // 해결 안내를 띄울 수 있다 (예: ENCRYPTION_KEY_NOT_CONFIGURED).
    error.errorCode = (isWrappedResponse && parsed?.errorCode) || null;
    error.serverMessage = errorMessage;
    throw error;
  }

  if (isWrappedResponse) {
    return {
      data: parsed.data ?? null,
      metadata: parsed.metadata ?? null,
      pagination: parsed.pagination ?? null,
      raw: parsed,
    };
  }

  return {
    data: parsed,
    metadata: null,
    pagination: null,
    raw: parsed,
  };
};

export const LlmConfigProvider = ({ children }) => {
  const { api, user } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAdmin = (user?.role ?? null) === "ADMIN";

  /**
   * 모든 LLM 설정 조회
   */
  const fetchConfigs = useCallback(
    async (options = {}) => {
      const { includeInactive, endpoint } = options;
      setLoading(true);
      setError(null);
      try {
        let requestPath = endpoint;
        if (!requestPath) {
          const shouldIncludeInactive = includeInactive ?? isAdmin;
          requestPath = shouldIncludeInactive
            ? "/api/llm-configs"
            : "/api/llm-configs/active";
        }

        const response = await api(requestPath);

        const { data } = await parseApiResponse(response, "fetch LLM configs");
        const safeList = Array.isArray(data) ? data : [];
        setConfigs(safeList);
        return safeList;
      } catch (err) {
        console.error("Error fetching LLM configs:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, isAdmin],
  );

  /**
   * 특정 LLM 설정 조회
   */
  const fetchConfigById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/api/llm-configs/${id}`);

        const { data } = await parseApiResponse(response, "fetch LLM config");
        return data;
      } catch (err) {
        console.error("Error fetching LLM config:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  /**
   * 기본 LLM 설정 조회
   */
  const fetchDefaultConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api("/api/llm-configs/default");

      const { data } = await parseApiResponse(
        response,
        "fetch default LLM config",
      );
      return data;
    } catch (err) {
      console.error("Error fetching default LLM config:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * LLM 설정 생성
   */
  const createConfig = useCallback(
    async (configData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api("/api/llm-configs", {
          method: "POST",
          body: JSON.stringify(configData),
        });

        const { data } = await parseApiResponse(response, "create LLM config");
        // 목록 새로고침
        await fetchConfigs();
        return data;
      } catch (err) {
        console.error("Error creating LLM config:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, fetchConfigs],
  );

  /**
   * LLM 설정 수정
   */
  const updateConfig = useCallback(
    async (id, configData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/api/llm-configs/${id}`, {
          method: "PUT",
          body: JSON.stringify(configData),
        });

        const { data } = await parseApiResponse(response, "update LLM config");
        // 목록 새로고침
        await fetchConfigs();
        return data;
      } catch (err) {
        console.error("Error updating LLM config:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, fetchConfigs],
  );

  /**
   * LLM 설정 삭제
   */
  const deleteConfig = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/api/llm-configs/${id}`, {
          method: "DELETE",
        });

        await parseApiResponse(response, "delete LLM config");

        // 목록 새로고침
        await fetchConfigs();
      } catch (err) {
        console.error("Error deleting LLM config:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, fetchConfigs],
  );

  /**
   * 기본 설정으로 지정
   */
  const setDefaultConfig = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/api/llm-configs/${id}/set-default`, {
          method: "PUT",
        });

        const { data } = await parseApiResponse(
          response,
          "set default LLM config",
        );
        // 목록 새로고침
        await fetchConfigs();
        return data;
      } catch (err) {
        console.error("Error setting default LLM config:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, fetchConfigs],
  );

  /**
   * 연결 테스트
   */
  const testConnection = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/api/llm-configs/${id}/test-connection`, {
          method: "POST",
        });

        const { data } = await parseApiResponse(
          response,
          "test LLM connection",
        );
        // 목록 새로고침
        await fetchConfigs();
        return data;
      } catch (err) {
        console.error("Error testing LLM connection:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, fetchConfigs],
  );

  /**
   * 저장하지 않고 설정 테스트 (다이얼로그용)
   */
  const testUnsavedSettings = useCallback(
    async (configData) => {
      setError(null);
      try {
        const response = await api("/api/llm-configs/test-settings", {
          method: "POST",
          body: JSON.stringify(configData),
        });

        await parseApiResponse(response, "test unsaved LLM settings");
        return true;
      } catch (err) {
        console.error("Error testing unsaved LLM settings:", err);
        setError(err.message);
        throw err;
      }
    },
    [api],
  );

  /**
   * OpenRouter 무료 모델 목록 조회
   *
   * apiKey 또는 configId 중 하나가 필요하다. 저장 전 설정은 화면에 입력한 키를 보내고,
   * 저장된 설정은 configId 만 보내면 서버가 저장된 키를 쓴다.
   */
  const fetchOpenRouterFreeModels = useCallback(
    async ({ apiKey, configId }) => {
      const response = await api("/api/llm-configs/openrouter/free-models", {
        method: "POST",
        body: JSON.stringify({ apiKey, configId }),
      });

      const { data } = await parseApiResponse(
        response,
        "fetch OpenRouter free models",
      );
      return data || [];
    },
    [api],
  );

  /**
   * 채팅 화면에서 고를 수 있는 무료 모델 목록
   *
   * 기본 활성 설정이 OpenRouter 가 아니면 빈 목록이 온다(오류가 아니다). 실패해도 채팅 자체는
   * 기본 모델로 되어야 하므로 예외를 올리지 않고 빈 배열로 답한다.
   */
  const fetchSelectableFreeModels = useCallback(async () => {
    try {
      const response = await api(
        "/api/llm-configs/openrouter/free-models/for-chat",
      );
      const { data } = await parseApiResponse(
        response,
        "fetch selectable free models",
      );
      return data || [];
    } catch (err) {
      console.warn("Selectable free models unavailable:", err.message);
      return [];
    }
  }, [api]);

  /**
   * OpenRouter 모델 가용성 확인
   *
   * 각 모델에 최소 요청을 보내 지금 쓸 수 있는지 본다. 무료 한도를 조금 쓰므로
   * 사용자가 버튼을 누를 때만 호출한다. modelIds 를 비우면 무료 모델 전체를 확인한다.
   */
  const probeOpenRouterModels = useCallback(
    async ({ apiKey, configId, modelIds }) => {
      const response = await api(
        "/api/llm-configs/openrouter/free-models/probe",
        {
          method: "POST",
          body: JSON.stringify({ apiKey, configId, modelIds }),
        },
      );

      const { data } = await parseApiResponse(
        response,
        "probe OpenRouter models",
      );
      return data || [];
    },
    [api],
  );

  /**
   * 활성/비활성 토글
   */
  const toggleActive = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/api/llm-configs/${id}/toggle-active`, {
          method: "PUT",
        });

        const { data } = await parseApiResponse(response, "toggle LLM config");
        // 목록 새로고침
        await fetchConfigs();
        return data;
      } catch (err) {
        console.error("Error toggling LLM config:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, fetchConfigs],
  );

  // 컴포넌트 마운트 시 LLM 설정 목록 자동 로드
  useEffect(() => {
    if (!user) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    fetchConfigs().catch((err) => {
      console.error("Failed to load LLM configs on mount:", err);
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
    toggleActive,
    fetchOpenRouterFreeModels,
    probeOpenRouterModels,
    fetchSelectableFreeModels,
  };

  return (
    <LlmConfigContext.Provider value={value}>
      {children}
    </LlmConfigContext.Provider>
  );
};
