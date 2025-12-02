// src/components/TestCaseTree/components/TreeNodeLabel.jsx

import React from "react";
import { Box, IconButton, Checkbox, Typography, useTheme, alpha } from "@mui/material";
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
            onContextMenu={onContextMenu}
        >
            {/* 체크박스: Viewer는 숨김 */}
            {!isViewer && (
                <Checkbox
                    checked={isChecked}
                    onChange={onCheck}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                    sx={{ mr: 1 }}
                />
            )}
            {isFolder(node) ? (
                <FolderIcon color="primary" sx={{ mr: 1 }} />
            ) : (
                <DescriptionIcon
                    sx={{
                        mr: 1,
                        color: node.ragVectorized ? 'primary.main' : 'action.active'
                    }}
                />
            )}
            <Typography variant="body2" sx={{ fontWeight: isSelected ? "bold" : "normal" }}>
                {node.name}
            </Typography>
            <Typography variant="caption" sx={{
                ml: 1,
                color: theme.palette.mode === 'dark' ? 'info.light' : 'info.main',
                fontWeight: 'bold'
            }}>
                #{nodeOrder}
            </Typography>
            {orderEditMode && !isViewer && (
                <Box sx={{ display: "flex", ml: 1 }}>
                    <IconButton
                        size="small"
                        disabled={isFirstSibling}
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveUp();
                        }}
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
                    >
                        <ArrowDownwardIcon fontSize="inherit" />
                    </IconButton>
                </Box>
            )}
            {isFolder(node) && (
                <Typography
                    variant="body2"
                    sx={{
                        ml: 1,
                        color: theme.palette.mode === 'dark' ? 'success.light' : 'success.main',
                        fontWeight: "bold"
                    }}
                >
                    {testCaseCount}
                </Typography>
            )}
            {!selectable && !isViewer && (
                <Box sx={{ marginLeft: "auto", display: "flex" }}>
                    {/* 테스트케이스에만 버전 히스토리 버튼 표시 */}
                    {node.type === 'testcase' && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenVersionHistory();
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
                            onContextMenu(e);
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default TreeNodeLabel;
