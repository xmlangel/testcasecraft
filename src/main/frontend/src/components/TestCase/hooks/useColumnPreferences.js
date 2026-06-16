// src/components/TestCase/hooks/useColumnPreferences.js
//
// 테스트 결과 테이블의 컬럼 표시/순서 설정 + localStorage 영속화 훅.
// (TestResultDetailTable 에서 추출 — 동작 보존)

import { useState, useEffect, useCallback } from "react";
import { debugWarn } from "../../../utils/logger.js";
import {
  getDefaultColumnVisibility,
  getDefaultColumnOrder,
} from "../tableColumnDefaults.js";

const visibilityKey = (projectId) =>
  `testResultTable_columnVisibility_${projectId || "default"}`;
const orderKey = (projectId) =>
  `testResultTable_columnOrder_${projectId || "default"}`;

/**
 * 컬럼 표시/순서 설정을 projectId 별 localStorage 와 동기화한다.
 *
 * @param {string} projectId
 * @returns 컬럼 설정 상태 + setter + 저장/토글 핸들러
 */
export default function useColumnPreferences(projectId) {
  const loadColumnVisibilityFromStorage = () => {
    try {
      const saved = localStorage.getItem(visibilityKey(projectId));
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기본값과 병합하여 새로운 필드 처리
        return { ...getDefaultColumnVisibility(), ...parsed };
      }
    } catch (error) {
      debugWarn("TestResultDetailTable", "컬럼 설정 로드 실패:", error);
    }
    return getDefaultColumnVisibility();
  };

  const loadColumnOrderFromStorage = () => {
    try {
      const saved = localStorage.getItem(orderKey(projectId));
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기본값과 병합하여 새로운 필드 처리
        const defaultOrder = getDefaultColumnOrder();
        const savedFields = new Set(parsed);
        const newFields = defaultOrder.filter(
          (field) => !savedFields.has(field),
        );
        return [...parsed, ...newFields];
      }
    } catch (error) {
      debugWarn("TestResultDetailTable", "컬럼 순서 로드 실패:", error);
    }
    return getDefaultColumnOrder();
  };

  const [columnVisibility, setColumnVisibility] = useState(
    loadColumnVisibilityFromStorage,
  );
  const [columnOrder, setColumnOrder] = useState(loadColumnOrderFromStorage);

  // 프로젝트 변경 시 설정 다시 로드
  useEffect(() => {
    if (projectId) {
      setColumnVisibility(loadColumnVisibilityFromStorage());
      setColumnOrder(loadColumnOrderFromStorage());
    }
  }, [projectId]);

  const saveColumnVisibilityToStorage = useCallback(
    (newVisibility) => {
      try {
        localStorage.setItem(
          visibilityKey(projectId),
          JSON.stringify(newVisibility),
        );
      } catch (error) {
        debugWarn("TestResultDetailTable", "컬럼 설정 저장 실패:", error);
      }
    },
    [projectId],
  );

  const saveColumnOrderToStorage = useCallback(
    (newOrder) => {
      try {
        localStorage.setItem(orderKey(projectId), JSON.stringify(newOrder));
      } catch (error) {
        debugWarn("TestResultDetailTable", "컬럼 순서 저장 실패:", error);
      }
    },
    [projectId],
  );

  const handleColumnVisibilityToggle = useCallback(
    (field) => {
      setColumnVisibility((prev) => {
        const newVisibility = { ...prev, [field]: !prev[field] };
        saveColumnVisibilityToStorage(newVisibility);
        return newVisibility;
      });
    },
    [saveColumnVisibilityToStorage],
  );

  const handleColumnOrderChange = useCallback(
    (newOrder) => {
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    },
    [saveColumnOrderToStorage],
  );

  return {
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    saveColumnVisibilityToStorage,
    saveColumnOrderToStorage,
    handleColumnVisibilityToggle,
    handleColumnOrderChange,
  };
}
