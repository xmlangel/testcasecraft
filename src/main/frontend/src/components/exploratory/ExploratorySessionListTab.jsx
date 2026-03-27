import React from "react";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function ExploratorySessionListTab({
  t,
  sessionFilters,
  setSessionFilters,
  charters,
  filteredSessions,
  statusColor,
  sessionsLoading,
  sessionError,
}) {
  return (
    <Stack spacing={2}>
      {sessionError && <Alert severity="error">{sessionError}</Alert>}
      {sessionsLoading && (
        <Alert severity="info">{t("common.loading", "로딩 중...")}</Alert>
      )}
      <Grid container spacing={1.5}>
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
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="RUNNING">RUNNING</MenuItem>
              <MenuItem value="PAUSED">PAUSED</MenuItem>
              <MenuItem value="SUBMITTED">SUBMITTED</MenuItem>
              <MenuItem value="APPROVED">APPROVED</MenuItem>
              <MenuItem value="NEEDS_UPDATE">NEEDS_UPDATE</MenuItem>
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
              setSessionFilters((prev) => ({ ...prev, tester: e.target.value }))
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
              label={t("exploratory.session.filter.linkedCharter", "연결 차터")}
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

      <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
        {!sessionsLoading && filteredSessions.length === 0 && (
          <ListItem>
            <ListItemText
              primary={t(
                "exploratory.session.empty",
                "조건에 맞는 세션이 없습니다.",
              )}
            />
          </ListItem>
        )}
        {filteredSessions.map((item) => {
          const charter = charters.find((c) => c.id === item.charterId);
          return (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={item.status}
                      color={statusColor[item.status] || "default"}
                    />
                    {item.durationMin != null && (
                      <Chip
                        size="small"
                        label={t(
                          "exploratory.session.label.duration",
                          "순수 실행 {minutes}분",
                          { minutes: item.durationMin },
                        )}
                      />
                    )}
                  </Box>
                }
                secondary={t(
                  "exploratory.session.label.meta",
                  "기간 {date} | 테스터 {tester} | 차터 {charter}",
                  {
                    date: item.date,
                    tester: item.tester,
                    charter: charter?.title || "-",
                  },
                )}
              />
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}

export default ExploratorySessionListTab;
