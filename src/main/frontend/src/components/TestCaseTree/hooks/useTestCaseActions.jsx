// src/components/TestCaseTree/hooks/useTestCaseActions.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getAncestorIds,
  getAllDescendants,
} from "../../../utils/treeUtils.jsx";
import { isViewer, canAdd as checkCanAdd } from "../utils/permissionUtils.js";

/**
 * 테스트케이스 CRUD, 순서, 버전 히스토리 액션을 처리하는 커스텀 훅
 */
export const useTestCaseActions = ({
  projectId,
  filteredTestCases,
  addTestCase,
  updateTestCase,
  updateTestCaseLocal,
  deleteTestCase,
  fetchProjectTestCases,
  user,
  t,
  setExpanded,
  checkedIds,
  setCheckedIds,
  inputMode,
  setInputMode,
  onSelectTestCase,
}) => {
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  const [pendingRename, setPendingRename] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [orderEditMode, setOrderEditMode] = useState(false);
  const [orderMap, setOrderMap] = useState({});
  const [orderChanged, setOrderChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionTestCaseId, setSelectedVersionTestCaseId] =
    useState(null);

  const highlightTimeout = useRef(null);

  // filteredTestCases가 바뀌면 orderMap 동기화 (순서 편집 모드가 아닐 때만)
  useEffect(() => {
    if (!orderEditMode) {
      const map = filteredTestCases.reduce((acc, item) => {
        acc[item.id] = item.displayOrder ?? 0;
        return acc;
      }, {});
      setOrderMap(map);
      setOrderChanged(false);
    }
  }, [filteredTestCases, orderEditMode]);

  // ── 추가 ─────────────────────────────────────────────────────────────────

  const handleAddItem = useCallback(
    (type, contextMenuNodeId) => {
      if (!checkCanAdd(user?.role)) return;
      const parentId = contextMenuNodeId ?? null;
      setNewItemData({
        type,
        parentId,
        name: "",
        projectId,
      });
      if (parentId) {
        const ancestorIds = getAncestorIds(filteredTestCases, parentId);
        setExpanded((prev) => {
          const set = new Set(prev);
          ancestorIds.concat(parentId).forEach((id) => set.add(id));
          return Array.from(set);
        });
      }
    },
    [user?.role, projectId, filteredTestCases, setExpanded],
  );

  const handleCancelAdd = useCallback(() => setNewItemData(null), []);

  const handleConfirmAdd = useCallback(async () => {
    if (!newItemData || !newItemData.name || !newItemData.name.trim()) return;
    const id =
      newItemData.type === "folder" ? `folder-${uuidv4()}` : `test-${uuidv4()}`;
    const parentId =
      newItemData.parentId === undefined ? null : newItemData.parentId;
    const siblings = filteredTestCases.filter((tc) => tc.parentId === parentId);
    const displayOrder =
      siblings.length > 0
        ? Math.max(...siblings.map((tc) => tc.displayOrder ?? 0)) + 1
        : 1;
    const newItem = {
      id,
      name: newItemData.name.trim(),
      parentId,
      type: newItemData.type,
      projectId,
      displayOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const addedItem = await addTestCase(newItem);
    setNewItemData(null);

    // 신규 추가 후 자동 선택 및 폼 모드 전환
    if (addedItem && onSelectTestCase) {
      onSelectTestCase(addedItem);
    }
    if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
      setInputMode("form");
    }

    // 추가된 항목 하이라이트
    const targetId = addedItem?.id || id;
    setHighlightedItemId(targetId);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(
      () => setHighlightedItemId(null),
      1500,
    );
  }, [
    newItemData,
    filteredTestCases,
    projectId,
    addTestCase,
    onSelectTestCase,
    inputMode,
    setInputMode,
  ]);

  // ── 이름 변경 ─────────────────────────────────────────────────────────────

  const handleRename = useCallback(
    (nodeId) => {
      if (isViewer(user?.role) || !nodeId) return;
      const node = filteredTestCases.find((tc) => tc.id === nodeId);
      if (!node) return;
      // 메뉴가 완전히 닫힌 후 다이얼로그를 열기 위해 보류 상태로 설정
      setPendingRename({ id: node.id, name: node.name });
    },
    [user?.role, filteredTestCases],
  );

  const handleCancelRename = useCallback(() => setRenameData(null), []);

  const handleConfirmRename = useCallback(async () => {
    if (!renameData?.name || !renameData.name.trim()) {
      alert(t("testcase.tree.validation.nameRequired", "이름을 입력하세요."));
      return;
    }
    const testCase = filteredTestCases.find((tc) => tc.id === renameData.id);
    if (!testCase) return;
    const payload =
      testCase.type === "folder"
        ? {
            id: testCase.id,
            name: renameData.name.trim(),
            projectId: testCase.projectId,
            parentId: testCase.parentId,
            displayOrder: testCase.displayOrder,
            type: "folder",
          }
        : { ...testCase, name: renameData.name.trim() };
    try {
      await updateTestCase(payload);
      setRenameData(null);
    } catch (err) {
      alert(
        t("testcase.tree.error.renameFailed", "이름 변경에 실패했습니다: ") +
          err.message,
      );
    }
  }, [renameData, filteredTestCases, updateTestCase, t]);

  // ── 삭제 ─────────────────────────────────────────────────────────────────

  const handleDeleteClick = useCallback(
    (nodeId) => {
      if (isViewer(user?.role) || user?.role === "USER") return;
      setItemToDeleteId(nodeId);
      setDeleteConfirmationOpen(true);
    },
    [user?.role],
  );

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmationOpen(false);
    setItemToDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteTestCase(itemToDeleteId);
      if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
        setInputMode("form");
      }
      setDeleteConfirmationOpen(false);
      setItemToDeleteId(null);
    } catch (err) {
      let msg =
        err?.message ||
        t("testcase.tree.error.deleteFailed", "삭제 중 오류가 발생했습니다.");
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
      setDeleteConfirmationOpen(false);
      setItemToDeleteId(null);
    }
  }, [itemToDeleteId, deleteTestCase, inputMode, setInputMode, t]);

  // ── 일괄 삭제 ─────────────────────────────────────────────────────────────

  const handleConfirmBatchDelete = useCallback(async () => {
    try {
      // 선택된 항목 중 부모만 삭제 (자식은 백엔드 Cascade로 자동 삭제)
      const parentOnlyIds = checkedIds.filter((id) => {
        const item = filteredTestCases.find((tc) => tc.id === id);
        if (!item) return false;
        let currentParentId = item.parentId;
        while (currentParentId) {
          if (checkedIds.includes(currentParentId)) return false;
          const parent = filteredTestCases.find(
            (tc) => tc.id === currentParentId,
          );
          currentParentId = parent?.parentId;
        }
        return true;
      });

      for (const id of parentOnlyIds) {
        await deleteTestCase(id);
      }

      setBatchDeleteDialogOpen(false);

      if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
        setInputMode("form");
      }

      setTimeout(() => {
        setCheckedIds([]);
      }, 0);
    } catch (err) {
      console.error("[TestCaseTree] 배치 삭제 중 오류:", err);
      let msg =
        err?.message ||
        t("testcase.tree.error.deleteFailed", "삭제 중 오류가 발생했습니다.");
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
      setBatchDeleteDialogOpen(false);
      setTimeout(() => {
        setCheckedIds([]);
      }, 0);
    }
  }, [
    checkedIds,
    filteredTestCases,
    deleteTestCase,
    inputMode,
    setInputMode,
    setCheckedIds,
    t,
  ]);

  // ── 순서 변경 ─────────────────────────────────────────────────────────────

  const moveNodeOrder = useCallback(
    (nodeId, direction) => {
      if (isViewer(user?.role)) return;
      const node = filteredTestCases.find((tc) => tc.id === nodeId);
      if (!node) return;

      const parentId = node.parentId ?? null;
      const siblings = filteredTestCases
        .filter((tc) => (tc.parentId ?? null) === parentId)
        .sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));

      const idx = siblings.findIndex((tc) => tc.id === nodeId);
      if (idx === -1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= siblings.length) return;

      const targetNode = siblings[targetIdx];
      const newOrderMap = { ...orderMap };
      [newOrderMap[nodeId], newOrderMap[targetNode.id]] = [
        newOrderMap[targetNode.id],
        newOrderMap[nodeId],
      ];

      setOrderMap(newOrderMap);
      setOrderChanged(true);
    },
    [user?.role, filteredTestCases, orderMap],
  );

  const handleOrderEditMode = useCallback(() => {
    if (isViewer(user?.role)) return;
    setOrderEditMode(true);
  }, [user?.role]);

  const handleOrderCancel = useCallback(() => {
    setOrderEditMode(false);
    setOrderChanged(false);
  }, []);

  const handleOrderSave = useCallback(async () => {
    if (isViewer(user?.role)) return;

    const byParent = {};
    filteredTestCases.forEach((item) => {
      const p = item.parentId ?? "root";
      if (!byParent[p]) byParent[p] = [];
      byParent[p].push(item);
    });

    const updates = [];
    Object.values(byParent).forEach((siblings) => {
      siblings.sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));
      siblings.forEach((item, idx) => {
        const newOrder = idx + 1;
        if (item.displayOrder !== newOrder) {
          const payload =
            item.type === "folder"
              ? {
                  id: item.id,
                  name: item.name,
                  type: "folder",
                  projectId: item.projectId,
                  parentId: item.parentId ?? null,
                  displayOrder: newOrder,
                  description: item.description || "",
                }
              : { ...item, displayOrder: newOrder };
          updates.push(updateTestCase(payload));
        }
      });
    });

    if (updates.length > 0) {
      try {
        await Promise.all(updates);
      } catch (error) {
        // 에러는 updateTestCase 내부에서 처리
      }
    }

    setOrderEditMode(false);
    setOrderChanged(false);
  }, [user?.role, filteredTestCases, orderMap, updateTestCase]);

  // ── 새로고침 ──────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await fetchProjectTestCases(projectId);
  }, [fetchProjectTestCases, projectId]);

  // ── 버전 히스토리 ─────────────────────────────────────────────────────────

  const handleOpenVersionHistory = useCallback(
    (nodeId) => {
      const testCase = filteredTestCases.find((tc) => tc.id === nodeId);
      if (testCase && testCase.type === "testcase") {
        setSelectedVersionTestCaseId(nodeId);
        setVersionHistoryOpen(true);
      }
    },
    [filteredTestCases],
  );

  const handleVersionRestore = useCallback(
    async (restoredVersion) => {
      if (updateTestCaseLocal && restoredVersion) {
        updateTestCaseLocal(restoredVersion);
      }
      if (restoredVersion && onSelectTestCase) {
        const testCase = filteredTestCases.find(
          (tc) => tc.id === restoredVersion.testCaseId,
        );
        if (testCase) {
          onSelectTestCase(testCase);
        }
      }
    },
    [updateTestCaseLocal, filteredTestCases, onSelectTestCase],
  );

  // ── 삭제 항목 계산 헬퍼 ───────────────────────────────────────────────────

  const getBatchDeleteItems = useCallback(() => {
    const allItems = new Map();
    checkedIds.forEach((id) => {
      const item = filteredTestCases.find((tc) => tc.id === id);
      if (item) {
        if (!allItems.has(item.id)) {
          allItems.set(item.id, {
            id: item.id,
            displayId: item.displayId || item.sequentialId,
            name: item.name,
            type: item.type,
          });
        }
        if (item.type === "folder") {
          const descendants = getAllDescendants(filteredTestCases, item.id);
          descendants.forEach((desc) => {
            if (!allItems.has(desc.id)) {
              allItems.set(desc.id, {
                id: desc.id,
                displayId: desc.displayId || desc.sequentialId,
                name: desc.name,
                type: desc.type,
              });
            }
          });
        }
      }
    });
    return Array.from(allItems.values());
  }, [checkedIds, filteredTestCases]);

  const getSingleDeleteItems = useCallback(() => {
    if (!itemToDeleteId) return [];
    const item = filteredTestCases.find((tc) => tc.id === itemToDeleteId);
    if (!item) return [];
    const items = [
      {
        id: item.id,
        displayId: item.displayId || item.sequentialId,
        name: item.name,
        type: item.type,
      },
    ];
    if (item.type === "folder") {
      const descendants = getAllDescendants(filteredTestCases, item.id);
      descendants.forEach((desc) => {
        items.push({
          id: desc.id,
          displayId: desc.displayId || desc.sequentialId,
          name: desc.name,
          type: desc.type,
        });
      });
    }
    return items;
  }, [itemToDeleteId, filteredTestCases]);

  return {
    // 상태
    newItemData,
    setNewItemData,
    renameData,
    setRenameData,
    pendingRename,
    setPendingRename,
    deleteConfirmationOpen,
    itemToDeleteId,
    highlightedItemId,
    batchDeleteDialogOpen,
    setBatchDeleteDialogOpen,
    orderEditMode,
    orderMap,
    orderChanged,
    errorMessage,
    setErrorMessage,
    versionHistoryOpen,
    setVersionHistoryOpen,
    selectedVersionTestCaseId,
    setSelectedVersionTestCaseId,

    // 핸들러
    handleAddItem,
    handleCancelAdd,
    handleConfirmAdd,
    handleRename,
    handleCancelRename,
    handleConfirmRename,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    handleConfirmBatchDelete,
    moveNodeOrder,
    handleOrderEditMode,
    handleOrderCancel,
    handleOrderSave,
    handleRefresh,
    handleOpenVersionHistory,
    handleVersionRestore,

    // 헬퍼
    getBatchDeleteItems,
    getSingleDeleteItems,
  };
};
