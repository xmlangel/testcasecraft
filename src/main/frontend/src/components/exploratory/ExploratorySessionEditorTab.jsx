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
} from "@mui/material";
import {
  PauseCircle as PauseCircleIcon,
  PlayCircle as PlayCircleIcon,
  StopCircle as StopCircleIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";

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
  artifacts,
  statusColor,
  saveSession,
  submitSession,
  savingSession,
  sessionError,
  onBackToList,
}) {
  const [editorTab, setEditorTab] = React.useState(0);
  const charterSections = parseMarkdownSections(selectedCharter?.mission);

  const sessionStatusChip = (
    <Chip
      label={t(
        `exploratory.session.status.${
          sessionDraft.status === "NEEDS_UPDATE"
            ? "needsUpdate"
            : sessionDraft.status.toLowerCase()
        }`,
        sessionDraft.status,
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
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
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
                    sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}
                  >
                    {t(
                      "exploratory.editor.timer.currentStatus",
                      "SESSION STATUS",
                    )}
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
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    {t("exploratory.editor.timer.start", "Start")}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PauseCircleIcon />}
                    onClick={() => onTimerAction("pause")}
                    disabled={timerStatus !== "running"}
                    sx={{
                      borderRadius: 2,
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    {t("exploratory.editor.timer.pause", "Pause")}
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
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    {t("exploratory.editor.timer.resume", "Resume")}
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
                    {t("exploratory.editor.timer.end", "End")}
                  </Button>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 1, borderColor: "rgba(255,255,255,0.1)" }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={saveSession}
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
                    onClick={submitSession}
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
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        borderColor: "white",
                        color: "white",
                        bgcolor: "rgba(255,255,255,0.05)",
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
                        bgcolor: "rgba(255,255,255,0.05)",
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
                bgcolor: "rgba(211, 47, 47, 0.1)",
                color: "#ffcdd2",
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
            color: "rgba(255,255,255,0.4)",
            fontWeight: 700,
            "&.Mui-selected": { color: "white" },
          },
        }}
      >
        <Tab
          data-testid="exploratory-editor-tab-basic"
          label={t("exploratory.editor.tab.basic", "기본 정보")}
        />
        <Tab
          data-testid="exploratory-editor-tab-notes-issues"
          label={t("exploratory.editor.tab.notesIssues", "노트/이슈")}
        />
        <Tab
          data-testid="exploratory-editor-tab-artifacts-evaluation"
          label={t("exploratory.editor.tab.artifactsEvaluation", "평가/산출물")}
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
                          "Target Duration (min)",
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
                          onChange={(e) =>
                            setSessionDraft((prev) => ({
                              ...prev,
                              charterId: e.target.value,
                            }))
                          }
                          sx={{
                            bgcolor: "rgba(255,255,255,0.02)",
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
                      "exploratory.editor.section.timeAllocation",
                      "TEST TASK DISTRIBUTION",
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
                        bgcolor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)",
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
                        bgcolor: "rgba(255, 167, 38, 0.1)",
                        color: "#ffcc80",
                        border: "1px solid rgba(255, 167, 38, 0.2)",
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
                            bgcolor: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.04)",
                              borderColor: "rgba(255,255,255,0.1)",
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
                            color="rgba(255,255,255,0.7)"
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
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
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
                      mb: 4,
                      color: "primary.light",
                      opacity: 0.8,
                    }}
                  >
                    {t(
                      "exploratory.editor.notes.title",
                      "TEST EXECUTION LOGS (NOTES)",
                    )}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="수행 흐름 / 시나리오"
                        placeholder="테스트를 수행한 주요 절차를 기록하세요."
                        value={sessionDraft.flowNotes}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            flowNotes: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.01)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="커버리지 범위"
                        placeholder="테스트된 기능, 컴포넌트, 인터페이스 목록"
                        value={sessionDraft.coverageNotes}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            coverageNotes: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.01)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="테스트 오라클 / 기대 결과"
                        placeholder="비교 기준 및 판단 근거 (문서, 정책, 경험 등)"
                        value={sessionDraft.oracleNotes}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            oracleNotes: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.01)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="환경/설정/활동 상세"
                        placeholder="특이사항, 데이터 셋업, 네트워크 조건 등"
                        value={sessionDraft.activityNotes}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            activityNotes: e.target.value,
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.01)",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
                      mb: 4,
                      color: "error.light",
                      opacity: 0.8,
                    }}
                  >
                    {t(
                      "exploratory.editor.issue.title",
                      "DEFECTS & BLOCKERS (BUGS)",
                    )}
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="버그 헤드라인 (대표 이슈)"
                      placeholder="예: 결제 모듈에서 간헐적 타임아웃 발생"
                      value={sessionDraft.bugHeadline}
                      onChange={(e) =>
                        setSessionDraft((prev) => ({
                          ...prev,
                          bugHeadline: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="테스트 방해 요소 (Blockers)"
                      placeholder="테스트 수행을 어렵게 한 리스크나 장애"
                      value={sessionDraft.blockers}
                      onChange={(e) =>
                        setSessionDraft((prev) => ({
                          ...prev,
                          blockers: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="남은 질문 / 추가 조사 필요"
                      placeholder="추후 확인이 필요한 모호한 동작이나 질문"
                      value={sessionDraft.remainingQuestions}
                      onChange={(e) =>
                        setSessionDraft((prev) => ({
                          ...prev,
                          remainingQuestions: e.target.value,
                        }))
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      {editorTab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>
                  {t(
                    "exploratory.editor.artifact.title",
                    "데이터 및 증적 (Artifacts)",
                  )}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="테스트 데이터"
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
                    p: 4,
                    border: "2px dashed rgba(255,255,255,0.1)",
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: "rgba(255,255,255,0.02)",
                    mb: 3,
                  }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {t("exploratory.editor.artifact.upload", "증적 파일 선택")}
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
                    이미지, 로그 파일 등을 드래그하거나 선택하여 업로드하세요.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {(artifacts || []).length > 0 ? (
                    (artifacts || []).map((file) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                        <Card
                          sx={{
                            bgcolor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 2,
                          }}
                        >
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
                                {file.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.5 }}
                              >
                                {Math.ceil(file.size / 1024)}KB
                              </Typography>
                            </Box>
                            {file.type && file.type.startsWith("image/") && (
                              <Box
                                component="img"
                                src={file.url}
                                sx={{
                                  width: "100%",
                                  borderRadius: 1,
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid size={12}>
                      <Box sx={{ py: 6, textAlign: "center", opacity: 0.2 }}>
                        <Typography variant="body2">
                          No artifacts uploaded yet.
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
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
                    mb: 4,
                    color: "success.light",
                    opacity: 0.8,
                  }}
                >
                  {t(
                    "exploratory.editor.evaluation.title",
                    "SESSION EVALUATION",
                  )}
                </Typography>
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      display="block"
                      sx={{
                        mb: 2,
                        fontWeight: 800,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Charter Achievement</span>
                      <span style={{ color: "#4caf50" }}>
                        {sessionDraft.achievement}%
                      </span>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={sessionDraft.achievement}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: "rgba(255,255,255,0.05)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 6,
                          background:
                            "linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)",
                        },
                      }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    label="Overall Session Evaluation"
                    placeholder="차터 달성 여부 및 테스팅 총평..."
                    value={sessionDraft.evaluation}
                    onChange={(e) =>
                      setSessionDraft((prev) => ({
                        ...prev,
                        evaluation: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="Proposed Next Charter"
                    placeholder="다음 단계에서 탐색이 필요한 영역..."
                    value={sessionDraft.nextCharter}
                    onChange={(e) =>
                      setSessionDraft((prev) => ({
                        ...prev,
                        nextCharter: e.target.value,
                      }))
                    }
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

export default ExploratorySessionEditorTab;
