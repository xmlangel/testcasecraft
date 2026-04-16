// src/main/frontend/src/components/Settings/GoogleConfigManager.jsx
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
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import googleConfigApi from "../../services/googleConfigApi";
import { useI18n } from "../../context/I18nContext";

/**
 * 사용자별 Google Sheets 설정을 관리하는 컴포넌트 (CRUD)
 */
const GoogleConfigManager = () => {
  const { t } = useI18n();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonKey, setJsonKey] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await googleConfigApi.getMyConfig();
      setConfig(data);
      if (data) {
        setJsonKey(""); // 이미 설정이 있으면 입력창은 비움 (텍스트박스는 신규 입력용)
      }
    } catch (err) {
      console.error("설정 로딩 실패:", err);
      setError("구글 설정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedKey = jsonKey.trim();
    if (!trimmedKey) {
      setError("JSON 키 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await googleConfigApi.saveConfig(trimmedKey);
      setSuccess("Google Sheets 설정이 성공적으로 저장되었습니다.");
      setJsonKey("");
      await fetchConfig();
    } catch (err) {
      console.error("설정 저장 실패:", err);
      // 백엔드로부터 온 구체적인 에러 메시지 우선 표시
      let msg = "설정 저장 중 오류가 발생했습니다. 형식을 확인해주세요.";
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
        "구글 연동 설정을 완전히 삭제하시겠습니까? 관련 기능 사용이 제한될 수 있습니다.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await googleConfigApi.deleteMyConfig();
      setSuccess("Google 연동이 해제되었습니다.");
      setConfig(null);
      setJsonKey("");
    } catch (err) {
      console.error("삭제 실패:", err);
      setError("연동 해제 중 오류가 발생했습니다.");
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
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SettingsIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h5" fontWeight="bold">
          Google Sheets 연동 관리
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* 현재 설정 상태 */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" display="flex" alignItems="center">
              연동 상태
              {config ? (
                <CheckCircleIcon
                  sx={{ ml: 1, color: "success.main", fontSize: 20 }}
                />
              ) : (
                <InfoIcon sx={{ ml: 1, color: "warning.main", fontSize: 20 }} />
              )}
            </Typography>
            {config && (
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                variant="outlined"
                size="small"
                onClick={handleDelete}
              >
                연동 해제
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {config ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  연결된 서비스 계정 (Email)
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {config.clientEmail}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  프로젝트 ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {config.projectId}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  최종 업데이트
                </Typography>
                <Typography variant="body2">
                  {(() => {
                    if (!config.updatedAt) return "-";
                    if (Array.isArray(config.updatedAt)) {
                      const [y, m, d, h = 0, min = 0, s = 0] = config.updatedAt;
                      return new Date(y, m - 1, d, h, min, s).toLocaleString();
                    }
                    const date = new Date(config.updatedAt);
                    return isNaN(date.getTime()) ? "-" : date.toLocaleString();
                  })()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  상태
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: config.isActive ? "success.main" : "text.disabled",
                  }}
                >
                  {config.isActive ? "활성화됨" : "비활성"}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography color="text.secondary">
                현재 등록된 구글 인증 정보가 없습니다.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                테스트케이스 내보내기 기능을 사용하려면 아래에 Google 서비스
                계정 키 내용을 입력해주세요.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 설정/수정 폼 */}
      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          display="flex"
          alignItems="center"
        >
          <CloudUploadIcon sx={{ mr: 1, fontSize: 20 }} />
          {config ? "인증 정보 업데이트" : "새 인증 정보 등록"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Google Cloud Console에서 다운로드한 서비스 계정 키(JSON) 파일의{" "}
          <strong>전체 내용</strong>을 아래에 붙여넣으세요.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={10}
          variant="filled"
          label="Google Service Account JSON"
          placeholder='{ "type": "service_account", "project_id": "...", ... }'
          value={jsonKey}
          onChange={(e) => setJsonKey(e.target.value)}
          disabled={saving}
          sx={{
            mb: 3,
            "& .MuiFilledInput-root": {
              fontFamily: "monospace",
              fontSize: "0.875rem",
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            onClick={handleSave}
            disabled={saving || !jsonKey.trim()}
            sx={{ px: 4 }}
          >
            {saving
              ? "저장 중..."
              : config
                ? "설정 업데이트"
                : "연동 설정 저장"}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Accordion
          variant="outlined"
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <InfoIcon sx={{ mr: 1, color: "info.main", fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {t(
                  "google.guide.title",
                  "Google 서비스 계정 생성 및 설정 방법",
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: "background.default", p: 3 }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ "& p": { mb: 1.5 } }}
            >
              <p>
                {t(
                  "google.guide.step1",
                  "1. Google Cloud Console에서 프로젝트를 생성하고 'Google Sheets API'를 활성화합니다.",
                )}
              </p>
              <p>
                {t(
                  "google.guide.step2",
                  "2. '서비스 계정'을 생성하고 JSON 형식의 키를 발급받아 다운로드합니다.",
                )}
              </p>
              <p>
                {t(
                  "google.guide.step3",
                  "3. 다운로드한 JSON 파일의 내용을 복사하여 위의 입력란에 붙여넣고 저장합니다.",
                )}
              </p>
              <p>
                <strong>
                  {t(
                    "google.guide.step4",
                    "4. (중요) 내보낼 대상 구글 시트 파일에서 '공유' 버튼을 클릭합니다.",
                  )}
                </strong>
              </p>
              <p>
                {t(
                  "google.guide.step5",
                  "5. 서비스 계정의 이메일 주소(JSON 내 client_email)를 '편집자' 권한으로 추가하여 저장합니다.",
                )}
                {config?.clientEmail && (
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      mt: 1,
                      p: 1,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      fontWeight: "bold",
                      color: "primary.main",
                    }}
                  >
                    {config.clientEmail}
                  </Box>
                )}
              </p>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                * 상세 가이드는 프로젝트 루트의
                docs/guide/GOOGLE_SHEETS_SETUP_GUIDE.md 파일을 참고하세요.
              </Typography>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() =>
                    window.open(
                      "/guides/GOOGLE_SHEETS_SETUP_GUIDE.md",
                      "_blank",
                    )
                  }
                >
                  상세 가이드 새 창으로 보기
                </Button>
              </Box>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default GoogleConfigManager;
