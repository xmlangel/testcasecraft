// src/hooks/useAgentConnection.js

import { useCallback, useEffect, useState } from "react";

import agentConnectionService from "../services/agentConnectionService";

/**
 * 프로젝트의 에이전트 연동 상태를 읽는다.
 *
 * 조회가 실패하면 `enabled` 와 `runnable` 이 모두 false 로 남는다. 실패의 기본값을
 * 숨김으로 두는 것이 중요하다. 반대로 짜면 에이전트가 죽었을 때 버튼이 남아
 * 사용자가 누르게 된다.
 */
export const useAgentConnection = (projectId) => {
  const [state, setState] = useState({
    enabled: false,
    runnable: false,
    name: "",
    loading: Boolean(projectId),
  });

  const refresh = useCallback(async () => {
    if (!projectId) {
      setState({ enabled: false, runnable: false, name: "", loading: false });
      return;
    }
    setState((cur) => ({ ...cur, loading: true }));
    const result = await agentConnectionService.runnable(projectId);
    setState({
      enabled: Boolean(result?.enabled),
      runnable: Boolean(result?.runnable),
      name: result?.name || "",
      loading: false,
    });
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!projectId) {
        setState({ enabled: false, runnable: false, name: "", loading: false });
        return;
      }
      const result = await agentConnectionService.runnable(projectId);
      if (!cancelled) {
        setState({
          enabled: Boolean(result?.enabled),
          runnable: Boolean(result?.runnable),
          name: result?.name || "",
          loading: false,
        });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return { ...state, refresh };
};

export default useAgentConnection;
