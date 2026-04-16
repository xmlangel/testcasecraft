// src/main/frontend/src/components/Settings/GuideViewer.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Replay as ReplayIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import MDEditor from "@uiw/react-md-editor";
import { useNavigate, useParams } from "react-router-dom";
import guidesApi from "../../api/guidesApi";

/**
 * 범용 마크다운 가이드 뷰어 컴포넌트
 * URL 파라미터 :guideName을 통해 어떤 마크다운 파일이든 렌더링 가능
 */
const GuideViewer = () => {
  const { guideName } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("가이드");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (guideName) {
      fetchGuide(guideName);
    }
  }, [guideName]);

  const fetchGuide = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const data = await guidesApi.getGuide(name);
      setContent(data);

      // 마크다운 내용에서 첫 번째 H1 제목(# ...) 추출 시도
      const titleMatch = data.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        setTitle(titleMatch[1].trim());
      } else {
        // 파일 이름을 제목 대안으로 사용 (확장자 제거 및 스네이크 케이스 변환 등)
        const cleanName = name.replace(".md", "").replace(/_/g, " ");
        setTitle(cleanName);
      }
    } catch (err) {
      console.error("가이드 로딩 실패:", err);
      setError(
        "요청하신 가이드 문서를 찾을 수 없거나 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
              <DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
            </Box>
            <Box>
              <IconButton color="inherit" onClick={handlePrint} title="인쇄">
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
                  가이드 로딩 중...
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
                      onClick={() => fetchGuide(guideName)}
                    >
                      다시 시도
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

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderTop: "1px solid #eee",
              bgcolor: "#fafafa",
            }}
          >
            <Button variant="contained" onClick={handleClose} sx={{ px: 4 }}>
              닫기
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default GuideViewer;
