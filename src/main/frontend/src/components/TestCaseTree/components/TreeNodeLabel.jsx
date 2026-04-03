// src/components/TestCaseTree/components/TreeNodeLabel.jsx

import React from "react";
import {
  Box,
  IconButton,
  Checkbox,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";
import { isFolder } from "../../../utils/treeUtils.jsx";

/**
 * 트리 노드 레이블 컴포넌트
 * @param {Object} node - 트리 노드 객체
 * @param {boolean} isChecked - 체크 여부
 * @param {boolean} isSelected - 선택 여부
 * @param {boolean} isHighlighted - 하이라이트 여부
 * @param {number} nodeOrder - 노드 순서 번호
 * @param {boolean} orderEditMode - 순서 변경 모드 여부
 * @param {function} onCheck - 체크 핸들러
 * @param {function} onMoveUp - 위로 이동 핸들러
 * @param {function} onMoveDown - 아래로 이동 핸들러
 * @param {function} onContextMenu - 컨텍스트 메뉴 핸들러
 * @param {function} onOpenVersionHistory - 버전 히스토리 열기 핸들러
 * @param {number} testCaseCount - 하위 테스트케이스 개수 (폴더인 경우)
 * @param {boolean} isFirstSibling - 같은 레벨에서 첫 번째 여부
 * @param {boolean} isLastSibling - 같은 레벨에서 마지막 여부
 * @param {boolean} isViewer - Viewer 권한 여부
 * @param {boolean} selectable - 선택 가능 모드 여부
 */
const TreeNodeLabel = ({
  node,
  isChecked,
  isSelected,
  isHighlighted,
  nodeOrder,
  orderEditMode,
  onCheck,
  onMoveUp,
  onMoveDown,
  onContextMenu,
  onOpenVersionHistory,
  testCaseCount,
  isFirstSibling,
  isLastSibling,
  isViewer,
  selectable,
}) => {
  const { t } = useI18n();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 0.5,
        backgroundColor: isSelected
          ? alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity + 0.05,
            )
          : isHighlighted
            ? alpha(theme.palette.success.main, 0.3)
            : "transparent",
        fontWeight: isSelected ? "bold" : "normal",
        color: isSelected ? theme.palette.primary.main : "inherit",
        width: "100%", // 전체 너비 사용
        "&:hover": {
          backgroundColor: isSelected
            ? alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity + 0.1,
              )
            : theme.palette.action.hover,
        },
      }}
      onContextMenu={onContextMenu}
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
        {!isViewer && (
          <Checkbox
            checked={isChecked}
            onChange={onCheck}
            onClick={(e) => e.stopPropagation()}
            size="small"
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
            color: theme.palette.mode === "dark" ? "info.light" : "info.main",
            opacity: 0.8,
            fontWeight: "bold",
            mr: 1,
          }}
        >
          #{nodeOrder}
        </Typography>

        {orderEditMode && !isViewer && (
          <Box sx={{ display: "flex", mr: 0.5 }}>
            <IconButton
              size="small"
              disabled={isFirstSibling}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              sx={{ p: 0.25 }}
            >
              <ArrowUpwardIcon fontSize="inherit" />
            </IconButton>
            <IconButton
              size="small"
              disabled={isLastSibling}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
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
              color:
                theme.palette.mode === "dark"
                  ? "success.light"
                  : "success.main",
              fontWeight: "bold",
              mx: 0.5,
            }}
          >
            {testCaseCount}
          </Typography>
        )}

        {!selectable && !isViewer && (
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 60 }}>
            {/* 테스트케이스에만 버전 히스토리 버튼 표시 */}
            {node.type === "testcase" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVersionHistory();
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
                onContextMenu(e);
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
};

export default TreeNodeLabel;
