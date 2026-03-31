import React from "react";
import { Box, Typography } from "@mui/material";
import { BugReport as BugReportIcon } from "@mui/icons-material";
import JiraIssueLinker from "../JiraIntegration/JiraIssueLinker.jsx";

const TestResultJira = ({
  jiraConnectionStatus,
  result,
  notes,
  handleIssueLinked,
  handleIssueUnlinked,
  linkedIssues,
  isViewer,
  t,
  detectedJiraIssues = [],
  jiraIssueKey = "",
  testCase = null,
}) => {
  const projectId = testCase?.project?.id;

  return (
    <Box>
      {/* JIRA Integration Section */}
      {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
            color="text.primary"
          >
            <BugReportIcon />
            {t("testResult.form.jiraIntegration")}
          </Typography>
          {detectedJiraIssues.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              {t("testResult.jira.detectedIssues", "감지된 이슈")}:{" "}
              {detectedJiraIssues.join(", ")}
            </Typography>
          )}
          <JiraIssueLinker
            testResult={{ result, notes }}
            testCase={testCase}
            projectId={projectId}
            onIssueLinked={handleIssueLinked}
            onIssueUnlinked={handleIssueUnlinked}
            linkedIssues={linkedIssues}
            disabled={isViewer}
            initialSearchQuery={jiraIssueKey}
          />
        </Box>
      )}
    </Box>
  );
};

export default TestResultJira;
