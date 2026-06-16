import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Cancel as FailIcon,
  Warning as ErrorIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import junitResultService from "../../services/junitResultService";
import TestCaseDetailPanel from "./TestCaseDetailPanel";

/**
 * 실패한 테스트 목록 탭 (Split Panel + 상세). (JunitResultDetail 에서 추출)
 */
const FailedTestsTab = ({
  testResultId,
  onEditTestCase,
  refreshTrigger = 0,
}) => {
  const { t } = useI18n();
  const [failedTests, setFailedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // ICT-337: 실패한 테스트 탭용 Split Panel 상태
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  useEffect(() => {
    const loadFailedTests = async () => {
      setLoading(true);
      try {
        const response =
          await junitResultService.getFailedTestCases(testResultId);
        setFailedTests(response.failedCases || []);
      } catch (err) {
        console.error("Failed to load failed tests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFailedTests();
  }, [testResultId, refreshTrigger]);

  // ICT-337: 실패한 테스트 케이스 클릭 핸들러
  const handleFailedTestCaseClick = (testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setShowDetailPanel(true);
  };

  // ICT-337: 상세 패널 닫기
  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedTestCaseId(null);
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "calc(100vh - 400px)",
        position: "relative",
      }}
    >
      {/* 좌측 패널: 실패한 테스트 케이스 목록 */}
      {sidebarVisible && (
        <Card
          sx={{
            flex: showDetailPanel ? "1 1 30%" : "1 1 100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: 0,
            }}
          >
            {failedTests.length === 0 ? (
              <Alert severity="success">
                {t("junit.detail.noFailedTests")}
              </Alert>
            ) : (
              <Box sx={{ overflow: "auto", flex: 1, p: 1 }}>
                {failedTests.map((testCase, index) => (
                  <Card
                    key={testCase.id}
                    sx={{
                      mb: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ p: "12px !important" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          mb: 1,
                        }}
                      >
                        <Chip
                          icon={
                            testCase.status === "FAILED" ? (
                              <FailIcon sx={{ fontSize: "1rem !important" }} />
                            ) : (
                              <ErrorIcon sx={{ fontSize: "1rem !important" }} />
                            )
                          }
                          label={
                            testCase.status === "FAILED"
                              ? t("junit.stats.failed")
                              : t("junit.stats.error")
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              testCase.status === "FAILED"
                                ? alpha(RESULT_COLORS.FAIL, 0.1)
                                : alpha(STATUS_COLORS.ERROR, 0.1),
                            color:
                              testCase.status === "FAILED"
                                ? RESULT_COLORS.FAIL
                                : STATUS_COLORS.ERROR,
                            fontWeight: "bold",
                            height: 20,
                            fontSize: "0.7rem",
                            "& .MuiChip-icon": {
                              color: "inherit",
                            },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              cursor: "pointer",
                              color: "primary.main",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                              fontWeight: "bold",
                              mb: 0.5,
                            }}
                            onClick={() =>
                              handleFailedTestCaseClick(testCase.id)
                            }
                          >
                            {testCase.userTitle || testCase.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontFamily: "monospace",
                              display: "block",
                              fontSize: "0.7rem",
                            }}
                          >
                            {testCase.className}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => onEditTestCase(testCase)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* 간단한 미리보기 - 실패 메시지만 축약 표시 */}
                      {testCase.failureMessage && (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              p: 1,
                              borderRadius: 1,
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "0.7rem",
                              color: RESULT_COLORS.FAIL,
                              bgcolor: alpha(RESULT_COLORS.FAIL, 0.05),
                            }}
                          >
                            {testCase.failureMessage
                              .split("\n")[0]
                              .substring(0, 100)}
                            {testCase.failureMessage.length > 100 ? "..." : ""}
                          </Typography>
                        </Box>
                      )}

                      {/* Note 미리보기 */}
                      {testCase.userNotes && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "bold",
                              color: "warning.dark",
                              whiteSpace: "nowrap",
                              fontSize: "0.7rem",
                            }}
                          >
                            {t("junit.editor.notes", "노트")}:
                          </Typography>
                          <Tooltip
                            title={testCase.userNotes}
                            arrow
                            placement="top"
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                cursor: "default",
                                fontSize: "0.7rem",
                                lineHeight: 1.4,
                              }}
                            >
                              {testCase.userNotes}
                            </Typography>
                          </Tooltip>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 사이드바 토글 버튼 (Split View일 때 표시) */}
      {showDetailPanel && (
        <Box
          sx={{
            position: "absolute",
            left: sidebarVisible ? "30%" : "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            transition: "left 0.3s ease",
          }}
        >
          <Tooltip
            title={sidebarVisible ? t("common.collapse") : t("common.expand")}
          >
            <IconButton
              size="small"
              onClick={() => setSidebarVisible(!sidebarVisible)}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 2,
                "&:hover": { bgcolor: "action.hover" },
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {sidebarVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* ICT-337: 우측 패널 - 실패한 테스트 케이스 상세 정보 */}
      {showDetailPanel &&
        (() => {
          const currentIndex = failedTests.findIndex(
            (tc) => tc.id === selectedTestCaseId,
          );
          return (
            <Card
              sx={{
                flex: sidebarVisible ? "1 1 70%" : "1 1 100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
              }}
            >
              <TestCaseDetailPanel
                testCaseId={selectedTestCaseId}
                refreshTrigger={refreshTrigger}
                onClose={handleCloseDetailPanel}
                onEditTestCase={onEditTestCase}
                onNavigatePrev={() => {
                  if (currentIndex > 0) {
                    setSelectedTestCaseId(failedTests[currentIndex - 1].id);
                  }
                }}
                onNavigateNext={() => {
                  if (currentIndex < failedTests.length - 1) {
                    setSelectedTestCaseId(failedTests[currentIndex + 1].id);
                  }
                }}
                hasPrev={currentIndex > 0}
                hasNext={currentIndex < failedTests.length - 1}
              />
            </Card>
          );
        })()}
    </Box>
  );
};

FailedTestsTab.propTypes = {
  testResultId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEditTestCase: PropTypes.func,
  refreshTrigger: PropTypes.number,
};

export default FailedTestsTab;
