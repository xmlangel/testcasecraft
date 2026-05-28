// src/components/TestCaseTree/components/MemoizedTreeItem.jsx
import React, { useRef, useState, useCallback } from "react";
import {
  Box,
  Checkbox,
  Typography,
  TextField,
  IconButton,
  Tooltip,
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
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";
import { isFolder } from "../../../utils/treeUtils.jsx";
import { useDraggable, useDroppable } from "@dnd-kit/core";

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

    // ── DnD: draggable + 3-zone droppable (before / into / after) ────────────
    const dndDisabled =
      isViewerRole || node.type === "placeholder" || selectable;

    const draggable = useDraggable({
      id: `tc-${node.id}`,
      data: { kind: "node", nodeId: node.id, isFolder: isFolder(node) },
      disabled: dndDisabled,
    });

    const dropBefore = useDroppable({
      id: `before-${node.id}`,
      data: {
        kind: "before",
        nodeId: node.id,
        parentId: node.parentId ?? null,
      },
      disabled: dndDisabled,
    });
    const dropInto = useDroppable({
      id: `into-${node.id}`,
      data: { kind: "into", nodeId: node.id },
      disabled: dndDisabled || !isFolder(node),
    });
    const dropAfter = useDroppable({
      id: `after-${node.id}`,
      data: { kind: "after", nodeId: node.id, parentId: node.parentId ?? null },
      disabled: dndDisabled,
    });

    const isOverInto = dropInto.isOver;
    const isOverBefore = dropBefore.isOver;
    const isOverAfter = dropAfter.isOver;

    // 이름 잘림(ellipsis) 감지 시에만 Tooltip 표시
    const nameRef = useRef(null);
    const [nameTooltip, setNameTooltip] = useState("");
    const checkNameTruncated = useCallback(() => {
      const el = nameRef.current;
      if (el && el.scrollWidth > el.clientWidth) {
        if (nameTooltip !== node.name) setNameTooltip(node.name);
      } else if (nameTooltip) {
        setNameTooltip("");
      }
    }, [node.name, nameTooltip]);

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

        {/* displayId 칩: 마지막 세그먼트(번호)만 표시, 호버 시 전체 ID 툴팁 */}
        {node.displayId && (
          <Tooltip
            title={node.displayId}
            arrow
            placement="top"
            enterDelay={300}
          >
            <Box
              component="span"
              sx={{
                flexShrink: 0,
                mr: 0.75,
                px: 0.6,
                py: 0.1,
                fontSize: "0.7rem",
                fontFamily: "monospace",
                fontWeight: 600,
                color: "primary.main",
                bgcolor: "action.hover",
                borderRadius: 0.5,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {String(node.displayId).split("-").pop() || node.displayId}
            </Box>
          </Tooltip>
        )}

        {/* 이름 영역: 가변 너비 + 잘림 감지 시에만 Tooltip 활성 */}
        <Tooltip
          title={nameTooltip}
          arrow
          placement="top"
          enterDelay={300}
          disableHoverListener={!nameTooltip}
        >
          <Typography
            ref={nameRef}
            onMouseEnter={checkNameTruncated}
            variant="body2"
            sx={{
              fontWeight: isSelected ? "bold" : "normal",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexGrow: 1,
              minWidth: 0,
              textAlign: "left",
              lineHeight: 1.5,
            }}
          >
            {node.name}
          </Typography>
        </Tooltip>

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
        ref={draggable.setNodeRef}
        sx={{
          pl: `${(depth || 0) * 16}px`,
          width: "100%",
          position: "relative",
          opacity: draggable.isDragging ? 0.4 : 1,
          "& .MuiTreeItem-content.Mui-selected": {
            backgroundColor: "rgba(0, 123, 255, 0.15)",
          },
          "& .MuiTreeItem-content.Mui-selected:hover": {
            backgroundColor: "rgba(0, 123, 255, 0.25)",
          },
        }}
      >
        {/* DnD: before-갭 droppable (행 상단 6px) */}
        <Box
          ref={dropBefore.setNodeRef}
          aria-label="drop-before"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            zIndex: 2,
            pointerEvents: dndDisabled ? "none" : "auto",
            "&::after": isOverBefore
              ? {
                  content: '""',
                  position: "absolute",
                  left: 8,
                  right: 8,
                  top: 2,
                  height: 2,
                  backgroundColor: "primary.main",
                  borderRadius: 1,
                }
              : undefined,
          }}
        />
        {/* DnD: after-갭 droppable (행 하단 6px) */}
        <Box
          ref={dropAfter.setNodeRef}
          aria-label="drop-after"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            zIndex: 2,
            pointerEvents: dndDisabled ? "none" : "auto",
            "&::after": isOverAfter
              ? {
                  content: '""',
                  position: "absolute",
                  left: 8,
                  right: 8,
                  bottom: 2,
                  height: 2,
                  backgroundColor: "primary.main",
                  borderRadius: 1,
                }
              : undefined,
          }}
        />
        <Box
          ref={dropInto.setNodeRef}
          onClick={(e) => onSelect(e, node.id)}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: dndDisabled ? "pointer" : "grab",
            py: 0.25,
            minHeight: 32,
            "&:hover": { bgcolor: "action.hover" },
            bgcolor: isOverInto
              ? "rgba(0, 123, 255, 0.18)"
              : isSelected
                ? "rgba(0, 123, 255, 0.1)"
                : "transparent",
            outline: isOverInto ? "1px dashed" : "none",
            outlineColor: "primary.main",
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
          {/* DnD: 드래그 핸들 (체크박스 옆) */}
          {!dndDisabled && (
            <Box
              {...draggable.attributes}
              {...draggable.listeners}
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: "flex",
                alignItems: "center",
                width: 18,
                color: "action.disabled",
                cursor: "grab",
                "&:active": { cursor: "grabbing" },
                "&:hover": { color: "action.active" },
              }}
              aria-label="drag-handle"
              title="드래그해서 위치 이동"
            >
              <DragIndicatorIcon sx={{ fontSize: 16 }} />
            </Box>
          )}
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
      prevProps.selectable === nextProps.selectable &&
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
