import React from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { BugReport as BugReportIcon } from "@mui/icons-material";

const TestResultFooter = ({
  onClose,
  onSave,
  handleOpenJiraDialog,
  shouldShowJiraButton,
  detectedJiraIssues,
  loading,
  isViewer,
  testCase,
  saveButtonRef,
  t,
  hideButtons = false,
}) => {
  return (
    <Box
      sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "space-between" }}
    >
      {/* JIRA 버튼 (좌측) */}
      <Box>
        {shouldShowJiraButton() && !isViewer && (
          <Tooltip
            title={t(
              "testResult.form.jiraCommentTooltip",
              "JIRA 이슈에 테스트 결과 코멘트 추가",
            )}
          >
            <span>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<BugReportIcon />}
                onClick={handleOpenJiraDialog}
                disabled={loading}
                data-testid="result-jira-button"
              >
                {t("testResult.form.jiraComment", "JIRA 코멘트")}
              </Button>
            </span>
          </Tooltip>
        )}
        {detectedJiraIssues.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {t("testResult.form.detectedIssues", "감지된 이슈:")}{" "}
            {detectedJiraIssues.join(", ")}
          </Typography>
        )}
      </Box>

      {/* 기본 버튼들 (우측) - hideButtons가 아닐 때만 노출 */}
      {!hideButtons && (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            data-testid="result-cancel-button"
          >
            {t("common.button.cancel", "취소")}
          </Button>
          {!isViewer && (
            <Button
              ref={saveButtonRef}
              onClick={onSave}
              variant="contained"
              color="primary"
              disabled={loading || isViewer || !testCase}
              data-testid="result-save-button"
            >
              {t("common.button.save", "저장")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TestResultFooter;
