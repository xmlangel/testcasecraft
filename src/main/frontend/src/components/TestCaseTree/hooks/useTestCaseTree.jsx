// src/components/TestCaseTree/hooks/useTestCaseTree.jsx
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getAncestorIds, getAllChildIds } from "../../../utils/treeUtils.jsx";
import { isViewer } from "../utils/permissionUtils.js";
import { collectQueryScopedIds } from "../utils/treeFilter.js";

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
  filterText = "",
  folderOnlyView = false,
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
    () => filteredTestCases.filter((tc) => tc && tc.type === "testcase").length,
    [filteredTestCases],
  );

  // 전체 폴더 수
  const totalFolderCount = useMemo(
    () => filteredTestCases.filter((tc) => tc && tc.type === "folder").length,
    [filteredTestCases],
  );

  // ICT-431: 검색 결과에 속하는 노드 집합(자신 또는 조상이 걸린 것).
  // 검색이 없으면 null = 제한 없음. 폴더 전용 뷰에서는 케이스가 화면에 없으므로 뺀다.
  const queryScopedIds = useMemo(
    () =>
      collectQueryScopedIds(
        folderOnlyView
          ? filteredTestCases.filter((tc) => tc && tc.type === "folder")
          : filteredTestCases,
        filterText,
      ),
    [filteredTestCases, filterText, folderOnlyView],
  );

  // 전체 선택 대상.
  // - selectable 모드(테스트플랜 케이스 선택): 케이스만 (폴더는 플랜 멤버가 아님)
  // - 일반 모드: 폴더 + 케이스 모두. 전체선택 후 "다른 프로젝트로 이동/복사" 시
  //   폴더가 빠지면 구조가 평탄화되므로 폴더도 포함해야 한다.
  // - ICT-431: 검색으로 좁혀둔 상태면 걸린 것만. 안 보이는 항목이 딸려 들어가면
  //   플랜에 엉뚱한 케이스가 담기고, 일반 모드에서는 일괄 삭제 대상이 번진다.
  const checkTargetIds = useMemo(() => {
    const eligible = filteredTestCases.filter(
      (tc) => tc && (selectable ? tc.type === "testcase" : true),
    );
    const scoped = queryScopedIds
      ? eligible.filter((tc) => queryScopedIds.has(tc.id))
      : eligible;
    return scoped.map((tc) => tc.id);
  }, [filteredTestCases, selectable, queryScopedIds]);

  // 검색 결과 기준 카운트 (헤더에 "걸린 수 / 전체 수" 로 표시)
  const matchedTestCaseCount = useMemo(
    () =>
      queryScopedIds
        ? filteredTestCases.filter(
            (tc) => tc && tc.type === "testcase" && queryScopedIds.has(tc.id),
          ).length
        : totalTestCaseCount,
    [filteredTestCases, queryScopedIds, totalTestCaseCount],
  );
  const matchedFolderCount = useMemo(
    () =>
      queryScopedIds
        ? filteredTestCases.filter(
            (tc) => tc && tc.type === "folder" && queryScopedIds.has(tc.id),
          ).length
        : totalFolderCount,
    [filteredTestCases, queryScopedIds, totalFolderCount],
  );

  const checkedTargetCount = useMemo(() => {
    const checked = new Set(checkedIds);
    return checkTargetIds.filter((id) => checked.has(id)).length;
  }, [checkTargetIds, checkedIds]);

  const isAllChecked =
    checkTargetIds.length > 0 && checkedTargetCount === checkTargetIds.length;
  // 검색 중에는 "걸린 것 중 일부만 선택" 일 때만 중간 상태. 필터 밖 선택은 셈에서 뺀다.
  const isIndeterminate = queryScopedIds
    ? checkedTargetCount > 0 && !isAllChecked
    : checkedIds.length > 0 && !isAllChecked;

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
      // 검색 중이면 필터 밖 선택은 건드리지 않는다.
      // "smoke 걸러 전부 담고, regression 걸러 또 담기" 가 되어야 하므로.
      let next;
      if (event.target.checked) {
        next = queryScopedIds
          ? Array.from(new Set([...checkedIds, ...checkTargetIds]))
          : checkTargetIds;
      } else if (queryScopedIds) {
        const targets = new Set(checkTargetIds);
        next = checkedIds.filter((id) => !targets.has(id));
      } else {
        next = [];
      }
      setCheckedIds(next);
      if (selectable && onSelectionChange) onSelectionChange(next);
    },
    [checkTargetIds, checkedIds, queryScopedIds, selectable, onSelectionChange],
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
      // ICT-431: 검색 중 폴더를 체크하면 걸린 하위 항목만 따라온다.
      // 클릭한 노드 자체는 화면에 있으니 항상 포함.
      const childIds = getAllChildIds(filteredTestCases, nodeId).filter(
        (id) => !queryScopedIds || queryScopedIds.has(id),
      );
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
    [
      filteredTestCases,
      checkedIds,
      queryScopedIds,
      selectable,
      onSelectionChange,
    ],
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
    queryScopedIds,
    checkTargetIds,
    matchedTestCaseCount,
    matchedFolderCount,
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
