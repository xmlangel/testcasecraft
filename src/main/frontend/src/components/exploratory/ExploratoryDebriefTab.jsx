import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
  LinearProgress,
  useTheme,
  Chip,
} from "@mui/material";
import { useTheme as useAppTheme } from "../../context/ThemeContext.jsx";
import {
  CheckCircleOutline as ExitIcon,
  AssignmentTurnedIn as DebriefIcon,
  History as HistoryIcon,
  BugReport as BugIcon,
  Link as LinkIcon,
  NoteAlt as NoteIcon,
  AttachFile as AttachmentIcon,
  Storage as DataIcon,
} from "@mui/icons-material";

function ExploratoryDebriefTab({
  t,
  sessionDraft,
  setSessionDraft,
  onBackToList,
  saveSession,
  submitSession,
  savingSession,
  artifacts,
}) {
  const theme = useTheme();
  const { designSystem } = useAppTheme();
  const isDark = theme.palette.mode === "dark";
  const isGlass = designSystem === "glass";

  return (
    <Grid container spacing={4}>
      {/* Left Column: Session Summary & Evaluation */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={4}>
          <Card
            sx={{
              bgcolor: isGlass
                ? isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.5)"
                : "background.paper",
              backdropFilter: isGlass ? "blur(20px)" : "none",
              borderRadius: isGlass ? 4 : 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: isGlass
                ? isDark
                  ? "0 8px 32px rgba(0,0,0,0.2)"
                  : "0 8px 32px rgba(6, 182, 212, 0.1)"
                : theme.shadows[1],
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <DebriefIcon color="primary" />
                    {t("exploratory.debrief.report.title", "디브리프 및 평가")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {sessionDraft.title} | {sessionDraft.testerName}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={saveSession}
                    disabled={savingSession}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {t("common.save", "저장")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onBackToList}
                    sx={{ borderRadius: 2 }}
                  >
                    {t("exploratory.editor.btn.backToList", "목록보기")}
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={4}>
                {/* 1. Charter Achievement */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 2,
                      fontWeight: 800,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {t(
                        "exploratory.debrief.evaluation.achievement",
                        "차터 달성도",
                      )}
                    </span>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={sessionDraft.achievement}
                        onChange={(e) =>
                          setSessionDraft((prev) => ({
                            ...prev,
                            achievement: Math.min(
                              100,
                              Math.max(0, Number(e.target.value)),
                            ),
                          }))
                        }
                        sx={{
                          width: 70,
                          "& input": {
                            textAlign: "right",
                            fontWeight: 900,
                            color: "#4caf50",
                            py: 0.5,
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 900, color: "#4caf50" }}
                      >
                        %
                      </Typography>
                    </Box>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sessionDraft.achievement || 0}
                    sx={{
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
                </Box>

                {/* 2. Overall Evaluation */}
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  label={t(
                    "exploratory.debrief.evaluation.summary",
                    "세션 전체 평가",
                  )}
                  placeholder="차터 달성 여부, 발견된 품질 위험 및 테스팅 총평을 요약해 주세요."
                  value={sessionDraft.evaluation || ""}
                  onChange={(e) =>
                    setSessionDraft((prev) => ({
                      ...prev,
                      evaluation: e.target.value,
                    }))
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />

                {/* 3. Next Actions */}
                <TextField
                  fullWidth
                  label={t(
                    "exploratory.debrief.evaluation.nextCharter",
                    "후속 액션 / 다음 차터 제안",
                  )}
                  placeholder="추가 조사가 필요한 영역이나 다음 테스팅 목표를 제안해 주세요."
                  value={sessionDraft.nextCharter || ""}
                  onChange={(e) =>
                    setSessionDraft((prev) => ({
                      ...prev,
                      nextCharter: e.target.value,
                    }))
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3 },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* 4. Session Execution Notes */}
          <Card
            sx={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "background.paper",
              borderRadius: 4,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <NoteIcon color="primary" />
                {t("exploratory.debrief.section.notes", "테스트 수행 노트")}
              </Typography>
              <Stack spacing={2}>
                {(sessionDraft.notes || []).length > 0 ? (
                  (sessionDraft.notes || []).map((note, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: isDark
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.02)",
                        border: "1px solid",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "divider",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, mb: 1, color: "primary.light" }}
                      >
                        {note.title || `Note ${idx + 1}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", opacity: 0.9 }}
                      >
                        {note.content}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.5, fontStyle: "italic" }}
                  >
                    기록된 세션 노트가 없습니다.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* 5. Data Outputs & Artifacts */}
          <Card
            sx={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "background.paper",
              borderRadius: 4,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AttachmentIcon color="primary" />
                {t(
                  "exploratory.debrief.section.artifacts",
                  "데이터 산출물 및 증적",
                )}
              </Typography>

              <Stack spacing={3}>
                {/* Test Data */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      opacity: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <DataIcon fontSize="inherit" /> TEST DATA
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
                    {sessionDraft.testData ||
                      "기록된 테스트 데이터가 없습니다."}
                  </Typography>
                </Box>

                {/* Artifact Files */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      opacity: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <AttachmentIcon fontSize="inherit" /> UPLOADED FILES
                  </Typography>
                  {(sessionDraft.attachments || []).length > 0 ? (
                    <Grid container spacing={2}>
                      {(sessionDraft.attachments || []).map((file) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={file.id}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              bgcolor: isDark
                                ? "rgba(255,255,255,0.02)"
                                : "background.paper",
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
                            {!file.mimeType?.startsWith("image/") && (
                              <Box
                                sx={{
                                  height: 100,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "rgba(0,0,0,0.05)",
                                  borderRadius: 1,
                                }}
                              >
                                <AttachmentIcon sx={{ opacity: 0.2 }} />
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.5, fontStyle: "italic" }}
                    >
                      업로드된 산출물이 없습니다.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* 6. Structured Tests */}
          <Card
            sx={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "background.paper",
              borderRadius: 4,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ExitIcon color="primary" />
                {t(
                  "exploratory.debrief.section.tests",
                  "수행된 구조화된 테스트",
                )}
              </Typography>
              <Stack spacing={2}>
                {(sessionDraft.tests || []).length > 0 ? (
                  (sessionDraft.tests || []).map((test, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
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
                      {test.steps && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ opacity: 0.7, mb: 0.5 }}
                        >
                          <strong>Steps:</strong> {test.steps}
                        </Typography>
                      )}
                      {test.expectedResult && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ opacity: 0.7 }}
                        >
                          <strong>Expected:</strong> {test.expectedResult}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.5, fontStyle: "italic" }}
                  >
                    수행된 구조화된 테스트가 없습니다.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* 7. Detailed Bugs */}
          <Card
            sx={{
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "background.paper",
              borderRadius: 4,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <BugIcon color="error" />
                {t("exploratory.debrief.section.bugs", "발견된 상세 버그")}
              </Typography>
              <Stack spacing={2}>
                {(sessionDraft.bugs || []).length > 0 ? (
                  (sessionDraft.bugs || []).map((bug, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
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
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {bug.description}
                      </Typography>
                      {bug.jiraIssueKey && (
                        <Chip
                          label={bug.jiraIssueKey}
                          size="small"
                          icon={<LinkIcon />}
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.5, fontStyle: "italic" }}
                  >
                    세션 중 발견된 상세 버그 정보가 없습니다.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Recap of Key Findings */}
          <Card
            sx={{
              borderRadius: 4,
              background: isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.01)",
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <BugIcon fontSize="small" /> QUICK RECAP: LINKED ISSUES
              </Typography>
              <Stack spacing={2}>
                {sessionDraft.jiraIssueKey ? (
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
                      LINKED JIRA
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {sessionDraft.jiraIssueKey.split(",").map((key) => (
                        <Chip
                          key={key}
                          label={key.trim()}
                          size="small"
                          icon={<LinkIcon />}
                          color="error"
                          variant="outlined"
                          sx={{ fontWeight: 800 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.5 }}>
                    연결된 JIRA 이슈가 없습니다.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      {/* Right Column: Debrief Controls */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={3} sx={{ position: "sticky", top: 24 }}>
          {/* Debrief Checklist */}
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 2, color: "primary.light" }}
              >
                DEBRIEF CHECKLIST
              </Typography>
              <List dense>
                {[
                  "차터 범위 내에서 탐색이 이루어졌는가?",
                  "수행 중 발견된 모든 리스크가 기록되었는가?",
                  "버그 재현을 위한 정보 및 증적이 충분한가?",
                  "다음 단계에 대한 제안이 포함되었는가?",
                ].map((text, i) => (
                  <ListItem key={i} sx={{ px: 0 }}>
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: { fontWeight: 500, opacity: 0.8 },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Lead Review Section */}
          <Card
            sx={{
              borderRadius: 4,
              background: isDark
                ? "rgba(25, 118, 210, 0.05)"
                : "rgba(25, 118, 210, 0.02)",
              border: "1px solid",
              borderColor: isDark
                ? "rgba(25, 118, 210, 0.2)"
                : "rgba(25, 118, 210, 0.1)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ExitIcon /> LEAD REVIEW & APPROVAL
              </Typography>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label={t("exploratory.debrief.leadComment", "리드 피드백")}
                  placeholder="리뷰 의견을 입력해 주세요..."
                  value={sessionDraft.reviewComment || ""}
                  onChange={(e) =>
                    setSessionDraft((prev) => ({
                      ...prev,
                      reviewComment: e.target.value,
                    }))
                  }
                  sx={{ bgcolor: "background.paper", borderRadius: 2 }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<ExitIcon />}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 800 }}
                  >
                    {t("exploratory.debrief.action.approve", "최종 승인")}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 800 }}
                  >
                    {t("exploratory.debrief.action.requestChanges", "RE-WORK")}
                  </Button>
                </Stack>

                <Divider />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={submitSession}
                  disabled={
                    savingSession || sessionDraft.status === "SUBMITTED"
                  }
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 900,
                    fontSize: "1rem",
                    boxShadow: "0 8px 20px rgba(25, 118, 210, 0.3)",
                  }}
                >
                  {t(
                    "exploratory.debrief.action.finalSubmit",
                    "SUBMIT FOR REVIEW",
                  )}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default ExploratoryDebriefTab;
