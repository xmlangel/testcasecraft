import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import TestResultAttachmentsView from "./TestResultAttachmentsView.jsx";

/**
 * 테스트 결과 첨부파일 보기 다이얼로그. (TestResultDetailTable 에서 추출)
 */
const TestResultAttachmentDialog = ({ open, testResultId, onClose, t }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      {t("testResult.dialog.attachmentsTitle", "테스트 결과 첨부파일")}
    </DialogTitle>
    <DialogContent>
      {testResultId && (
        <TestResultAttachmentsView
          testResultId={testResultId}
          showUpload={false}
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{t("common.button.close", "닫기")}</Button>
    </DialogActions>
  </Dialog>
);

TestResultAttachmentDialog.propTypes = {
  open: PropTypes.bool,
  testResultId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default TestResultAttachmentDialog;
