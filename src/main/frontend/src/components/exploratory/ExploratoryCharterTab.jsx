import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Archive as ArchiveIcon } from "@mui/icons-material";

const parseMission = (mission, areas) => {
  const normalized = `${mission || ""}`.trim();
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const byPrefix = (prefix) => {
    const line = lines.find((item) => item.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : "";
  };

  const objective = byPrefix("- 목표:") || normalized;
  const resources = byPrefix("- 자원:") || areas || "";
  const timebox = byPrefix("- 시간:");
  const cautions = byPrefix("- 주의점:");
  const records = byPrefix("- 기록:");

  return { objective, resources, timebox, cautions, records };
};

function ExploratoryCharterTab({
  t,
  charterError,
  chartersLoading,
  charterFilter,
  setCharterFilter,
  openNewCharterDialog,
  filteredCharters,
  openEditCharterDialog,
  statusColor,
  charterDialogOpen,
  setCharterDialogOpen,
  editingCharter,
  charterForm,
  setCharterForm,
  saveCharter,
  savingCharter,
}) {
  const [showExamples, setShowExamples] = React.useState(false);

  return (
    <Stack spacing={2}>
      {charterError && <Alert severity="error">{charterError}</Alert>}
      {chartersLoading && <Alert severity="info">{t("common.loading", "로딩 중...")}</Alert>}
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
        {!chartersLoading && filteredCharters.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">{t("exploratory.charter.empty", "등록된 차터가 없습니다.")}</Alert>
          </Grid>
        )}
        {filteredCharters.map((item) => (
          (() => {
            const mission = parseMission(item.mission, item.areas);
            return (
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
                  {t("exploratory.charter.goal", "목표")}: {mission.objective || "-"}
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 1 }}>
                  {mission.resources && (
                    <Typography variant="caption" color="text.secondary">
                      {t("exploratory.charter.resources", "자원")}: {mission.resources}
                    </Typography>
                  )}
                  {mission.timebox && (
                    <Typography variant="caption" color="text.secondary">
                      {t("exploratory.charter.timebox", "시간")}: {mission.timebox}
                    </Typography>
                  )}
                  {mission.cautions && (
                    <Typography variant="caption" color="text.secondary">
                      {t("exploratory.charter.cautions", "주의점")}: {mission.cautions}
                    </Typography>
                  )}
                  {mission.records && (
                    <Typography variant="caption" color="text.secondary">
                      {t("exploratory.charter.records", "기록")}: {mission.records}
                    </Typography>
                  )}
                </Stack>
                <Button size="small" onClick={() => openEditCharterDialog(item)}>
                  {t("common.buttons.edit", "편집")}
                </Button>
              </CardContent>
            </Card>
          </Grid>
            );
          })()
        ))}
      </Grid>

      <Dialog open={charterDialogOpen} onClose={() => setCharterDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingCharter
            ? t("exploratory.charter.dialog.editTitle", "차터 편집")
            : t("exploratory.charter.dialog.createTitle", "차터 생성")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            {!editingCharter && (
              <Alert severity="info" variant="outlined">
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                  {t("exploratory.charter.guide.title", "차터 기본형 템플릿")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {t(
                    "exploratory.charter.guide.formula",
                    "무엇을(Target) + 어떤 자원으로(Resources) + 무엇을 찾을 것인지(Information)"
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.guide.example",
                    "\"{Target}\"를 대상으로, \"{Resources}\"를 사용해, \"{Information}\"를 찾는다."
                  )}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontWeight: 700 }}>
                  {t("exploratory.charter.principles.title", "차터 설계 원칙")}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.principles.specificity",
                    "1. 적정 수준의 구체성: 너무 구체적이지 않으면서도 테스트 방향을 제시할 수 있을 정도로 작성"
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.principles.riskBased",
                    "2. 리스크 기반 접근: 제품 리스크에 기반하여 고위험 영역에 차터를 집중 배치"
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.principles.focus",
                    "3. 한 번에 한 임무 집중: 원칙적으로 세션당 하나의 차터를 수행하며, 세션 중 다른 업무로 방해받지 않도록 몰입 환경 확보"
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.principles.flexibility",
                    "4. 유연한 설계: 테스트 수행 중 발견된 아이디어를 활용할 수 있도록 유연하게 설계"
                  )}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button size="small" variant="text" onClick={() => setShowExamples((prev) => !prev)}>
                    {showExamples
                      ? t("exploratory.charter.examples.hide", "예시 닫기")
                      : t("exploratory.charter.examples.show", "예시 보기")}
                  </Button>
                </Box>
                <Collapse in={showExamples}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                    {t("exploratory.charter.examples.templateTitle", "기본 차터 템플릿")}
                  </Typography>
                  <Typography variant="body2">• {t("exploratory.charter.examples.template.goal", "목표: 테스트할 기능이나 영역")}</Typography>
                  <Typography variant="body2">• {t("exploratory.charter.examples.template.resources", "자원: 사용 도구, 데이터, 환경")}</Typography>
                  <Typography variant="body2">• {t("exploratory.charter.examples.template.timebox", "시간 제한: 세션 지속 시간")}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • {t("exploratory.charter.examples.template.info", "정보/관찰 포인트: 찾을 버그 유형이나 주의사항")}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                    {t("exploratory.charter.examples.login.title", "실제 작성 예시 1: 로그인 기능")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.login.charterTitle", "차터 제목: 로그인 모듈 안정성 테스트")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.login.goal", "- 목표: 일반/특수 사용자 로그인 (비밀번호 8자 이상, 특수문자 포함)")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.login.resources", "- 자원: 테스트 계정 10개 (유효/잠금/만료), Postman, 브라우저 개발자 도구")}
                  </Typography>
                  <Typography variant="body2">{t("exploratory.charter.examples.login.timebox", "- 시간: 60분")}</Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.login.notes", "- 주의점: 인증 토큰 유효성, 에러 메시지 다국어 처리, 네트워크 지연 시나리오")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t("exploratory.charter.examples.login.record", "- 기록: 발견 버그 #ID, 스크린샷 첨부 [web:10]")}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
                    {t("exploratory.charter.examples.api.title", "실제 작성 예시 2: API 응답 테스트")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.api.charterTitle", "차터 제목: 사용자 검색 API 탐색")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.api.goal", "- 목표: 검색 쿼리 변형 (공백, 특수문자, 한글/영문 혼합)")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.api.resources", "- 자원: PostgreSQL 더미 데이터, curl/Postman, Wireshark")}
                  </Typography>
                  <Typography variant="body2">{t("exploratory.charter.examples.api.timebox", "- 시간: 120분")}</Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.api.notes", "- 주의점: 응답 시간 >2초, SQL 인젝션 취약점, 페이징 오류")}
                  </Typography>
                  <Typography variant="body2">
                    {t("exploratory.charter.examples.api.record", "- 기록: 응답 코드, payload 예시, 예상치 못한 동작 [web:7]")}
                  </Typography>
                </Collapse>
              </Alert>
            )}
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
              label={t("exploratory.charter.dialog.objective", "목표")}
              value={charterForm.objective}
              placeholder={t(
                "exploratory.charter.dialog.objectivePlaceholder",
                "예) 일반/특수 사용자 로그인 시나리오의 안정성을 검증한다."
              )}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, objective: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t("exploratory.charter.dialog.resources", "자원")}
              value={charterForm.resources}
              placeholder={t(
                "exploratory.charter.dialog.resourcesPlaceholder",
                "예) 테스트 계정 10개(유효/잠금/만료), Postman, 브라우저 개발자 도구"
              )}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, resources: e.target.value }))}
            />
            <TextField
              fullWidth
              label={t("exploratory.charter.dialog.timebox", "시간")}
              value={charterForm.timebox}
              placeholder={t("exploratory.charter.dialog.timeboxPlaceholder", "예) 60분")}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, timebox: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t("exploratory.charter.dialog.cautions", "주의점")}
              value={charterForm.cautions}
              placeholder={t(
                "exploratory.charter.dialog.cautionsPlaceholder",
                "예) 인증 토큰 유효성, 에러 메시지 다국어 처리, 네트워크 지연 시나리오"
              )}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, cautions: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label={t("exploratory.charter.dialog.records", "기록")}
              value={charterForm.records}
              placeholder={t(
                "exploratory.charter.dialog.recordsPlaceholder",
                "예) 발견 버그 #ID, 스크린샷 첨부 [web:10]"
              )}
              onChange={(e) => setCharterForm((prev) => ({ ...prev, records: e.target.value }))}
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
          <Button variant="contained" onClick={saveCharter} disabled={savingCharter}>
            {savingCharter ? t("common.saving", "저장 중...") : t("common.save", "저장")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ExploratoryCharterTab;
