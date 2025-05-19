// src/components/TestCaseTree.js

import React, { useState, useRef, useMemo, useCallback } from "react";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import { Box, IconButton, Menu, MenuItem, Typography, TextField, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Checkbox, Toolbar, FormControlLabel } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, Folder as FolderIcon, Description as DescriptionIcon, Add as AddIcon, Delete as DeleteIcon, DeleteForever as DeleteForeverIcon, Edit as EditIcon, MoreVert as MoreVertIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, Save as SaveIcon, Close as CloseIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "../context/AppContext";
import { listToTree, isFolder, getAncestorIds } from "../utils/treeUtils";

function getAllChildIds(items, parentId) {
  let result = [];
  const stack = [parentId];
  while (stack.length > 0) {
    const current = stack.pop();
    const children = items.filter((item) => item.parentId === current);
    for (const child of children) {
      result.push(child.id);
      stack.push(child.id);
    }
  }
  return result;
}

function sortByDisplayOrder(items) {
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

const TestCaseTree = ({ projectId, onSelectTestCase, selectable = false, selectedIds = [], onSelectionChange }) => {
  const { testCases, addTestCase, updateTestCase, deleteTestCase, setActiveTestCase, fetchProjectTestCases } = useAppContext();

  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [orderEditMode, setOrderEditMode] = useState(false);
  const [orderMap, setOrderMap] = useState({});
  const [orderChanged, setOrderChanged] = useState(false);

  const highlightTimeout = useRef(null);

  const filteredTestCases = useMemo(() =>
      projectId ? testCases.filter((tc) => tc.projectId === projectId) : testCases
    , [projectId, testCases]);

  React.useEffect(() => {
      if (!orderEditMode) {
        const map = filteredTestCases.reduce((acc, item) => {
          acc[item.id] = item.displayOrder ?? 0;
          return acc;
        }, {});
        setOrderMap(map);
        setOrderChanged(false);
      }
    }, [filteredTestCases, orderEditMode]);

  const treeData = useMemo(() => listToTree(filteredTestCases, null), [filteredTestCases]);

  const allIds = filteredTestCases.map((tc) => tc.id);
  const isAllChecked = allIds.length > 0 && allIds.every((id) => checkedIds.includes(id));
  const isIndeterminate = checkedIds.length > 0 && !isAllChecked;

  const handleCheckAll = (event) => {
    if (event.target.checked) {
      setCheckedIds(allIds);
      if (selectable && onSelectionChange) onSelectionChange(allIds);
    } else {
      setCheckedIds([]);
      if (selectable && onSelectionChange) onSelectionChange([]);
    }
  };

  const handleToggle = (event, nodeIds) => setExpanded(nodeIds);

  const handleSelect = (event, nodeId) => {
    setSelected(nodeId);
    const selectedTestCase = filteredTestCases.find((tc) => tc.id === nodeId);
    if (selectable) {
      if (selectedIds.includes(nodeId)) {
        onSelectionChange(selectedIds.filter((id) => id !== nodeId));
      } else {
        onSelectionChange([...selectedIds, nodeId]);
      }
    } else {
      setActiveTestCase(nodeId);
    }
    if (onSelectTestCase) onSelectTestCase(selectedTestCase);
  };

  const handleContextMenu = (event, nodeId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelected(nodeId);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      nodeId,
    });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleAddItem = (type) => {
    const parentId = contextMenu?.nodeId ?? null;
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
    handleCloseContextMenu();
  };

  const handleCancelAdd = () => setNewItemData(null);

  const handleConfirmAdd = async () => {
    if (!newItemData || !newItemData.name || !newItemData.name.trim()) return;
    const id = newItemData.type === "folder" ? `folder-${uuidv4()}` : `test-${uuidv4()}`;
    const parentId = newItemData.parentId === undefined ? null : newItemData.parentId;
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
    await addTestCase(newItem);
    await fetchProjectTestCases(projectId);
    setNewItemData(null);
    setHighlightedItemId(id);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setHighlightedItemId(null), 1500);
  };

  const handleRename = () => {
    const node = filteredTestCases.find((tc) => tc.id === contextMenu.nodeId);
    setRenameData({ id: node.id, name: node.name });
    handleCloseContextMenu();
  };

  const handleCancelRename = () => setRenameData(null);

  const handleConfirmRename = () => {
    const testCase = filteredTestCases.find((tc) => tc.id === renameData.id);
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
        : testCase;
    updateTestCase(payload);
    fetchProjectTestCases(projectId);
    setRenameData(null);
  };

  const handleDeleteClick = () => {
    setItemToDeleteId(contextMenu.nodeId);
    setDeleteConfirmationOpen(true);
    handleCloseContextMenu();
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setItemToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    // 하위까지 모두 삭제
    const childIds = getAllChildIds(filteredTestCases, itemToDeleteId);
    await deleteTestCase(itemToDeleteId);
    for (const id of childIds) {
      await deleteTestCase(id);
    }
    await fetchProjectTestCases(projectId);
    setDeleteConfirmationOpen(false);
    setItemToDeleteId(null);
  };

  const handleCheck = (event, nodeId) => {
    const isChecked = event.target.checked;
    let newCheckedIds = [...checkedIds];
    const childIds = getAllChildIds(filteredTestCases, nodeId);
    if (isChecked) {
      newCheckedIds = Array.from(new Set([...newCheckedIds, nodeId, ...childIds]));
    } else {
      newCheckedIds = newCheckedIds.filter((id) => id !== nodeId && !childIds.includes(id));
    }
    setCheckedIds(newCheckedIds);
    if (selectable && onSelectionChange) onSelectionChange(newCheckedIds);
  };

  const isNodeChecked = (nodeId) => checkedIds.includes(nodeId);

  React.useEffect(() => {
    if (selectable && Array.isArray(selectedIds)) {
      setCheckedIds(selectedIds);
    }
  }, [selectedIds, selectable]);

  const moveNodeOrder = (nodeId, direction) => {
    const node = filteredTestCases.find((tc) => tc.id === nodeId);
    if (!node) return;

    const parentId = node.parentId ?? null;
    const siblings = filteredTestCases
      .filter((tc) => (tc.parentId ?? null) === parentId)
      .sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));

    const idx = siblings.findIndex((tc) => tc.id === nodeId);
    if (idx === -1) return;

    let targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= siblings.length) return;

    const targetNode = siblings[targetIdx];
    const newOrderMap = { ...orderMap };
    [newOrderMap[nodeId], newOrderMap[targetNode.id]] = [
      newOrderMap[targetNode.id],
      newOrderMap[nodeId],
    ];

    setOrderMap(newOrderMap);
    setOrderChanged(true);
  };

  const handleOrderEditMode = () => setOrderEditMode(true);

  const handleOrderCancel = () => {
    setOrderEditMode(false);
    setOrderChanged(false);
  };

  const handleOrderSave = async () => {
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
          updates.push(
            updateTestCase({
              ...item,
              displayOrder: newOrder,
            })
          );
        }
      });
    });

    await Promise.all(updates);
    setOrderEditMode(false);
    setOrderChanged(false);
  };

  function countTestCasesRecursive(node) {
    if (!node.children || node.children.length === 0) return 0;
    let count = 0;
    node.children.forEach((child) => {
      if (child.type === "testcase") count += 1;
      else if (child.type === "folder") count += countTestCasesRecursive(child);
    });
    return count;
  }

  const handleRefresh = async () => {
    await fetchProjectTestCases(projectId);
  };

  const renderTree = (nodes, parentId = null) => {
    let sortedNodes = nodes.slice();
    if (orderEditMode) {
      sortedNodes.sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));
    } else {
      sortedNodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }

    return sortedNodes.map((node, idx, arr) => {
      const isSelected = selectable ? checkedIds.includes(node.id) : selected === node.id;
      const isHighlighted = node.id === highlightedItemId;
      const isChecked = isNodeChecked(node.id);
      const siblings = arr;
      const nodeOrder = orderEditMode ? orderMap[node.id] : node.displayOrder ?? 0;

      let testCaseCount = 0;
      if (isFolder(node)) {
        testCaseCount = countTestCasesRecursive(node);
      }

      const addChildInput =
        newItemData &&
        newItemData.parentId === node.id && (
          <Box sx={{ mb: 1, display: "flex", alignItems: "center", ml: 3 }}>
            {newItemData.type === "folder" ? (
              <FolderIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <DescriptionIcon sx={{ mr: 1 }} />
            )}
            <TextField
              size="small"
              placeholder={newItemData.type}
              value={newItemData.name}
              onChange={(e) =>
                setNewItemData({ ...newItemData, name: e.target.value })
              }
              onKeyPress={(e) => {
                if (e.key === "Enter") handleConfirmAdd();
              }}
              autoFocus
              fullWidth
            />
            <IconButton size="small" onClick={handleConfirmAdd}>
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancelAdd}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        );

      const labelContent =
        renameData && renameData.id === node.id ? (
          <Box sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
            <TextField
              size="small"
              value={renameData.name}
              onChange={(e) => setRenameData({ ...renameData, name: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleConfirmRename();
              }}
              autoFocus
              fullWidth
              onClick={(e) => e.stopPropagation()}
            />
            <IconButton size="small" onClick={handleConfirmRename}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancelRename}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 0.5,
              backgroundColor: isSelected
                ? "rgba(0, 0, 0, 0.08)"
                : isHighlighted
                ? "rgba(144, 238, 144, 0.5)"
                : "transparent",
              fontWeight: isSelected ? "bold" : "normal",
            }}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
          >
            <Checkbox
              checked={isChecked}
              onChange={(e) => handleCheck(e, node.id)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ mr: 1 }}
            />
            {isFolder(node) ? (
              <FolderIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <DescriptionIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: isSelected ? "bold" : "normal" }}>
              {node.name}
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
              #{nodeOrder}
            </Typography>
            {orderEditMode && (
              <Box sx={{ display: "flex", ml: 1 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveNodeOrder(node.id, "up");
                  }}
                >
                  <ArrowUpwardIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={idx === siblings.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveNodeOrder(node.id, "down");
                  }}
                >
                  <ArrowDownwardIcon fontSize="inherit" />
                </IconButton>
              </Box>
            )}
            {isFolder(node) && (
              <Typography
                variant="body2"
                sx={{ ml: 1, color: "text.secondary", fontWeight: isSelected ? "bold" : "normal" }}
              >
                {testCaseCount}
              </Typography>
            )}
            <Box sx={{ marginLeft: "auto" }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, node.id);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );

      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={
            <Box>
              {labelContent}
            </Box>
          }
          sx={{
            "& .MuiTreeItem-content.Mui-selected": {
              backgroundColor: "rgba(0, 123, 255, 0.15)",
            },
            "& .MuiTreeItem-content.Mui-selected:hover": {
              backgroundColor: "rgba(0, 123, 255, 0.25)",
            },
            "& .MuiTreeItem-label.Mui-selected": {
              fontWeight: "bold",
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

  let content;
  if (!projectId) {
    content = (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          프로젝트를 선택하세요.
        </Typography>
      </Box>
    );
  } else if (testCases === undefined) {
    content = (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          로딩 중...
        </Typography>
      </Box>
    );
  } else if (!filteredTestCases || filteredTestCases.length === 0) {
    content = (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          테스트케이스가 없습니다.
        </Typography>
      </Box>
    );
  } else {
    content = (
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selectable ? undefined : selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{
          height: "100%",
          flexGrow: 1,
          overflowY: "auto",
          "& .MuiTreeItem-content": { padding: "4px 8px" },
        }}
      >
        {treeData.length > 0 ? (
          renderTree(treeData)
        ) : (
          <Typography variant="body2" sx={{ p: 2 }}>
            테스트케이스가 없습니다.
          </Typography>
        )}
      </TreeView>
    );
  }

  const rootAddInput =
    newItemData && newItemData.parentId === null && (
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <Typography variant="caption" color="text.secondary">
          루트
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {newItemData.type === "folder" ? (
            <FolderIcon color="primary" sx={{ mr: 1 }} />
          ) : (
            <DescriptionIcon sx={{ mr: 1 }} />
          )}
          <TextField
            size="small"
            placeholder={newItemData.type}
            value={newItemData.name}
            onChange={(e) =>
              setNewItemData({ ...newItemData, name: e.target.value })
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") handleConfirmAdd();
            }}
            autoFocus
            fullWidth
          />
          <IconButton
            size="small"
            onClick={handleConfirmAdd}
            data-testid="confirm-add-button"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelAdd}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <Toolbar sx={{ mb: 1, pl: 0, pr: 0, minHeight: 48 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          테스트케이스
        </Typography>
        {/* 삭제 버튼들 추가 */}
        <IconButton
          color="error"
          onClick={() => setBatchDeleteDialogOpen(true)}
          disabled={checkedIds.length === 0}
          title="선택 삭제"
        >
          <DeleteForeverIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={handleRefresh}
          title="리프레시"
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          color={orderEditMode ? "success" : "primary"}
          onClick={orderEditMode ? handleOrderSave : handleOrderEditMode}
          title={orderEditMode ? "순서 저장" : "순서 편집"}
          disabled={orderEditMode && !orderChanged}
        >
          {orderEditMode ? <SaveIcon /> : <EditIcon />}
        </IconButton>
        {orderEditMode && (
          <IconButton color="error" onClick={handleOrderCancel} title="취소">
            <CloseIcon />
          </IconButton>
        )}
        <IconButton
          onClick={(e) =>
            setContextMenu({
              mouseX: e.clientX,
              mouseY: e.clientY,
              nodeId: null,
            })
          }
          data-testid="add-top-button"
        >
          <AddIcon />
        </IconButton>
      </Toolbar>
      <Box sx={{ px: 2, pb: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllChecked}
              indeterminate={isIndeterminate}
              onChange={handleCheckAll}
              size="small"
            />
          }
          label={
            <Box component="span" sx={{ fontSize: 14 }}>
              전체 선택
            </Box>
          }
        />
      </Box>
      {rootAddInput}
      {content}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.nodeId == null ? (
          <>
            <MenuItem onClick={() => handleAddItem("folder")}>
              <FolderIcon fontSize="small" sx={{ mr: 1 }} />
              폴더 추가
            </MenuItem>
            <MenuItem onClick={() => handleAddItem("testcase")}>
              <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
              테스트케이스 추가
            </MenuItem>
          </>
        ) : (
          <>
            {isFolder(filteredTestCases.find((tc) => tc.id === contextMenu.nodeId)) && (
              <>
                <MenuItem onClick={() => handleAddItem("folder")}>
                  <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                  하위 폴더 추가
                </MenuItem>
                <MenuItem onClick={() => handleAddItem("testcase")}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  하위 테스트케이스 추가
                </MenuItem>
              </>
            )}
            <MenuItem divider />
            <MenuItem onClick={handleRename}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              이름 변경
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              삭제
            </MenuItem>
          </>
        )}
      </Menu>
      {/* 선택 삭제 다이얼로그 */}
      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)}>
        <DialogTitle>선택 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {checkedIds.length}개 항목(하위 포함)을 삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleConfirmBatchDelete} color="error" autoFocus variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            정말로 삭제하시겠습니까? (하위 항목 포함)
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>취소</Button>
          <Button onClick={handleConfirmDelete} autoFocus color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // 체크된 모든 항목(하위포함) 일괄 삭제
  async function handleConfirmBatchDelete() {
    // 중복 제거를 위해 Set 사용
    const idsToDelete = new Set();
    for (const id of checkedIds) {
      idsToDelete.add(id);
      getAllChildIds(filteredTestCases, id).forEach((cid) => idsToDelete.add(cid));
    }
    for (const id of idsToDelete) {
      await deleteTestCase(id);
    }
    setCheckedIds([]);
    setBatchDeleteDialogOpen(false);
    await fetchProjectTestCases(projectId);
  }
};

export default TestCaseTree;
