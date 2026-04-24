// src/components/TestCaseTree/components/TreeHeader.jsx
import React from "react";
import { Box, Checkbox, Typography, Button, IconButton } from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  SwapVert as SwapVertIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";
import { isViewer, canAdd } from "../utils/permissionUtils.js";

/**
 * 테스트케이스 트리 헤더 컴포넌트
 * - Select All 체크박스 + 폴더/케이스 수 표시
 * - 우측 버튼 그룹: 삭제, 새로고침, 추가, 순서편집
 */
const TreeHeader = ({
  userRole,
  selectable,
  isAllChecked,
  isIndeterminate,
  totalFolderCount,
  totalTestCaseCount,
  checkedIds,
  orderEditMode,
  orderChanged,
  onCheckAll,
  onRefresh,
  onOpenAddMenu,
  onOrderEditMode,
  onOrderSave,
  onOrderCancel,
  onBatchDelete,
}) => {
  const { t } = useI18n();

  return (
    <Box sx={{ px: 2, pt: 1, pb: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 좌측: Select All + 카운트 */}
        {!isViewer(userRole) && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
            data-testid="testcase-check-all-container"
          >
            <Checkbox
              checked={isAllChecked}
              indeterminate={isIndeterminate}
              onChange={onCheckAll}
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
            {/* 일괄 삭제 버튼 */}
            {!isViewer(userRole) &&
              checkedIds.length > 0 &&
              userRole !== "USER" && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={onBatchDelete}
                >
                  ({checkedIds.length})
                </Button>
              )}

            {/* 새로고침 버튼 */}
            <IconButton
              size="small"
              onClick={onRefresh}
              title={t("testcase.tree.button.refresh", "리프레시")}
            >
              <RefreshIcon />
            </IconButton>

            {!isViewer(userRole) && (
              <>
                {/* 추가 버튼 */}
                {canAdd(userRole) && (
                  <IconButton
                    size="small"
                    onClick={onOpenAddMenu}
                    data-testid="add-top-button"
                  >
                    <AddIcon />
                  </IconButton>
                )}

                {/* 순서 변경/저장 버튼 */}
                <IconButton
                  size="small"
                  onClick={orderEditMode ? onOrderSave : onOrderEditMode}
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
                    onClick={onOrderCancel}
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
  );
};

export default TreeHeader;
