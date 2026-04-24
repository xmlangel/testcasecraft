// src/components/TestCaseTree/components/MemoizedTreeItem.jsx
import React from "react";
import {
  Box,
  Checkbox,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { isFolder } from "../../../utils/treeUtils.jsx";

/**
 * 트리 아이템 단일 컴포넌트 (React.memo로 성능 최적화)
 */
const MemoizedTreeItem = React.memo(
  ({
    node,
    idx,
    siblings,
    isSelected,
    isChecked,
    selectable,
    userRole,
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
          pl: `${(depth || 0) * 16}px`,
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
            py: 0.25,
            minHeight: 32,
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

MemoizedTreeItem.displayName = "MemoizedTreeItem";

export default MemoizedTreeItem;
