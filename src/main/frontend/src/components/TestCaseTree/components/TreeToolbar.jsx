// src/components/TestCaseTree/components/TreeToolbar.jsx

import React from "react";
import { Box, IconButton, Toolbar, Button } from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    CreateNewFolder as CreateNewFolderIcon,
    SwapVert as SwapVertIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";

/**
 * 트리 상단 툴바 컴포넌트
 * @param {function} onRefresh - 새로고침 핸들러
 * @param {function} onAddFolder - 폴더 추가 핸들러
 * @param {function} onAddTestCase - 테스트케이스 추가 핸들러
 * @param {function} onToggleOrderEdit - 순서 변경 모드 토글 핸들러
 * @param {function} onOrderSave - 순서 저장 핸들러
 * @param {function} onOrderCancel - 순서 변경 취소 핸들러
 * @param {function} onBulkDelete - 일괄 삭제 핸들러
 * @param {number} checkedCount - 선택된 항목 개수
 * @param {boolean} orderEditMode - 순서 변경 모드 여부
 * @param {string} userRole - 사용자 역할
 * @param {boolean} isViewer - Viewer 여부
 * @param {boolean} canDelete - 삭제 권한 여부
 * @param {boolean} showMinimalToolbar - 새로고침만 표시 (TestPlanForm용)
 */
const TreeToolbar = ({
    onRefresh,
    onAddFolder,
    onAddTestCase,
    onToggleOrderEdit,
    onOrderSave,
    onOrderCancel,
    onBulkDelete,
    checkedCount,
    orderEditMode,
    userRole,
    isViewer,
    canDelete,
    showMinimalToolbar = false,
}) => {
    const { t } = useI18n();

    return (
        <Toolbar
            variant="dense"
            sx={{
                borderBottom: 1,
                borderColor: "divider",
                justifyContent: "flex-end",
                minHeight: 48,
                px: 1,
            }}
        >
            <Box>
                {/* 최소 모드일 때는 새로고침만 표시 */}
                <IconButton size="small" onClick={onRefresh} title={t('testcase.tree.action.refresh', '새로고침')}>
                    <RefreshIcon fontSize="small" />
                </IconButton>

                {/* 일반 모드일 때 나머지 버튼들 표시 */}
                {!showMinimalToolbar && (
                    <>
                        {/* 일괄 삭제 버튼 (선택된 항목이 있고 권한이 있을 때) */}
                        {checkedCount > 0 && canDelete && (
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={onBulkDelete}
                                sx={{ mr: 1 }}
                            >
                                {t('testcase.tree.action.deleteSelected', '삭제 ({count})', { count: checkedCount })}
                            </Button>
                        )}

                        {!isViewer && (
                            <>
                                <IconButton
                                    size="small"
                                    onClick={onAddFolder}
                                    title={t('testcase.tree.action.addFolder', '폴더 추가')}
                                    disabled={orderEditMode}
                                >
                                    <CreateNewFolderIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={onAddTestCase}
                                    title={t('testcase.tree.action.addTestCase', '테스트케이스 추가')}
                                    disabled={orderEditMode}
                                >
                                    <AddIcon fontSize="small" />
                                </IconButton>
                                {orderEditMode ? (
                                    <>
                                        <IconButton
                                            size="small"
                                            onClick={onOrderSave}
                                            color="primary"
                                            title={t('testcase.tree.action.saveOrder', '순서 저장')}
                                        >
                                            <SaveIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={onOrderCancel}
                                            color="error"
                                            title={t('testcase.tree.action.cancelOrder', '순서 변경 취소')}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                ) : (
                                    <IconButton
                                        size="small"
                                        onClick={onToggleOrderEdit}
                                        title={t('testcase.tree.action.editOrder', '순서 변경')}
                                    >
                                        <SwapVertIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </>
                        )}
                    </>
                )}
            </Box>
        </Toolbar>
    );
};

export default TreeToolbar;
