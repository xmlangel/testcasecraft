import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  startTransition,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
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
  Checkbox,
  Toolbar,
  FormControlLabel,
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
  SwapVert as SwapVertIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../context/AuthContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
import { useTest } from "../context/TestContext.jsx";
import { useInputMode } from "../context/InputModeContext.jsx";
import {
  listToTree,
  isFolder,
  getAncestorIds,
  getAllChildIds,
  getAllDescendants,
  buildChildrenMap,
  flattenTree,
} from "../utils/treeUtils.jsx";
import TestCaseVersionHistory from "./TestCase/TestCaseVersionHistory.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { DeleteConfirmationDialog } from "./TestCase/Spreadsheet/components/DeleteConfirmationDialog.jsx";

// 권한별 함수
const isViewer = (role) => role === "VIEWER";
const canDelete = (role) => role === "ADMIN" || role === "MANAGER";
const canAdd = (role) => role === "ADMIN" || role === "MANAGER";

// treeUtils.jsx에서 가져온 함수들을 사용하므로 로컬 구현부 삭제 가능

// 트리 아이템의 자식 테스트케이스 수를 재귀적으로 계산 (폴더인 경우에만 사용)
// 트리 아이템의 자식 테스트케이스 수를 효율적으로 계산 (Map 기반 리트리 유틸리티 사용 가능 시)
const countTestCasesRecursive = (nodes) => {
  let count = 0;
  nodes.forEach((node) => {
    if (node.type === "testcase") {
      count += 1;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      count += countTestCasesRecursive(node.children);
    }
  });
  return count;
};

// 개별 트리 아이템 컴포넌트 (성능을 위해 메모이제이션)
const MemoizedTreeItem = React.memo(
  ({
    node,
    idx,
    siblings,
    isSelected,
    isChecked,
    selectable,
    userRole, // role만 전달하여 객체 참조 변경 방지
    orderEditMode,
    nodeOrder,
    testCaseCount,
    onCheck,
    onContextMenu,
    onAddItem,
    onRename,
    onDelete,
    onMoveOrder,
    onOpenVersionHistory,
    newItemData,
    setNewItemData,
    handleConfirmAdd,
    handleCancelAdd,
    t,
    depth,
    isExpanded,
    onToggle,
    onSelect,
  }) => {
    // ... (labelContent and addChildInput remain the same, but using userRole)
    const isViewerRole = userRole === "VIEWER";

    // placeholder 타입인 경우 (신규 항목 추가 중)
    if (node.type === "placeholder") {
      return (
        <Box
          sx={{
            pl: `${(depth || 0) * 16}px`,
            display: "flex",
            alignItems: "center",
            py: 0.5,
            width: "100%",
            bgcolor: "rgba(0, 123, 255, 0.05)",
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          {newItemData?.type === "folder" ? (
            <FolderIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
          ) : (
            <DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />
          )}
          <TextField
            size="small"
            placeholder={
              newItemData?.type === "folder"
                ? t("common.folder", "폴더")
                : t("common.testcase", "테스트케이스")
            }
            value={newItemData?.name || ""}
            onChange={(e) =>
              setNewItemData({ ...newItemData, name: e.target.value })
            }
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleConfirmAdd();
            }}
            autoFocus
            sx={{
              flexGrow: 1,
              mr: 1,
              "& .MuiInputBase-root": { height: 32, fontSize: "0.875rem" },
            }}
          />
          <IconButton
            size="small"
            onClick={handleConfirmAdd}
            color="primary"
            data-add-confirm="true"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCancelAdd}
            color="error"
            data-add-cancel="true"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    const labelContent = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
        onContextMenu={(e) => onContextMenu(e, node.id)}
      >
        {/* 체크박스 영역: 고정 너비 40px */}
        <Box
          sx={{
            width: 40,
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {!isViewerRole && (
            <Checkbox
              size="small"
              checked={isChecked}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onCheck(e, node.id)}
              sx={{ p: 0.5 }}
            />
          )}
        </Box>

        {/* 아이콘 영역: 고정 너비 32px */}
        <Box
          sx={{
            width: 32,
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
            mr: 1,
          }}
        >
          {isFolder(node) ? (
            <FolderIcon color="primary" fontSize="small" />
          ) : (
            <DescriptionIcon
              fontSize="small"
              sx={{
                color: node.ragVectorized ? "primary.main" : "action.active",
              }}
            />
          )}
        </Box>

        {/* 이름 영역: 가변 너비 */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? "bold" : "normal",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexGrow: 1,
            textAlign: "left",
            lineHeight: 1.5,
          }}
        >
          {node.displayId && (
            <Box
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                mr: 0.5,
                opacity: 0.9,
              }}
            >
              [{node.displayId}]
            </Box>
          )}
          {node.name}
        </Typography>

        {/* 메타 정보 및 버튼 영역: 우측 정렬 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ml: "auto",
            flexShrink: 0,
          }}
        >
          {/* 번호 영역: 고정 너비 50px */}
          <Typography
            variant="caption"
            sx={{
              width: 50,
              textAlign: "right",
              color: "primary.dark",
              opacity: 0.8,
              fontWeight: "bold",
              mr: 1,
            }}
          >
            #{nodeOrder}
          </Typography>

          {orderEditMode && !isViewerRole && (
            <Box sx={{ display: "flex", mr: 0.5 }}>
              <IconButton
                size="small"
                disabled={idx === 0 || !siblings}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveOrder(node.id, "up");
                }}
                sx={{ p: 0.25 }}
              >
                <ArrowUpwardIcon fontSize="inherit" />
              </IconButton>
              <IconButton
                size="small"
                disabled={idx === (siblings?.length || 0) - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveOrder(node.id, "down");
                }}
                sx={{ p: 0.25 }}
              >
                <ArrowDownwardIcon fontSize="inherit" />
              </IconButton>
            </Box>
          )}

          {isFolder(node) && (
            <Typography
              variant="body2"
              sx={{
                width: 30,
                textAlign: "center",
                color: "success.main",
                fontWeight: "bold",
                mx: 0.5,
              }}
            >
              {testCaseCount}
            </Typography>
          )}

          {!selectable && !isViewerRole && (
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 60 }}>
              {node.type === "testcase" && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVersionHistory(node.id);
                  }}
                  title={t(
                    "testcase.tree.action.versionHistory",
                    "버전 히스토리",
                  )}
                  sx={{ p: 0.25, ml: 0.5 }}
                >
                  <HistoryIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onContextMenu(e, node.id);
                }}
                sx={{ p: 0.25, ml: 0.5 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    );

    return (
      <Box
        sx={{
          pl: `${(depth || 0) * 16}px`, // 계층 깊이 표현 (16px 간격으로 최적화)
          width: "100%",
          "& .MuiTreeItem-content.Mui-selected": {
            backgroundColor: "rgba(0, 123, 255, 0.15)",
          },
          "& .MuiTreeItem-content.Mui-selected:hover": {
            backgroundColor: "rgba(0, 123, 255, 0.25)",
          },
        }}
      >
        <Box
          onClick={(e) => onSelect(e, node.id)}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            py: 0.25, // 패딩을 줄여서 한 번에 더 많은 항목 노출
            minHeight: 32, // 최소 높이 보장
            "&:hover": { bgcolor: "action.hover" },
            bgcolor: isSelected ? "rgba(0, 123, 255, 0.1)" : "transparent",
            borderRadius: 1,
            mr: 1,
          }}
        >
          {/* Chevron 영역: 고정 너비 40px */}
          <Box
            sx={{
              width: 40,
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isFolder(node) && (
              <IconButton size="small" onClick={onToggle} sx={{ p: 0.5 }}>
                {isExpanded ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </IconButton>
            )}
          </Box>
          {labelContent}
        </Box>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isChecked === nextProps.isChecked &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.nodeOrder === nextProps.nodeOrder &&
      prevProps.testCaseCount === nextProps.testCaseCount &&
      prevProps.orderEditMode === nextProps.orderEditMode &&
      prevProps.userRole === nextProps.userRole &&
      prevProps.node === nextProps.node &&
      prevProps.newItemData === nextProps.newItemData &&
      prevProps.depth === nextProps.depth &&
      prevProps.idx === nextProps.idx &&
      prevProps.siblings === nextProps.siblings &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.handleCancelAdd === nextProps.handleCancelAdd &&
      prevProps.handleConfirmAdd === nextProps.handleConfirmAdd
    );
  },
);

function sortByDisplayOrder(items, orderMap = {}) {
  return items.slice().sort((a, b) => {
    const orderA = orderMap[a.id] ?? a.displayOrder ?? 0;
    const orderB = orderMap[b.id] ?? b.displayOrder ?? 0;
    return orderA - orderB;
  });
}

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

  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  const [pendingRename, setPendingRename] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [orderEditMode, setOrderEditMode] = useState(false);
  const [orderMap, setOrderMap] = useState({});
  const [orderChanged, setOrderChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedVersionTestCaseId, setSelectedVersionTestCaseId] =
    useState(null);

  const highlightTimeout = useRef(null);
  const selectTimeout = useRef(null);
  const [isPending, startTransition] = React.useTransition();

  useEffect(() => {
    if (projectId) {
      fetchProjectTestCases(projectId);
    }
    // eslint-disable-next-line
  }, [projectId]);

  const filteredTestCases = useMemo(
    () =>
      projectId
        ? testCases.filter((tc) => tc.projectId === projectId)
        : testCases,
    [projectId, testCases],
  );

  // 외부 선택 상태 동기화
  useEffect(() => {
    if (selectedTestCaseId) {
      setSelected(selectedTestCaseId);
      // 부모 노드 펼치기
      const ancestorIds = getAncestorIds(filteredTestCases, selectedTestCaseId);
      if (ancestorIds.length > 0) {
        setExpanded((prev) => {
          const newSet = new Set([...prev, ...ancestorIds]);
          return Array.from(newSet);
        });
      }
    }
  }, [selectedTestCaseId, filteredTestCases]);

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

  // 순차적으로 정렬된 테스트케이스 (orderMap 반영)
  const sortedTestCases = useMemo(() => {
    return filteredTestCases.slice().sort((a, b) => {
      const orderA = orderMap[a.id] ?? a.displayOrder ?? 0;
      const orderB = orderMap[b.id] ?? b.displayOrder ?? 0;
      return orderA - orderB;
    });
  }, [filteredTestCases, orderMap]);

  // O(N) 최적화: childrenMap을 useMemo로 캐싱하여 리트리 및 자식수 계산 시 재사용
  const childrenMap = useMemo(
    () => buildChildrenMap(sortedTestCases),
    [sortedTestCases],
  );

  const treeData = useMemo(
    () => listToTree(sortedTestCases, null),
    [sortedTestCases],
  );

  // 가상화를 위한 평탄화 데이터
  const flatData = useMemo(() => {
    const flat = flattenTree(treeData, expanded, orderMap);
    if (newItemData) {
      const parentId = newItemData.parentId;
      if (parentId === null) {
        // 루트 추가: 맨 앞에 삽입
        flat.unshift({
          id: "new-item-placeholder",
          type: "placeholder",
          depth: 0,
          parentId: null,
        });
      } else {
        // 하위 추가: 부모 노드 바로 다음(또는 자식들 다음)에 삽입
        const parentIndex = flat.findIndex((n) => n.id === parentId);
        if (parentIndex !== -1) {
          const parentDepth = flat[parentIndex].depth;
          // 부모의 자식들 중 마지막 위치 찾기
          let insertIndex = parentIndex + 1;
          for (let i = parentIndex + 1; i < flat.length; i++) {
            if (flat[i].depth > parentDepth) {
              insertIndex = i + 1;
            } else {
              break;
            }
          }
          flat.splice(insertIndex, 0, {
            id: "new-item-placeholder",
            type: "placeholder",
            depth: parentDepth + 1,
            parentId,
          });
        }
      }
    }
    return flat;
  }, [treeData, expanded, newItemData]);

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // 각 행의 추정 높이
    overscan: 10,
  });

  // 전체 테스트케이스 수 계산 (폴더 제외)
  const totalTestCaseCount = useMemo(() => {
    return filteredTestCases.filter((tc) => tc.type === "testcase").length;
  }, [filteredTestCases]);

  // 전체 폴더 수 계산
  const totalFolderCount = useMemo(() => {
    return filteredTestCases.filter((tc) => tc.type === "folder").length;
  }, [filteredTestCases]);

  // testcase 타입만 선택 (폴더 제외)
  const allIds = filteredTestCases
    .filter((tc) => tc.type === "testcase")
    .map((tc) => tc.id);
  const isAllChecked =
    allIds.length > 0 && allIds.every((id) => checkedIds.includes(id));
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

  const handleToggle = useCallback((event, nodeIds) => {
    startTransition(() => {
      setExpanded(nodeIds);
    });
  }, []);

  const handleToggleNode = useCallback((e, nodeId) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const isExpanded = prev.includes(nodeId);
      const next = isExpanded
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId];
      return next;
    });
  }, []);

  const updateCheckedState = useCallback(
    (nodeId, isChecked) => {
      // O(N) 최적화된 getAllChildIds 사용 (treeUtils.jsx에서 버그 수정 완료)
      const childIds = getAllChildIds(filteredTestCases, nodeId);

      let newCheckedIds;
      if (isChecked) {
        // 자신과 모든 하위 항목(폴더 포함)을 추가하여 시각적 체크 표시 확보
        const idsToAdd = [nodeId, ...childIds];
        newCheckedIds = Array.from(new Set([...checkedIds, ...idsToAdd]));
      } else {
        // 자신과 모든 하위 항목(폴더 포함)을 제거
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
      // 즉각적인 UI 피드백 (하이라이트 등)
      setSelected(nodeId);

      if (selectable) {
        // 이미 체크되어 있는지 확인 (현재 로컬 상태 기준)
        const isCurrentlyChecked = checkedIds.includes(nodeId);
        // 토글 수행 및 로컬 상태 즉시 업데이트
        updateCheckedState(nodeId, !isCurrentlyChecked);
      }

      // 무거운 후속 작업은 Transition으로 분리하여 INP 개선
      startTransition(() => {
        const selectedTestCase = filteredTestCases.find(
          (tc) => tc.id === nodeId,
        );
        if (!selectable) {
          setActiveTestCase(nodeId);
        }

        // 외부 콜백은 디바운싱 처리하여 잦은 대규모 상태 업데이트 방지
        if (onSelectTestCase) {
          if (selectTimeout.current) clearTimeout(selectTimeout.current);
          selectTimeout.current = setTimeout(() => {
            onSelectTestCase(selectedTestCase);
          }, 50);
        }
      });
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
      if (isViewer(user?.role) || selectable) return; // Viewer 또는 selectable 모드에서는 컨텍스트 메뉴 차단
      event.preventDefault();
      event.stopPropagation();
      setSelected(nodeId);
      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
        nodeId,
      });
    },
    [user?.role, selectable],
  );

  const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);

  const handleAddItem = useCallback(
    (type) => {
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
    },
    [
      user?.role,
      contextMenu?.nodeId,
      projectId,
      filteredTestCases,
      handleCloseContextMenu,
    ],
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
    // await fetchProjectTestCases(projectId);
    setNewItemData(null);

    // 신규 추가 후 자동 선택 및 폼 모드 전환 (ICT-UserReq)
    if (addedItem && onSelectTestCase) {
      onSelectTestCase(addedItem);
    }
    if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
      setInputMode("form");
    }

    // highlight use addedItem.id if available, fallback to local id
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

  const handleRename = useCallback(() => {
    if (isViewer(user?.role) || !contextMenu?.nodeId) return;
    const node = filteredTestCases.find((tc) => tc.id === contextMenu.nodeId);
    if (!node) return;

    // 메뉴가 완전히 닫힌 후 다이얼로그를 띄우기 위해 보류 상태로 설정
    setPendingRename({ id: node.id, name: node.name });
    handleCloseContextMenu();
  }, [user?.role, filteredTestCases, contextMenu, handleCloseContextMenu]);

  const handleCancelRename = useCallback(() => setRenameData(null), []);

  const handleConfirmRename = async () => {
    if (!renameData.name || !renameData.name.trim()) {
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
      // await fetchProjectTestCases(projectId);
      setRenameData(null);
    } catch (err) {
      alert(
        t("testcase.tree.error.renameFailed", "이름 변경에 실패했습니다: ") +
          err.message,
      );
    }
  };

  const handleDeleteClick = useCallback(() => {
    if (isViewer(user?.role) || user?.role === "USER") return; // USER도 삭제 금지
    setItemToDeleteId(contextMenu.nodeId);
    setDeleteConfirmationOpen(true);
    handleCloseContextMenu();
  }, [user?.role, contextMenu?.nodeId, handleCloseContextMenu]);

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setItemToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      // 백엔드의 Cascade 설정으로 자식들이 자동 삭제되므로 부모만 삭제
      await deleteTestCase(itemToDeleteId);
      // await fetchProjectTestCases(projectId); // State is already updated by deleteTestCase

      // 삭제 시 스프레드시트 깜빡임 방지를 위해 폼 모드로 전환 (ICT-UserReq)
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
  };

  const handleCheck = useCallback(
    (event, nodeId) => {
      updateCheckedState(nodeId, event.target.checked);
    },
    [updateCheckedState],
  );

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
      const selectedTestCase = filteredTestCases.find(
        (tc) => tc.id === selectedTestCaseId,
      );
      if (selectedTestCase) {
        const ancestorIds = getAncestorIds(
          filteredTestCases,
          selectedTestCaseId,
        );
        setExpanded((prev) => {
          const expandedSet = new Set(prev);
          ancestorIds.forEach((id) => expandedSet.add(id));
          return Array.from(expandedSet);
        });
      }
    }
  }, [selectedTestCaseId, filteredTestCases]);

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
    },
    [user?.role, filteredTestCases, orderMap],
  );

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
          // 폴더 타입의 경우 필수 필드만 전달 (스프레드시트 저장 후 데이터 불일치 방지)
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
              : {
                  ...item,
                  displayOrder: newOrder,
                };

          updates.push(updateTestCase(payload));
        }
      });
    });

    if (updates.length > 0) {
      try {
        await Promise.all(updates);
        // await fetchProjectTestCases(projectId);
      } catch (error) {
        // 에러 발생 시 조용히 실패 (사용자 알림은 updateTestCase 내부에서 처리)
      }
    }

    setOrderEditMode(false);
    setOrderChanged(false);
  };

  const handleRefresh = async () => {
    await fetchProjectTestCases(projectId);
  };

  // 버전 히스토리 열기
  const handleOpenVersionHistory = () => {
    const nodeId = contextMenu?.nodeId;
    if (!nodeId) return;

    const testCase = filteredTestCases.find((tc) => tc.id === nodeId);
    if (testCase && testCase.type === "testcase") {
      setSelectedVersionTestCaseId(nodeId);
      setVersionHistoryOpen(true);
    }
    handleCloseContextMenu();
  };

  // 버전 복원 완료 후 처리
  const handleVersionRestore = async (restoredVersion) => {
    if (updateTestCaseLocal && restoredVersion) {
      updateTestCaseLocal(restoredVersion);
    }
    // 복원된 테스트케이스 자동 선택
    if (restoredVersion && onSelectTestCase) {
      const testCase = filteredTestCases.find(
        (tc) => tc.id === restoredVersion.testCaseId,
      );
      if (testCase) {
        onSelectTestCase(testCase);
      }
    }
  };

  const renderTree = (nodes, parentId = null) => {
    return sortByDisplayOrder(nodes, orderMap).map((node, idx, siblings) => {
      const isSelected = selected === node.id;
      const isChecked = checkedIds.includes(node.id);
      const nodeOrder = orderMap[node.id] ?? node.displayOrder ?? 0;
      const testCaseCount = isFolder(node)
        ? countTestCasesRecursive(node.children || [])
        : 0;

      return (
        <MemoizedTreeItem
          key={node.id}
          node={node}
          idx={idx}
          siblings={siblings}
          isSelected={isSelected}
          isChecked={isChecked}
          selectable={selectable}
          userRole={user?.role} // role 문자열만 전달
          orderEditMode={orderEditMode}
          nodeOrder={nodeOrder}
          testCaseCount={testCaseCount}
          onCheck={handleCheck}
          onContextMenu={handleContextMenu}
          onAddItem={handleAddItem}
          onRename={handleRename}
          onDelete={handleDeleteClick}
          onMoveOrder={moveNodeOrder}
          onOpenVersionHistory={(id) => {
            setSelectedVersionTestCaseId(id);
            setVersionHistoryOpen(true);
          }}
          onSelect={handleSelect}
          onToggle={(e) => handleToggleNode(e, node.id)}
          newItemData={newItemData}
          setNewItemData={setNewItemData}
          handleConfirmAdd={handleConfirmAdd}
          handleCancelAdd={handleCancelAdd}
          t={t}
          renderTreeChildren={
            Array.isArray(node.children) && node.children.length > 0
              ? renderTree(node.children, node.id)
              : null
          }
        />
      );
    });
  };

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
    (!filteredTestCases || filteredTestCases.length === 0) &&
    !newItemData
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
            const isSelected = selected === node.id;
            const isChecked = checkedIds.includes(node.id);
            const isExpanded = expanded.includes(node.id);
            const nodeOrder = orderMap[node.id] ?? node.displayOrder ?? 0;
            const testCaseCount = isFolder(node)
              ? countTestCasesRecursive(node.children || [])
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
                  onToggle={(e) => handleToggleNode(e, node.id)}
                  selectable={selectable}
                  userRole={user?.role}
                  orderEditMode={orderEditMode}
                  nodeOrder={nodeOrder}
                  testCaseCount={testCaseCount}
                  onCheck={handleCheck}
                  onContextMenu={handleContextMenu}
                  onAddItem={handleAddItem}
                  onRename={handleRename}
                  onDelete={handleDeleteClick}
                  onMoveOrder={moveNodeOrder}
                  onOpenVersionHistory={(id) => {
                    setSelectedVersionTestCaseId(id);
                    setVersionHistoryOpen(true);
                  }}
                  newItemData={newItemData}
                  setNewItemData={setNewItemData}
                  handleConfirmAdd={handleConfirmAdd}
                  handleCancelAdd={handleCancelAdd}
                  t={t}
                  onSelect={handleSelect}
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

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 헤더 영역 - Select All + 버튼들 */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* 좌측: Select All */}
          {!isViewer(user?.role) && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
              data-testid="testcase-check-all-container"
            >
              <Checkbox
                checked={isAllChecked}
                indeterminate={isIndeterminate}
                onChange={handleCheckAll}
                size="small"
                inputProps={{ "data-testid": "testcase-check-all-input" }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FolderIcon fontSize="small" color="action" />
                  <Typography variant="body2">{totalFolderCount}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography variant="body2">{totalTestCaseCount}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* 우측: 버튼 그룹 (selectable 모드에서는 숨김) */}
          {!selectable && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {/* 1. 삭제 버튼 (체크박스 선택 시) */}
              {!isViewer(user?.role) && checkedIds.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => setBatchDeleteDialogOpen(true)}
                  style={
                    user?.role === "USER" ? { display: "none" } : undefined
                  }
                >
                  ({checkedIds.length})
                </Button>
              )}

              {/* 2. 새로고침 버튼 */}
              <IconButton
                size="small"
                onClick={handleRefresh}
                title={t("testcase.tree.button.refresh", "리프레시")}
              >
                <RefreshIcon />
              </IconButton>

              {!isViewer(user?.role) && (
                <>
                  {/* 3. 추가 버튼 */}
                  {canAdd(user?.role) && (
                    <IconButton
                      size="small"
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
                  )}

                  {/* 4. 순서 변경 버튼 */}
                  <IconButton
                    size="small"
                    onClick={
                      orderEditMode ? handleOrderSave : handleOrderEditMode
                    }
                    color={orderEditMode ? "primary" : "default"}
                    title={
                      orderEditMode
                        ? t("testcase.tree.button.saveOrder", "순서 저장")
                        : t("testcase.tree.button.editOrder", "순서 편집")
                    }
                    disabled={orderEditMode && !orderChanged}
                  >
                    {orderEditMode ? <SaveIcon /> : <SwapVertIcon />}
                  </IconButton>

                  {/* 순서 편집 모드 취소 버튼 */}
                  {orderEditMode && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={handleOrderCancel}
                      title={t("testcase.tree.button.cancel", "취소")}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* 구분선 */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mx: 2 }} />

      {/* Select All 아래로 이동 (이제 필요없음, 헤더에 통합됨) */}
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
          TransitionProps={{
            onExited: () => {
              if (pendingRename) {
                // 이전 포커스(메뉴 등)를 명시적으로 해제하여 aria-hidden 경고 방지
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                setRenameData(pendingRename);
                setPendingRename(null);
              }
            },
          }}
        >
          {contextMenu?.nodeId == null ? (
            canAdd(user?.role) && (
              <>
                <MenuItem onClick={() => handleAddItem("folder")}>
                  <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                  {t("testcase.tree.action.addFolder", "폴더 추가")}
                </MenuItem>
                <MenuItem onClick={() => handleAddItem("testcase")}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  {t("testcase.tree.action.addTestcase", "테스트케이스 추가")}
                </MenuItem>
              </>
            )
          ) : (
            <>
              {isFolder(
                filteredTestCases.find((tc) => tc.id === contextMenu.nodeId),
              ) &&
                canAdd(user?.role) && (
                  <>
                    <MenuItem onClick={() => handleAddItem("folder")}>
                      <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                      {t("testcase.tree.action.addSubFolder", "하위 폴더 추가")}
                    </MenuItem>
                    <MenuItem onClick={() => handleAddItem("testcase")}>
                      <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                      {t(
                        "testcase.tree.action.addSubTestcase",
                        "하위 테스트케이스 추가",
                      )}
                    </MenuItem>
                  </>
                )}
              <MenuItem divider />
              <MenuItem onClick={handleRename}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {t("testcase.tree.action.rename", "이름 변경")}
              </MenuItem>
              {/* 테스트케이스에만 버전 히스토리 메뉴 표시 */}
              {filteredTestCases.find((tc) => tc.id === contextMenu.nodeId)
                ?.type === "testcase" && (
                <MenuItem onClick={handleOpenVersionHistory}>
                  <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                  {t("testcase.tree.action.versionHistory", "버전 히스토리")}
                </MenuItem>
              )}
              {canDelete(user?.role) && (
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  {t("testcase.tree.action.delete", "삭제")}
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      )}
      {/* 선택 삭제 다이얼로그 */}
      <DeleteConfirmationDialog
        open={batchDeleteDialogOpen}
        onClose={() => setBatchDeleteDialogOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        title={t("testcase.tree.dialog.batchDelete.title", "선택 삭제")}
        description={t(
          "testcase.tree.dialog.batchDelete.message",
          "{count}개 항목(하위 포함)을 삭제하시겠습니까?",
          { count: checkedIds.length },
        )}
        items={(() => {
          // 선택된 항목과 그 하위 항목들을 모두 포함
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
              // 하위 항목 추가
              if (item.type === "folder") {
                const descendants = getAllDescendants(
                  filteredTestCases,
                  item.id,
                );
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
        })()}
      />

      {/* 단일 삭제 다이얼로그 */}
      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("testcase.tree.dialog.deleteConfirm.title", "삭제 확인")}
        description={t(
          "testcase.tree.dialog.deleteConfirm.message",
          "정말로 삭제하시겠습니까? (하위 항목 포함)",
        )}
        items={(() => {
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
        })()}
      />

      {/* 이름 변경 다이얼로그 (누락된 UI 복구) */}
      <Dialog
        open={!!renameData}
        onClose={handleCancelRename}
        disableRestoreFocus // 다이얼로그 닫힐 때 포커스 충돌 방지
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 400 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {t("testcase.tree.dialog.rename.title", "이름 변경")}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label={t("testcase.tree.dialog.rename.label", "새 이름")}
            type="text"
            fullWidth
            variant="outlined"
            value={renameData?.name || ""}
            onChange={(e) =>
              setRenameData((prev) =>
                prev ? { ...prev, name: e.target.value } : null,
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmRename();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelRename} color="inherit">
            {t("common.button.cancel", "취소")}
          </Button>
          <Button
            onClick={handleConfirmRename}
            color="primary"
            variant="contained"
          >
            {t("common.button.save", "저장")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 에러 메시지 다이얼로그 (복구) */}
      <Dialog open={!!errorMessage} onClose={() => setErrorMessage("")}>
        <DialogTitle>
          {t("testcase.tree.dialog.error.title", "오류")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorMessage("")} autoFocus>
            {t("testcase.tree.button.close", "닫기")}
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
      // 백엔드 Cascade 설정으로 자식이 자동 삭제되므로, 선택된 항목만 삭제
      // 부모 노드들만 필터링 (자식 노드는 제외)
      const parentOnlyIds = checkedIds.filter((id) => {
        const item = filteredTestCases.find((tc) => tc.id === id);
        if (!item) {
          return false;
        }

        // 선택된 항목 중에 현재 항목의 부모가 있는지 확인
        let currentParentId = item.parentId;
        while (currentParentId) {
          if (checkedIds.includes(currentParentId)) {
            // 부모가 이미 선택되어 있으면 현재 항목은 삭제 대상에서 제외
            return false;
          }
          const parent = filteredTestCases.find(
            (tc) => tc.id === currentParentId,
          );
          currentParentId = parent?.parentId;
        }
        return true;
      });

      // 실제 삭제 (부모만 삭제하면 자식은 백엔드에서 자동 삭제됨)
      for (const id of parentOnlyIds) {
        await deleteTestCase(id);
      }

      // Dialog를 먼저 닫고
      setBatchDeleteDialogOpen(false);

      // 삭제 시 스프레드시트 깜빡임 방지를 위해 폼 모드로 전환 (ICT-UserReq)
      if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
        setInputMode("form");
      }

      // 포커스 이슈 방지를 위해 setTimeout으로 체크박스 초기화
      setTimeout(() => {
        setCheckedIds([]);
      }, 0);

      // await fetchProjectTestCases(projectId);
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
  }
};

export default TestCaseTree;
