// src/main/frontend/src/components/Settings/ManualViewer.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Replay as ReplayIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import MDEditor from "@uiw/react-md-editor";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../context/I18nContext";
import { getDynamicApiUrl } from "../../utils/apiConstants.js";

/**
 * 사용자 매뉴얼 뷰어 — 한국어/영어 두 매뉴얼을 토글로 전환하며 열람.
 * 이미지는 백엔드 /api/manual/images/{lang}/ 로 서빙된다 (본문에서 자동 재작성됨).
 */
const ManualViewer = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [lang, setLang] = useState(currentLanguage === "en" ? "en" : "ko");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchManual = useCallback(
    async (targetLang) => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = (await getDynamicApiUrl()) || window.location.origin;
        const res = await fetch(`${baseUrl}/api/manual/${targetLang}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setContent(await res.text());
      } catch (err) {
        console.error("Manual loading failed:", err);
        setError(
          t(
            "manual.viewer.error",
            "매뉴얼을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchManual(lang);
  }, [lang, fetchManual]);

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton color="inherit" onClick={handleClose} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <MenuBookIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold">
                {t("manual.viewer.title", "사용자 매뉴얼")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={lang}
                onChange={(e, v) => v && setLang(v)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  "& .MuiToggleButton-root": { color: "white", px: 1.5 },
                  "& .Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.35) !important",
                    color: "white !important",
                  },
                }}
              >
                <ToggleButton value="ko" data-testid="manual-lang-ko">
                  한국어
                </ToggleButton>
                <ToggleButton value="en" data-testid="manual-lang-en">
                  English
                </ToggleButton>
              </ToggleButtonGroup>
              <IconButton
                color="inherit"
                onClick={() => window.print()}
                title={t("manual.viewer.print", "인쇄")}
              >
                <PrintIcon />
              </IconButton>
              <IconButton color="inherit" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{
              p: 4,
              bgcolor: "white",
              minHeight: "60vh",
              position: "relative",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                }}
              >
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography color="text.secondary">
                  {t("manual.viewer.loading", "매뉴얼 로딩 중...")}
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ py: 5 }}>
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<ReplayIcon />}
                      onClick={() => fetchManual(lang)}
                    >
                      {t("manual.viewer.retry", "다시 시도")}
                    </Button>
                  }
                >
                  {error}
                </Alert>
              </Box>
            ) : (
              <div data-color-mode="light">
                <MDEditor.Markdown
                  source={content}
                  style={{ backgroundColor: "white", color: "#24292e" }}
                />
              </div>
            )}
          </Box>

          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderTop: "1px solid #eee",
              bgcolor: "#fafafa",
            }}
          >
            <Button variant="contained" onClick={handleClose} sx={{ px: 4 }}>
              {t("manual.viewer.close", "닫기")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ManualViewer;
