import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Avatar,
  Tooltip,
  useTheme,
  Button,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Description as CharterIcon,
  BugReport as BugIcon,
  Settings as SetupIcon,
  PlayArrow as ExecutionIcon,
  HelpOutline as QuestionIcon,
  Lightbulb as IdeaIcon,
  ErrorOutline as RiskIcon,
  Flag as StrategyIcon,
  CheckCircleOutline as ExitIcon,
  InfoOutlined as InfoIcon,
  NoteAltOutlined as NoteIcon,
  History as HistoryIcon,
  Layers as LayersIcon,
  Visibility as OracleIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useTheme as useAppTheme } from "../../context/ThemeContext.jsx";
import {
  parseMarkdownSections,
  getSectionIcon,
} from "../../utils/exploratoryUtils";

function ExploratoryDetailTab({
  t,
  sessionId,
  sessions,
  charters,
  statusColor,
  onBackToList,
}) {
  const theme = useTheme();
  const { designSystem } = useAppTheme();
  const isDark = theme.palette.mode === "dark";
  const isGlass = designSystem === "glass";
  const session = sessions.find((s) => s.id === sessionId);

  if (!sessionId || !session) {
    return (
      <Box sx={{ py: 12, textAlign: "center", opacity: 0.5 }}>
        <HistoryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t("exploratory.detail.empty", "Select a session to view details")}
        </Typography>
      </Box>
    );
  }

  const raw = session.raw || {};
  const charter = charters.find((c) => c.id === session.charterId);
  const color = statusColor[session.status] || "default";
  const charterSections = parseMarkdownSections(charter?.mission);

  // Time Ratios for visualization
  const executionPct = raw.testExecutionPct || 0;
  const investigationPct = raw.bugInvestigationPct || 0;
  const setupPct = raw.setupAdminPct || 0;

  return (
    <Stack spacing={4}>
      {/* Premium Header Summary Card */}
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
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 56,
                      height: 56,
                      boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)",
                    }}
                  >
                    <HistoryIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, letterSpacing: -0.5 }}
                    >
                      {session.title}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <Chip
                        label={t(
                          `exploratory.session.status.${
                            session.status === "NEEDS_UPDATE"
                              ? "needsUpdate"
                              : session.status.toLowerCase()
                          }`,
                          session.status === "DRAFT"
                            ? "작성 중"
                            : session.status === "RUNNING"
                              ? "수행 중"
                              : session.status === "PAUSED"
                                ? "일시 정지"
                                : session.status === "COMPLETED"
                                  ? "수행 완료"
                                  : session.status === "SUBMITTED"
                                    ? "제출됨"
                                    : session.status === "APPROVED"
                                      ? "승인됨"
                                      : session.status === "ARCHIVED"
                                        ? "보관됨"
                                        : session.status === "NEEDS_UPDATE"
                                          ? "보완 필요"
                                          : session.status,
                        )}
                        color={color}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>
                        ID: {session.id} • Created at{" "}
                        {raw.startedAt?.slice(0, 10)}
                      </Typography>
                    </Stack>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={onBackToList}
                    sx={{
                      ml: "auto",
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
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="overline"
                        sx={{ opacity: 0.5, fontWeight: 700, lineHeight: 1 }}
                      >
                        {t("exploratory.session.filter.tester", "테스터")}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon
                          sx={{ fontSize: 18, color: "primary.light" }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {session.tester}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="overline"
                        sx={{ opacity: 0.5, fontWeight: 700, lineHeight: 1 }}
                      >
                        {t("common.duration", "수행 시간")}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimeIcon
                          sx={{ fontSize: 18, color: "warning.light" }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {session.durationMin} min
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="overline"
                        sx={{ opacity: 0.5, fontWeight: 700, lineHeight: 1 }}
                      >
                        {t("exploratory.editor.field.version", "버전")}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {raw.productVersion || "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="overline"
                        sx={{ opacity: 0.5, fontWeight: 700, lineHeight: 1 }}
                      >
                        {t("exploratory.editor.field.environment", "환경")}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, noWrap: true }}
                      >
                        {raw.environmentSummary || "Default"}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
                  position: "relative",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: "warning.light",
                    opacity: 0.8,
                    textAlign: "center",
                  }}
                >
                  {t(
                    "exploratory.editor.section.timeDistribution",
                    "실제 테스트 활동 배분",
                  )}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    height: 40,
                    display: "flex",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                    border: "1px solid",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "divider",
                    mb: 2,
                  }}
                >
                  <Tooltip title={`Execution: ${executionPct}%`}>
                    <Box
                      sx={{
                        width: `${executionPct}%`,
                        bgcolor: "primary.main",
                        transition: "all 0.5s ease",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={`Investigation: ${investigationPct}%`}>
                    <Box
                      sx={{
                        width: `${investigationPct}%`,
                        bgcolor: "error.main",
                        transition: "all 0.5s ease",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={`Setup: ${setupPct}%`}>
                    <Box
                      sx={{
                        width: `${setupPct}%`,
                        bgcolor: "warning.main",
                        transition: "all 0.5s ease",
                      }}
                    />
                  </Tooltip>
                </Paper>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ px: 1 }}
                >
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, color: "primary.light" }}
                    >
                      EXE
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, color: "error.light" }}
                    >
                      INV
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, color: "warning.light" }}
                    >
                      SET
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column: Session Content */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* Notes Section */}
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
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "primary.light",
                  }}
                >
                  <NoteIcon />
                  {t("exploratory.debrief.section.notes", "세션 수행 로그")}
                </Typography>

                <Grid container spacing={3}>
                  {(raw.notes || []).length > 0 ? (
                    (raw.notes || []).map((note, idx) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: isDark
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(0,0,0,0.02)",
                            border: "1px solid",
                            borderColor: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "divider",
                            height: "100%",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1.5, opacity: 0.6 }}
                          >
                            <NoteIcon fontSize="small" />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                            >
                              {note.title.toUpperCase()}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              color: isDark
                                ? "rgba(255,255,255,0.8)"
                                : "text.primary",
                              lineHeight: 1.6,
                            }}
                          >
                            {note.content || "-"}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid size={12}>
                      <Box sx={{ py: 4, textAlign: "center", opacity: 0.3 }}>
                        <Typography variant="body2">
                          {t("exploratory.notes.empty", "No session notes recorded")}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Tests Performed Section */}
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
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "success.light",
                  }}
                >
                  <ExitIcon />
                  {t(
                    "exploratory.debrief.section.tests",
                    "수행된 구조화된 테스트",
                  )}
                </Typography>
                <Stack spacing={2}>
                  {(raw.tests || []).length > 0 ? (
                    (raw.tests || []).map((test, idx) => (
                      <Box
                        key={idx}
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
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, color: "success.light" }}
                          >
                            {test.title || `Test ${idx + 1}`}
                          </Typography>
                          <Chip
                            label={test.status}
                            size="small"
                            color={
                              test.status === "PASS"
                                ? "success"
                                : test.status === "FAIL"
                                  ? "error"
                                  : "default"
                            }
                          />
                        </Stack>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ opacity: 0.5 }}
                            >
                              Steps:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {test.steps || "-"}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ opacity: 0.5 }}
                            >
                              Expected Result:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {test.expectedResult || "-"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.3, textAlign: "center", py: 2 }}
                    >
                      {t("exploratory.tests.empty", "No structured tests performed")}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Detailed Bugs Section */}
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
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "error.light",
                  }}
                >
                  <BugIcon />
                  {t("exploratory.debrief.section.bugs", "상세 버그 및 결함")}
                </Typography>
                <Stack spacing={2}>
                  {(raw.bugs || []).length > 0 ? (
                    (raw.bugs || []).map((bug, idx) => (
                      <Box
                        key={idx}
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
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, color: "error.light" }}
                          >
                            {bug.title || `Bug ${idx + 1}`}
                          </Typography>
                          <Chip
                            label={bug.severity}
                            size="small"
                            color={
                              bug.severity === "Critical" ||
                              bug.severity === "High"
                                ? "error"
                                : "warning"
                            }
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, whiteSpace: "pre-wrap" }}
                        >
                          {bug.description}
                        </Typography>
                        {bug.jiraIssueKey && (
                          <Chip
                            label={bug.jiraIssueKey}
                            size="small"
                            icon={<LinkIcon />}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.3, textAlign: "center", py: 2 }}
                    >
                      {t("exploratory.bugs.empty", "No detailed bugs found")}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Data Outputs & Artifacts Section */}
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
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <CharterIcon />
                  {t(
                    "exploratory.debrief.section.artifacts",
                    "데이터 산출물 및 증적",
                  )}
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        opacity: 0.5,
                        display: "block",
                        mb: 1,
                      }}
                    >
                      TEST DATA USED
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.02)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {raw.testData || t("exploratory.testData.empty", "No test data recorded")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        opacity: 0.5,
                        display: "block",
                        mb: 1,
                      }}
                    >
                      ATTACHED FILES
                    </Typography>
                    {(raw.attachments || []).length > 0 ? (
                      <Grid container spacing={2}>
                        {(raw.attachments || []).map((file) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: isDark
                                  ? "rgba(255,255,255,0.02)"
                                  : "background.paper",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{ fontWeight: 700 }}
                              >
                                {file.originalFileName}
                              </Typography>
                              {file.mimeType &&
                                file.mimeType.startsWith("image/") && (
                                  <Box
                                    component="img"
                                    src={`/api/session-attachments/${file.id}/download`}
                                    sx={{
                                      width: "100%",
                                      height: 100,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                    }}
                                  />
                                )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.3 }}>
                        {t("exploratory.artifacts.empty", "No uploaded artifacts")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Defects & Evaluation Area */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: "100%",
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
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BugIcon /> LINKED JIRA ISSUES
                    </Typography>
                    <Stack spacing={2.5}>
                      {raw.jiraIssueKey ? (
                        <Box sx={{ mt: 1 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {raw.jiraIssueKey.split(",").map((key) => (
                              <Chip
                                key={key}
                                icon={
                                  <LinkIcon
                                    sx={{ fontSize: "1rem !important" }}
                                  />
                                }
                                label={key.trim()}
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ fontWeight: 800, mb: 1 }}
                                component="a"
                                href={`https://xmlangel.atlassian.net/browse/${key.trim()}`}
                                target="_blank"
                                clickable
                              />
                            ))}
                          </Stack>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ opacity: 0.3 }}>
                          연결된 JIRA 이슈가 없습니다.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: "100%",
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
                        color: "success.light",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ExitIcon /> EVALUATION
                    </Typography>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            opacity: 0.5,
                            display: "block",
                            mb: 1,
                          }}
                        >
                          CHARTER ACHIEVEMENT
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={raw.achievement || 0}
                            sx={{
                              flexGrow: 1,
                              height: 10,
                              borderRadius: 5,
                              bgcolor: isDark
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.05)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                                background:
                                  "linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)",
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {raw.achievement || 0}%
                          </Typography>
                        </Stack>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            opacity: 0.5,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          OVERALL ASSESSMENT
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                        >
                          "{raw.evaluation || "No evaluation recorded."}"
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* Right Column: Original Charter Reference */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            sx={{
              height: "100%",
              background: isDark
                ? "rgba(255,255,255,0.02)"
                : "background.paper",
              borderRadius: 3,
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.05)" : "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
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
                <CharterIcon sx={{ opacity: 0.6 }} />
                ORIGINAL CHARTER MISSION
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
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? "rgba(255,255,255,0.01)"
                            : "rgba(0,0,0,0.01)",
                          border: "1px solid",
                          borderColor: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "divider",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Icon
                            sx={{
                              fontSize: "1rem",
                              color: "primary.main",
                              opacity: 0.8,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 1,
                              opacity: 0.7,
                            }}
                          >
                            {section.title.toUpperCase()}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          color={
                            isDark ? "rgba(255,255,255,0.6)" : "text.secondary"
                          }
                          sx={{
                            pl: 0.5,
                            fontSize: "0.8125rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {section.content}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.4, textAlign: "center", py: 4 }}
                  >
                    No charter details available.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default ExploratoryDetailTab;
