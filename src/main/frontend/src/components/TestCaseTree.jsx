import React, { useCallback, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { useAuth } from "../context/AuthContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
import { useTest } from "../context/TestContext.jsx";
import { useInputMode } from "../context/InputModeContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { isViewer } from "./TestCaseTree/utils/permissionUtils.js";
import { countTestCasesRecursive } from "./TestCaseTree/utils/treeOperations.js";
import {
  isFolder,
  listToTree,
  getAllDescendants,
} from "../utils/treeUtils.jsx";

// 훅
import { useTestCaseTree } from "./TestCaseTree/hooks/useTestCaseTree.jsx";
import { useTestCaseActions } from "./TestCaseTree/hooks/useTestCaseActions.jsx";
import { useTreeVirtualizer } from "./TestCaseTree/hooks/useTreeVirtualizer.jsx";

// 컴포넌트
import MemoizedTreeItem from "./TestCaseTree/components/MemoizedTreeItem.jsx";
import TreeHeader from "./TestCaseTree/components/TreeHeader.jsx";
import TreeContextMenu from "./TestCaseTree/components/TreeContextMenu.jsx";
import TreeDialogs from "./TestCaseTree/components/TreeDialogs.jsx";

/**
 * TestCaseTree - 테스트케이스 트리 조합(Orchestration) 컴포넌트
 *
 * 책임 분리:
 * - useTestCaseTree: 확장/선택/체크 상태 + 필터링/정렬 + 트리 상호작용 핸들러
 * - useTestCaseActions: CRUD/순서/버전 액션 + orderMap 상태
 * - useTreeVirtualizer: 가상화 (flatData, virtualizer)
 * - TreeHeader / TreeContextMenu / TreeDialogs: UI 컴포넌트
 */
const TestCaseTree = ({
  projectId,
  onSelectTestCase,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  selectedTestCaseId = null,
}) => {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const {
    testCases,
    addTestCase,
    updateTestCase,
    updateTestCaseLocal,
    deleteTestCase,
    setActiveTestCase,
    fetchProjectTestCases,
  } = useTest();
  const { inputMode, setInputMode } = useInputMode();
  const { t } = useI18n();

  // ── 1. 트리 상태 (초기 orderMap은 빈 객체; actions에서 sync됨) ──────────────
  const treeState = useTestCaseTree({
    projectId,
    testCases,
    fetchProjectTestCases,
    selectable,
    selectedIds,
    onSelectionChange,
    selectedTestCaseId,
    setActiveTestCase,
    onSelectTestCase,
    userRole: user?.role,
  });

  // ── 2. CRUD / 순서 / 버전 액션 ────────────────────────────────────────────
  const actions = useTestCaseActions({
    projectId,
    filteredTestCases: treeState.filteredTestCases,
    addTestCase,
    updateTestCase,
    updateTestCaseLocal,
    deleteTestCase,
    fetchProjectTestCases,
    user,
    t,
    setExpanded: treeState.setExpanded,
    checkedIds: treeState.checkedIds,
    setCheckedIds: treeState.setCheckedIds,
    inputMode,
    setInputMode,
    onSelectTestCase,
  });

  // ── 3. orderMap을 반영한 정렬 트리 데이터 ─────────────────────────────────
  const sortedTestCases = useMemo(() => {
    return treeState.filteredTestCases.slice().sort((a, b) => {
      const orderA = actions.orderMap[a.id] ?? a.displayOrder ?? 0;
      const orderB = actions.orderMap[b.id] ?? b.displayOrder ?? 0;
      return orderA - orderB;
    });
  }, [treeState.filteredTestCases, actions.orderMap]);

  const treeData = useMemo(
    () => listToTree(sortedTestCases, null),
    [sortedTestCases],
  );

  // ── 4. 가상화 ──────────────────────────────────────────────────────────────
  const { flatData, virtualizer, parentRef } = useTreeVirtualizer({
    treeData,
    expanded: treeState.expanded,
    newItemData: actions.newItemData,
  });

  // ── 4.5. DnD 센서 + 핸들러 ─────────────────────────────────────────────────
  // 설계: docs/plan/TREE_DND_REORGANIZE_PLAN.md
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const [activeDragId, setActiveDragId] = useState(null);

  const activeDragNode = useMemo(() => {
    if (!activeDragId) return null;
    return (
      treeState.filteredTestCases.find((tc) => tc.id === activeDragId) || null
    );
  }, [activeDragId, treeState.filteredTestCases]);

  const handleDragStart = useCallback((event) => {
    const id = event?.active?.data?.current?.nodeId;
    if (id) setActiveDragId(id);
  }, []);

  const handleDragCancel = useCallback(() => setActiveDragId(null), []);

  const handleDragEnd = useCallback(
    async (event) => {
      setActiveDragId(null);
      const { active, over } = event || {};
      if (!active || !over) return;
      const sourceId = active.data?.current?.nodeId;
      const drop = over.data?.current;
      if (!sourceId || !drop) return;

      // 다중 선택 묶음 결정: 활성 노드가 checkedIds에 포함되면 묶음 전체, 아니면 단일
      let ids = [sourceId];
      if (
        treeState.checkedIds &&
        treeState.checkedIds.length > 0 &&
        treeState.checkedIds.includes(sourceId)
      ) {
        ids = [...treeState.checkedIds];
      }

      // 자기 자신/후손 차단 (프론트 사전 가드, 백엔드도 동일 검증)
      const allBlocked = new Set();
      ids.forEach((id) => {
        allBlocked.add(id);
        const descendants = getAllDescendants(treeState.filteredTestCases, id);
        descendants.forEach((d) => allBlocked.add(d.id));
      });

      let targetParentId = null;
      let beforeId;
      let afterId;
      if (drop.kind === "into") {
        targetParentId = drop.nodeId;
      } else if (drop.kind === "before") {
        targetParentId = drop.parentId ?? null;
        beforeId = drop.nodeId;
      } else if (drop.kind === "after") {
        targetParentId = drop.parentId ?? null;
        afterId = drop.nodeId;
      } else {
        return;
      }

      // 자기/후손 위 드롭 거부
      if (targetParentId && allBlocked.has(targetParentId)) return;
      if (beforeId && allBlocked.has(beforeId)) return;
      if (afterId && allBlocked.has(afterId)) return;

      try {
        await actions.moveNodes({
          ids,
          targetParentId,
          beforeId,
          afterId,
        });
      } catch {
        // moveNodes에서 errorMessage 세팅 + 서버 재동기화
      }
    },
    [actions, treeState.checkedIds, treeState.filteredTestCases],
  );

  // ── 5. 핸들러 래퍼 ────────────────────────────────────────────────────────
  const handleOpenAddMenu = useCallback(
    (e) => {
      treeState.setContextMenu({
        mouseX: e.clientX,
        mouseY: e.clientY,
        nodeId: null,
      });
    },
    [treeState.setContextMenu],
  );

  const selectedNode = treeState.filteredTestCases.find(
    (tc) => tc.id === treeState.contextMenu?.nodeId,
  );

  // ── 6. 콘텐츠 렌더링 ───────────────────────────────────────────────────────
  let content;
  if (!projectId) {
    content = (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t("testcase.tree.message.selectProject", "프로젝트를 선택하세요.")}
        </Typography>
      </Box>
    );
  } else if (testCases === undefined) {
    content = (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("testcase.tree.message.loading", "로딩 중...")}
        </Typography>
      </Box>
    );
  } else if (
    (!treeState.filteredTestCases ||
      treeState.filteredTestCases.length === 0) &&
    !actions.newItemData
  ) {
    content = (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t("testcase.tree.message.noTestcases", "테스트케이스가 없습니다.")}
        </Typography>
      </Box>
    );
  } else {
    content = (
      <Box
        ref={parentRef}
        sx={{
          height: "100%",
          flexGrow: 1,
          overflowY: "auto",
          position: "relative",
          "& .MuiTreeItem-content": { padding: "4px 8px" },
        }}
      >
        <Box
          sx={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const node = flatData[virtualItem.index];

            // 방어 코드: 가상화 인덱스가 현재 데이터 범위를 벗어난 경우 (삭제 작업 등)
            if (!node) return null;

            const isSelected = treeState.selected === node.id;
            const isChecked = treeState.checkedIds.includes(node.id);
            const isExpanded = treeState.expanded.includes(node.id);
            const nodeOrder =
              actions.orderMap[node.id] ?? node.displayOrder ?? 0;
            const testCaseCount = isFolder(node)
              ? countTestCasesRecursive(node)
              : 0;

            return (
              <Box
                key={`${node.id}-${nodeOrder}`}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MemoizedTreeItem
                  node={node}
                  isSelected={isSelected}
                  isChecked={isChecked}
                  isExpanded={isExpanded}
                  onToggle={(e) => treeState.handleToggleNode(e, node.id)}
                  selectable={selectable}
                  userRole={user?.role}
                  orderEditMode={actions.orderEditMode}
                  nodeOrder={nodeOrder}
                  testCaseCount={testCaseCount}
                  onCheck={treeState.handleCheck}
                  onContextMenu={treeState.handleContextMenu}
                  onAddItem={actions.handleAddItem}
                  onRename={() =>
                    actions.handleRename(treeState.contextMenu?.nodeId)
                  }
                  onDelete={() =>
                    actions.handleDeleteClick(treeState.contextMenu?.nodeId)
                  }
                  onMoveOrder={actions.moveNodeOrder}
                  onOpenVersionHistory={actions.handleOpenVersionHistory}
                  newItemData={actions.newItemData}
                  setNewItemData={actions.setNewItemData}
                  handleConfirmAdd={actions.handleConfirmAdd}
                  handleCancelAdd={actions.handleCancelAdd}
                  t={t}
                  onSelect={treeState.handleSelect}
                  depth={node.depth}
                  idx={node.idx}
                  siblings={node.siblings}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // ── 7. 최종 렌더링 ─────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <TreeHeader
        userRole={user?.role}
        selectable={selectable}
        isAllChecked={treeState.isAllChecked}
        isIndeterminate={treeState.isIndeterminate}
        totalFolderCount={treeState.totalFolderCount}
        totalTestCaseCount={treeState.totalTestCaseCount}
        checkedIds={treeState.checkedIds}
        orderEditMode={actions.orderEditMode}
        orderChanged={actions.orderChanged}
        onCheckAll={treeState.handleCheckAll}
        onRefresh={actions.handleRefresh}
        onOpenAddMenu={handleOpenAddMenu}
        onOrderEditMode={actions.handleOrderEditMode}
        onOrderSave={actions.handleOrderSave}
        onOrderCancel={actions.handleOrderCancel}
        onBatchDelete={() => actions.setBatchDeleteDialogOpen(true)}
      />

      {/* 구분선 */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mx: 2 }} />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {content}
        <DragOverlay dropAnimation={null}>
          {activeDragNode ? (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
                boxShadow: 3,
                fontSize: 14,
                fontWeight: 600,
                maxWidth: 320,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {treeState.checkedIds?.length > 1 &&
              treeState.checkedIds.includes(activeDragNode.id)
                ? `${activeDragNode.name} 외 ${treeState.checkedIds.length - 1}개`
                : activeDragNode.name}
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 컨텍스트 메뉴 */}
      {!selectable && !isViewer(user?.role) && (
        <TreeContextMenu
          contextMenu={treeState.contextMenu}
          onClose={treeState.handleCloseContextMenu}
          onAddFolder={() =>
            actions.handleAddItem("folder", treeState.contextMenu?.nodeId)
          }
          onAddTestCase={() =>
            actions.handleAddItem("testcase", treeState.contextMenu?.nodeId)
          }
          onRename={() => actions.handleRename(treeState.contextMenu?.nodeId)}
          onDelete={() =>
            actions.handleDeleteClick(treeState.contextMenu?.nodeId)
          }
          onOpenVersionHistory={() =>
            actions.handleOpenVersionHistory(treeState.contextMenu?.nodeId)
          }
          selectedNode={selectedNode}
          userRole={user?.role}
          pendingRename={actions.pendingRename}
          setPendingRename={actions.setPendingRename}
          setRenameData={actions.setRenameData}
        />
      )}

      {/* 다이얼로그 모음 */}
      <TreeDialogs
        renameData={actions.renameData}
        setRenameData={actions.setRenameData}
        onCancelRename={actions.handleCancelRename}
        onConfirmRename={actions.handleConfirmRename}
        errorMessage={actions.errorMessage}
        onCloseError={() => actions.setErrorMessage("")}
        deleteConfirmationOpen={actions.deleteConfirmationOpen}
        onCancelDelete={actions.handleCancelDelete}
        onConfirmDelete={actions.handleConfirmDelete}
        singleDeleteItems={actions.getSingleDeleteItems()}
        batchDeleteDialogOpen={actions.batchDeleteDialogOpen}
        onCloseBatchDelete={() => actions.setBatchDeleteDialogOpen(false)}
        onConfirmBatchDelete={actions.handleConfirmBatchDelete}
        batchDeleteItems={actions.getBatchDeleteItems()}
        checkedIds={treeState.checkedIds}
        versionHistoryOpen={actions.versionHistoryOpen}
        selectedVersionTestCaseId={actions.selectedVersionTestCaseId}
        onCloseVersionHistory={() => {
          actions.setVersionHistoryOpen(false);
          actions.setSelectedVersionTestCaseId(null);
        }}
        onRestore={actions.handleVersionRestore}
      />
    </Box>
  );
};

export default TestCaseTree;
