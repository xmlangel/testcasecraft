import React from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Description as CharterIcon,
  CalendarMonth as DateIcon,
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

function ExploratorySessionListTab({
  t,
  sessionFilters,
  setSessionFilters,
  charters,
  filteredSessions,
  statusColor,
  sessionsLoading,
  sessionError,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Stack spacing={3}>
      {sessionError && <Alert severity="error">{sessionError}</Alert>}
      {sessionsLoading && (
        <Alert severity="info">{t("common.loading", "로딩 중...")}</Alert>
      )}

      {/* Tab Header with Create Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {filteredSessions.length}{" "}
          {t("exploratory.session.countUnit", "개의 세션이 있습니다.")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<AddIcon />}
            label={t("exploratory.session.btn.createNew", "새 세션 시작")}
            onClick={onCreateSession}
            color="primary"
            variant="filled"
            clickable
            sx={{ fontWeight: "bold", px: 1 }}
          />
        </Stack>
      </Box>

      {/* Filter Section with Glassmorphism touch */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "background.paper",
          backdropFilter: "blur(8px)",
          borderRadius: 2,
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "divider",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t("common.status", "상태")}</InputLabel>
              <Select
                value={sessionFilters.status}
                label={t("common.status", "상태")}
                onChange={(e) =>
                  setSessionFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <MenuItem value="ALL">{t("common.all", "전체")}</MenuItem>
                <MenuItem value="DRAFT">
                  {t("exploratory.session.status.draft", "DRAFT")}
                </MenuItem>
                <MenuItem value="RUNNING">
                  {t("exploratory.session.status.running", "RUNNING")}
                </MenuItem>
                <MenuItem value="PAUSED">
                  {t("exploratory.session.status.paused", "PAUSED")}
                </MenuItem>
                <MenuItem value="COMPLETED">
                  {t("exploratory.session.status.completed", "COMPLETED")}
                </MenuItem>
                <MenuItem value="SUBMITTED">
                  {t("exploratory.session.status.submitted", "SUBMITTED")}
                </MenuItem>
                <MenuItem value="APPROVED">
                  {t("exploratory.session.status.approved", "APPROVED")}
                </MenuItem>
                <MenuItem value="ARCHIVED">
                  {t("exploratory.session.status.archived", "ARCHIVED")}
                </MenuItem>
                <MenuItem value="NEEDS_UPDATE">
                  {t("exploratory.session.status.needsUpdate", "NEEDS_UPDATE")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={t("exploratory.session.filter.tester", "테스터")}
              value={sessionFilters.tester}
              onChange={(e) =>
                setSessionFilters((prev) => ({
                  ...prev,
                  tester: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>
                {t("exploratory.session.filter.linkedCharter", "연결 차터")}
              </InputLabel>
              <Select
                value={sessionFilters.charterId}
                label={t(
                  "exploratory.session.filter.linkedCharter",
                  "연결 차터",
                )}
                onChange={(e) =>
                  setSessionFilters((prev) => ({
                    ...prev,
                    charterId: e.target.value,
                  }))
                }
              >
                <MenuItem value="ALL">{t("common.all", "전체")}</MenuItem>
                {charters.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={t("exploratory.session.filter.periodFrom", "기간 시작")}
              InputLabelProps={{ shrink: true }}
              value={sessionFilters.periodFrom}
              onChange={(e) =>
                setSessionFilters((prev) => ({
                  ...prev,
                  periodFrom: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={t("exploratory.session.filter.periodTo", "기간 종료")}
              InputLabelProps={{ shrink: true }}
              value={sessionFilters.periodTo}
              onChange={(e) =>
                setSessionFilters((prev) => ({
                  ...prev,
                  periodTo: e.target.value,
                }))
              }
            />
          </Grid>
        </Grid>
      </Card>

      {/* Sessions Grid */}
      <Grid container spacing={2}>
        {!sessionsLoading && filteredSessions.length === 0 && (
          <Grid size={12}>
            <Box sx={{ py: 8, textAlign: "center", opacity: 0.6 }}>
              <Typography variant="body1">
                {t("exploratory.session.empty", "조건에 맞는 세션이 없습니다.")}
              </Typography>
            </Box>
          </Grid>
        )}
        {filteredSessions.map((item) => {
          const charter = charters.find((c) => c.id === item.charterId);
          const color = statusColor[item.status] || "default";

          return (
            <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    borderColor: "primary.main",
                  },
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <CardActionArea
                  onClick={() => onSelectSession && onSelectSession(item.id)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: `${color}.main`,
                    }}
                  />
                  <CardContent sx={{ width: "100%", p: 2.5 }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Chip
                          label={t(
                            `exploratory.session.status.${
                              item.status === "NEEDS_UPDATE"
                                ? "needsUpdate"
                                : item.status.toLowerCase()
                            }`,
                            item.status,
                          )}
                          size="small"
                          color={color}
                          variant="filled"
                          sx={{ fontWeight: 700, borderRadius: 1 }}
                        />
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          {item.durationMin != null && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <TimeIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600 }}
                              >
                                {item.durationMin}min
                              </Typography>
                            </Stack>
                          )}
                          <Tooltip title={t("common.delete", "삭제")}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession && onDeleteSession(item.id);
                              }}
                              sx={{
                                opacity: 0.3,
                                transition: "all 0.2s ease-in-out",
                                color: isDark
                                  ? "rgba(255,255,255,0.4)"
                                  : "text.secondary",
                                "&:hover": {
                                  opacity: 1,
                                  color: "error.main",
                                  bgcolor: isDark
                                    ? "rgba(211, 47, 47, 0.1)"
                                    : "rgba(211, 47, 47, 0.05)",
                                  transform: "scale(1.1)",
                                },
                                ".MuiCard-root:hover &": { opacity: 0.8 },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.3,
                          minHeight: "2.6em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Divider sx={{ opacity: 0.6 }} />

                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <PersonIcon
                            sx={{ fontSize: 18, color: "action.active" }}
                          />
                          <Typography variant="body2" noWrap>
                            {item.tester}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <DateIcon
                            sx={{ fontSize: 18, color: "action.active" }}
                          />
                          <Typography variant="body2">{item.date}</Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <CharterIcon
                            sx={{ fontSize: 18, color: "action.active" }}
                          />
                          <Typography
                            variant="body2"
                            noWrap
                            color="text.secondary"
                          >
                            {charter?.title || "-"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}

export default ExploratorySessionListTab;
