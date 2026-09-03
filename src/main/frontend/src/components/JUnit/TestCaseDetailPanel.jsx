// src/components/JUnit/TestCaseDetailPanel.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid, // Added Grid import
  Collapse,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as ErrorIcon,
  SkipNext as SkipIcon,
  BugReport as BugIcon,
  Speed as SpeedIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Assignment as PropertiesIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";

/**
 * 테스트 케이스 상세 패널 컴포넌트
 * tracelog와 testbody를 탭 형태로 표시
 */
/**
 * 문자열이 JSON 묶음인지 본다.
 *
 * 자동화 도구가 스텝 타임라인처럼 구조가 있는 값을 속성으로 올린다. 그 값을 한 덩어리
 * 문자열로 그리면 줄이 끝없이 이어져 읽을 수 없다.
 */
const parseJsonValue = (value) => {
  if (typeof value !== "string") {
    return Array.isArray(value) || (value && typeof value === "object")
      ? value
      : null;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

/** 값 하나를 읽을 수 있는 형태로. 원시 값은 그대로, 묶음은 다시 들어간다 */
const JsonNode = ({ label, value, depth = 0, isDarkMode, theme }) => {
  const nested = value && typeof value === "object";
  if (!nested) {
    return (
      <Box sx={{ display: "flex", gap: 1, py: 0.25, pl: depth * 1.5 }}>
        {label != null && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.secondary", flexShrink: 0 }}
          >
            {label}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color:
              typeof value === "number" || typeof value === "boolean"
                ? theme.palette.info.main
                : "text.primary",
          }}
        >
          {value == null ? "—" : String(value)}
        </Typography>
      </Box>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [`${i + 1}`, v])
    : Object.entries(value);

  return (
    <Box sx={{ pl: depth * 1.5 }}>
      {label != null && (
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: "primary.main", display: "block" }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          borderLeft: depth > 0 ? `2px solid ${theme.palette.divider}` : "none",
          pl: depth > 0 ? 1 : 0,
          mb: 0.5,
        }}
      >
        {entries.map(([k, v]) => (
          <JsonNode
            key={k}
            label={k}
            value={v}
            depth={0}
            isDarkMode={isDarkMode}
            theme={theme}
          />
        ))}
      </Box>
    </Box>
  );
};

/** JSON 속성 하나. 기본은 접혀 있고 원문 보기로 바꿀 수 있다 */
const JsonProperty = ({ name, parsed, raw, isDarkMode, theme, t }) => {
  const [open, setOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const count = Array.isArray(parsed)
    ? parsed.length
    : Object.keys(parsed).length;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton size="small" onClick={() => setOpen((v) => !v)}>
          {open ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
        <Typography
          variant="caption"
          onClick={() => setOpen((v) => !v)}
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.7rem",
            cursor: "pointer",
            color: "text.secondary",
          }}
        >
          {name}
        </Typography>
        <Chip
          size="small"
          label={
            Array.isArray(parsed)
              ? t("junit.testcase.jsonItems", "항목 {n}").replace("{n}", count)
              : t("junit.testcase.jsonFields", "칸 {n}").replace("{n}", count)
          }
          sx={{ height: 18, fontSize: "0.65rem" }}
        />
        <Box sx={{ flex: 1 }} />
        {open && (
          <Button size="small" onClick={() => setShowRaw((v) => !v)}>
            {showRaw
              ? t("junit.testcase.jsonStructured", "구조 보기")
              : t("junit.testcase.jsonRaw", "원문 보기")}
          </Button>
        )}
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ pl: 4, pt: 0.5 }}>
          {showRaw ? (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1,
                borderRadius: 1,
                bgcolor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.9)
                  : "#fbfbfd",
                border: `1px solid ${theme.palette.divider}`,
                fontFamily: "monospace",
                fontSize: "0.75rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 320,
                overflow: "auto",
              }}
            >
              {(() => {
                try {
                  return JSON.stringify(parsed, null, 2);
                } catch {
                  return String(raw);
                }
              })()}
            </Box>
          ) : (
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {(Array.isArray(parsed)
                ? parsed.map((v, i) => [`${i + 1}`, v])
                : Object.entries(parsed)
              ).map(([k, v]) => (
                <Box
                  key={k}
                  sx={{
                    mb: 0.75,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 0.6)
                      : "#ffffff",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <JsonNode
                    label={k}
                    value={v}
                    isDarkMode={isDarkMode}
                    theme={theme}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

const TestCaseDetailPanel = ({
  testCaseId,
  refreshTrigger = 0,
  onClose,
  onEditTestCase,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
}) => {
  const { api } = useAppContext();
  const { t } = useI18n();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [loading, setLoading] = useState(false);
  const [testCaseDetails, setTestCaseDetails] = useState(null);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [previousNoteInfo, setPreviousNoteInfo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  // 인증이 필요한 주소라 <img src> 로는 못 그린다. 받아 온 blob 주소를 첨부 id 로 든다
  const [thumbUrls, setThumbUrls] = useState({});

  // 상태별 설정
  const statusConfig = {
    PASSED: {
      color: "success",
      icon: <PassIcon />,
      label: t("junit.stats.passed"),
      bgColor: isDarkMode ? alpha(theme.palette.success.main, 0.2) : "#e8f5e8",
    },
    FAILED: {
      color: "error",
      icon: <FailIcon />,
      label: t("junit.stats.failed"),
      bgColor: isDarkMode ? alpha(theme.palette.error.main, 0.2) : "#ffebee",
    },
    ERROR: {
      color: "warning",
      icon: <ErrorIcon />,
      label: t("junit.stats.error"),
      bgColor: isDarkMode ? alpha(theme.palette.warning.main, 0.2) : "#fff3e0",
    },
    SKIPPED: {
      color: "default",
      icon: <SkipIcon />,
      label: t("junit.stats.skipped"),
      bgColor: isDarkMode
        ? alpha(theme.palette.action.disabledBackground, 0.1)
        : "#f5f5f5",
    },
  };

  // 테스트 케이스 상세 정보 로드
  const loadTestCaseDetails = async () => {
    if (!testCaseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api(
        `/api/junit-results/testcases/${testCaseId}/details`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTestCaseDetails(data.testCase);
      } else {
        setError(data.error || t("junit.testcase.noDetailInfo"));
      }
    } catch (err) {
      console.error("테스트 케이스 상세 정보 로드 실패:", err);
      setError(t("junit.testcase.noDetailInfo"));
    } finally {
      setLoading(false);
    }
  };

  // 이 케이스에 붙은 첨부(스크린샷 등)를 불러온다
  const loadAttachments = async () => {
    if (!testCaseId) {
      setAttachments([]);
      return;
    }
    setAttachmentsLoading(true);
    try {
      const response = await api(
        `/api/junit-results/cases/${testCaseId}/attachments`,
        { method: "GET" },
      );
      if (!response.ok) {
        setAttachments([]);
        return;
      }
      const data = await response.json();
      const list = data.success ? data.attachments || [] : [];
      setAttachments(list);
      loadThumbs(list);
    } catch (err) {
      console.error("자동화 케이스 첨부 로드 실패:", err);
      setAttachments([]);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // 이미지 본문을 인증된 요청으로 받아 blob 주소로 만든다.
  //
  // 내려받기 주소는 인증 헤더를 요구하므로 <img src> 를 그대로 걸면 요청이 거부되고
  // 깨진 이미지만 남는다. 토큰을 주소에 실으면 브라우저 이력·리퍼러·접근 로그에
  // 남으므로 그 길은 쓰지 않는다. 제품의 다른 첨부 화면도 같은 방식이다.
  const loadThumbs = async (list) => {
    for (const att of list) {
      if (!att.image) continue;
      try {
        const res = await api(att.downloadUrl, { method: "GET" });
        if (!res.ok) continue;
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        setThumbUrls((prev) => {
          if (prev[att.id]) {
            window.URL.revokeObjectURL(url);
            return prev;
          }
          return { ...prev, [att.id]: url };
        });
      } catch (err) {
        console.error("자동화 케이스 첨부 이미지 로드 실패:", att.id, err);
      }
    }
  };

  // 인증된 요청으로 받아 내려준다. <a download> 는 헤더를 싣지 못한다
  const downloadAttachment = async (att) => {
    try {
      const res = await api(att.downloadUrl, { method: "GET" });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.originalFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("자동화 케이스 첨부 내려받기 실패:", att.id, err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes == null) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (testCaseId) {
      loadTestCaseDetails();
      fetchPreviousNote();
      loadAttachments();
    }
  }, [testCaseId, refreshTrigger]);

  // 다른 케이스로 옮기거나 패널을 닫으면 앞서 만든 blob 주소를 되돌린다.
  // 정리하지 않으면 케이스를 넘길수록 이미지가 메모리에 쌓인다
  useEffect(() => {
    return () => {
      setThumbUrls((prev) => {
        Object.values(prev).forEach((url) => window.URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [testCaseId]);

  const fetchPreviousNote = async () => {
    try {
      const response = await api(
        `/api/junit-results/testcases/${testCaseId}/previous-notes`,
        { method: "GET" },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hasNotes) {
          setPreviousNoteInfo(data);
        } else {
          setPreviousNoteInfo(null);
        }
      }
    } catch (err) {
      console.error("이전 노트 정보 로드 실패:", err);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 전체화면 핸들러
  const handleFullscreenToggle = () => {
    setFullscreenOpen(!fullscreenOpen);
  };

  // 실행 시간 포맷
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // 탭 패널 컴포넌트
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`testcase-tabpanel-${index}`}
      aria-labelledby={`testcase-tab-${index}`}
      style={{
        height: value === index ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2, flex: 1, overflow: "hidden" }}>{children}</Box>
      )}
    </div>
  );

  // ICT-337: 모든 속성(Properties) 렌더링 함수
  const renderProperties = (properties) => {
    if (!properties || Object.keys(properties).length === 0) return null;

    // ICT-337: 이미 상단 헤더나 다른 섹션에 명확하게 표시된 속성은 제외하여 중복 방지
    const excludedKeys = [
      "ExpectedResult",
      "ActualResult",
      "userTitle",
      "Description",
      "Step",
      "expected",
      "actual",
      "description",
      "step",
    ];
    const filteredProperties = Object.entries(properties).filter(
      ([key]) =>
        !excludedKeys.some(
          (excluded) => excluded.toLowerCase() === key.toLowerCase(),
        ),
    );

    if (filteredProperties.length === 0) return null;

    return (
      <Card
        sx={{
          mb: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          bgcolor: isDarkMode
            ? alpha(theme.palette.info.main, 0.05)
            : "#f0f7ff",
        }}
      >
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Typography
            variant="subtitle2"
            color="info.main"
            sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
          >
            <PropertiesIcon fontSize="small" />
            Execution Properties
          </Typography>
          <Grid container spacing={1}>
            {filteredProperties.map(([key, value]) => {
              const parsed = parseJsonValue(value);
              if (parsed) {
                return (
                  <Grid item xs={12} key={key}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.background.paper, 0.8)
                          : "#ffffff",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <JsonProperty
                        name={key}
                        parsed={parsed}
                        raw={value}
                        isDarkMode={isDarkMode}
                        theme={theme}
                        t={t}
                      />
                    </Box>
                  </Grid>
                );
              }
              return (
                <Grid
                  item
                  xs={12}
                  sm={
                    key.length > 20 || (value && value.toString().length > 50)
                      ? 12
                      : 6
                  }
                  key={key}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.background.paper, 0.8)
                        : "#ffffff",
                      border: `1px solid ${theme.palette.divider}`,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: "bold",
                        display: "block",
                        mb: 0.5,
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                      }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: "0.85rem",
                      }}
                    >
                      {String(value)}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // 상세 단계 렌더링 헬퍼 함수
  const renderDetailedSteps = (tracelog) => {
    if (!tracelog) return null;
    if (
      !tracelog.expectedResult &&
      !tracelog.actualResult &&
      (!tracelog.testSteps || tracelog.testSteps.length === 0)
    ) {
      return null;
    }

    return (
      <Card sx={{ mb: 2, border: `1px solid ${theme.palette.primary.main}` }}>
        <CardContent>
          <Typography
            variant="subtitle2"
            color="primary"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <BugIcon fontSize="small" />
            Detailed Test steps
          </Typography>

          {/* 상위 수준 기대/실제 결과 */}
          {(tracelog.expectedResult || tracelog.actualResult) && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
                  >
                    EXPECTED
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.success.main, 0.05)
                        : "#f8fff8",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      whiteSpace: "pre-wrap",
                      minHeight: "60px",
                    }}
                  >
                    {tracelog.expectedResult || "N/A"}
                  </Paper>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color={
                      testCaseDetails.status === "PASSED" ? "success" : "error"
                    }
                    sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
                  >
                    ACTUAL
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: isDarkMode
                        ? alpha(
                            testCaseDetails.status === "PASSED"
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                            0.05,
                          )
                        : testCaseDetails.status === "PASSED"
                          ? "#f8fff8"
                          : "#fffaf8",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      whiteSpace: "pre-wrap",
                      minHeight: "60px",
                    }}
                  >
                    {tracelog.actualResult || "N/A"}
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

          {/* 단계별 상세 내역 */}
          {tracelog.testSteps && tracelog.testSteps.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: "bold", mb: 1, display: "block" }}
              >
                STEPS
              </Typography>
              {tracelog.testSteps.map((step, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 0.5)
                      : "#fcfcfc",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: theme.palette.primary.main }}
                  >
                    STEP {step.index || idx + 1}
                  </Typography>
                  {step.content && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {step.content}
                    </Typography>
                  )}

                  {step.action && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}
                      >
                        {t("junit.testcase.stepAction")}
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: isDarkMode
                            ? alpha(theme.palette.info.main, 0.08)
                            : "#f5f7fa",
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflow: "auto",
                        }}
                      >
                        {step.action}
                      </Box>
                    </Box>
                  )}

                  {step.sql && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}
                      >
                        SQL / QUERY:
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1,
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderLeft: `3px solid ${theme.palette.primary.light}`,
                          whiteSpace: "pre-wrap",
                          overflowX: "auto",
                        }}
                      >
                        {step.sql}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {step.expected && (
                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography variant="caption" color="text.secondary">
                          EXPECTED:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 1,
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            bgcolor: alpha(
                              theme.palette.action.disabledBackground,
                              0.05,
                            ),
                            borderLeft: `3px solid ${theme.palette.success.light}`,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {step.expected}
                        </Box>
                      </Box>
                    )}
                    {step.actual && (
                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography
                          variant="caption"
                          color={
                            testCaseDetails.status === "PASSED"
                              ? "success"
                              : "error"
                          }
                        >
                          ACTUAL:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 1,
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            bgcolor: alpha(
                              theme.palette.action.disabledBackground,
                              0.05,
                            ),
                            borderLeft: `3px solid ${
                              testCaseDetails.status === "PASSED"
                                ? theme.palette.success.light
                                : theme.palette.error.light
                            }`,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {step.actual}
                        </Box>
                      </Box>
                    )}
                    {/* 기타 동적 필드 렌더링 */}
                    {Object.entries(step)
                      .filter(
                        ([key]) =>
                          ![
                            "index",
                            "sql",
                            "expected",
                            "actual",
                            "content",
                            "action",
                          ].includes(key),
                      )
                      .map(([key, value]) => (
                        <Box key={key} sx={{ flex: 1, minWidth: "200px" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase" }}
                          >
                            {key}:
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              m: 0,
                              p: 1,
                              fontSize: "0.75rem",
                              fontFamily: "monospace",
                              bgcolor: alpha(
                                theme.palette.action.disabledBackground,
                                0.02,
                              ),
                              borderLeft: `3px solid ${theme.palette.divider}`,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {String(value)}
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!testCaseId) {
    return (
      <Paper
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {t("junit.testcase.selectCase")}
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {t("junit.testcase.loadingDetail")}
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {t("junit.testcase.errorOccurred")}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!testCaseDetails) {
    return (
      <Paper sx={{ p: 3, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{t("junit.testcase.noData")}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Alert severity="warning">{t("junit.testcase.noDetailInfo")}</Alert>
      </Paper>
    );
  }

  const statusInfo =
    statusConfig[testCaseDetails.status] || statusConfig.PASSED;

  return (
    <Paper
      sx={{
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 0.5, wordBreak: "break-word" }}>
              {testCaseDetails.userInfo?.userTitle ||
                testCaseDetails.properties?.userTitle ||
                testCaseDetails.properties?.Description ||
                testCaseDetails.name}
            </Typography>
            {(testCaseDetails.userInfo?.userTitle ||
              testCaseDetails.properties?.userTitle ||
              testCaseDetails.properties?.Description) && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                {testCaseDetails.name}
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              {testCaseDetails.className}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={statusInfo.icon}
                label={statusInfo.label}
                size="small"
                sx={{ bgcolor: statusInfo.bgColor }}
              />
              <Chip
                icon={<SpeedIcon />}
                label={formatDuration(testCaseDetails.time)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* 네비게이션 버튼 */}
            <Tooltip title={t("junit.testcase.previous")}>
              <span>
                <IconButton
                  onClick={onNavigatePrev}
                  size="small"
                  disabled={!hasPrev}
                  color="primary"
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t("junit.testcase.next")}>
              <span>
                <IconButton
                  onClick={onNavigateNext}
                  size="small"
                  disabled={!hasNext}
                  color="primary"
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* 전체화면 버튼 (Tracelog 또는 Test Body 탭이 활성화되면 표시) */}
            {(tabValue === 0 || tabValue === 1) && (
              <Tooltip title={t("common.fullscreen", "전체화면")}>
                <IconButton
                  onClick={handleFullscreenToggle}
                  size="small"
                  color="primary"
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            )}
            {onEditTestCase && (
              <Tooltip title={t("junit.testcase.edit")}>
                <IconButton
                  onClick={() => {
                    // JunitTestCaseEditor 호환성을 위해 userInfo 필드를 최상위로 위치시킴
                    const normalizedTestCase = {
                      ...testCaseDetails,
                      ...(testCaseDetails.userInfo || {}),
                    };
                    onEditTestCase(normalizedTestCase);
                  }}
                  size="small"
                  color="primary"
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t("junit.testcase.close")}>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* 이전 노트 알림 (현재 노트가 없을 때만 표시) */}
      {previousNoteInfo && !testCaseDetails.userInfo?.userNotes && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert
            severity="info"
            action={
              onEditTestCase && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    const normalizedTestCase = {
                      ...testCaseDetails,
                      ...(testCaseDetails.userInfo || {}),
                    };
                    onEditTestCase(normalizedTestCase);
                  }}
                >
                  {t("junit.testcase.edit")}
                </Button>
              )
            }
          >
            {t(
              "junit.testcase.previousNotes.alert",
              "이 테스트 케이스에 대한 이전 노트가 존재합니다 (실행: {execution}, 일시: {date})",
            )
              .replace(
                "{execution}",
                previousNoteInfo.executionName ||
                  t("junit.testcase.previous", "이전 테스트 케이스"),
              )
              .replace(
                "{date}",
                new Date(previousNoteInfo.uploadedAt).toLocaleString(),
              )}
          </Alert>
        </Box>
      )}

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab
            label="Tracelog"
            icon={<BugIcon />}
            iconPosition="start"
            sx={{ minHeight: "48px" }}
          />
          <Tab
            label="Test Body"
            icon={<SpeedIcon />}
            iconPosition="start"
            sx={{ minHeight: "48px" }}
          />
          <Tab
            label={
              attachments.length > 0
                ? `${t("junit.testcase.attachments")} (${attachments.length})`
                : t("junit.testcase.attachments")
            }
            icon={<ImageIcon />}
            iconPosition="start"
            sx={{ minHeight: "48px" }}
          />
        </Tabs>
      </Box>

      {/* 탭 컨텐츠 */}
      <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Tracelog 탭 */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: "100%", overflow: "auto" }}>
            {/* 모든 속성 표시 (Description, Step 등) */}
            {renderProperties(testCaseDetails.properties)}

            {/* 상세 단계 (PostgreSQL Regression Tests 형식) 표시 (상단 배치) */}
            {renderDetailedSteps(testCaseDetails.tracelog)}

            {/* 실패 메시지 */}
            {testCaseDetails.tracelog.failureMessage && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                    Failure Message
                    {testCaseDetails.tracelog.failureType && (
                      <Chip
                        label={testCaseDetails.tracelog.failureType}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.error.main, 0.1)
                        : "#ffebee",
                      color: theme.palette.text.primary,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${
                        isDarkMode
                          ? alpha(theme.palette.error.main, 0.3)
                          : "#ffcdd2"
                      }`,
                    }}
                  >
                    {String(testCaseDetails.tracelog.failureMessage)
                      .replace(/   File/g, "\n  File")
                      .replace(/     /g, "\n    ")}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* 스택 트레이스 */}
            {testCaseDetails.tracelog.stackTrace && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                    Stack Trace
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.background.paper, 0.5)
                        : "#fafafa",
                      color: theme.palette.text.secondary,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      maxHeight: "400px",
                      overflow: "auto",
                    }}
                  >
                    {String(testCaseDetails.tracelog.stackTrace)
                      .replace(/   File/g, "\n  File")
                      .replace(/     /g, "\n    ")}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* 스킵 메시지 */}
            {testCaseDetails.tracelog.skipMessage && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Skip Message
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.action.hover, 0.1)
                        : "#f5f5f5",
                      color: theme.palette.text.primary,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {testCaseDetails.tracelog.skipMessage}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* 내용이 없는 경우 */}
            {!testCaseDetails.tracelog.failureMessage &&
              !testCaseDetails.tracelog.stackTrace &&
              !testCaseDetails.tracelog.skipMessage && (
                <Alert severity="info">{t("junit.tracelog.noErrorLog")}</Alert>
              )}
          </Box>
        </TabPanel>

        {/* Test Body 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: "100%", overflow: "auto" }}>
            {/* 모든 속성 표시 (Description, Step 등) */}
            {renderProperties(testCaseDetails.properties)}

            {/* 상세 단계 (PostgreSQL Regression Tests 형식) 표시 (상단 배치) */}
            {renderDetailedSteps(testCaseDetails.tracelog)}

            {/* System Out */}
            {testCaseDetails.testbody.systemOut && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ mb: 1 }}
                  >
                    System Out
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.success.main, 0.1)
                        : "#e8f5e8",
                      color: theme.palette.text.primary,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${
                        isDarkMode
                          ? alpha(theme.palette.success.main, 0.3)
                          : "#c8e6c9"
                      }`,
                      overflow: "auto",
                    }}
                  >
                    {testCaseDetails.testbody.systemOut}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* System Err */}
            {testCaseDetails.testbody.systemErr && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                    System Error
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.error.main, 0.1)
                        : "#ffebee",
                      color: theme.palette.text.primary,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${
                        isDarkMode
                          ? alpha(theme.palette.error.main, 0.3)
                          : "#ffcdd2"
                      }`,
                      overflow: "auto",
                    }}
                  >
                    {testCaseDetails.testbody.systemErr}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* 내용이 없는 경우 */}
            {!testCaseDetails.testbody.systemOut &&
              !testCaseDetails.testbody.systemErr && (
                <Alert severity="info">{t("junit.testbody.noOutput")}</Alert>
              )}
          </Box>
        </TabPanel>

        {/* 첨부 탭 — 실행 당시 화면을 함께 본다 */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ height: "100%", overflow: "auto" }}>
            {attachmentsLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {!attachmentsLoading && attachments.length === 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                {t("junit.testcase.noAttachments")}
              </Alert>
            )}

            {!attachmentsLoading && attachments.length > 0 && (
              <Grid container spacing={2}>
                {attachments.map((att) => (
                  <Grid item xs={12} sm={6} md={4} key={att.id}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      {att.image && thumbUrls[att.id] ? (
                        <Box
                          component="img"
                          src={thumbUrls[att.id]}
                          alt={att.originalFileName}
                          onClick={() => setPreviewAttachment(att)}
                          sx={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                            objectPosition: "top",
                            cursor: "zoom-in",
                            display: "block",
                            bgcolor: isDarkMode ? "grey.900" : "grey.100",
                          }}
                        />
                      ) : att.image ? (
                        <Box
                          sx={{
                            height: 160,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isDarkMode ? "grey.900" : "grey.100",
                          }}
                        >
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: 160,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isDarkMode ? "grey.900" : "grey.100",
                          }}
                        >
                          <FileIcon
                            sx={{ fontSize: 48, color: "text.disabled" }}
                          />
                        </Box>
                      )}
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, wordBreak: "break-all" }}
                        >
                          {att.originalFileName}
                        </Typography>
                        {att.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {att.description}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(att.fileSize)}
                          </Typography>
                          <Tooltip
                            title={t("junit.testcase.downloadAttachment")}
                          >
                            <IconButton
                              size="small"
                              component="a"
                              href={att.downloadUrl}
                              download={att.originalFileName}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Box>

      {/* 전체화면 다이얼로그 */}
      <Dialog
        open={fullscreenOpen}
        onClose={handleFullscreenToggle}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "95vw",
            height: "95vh",
            maxWidth: "none",
            maxHeight: "none",
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">
              {t("junit.testbody.fullscreenTitle", {
                testName: testCaseDetails?.name,
              })}
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 24 }}
            />

            {/* 전체화면 모드 네비게이션 버튼 추가 */}
            <Tooltip title={t("junit.testcase.previous")}>
              <span>
                <IconButton
                  onClick={onNavigatePrev}
                  size="small"
                  disabled={!hasPrev}
                  color="primary"
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t("junit.testcase.next")}>
              <span>
                <IconButton
                  onClick={onNavigateNext}
                  size="small"
                  disabled={!hasNext}
                  color="primary"
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "white",
                    },
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <IconButton onClick={handleFullscreenToggle}>
            <FullscreenExitIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {/* 탭 기반 동적 컨텐츠 */}
            {tabValue === 0 && (
              <Box>
                {/* 모든 속성 표시 */}
                {renderProperties(testCaseDetails?.properties)}

                {/* 상세 단계 상단 배치 */}
                {renderDetailedSteps(testCaseDetails?.tracelog)}

                {/* Tracelog 탭 내용 (다이얼로그용) */}
                {testCaseDetails?.tracelog?.failureMessage && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="error"
                        sx={{ mb: 1 }}
                      >
                        Failure Message
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          fontSize: "0.875rem",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          bgcolor: isDarkMode
                            ? alpha(theme.palette.error.main, 0.1)
                            : "#ffebee",
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${
                            isDarkMode
                              ? alpha(theme.palette.error.main, 0.3)
                              : "#ffcdd2"
                          }`,
                        }}
                      >
                        {testCaseDetails.tracelog.failureMessage}
                      </Box>
                    </CardContent>
                  </Card>
                )}
                {testCaseDetails?.tracelog?.stackTrace && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="error"
                        sx={{ mb: 1 }}
                      >
                        Stack Trace
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          bgcolor: isDarkMode
                            ? alpha(theme.palette.background.paper, 0.5)
                            : "#fafafa",
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                          maxHeight: "600px",
                          overflow: "auto",
                        }}
                      >
                        {testCaseDetails.tracelog.stackTrace}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                {/* 모든 속성 표시 */}
                {renderProperties(testCaseDetails?.properties)}

                {/* 상세 단계 상단 배치 */}
                {renderDetailedSteps(testCaseDetails?.tracelog)}

                {/* System Out */}
                {testCaseDetails?.testbody?.systemOut && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ mb: 1 }}
                      >
                        System Out
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          fontSize: "0.875rem",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          bgcolor: isDarkMode
                            ? alpha(theme.palette.success.main, 0.1)
                            : "#e8f5e8",
                          color: theme.palette.text.primary,
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${
                            isDarkMode
                              ? alpha(theme.palette.success.main, 0.3)
                              : "#c8e6c9"
                          }`,
                          overflow: "auto",
                        }}
                      >
                        {testCaseDetails.testbody.systemOut}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* System Err */}
                {testCaseDetails?.testbody?.systemErr && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="error"
                        sx={{ mb: 1 }}
                      >
                        System Error
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          fontSize: "0.875rem",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          bgcolor: isDarkMode
                            ? alpha(theme.palette.error.main, 0.1)
                            : "#ffebee",
                          color: theme.palette.text.primary,
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${
                            isDarkMode
                              ? alpha(theme.palette.error.main, 0.3)
                              : "#ffcdd2"
                          }`,
                          overflow: "auto",
                        }}
                      >
                        {testCaseDetails.testbody.systemErr}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* 첨부 이미지 확대 보기 */}
      <Dialog
        open={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ pr: 6 }}>
          {previewAttachment?.originalFileName}
          {previewAttachment?.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {previewAttachment.description}
            </Typography>
          )}
          <IconButton
            onClick={() => setPreviewAttachment(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ p: 0, bgcolor: isDarkMode ? "grey.900" : "grey.100" }}
        >
          {previewAttachment && thumbUrls[previewAttachment.id] ? (
            <Box
              component="img"
              src={thumbUrls[previewAttachment.id]}
              alt={previewAttachment.originalFileName}
              sx={{ width: "100%", display: "block" }}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={28} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              previewAttachment && downloadAttachment(previewAttachment)
            }
            startIcon={<DownloadIcon />}
          >
            {t("junit.testcase.downloadAttachment")}
          </Button>
          <Button onClick={() => setPreviewAttachment(null)}>
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TestCaseDetailPanel;
