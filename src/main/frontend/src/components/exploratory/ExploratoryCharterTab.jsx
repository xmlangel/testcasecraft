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
  useTheme,
} from "@mui/material";
import { useTheme as useAppTheme } from "../../context/ThemeContext.jsx";
import {
  Add as AddIcon,
  Archive as ArchiveIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import MarkdownFieldEditor from "../TestCase/MarkdownFieldEditor";
import MarkdownViewer from "../common/MarkdownViewer";

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
  charterErrors = {},
}) {
  const theme = useTheme();
  const { designSystem } = useAppTheme();
  const isDark = theme.palette.mode === "dark";
  const isGlass = designSystem === "glass";
  const [showExamples, setShowExamples] = React.useState(false);

  return (
    <Stack spacing={2}>
      {charterError && <Alert severity="error">{charterError}</Alert>}
      {chartersLoading && (
        <Alert severity="info">{t("common.loading", "로딩 중...")}</Alert>
      )}
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>
            {t("exploratory.charter.filter.status", "상태 필터")}
          </InputLabel>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewCharterDialog}
        >
          {t("exploratory.charter.create", "차터 생성")}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {!chartersLoading && filteredCharters.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              {t("exploratory.charter.empty", "등록된 차터가 없습니다.")}
            </Alert>
          </Grid>
        )}
        {filteredCharters.map((item) => {
          // 구분선(--- 또는 --)이 나오기 전까지의 내용을 추출하되, 여러 형태의 구분선 대응
          const missionSummary = item.mission
            ? item.mission.split(/\n\s*-{2,}\s*\n|\n\s*-{2,}\s*$/)[0].trim()
            : "";

          return (
            <Grid size={{ xs: 12, md: 6 }} key={item.id}>
              <Card
                variant="outlined"
                onClick={() => openEditCharterDialog(item)}
                sx={{
                  cursor: "pointer",
                  bgcolor: isGlass
                    ? isDark
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(255, 255, 255, 0.4)"
                    : "background.paper",
                  backdropFilter: isGlass ? "blur(4px)" : "none",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: isGlass
                      ? isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(255, 255, 255, 0.6)"
                      : "action.hover",
                    transform: isGlass ? "translateY(-2px)" : "none",
                  },
                  transition: "all 0.2s ease-in-out",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      color={statusColor[item.status] || "default"}
                      icon={
                        item.status === "ARCHIVED" ? <ArchiveIcon /> : undefined
                      }
                    />
                  </Box>
                  {missionSummary && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {missionSummary}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={charterDialogOpen}
        onClose={() => setCharterDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        fullScreen
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            {editingCharter
              ? t("exploratory.charter.dialog.editTitle", "차터 편집")
              : t("exploratory.charter.dialog.createTitle", "차터 생성")}
          </Box>
          <Button
            size="small"
            startIcon={<HelpIcon />}
            onClick={() => setShowExamples((prev) => !prev)}
            color="info"
          >
            {showExamples
              ? t("common.hide", "숨기기")
              : t("exploratory.charter.guide.show", "작성 가이드 보기")}
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <Collapse in={showExamples}>
              <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, fontWeight: 700 }}
                >
                  {t("exploratory.charter.guide.title", "차터 기본형 템플릿")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {t(
                    "exploratory.charter.guide.formula",
                    "무엇을(Target) + 어떤 자원으로(Resources) + 무엇을 찾을 것인지(Information)",
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.guide.example",
                    '"{Target}"를 대상으로, "{Resources}"를 사용해, "{Information}"를 찾는다.',
                  )}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, fontWeight: 700 }}
                >
                  {t("exploratory.charter.principles.title", "차터 설계 원칙")}
                </Typography>
                <Typography variant="body2">
                  •{" "}
                  {t(
                    "exploratory.charter.principles.specificity",
                    "적정 수준의 구체성: 테스트 방향을 제시할 수 있을 정도",
                  )}
                </Typography>
                <Typography variant="body2">
                  •{" "}
                  {t(
                    "exploratory.charter.principles.riskBased",
                    "리스크 기반 접근: 고위험 영역에 집중 배치",
                  )}
                </Typography>
                <Typography variant="body2">
                  •{" "}
                  {t(
                    "exploratory.charter.principles.focus",
                    "한 번에 한 임무 집중: 세션 중 몰입 환경 확보",
                  )}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, fontWeight: 700 }}
                >
                  {t(
                    "exploratory.charter.examples.templateTitle",
                    "작성 예시 (로그인 기능)",
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.examples.login.goal",
                    "- 목표: 일반/특수 사용자 로그인 안정성 검증",
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.examples.login.resources",
                    "- 자원: 테스트 계정, Postman, 개발자 도구",
                  )}
                </Typography>
                <Typography variant="body2">
                  {t(
                    "exploratory.charter.examples.login.notes",
                    "- 주의점: 토큰 유효성, 다국어 처리, 네트워크 지연",
                  )}
                </Typography>
              </Alert>
            </Collapse>
            <TextField
              fullWidth
              label={t("exploratory.charter.dialog.name", "차터 이름")}
              value={charterForm.title}
              onChange={(e) =>
                setCharterForm((prev) => ({ ...prev, title: e.target.value }))
              }
              error={!!charterErrors.title}
              helperText={charterErrors.title}
              required
            />
            <MarkdownFieldEditor
              label={t(
                "exploratory.charter.dialog.mission",
                "미션 내용 (Markdown)",
              )}
              value={charterForm.mission}
              placeholder={t(
                "exploratory.charter.dialog.missionPlaceholder",
                "차터 내용을 마크다운으로 작성하세요.",
              )}
              onChange={(val) =>
                setCharterForm((prev) => ({ ...prev, mission: val }))
              }
              theme={theme}
              t={t}
              height="calc(100vh - 250px)"
              error={!!charterErrors.mission}
              helperText={charterErrors.mission}
              preview={editingCharter ? "preview" : "live"}
            />
            <FormControl size="small">
              <InputLabel>
                {t("exploratory.charter.dialog.status", "상태")}
              </InputLabel>
              <Select
                value={charterForm.status}
                label={t("exploratory.charter.dialog.status", "상태")}
                onChange={(e) =>
                  setCharterForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCharterDialogOpen(false)}>
            {t("common.buttons.cancel", "취소")}
          </Button>
          <Button
            variant="contained"
            onClick={saveCharter}
            disabled={savingCharter}
          >
            {savingCharter
              ? t("common.saving", "저장 중...")
              : t("common.save", "저장")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ExploratoryCharterTab;
