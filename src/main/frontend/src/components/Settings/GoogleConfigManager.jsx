import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Chip,
  List,
  ListItem,
  Zoom,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import googleConfigApi from "../../services/googleConfigApi";
import { useI18n } from "../../context/I18nContext";
import { useDateFormatter } from "../../hooks/useDateFormatter";

/**
 * 사용자별 Google Sheets 설정을 관리하는 컴포넌트 (Premium UI)
 */
const GoogleConfigManager = () => {
  const { t } = useI18n();
  const { formatDate } = useDateFormatter();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonKey, setJsonKey] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await googleConfigApi.getMyConfig();
      setConfig(data);
      if (data) {
        setJsonKey("");
      }
    } catch (err) {
      console.error("설정 로딩 실패:", err);
      setError(
        t(
          "google.config.fetchError",
          "구글 설정을 불러오는 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedKey = jsonKey.trim();
    if (!trimmedKey) {
      setError(
        t("google.config.error.jsonRequired", "JSON 키 내용을 입력해주세요."),
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await googleConfigApi.saveConfig(trimmedKey);
      setSuccess(
        t(
          "google.config.success.save",
          "Google Sheets 설정이 성공적으로 저장되었습니다.",
        ),
      );
      setJsonKey("");
      await fetchConfig();
    } catch (err) {
      console.error("설정 저장 실패:", err);
      let msg = t(
        "google.config.saveError",
        "설정 저장 중 오류가 발생했습니다. 형식을 확인해주세요.",
      );
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        t(
          "google.config.confirm.delete",
          "구글 연동 설정을 완전히 삭제하시겠습니까? 관련 기능 사용이 제한될 수 있습니다.",
        ),
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await googleConfigApi.deleteMyConfig();
      setSuccess(
        t("google.config.success.delete", "Google 연동이 해제되었습니다."),
      );
      setConfig(null);
      setJsonKey("");
    } catch (err) {
      console.error("삭제 실패:", err);
      setError(
        t(
          "google.config.error.deleteFailed",
          "연동 해제 중 오류가 발생했습니다.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !saving) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0.5 }}>
      {error && (
        <Zoom in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Zoom>
      )}
      {success && (
        <Zoom in={!!success}>
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        </Zoom>
      )}

      {/* 현재 설정 상태 카드 */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #1e1e1e 100%)`
              : `linear-gradient(135deg, #ffffff 0%, #f8faff 100%)`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="800"
              display="flex"
              alignItems="center"
              color="primary.main"
              sx={{ letterSpacing: -0.5 }}
            >
              <AutoAwesomeIcon sx={{ mr: 1, fontSize: 20 }} />
              {t("google.config.status", "연동 상태")}
              {config && (
                <Chip
                  label={t("google.config.active", "활성화됨")}
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                  sx={{ ml: 2, fontWeight: "bold", borderRadius: 1.5 }}
                />
              )}
            </Typography>
            {config && (
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                variant="outlined"
                size="small"
                onClick={handleDelete}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "error.lighter" },
                }}
              >
                {t("google.config.disconnect", "연동 해제")}
              </Button>
            )}
          </Box>

          <Box sx={{ p: 1 }}>
            {config ? (
              <List disablePadding>
                <ListItem
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    py: 2,
                    px: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                    }}
                  >
                    {t("google.config.email", "연결된 서비스 계정 (Email)")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                      gap: 2,
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      sx={{
                        wordBreak: "break-all",
                        fontFamily: "'Roboto Mono', monospace",
                        color: "primary.dark",
                      }}
                    >
                      {config.clientEmail}
                    </Typography>
                    <Tooltip
                      title={
                        copySuccess
                          ? t("common.copied", "복사됨!")
                          : t("common.copy", "복사")
                      }
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(config.clientEmail)}
                        sx={{
                          bgcolor: "background.paper",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s",
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>

                <Divider sx={{ mx: 2 }} />

                <Grid container>
                  <Grid item xs={12} sm={6}>
                    <ListItem
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        py: 2,
                        px: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                        }}
                      >
                        {t("google.config.projectId", "프로젝트 ID")}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ wordBreak: "break-all", color: "text.primary" }}
                      >
                        {config.projectId}
                      </Typography>
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItem
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        py: 2,
                        px: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                        }}
                      >
                        {t("google.config.lastUpdated", "최종 업데이트")}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        color="text.primary"
                      >
                        {formatDate(config.updatedAt)}
                      </Typography>
                    </ListItem>
                  </Grid>
                </Grid>
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 5, px: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  {t(
                    "google.config.noConfigDesc",
                    "테스트케이스 내보내기 기능을 사용하려면 아래에 Google 서비스 계정 키 내용을 입력해주세요.",
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 설정/수정 폼 */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="800"
          gutterBottom
          display="flex"
          alignItems="center"
          sx={{ mb: 2, color: "text.primary" }}
        >
          <CloudUploadIcon
            sx={{ mr: 1, fontSize: 20, color: "primary.main" }}
          />
          {config
            ? t("google.config.form.updateTitle", "인증 정보 업데이트")
            : t("google.config.form.registerTitle", "새 인증 정보 등록")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          {t(
            "google.config.inputDesc",
            "Google Cloud Console에서 다운로드한 서비스 계정 키(JSON) 파일의 전체 내용을 아래에 붙여넣으세요.",
          )}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          placeholder={t(
            "google.config.placeholder",
            '{ "type": "service_account", ... }',
          )}
          value={jsonKey}
          onChange={(e) => setJsonKey(e.target.value)}
          disabled={saving}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              fontFamily: "'Roboto Mono', monospace",
              fontSize: "0.825rem",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.01)",
              borderRadius: 2,
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disableElevation
            size="large"
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            onClick={handleSave}
            disabled={saving || !jsonKey.trim()}
            sx={{
              px: 4,
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: (theme) =>
                `0 4px 14px ${theme.palette.primary.main}40`,
            }}
          >
            {saving
              ? t("google.config.button.saving", "저장 중...")
              : config
                ? t("google.config.update", "설정 업데이트")
                : t("google.config.save", "연동 설정 저장")}
          </Button>
        </Box>
      </Paper>

      {/* 도움말 섹션 */}
      <Box sx={{ mt: 3 }}>
        <Accordion
          elevation={0}
          variant="outlined"
          sx={{
            borderRadius: "16px !important",
            overflow: "hidden",
            borderColor: "divider",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: "action.hover",
              "&.Mui-expanded": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <InfoIcon sx={{ mr: 1, color: "info.main", fontSize: 18 }} />
              <Typography variant="body2" fontWeight="700">
                {t(
                  "google.guide.title",
                  "Google 서비스 계정 생성 및 설정 방법",
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: "background.paper", p: 3 }}>
            <Box
              sx={{
                "& p": { mb: 2, fontSize: "0.875rem", color: "text.primary" },
              }}
            >
              {[1, 2, 3, 4, 5].map((step) => (
                <Typography
                  key={step}
                  variant="body2"
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    fontWeight: step === 4 ? "bold" : "normal",
                    color: step === 4 ? "primary.main" : "text.secondary",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: step === 4 ? "primary.main" : "divider",
                      color: step === 4 ? "white" : "text.primary",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      mr: 1.5,
                      mt: 0.2,
                    }}
                  >
                    {step}
                  </Box>
                  {t(`google.guide.step${step}`, `Step ${step}`)}
                </Typography>
              ))}

              {config?.clientEmail && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(25, 118, 210, 0.1)"
                        : "primary.lighter",
                    borderRadius: 2,
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 0.5, opacity: 0.8 }}
                  >
                    {t("google.config.email.hint", "공유 추가할 이메일:")}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {config.clientEmail}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "google.config.guide.footer",
                    "* 상세 가이드는 프로젝트 루트의 docs/guide/GOOGLE_SHEETS_SETUP_GUIDE.md 파일을 참고하세요.",
                  )}
                </Typography>
                <Button
                  variant="text"
                  color="info"
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() =>
                    window.open(
                      "/guides/GOOGLE_SHEETS_SETUP_GUIDE.md",
                      "_blank",
                    )
                  }
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  {t("google.config.guide.openButton", "상세 가이드 보기")}
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default GoogleConfigManager;
