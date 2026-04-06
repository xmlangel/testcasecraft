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
} from "@mui/icons-material";
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
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
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
                          session.status,
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
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="overline"
                        sx={{ opacity: 0.5, fontWeight: 700, lineHeight: 1 }}
                      >
                        Tester
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
                        Duration
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
                        Version
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
                        Environment
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
                  bgcolor: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.05)",
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
                  ACTUAL TIME DISTRIBUTION
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    height: 40,
                    display: "flex",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
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
                background: "rgba(255,255,255,0.03)",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.05)",
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
                  SESSION EXECUTION LOGS
                </Typography>

                <Grid container spacing={3}>
                  {[
                    {
                      label: "Flow / Scenarios",
                      value: raw.flowNotes,
                      icon: <HistoryIcon fontSize="small" />,
                    },
                    {
                      label: "Coverage Area",
                      value: raw.coverageNotes,
                      icon: <LayersIcon fontSize="small" />,
                    },
                    {
                      label: "Test Oracle",
                      value: raw.oracleNotes,
                      icon: <OracleIcon fontSize="small" />,
                    },
                    {
                      label: "Activity Details",
                      value: raw.activityNotes,
                      icon: <SetupIcon fontSize="small" />,
                    },
                  ].map((note, idx) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          height: "100%",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1.5, opacity: 0.6 }}
                        >
                          {note.icon}
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                          >
                            {note.label.toUpperCase()}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            color: "rgba(255,255,255,0.8)",
                            lineHeight: 1.6,
                          }}
                        >
                          {note.value || "-"}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Defects & Evaluation Area */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
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
                        color: "error.light",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BugIcon /> DEFECTS & BLOCKERS
                    </Typography>
                    <Stack spacing={2.5}>
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
                          BUG HEADLINE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "rgba(211, 47, 47, 0.1)",
                            border: "1px solid rgba(211, 47, 47, 0.2)",
                          }}
                        >
                          {raw.bugHeadline || "No major bugs reported"}
                        </Typography>
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
                          BLOCKERS
                        </Typography>
                        <Typography variant="body2">
                          {raw.blockers || "None"}
                        </Typography>
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
                          REMAINING QUESTIONS
                        </Typography>
                        <Typography variant="body2">
                          {raw.remainingQuestions || "None"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                              bgcolor: "rgba(255,255,255,0.05)",
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
              background: "rgba(255,255,255,0.02)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.05)",
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
                          bgcolor: "rgba(255,255,255,0.01)",
                          border: "1px solid rgba(255,255,255,0.03)",
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
                          color="rgba(255,255,255,0.6)"
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
