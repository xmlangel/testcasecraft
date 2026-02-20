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
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  PauseCircle as PauseCircleIcon,
  PlayCircle as PlayCircleIcon,
  StopCircle as StopCircleIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";

function ExploratorySessionEditorTab({
  t,
  sessionDraft,
  setSessionDraft,
  timerStatus,
  setTimerStatus,
  elapsedSec,
  pausedSec,
  formatSeconds,
  charters,
  selectedCharter,
  totalRatio,
  onUploadArtifacts,
  artifacts,
  statusColor,
}) {
  const [editorTab, setEditorTab] = React.useState(0);

  const sessionStatusChip = (
    <Chip
      label={sessionDraft.status}
      color={statusColor[sessionDraft.status] || "default"}
      size="small"
    />
  );

  return (
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
              data-testid="exploratory-editor-timer-start"
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
              data-testid="exploratory-editor-timer-pause"
              size="small"
              variant="outlined"
              startIcon={<PauseCircleIcon />}
              onClick={() => setTimerStatus("paused")}
              disabled={timerStatus !== "running"}
            >
              {t("exploratory.editor.timer.pause", "Pause")}
            </Button>
            <Button
              data-testid="exploratory-editor-timer-resume"
              size="small"
              variant="outlined"
              startIcon={<PlayCircleIcon />}
              onClick={() => setTimerStatus("running")}
              disabled={timerStatus !== "paused"}
            >
              {t("exploratory.editor.timer.resume", "Resume")}
            </Button>
            <Button
              data-testid="exploratory-editor-timer-end"
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
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={editorTab} onChange={(_, value) => setEditorTab(value)} sx={{ mb: 2 }}>
            <Tab data-testid="exploratory-editor-tab-basic" label={t("exploratory.editor.tab.basic", "기본 정보")} />
            <Tab data-testid="exploratory-editor-tab-notes-issues" label={t("exploratory.editor.tab.notesIssues", "노트/이슈")} />
            <Tab data-testid="exploratory-editor-tab-artifacts-evaluation" label={t("exploratory.editor.tab.artifactsEvaluation", "산출물/평가")} />
          </Tabs>
        </CardContent>
      </Card>

      {editorTab === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("exploratory.editor.section.charterAndTime", "차터/시간 배분")}
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  inputProps={{ "data-testid": "exploratory-editor-input-environment" }}
                  fullWidth
                  size="small"
                  label={t("exploratory.editor.field.environment", "환경")}
                  value={sessionDraft.environment}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, environment: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  inputProps={{ "data-testid": "exploratory-editor-input-version" }}
                  fullWidth
                  size="small"
                  label={t("exploratory.editor.field.version", "버전")}
                  value={sessionDraft.version}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, version: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  inputProps={{ "data-testid": "exploratory-editor-input-tags" }}
                  fullWidth
                  size="small"
                  label={t("exploratory.editor.field.tags", "태그")}
                  value={sessionDraft.tags}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>{t("exploratory.editor.charterSection.assigned", "할당 차터")}</InputLabel>
                  <Select
                    data-testid="exploratory-editor-select-charter"
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
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t("exploratory.editor.charterSection.autoMission", "자동 바인딩된 미션")}: {selectedCharter?.mission || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  inputProps={{ "data-testid": "exploratory-editor-input-time-execution" }}
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
                  inputProps={{ "data-testid": "exploratory-editor-input-time-bug-investigation" }}
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
                  inputProps={{ "data-testid": "exploratory-editor-input-time-setup-admin" }}
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
      )}

      {editorTab === 1 && (
        <>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.notes.title", "테스트 노트")}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    inputProps={{ "data-testid": "exploratory-editor-input-notes-flow" }}
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
                    inputProps={{ "data-testid": "exploratory-editor-input-notes-coverage" }}
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
                    inputProps={{ "data-testid": "exploratory-editor-input-notes-oracle" }}
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
                    inputProps={{ "data-testid": "exploratory-editor-input-notes-activity" }}
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
                    inputProps={{ "data-testid": "exploratory-editor-input-issue-bug-headline" }}
                    fullWidth
                    label={t("exploratory.editor.issue.bugHeadline", "버그 헤드라인 연동")}
                    value={sessionDraft.bugHeadline}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, bugHeadline: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    inputProps={{ "data-testid": "exploratory-editor-input-issue-blockers" }}
                    fullWidth
                    label={t("exploratory.editor.issue.blockers", "방해 이슈")}
                    value={sessionDraft.blockers}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, blockers: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    inputProps={{ "data-testid": "exploratory-editor-input-issue-questions" }}
                    fullWidth
                    label={t("exploratory.editor.issue.questions", "남은 질문")}
                    value={sessionDraft.remainingQuestions}
                    onChange={(e) => setSessionDraft((prev) => ({ ...prev, remainingQuestions: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {editorTab === 2 && (
        <>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {t("exploratory.editor.artifact.title", "데이터/산출물")}
              </Typography>
              <TextField
                inputProps={{ "data-testid": "exploratory-editor-input-test-data" }}
                fullWidth
                multiline
                minRows={2}
                label={t("exploratory.editor.artifact.testData", "테스트 데이터")}
                value={sessionDraft.testData}
                onChange={(e) => setSessionDraft((prev) => ({ ...prev, testData: e.target.value }))}
                sx={{ mb: 1.5 }}
              />
              <Button
                data-testid="exploratory-editor-button-upload-artifact"
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                sx={{ mb: 1.5 }}
              >
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
                  inputProps={{ "data-testid": "exploratory-editor-input-evaluation-overall" }}
                  fullWidth
                  multiline
                  minRows={2}
                  label={t("exploratory.editor.evaluation.overall", "전체 평가")}
                  value={sessionDraft.evaluation}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, evaluation: e.target.value }))}
                />
                <TextField
                  inputProps={{ "data-testid": "exploratory-editor-input-evaluation-next-charter" }}
                  fullWidth
                  label={t("exploratory.editor.evaluation.nextCharter", "다음 세션 제안 차터")}
                  value={sessionDraft.nextCharter}
                  onChange={(e) => setSessionDraft((prev) => ({ ...prev, nextCharter: e.target.value }))}
                />
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}

export default ExploratorySessionEditorTab;
