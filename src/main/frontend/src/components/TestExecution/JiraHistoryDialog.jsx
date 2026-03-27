import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  CircularProgress,
  IconButton,
  Link,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  AttachFile as AttachFileIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import MDEditor from "@uiw/react-md-editor";
import { useTranslation } from "../../context/I18nContext.jsx";
import { useAppContext } from "../../context/AppContext.jsx";
import { jiraService } from "../../services/jiraService";
import TestResultAttachmentsView from "../TestCase/TestResultAttachmentsView.jsx";
import { getResultIcon, formatDateTimeFull } from "./utils.jsx";

/**
 * JIRA 이슈별 테스트 히스토리 다이얼로그 (ICT-188)
 */
function JiraHistoryDialog({ open, onClose, jiraIssueKey }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const { t } = useTranslation();
  const { jiraServerUrl } = useAppContext();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTestResultId, setSelectedTestResultId] = useState(null);

  useEffect(() => {
    if (open && jiraIssueKey) {
      fetchHistory();
    } else {
      setResults([]);
    }
  }, [open, jiraIssueKey]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await jiraService.getAllTestResultsByIssue(jiraIssueKey);
      setResults(data || []);
    } catch (error) {
      console.error("Failed to fetch JIRA history:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    return [...results].sort(
      (a, b) => new Date(b.executedAt) - new Date(a.executedAt),
    );
  }, [results]);

  const handleAttachmentClick = (testResultId) => {
    setSelectedTestResultId(testResultId);
    setAttachmentDialogOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {t("jira.history.dialogTitle")}
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              [{jiraIssueKey}]
            </Typography>
          </Box>
          {jiraServerUrl && (
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              href={`${jiraServerUrl}/browse/${jiraIssueKey}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              JIRA에서 보기
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : sortedResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t("jira.history.noResults")}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{ backgroundColor: theme.palette.action.hover }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("jira.history.column.date")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("jira.history.column.result")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("jira.history.column.execution")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("jira.history.column.testcase")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("jira.history.column.executor")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {t("jira.history.column.notes")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      <AttachFileIcon fontSize="small" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedResults.map((r, idx) => (
                    <TableRow key={r.id || idx} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {r.executedAt ? formatDateTimeFull(r.executedAt) : "-"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getResultIcon(r.result)}
                          <Typography
                            variant="body2"
                            sx={{ ml: 1, fontWeight: "medium" }}
                          >
                            {r.result}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${r.projectId}/executions/${r.testExecutionId}`}
                          target="_blank"
                          underline="hover"
                          color="inherit"
                        >
                          {r.testExecutionName || r.testExecutionId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${r.projectId}/testcases/${r.testCaseId}`}
                          target="_blank"
                          underline="hover"
                          color="inherit"
                        >
                          {r.testCaseName || r.testCaseId}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {r.executedBy}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {r.notes ? (
                          <Box data-color-mode={darkMode ? "dark" : "light"}>
                            <MDEditor.Markdown
                              source={r.notes}
                              style={{
                                whiteSpace: "pre-wrap",
                                backgroundColor: "transparent",
                                color: theme.palette.text.primary,
                                fontSize: "0.8rem",
                                maxHeight: "100px",
                                overflowY: "auto",
                              }}
                            />
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {r.attachmentCount > 0 ? (
                          <IconButton
                            size="small"
                            onClick={() => handleAttachmentClick(r.id)}
                          >
                            <AttachFileIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="primary">
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 첨부파일 다이얼로그 */}
      <Dialog
        open={attachmentDialogOpen}
        onClose={() => {
          setAttachmentDialogOpen(false);
          setSelectedTestResultId(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("testExecution.previousResults.attachments.title")}
        </DialogTitle>
        <DialogContent>
          {selectedTestResultId && (
            <TestResultAttachmentsView
              testResultId={selectedTestResultId}
              showUpload={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAttachmentDialogOpen(false);
              setSelectedTestResultId(null);
            }}
          >
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

JiraHistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  jiraIssueKey: PropTypes.string,
};

export default JiraHistoryDialog;
