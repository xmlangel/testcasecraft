import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  PauseCircle as PauseCircleIcon,
  PlayCircle as PlayCircleIcon,
  StopCircle as StopCircleIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import { useI18n } from "../context/I18nContext.jsx";

const initialCharters = [
  { id: "charter-1", title: "결제 실패 복구 시나리오 탐색", mission: "네트워크 단절/재시도 흐름 검증", status: "ACTIVE", sessions: 7, bugs: 12 },
  { id: "charter-2", title: "권한 경계 우회 탐색", mission: "역할 변경 직후 접근 제어 확인", status: "ACTIVE", sessions: 4, bugs: 6 },
  { id: "charter-3", title: "대량 데이터 조회 안정성 탐색", mission: "10만 건 이상 응답/렌더링 확인", status: "ARCHIVED", sessions: 11, bugs: 19 },
];

const initialSessions = [
  { id: "session-101", title: "Sprint 22 결제 탐색", status: "IN_PROGRESS", tester: "Kim QA", charterId: "charter-1", date: "2026-02-10", durationMin: 52, bugs: 3 },
  { id: "session-102", title: "권한 전환 회귀 탐색", status: "DONE", tester: "Lee QA", charterId: "charter-2", date: "2026-02-07", durationMin: 88, bugs: 2 },
  { id: "session-103", title: "대량 조회 스트레스 탐색", status: "DONE", tester: "Park QA", charterId: "charter-3", date: "2026-01-31", durationMin: 73, bugs: 5 },
];

const formatSeconds = (seconds) => {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const statusColor = {
  ACTIVE: "success",
  ARCHIVED: "default",
  IN_PROGRESS: "warning",
  DONE: "success",
  DRAFT: "default",
};

function ExploratorySessionWorkspace() {
  const { t } = useI18n();
  const [view, setView] = React.useState(0);
  const [charters, setCharters] = React.useState(initialCharters);
  const [sessions] = React.useState(initialSessions);
  const [charterFilter, setCharterFilter] = React.useState("ALL");
  const [sessionFilters, setSessionFilters] = React.useState({
    status: "ALL",
    tester: "",
    charterId: "ALL",
    bugsMin: "",
    periodFrom: "",
    periodTo: "",
  });
  const [charterDialogOpen, setCharterDialogOpen] = React.useState(false);
  const [editingCharter, setEditingCharter] = React.useState(null);
  const [charterForm, setCharterForm] = React.useState({
    title: "",
    mission: "",
    status: "ACTIVE",
  });
  const [timerStatus, setTimerStatus] = React.useState("idle");
  const [elapsedSec, setElapsedSec] = React.useState(0);
  const [pausedSec, setPausedSec] = React.useState(0);
  const [sessionDraft, setSessionDraft] = React.useState({
    status: "DRAFT",
    environment: "Staging",
    version: "v1.24.0",
    tags: "payment, retry, regression",
    charterId: "charter-1",
    timeExecution: 60,
    timeBugInvestigation: 25,
    timeSetupAdmin: 15,
    flowNotes: "",
    coverageNotes: "",
    oracleNotes: "",
    activityNotes: "",
    bugHeadline: "PAY-421 | 간헐적 승인 실패",
    blockers: "",
    remainingQuestions: "",
    testData: "",
    evaluation: "",
    nextCharter: "",
    leadComment: "",
    achievement: 70,
  });
  const [artifacts, setArtifacts] = React.useState([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (timerStatus === "running") {
        setElapsedSec((prev) => prev + 1);
      }
      if (timerStatus === "paused") {
        setPausedSec((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStatus]);

  const openNewCharterDialog = () => {
    setEditingCharter(null);
    setCharterForm({ title: "", mission: "", status: "ACTIVE" });
    setCharterDialogOpen(true);
  };

  const openEditCharterDialog = (charter) => {
    setEditingCharter(charter.id);
    setCharterForm({
      title: charter.title,
      mission: charter.mission,
      status: charter.status,
    });
    setCharterDialogOpen(true);
  };

  const saveCharter = () => {
    if (!charterForm.title.trim()) return;
    if (editingCharter) {
      setCharters((prev) =>
        prev.map((item) =>
          item.id === editingCharter
            ? { ...item, title: charterForm.title, mission: charterForm.mission, status: charterForm.status }
            : item
        )
      );
    } else {
      setCharters((prev) => [
        {
          id: `charter-${Date.now()}`,
          title: charterForm.title,
          mission: charterForm.mission,
          status: charterForm.status,
          sessions: 0,
          bugs: 0,
        },
        ...prev,
      ]);
    }
    setCharterDialogOpen(false);
  };

  const filteredCharters = charters.filter((item) => {
    if (charterFilter === "ALL") return true;
    return item.status === charterFilter;
  });

  const filteredSessions = sessions.filter((item) => {
    if (sessionFilters.status !== "ALL" && item.status !== sessionFilters.status) return false;
    if (sessionFilters.charterId !== "ALL" && item.charterId !== sessionFilters.charterId) return false;
    if (sessionFilters.tester && !item.tester.toLowerCase().includes(sessionFilters.tester.toLowerCase())) return false;
    if (sessionFilters.bugsMin && item.bugs < Number(sessionFilters.bugsMin)) return false;
    if (sessionFilters.periodFrom && item.date < sessionFilters.periodFrom) return false;
    if (sessionFilters.periodTo && item.date > sessionFilters.periodTo) return false;
    return true;
  });

  const selectedCharter = charters.find((item) => item.id === sessionDraft.charterId);
  const totalRatio =
    Number(sessionDraft.timeExecution) +
    Number(sessionDraft.timeBugInvestigation) +
    Number(sessionDraft.timeSetupAdmin);

  const onUploadArtifacts = (event) => {
    const files = Array.from(event.target.files || []);
    const mapped = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setArtifacts((prev) => [...mapped, ...prev]);
    event.target.value = "";
  };

  const sessionStatusChip = (
    <Chip
      label={sessionDraft.status}
      color={statusColor[sessionDraft.status] || "default"}
      size="small"
    />
  );

  return (
    <Paper sx={{ p: 2, minHeight: "calc(100vh - 230px)" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">{t("exploratory.workspace.title", "탐색 세션 워크스페이스")}</Typography>
        <Chip label={t("exploratory.workspace.badgeDraft", "UI 초안")} size="small" />
      </Box>

      <Tabs value={view} onChange={(_, value) => setView(value)} sx={{ mb: 2 }}>
        <Tab label={t("exploratory.view.charterManagement", "차터 관리")} />
        <Tab label={t("exploratory.view.sessionList", "세션 목록")} />
        <Tab label={t("exploratory.view.sessionEditor", "세션 작성/편집")} />
        <Tab label={t("exploratory.view.debriefApproval", "디브리프/승인")} />
        <Tab label={t("exploratory.view.sessionDetail", "세션 상세")} />
      </Tabs>

      {view === 0 && (
        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t("exploratory.charter.filter.status", "상태 필터")}</InputLabel>
              <Select
                value={charterFilter}
                label={t("exploratory.charter.filter.status", "상태 필터")}
                onChange={(e) => setCharterFilter(e.target.value)}
              >
                <MenuItem value="ALL">{t("common.all", "전체")}</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNewCharterDialog}>
              {t("exploratory.charter.create", "차터 생성")}
            </Button>
          </Box>

          <Grid container spacing={2}>
            {filteredCharters.map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        color={statusColor[item.status] || "default"}
                        icon={item.status === "ARCHIVED" ? <ArchiveIcon /> : undefined}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t("exploratory.charter.mission", "미션")}: {item.mission}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip size="small" label={t("exploratory.charter.sessionCount", "수행 횟수 {count}", { count: item.sessions })} />
                      <Chip size="small" color="error" label={t("exploratory.charter.totalBugs", "총 버그 {count}", { count: item.bugs })} />
                    </Stack>
                    <Button size="small" onClick={() => openEditCharterDialog(item)}>
                      {t("common.buttons.edit", "편집")}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {view === 1 && (
        <Stack spacing={2}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>{t("common.status", "상태")}</InputLabel>
                <Select
                  value={sessionFilters.status}
                  label={t("common.status", "상태")}
                  onChange={(e) => setSessionFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="ALL">{t("common.all", "전체")}</MenuItem>
                  <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                  <MenuItem value="DONE">DONE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label={t("exploratory.session.filter.tester", "테스터")}
                value={sessionFilters.tester}
                onChange={(e) => setSessionFilters((prev) => ({ ...prev, tester: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>{t("exploratory.session.filter.linkedCharter", "연결 차터")}</InputLabel>
                <Select
                  value={sessionFilters.charterId}
                  label={t("exploratory.session.filter.linkedCharter", "연결 차터")}
                  onChange={(e) => setSessionFilters((prev) => ({ ...prev, charterId: e.target.value }))}
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
            <Grid size={{ xs: 12, md: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                label={t("exploratory.session.filter.minBugs", "버그 수(이상)")}
                type="number"
                value={sessionFilters.bugsMin}
                onChange={(e) => setSessionFilters((prev) => ({ ...prev, bugsMin: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t("exploratory.session.filter.periodFrom", "기간 시작")}
                InputLabelProps={{ shrink: true }}
                value={sessionFilters.periodFrom}
                onChange={(e) => setSessionFilters((prev) => ({ ...prev, periodFrom: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1.75 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t("exploratory.session.filter.periodTo", "기간 종료")}
                InputLabelProps={{ shrink: true }}
                value={sessionFilters.periodTo}
                onChange={(e) => setSessionFilters((prev) => ({ ...prev, periodTo: e.target.value }))}
              />
            </Grid>
          </Grid>

          <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {filteredSessions.map((item) => {
              const charter = charters.find((c) => c.id === item.charterId);
              return (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                        <Chip size="small" label={item.status} color={statusColor[item.status] || "default"} />
                        <Chip size="small" label={t("exploratory.session.label.bugs", "버그 {count}", { count: item.bugs })} color="error" />
                      </Box>
                    }
                    secondary={t(
                      "exploratory.session.label.meta",
                      "기간 {date} | 테스터 {tester} | 차터 {charter}",
                      { date: item.date, tester: item.tester, charter: charter?.title || "-" }
                    )}
                  />
                </ListItem>
              );
            })}
          </List>
        </Stack>
      )}

      {view === 2 && (
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {t("exploratory.editor.header.title", "헤더")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {sessionStatusChip}
                  <Chip size="small" label={t("exploratory.editor.header.elapsed", "실행 시간 {value}", { value: formatSeconds(elapsedSec) })} color="primary" />
                  <Chip size="small" label={t("exploratory.editor.header.paused", "중단 시간 {value}", { value: formatSeconds(pausedSec) })} />
                </Box>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayCircleIcon />}
                  onClick={() => {
                    setTimerStatus("running");
                    setSessionDraft((prev) => ({ ...prev, status: "IN_PROGRESS" }));
                  }}
                  disabled={timerStatus === "running" || timerStatus === "ended"}
                >
                  {t("exploratory.editor.timer.start", "Start")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PauseCircleIcon />}
                  onClick={() => setTimerStatus("paused")}
                  disabled={timerStatus !== "running"}
                >
                  {t("exploratory.editor.timer.pause", "Pause")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PlayCircleIcon />}
                  onClick={() => setTimerStatus("running")}
                  disabled={timerStatus !== "paused"}
                >
                  {t("exploratory.editor.timer.resume", "Resume")}
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<StopCircleIcon />}
                  onClick={() => {
                    setTimerStatus("ended");
                    setSessionDraft((prev) => ({ ...prev, status: "DONE" }));
                  }}
                  disabled={timerStatus === "idle" || timerStatus === "ended"}
                >
                  {t("exploratory.editor.timer.end", "End")}
                </Button>
              </Stack>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t("exploratory.editor.field.environment", "환경")}
                    value={sessionDraft.environment}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, environment: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t("exploratory.editor.field.version", "버전")}
                    value={sessionDraft.version}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, version: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t("exploratory.editor.field.tags", "태그")}
                    value={sessionDraft.tags}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.charterSection.title", "차터 섹션")}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 320, mb: 1 }}>
                <InputLabel>{t("exploratory.editor.charterSection.assigned", "할당 차터")}</InputLabel>
                <Select
                  value={sessionDraft.charterId}
                  label={t("exploratory.editor.charterSection.assigned", "할당 차터")}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, charterId: e.target.value }))}
                >
                  {charters.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                {t("exploratory.editor.charterSection.autoMission", "자동 바인딩된 미션")}: {selectedCharter?.mission || "-"}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.timeSection.title", "시간 배분")}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={t("exploratory.editor.timeSection.execution", "Test Execution (%)")}
                    value={sessionDraft.timeExecution}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, timeExecution: Number(e.target.value || 0) }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={t("exploratory.editor.timeSection.bugInvestigation", "Bug Investigation (%)")}
                    value={sessionDraft.timeBugInvestigation}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, timeBugInvestigation: Number(e.target.value || 0) }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={t("exploratory.editor.timeSection.setupAdmin", "Setup/Admin (%)")}
                    value={sessionDraft.timeSetupAdmin}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, timeSetupAdmin: Number(e.target.value || 0) }))}
                  />
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t("exploratory.editor.timeSection.total", "합계 {total}%", { total: totalRatio })} | {t("exploratory.editor.timeSection.pausedMinutes", "자동 반영된 중단 시간 {minutes}분", { minutes: Math.floor(pausedSec / 60) })}
              </Typography>
              {totalRatio !== 100 && <Alert sx={{ mt: 1 }} severity="warning">{t("exploratory.editor.timeSection.ratioWarning", "시간 배분 합계가 100%가 아닙니다.")}</Alert>}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.notes.title", "테스트 노트")}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t("exploratory.editor.notes.flow", "수행 흐름")}
                    value={sessionDraft.flowNotes}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, flowNotes: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t("exploratory.editor.notes.coverage", "커버리지")}
                    value={sessionDraft.coverageNotes}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, coverageNotes: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t("exploratory.editor.notes.oracle", "오라클")}
                    value={sessionDraft.oracleNotes}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, oracleNotes: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t("exploratory.editor.notes.activity", "활동 상세")}
                    value={sessionDraft.activityNotes}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, activityNotes: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.issue.title", "버그/이슈")}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t("exploratory.editor.issue.bugHeadline", "버그 헤드라인 연동")}
                    value={sessionDraft.bugHeadline}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, bugHeadline: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label={t("exploratory.editor.issue.blockers", "방해 이슈")}
                    value={sessionDraft.blockers}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, blockers: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label={t("exploratory.editor.issue.questions", "남은 질문")}
                    value={sessionDraft.remainingQuestions}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, remainingQuestions: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.artifact.title", "데이터/산출물")}
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label={t("exploratory.editor.artifact.testData", "테스트 데이터")}
                value={sessionDraft.testData}
                onChange={(e) => setSessionDraft((prev) => ({ ...prev, testData: e.target.value }))}
                sx={{ mb: 1.5 }}
              />
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} sx={{ mb: 1.5 }}>
                {t("exploratory.editor.artifact.upload", "증적 업로드")}
                <input hidden type="file" multiple onChange={onUploadArtifacts} />
              </Button>
              <Grid container spacing={1}>
                {artifacts.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("exploratory.editor.artifact.empty", "업로드된 파일이 없습니다.")}
                    </Typography>
                  </Grid>
                )}
                {artifacts.map((file) => (
                  <Grid size={{ xs: 12, md: 4 }} key={file.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("exploratory.editor.artifact.sizeKb", "{size} KB", { size: Math.ceil(file.size / 1024) })}
                        </Typography>
                        {file.type.startsWith("image/") && (
                          <Box
                            component="img"
                            src={file.url}
                            alt={file.name}
                            sx={{ width: "100%", borderRadius: 1, mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.evaluation.title", "평가/액션")}
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {t("exploratory.editor.evaluation.achievement", "차터 달성도 {value}%", { value: sessionDraft.achievement })}
                  </Typography>
                  <LinearProgress variant="determinate" value={sessionDraft.achievement} />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label={t("exploratory.editor.evaluation.overall", "전체 평가")}
                  value={sessionDraft.evaluation}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, evaluation: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label={t("exploratory.editor.evaluation.nextCharter", "다음 세션 제안 차터")}
                  value={sessionDraft.nextCharter}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, nextCharter: e.target.value }))}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}

      {view === 3 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  {t("exploratory.debrief.report.title", "디브리프 리포트")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("exploratory.debrief.report.meta", "세션: Sprint 22 결제 탐색 | 테스터: Kim QA | 상태: DONE")}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t("exploratory.debrief.report.summary", "요약: 결제 승인 단계에서 간헐적 타임아웃 재현. 재시도 경로에서 중복 승인 위험 발견.")}
                </Typography>
                <Typography variant="body2">{t("exploratory.debrief.report.keyBugs", "주요 버그: PAY-421, PAY-433")}</Typography>
                <Typography variant="body2">{t("exploratory.debrief.report.evidence", "증적: screenshot_0210.png, payment-retry.log")}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  {t("exploratory.debrief.checklist.title", "체크리스트")}
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary={t("exploratory.debrief.checklist.scope", "차터 범위 준수")} /></ListItem>
                  <ListItem><ListItemText primary={t("exploratory.debrief.checklist.timebox", "타임박스/중단 시간 기록")} /></ListItem>
                  <ListItem><ListItemText primary={t("exploratory.debrief.checklist.evidence", "버그 근거 자료 첨부")} /></ListItem>
                  <ListItem><ListItemText primary={t("exploratory.debrief.checklist.action", "후속 액션 제안 포함")} /></ListItem>
                </List>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label={t("exploratory.debrief.leadComment", "리드 코멘트")}
                  value={sessionDraft.leadComment}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, leadComment: e.target.value }))}
                  sx={{ mt: 1 }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button variant="contained" color="success">{t("exploratory.debrief.action.approve", "승인")}</Button>
                  <Button variant="outlined" color="warning">{t("exploratory.debrief.action.requestChanges", "보완요청")}</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {view === 4 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("exploratory.detail.timeline.title", "세션 활동 타임라인 (Read-only)")}
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText primary={t("exploratory.detail.timeline.start.primary", "10:02 세션 시작")} secondary={t("exploratory.detail.timeline.start.secondary", "차터 바인딩: 결제 실패 복구 시나리오 탐색")} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary={t("exploratory.detail.timeline.bug.primary", "10:27 버그 발견")} secondary={t("exploratory.detail.timeline.bug.secondary", "PAY-421 생성, 증적 2건 첨부")} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary={t("exploratory.detail.timeline.pause.primary", "10:41 중단/재개")} secondary={t("exploratory.detail.timeline.pause.secondary", "환경 불안정으로 4분 중단 후 재개")} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t("exploratory.detail.timeline.done.primary", "11:03 종료 및 승인 완료")} secondary={t("exploratory.detail.timeline.done.secondary", "리드 승인자: Choi Lead (2026-02-10)")} />
              </ListItem>
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {t("exploratory.detail.archive.title", "최종 승인 리포트 아카이브")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label="session-101-report.pdf" />
              <Chip label="debrief-comment.txt" />
              <Chip label="evidence-bundle.zip" />
            </Stack>
          </CardContent>
        </Card>
      )}

      <Dialog open={charterDialogOpen} onClose={() => setCharterDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingCharter ? t("exploratory.charter.dialog.editTitle", "차터 편집") : t("exploratory.charter.dialog.createTitle", "차터 생성")}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              label={t("exploratory.charter.dialog.name", "차터 이름")}
              value={charterForm.title}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t("exploratory.charter.dialog.mission", "미션")}
              value={charterForm.mission}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, mission: e.target.value }))}
            />
            <FormControl size="small">
              <InputLabel>{t("exploratory.charter.dialog.status", "상태")}</InputLabel>
              <Select
                value={charterForm.status}
                label={t("exploratory.charter.dialog.status", "상태")}
                onChange={(e) => setCharterForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCharterDialogOpen(false)}>{t("common.buttons.cancel", "취소")}</Button>
          <Button variant="contained" onClick={saveCharter}>{t("common.save", "저장")}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ExploratorySessionWorkspace;
