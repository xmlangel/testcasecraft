// src/main/frontend/src/hooks/useJiraStatus.js

import { useState, useEffect, useCallback, useRef } from "react";
import jiraStatusService from "../services/jiraStatusService";
import { getDynamicApiUrl } from "../utils/apiConstants.js";

/**
 * ICT-189: JIRA 상태 관리를 위한 React 훅
 * JIRA 상태 데이터 조회, 캐싱, 에러 처리를 담당하는 커스텀 훅
 */

/**
 * 프로젝트의 JIRA 상태 요약을 관리하는 훅
 * @param {string} projectId - 프로젝트 ID
 * @param {Object} options - 옵션 객체
 * @param {boolean} options.autoRefresh - 자동 새로고침 여부 (기본: false)
 * @param {number} options.refreshInterval - 자동 새로고침 간격 (ms, 기본: 5분)
 * @param {boolean} options.useCache - 캐시 사용 여부 (기본: true)
 * @returns {Object} 상태와 메서드들
 */
export const useJiraStatusSummary = (projectId, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5분
    useCache = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * 데이터 로드 함수
   */
  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        let result;

        if (forceRefresh) {
          // 강제 새로고침인 경우 refresh API 호출
          result = await jiraStatusService.refreshProjectJiraStatus(projectId);
        } else {
          // 일반 조회
          result = await jiraStatusService.getProjectJiraStatusSummary(
            projectId,
            useCache,
          );
        }

        if (mountedRef.current) {
          setData(result || []);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        console.error("JIRA 상태 요약 로드 실패:", err);
        if (mountedRef.current) {
          setError(err.message || "JIRA 상태 정보를 불러오는데 실패했습니다");
          setData(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [projectId, useCache],
  );

  /**
   * 강제 새로고침
   */
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  /**
   * 자동 새로고침 설정
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadData(false);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loadData]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  /**
   * 컴포넌트 언마운트 처리
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    reload: () => loadData(false),
  };
};

/**
 * 특정 JIRA 이슈의 상세 정보를 관리하는 훅
 * @param {string} jiraId - JIRA 이슈 키
 * @param {Object} options - 옵션 객체
 * @returns {Object} 상태와 메서드들
 */
export const useJiraIssueDetail = (jiraId, options = {}) => {
  const { useCache = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!jiraId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await jiraStatusService.getJiraStatusDetail(
        jiraId,
        useCache,
      );

      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      console.error("JIRA 이슈 상세 정보 로드 실패:", err);
      if (mountedRef.current) {
        setError(err.message || "JIRA 이슈 정보를 불러오는데 실패했습니다");
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [jiraId, useCache]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    reload: loadData,
  };
};

/**
 * 여러 프로젝트의 JIRA 상태를 배치로 조회하는 훅
 * @param {Array<string>} projectIds - 프로젝트 ID 배열
 * @param {Object} options - 옵션 객체
 * @returns {Object} 상태와 메서드들
 */
export const useBatchJiraStatusSummary = (projectIds, options = {}) => {
  const { autoRefresh = false, refreshInterval = 5 * 60 * 1000 } = options;

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (!projectIds || projectIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result =
        await jiraStatusService.getBatchProjectJiraStatusSummary(projectIds);

      if (mountedRef.current) {
        setData(result || {});
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error("배치 JIRA 상태 요약 로드 실패:", err);
      if (mountedRef.current) {
        setError(err.message || "JIRA 상태 정보를 불러오는데 실패했습니다");
        setData({});
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [projectIds]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(loadData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    reload: loadData,
  };
};

/**
 * JIRA 상태 통계를 관리하는 훅
 * @param {string} [projectId] - 프로젝트 ID (선택적)
 * @param {Object} options - 옵션 객체
 * @returns {Object} 상태와 메서드들
 */
export const useJiraStatusStatistics = (projectId = null, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 2 * 60 * 1000, // 2분 (통계는 더 자주 업데이트)
    useCache = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await jiraStatusService.getJiraStatusStatistics(
        projectId,
        useCache,
      );

      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error("JIRA 상태 통계 로드 실패:", err);
      if (mountedRef.current) {
        setError(err.message || "JIRA 통계 정보를 불러오는데 실패했습니다");
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [projectId, useCache]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(loadData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    reload: loadData,
  };
};

/**
 * 여러 JIRA 이슈의 상태를 배치로 조회하는 훅
 * 테스트 결과 테이블 등에서 JIRA 상태를 일괄 조회할 때 사용
 * @param {Array<{id: string, jiraId: string}>} items - JIRA ID가 포함된 아이템 배열
 * @param {Object} options - 옵션 객체
 * @param {boolean} options.autoLoad - 자동 로드 여부 (기본: false)
 * @returns {Object} 상태와 메서드들
 */
export const useBatchJiraIssueStatus = (items = [], options = {}) => {
  const { autoLoad = false } = options;

  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const mountedRef = useRef(true);

  /**
   * JIRA 상태 배치 조회 함수
   */
  const fetchStatuses = useCallback(async () => {
    if (!items || items.length === 0) {
      setInfo({
        type: "warning",
        message: "조회할 JIRA ID가 없습니다.",
      });
      return;
    }

    // JIRA ID 중복 제거
    const dedupedKeys = [];
    const seen = new Set();

    items.forEach((item) => {
      if (!item.jiraId) return;
      const trimmed = String(item.jiraId).trim();
      if (!trimmed) return;
      const normalized = trimmed.toUpperCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      dedupedKeys.push(trimmed);
    });

    if (dedupedKeys.length === 0) {
      setInfo({
        type: "warning",
        message: "연결된 JIRA ID가 없습니다.",
      });
      return;
    }

    setLoading(true);
    setInfo(null);
    setError(null);

    try {
      const summaries =
        await jiraStatusService.getBatchIssueSummaries(dedupedKeys);

      if (!Array.isArray(summaries) || summaries.length === 0) {
        if (mountedRef.current) {
          setStatusMap({});
          setInfo({
            type: "info",
            message: "업데이트할 JIRA 상태가 없습니다.",
          });
        }
        return;
      }

      const newStatusMap = summaries.reduce((acc, summary) => {
        if (summary?.jiraIssueKey) {
          acc[summary.jiraIssueKey] = summary.currentStatus || null;
        }
        return acc;
      }, {});

      setStatusMap(newStatusMap);
      setInfo({
        type: "success",
        message: `${
          Object.keys(newStatusMap).length
        }건의 JIRA 상태를 업데이트했습니다.`,
      });

      // JIRA 상태를 데이터베이스에 저장
      try {
        const apiBaseUrl = await getDynamicApiUrl();
        const syncResponse = await fetch(
          `${apiBaseUrl}/api/jira-status/issues/sync-to-database`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                localStorage.getItem("accessToken") ||
                localStorage.getItem("token")
              }`,
            },
            body: JSON.stringify(dedupedKeys),
          },
        );

        if (syncResponse.ok) {
          await syncResponse.json();
        } else {
          // 에러 응답 처리
          const errorText = await syncResponse.text();
          if (
            syncResponse.status === 400 &&
            errorText === "JIRA_CONFIG_MISSING"
          ) {
            if (mountedRef.current) {
              setInfo({
                type: "warning",
                message:
                  "JIRA 연결이 필요합니다. 설정 페이지에서 JIRA를 연결해주세요.",
              });
            }
          } else {
            console.warn(
              "JIRA 상태 데이터베이스 동기화 실패:",
              syncResponse.statusText,
            );
          }
        }
      } catch (syncError) {
        console.warn("JIRA 상태 데이터베이스 동기화 중 오류:", syncError);
        // DB 동기화 실패는 치명적이지 않으므로 계속 진행
      }
    } catch (err) {
      console.error("JIRA 상태 배치 조회 실패:", err);
      if (mountedRef.current) {
        const errorMessage =
          err.message || "JIRA 상태를 불러오지 못했습니다. 다시 시도해 주세요.";
        setError(errorMessage);
        setInfo({
          type: "error",
          message: errorMessage,
        });

        // 🔴 에러 발생 시 토스트 팝업 표시
        if (window.showToast) {
          window.showToast(errorMessage, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [items]);

  /**
   * 자동 로드
   */
  useEffect(() => {
    if (autoLoad && items && items.length > 0) {
      fetchStatuses();
    }
  }, [autoLoad, items, fetchStatuses]);

  /**
   * info 메시지 자동 숨김 (6초 후)
   */
  useEffect(() => {
    if (!info) return;

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setInfo(null);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [info]);

  /**
   * 컴포넌트 언마운트 처리
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    statusMap,
    loading,
    error,
    info,
    fetchStatuses,
    clearInfo: () => setInfo(null),
  };
};

/**
 * JIRA 상태 서비스의 캐시 관리를 위한 훅
 * @returns {Object} 캐시 관련 메서드들
 */
export const useJiraStatusCache = () => {
  const [stats, setStats] = useState(null);

  const getCacheStats = useCallback(() => {
    const cacheStats = jiraStatusService.getCacheStats();
    setStats(cacheStats);
    return cacheStats;
  }, []);

  const clearCache = useCallback(() => {
    jiraStatusService.clearCache();
    setStats(null);
  }, []);

  return {
    stats,
    getCacheStats,
    clearCache,
  };
};
