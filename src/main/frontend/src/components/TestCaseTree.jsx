// src/components/TestCaseTree.jsx

import React, { useEffect } from "react";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import {
  Box, CircularProgress, Typography, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button, useTheme, alpha
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import TestCaseVersionHistory from "./TestCase/TestCaseVersionHistory.jsx";

// Custom hooks
import { useTestCaseTree } from "./TestCaseTree/hooks/useTestCaseTree.jsx";
import { useTestCaseActions } from "./TestCaseTree/hooks/useTestCaseActions.jsx";

// Components
import TreeToolbar from "./TestCaseTree/components/TreeToolbar.jsx";
import TreeCheckbox from "./TestCaseTree/components/TreeCheckbox.jsx";
import TreeNodeLabel from "./TestCaseTree/components/TreeNodeLabel.jsx";
import AddItemInput from "./TestCaseTree/components/AddItemInput.jsx";
import RenameInput from "./TestCaseTree/components/RenameInput.jsx";
import TreeContextMenu from "./TestCaseTree/components/TreeContextMenu.jsx";
import DeleteDialog from "./TestCaseTree/components/DeleteDialog.jsx";
import BatchDeleteDialog from "./TestCaseTree/components/BatchDeleteDialog.jsx";

// Utilities
import { isViewer, canDelete as checkCanDelete, canAdd } from "./TestCaseTree/utils/permissionUtils.js";
import { countTestCasesRecursive } from "./TestCaseTree/utils/treeOperations.js";

const TestCaseTree = ({
  projectId,
  onSelectTestCase,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  selectedTestCaseId = null,
  showMinimalToolbar = false,
}) => {
  const {
    testCases,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    setActiveTestCase,
    fetchProjectTestCases,
    user,
  } = useAppContext();
  const { t } = useI18n();
  const theme = useTheme();

  // Use custom hooks
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
  });

  const actions = useTestCaseActions({
    projectId,
    filteredTestCases: treeState.filteredTestCases,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    fetchProjectTestCases,
    user,
    t,
    setExpanded: treeState.setExpanded,
    checkedIds: treeState.checkedIds,
    setCheckedIds: treeState.setCheckedIds,
  });

  // Update order map when filteredTestCases or orderEditMode changes
  useEffect(() => {
    if (!actions.orderEditMode) {
      const map = treeState.filteredTestCases.reduce((acc, item) => {
        acc[item.id] = item.displayOrder ?? 0;
        return acc;
      }, {});
      actions.setOrderMap(map);
      actions.setOrderChanged(false);
    }
  }, [treeState.filteredTestCases, actions.orderEditMode]);

  // Render tree recursively
  const renderTree = (nodes, parentId = null) => {
    let sortedNodes = nodes.slice();
    if (actions.orderEditMode) {
      sortedNodes.sort((a, b) => (actions.orderMap[a.id] ?? 0) - (actions.orderMap[b.id] ?? 0));
    } else {
      sortedNodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }

    return sortedNodes.map((node, idx, arr) => {
      const isSelected = selectable ? treeState.checkedIds.includes(node.id) : treeState.selected === node.id;
      const isHighlighted = node.id === actions.highlightedItemId;
      const isChecked = treeState.isNodeChecked(node.id);
      const nodeOrder = actions.orderEditMode ? actions.orderMap[node.id] : node.displayOrder ?? 0;

      let testCaseCount = 0;
      if (node.type === "folder") {
        testCaseCount = countTestCasesRecursive(node);
      }

      // 추가 입력 폼 (하위 항목)
      const addChildInput = actions.newItemData &&
        actions.newItemData.parentId === node.id &&
        canAdd(user?.role) && (
          <AddItemInput
            itemData={actions.newItemData}
            onConfirm={actions.handleConfirmAdd}
            onCancel={actions.handleCancelAdd}
            onChange={(e) => actions.setNewItemData({ ...actions.newItemData, name: e.target.value })}
            isRoot={false}
          />
        );

      // 이름 변경 중인지 확인
      const isRenaming = actions.renameData && actions.renameData.id === node.id;

      const labelContent = isRenaming ? (
        <RenameInput
          renameData={actions.renameData}
          onConfirm={actions.handleConfirmRename}
          onCancel={actions.handleCancelRename}
          onChange={(e) => actions.setRenameData({ ...actions.renameData, name: e.target.value })}
        />
      ) : (
        <TreeNodeLabel
          node={node}
          isChecked={isChecked}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          nodeOrder={nodeOrder}
          orderEditMode={actions.orderEditMode}
          onCheck={(e) => treeState.handleCheck(e, node.id)}
          onMoveUp={() => actions.moveNodeOrder(node.id, "up")}
          onMoveDown={() => actions.moveNodeOrder(node.id, "down")}
          onContextMenu={(e) => treeState.handleContextMenu(e, node.id)}
          onOpenVersionHistory={() => actions.handleOpenVersionHistory(node.id)}
          testCaseCount={testCaseCount}
          isFirstSibling={idx === 0}
          isLastSibling={idx === arr.length - 1}
          isViewer={isViewer(user?.role)}
          selectable={selectable}
        />
      );

      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={<Box>{labelContent}</Box>}
          sx={{
            "& .MuiTreeItem-content.Mui-selected": {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            },
            "& .MuiTreeItem-content.Mui-selected:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
            },
            "& .MuiTreeItem-label.Mui-selected": {
              fontWeight: "bold",
              color: theme.palette.primary.main,
            },
          }}
        >
          {addChildInput}
          {Array.isArray(node.children) && node.children.length > 0
            ? renderTree(node.children, node.id)
            : null}
        </TreeItem>
      );
    });
  };

  // Content based on state
  let content;
  if (!projectId) {
    content = (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('testcase.tree.message.selectProject', '프로젝트를 선택하세요.')}
        </Typography>
      </Box>
    );
  } else if (testCases === undefined) {
    content = (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('testcase.tree.message.loading', '로딩 중...')}
        </Typography>
      </Box>
    );
  } else if (!treeState.filteredTestCases || treeState.filteredTestCases.length === 0) {
    content = (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('testcase.tree.message.noTestcases', '테스트케이스가 없습니다.')}
        </Typography>
      </Box>
    );
  } else {
    content = (
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={treeState.expanded}
        selected={selectable ? undefined : treeState.selected}
        onNodeToggle={treeState.handleToggle}
        onNodeSelect={treeState.handleSelect}
        sx={{
          height: "100%",
          flexGrow: 1,
          overflowY: "auto",
          "& .MuiTreeItem-content": { padding: "4px 8px" },
        }}
      >
        {treeState.treeData.length > 0 ? (
          renderTree(treeState.treeData)
        ) : (
          <Typography variant="body2" sx={{ p: 2 }}>
            {t('testcase.tree.message.noTestcases', '테스트케이스가 없습니다.')}
          </Typography>
        )}
      </TreeView>
    );
  }

  // 루트 추가 입력
  const rootAddInput = actions.newItemData &&
    actions.newItemData.parentId === null &&
    canAdd(user?.role) && (
      <AddItemInput
        itemData={actions.newItemData}
        onConfirm={actions.handleConfirmAdd}
        onCancel={actions.handleCancelAdd}
        onChange={(e) => actions.setNewItemData({ ...actions.newItemData, name: e.target.value })}
        isRoot={true}
      />
    );

  // 전체선택 체크박스
  const rootCheckAll = !isViewer(user?.role) && (
    <TreeCheckbox
      checked={treeState.isAllChecked}
      indeterminate={treeState.isIndeterminate}
      onChange={treeState.handleCheckAll}
      totalTestCaseCount={treeState.totalTestCaseCount}
      totalFolderCount={treeState.totalFolderCount}
    />
  );

  // 선택된 노드 찾기
  const selectedNode = treeState.filteredTestCases.find((tc) => tc.id === treeState.contextMenu?.nodeId);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <TreeToolbar
        onRefresh={actions.handleRefresh}
        onAddFolder={() => actions.handleAddItem("folder", treeState.contextMenu?.nodeId)}
        onAddTestCase={() => actions.handleAddItem("testcase", treeState.contextMenu?.nodeId)}
        onToggleOrderEdit={actions.handleOrderEditMode}
        onOrderSave={actions.handleOrderSave}
        onOrderCancel={actions.handleOrderCancel}
        onBulkDelete={actions.handleBulkDelete}
        checkedCount={treeState.checkedIds.length}
        orderEditMode={actions.orderEditMode}
        userRole={user?.role}
        isViewer={isViewer(user?.role)}
        canDelete={checkCanDelete(user?.role)}
        showMinimalToolbar={showMinimalToolbar}
      />

      {rootCheckAll}

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
        {rootAddInput}
        {content}
      </Box>

      {/* 컨텍스트 메뉴 */}
      {!selectable && !isViewer(user?.role) && (
        <TreeContextMenu
          contextMenu={treeState.contextMenu}
          onClose={treeState.handleCloseContextMenu}
          onAddFolder={() => {
            actions.handleAddItem("folder", treeState.contextMenu?.nodeId);
            treeState.handleCloseContextMenu();
          }}
          onAddTestCase={() => {
            actions.handleAddItem("testcase", treeState.contextMenu?.nodeId);
            treeState.handleCloseContextMenu();
          }}
          onRename={() => {
            actions.handleRename(treeState.contextMenu.nodeId);
            treeState.handleCloseContextMenu();
          }}
          onDelete={() => {
            actions.handleDeleteClick(treeState.contextMenu.nodeId);
            treeState.handleCloseContextMenu();
          }}
          onOpenVersionHistory={() => {
            actions.handleOpenVersionHistory(treeState.contextMenu.nodeId);
            treeState.handleCloseContextMenu();
          }}
          selectedNode={selectedNode}
          canAdd={canAdd(user?.role)}
          canDelete={checkCanDelete(user?.role)}
        />
      )}

      {/* 일괄 삭제 다이얼로그 */}
      <BatchDeleteDialog
        open={actions.batchDeleteDialogOpen}
        onClose={actions.handleCloseBatchDeleteDialog}
        onConfirm={actions.handleConfirmBulkDelete}
        checkedCount={treeState.checkedIds.length}
        deleting={actions.bulkDeleting}
      />

      {/* 단일 삭제 다이얼로그 */}
      <DeleteDialog
        open={actions.deleteConfirmationOpen}
        onClose={actions.handleCancelDelete}
        onConfirm={actions.handleConfirmDelete}
        deleting={actions.deleting}
      />

      {/* 에러 메시지 다이얼로그 */}
      <Dialog open={!!actions.errorMessage} onClose={() => actions.setErrorMessage("")}>
        <DialogTitle>{t('testcase.tree.dialog.error.title', '오류')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{actions.errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => actions.setErrorMessage("")} autoFocus>
            {t('testcase.tree.button.close', '닫기')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 버전 히스토리 다이얼로그 */}
      <TestCaseVersionHistory
        testCaseId={actions.selectedVersionTestCaseId}
        open={actions.versionHistoryOpen}
        onClose={() => {
          actions.setVersionHistoryOpen(false);
          actions.setSelectedVersionTestCaseId(null);
        }}
        onRestore={actions.handleVersionRestore}
      />
    </Box>
  );
};

export default TestCaseTree;
