// src/components/TestCaseTree.js

import React, { useState, useRef, useEffect } from "react";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "../context/AppContext";
import { listToTree, isFolder, getAncestorIds } from "../utils/treeUtils";

function sortByDisplayOrder(items) {
  // displayOrder가 없는 경우 0으로 처리
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

const TestCaseTree = ({
  projectId,
  onSelectTestCase,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}) => {
  const {
    testCases,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    setActiveTestCase,
  } = useAppContext();

  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const highlightTimeout = useRef(null);

  // 프로젝트별 필터링
  const filteredTestCases = projectId
    ? testCases.filter((tc) => tc.projectId === projectId)
    : [];

  // displayOrder 순서로 정렬하여 트리 구조로 변환
  const treeData = listToTree(sortByDisplayOrder(filteredTestCases), null);

  const countTestCasesRecursive = (node) => {
    if (!node.children || node.children.length === 0) return 0;
    let count = 0;
    node.children.forEach((child) => {
      if (child.type === "testcase") count += 1;
      else if (child.type === "folder") count += countTestCasesRecursive(child);
    });
    return count;
  };

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

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
    if (onSelectTestCase) {
      onSelectTestCase(selectedTestCase);
    }
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

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

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

  const handleCancelAdd = () => {
    setNewItemData(null);
  };

  const handleConfirmAdd = async () => {
    if (!newItemData || !newItemData.name || !newItemData.name.trim()) return;
    const id = newItemData.type === "folder" ? `folder-${uuidv4()}` : `test-${uuidv4()}`;
    const parentId = newItemData.parentId === undefined ? null : newItemData.parentId;
    const newItem = {
      id,
      name: newItemData.name.trim(),
      parentId,
      type: newItemData.type,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addTestCase(newItem);
    setNewItemData(null);
    setHighlightedItemId(id);
    if (highlightTimeout.current) {
      clearTimeout(highlightTimeout.current);
    }
    highlightTimeout.current = setTimeout(() => {
      setHighlightedItemId(null);
    }, 1500);
  };

  const handleRename = () => {
    const node = filteredTestCases.find((tc) => tc.id === contextMenu.nodeId);
    setRenameData({ id: node.id, name: node.name });
    handleCloseContextMenu();
  };

  const handleCancelRename = () => {
    setRenameData(null);
  };

  const handleConfirmRename = () => {
    if (!renameData || !renameData.name || !renameData.name.trim()) return;
    const testCase = filteredTestCases.find((tc) => tc.id === renameData.id);
    updateTestCase({ ...testCase, name: renameData.name.trim() });
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

  const handleConfirmDelete = () => {
    deleteTestCase(itemToDeleteId);
    setDeleteConfirmationOpen(false);
    setItemToDeleteId(null);
  };

  const getParentNodeName = (parentId) => {
    if (!parentId) return "최상위";
    const parentNode = filteredTestCases.find((tc) => tc.id === parentId);
    return parentNode ? parentNode.name : "알 수 없는 폴더";
  };

  // displayOrder 순서로 children 정렬
  const renderTree = (nodes) => {
    // displayOrder 기준 정렬
    const sortedNodes = sortByDisplayOrder(nodes);
    return sortedNodes.map((node) => {
      const isSelected = selectable ? selectedIds.includes(node.id) : selected === node.id;
      const isHighlighted = node.id === highlightedItemId;
      let testCaseCount = 0;
      if (isFolder(node)) {
        testCaseCount = countTestCasesRecursive(node);
      }
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
              <DeleteIcon fontSize="small" />
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
                ? "rgba(144, 238, 144, 0.5)" // 연한 녹색 강조
                : "transparent",
              fontWeight: isSelected ? "bold" : "normal",
            }}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
          >
            {isFolder(node) ? (
              <FolderIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <DescriptionIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: isSelected ? "bold" : "normal" }}>
              {node.name}
            </Typography>
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
          label={labelContent}
          sx={{
            [`& .MuiTreeItem-content.Mui-selected`]: {
              backgroundColor: "rgba(0, 123, 255, 0.15)", // 선택 시 배경색 변경 (primary 색상 계열)
            },
            [`& .MuiTreeItem-content.Mui-selected:hover`]: {
              backgroundColor: "rgba(0, 123, 255, 0.25)", // 호버 시 약간 더 진한 배경색
            },
            [`& .MuiTreeItem-label.Mui-selected`]: {
              fontWeight: "bold", // 선택 시 텍스트 굵게
            },
          }}
        >
          {newItemData && newItemData.parentId === node.id && (
            <Box sx={{ ml: 2, mt: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Typography variant="caption" color="text.secondary">
                추가 위치: {getParentNodeName(newItemData.parentId)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                {newItemData.type === "folder" ? (
                  <FolderIcon color="primary" sx={{ mr: 1 }} />
                ) : (
                  <DescriptionIcon sx={{ mr: 1 }} />
                )}
                <TextField
                  size="small"
                  placeholder={newItemData.type}
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleConfirmAdd();
                  }}
                  autoFocus
                  fullWidth
                />
                <IconButton size="small" onClick={handleConfirmAdd} data-testid="confirm-add-button">
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleCancelAdd}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
          {Array.isArray(node.children) && node.children.length > 0
            ? renderTree(node.children)
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
          프로젝트를 먼저 선택하세요.
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
          ".MuiTreeItem-content": { padding: "4px 8px" },
        }}
      >
        {treeData.length > 0 ? renderTree(treeData) : (
          <Typography variant="body2" sx={{ p: 2 }}>
            테스트케이스가 없습니다.
          </Typography>
        )}
      </TreeView>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">테스트케이스 트리</Typography>
        <IconButton
          onClick={(e) => setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, nodeId: null })}
          data-testid="add-top-button"
        >
          <AddIcon />
        </IconButton>
      </Box>
      {newItemData && newItemData.parentId === null && (
        <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Typography variant="caption" color="text.secondary">
            추가 위치: {getParentNodeName(newItemData.parentId)}
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
              onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleConfirmAdd();
              }}
              autoFocus
              fullWidth
            />
            <IconButton size="small" onClick={handleConfirmAdd} data-testid="confirm-add-button">
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancelAdd}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
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
                  폴더 추가
                </MenuItem>
                <MenuItem onClick={() => handleAddItem("testcase")}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  테스트케이스 추가
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

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"삭제 확인"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            선택한 항목을 삭제하시겠습니까? 삭제된 항목은 복구할 수 없습니다.
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
};

export default TestCaseTree;