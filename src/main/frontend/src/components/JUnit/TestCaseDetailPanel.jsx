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
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";

/**
 * 테스트 케이스 상세 패널 컴포넌트
 * tracelog와 testbody를 탭 형태로 표시
 */
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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (testCaseId) {
      loadTestCaseDetails();
    }
  }, [testCaseId, refreshTrigger]);

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
            {filteredProperties.map(([key, value]) => (
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
            ))}
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
                    color={testCaseDetails.status === "PASSED" ? "success" : "error"}
                    sx={{ fontWeight: "bold", mb: 0.5, display: "block" }}
                  >
                    ACTUAL
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: isDarkMode
                        ? alpha(testCaseDetails.status === "PASSED" ? theme.palette.success.main : theme.palette.error.main, 0.05)
                        : (testCaseDetails.status === "PASSED" ? "#f8fff8" : "#fffaf8"),
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
                          color={testCaseDetails.status === "PASSED" ? "success" : "error"}
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
                            borderLeft: `3px solid ${testCaseDetails.status === "PASSED" ? theme.palette.success.light : theme.palette.error.light}`,
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
                          !["index", "sql", "expected", "actual"].includes(key),
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
                      ...(testCaseDetails.userInfo || {})
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
                      border: `1px solid ${isDarkMode ? alpha(theme.palette.error.main, 0.3) : "#ffcdd2"}`,
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
                      border: `1px solid ${isDarkMode ? alpha(theme.palette.success.main, 0.3) : "#c8e6c9"}`,
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
                      border: `1px solid ${isDarkMode ? alpha(theme.palette.error.main, 0.3) : "#ffcdd2"}`,
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
                          border: `1px solid ${isDarkMode ? alpha(theme.palette.error.main, 0.3) : "#ffcdd2"}`,
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
                          border: `1px solid ${isDarkMode ? alpha(theme.palette.success.main, 0.3) : "#c8e6c9"}`,
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
                          border: `1px solid ${isDarkMode ? alpha(theme.palette.error.main, 0.3) : "#ffcdd2"}`,
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
    </Paper>
  );
};

export default TestCaseDetailPanel;
