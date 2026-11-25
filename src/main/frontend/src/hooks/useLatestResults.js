// src/hooks/useLatestResults.js
// 케이스 목록의 「최근 결과」 열(ICT-491)용 훅.
// 프로젝트 단위로 케이스별 가장 최근 실행 결과를 한 번에 조회한다. 응답: { [testCaseId]: { result, executedAt } }
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";

const EMPTY = {};

export default function useLatestResults(projectId) {
  const { api } = useAppContext();
  const [latestResults, setLatestResults] = useState(EMPTY);

  const refresh = useCallback(async () => {
    if (!projectId || !api) return;
    try {
      const response = await api(
        `/api/testcases/projects/${encodeURIComponent(projectId)}/latest-results`,
      );
      if (!response.ok) throw new Error(`요청 실패 (${response.status})`);
      setLatestResults((await response.json()) || EMPTY);
    } catch (e) {
      // 조회 실패는 치명적이지 않다. 열을 비워 두고 목록은 그대로 보여 준다.
      console.warn("최근 결과 조회 실패:", e.message);
    }
  }, [api, projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { latestResults, refreshLatestResults: refresh };
}
