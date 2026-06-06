import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Link as LinkIcon,
  Launch as LaunchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { jiraService } from "../../services/jiraService";
import { useTheme } from "@mui/material/styles";
import { useI18n } from "../../context/I18nContext";
import JiraIssueCreationDialog from "./JiraIssueCreationDialog.jsx";

const JiraIssueLinker = ({
  testResult = null,
  testCase = null,
  projectId = null,
  onIssueLinked = null,
  onIssueUnlinked = null,
  onQueryChange = null,
  linkedIssues = [],
  disabled = false,
  initialSearchQuery = "",
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jiraStatus, setJiraStatus] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  // ICT-184: 이슈 존재 여부 검증 상태
  const [issueValidation, setIssueValidation] = useState({
    status: null,
    message: null,
  });
  const [validationLoading, setValidationLoading] = useState(false);
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    checkJiraStatus();
    loadRecentIssues();

    // ICT-184: 기존 입력된 이슈 키가 있다면 검색어에 채우기
    if (initialSearchQuery && !searchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, []);

  // ICT-184: 검색어 변경 시 실시간 검증
  useEffect(() => {
    const validateIssueKey = async () => {
      let query = searchQuery.trim();

      // URL인 경우 키만 추출
      const extractedKey = jiraService.extractIssueKeyFromUrl(query);
      if (extractedKey) {
        query = extractedKey;
      }

      // 빈 입력이거나 JIRA 이슈 키 패턴이 아니면 검증 안함
      if (!query || !jiraService.isValidIssueKey(query)) {
        setIssueValidation({ status: null, message: null });
        return;
      }

      setValidationLoading(true);

      try {
        const result = await jiraService.checkIssueExists(query);

        if (result.exists) {
          setIssueValidation({
            status: "success",
            message: `✅ ${result.issueKey}: ${
              result.summary || t("jira.linker.issueExists", "이슈가 존재합니다")
            }`,
          });
        } else {
          setIssueValidation({
            status: "error",
            message: result.errorMessage || t("jira.linker.issueNotFound", "이슈를 찾을 수 없습니다"),
          });
        }
      } catch (error) {
        console.error("이슈 검증 실패:", error);
        setIssueValidation({
          status: "error",
          message: t("jira.linker.validationError", "이슈 검증 중 오류가 발생했습니다"),
        });
      } finally {
        setValidationLoading(false);
      }
    };

    // 300ms 디바운스
    const debounceTimer = setTimeout(() => {
      validateIssueKey();
      if (onQueryChange) {
        onQueryChange(searchQuery);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onQueryChange]);

  const checkJiraStatus = async () => {
    try {
      const status = await jiraService.getConnectionStatus();
      setJiraStatus(status);

      if (!status.hasConfig || !status.isConnected) {
        setError(
          t("jira.linker.noConfig", "JIRA 설정이 없거나 연결에 실패했습니다."),
        );
      }
    } catch (error) {
      console.error("JIRA 상태 확인 실패:", error);
      setError(
        t(
          "jira.linker.connectionError",
          "JIRA 연결 상태를 확인할 수 없습니다.",
        ),
      );
    }
  };

  const loadRecentIssues = async () => {
    try {
      const recent = localStorage.getItem("jira-recent-issues");
      if (recent) {
        setRecentIssues(JSON.parse(recent));
      }
    } catch (error) {
      console.error("최근 이슈 로드 실패:", error);
    }
  };

  const saveRecentIssue = (issue) => {
    try {
      const recent = [...recentIssues];
      const existingIndex = recent.findIndex((r) => r.key === issue.key);

      if (existingIndex >= 0) {
        recent.splice(existingIndex, 1);
      }

      recent.unshift(issue);
      const limitedRecent = recent.slice(0, 5);

      setRecentIssues(limitedRecent);
      localStorage.setItem("jira-recent-issues", JSON.stringify(limitedRecent));
    } catch (error) {
      console.error("최근 이슈 저장 실패:", error);
    }
  };

  const handleSearch = async () => {
    let query = searchQuery.trim();

    // URL인 경우 키만 추출
    const extractedKey = jiraService.extractIssueKeyFromUrl(query);
    if (extractedKey) {
      query = extractedKey;
    }

    if (!query) {
      setError(t("jira.linker.enterSearchQuery", "검색어를 입력하세요."));
      return;
    }

    if (
      issueValidation.status === "error" &&
      jiraService.isValidIssueKey(query)
    ) {
      setError(
        t(
          "jira.linker.issueNotFound",
          "해당 이슈가 존재하지 않아 검색할 수 없습니다.",
        ),
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await jiraService.searchIssues(query);
      setSearchResults(results || []);

      if (!results || results.length === 0) {
        setError(t("jira.linker.noResults", "검색 결과가 없습니다."));
      }
    } catch (error) {
      console.error("JIRA 이슈 검색 실패:", error);
      setError(jiraService.getUserFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleIssueSelect = async (issue) => {
    try {
      setSearchQuery(issue.key); // 검색창에 이슈 키 자동 기입
      const detailedIssue = await jiraService.getIssueDetails(issue.key);
      setSelectedIssue(detailedIssue);
      saveRecentIssue(detailedIssue);
    } catch (error) {
      console.error("이슈 상세 정보 로드 실패:", error);
      setError(
        t("jira.linker.detailsError", "이슈 정보를 불러올 수 없습니다."),
      );
    }
  };

  const handleLinkIssue = (issue) => {
    if (onIssueLinked) {
      onIssueLinked(issue);
    }
    setSelectedIssue(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleUnlinkIssue = (issueKey) => {
    if (onIssueUnlinked) {
      onIssueUnlinked(issueKey);
    }
  };

  const getIssueTypeIcon = (issueType) => {
    if (!issueType) return <LinkIcon />;

    const type = (
      typeof issueType === "string"
        ? issueType
        : issueType?.name ||
          (typeof issueType === "object" ? "" : String(issueType))
    ).toLowerCase();

    if (type.includes("bug")) return <BugReportIcon color="error" />;
    if (type.includes("task")) return <CheckCircleIcon color="primary" />;
    if (type.includes("story")) return <CheckCircleIcon color="success" />;
    if (type.includes("epic")) return <BugReportIcon color="secondary" />; // 에픽 아이콘 추가
    return <LinkIcon />;
  };

  const getPriorityColor = (priority) => {
    const p = (
      typeof priority === "string"
        ? priority
        : priority?.name || String(priority || "")
    ).toLowerCase();

    if (p.includes("highest") || p.includes("critical")) return "error";
    if (p.includes("high")) return "warning";
    if (p.includes("medium")) return "info";
    return "default";
  };

  const getStatusColor = (status) => {
    if (!status) return "info";

    const s = (
      typeof status === "string"
        ? status
        : status?.name || (typeof status === "object" ? "" : String(status))
    ).toLowerCase();

    if (
      s.includes("done") ||
      s.includes("완료") ||
      s.includes("closed") ||
      s.includes("resolved")
    )
      return "success";
    if (s.includes("progress") || s.includes("진행") || s.includes("active"))
      return "warning";
    if (
      s.includes("todo") ||
      s.includes("해야") ||
      s.includes("open") ||
      s.includes("new")
    )
      return "default";
    return "info";
  };

  const openJiraIssue = (issueKey) => {
    if (jiraStatus?.serverUrl) {
      const url = `${jiraStatus.serverUrl}/browse/${issueKey}`;
      window.open(url, "_blank");
    }
  };

  if (!jiraStatus?.hasConfig || !jiraStatus?.isConnected) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          {t(
            "jira.linker.noConfigWarning",
            "JIRA 이슈 연동을 사용하려면 먼저 JIRA 설정을 완료해주세요.",
          )}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* 연결된 이슈 목록 */}
      {linkedIssues.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.primary" gutterBottom>
            {t("jira.linker.linkedIssues", "연결된 JIRA 이슈")}:
          </Typography>
          <List dense>
            {linkedIssues.map((issue) => (
              <ListItem key={issue.key} divider>
                <ListItemIcon>{getIssueTypeIcon(issue.issueType)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {issue.key}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          typeof issue.status === "string"
                            ? issue.status
                            : issue.status?.name ||
                              (typeof issue.status === "object"
                                ? "Unknown"
                                : String(issue.status || "Unknown"))
                        }
                        color={getStatusColor(issue.status)}
                        variant="outlined"
                      />
                      {issue.priority && (
                        <Chip
                          size="small"
                          label={
                            typeof issue.priority === "string"
                              ? issue.priority
                              : issue.priority?.name ||
                                (typeof issue.priority === "object"
                                  ? "Medium"
                                  : String(issue.priority || "Medium"))
                          }
                          color={getPriorityColor(issue.priority)}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {issue.summary}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => openJiraIssue(issue.key)}
                    title={t("jira.linker.openInJira", "JIRA에서 열기")}
                    sx={{ color: "text.secondary" }}
                  >
                    <LaunchIcon />
                  </IconButton>
                  {!disabled && (
                    <IconButton
                      size="small"
                      onClick={() => handleUnlinkIssue(issue.key)}
                      title={t("jira.linker.unlink", "연결 해제")}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {!disabled && (
        <>
          {/* 이슈 검색 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              {t("jira.linker.searchAndLink", "JIRA 이슈 검색 및 연결")}:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t(
                  "jira.linker.placeholder",
                  "이슈 키, 제목 또는 JIRA URL을 입력하세요 (예: TEST-123)",
                )}
                disabled={loading}
                color={
                  issueValidation.status === "success"
                    ? "success"
                    : issueValidation.status === "error"
                      ? "error"
                      : "primary"
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment:
                      validationLoading || issueValidation.status ? (
                        <InputAdornment position="end">
                          {validationLoading ? (
                            <CircularProgress size={16} />
                          ) : issueValidation.status === "success" ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : issueValidation.status === "error" ? (
                            <ErrorIcon color="error" fontSize="small" />
                          ) : null}
                        </InputAdornment>
                      ) : null,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                startIcon={
                  loading ? <CircularProgress size={16} /> : <SearchIcon />
                }
              >
                {t("common.button.search", "검색")}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setCreationDialogOpen(true)}
                startIcon={<AddIcon />}
                disabled={loading}
                sx={{ ml: 1, minWidth: "120px" }}
              >
                {t("jira.linker.createIssue", "이슈 생성")}
              </Button>
            </Box>

            {issueValidation.status && issueValidation.message && (
              <Alert
                severity={
                  issueValidation.status === "success" ? "success" : "error"
                }
                sx={{ mb: 1, fontSize: "0.875rem" }}
                variant="outlined"
              >
                {issueValidation.message}
              </Alert>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {recentIssues.length > 0 && searchResults.length === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t("jira.linker.recentIssues", "최근 검색한 이슈")}:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {recentIssues.map((issue) => (
                  <Chip
                    key={issue.key}
                    size="small"
                    label={`${issue.key}: ${issue.summary?.slice(0, 30)}...`}
                    clickable
                    onClick={() => handleIssueSelect(issue)}
                    icon={getIssueTypeIcon(issue.issueType)}
                  />
                ))}
              </Box>
            </Box>
          )}

          {searchResults.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t("jira.linker.searchResults", "검색 결과")}:
              </Typography>
              <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
                {searchResults.map((issue) => (
                  <ListItem
                    key={issue.key}
                    button
                    onClick={() => handleIssueSelect(issue)}
                    divider
                  >
                    <ListItemIcon>
                      {getIssueTypeIcon(issue.issueType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {issue.key}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              typeof issue.status === "string"
                                ? issue.status
                                : issue.status?.name ||
                                  (typeof issue.status === "object"
                                    ? "Unknown"
                                    : String(issue.status || "Unknown"))
                            }
                            color={getStatusColor(issue.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {issue.summary}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {selectedIssue && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  {getIssueTypeIcon(selectedIssue.issueType)}
                  <Typography variant="h6">{selectedIssue.key}</Typography>
                  <Chip
                    size="small"
                    label={
                      typeof selectedIssue.status === "string"
                        ? selectedIssue.status
                        : selectedIssue.status?.name ||
                          String(selectedIssue.status || "")
                    }
                    color={getStatusColor(selectedIssue.status)}
                  />
                  {selectedIssue.priority && (
                    <Chip
                      size="small"
                      label={
                        typeof selectedIssue.priority === "string"
                          ? selectedIssue.priority
                          : selectedIssue.priority?.name ||
                            String(selectedIssue.priority || "")
                      }
                      color={getPriorityColor(selectedIssue.priority)}
                    />
                  )}
                </Box>

                <Typography variant="body1" gutterBottom>
                  {selectedIssue.summary}
                </Typography>

                {selectedIssue.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxHeight: "100px",
                      overflow: "auto",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {selectedIssue.description}
                  </Typography>
                )}

                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleLinkIssue(selectedIssue)}
                    disabled={linkedIssues.some(
                      (li) => li.key === selectedIssue.key,
                    )}
                  >
                    {linkedIssues.some((li) => li.key === selectedIssue.key)
                      ? t("jira.linker.alreadyLinked", "이미 연결됨")
                      : t("jira.linker.link", "연결")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LaunchIcon />}
                    onClick={() => openJiraIssue(selectedIssue.key)}
                  >
                    {t("jira.linker.openInJira", "JIRA에서 열기")}
                  </Button>
                  <Button variant="text" onClick={() => setSelectedIssue(null)}>
                    {t("common.button.cancel", "취소")}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <JiraIssueCreationDialog
        open={creationDialogOpen}
        onClose={() => setCreationDialogOpen(false)}
        onIssueCreated={handleIssueSelect}
        testResult={testResult}
        testCase={testCase}
        projectId={projectId}
      />
    </Box>
  );
};

export default JiraIssueLinker;
