import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
  Assignment as TaskIcon,
  Info as InfoIcon,
  Create as CreateIcon,
  CheckCircle as CheckCircleIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import jiraService from "../../services/jiraService";
import { useI18n } from "../../context/I18nContext";
import { useAuth } from "../../context/AuthContext";
import { useJira } from "../../context/JiraContext";

/**
 * JIRA 이슈 생성을 위한 다이얼로그 컴포넌트
 */
const JiraIssueCreationDialog = ({
  open,
  onClose,
  testCase,
  testResult,
  projectId,
  onIssueCreated,
}) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { jiraServerUrl } = useJira();

  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // 폼 데이터
  const [projects, setProjects] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [jiraStatus, setJiraStatus] = useState(null);
  const [formData, setFormData] = useState({
    projectKey: "",
    issueTypeId: "",
    summary: "",
    description: "",
  });

  // 성공 상태 관리
  const [successData, setSuccessData] = useState(null);

  // 초기 데이터 로드 및 템플릿 생성
  useEffect(() => {
    if (open) {
      fetchJiraStatus();
      if (testCase) {
        fetchProjects();
        generateTemplate();
      }
    }
  }, [open, testCase, testResult]);

  // JIRA 상태 및 서버 URL 조회
  const fetchJiraStatus = async () => {
    try {
      const status = await jiraService.getConnectionStatus();
      setJiraStatus(status);
    } catch (err) {
      console.error("Failed to fetch JIRA status:", err);
    }
  };

  // 프로젝트 선택 시 이슈 유형 조회
  useEffect(() => {
    if (formData.projectKey) {
      fetchIssueTypes(formData.projectKey);
    } else {
      setIssueTypes([]);
    }
  }, [formData.projectKey]);

  // JIRA 프로젝트 목록 조회
  const fetchProjects = async () => {
    setFetchingProjects(true);
    setError(null);
    try {
      const projectList = await jiraService.getProjects();
      setProjects(projectList || []);

      // 프로젝트가 하나만 있거나 기존에 선택된 게 없으면 첫 번째 프로젝트 자동 선택
      if (projectList && projectList.length > 0 && !formData.projectKey) {
        setFormData((prev) => ({
          ...prev,
          projectKey: projectList[0].key,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch JIRA projects:", err);
      setError(
        t(
          "jira.create.error.fetchProjects",
          "JIRA 프로젝트 목록을 불러오는데 실패했습니다.",
        ),
      );
    } finally {
      setFetchingProjects(false);
    }
  };

  // 이슈 유형 조회
  const fetchIssueTypes = async (projectKey) => {
    setFetchingTypes(true);
    try {
      const types = await jiraService.getIssueTypes(projectKey);
      setIssueTypes(types || []);

      // 이슈 유형 자동 선택 (기존 선택이 유효하지 않은 경우)
      if (types && types.length > 0) {
        const hasSelectedType = types.some(
          (t) => t.id === formData.issueTypeId,
        );
        if (!hasSelectedType) {
          setFormData((prev) => ({
            ...prev,
            issueTypeId: types[0].id,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch JIRA issue types:", err);
      setError(
        t(
          "jira.create.error.fetchIssueTypes",
          "이슈 유형을 불러오는데 실패했습니다.",
        ),
      );
    } finally {
      setFetchingTypes(false);
    }
  };

  // 템플릿 생성
  const generateTemplate = () => {
    if (!testCase) return;

    let description = "";

    // 테스트 케이스 정보
    description += `${t(
      "jira.create.template.testCase",
      "**테스트 케이스**: {name}",
    ).replace("{name}", testCase.name)}\n\n`;

    // 사전 조건
    if (testCase.preCondition) {
      description += `${t(
        "jira.create.template.preCondition",
        "### 사전 조건",
      )}\n${testCase.preCondition}\n\n`;
    }

    // 테스트 단계
    if (Array.isArray(testCase.steps) && testCase.steps.length > 0) {
      description += `${t("jira.create.template.steps", "### 테스트 단계")}\n`;
      testCase.steps.forEach((step, index) => {
        const stepNumber = step.stepNumber || index + 1;
        const action = step.description || "";
        description += `${stepNumber}. ${action}\n`;
        if (step.expectedResult) {
          description += `   - ${t(
            "jira.create.template.stepExpected",
            "예상 결과",
          )}: ${step.expectedResult}\n`;
        }
      });
      description += "\n";
    }

    // 예상 결과
    if (testCase.expectedResults) {
      description += `${t(
        "jira.create.template.expectedResult",
        "### 예상 결과",
      )}\n${testCase.expectedResults}\n\n`;
    }

    // 실제 결과 (테스트 결과 노트)
    if (testResult && testResult.notes) {
      description += `${t(
        "jira.create.template.actualResult",
        "### 실제 결과",
      )}\n${testResult.notes}\n\n`;
    }

    // 푸터
    description += `\n---\n*${t(
      "jira.comment.template.footer",
      "Test Case Manager에서 자동 생성됨",
    )}*`;

    setFormData((prev) => ({
      ...prev,
      summary: `[Test Fail] ${testCase.name}`,
      description: description,
    }));
  };

  // 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 탭 변경
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 이슈 생성 요청
  const handleCreate = async () => {
    if (!formData.summary || !formData.issueTypeId || !formData.projectKey) {
      setError(
        t("jira.create.error.fieldsRequired", "모든 필수 필드를 입력해주세요."),
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await jiraService.createIssue({
        projectKey: formData.projectKey,
        issueTypeId: formData.issueTypeId,
        summary: formData.summary,
        description: formData.description,
        testResultId: testResult ? testResult.id : null,
      });

      if (response.issueKey) {
        setSuccessData(response);
        // 3초 후 자동 닫기 또는 다른 처리
        if (onIssueCreated) {
          onIssueCreated({ key: response.issueKey });
        }
      } else {
        onClose();
      }
    } catch (err) {
      console.error("JIRA issue creation error:", err);
      setError(
        err.message ||
          t("jira.config.error.general", "JIRA 설정 중 오류가 발생했습니다"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CreateIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {t("jira.create.dialogTitle", "JIRA 이슈 생성")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {successData ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {t(
                "jira.create.success.message",
                "JIRA 이슈가 생성되었습니다",
              ).replace("{issueKey}", successData.issueKey)}
            </Typography>

            {successData.attachmentCount > 0 && (
              <Alert severity="success" sx={{ mt: 2, display: "inline-flex" }}>
                {t(
                  "jira.create.success.attachmentCount",
                  "{count}개의 첨부파일이 업로드되었습니다",
                ).replace("{count}", successData.attachmentCount)}
              </Alert>
            )}

            {successData.attachmentErrorMessage && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {t(
                  "jira.create.error.attachmentFailed",
                  "일부 첨부파일 전송 실패: {message}",
                ).replace("{message}", successData.attachmentErrorMessage)}
              </Alert>
            )}

            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<OpenInNewIcon />}
                component="a"
                href={
                  successData.browseUrl ||
                  (jiraServerUrl
                    ? `${jiraServerUrl}/browse/${successData.issueKey}`
                    : "#")
                }
                target="_blank"
                rel="noopener noreferrer"
                sx={{ flex: 1 }}
              >
                {t("jira.issue.open", "JIRA에서 열기")}
              </Button>
              <Button variant="contained" onClick={onClose} sx={{ flex: 1 }}>
                {t("jira.comment.button.close", "닫기")}
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {jiraStatus && !jiraStatus.hasConfig && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t(
                  "jira.create.error.noConfig",
                  "JIRA 연동 설정이 없습니다. 설정 페이지에서 JIRA 연동을 먼저 완료해주세요.",
                )}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl
                fullWidth
                size="small"
                disabled={fetchingProjects || loading}
              >
                <InputLabel id="jira-project-label">
                  {t("jira.create.field.project.label", "JIRA 프로젝트")}
                </InputLabel>
                <Select
                  labelId="jira-project-label"
                  name="projectKey"
                  value={formData.projectKey}
                  label={t("jira.create.field.project.label", "JIRA 프로젝트")}
                  onChange={handleChange}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.key} value={project.key}>
                      {project.name} ({project.key})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                size="small"
                disabled={fetchingTypes || loading || !formData.projectKey}
              >
                <InputLabel id="jira-issue-type-label">
                  {t("jira.create.field.issueType.label", "이슈 유형")}
                </InputLabel>
                <Select
                  labelId="jira-issue-type-label"
                  name="issueTypeId"
                  value={formData.issueTypeId}
                  label={t("jira.create.field.issueType.label", "이슈 유형")}
                  onChange={handleChange}
                >
                  {issueTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {type.name === "Bug" ? (
                          <BugIcon
                            sx={{ fontSize: 18, mr: 1, color: "error.main" }}
                          />
                        ) : type.name === "Task" ? (
                          <TaskIcon
                            sx={{ fontSize: 18, mr: 1, color: "primary.main" }}
                          />
                        ) : (
                          <InfoIcon
                            sx={{
                              fontSize: 18,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                        )}
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip
                title={t("jira.indicator.refreshTooltip", "상태 새로고침")}
              >
                <IconButton
                  onClick={() =>
                    formData.projectKey
                      ? fetchIssueTypes(formData.projectKey)
                      : fetchProjects()
                  }
                  disabled={fetchingProjects || fetchingTypes || loading}
                >
                  {fetchingProjects || fetchingTypes ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <TextField
              fullWidth
              label={t("jira.create.field.summary.label", "요약")}
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              margin="dense"
              size="small"
              required
              placeholder={t(
                "jira.create.field.summary.placeholder",
                "이슈 요약을 입력하세요",
              )}
              disabled={loading}
            />

            <Box sx={{ mt: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
              >
                <Tab label={t("jira.comment.tab.edit", "편집")} />
                <Tab label={t("jira.comment.tab.preview", "미리보기")} />
              </Tabs>

              {activeTab === 0 ? (
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label={t(
                    "jira.create.field.description.label",
                    "설명 (Markdown)",
                  )}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t(
                    "jira.create.field.description.placeholder",
                    "이슈 설명을 입력하세요",
                  )}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                    },
                  }}
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    minHeight: "315px",
                    maxHeight: "400px",
                    overflow: "auto",
                    bgcolor: "grey.50",
                  }}
                >
                  {formData.description ? (
                    <ReactMarkdown>{formData.description}</ReactMarkdown>
                  ) : (
                    <Typography
                      color="text.secondary"
                      align="center"
                      sx={{ mt: 4 }}
                    >
                      {t(
                        "jira.comment.preview.empty",
                        "미리 볼 내용이 없습니다.",
                      )}
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      {!successData && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            {t("jira.comment.button.cancel", "취소")}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={
              loading ||
              fetchingTypes ||
              !formData.summary ||
              !formData.issueTypeId
            }
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CreateIcon />
              )
            }
          >
            {loading
              ? t("jira.create.button.creating", "생성 중...")
              : t("jira.create.button.create", "이슈 생성")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default JiraIssueCreationDialog;
