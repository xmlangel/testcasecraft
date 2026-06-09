// src/hooks/useBookmarks.js
// 케이스 리스트의 별 버튼용 즐겨찾기 상태 훅.
// 프로젝트 단위로 북마크된 케이스 ID 집합을 1회 조회(NFR-1)하고, 토글을 낙관적으로 반영한다.
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import * as bookmarkApi from "../services/bookmarkApi.js";

export default function useBookmarks(projectId) {
  const { api } = useAppContext();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!projectId || !api) return;
    try {
      setLoading(true);
      const data = await bookmarkApi.getStatus(api, projectId);
      setFavoriteIds(new Set(data?.bookmarkedTestCaseIds || []));
    } catch (e) {
      // 상태 조회 실패는 치명적이지 않음 — 별을 비활성으로 두고 조용히 무시
      console.warn("북마크 상태 조회 실패:", e.message);
    } finally {
      setLoading(false);
    }
  }, [api, projectId]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const isFavorite = useCallback(
    (testCaseId) => favoriteIds.has(testCaseId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (testCaseId) => {
      if (!projectId || !api) return;
      // 낙관적 업데이트
      const prev = favoriteIds;
      const optimistic = new Set(prev);
      if (optimistic.has(testCaseId)) optimistic.delete(testCaseId);
      else optimistic.add(testCaseId);
      setFavoriteIds(optimistic);
      try {
        const res = await bookmarkApi.toggleFavorite(api, testCaseId, projectId);
        // 서버 응답 기준으로 동기화 (다른 모음 포함 여부는 status 재조회로 정확화)
        setFavoriteIds((cur) => {
          const next = new Set(cur);
          if (res?.bookmarked) next.add(testCaseId);
          else if (!res?.bookmarked) {
            // 기본 모음에서 제거됐어도 다른 모음에 있을 수 있으므로 status 재조회로 보정
          }
          return next;
        });
        // 정확한 상태(다른 모음 포함)를 위해 재조회
        refreshStatus();
      } catch (e) {
        // 롤백
        setFavoriteIds(prev);
        console.warn("즐겨찾기 토글 실패:", e.message);
      }
    },
    [api, projectId, favoriteIds, refreshStatus],
  );

  return { favoriteIds, isFavorite, toggleFavorite, refreshStatus, loading };
}
