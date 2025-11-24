// src/components/TestCaseTree.jsx

import React, { useState, useRef, useMemo, useEffect } from "react";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import {
  Box, IconButton, Menu, MenuItem, Typography, TextField, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, Checkbox, Toolbar, FormControlLabel, useTheme, alpha
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "../context/AppContext.jsx";
import { listToTree, isFolder, getAncestorIds } from "../utils/treeUtils.jsx";
import TestCaseVersionHistory from "./TestCase/TestCaseVersionHistory.jsx";
import { useI18n } from "../context/I18nContext.jsx";

// 권한별 함수
const isViewer = (role) => role === "VIEWER";
const canDelete = (role) => role === "ADMIN" || role === "MANAGER";
const canAdd = (role) => role === "ADMIN" || role === "MANAGER";

function getAllChildIds(items, parentId) {
  // 안전장치: 유효성 검사
  if (!Array.isArray(items)) {
    console.error('[TestCaseTree] getAllChildIds: items가 배열이 아닙니다:', typeof items);
    return [];
  }

  if (!parentId) {
    console.warn('[TestCaseTree] getAllChildIds: parentId가 제공되지 않았습니다');
    return [];
  }

  const result = [];
  const stack = [parentId];
  const visited = new Set(); // 순환 참조 방지
  const MAX_ITERATIONS = 1000; // 무한 루프 방지
  let iterations = 0;

  while (stack.length > 0) {
    iterations++;

    // 무한 루프 방지
    if (iterations > MAX_ITERATIONS) {
      console.error('[TestCaseTree] getAllChildIds: 최대 반복 횟수 초과 (순환 참조 가능성)');
      break;
    }

    const current = stack.pop();

    // 이미 방문한 노드는 스킵 (순환 참조 방지)
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const children = items.filter((item) => item?.parentId === current);

    for (const child of children) {
      if (child?.id && !visited.has(child.id)) {
        result.push(child.id);
        stack.push(child.id);
      }
    }
  }

  return result;
}

function sortByDisplayOrder(items) {
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

const TestCaseTree = ({
  projectId,
  onSelectTestCase,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  selectedTestCaseId = null,
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

  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [orderEditMode, setOrderEditMode] = useState(false);
  const [orderMap, setOrderMap] = useState({});
  const [orderChanged, setOrderChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionTestCaseId, setSelectedVersionTestCaseId] = useState(null);

  const highlightTimeout = useRef(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectTestCases(projectId);
    }
    // eslint-disable-next-line
  }, [projectId]);

  const filteredTestCases = useMemo(
    () => (projectId ? testCases.filter((tc) => tc.projectId === projectId) : testCases),
    [projectId, testCases]
  );

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

  const treeData = useMemo(() => listToTree(filteredTestCases, null), [filteredTestCases]);

  // 전체 테스트케이스 수 계산 (폴더 제외)
  const totalTestCaseCount = useMemo(() => {
    return filteredTestCases.filter(tc => tc.type === 'testcase').length;
  }, [filteredTestCases]);

  // 전체 폴더 수 계산
  const totalFolderCount = useMemo(() => {
    return filteredTestCases.filter(tc => tc.type === 'folder').length;
  }, [filteredTestCases]);

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
    if (isViewer(user?.role) || selectable) return; // Viewer 또는 selectable 모드에서는 컨텍스트 메뉴 차단
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
    // USER, VIEWER는 추가 불가
    if (!canAdd(user?.role)) return;
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
    const id =
      newItemData.type === "folder" ? `folder-${uuidv4()}` : `test-${uuidv4()}`;
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
    if (isViewer(user?.role)) return;
    const node = filteredTestCases.find((tc) => tc.id === contextMenu.nodeId);
    setRenameData({ id: node.id, name: node.name });
    handleCloseContextMenu();
  };

  const handleCancelRename = () => setRenameData(null);

  const handleConfirmRename = async () => {
    if (!renameData.name || !renameData.name.trim()) {
      alert(t('testcase.tree.validation.nameRequired', '이름을 입력하세요.'));
      return;
    }
    const testCase = filteredTestCases.find(tc => tc.id === renameData.id);
    if (!testCase) return;
    const payload = testCase.type === 'folder'
      ? { id: testCase.id, name: renameData.name.trim(), projectId: testCase.projectId, parentId: testCase.parentId, displayOrder: testCase.displayOrder, type: 'folder' }
      : { ...testCase, name: renameData.name.trim() };
    try {
      await updateTestCase(payload);
      await fetchProjectTestCases(projectId);
      setRenameData(null);
    } catch (err) {
      alert(t('testcase.tree.error.renameFailed', '이름 변경에 실패했습니다: ') + err.message);
    }
  };

  const handleDeleteClick = () => {
    if (isViewer(user?.role) || user?.role === "USER") return; // USER도 삭제 금지
    setItemToDeleteId(contextMenu.nodeId);
    setDeleteConfirmationOpen(true);
    handleCloseContextMenu();
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setItemToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      // 백엔드의 Cascade 설정으로 자식들이 자동 삭제되므로 부모만 삭제
      await deleteTestCase(itemToDeleteId);
      await fetchProjectTestCases(projectId);
      setDeleteConfirmationOpen(false);
      setItemToDeleteId(null);
    } catch (err) {
      let msg = err?.message || t('testcase.tree.error.deleteFailed', '삭제 중 오류가 발생했습니다.');
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
      setDeleteConfirmationOpen(false);
      setItemToDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCheck = (event, nodeId) => {
    const isChecked = event.target.checked;
    let newCheckedIds = [...checkedIds];
    const childIds = getAllChildIds(filteredTestCases, nodeId);
    if (isChecked) {
      newCheckedIds = Array.from(new Set([...newCheckedIds, nodeId, ...childIds]));
    } else {
      newCheckedIds = newCheckedIds.filter(
        (id) => id !== nodeId && !childIds.includes(id)
      );
    }
    setCheckedIds(newCheckedIds);
    if (selectable && onSelectionChange) onSelectionChange(newCheckedIds);
  };

  const isNodeChecked = (nodeId) => checkedIds.includes(nodeId);

  useEffect(() => {
    if (selectable && Array.isArray(selectedIds)) {
      setCheckedIds(selectedIds);
    }
  }, [selectedIds, selectable]);

  // selectedTestCaseId가 변경될 때 해당 노드 선택 및 확장
  useEffect(() => {
    if (selectedTestCaseId && filteredTestCases.length > 0) {
      // 선택된 테스트 케이스 설정
      setSelected(selectedTestCaseId);

      // 해당 노드까지의 경로를 모두 확장
      const selectedTestCase = filteredTestCases.find(tc => tc.id === selectedTestCaseId);
      if (selectedTestCase) {
        const ancestorIds = getAncestorIds(filteredTestCases, selectedTestCaseId);
        setExpanded(prev => {
          const expandedSet = new Set(prev);
          ancestorIds.forEach(id => expandedSet.add(id));
          return Array.from(expandedSet);
        });
      }
    }
  }, [selectedTestCaseId, filteredTestCases]);

  const moveNodeOrder = (nodeId, direction) => {
    if (isViewer(user?.role)) return;
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

  const handleOrderEditMode = () => {
    if (isViewer(user?.role)) return;
    setOrderEditMode(true);
  };

  const handleOrderCancel = () => {
    setOrderEditMode(false);
    setOrderChanged(false);
  };

  const handleOrderSave = async () => {
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

  // 버전 히스토리 열기
  const handleOpenVersionHistory = () => {
    const nodeId = contextMenu?.nodeId;
    if (!nodeId) return;

    const testCase = filteredTestCases.find(tc => tc.id === nodeId);
    if (testCase && testCase.type === 'testcase') {
      setSelectedVersionTestCaseId(nodeId);
      setVersionHistoryOpen(true);
    }
    handleCloseContextMenu();
  };

  // 버전 복원 완료 후 처리
  const handleVersionRestore = async (restoredVersion) => {
    await fetchProjectTestCases(projectId);
    // 복원된 테스트케이스 자동 선택
    if (restoredVersion && onSelectTestCase) {
      const testCase = filteredTestCases.find(tc => tc.id === restoredVersion.testCaseId);
      if (testCase) {
        onSelectTestCase(testCase);
      }
    }
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

      // 추가 입력 폼: USER/VIEWER는 노출 금지
      const addChildInput =
        newItemData &&
        newItemData.parentId === node.id &&
        canAdd(user?.role) && (
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

      const showDelete = canDelete(user?.role);

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
                ? alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity + 0.05)
                : isHighlighted
                  ? alpha(theme.palette.success.main, 0.3)
                  : "transparent",
              fontWeight: isSelected ? "bold" : "normal",
              color: isSelected ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity + 0.1)
                  : theme.palette.action.hover,
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
          >
            {/* 체크박스: Viewer는 숨김 */}
            {!isViewer(user?.role) && (
              <Checkbox
                checked={isChecked}
                onChange={(e) => handleCheck(e, node.id)}
                onClick={(e) => e.stopPropagation()}
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {isFolder(node) ? (
              <FolderIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <DescriptionIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: isSelected ? "bold" : "normal" }}>
              {node.name}
            </Typography>
            {/* ICT-388: RAG 벡터화 상태 표시 (testcase만) */}
            {node.type === 'testcase' && node.ragVectorized && (
              <CheckCircleIcon
                sx={{
                  ml: 0.5,
                  fontSize: 16,
                  color: 'success.main',
                  verticalAlign: 'middle'
                }}
                titleAccess={t('testcase.tree.ragVectorized', 'RAG 벡터화됨')}
              />
            )}
            <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
              #{nodeOrder}
            </Typography>
            {orderEditMode && !isViewer(user?.role) && (
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
            {!selectable && !isViewer(user?.role) && (
              <Box sx={{ marginLeft: "auto", display: "flex" }}>
                {/* 테스트케이스에만 버전 히스토리 버튼 표시 */}
                {node.type === 'testcase' && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVersionTestCaseId(node.id);
                      setVersionHistoryOpen(true);
                    }}
                    title={t('testcase.tree.action.versionHistory', '버전 히스토리')}
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                )}
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
            )}
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
  } else if (!filteredTestCases || filteredTestCases.length === 0) {
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
            {t('testcase.tree.message.noTestcases', '테스트케이스가 없습니다.')}
          </Typography>
        )}
      </TreeView>
    );
  }

  // 전체선택 체크박스: Viewer는 숨김
  const rootCheckAll =
    !isViewer(user?.role) && (
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
              {t('testcase.tree.selectAll', '전체 선택')}
            </Box>
          }
        />
      </Box>
    );

  // 루트 추가 입력: USER, VIEWER는 노출 금지
  const rootAddInput =
    newItemData && newItemData.parentId === null && canAdd(user?.role) && (
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <Typography variant="caption" color="text.secondary">
          {t('testcase.tree.root', '루트')}
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
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">
            {selectable ? t('testcase.tree.title.select', '테스트케이스 선택') : t('testcase.tree.title.manage', '테스트케이스')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('testcase.tree.count.testcases', '테스트케이스: {count}개', { count: totalTestCaseCount })}
            {' | '}
            {t('testcase.tree.count.folders', '폴더: {count}개', { count: totalFolderCount })}
            {' | '}
            {t('testcase.tree.count.total', '전체: {count}개', { count: totalTestCaseCount + totalFolderCount })}
          </Typography>
        </Box>
        {/* selectable 모드가 아닐 때만 관리 버튼들 표시 */}
        {!selectable && (
          <>
            {/* USER, VIEWER는 추가 버튼 숨김 */}
            {canAdd(user?.role) && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) =>
                  setContextMenu({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    nodeId: null,
                  })
                }
                data-testid="add-top-button"
                sx={{ mr: 1 }}
              >
                {t('testcase.tree.button.add', '추가')}
              </Button>
            )}
            {/* 삭제, 리프레시, 순서저장 등 기존 버튼 분기 동일 */}
            {!isViewer(user?.role) && (
              <>
                <IconButton
                  color="error"
                  onClick={() => setBatchDeleteDialogOpen(true)}
                  disabled={checkedIds.length === 0}
                  title={t('testcase.tree.button.batchDelete', '선택 삭제')}
                  style={user?.role === "USER" ? { display: "none" } : undefined}
                >
                  <DeleteForeverIcon />
                </IconButton>
                <IconButton color="primary" onClick={handleRefresh} title={t('testcase.tree.button.refresh', '리프레시')}>
                  <RefreshIcon />
                </IconButton>
                <IconButton
                  color={orderEditMode ? "success" : "primary"}
                  onClick={orderEditMode ? handleOrderSave : handleOrderEditMode}
                  title={orderEditMode ? t('testcase.tree.button.saveOrder', '순서 저장') : t('testcase.tree.button.editOrder', '순서 편집')}
                  disabled={orderEditMode && !orderChanged}
                >
                  {orderEditMode ? <SaveIcon /> : <EditIcon />}
                </IconButton>
                {orderEditMode && (
                  <IconButton color="error" onClick={handleOrderCancel} title={t('testcase.tree.button.cancel', '취소')}>
                    <CloseIcon />
                  </IconButton>
                )}
              </>
            )}
          </>
        )}
      </Toolbar>
      {rootCheckAll}
      {rootAddInput}
      {content}
      {/* 컨텍스트 메뉴는 selectable 모드가 아닐 때만 표시 */}
      {!selectable && !isViewer(user?.role) && (
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
            canAdd(user?.role) && (
              <>
                <MenuItem onClick={() => handleAddItem("folder")}>
                  <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('testcase.tree.action.addFolder', '폴더 추가')}
                </MenuItem>
                <MenuItem onClick={() => handleAddItem("testcase")}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('testcase.tree.action.addTestcase', '테스트케이스 추가')}
                </MenuItem>
              </>
            )
          ) : (
            <>
              {isFolder(filteredTestCases.find((tc) => tc.id === contextMenu.nodeId)) &&
                canAdd(user?.role) && (
                  <>
                    <MenuItem onClick={() => handleAddItem("folder")}>
                      <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                      {t('testcase.tree.action.addSubFolder', '하위 폴더 추가')}
                    </MenuItem>
                    <MenuItem onClick={() => handleAddItem("testcase")}>
                      <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                      {t('testcase.tree.action.addSubTestcase', '하위 테스트케이스 추가')}
                    </MenuItem>
                  </>
                )}
              <MenuItem divider />
              <MenuItem onClick={handleRename}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {t('testcase.tree.action.rename', '이름 변경')}
              </MenuItem>
              {/* 테스트케이스에만 버전 히스토리 메뉴 표시 */}
              {filteredTestCases.find(tc => tc.id === contextMenu.nodeId)?.type === 'testcase' && (
                <MenuItem onClick={handleOpenVersionHistory}>
                  <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('testcase.tree.action.versionHistory', '버전 히스토리')}
                </MenuItem>
              )}
              {canDelete(user?.role) && (
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('testcase.tree.action.delete', '삭제')}
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      )}
      {/* 선택 삭제 다이얼로그 */}
      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)}>
        <DialogTitle>{t('testcase.tree.dialog.batchDelete.title', '선택 삭제')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('testcase.tree.dialog.batchDelete.message', '{count}개 항목(하위 포함)을 삭제하시겠습니까?', { count: checkedIds.length })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDeleteDialogOpen(false)}>{t('testcase.tree.button.cancel', '취소')}</Button>
          <Button onClick={handleConfirmBatchDelete} color="error" autoFocus variant="contained">
            {t('testcase.tree.button.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteConfirmationOpen}
        onClose={deleting ? null : handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t('testcase.tree.dialog.deleteConfirm.title', '삭제 확인')}</DialogTitle>
        <DialogContent>
          {deleting ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <DialogContentText>
                {t('testcase.tree.dialog.deleting', '삭제 중입니다...')}
              </DialogContentText>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {t('testcase.tree.dialog.deletingMessage', '하위 항목과 첨부파일을 포함하여 삭제하고 있습니다. 잠시만 기다려주세요.')}
              </Typography>
            </Box>
          ) : (
            <DialogContentText id="alert-dialog-description">
              {t('testcase.tree.dialog.deleteConfirm.message', '정말로 삭제하시겠습니까? (하위 항목 포함)')}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            {t('testcase.tree.button.cancel', '취소')}
          </Button>
          <Button onClick={handleConfirmDelete} autoFocus color="error" disabled={deleting}>
            {t('testcase.tree.button.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!errorMessage} onClose={() => setErrorMessage("")}>
        <DialogTitle>{t('testcase.tree.dialog.error.title', '오류')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorMessage("")} autoFocus>
            {t('testcase.tree.button.close', '닫기')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 버전 히스토리 다이얼로그 */}
      <TestCaseVersionHistory
        testCaseId={selectedVersionTestCaseId}
        open={versionHistoryOpen}
        onClose={() => {
          setVersionHistoryOpen(false);
          setSelectedVersionTestCaseId(null);
        }}
        onRestore={handleVersionRestore}
      />
    </Box>
  );

  // 체크된 모든 항목(하위포함) 일괄 삭제
  async function handleConfirmBatchDelete() {
    try {
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
    } catch (err) {
      let msg = err?.message || t('testcase.tree.error.deleteFailed', '삭제 중 오류가 발생했습니다.');
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
      setBatchDeleteDialogOpen(false);
    }
  }
};

export default TestCaseTree;
