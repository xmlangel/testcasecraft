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
import { useTheme as useAppTheme } from "../../context/ThemeContext.jsx";
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
  const { designSystem } = useAppTheme();
  const isDark = theme.palette.mode === "dark";
  const isGlass = designSystem === "glass";

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

      {/* Filter Section */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: isGlass
            ? isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.5)"
            : "background.paper",
          backdropFilter: isGlass ? "blur(8px)" : "none",
          borderRadius: isGlass ? 2 : 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Grid container spacing={2}>
          {/* ... 필터 내용 동일 ... */}
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
                  {t("exploratory.session.status.draft", "작성 중")}
                </MenuItem>
                <MenuItem value="RUNNING">
                  {t("exploratory.session.status.running", "수행 중")}
                </MenuItem>
                <MenuItem value="PAUSED">
                  {t("exploratory.session.status.paused", "일시 정지")}
                </MenuItem>
                <MenuItem value="COMPLETED">
                  {t("exploratory.session.status.completed", "수행 완료")}
                </MenuItem>
                <MenuItem value="SUBMITTED">
                  {t("exploratory.session.status.submitted", "제출됨")}
                </MenuItem>
                <MenuItem value="APPROVED">
                  {t("exploratory.session.status.approved", "승인됨")}
                </MenuItem>
                <MenuItem value="ARCHIVED">
                  {t("exploratory.session.status.archived", "보관됨")}
                </MenuItem>
                <MenuItem value="NEEDS_UPDATE">
                  {t("exploratory.session.status.needsUpdate", "보완 필요")}
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
                  bgcolor: isGlass
                    ? isDark
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(255, 255, 255, 0.4)"
                    : "background.paper",
                  backdropFilter: isGlass ? "blur(4px)" : "none",
                  "&:hover": {
                    transform: isGlass ? "translateY(-4px)" : "none",
                    boxShadow: isGlass
                      ? "0 8px 24px rgba(0,0,0,0.12)"
                      : theme.shadows[2],
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
                            item.status === "DRAFT"
                              ? "작성 중"
                              : item.status === "RUNNING"
                                ? "수행 중"
                                : item.status === "PAUSED"
                                  ? "일시 정지"
                                  : item.status === "COMPLETED"
                                    ? "수행 완료"
                                    : item.status === "SUBMITTED"
                                      ? "제출됨"
                                      : item.status === "APPROVED"
                                        ? "승인됨"
                                        : item.status === "ARCHIVED"
                                          ? "보관됨"
                                          : item.status === "NEEDS_UPDATE"
                                            ? "보완 필요"
                                            : item.status,
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
