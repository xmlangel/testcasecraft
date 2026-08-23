import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { useTranslation } from "./I18nContext";

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
  const { t } = useTranslation();
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
  const fetchSelectableModels = useCallback(
    async ({ provider, apiKey, configId }) => {
      const response = await api("/api/llm-configs/models", {
        method: "POST",
        body: JSON.stringify({ provider, apiKey, configId }),
      });

      const { data } = await parseApiResponse(
        response,
        "fetch selectable models",
      );
      return data || [];
    },
    [api],
  );

  /**
   * 모델 목록을 내주는 제공자 목록
   *
   * 어느 제공자에서 목록 선택기를 띄울지, 전수 확인을 기본으로 권할지 서버가 알려 준다.
   * 제공자 목록을 화면에 박아 두면 제공자를 더할 때마다 화면도 고쳐야 한다.
   */
  const fetchModelCatalogProviders = useCallback(async () => {
    try {
      const response = await api("/api/llm-configs/model-catalogs");
      const { data } = await parseApiResponse(
        response,
        "fetch model catalog providers",
      );
      return data || [];
    } catch (err) {
      console.warn("Model catalog providers unavailable:", err.message);
      return [];
    }
  }, [api]);

  /**
   * 채팅 화면에서 고를 수 있는 무료 모델 목록
   *
   * 기본 활성 설정이 OpenRouter 가 아니면 빈 목록이 온다(오류가 아니다). 실패해도 채팅 자체는
   * 기본 모델로 되어야 하므로 예외를 올리지 않고 빈 배열로 답한다.
   */
  const fetchSelectableFreeModels = useCallback(async () => {
    try {
      const response = await api("/api/llm-configs/models/for-chat");
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
   * 확인 작업이 끝날 때까지 진행 상황을 물어본다.
   *
   * 주기를 1.5초로 둔 이유는 둘이다. 더 짧게 하면 확인 자체보다 조회가 서버를 더 많이
   * 두드리고, 더 길게 하면 진행률이 뜨문뜨문 올라 멈춘 것처럼 보인다.
   *
   * 상한을 둔다. 서버가 작업을 잃거나(재시작) 응답이 계속 실패하면 무한정 물어보게 된다.
   * NVIDIA 최악 6분에 여유를 더해 10분으로 잡았다.
   */
  const pollProbeJob = useCallback(
    async (jobId, onProgress) => {
      const INTERVAL_MS = 1500;
      const MAX_WAIT_MS = 10 * 60 * 1000;
      const startedAt = Date.now();

      for (;;) {
        if (Date.now() - startedAt > MAX_WAIT_MS) {
          throw new Error(
            t(
              "admin.llmConfig.models.probeTimeout",
              "확인이 너무 오래 걸립니다. 잠시 뒤 버튼을 다시 눌러 주세요.",
            ),
          );
        }

        await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));

        const response = await api(
          `/api/llm-configs/models/probe-jobs/${jobId}`,
        );
        const { data: job } = await parseApiResponse(
          response,
          "poll model availability probe",
        );

        if (!job) {
          throw new Error(
            t(
              "admin.llmConfig.models.probeJobMissing",
              "확인 작업을 찾을 수 없습니다.",
            ),
          );
        }
        onProgress?.({ done: job.done ?? 0, total: job.total ?? 0 });

        if (job.status === "DONE") {
          // 결과 형태는 예전 동기 응답과 같다. 화면의 결과 처리 코드를 그대로 쓴다.
          return (
            job.result || { models: [], accountLimit: null, requestsSent: 0 }
          );
        }
        if (job.status === "FAILED") {
          throw new Error(
            job.errorMessage ||
              t(
                "admin.llmConfig.models.probeFailed",
                "가용성 확인에 실패했습니다.",
              ),
          );
        }
      }
    },
    [api, t],
  );

  /**
   * 모델 가용성 확인
   *
   * 각 모델에 최소 요청을 보내 지금 쓸 수 있는지 본다. 확인 한 번이 제공자의 요청 한도를
   * 그만큼 쓰므로 사용자가 버튼을 누를 때만 호출한다. modelIds 를 비우면 목록 전체를
   * 확인하고, alreadyChecked 에 담긴 모델은 건너뛴다.
   *
   * 서버에서 작업으로 돌리고 진행 상황을 물어본다. 확인은 최악의 경우 몇 분이 걸려
   * (OpenRouter 2분 30초, NVIDIA 6분) 한 번의 요청으로 기다리면 리버스 프록시 타임아웃에
   * 먼저 걸린다. 그러면 확인은 서버에서 계속 도는데 결과를 받지 못한다.
   *
   * onProgress 를 주면 진행률이 바뀔 때마다 { done, total } 로 알린다.
   */
  const probeModelAvailability = useCallback(
    async ({
      provider,
      apiKey,
      configId,
      modelIds,
      alreadyChecked,
      onProgress,
    }) => {
      const startResponse = await api("/api/llm-configs/models/probe-jobs", {
        method: "POST",
        body: JSON.stringify({
          provider,
          apiKey,
          configId,
          modelIds,
          alreadyChecked,
        }),
      });

      const { data: job } = await parseApiResponse(
        startResponse,
        "start model availability probe",
      );
      if (!job?.jobId) {
        throw new Error(
          t(
            "admin.llmConfig.models.probeStartFailed",
            "확인 작업을 시작하지 못했습니다.",
          ),
        );
      }

      onProgress?.({ done: 0, total: job.total ?? 0 });
      return pollProbeJob(job.jobId, onProgress);
    },
    [api, pollProbeJob, t],
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
    fetchSelectableModels,
    probeModelAvailability,
    fetchSelectableFreeModels,
    fetchModelCatalogProviders,
  };

  return (
    <LlmConfigContext.Provider value={value}>
      {children}
    </LlmConfigContext.Provider>
  );
};
