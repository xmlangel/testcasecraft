import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Collapse,
} from "@mui/material";
import {
  PauseCircle as PauseCircleIcon,
  PlayCircle as PlayCircleIcon,
  StopCircle as StopCircleIcon,
  UploadFile as UploadFileIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  BugReport as BugIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

import { useTheme as useAppTheme } from "../../context/ThemeContext.jsx";
import {
  AssignmentTurnedIn as CharterIcon,
  PlayArrow as ExecutionIcon,
  Lightbulb as IdeaIcon,
  ErrorOutline as RiskIcon,
  Flag as StrategyIcon,
  CheckCircleOutline as ExitIcon,
  InfoOutlined as InfoIcon,
  NoteAltOutlined as NoteIcon,
} from "@mui/icons-material";
import {
  parseMarkdownSections,
  getSectionIcon,
} from "../../utils/exploratoryUtils";
import JiraIssueLinker from "../JiraIntegration/JiraIssueLinker.jsx";

function ExploratorySessionEditorTab({
  t,
  sessionDraft,
  setSessionDraft,
  timerStatus,
  onTimerAction,
  elapsedSec,
  pausedSec,
  formatSeconds,
  charters,
  selectedCharter,
  totalRatio,
  onUploadArtifacts,
  onDeleteArtifact,
  statusColor,
  saveSession,
  submitSession,
  savingSession,
  sessionError,
  onBackToList,
}) {
  const theme = useTheme();
  const { designSystem } = useAppTheme();
  const isDark = theme.palette.mode === "dark";
  const isGlass = designSystem === "glass";
  const [editorTab, setEditorTab] = React.useState(0);
  const charterSections = parseMarkdownSections(selectedCharter?.mission);

  // Initialize notes if empty and we have legacy notes
  React.useEffect(() => {
    if (
      (!sessionDraft.notes || sessionDraft.notes.length === 0) &&
      (sessionDraft.flowNotes ||
        sessionDraft.coverageNotes ||
        sessionDraft.oracleNotes ||
        sessionDraft.activityNotes)
    ) {
      const initialNotes = [];
      if (sessionDraft.flowNotes)
        initialNotes.push({
          title: "수행 흐름 / 시나리오",
          content: sessionDraft.flowNotes,
        });
      if (sessionDraft.coverageNotes)
        initialNotes.push({
          title: "커버리지 범위",
          content: sessionDraft.coverageNotes,
        });
      if (sessionDraft.oracleNotes)
        initialNotes.push({
          title: "테스트 오라클 / 기대 결과",
          content: sessionDraft.oracleNotes,
        });
      if (sessionDraft.activityNotes)
        initialNotes.push({
          title: "환경/설정/활동 상세",
          content: sessionDraft.activityNotes,
        });

      if (initialNotes.length > 0) {
        setSessionDraft((prev) => ({ ...prev, notes: initialNotes }));
      }
    }

    // 기존에 저장된 노트들은 기본적으로 접힌 상태로 시작 (요청 사항: 저장된 세션은 닫힘처리)
    if (sessionDraft.notes && sessionDraft.notes.length > 0) {
      const initialCollapsed = {};
      sessionDraft.notes.forEach((_, idx) => {
        initialCollapsed[idx] = true;
      });
      setCollapsedIndices(initialCollapsed);
    }
  }, [sessionDraft.id]); // 세션 ID가 바뀔 때(즉 다른 세션을 열 때) 초기화

  const debounceTimerRef = React.useRef(null);
  const [collapsedIndices, setCollapsedIndices] = React.useState({});

  const toggleNoteCollapse = (index) => {
    setCollapsedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddNote = () => {
    const newNotes = [
      ...(sessionDraft.notes || []),
      { title: "", content: "" },
    ];
    const newDraft = { ...sessionDraft, notes: newNotes };
    setSessionDraft(newDraft);
    saveSession(newDraft, true);
    // 새 노트는 펼쳐진 상태로 추가
    setCollapsedIndices((prev) => ({ ...prev, [newNotes.length - 1]: false }));
  };

  const handleUpdateNote = (index, field, value) => {
    const newNotes = [...(sessionDraft.notes || [])];
    newNotes[index] = { ...newNotes[index], [field]: value };
    const newDraft = { ...sessionDraft, notes: newNotes };
    setSessionDraft(newDraft);

    // Debounce Save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      saveSession(newDraft, true);
    }, 1500);
  };

  const handleDeleteNote = (index) => {
    const newNotes = (sessionDraft.notes || []).filter((_, i) => i !== index);
    const newDraft = { ...sessionDraft, notes: newNotes };
    setSessionDraft(newDraft);
    saveSession(newDraft, true);
  };

  const handleAddTest = () => {
    setSessionDraft((prev) => ({
      ...prev,
      tests: [
        ...(prev.tests || []),
        { title: "", steps: "", expectedResult: "", status: "UNTESTED" },
      ],
    }));
  };

  const handleUpdateTest = (index, field, value) => {
    setSessionDraft((prev) => {
      const newTests = [...(prev.tests || [])];
      newTests[index] = { ...newTests[index], [field]: value };
      return { ...prev, tests: newTests };
    });
  };

  const handleDeleteTest = (index) => {
    setSessionDraft((prev) => ({
      ...prev,
      tests: (prev.tests || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddBug = () => {
    setSessionDraft((prev) => ({
      ...prev,
      bugs: [
        ...(prev.bugs || []),
        { title: "", description: "", severity: "Medium", jiraIssueKey: "" },
      ],
    }));
  };

  const handleUpdateBug = (index, field, value) => {
    setSessionDraft((prev) => {
      const newBugs = [...(prev.bugs || [])];
      newBugs[index] = { ...newBugs[index], [field]: value };
      return { ...prev, bugs: newBugs };
    });
  };

  const handleDeleteBug = (index) => {
    setSessionDraft((prev) => ({
      ...prev,
      bugs: (prev.bugs || []).filter((_, i) => i !== index),
    }));
  };

  const sessionStatusChip = (
    <Chip
      label={t(
        `exploratory.session.status.${
          sessionDraft.status === "NEEDS_UPDATE"
            ? "needsUpdate"
            : sessionDraft.status.toLowerCase()
        }`,
        sessionDraft.status === "DRAFT"
          ? "작성 중"
          : sessionDraft.status === "RUNNING"
            ? "수행 중"
            : sessionDraft.status === "PAUSED"
              ? "일시 정지"
              : sessionDraft.status === "COMPLETED"
                ? "수행 완료"
                : sessionDraft.status === "SUBMITTED"
                  ? "제출됨"
                  : sessionDraft.status === "APPROVED"
                    ? "승인됨"
                    : sessionDraft.status === "ARCHIVED"
                      ? "보관됨"
                      : sessionDraft.status === "NEEDS_UPDATE"
                        ? "보완 필요"
                        : sessionDraft.status,
      )}
      color={statusColor[sessionDraft.status] || "default"}
      size="small"
    />
  );

  return (
    <Stack spacing={3}>
      {/* Premium Timer / Control Bar */}
      <Card
        sx={{
          bgcolor: isGlass
            ? isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.5)"
            : "background.paper",
          backdropFilter: isGlass ? "blur(20px)" : "none",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: isGlass ? 4 : 2,
          boxShadow: isGlass
            ? isDark
              ? "0 8px 32px rgba(0,0,0,0.2)"
              : "0 8px 32px rgba(6, 182, 212, 0.1)"
            : theme.shadows[1],
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor:
                      timerStatus === "running" ? "success.main" : "grey.800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      timerStatus === "running"
                        ? "0 0 20px rgba(46, 125, 50, 0.5)"
                        : "none",
                    animation:
                      timerStatus === "running" ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)", opacity: 1 },
                      "50%": { transform: "scale(1.05)", opacity: 0.8 },
                      "100%": { transform: "scale(1)", opacity: 1 },
                    },
                  }}
                >
                  <PlayCircleIcon sx={{ fontSize: 32, color: "white" }} />
                </Box>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: isDark
                        ? "rgba(255,255,255,0.5)"
                        : "text.secondary",
                      fontWeight: 700,
                    }}
                  >
                    {t("exploratory.editor.timer.currentStatus", "세션 상태")}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {formatSeconds(elapsedSec)}
                    </Typography>
                    {sessionStatusChip}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent={{ xs: "center", md: "flex-end" }}
                  sx={{ gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<PlayCircleIcon />}
                    onClick={() => onTimerAction("start")}
                    disabled={timerStatus === "running"}
                    sx={{
                      borderRadius: 2,
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "divider",
                      color: isDark ? "white" : "text.primary",
                    }}
                  >
                    {t("exploratory.editor.timer.start", "시작")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PauseCircleIcon />}
                    onClick={() => onTimerAction("pause")}
                    disabled={timerStatus !== "running"}
                    sx={{
                      borderRadius: 2,
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "divider",
                      color: isDark ? "white" : "text.primary",
                    }}
                  >
                    {t("exploratory.editor.timer.pause", "일시정지")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PlayCircleIcon />}
                    onClick={() => onTimerAction("resume")}
                    disabled={
                      timerStatus !== "paused" &&
                      timerStatus !== "ended" &&
                      sessionDraft.status !== "COMPLETED"
                    }
                    sx={{
                      borderRadius: 2,
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "divider",
                      color: isDark ? "white" : "text.primary",
                    }}
                  >
                    {t("exploratory.editor.timer.resume", "재개")}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopCircleIcon />}
                    onClick={() => onTimerAction("end")}
                    disabled={
                      (timerStatus !== "running" &&
                        timerStatus !== "paused" &&
                        sessionDraft.status !== "DRAFT" &&
                        sessionDraft.status !== "RUNNING") ||
                      timerStatus === "ended"
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    {t("exploratory.editor.timer.end", "종료")}
                  </Button>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      mx: 1,
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "divider",
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => saveSession()}
                    disabled={savingSession}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                  >
                    {savingSession
                      ? t("common.saving", "Saving...")
                      : t("common.save", "저장")}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => submitSession()}
                    disabled={
                      savingSession ||
                      (sessionDraft.status !== "DRAFT" &&
                        sessionDraft.status !== "COMPLETED" &&
                        sessionDraft.status !== "NEEDS_UPDATE")
                    }
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 700,
                      boxShadow: "0 4px 14px 0 rgba(76, 175, 80, 0.39)",
                    }}
                  >
                    {t("exploratory.editor.btn.submit", "제출")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onBackToList}
                    sx={{
                      borderRadius: 2,
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "divider",
                      color: isDark
                        ? "rgba(255,255,255,0.7)"
                        : "text.secondary",
                      "&:hover": {
                        borderColor: isDark ? "white" : "primary.main",
                        color: isDark ? "white" : "primary.main",
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "action.hover",
                      },
                    }}
                  >
                    {t("exploratory.editor.btn.backToList", "목록보기")}
                  </Button>
                </Stack>

                {/* New Session Progress Visualizer */}
                {sessionDraft.id && sessionDraft.netDurationMinutes > 0 && (
                  <Box sx={{ px: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: "warning.light",
                          letterSpacing: 1,
                        }}
                      >
                        {t(
                          "exploratory.editor.timer.progress",
                          "TIME ALLOCATION VISUALIZER",
                        )}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, opacity: 0.8 }}
                      >
                        {Math.round(
                          (elapsedSec /
                            (sessionDraft.netDurationMinutes * 60)) *
                            100,
                        )}
                        % (Target: {sessionDraft.netDurationMinutes}m)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        100,
                        (elapsedSec / (sessionDraft.netDurationMinutes * 60)) *
                          100,
                      )}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          background:
                            elapsedSec /
                              (sessionDraft.netDurationMinutes * 60) >=
                            1
                              ? "linear-gradient(90deg, #ff5252 0%, #f44336 100%)"
                              : elapsedSec /
                                    (sessionDraft.netDurationMinutes * 60) >=
                                  0.8
                                ? "linear-gradient(90deg, #ffa726 0%, #f57c00 100%)"
                                : "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)",
                          boxShadow:
                            elapsedSec /
                              (sessionDraft.netDurationMinutes * 60) >=
                            1
                              ? "0 0 10px rgba(244, 67, 54, 0.5)"
                              : "none",
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
          {sessionError && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(211, 47, 47, 0.1)" : "error.light",
                color: isDark ? "#ffcdd2" : "error.contrastText",
              }}
            >
              {sessionError}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tab Navigation Section */}
      <Tabs
        value={editorTab}
        onChange={(_, value) => setEditorTab(value)}
        sx={{
          px: 2,
          "& .MuiTabs-indicator": { height: 4, borderRadius: "2px 2px 0 0" },
          "& .MuiTab-root": {
            color: isDark ? "rgba(255,255,255,0.4)" : "text.secondary",
            fontWeight: 700,
            "&.Mui-selected": { color: isDark ? "white" : "primary.main" },
          },
        }}
      >
        <Tab
          data-testid="exploratory-editor-tab-basic"
          label={t("exploratory.editor.tab.basic", "기본 정보")}
        />
        <Tab
          data-testid="exploratory-editor-tab-recording"
          label={t("exploratory.editor.tab.recording", "세션 기록")}
        />
      </Tabs>

      {editorTab === 0 && (
        <Grid container spacing={3}>
          {/* Left Panel: Basic Config & Time Distribution */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Stack spacing={3}>
              <Card
                sx={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: "primary.light",
                      opacity: 0.8,
                    }}
                  >
                    {t(
                      "exploratory.editor.section.sessionConfig",
                      "SESSION CONFIGURATION",
                    )}
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Environment"
                        value={sessionDraft.environmentSummary || ""}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            environmentSummary: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.02)",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label={t(
                          "exploratory.editor.field.netDuration",
                          "목표 수행 시간 (분)",
                        )}
                        type="number"
                        value={sessionDraft.netDurationMinutes || ""}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            netDurationMinutes: parseInt(e.target.value) || 0,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.02)",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Product Version"
                        value={sessionDraft.productVersion || ""}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            productVersion: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.02)",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        required
                        label={t(
                          "exploratory.editor.field.title",
                          "Session Title",
                        )}
                        value={sessionDraft.title || ""}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.02)",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormControl fullWidth>
                        <InputLabel>Assigned Test Charter</InputLabel>
                        <Select
                          value={sessionDraft.charterId}
                          label="Assigned Test Charter"
                          onChange={(e) => {
                            const charterId = e.target.value;
                            const charter = charters.find(
                              (c) => c.id === charterId,
                            );
                            setSessionDraft((prev) => ({
                              ...prev,
                              charterId,
                              title:
                                prev.title ||
                                (charter ? `${charter.title} - Session` : ""),
                            }));
                          }}
                          sx={{
                            bgcolor: isDark
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(0,0,0,0.02)",
                            borderRadius: 2,
                          }}
                        >
                          {charters.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Strategy Tags (Comma separated)"
                        placeholder="Security, Performance, UI/UX..."
                        value={(sessionDraft.strategyTags || []).join(", ")}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            strategyTags: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.02)",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: "warning.light",
                      opacity: 0.8,
                    }}
                  >
                    {t(
                      "exploratory.editor.section.timeDistribution",
                      "테스트 활동 배분",
                    )}
                  </Typography>

                  {/* Visualization Bar */}
                  <Box sx={{ mb: 4, mt: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        height: 48,
                        display: "flex",
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                        border: "1px solid",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "divider",
                        boxShadow: isDark
                          ? "inset 0 2px 10px rgba(0,0,0,0.2)"
                          : "none",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${sessionDraft.testExecutionPct}%`,
                          bgcolor: "primary.main",
                          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {sessionDraft.testExecutionPct > 10 && (
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800 }}
                          >
                            {sessionDraft.testExecutionPct}%
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          width: `${sessionDraft.bugInvestigationPct}%`,
                          bgcolor: "error.main",
                          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {sessionDraft.bugInvestigationPct > 10 && (
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800 }}
                          >
                            {sessionDraft.bugInvestigationPct}%
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          width: `${sessionDraft.setupAdminPct}%`,
                          bgcolor: "warning.main",
                          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {sessionDraft.setupAdminPct > 10 && (
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800 }}
                          >
                            {sessionDraft.setupAdminPct}%
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                    <Stack
                      direction="row"
                      spacing={3}
                      sx={{ mt: 2 }}
                      justifyContent="center"
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Execution
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Investigation
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Setup
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Execution (%)"
                        value={sessionDraft.testExecutionPct}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            testExecutionPct: Number(e.target.value),
                          }))
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Bug Inv (%)"
                        value={sessionDraft.bugInvestigationPct}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            bugInvestigationPct: Number(e.target.value),
                          }))
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Setup (%)"
                        value={sessionDraft.setupAdminPct}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            setupAdminPct: Number(e.target.value),
                          }))
                        }
                      />
                    </Grid>
                  </Grid>
                  {totalRatio !== 100 && (
                    <Alert
                      icon={false}
                      severity="warning"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        bgcolor: isDark
                          ? "rgba(255, 167, 38, 0.1)"
                          : "warning.light",
                        color: isDark ? "#ffcc80" : "warning.contrastText",
                        border: "1px solid",
                        borderColor: isDark
                          ? "rgba(255, 167, 38, 0.2)"
                          : "divider",
                      }}
                    >
                      Total coverage is {totalRatio}%. It should ideally be
                      100%.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Panel: Structured Charter Mission */}
          <Grid size={{ xs: 12, lg: 9 }}>
            <Card
              sx={{
                height: "100%",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    color: "secondary.light",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <CharterIcon sx={{ opacity: 0.8 }} />
                  {t(
                    "exploratory.editor.charterSection.autoMission",
                    "ACTIVE CHARTER MISSION",
                  )}
                </Typography>

                <Stack spacing={2}>
                  {charterSections.length > 0 ? (
                    charterSections.map((section, idx) => {
                      const iconTag = getSectionIcon(section.title);
                      let Icon = CharterIcon;
                      if (iconTag === "objective") Icon = CharterIcon;
                      else if (iconTag === "scope") Icon = ExecutionIcon;
                      else if (iconTag === "idea") Icon = IdeaIcon;
                      else if (iconTag === "risk") Icon = RiskIcon;
                      else if (iconTag === "strategy") Icon = StrategyIcon;
                      else if (iconTag === "exit") Icon = ExitIcon;
                      else if (iconTag === "info") Icon = InfoIcon;
                      else if (iconTag === "note") Icon = NoteIcon;

                      return (
                        <Box
                          key={idx}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: isDark
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(0,0,0,0.02)",
                            border: "1px solid",
                            borderColor: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "divider",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: isDark
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(0,0,0,0.04)",
                              borderColor: isDark
                                ? "rgba(255,255,255,0.1)"
                                : "primary.main",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{ mb: 1.5 }}
                          >
                            <Box
                              sx={{
                                p: 0.75,
                                borderRadius: 1.5,
                                bgcolor: "rgba(25, 118, 210, 0.1)",
                                display: "flex",
                              }}
                            >
                              <Icon
                                sx={{ fontSize: "1.1rem" }}
                                color="primary"
                              />
                            </Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                            >
                              {section.title.toUpperCase()}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            color={
                              isDark ? "rgba(255,255,255,0.7)" : "text.primary"
                            }
                            sx={{
                              pl: 1,
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.6,
                            }}
                          >
                            {section.content}
                          </Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ py: 12, textAlign: "center", opacity: 0.2 }}>
                      <CharterIcon sx={{ fontSize: 64, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No Charter Assigned
                      </Typography>
                      <Typography variant="body2">
                        Select a charter from the configuration panel.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {editorTab === 1 && (
        <Grid container spacing={3}>
          {/* Left Column: Notes & Issues */}
          <Grid size={12}>
            <Stack spacing={3}>
              {/* Dynamic Notes Section */}
              <Card
                sx={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: "primary.light",
                        opacity: 0.8,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <NoteIcon />
                      {t(
                        "exploratory.editor.notes.title",
                        "TEST EXECUTION LOGS (NOTES)",
                      )}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddNote}
                      sx={{ borderRadius: 2 }}
                    >
                      {t("common.add", "추가")}
                    </Button>
                  </Box>

                  <Stack spacing={3}>
                    {(sessionDraft.notes || []).map((note, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.02)",
                          border: "1px solid",
                          borderColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "divider",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ mb: 2 }}
                          alignItems="center"
                        >
                          <TextField
                            fullWidth
                            size="small"
                            label={t("common.title", "제목")}
                            value={note.title}
                            onChange={(e) =>
                              handleUpdateNote(index, "title", e.target.value)
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => toggleNoteCollapse(index)}
                            sx={{
                              bgcolor: isDark
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.05)",
                            }}
                          >
                            {collapsedIndices[index] ? (
                              <ExpandMoreIcon />
                            ) : (
                              <ExpandLessIcon />
                            )}
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteNote(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                        <Collapse in={!collapsedIndices[index]}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label={t("common.content", "내용")}
                            value={note.content}
                            onChange={(e) =>
                              handleUpdateNote(index, "content", e.target.value)
                            }
                          />
                        </Collapse>
                      </Box>
                    ))}
                    {(sessionDraft.notes || []).length === 0 && (
                      <Box
                        sx={{
                          py: 4,
                          textAlign: "center",
                          opacity: 0.5,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">
                          {t(
                            "exploratory.editor.notes.empty",
                            "노트가 없습니다. 추가 버튼을 눌러 기록을 시작하세요.",
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Dynamic Tests Section */}
              <Card
                sx={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: "success.light",
                        opacity: 0.8,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ExitIcon />
                      {t("exploratory.editor.tests.title", "STRUCTURED TESTS")}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddTest}
                      sx={{ borderRadius: 2 }}
                    >
                      {t("common.add", "추가")}
                    </Button>
                  </Box>

                  <Stack spacing={3}>
                    {(sessionDraft.tests || []).map((test, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.02)",
                          border: "1px solid",
                          borderColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "divider",
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label={t("common.title", "테스트 제목")}
                            value={test.title}
                            onChange={(e) =>
                              handleUpdateTest(index, "title", e.target.value)
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={test.status}
                              onChange={(e) =>
                                handleUpdateTest(
                                  index,
                                  "status",
                                  e.target.value,
                                )
                              }
                            >
                              <MenuItem value="UNTESTED">Untested</MenuItem>
                              <MenuItem value="PASS">Pass</MenuItem>
                              <MenuItem value="FAIL">Fail</MenuItem>
                              <MenuItem value="BLOCK">Block</MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteTest(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              label={t("common.steps", "테스트 절차")}
                              value={test.steps}
                              onChange={(e) =>
                                handleUpdateTest(index, "steps", e.target.value)
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              label={t("common.expectedResult", "기대 결과")}
                              value={test.expectedResult}
                              onChange={(e) =>
                                handleUpdateTest(
                                  index,
                                  "expectedResult",
                                  e.target.value,
                                )
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    {(sessionDraft.tests || []).length === 0 && (
                      <Box
                        sx={{
                          py: 4,
                          textAlign: "center",
                          opacity: 0.5,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">
                          {t(
                            "exploratory.editor.tests.empty",
                            "등록된 테스트가 없습니다.",
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Dynamic Bugs Section */}
              <Card
                sx={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: "error.light",
                        opacity: 0.8,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BugIcon />
                      {t(
                        "exploratory.editor.bugs.title",
                        "FOUND BUGS / DEFECTS",
                      )}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddBug}
                      sx={{ borderRadius: 2 }}
                    >
                      {t("common.add", "추가")}
                    </Button>
                  </Box>

                  <Stack spacing={3}>
                    {(sessionDraft.bugs || []).map((bug, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.02)",
                          border: "1px solid",
                          borderColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "divider",
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label={t("common.title", "버그 제목")}
                            value={bug.title}
                            onChange={(e) =>
                              handleUpdateBug(index, "title", e.target.value)
                            }
                            sx={{ flexGrow: 1 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={bug.severity}
                              onChange={(e) =>
                                handleUpdateBug(
                                  index,
                                  "severity",
                                  e.target.value,
                                )
                              }
                            >
                              <MenuItem value="Low">Low</MenuItem>
                              <MenuItem value="Medium">Medium</MenuItem>
                              <MenuItem value="High">High</MenuItem>
                              <MenuItem value="Critical">Critical</MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteBug(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label={t("common.description", "버그 설명")}
                          value={bug.description}
                          onChange={(e) =>
                            handleUpdateBug(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="JIRA Issue Key (Optional)"
                          value={bug.jiraIssueKey}
                          onChange={(e) =>
                            handleUpdateBug(
                              index,
                              "jiraIssueKey",
                              e.target.value,
                            )
                          }
                        />
                      </Box>
                    ))}
                    {(sessionDraft.bugs || []).length === 0 && (
                      <Box
                        sx={{
                          py: 4,
                          textAlign: "center",
                          opacity: 0.5,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">
                          {t(
                            "exploratory.editor.bugs.empty",
                            "발견된 버그가 없습니다.",
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* JIRA Issue Linker Section */}
              <Card
                sx={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: "error.light",
                      opacity: 0.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <BugIcon />
                    {t(
                      "exploratory.editor.issue.title",
                      "DEFECTS & JIRA INTEGRATION",
                    )}
                  </Typography>

                  <JiraIssueLinker
                    projectId={sessionDraft.projectId}
                    issueKey={sessionDraft.jiraIssueKey}
                    onLinkIssue={(key) =>
                      setSessionDraft((prev) => ({
                        ...prev,
                        jiraIssueKey: key,
                      }))
                    }
                    onUnlinkIssue={() =>
                      setSessionDraft((prev) => ({ ...prev, jiraIssueKey: "" }))
                    }
                  />
                </CardContent>
              </Card>

              {/* Artifacts Section */}
              <Card
                sx={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "background.paper",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <UploadFileIcon sx={{ opacity: 0.7 }} />
                    {t(
                      "exploratory.editor.artifact.title",
                      "데이터 및 증적 (Artifacts)",
                    )}
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="테스트 데이터"
                    placeholder="사용한 테스트 데이터 정보..."
                    value={sessionDraft.testData}
                    onChange={(e) =>
                      setSessionDraft((prev) => ({
                        ...prev,
                        testData: e.target.value,
                      }))
                    }
                    sx={{ mb: 3 }}
                  />

                  <Box
                    sx={{
                      p: 3,
                      border: "2px dashed",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "divider",
                      borderRadius: 3,
                      textAlign: "center",
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.02)",
                      mb: 3,
                    }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadFileIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      {t(
                        "exploratory.editor.artifact.upload",
                        "증적 파일 선택",
                      )}
                      <input
                        hidden
                        type="file"
                        multiple
                        onChange={onUploadArtifacts}
                      />
                    </Button>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1, opacity: 0.5 }}
                    >
                      이미지, 로그 파일 등을 업로드하세요.
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {(sessionDraft.attachments || []).length > 0 ? (
                      (sessionDraft.attachments || []).map((file) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                          <Card
                            sx={{
                              bgcolor: isDark
                                ? "rgba(255,255,255,0.05)"
                                : "background.paper",
                              border: "1px solid",
                              borderColor: isDark
                                ? "rgba(255,255,255,0.1)"
                                : "divider",
                              borderRadius: 2,
                              position: "relative",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => onDeleteArtifact(file.id)}
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                bgcolor: "rgba(0,0,0,0.5)",
                                color: "white",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                zIndex: 1,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <CardContent sx={{ p: 1.5 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <NoteIcon fontSize="small" color="primary" />
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{ fontWeight: 700, flexGrow: 1 }}
                                >
                                  {file.originalFileName}
                                </Typography>
                              </Box>
                              {file.mimeType &&
                                file.mimeType.startsWith("image/") && (
                                  <Box
                                    component="img"
                                    src={`/api/session-attachments/${file.id}/download`}
                                    sx={{
                                      width: "100%",
                                      height: 120,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                      border: "1px solid rgba(255,255,255,0.1)",
                                    }}
                                  />
                                )}
                              {!file.mimeType?.startsWith("image/") && (
                                <Box
                                  sx={{
                                    height: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "rgba(0,0,0,0.1)",
                                    borderRadius: 1,
                                  }}
                                >
                                  <UploadFileIcon
                                    sx={{ fontSize: 48, opacity: 0.3 }}
                                  />
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid size={12}>
                        <Box sx={{ py: 2, textAlign: "center", opacity: 0.3 }}>
                          <Typography variant="caption">
                            업로드된 파일이 없습니다.
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

export default ExploratorySessionEditorTab;
