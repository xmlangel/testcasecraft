// src/components/TestCaseTree/hooks/useTestCaseTree.jsx
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getAncestorIds, getAllChildIds } from "../../../utils/treeUtils.jsx";
import { isViewer } from "../utils/permissionUtils.js";

/**
 * 테스트케이스 트리 UI 상태 관리 훅
 * - 확장(expanded) / 선택(selected) / 체크(checkedIds) / 컨텍스트 메뉴 상태
 * - filteredTestCases 계산
 * - 트리 상호작용 핸들러 (토글, 선택, 체크, 컨텍스트 메뉴)
 */
export const useTestCaseTree = ({
  projectId,
  testCases,
  fetchProjectTestCases,
  selectable,
  selectedIds,
  onSelectionChange,
  selectedTestCaseId,
  setActiveTestCase,
  onSelectTestCase,
  userRole,
}) => {
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);

  const selectTimeout = useRef(null);

  // 프로젝트 변경 시 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProjectTestCases(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // 필터링된 테스트케이스
  const filteredTestCases = useMemo(
    () =>
      projectId
        ? testCases.filter((tc) => tc.projectId === projectId)
        : testCases,
    [projectId, testCases],
  );

  // 전체 테스트케이스 수 (폴더 제외)
  const totalTestCaseCount = useMemo(
    () => filteredTestCases.filter((tc) => tc.type === "testcase").length,
    [filteredTestCases],
  );

  // 전체 폴더 수
  const totalFolderCount = useMemo(
    () => filteredTestCases.filter((tc) => tc.type === "folder").length,
    [filteredTestCases],
  );

  // 전체 선택 상태 (testcase 타입만)
  const allIds = useMemo(
    () =>
      filteredTestCases
        .filter((tc) => tc.type === "testcase")
        .map((tc) => tc.id),
    [filteredTestCases],
  );
  const isAllChecked =
    allIds.length > 0 && allIds.every((id) => checkedIds.includes(id));
  const isIndeterminate = checkedIds.length > 0 && !isAllChecked;

  // selectable 모드: 외부 selectedIds 동기화
  useEffect(() => {
    if (selectable && Array.isArray(selectedIds)) {
      setCheckedIds(selectedIds);
    }
  }, [selectedIds, selectable]);

  // selectedTestCaseId 변경 시 노드 선택 및 조상 펼치기
  useEffect(() => {
    if (selectedTestCaseId && filteredTestCases.length > 0) {
      setSelected(selectedTestCaseId);
      const ancestorIds = getAncestorIds(filteredTestCases, selectedTestCaseId);
      if (ancestorIds.length > 0) {
        setExpanded((prev) => {
          const newSet = new Set([...prev, ...ancestorIds]);
          return Array.from(newSet);
        });
      }
    }
  }, [selectedTestCaseId, filteredTestCases]);

  // ── 핸들러 ────────────────────────────────────────────────────────────────

  const handleCheckAll = useCallback(
    (event) => {
      if (event.target.checked) {
        setCheckedIds(allIds);
        if (selectable && onSelectionChange) onSelectionChange(allIds);
      } else {
        setCheckedIds([]);
        if (selectable && onSelectionChange) onSelectionChange([]);
      }
    },
    [allIds, selectable, onSelectionChange],
  );

  const handleToggleNode = useCallback((e, nodeId) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const isExp = prev.includes(nodeId);
      return isExp ? prev.filter((id) => id !== nodeId) : [...prev, nodeId];
    });
  }, []);

  const updateCheckedState = useCallback(
    (nodeId, isChecked) => {
      const childIds = getAllChildIds(filteredTestCases, nodeId);
      let newCheckedIds;
      if (isChecked) {
        const idsToAdd = [nodeId, ...childIds];
        newCheckedIds = Array.from(new Set([...checkedIds, ...idsToAdd]));
      } else {
        const idsToRemove = new Set([nodeId, ...childIds]);
        newCheckedIds = checkedIds.filter((id) => !idsToRemove.has(id));
      }
      setCheckedIds(newCheckedIds);
      if (selectable && onSelectionChange) {
        onSelectionChange(newCheckedIds);
      }
      return newCheckedIds;
    },
    [filteredTestCases, checkedIds, selectable, onSelectionChange],
  );

  const handleSelect = useCallback(
    (event, nodeId) => {
      setSelected(nodeId);

      if (selectable) {
        const isCurrentlyChecked = checkedIds.includes(nodeId);
        updateCheckedState(nodeId, !isCurrentlyChecked);
      }

      // 무거운 후속 작업은 비동기 처리 (INP 개선)
      setTimeout(() => {
        const selectedTestCase = filteredTestCases.find(
          (tc) => tc.id === nodeId,
        );
        if (!selectable) {
          setActiveTestCase(nodeId);
        }
        if (onSelectTestCase) {
          if (selectTimeout.current) clearTimeout(selectTimeout.current);
          selectTimeout.current = setTimeout(() => {
            onSelectTestCase(selectedTestCase);
          }, 50);
        }
      }, 0);
    },
    [
      filteredTestCases,
      selectable,
      checkedIds,
      updateCheckedState,
      setActiveTestCase,
      onSelectTestCase,
    ],
  );

  const handleContextMenu = useCallback(
    (event, nodeId) => {
      if (isViewer(userRole) || selectable) return;
      event.preventDefault();
      event.stopPropagation();
      setSelected(nodeId);
      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
        nodeId,
      });
    },
    [userRole, selectable],
  );

  const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);

  const handleCheck = useCallback(
    (event, nodeId) => {
      updateCheckedState(nodeId, event.target.checked);
    },
    [updateCheckedState],
  );

  const isNodeChecked = useCallback(
    (nodeId) => checkedIds.includes(nodeId),
    [checkedIds],
  );

  return {
    // 상태
    expanded,
    setExpanded,
    selected,
    setSelected,
    contextMenu,
    setContextMenu,
    checkedIds,
    setCheckedIds,

    // 계산된 값
    filteredTestCases,
    totalTestCaseCount,
    totalFolderCount,
    isAllChecked,
    isIndeterminate,

    // 핸들러
    handleCheckAll,
    handleToggleNode,
    updateCheckedState,
    handleSelect,
    handleContextMenu,
    handleCloseContextMenu,
    handleCheck,
    isNodeChecked,
  };
};
