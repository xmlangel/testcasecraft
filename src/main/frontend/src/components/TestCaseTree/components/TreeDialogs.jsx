// src/components/TestCaseTree/components/TreeDialogs.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useI18n } from "../../../context/I18nContext.jsx";
import { DeleteConfirmationDialog } from "../../TestCase/Spreadsheet/components/DeleteConfirmationDialog.jsx";
import TestCaseVersionHistory from "../../TestCase/TestCaseVersionHistory.jsx";

/**
 * 테스트케이스 트리에서 사용하는 모든 다이얼로그 모음
 * - 이름 변경 다이얼로그
 * - 에러 메시지 다이얼로그
 * - 단일 삭제 확인 다이얼로그
 * - 일괄 삭제 확인 다이얼로그
 * - 버전 히스토리 다이얼로그
 */
const TreeDialogs = ({
  // 이름 변경
  renameData,
  setRenameData,
  onCancelRename,
  onConfirmRename,

  // 에러
  errorMessage,
  onCloseError,

  // 단일 삭제
  deleteConfirmationOpen,
  onCancelDelete,
  onConfirmDelete,
  singleDeleteItems,

  // 일괄 삭제
  batchDeleteDialogOpen,
  onCloseBatchDelete,
  onConfirmBatchDelete,
  batchDeleteItems,
  checkedIds,

  // 버전 히스토리
  versionHistoryOpen,
  selectedVersionTestCaseId,
  onCloseVersionHistory,
  onRestore,
}) => {
  const { t } = useI18n();

  return (
    <>
      {/* 이름 변경 다이얼로그 */}
      <Dialog
        open={!!renameData}
        onClose={onCancelRename}
        disableRestoreFocus
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
                onConfirmRename();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCancelRename} color="inherit">
            {t("common.button.cancel", "취소")}
          </Button>
          <Button onClick={onConfirmRename} color="primary" variant="contained">
            {t("common.button.save", "저장")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 에러 메시지 다이얼로그 */}
      <Dialog open={!!errorMessage} onClose={onCloseError}>
        <DialogTitle>
          {t("testcase.tree.dialog.error.title", "오류")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseError} autoFocus>
            {t("testcase.tree.button.close", "닫기")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 일괄 삭제 다이얼로그 */}
      <DeleteConfirmationDialog
        open={batchDeleteDialogOpen}
        onClose={onCloseBatchDelete}
        onConfirm={onConfirmBatchDelete}
        title={t("testcase.tree.dialog.batchDelete.title", "선택 삭제")}
        description={t(
          "testcase.tree.dialog.batchDelete.message",
          "{count}개 항목(하위 포함)을 삭제하시겠습니까?",
          { count: checkedIds.length },
        )}
        items={batchDeleteItems}
      />

      {/* 단일 삭제 다이얼로그 */}
      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
        title={t("testcase.tree.dialog.deleteConfirm.title", "삭제 확인")}
        description={t(
          "testcase.tree.dialog.deleteConfirm.message",
          "정말로 삭제하시겠습니까? (하위 항목 포함)",
        )}
        items={singleDeleteItems}
      />

      {/* 버전 히스토리 다이얼로그 */}
      <TestCaseVersionHistory
        testCaseId={selectedVersionTestCaseId}
        open={versionHistoryOpen}
        onClose={onCloseVersionHistory}
        onRestore={onRestore}
      />
    </>
  );
};

export default TreeDialogs;
