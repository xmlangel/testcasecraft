// src/components/RAG/AnalysisSummaryManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useRAG } from "../../context/RAGContext.jsx";
import { useTranslation } from "../../context/I18nContext.jsx";
import { MARKDOWN_PREWRAP_SX } from "../common/markdownStyles.js";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { debugLog } from "../../utils/logger.js";

/**
 * 분석 요약 관리 컴포넌트
 *
 * 각 문서별로 LLM이 분석한 결과를 종합하여 표시합니다.
 * - 업로드된 문서 목록 조회
 * - 각 문서의 LLM 분석 작업 상태 확인
 * - 완료된 분석의 모든 청크 결과를 합쳐서 표시
 * - 문서별 요약 결과 리스트
 */
function AnalysisSummaryManager({ projectId, onLlmAnalysis }) {
  const {
    listDocuments,
    listLlmAnalysisJobs,
    getLlmAnalysisResults,
    getLlmAnalysisStatus,
  } = useRAG();
  const { t } = useTranslation();
  const theme = useTheme();
  const colorMode = theme.palette.mode === "dark" ? "dark" : "light";

  // 상태 관리
  const [documentSummaries, setDocumentSummaries] = useState([]); // 각 문서별 LLM 분석 요약
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // 상세보기 다이얼로그
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const summaryMarkdownStyles = useMemo(() => {
    const isDarkMode = theme.palette.mode === "dark";
    const baseTextColor = isDarkMode ? theme.palette.grey[100] : "#1E293B";
    const headingGradient = isDarkMode
      ? "linear-gradient(135deg, #67E8F9 0%, #C084FC 100%)"
      : "linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)";

    return {
      // 마크다운 공백 처리 공용 규칙 (pre-wrap 을 p/li 로만 한정)
      ...MARKDOWN_PREWRAP_SX,
      border: "2px solid",
      borderColor: isDarkMode
        ? "rgba(148, 163, 184, 0.5)"
        : "rgba(6, 182, 212, 0.3)",
      borderRadius: 3,
      overflow: "auto",
      background: isDarkMode
        ? "rgba(15, 23, 42, 0.85)"
        : "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(18px) saturate(170%)",
      "& .wmde-markdown": {
        p: 3,
        bgcolor: "transparent",
        fontFamily: "'Bricolage Grotesque', sans-serif",
        color: baseTextColor,
      },
      "& .wmde-markdown h1": {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "2.5rem",
        fontWeight: 800,
        mt: 2,
        mb: 1.5,
        borderBottom: "3px solid rgba(6, 182, 212, 0.5)",
        pb: 1,
        background: headingGradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
      "& .wmde-markdown h2": {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "2rem",
        fontWeight: 700,
        mt: 2,
        mb: 1,
        background: headingGradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
      "& .wmde-markdown h3": {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "1.5rem",
        fontWeight: 600,
        mt: 1.5,
        mb: 0.75,
        color: isDarkMode ? "#67E8F9" : "#06B6D4",
        borderLeft: `4px solid ${
          isDarkMode ? "rgba(103, 232, 249, 0.4)" : "rgba(6, 182, 212, 0.5)"
        }`,
        paddingLeft: "12px",
      },
      "& .wmde-markdown p": {
        mb: 1,
        mt: 0,
        lineHeight: 1.7,
        fontSize: "1rem",
        color: baseTextColor,
      },
      "& .wmde-markdown ul, & .wmde-markdown ol": {
        pl: 4,
        mb: 1,
        mt: 0,
        color: baseTextColor,
      },
      "& .wmde-markdown li": {
        mb: 0.5,
      },
      "& .wmde-markdown code": {
        fontFamily: "'JetBrains Mono', monospace",
        bgcolor: isDarkMode
          ? "rgba(103, 232, 249, 0.15)"
          : "rgba(6, 182, 212, 0.1)",
        color: isDarkMode ? "#67E8F9" : "#0891B2",
        px: 0.75,
        py: 0.5,
        borderRadius: 0.5,
        fontSize: "0.875rem",
        border: `1px solid ${
          isDarkMode ? "rgba(103, 232, 249, 0.3)" : "rgba(6, 182, 212, 0.2)"
        }`,
      },
      "& .wmde-markdown pre": {
        fontFamily: "'JetBrains Mono', monospace",
        bgcolor: isDarkMode ? "#0F172A" : "#1E293B",
        color: isDarkMode ? theme.palette.grey[100] : "#F8FAFC",
        p: 2,
        borderRadius: 2,
        overflow: "auto",
        mb: 1.5,
        mt: 1,
        border: `2px solid ${
          isDarkMode ? "rgba(103, 232, 249, 0.3)" : "rgba(6, 182, 212, 0.3)"
        }`,
        boxShadow: "0 8px 32px 0 rgba(6, 182, 212, 0.1)",
      },
      "& .wmde-markdown blockquote": {
        borderLeft: `4px solid ${
          isDarkMode ? "rgba(103, 232, 249, 0.4)" : "rgba(6, 182, 212, 0.5)"
        }`,
        pl: 2.5,
        py: 1,
        ml: 0,
        my: 1,
        bgcolor: isDarkMode
          ? "rgba(30, 41, 59, 0.8)"
          : "rgba(6, 182, 212, 0.05)",
        fontStyle: "italic",
        color: isDarkMode ? theme.palette.grey[300] : "#64748B",
        borderRadius: "0 12px 12px 0",
      },
      "& .wmde-markdown table": {
        borderCollapse: "collapse",
        width: "100%",
        mb: 1.5,
        mt: 1,
        background: isDarkMode ? "rgba(15, 23, 42, 0.85)" : "transparent",
        boxShadow: "0 8px 32px 0 rgba(6, 182, 212, 0.1)",
      },
      "& .wmde-markdown th, & .wmde-markdown td": {
        border: `1px solid ${
          isDarkMode ? "rgba(148, 163, 184, 0.35)" : "rgba(226, 232, 240, 0.8)"
        }`,
        p: 1,
        fontSize: "0.9rem",
        color: baseTextColor,
      },
      "& .wmde-markdown th": {
        bgcolor: isDarkMode
          ? "rgba(14, 165, 233, 0.15)"
          : "rgba(6, 182, 212, 0.1)",
        fontWeight: 600,
        fontFamily: "'Bricolage Grotesque', sans-serif",
      },
      "& .wmde-markdown hr": {
        my: 2,
        height: "3px",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.5) 50%, transparent 100%)",
        border: "none",
        boxShadow: "0 2px 4px rgba(6, 182, 212, 0.2)",
      },
    };
  }, [theme]);

  // 각 문서의 LLM 분석 결과 요약 로드
  const loadDocumentSummaries = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. 문서 목록 로드
      const docsResult = await listDocuments(projectId, 1, 1000);
      const regularDocs =
        docsResult?.documents?.filter(
          (doc) => !doc.fileName?.startsWith("testcase_"),
        ) || [];

      debugLog(
        "AnalysisSummaryManager",
        "문서 목록:",
        regularDocs.length,
        "개",
      );

      // 2. 각 문서의 LLM 분석 작업 상태 및 결과 조회
      const summariesPromises = regularDocs.map(async (doc) => {
        try {
          // 먼저 LLM 분석 작업 상태 조회
          let jobStatus;
          try {
            jobStatus = await getLlmAnalysisStatus(doc.id);
          } catch (statusErr) {
            // 404 에러는 분석 작업이 없는 것으로 처리
            if (statusErr.response?.status === 404) {
              debugLog(
                "AnalysisSummaryManager",
                `문서 ${doc.fileName}: LLM 분석 작업 없음`,
              );
              return {
                documentId: doc.id,
                documentName: doc.fileName,
                totalChunks: doc.totalChunks || 0,
                analyzedChunks: 0,
                status: "not_started",
                combinedResponse: null,
                uploadDate: doc.uploadDate,
              };
            }
            throw statusErr; // 다른 에러는 상위로 전파
          }

          // 작업 상태 확인
          const actualStatus = jobStatus.status;
          const totalChunks =
            jobStatus.progress?.totalChunks || doc.totalChunks || 0;
          const processedChunks = jobStatus.progress?.processedChunks || 0;

          debugLog(
            "AnalysisSummaryManager",
            `문서 ${doc.fileName}: 상태=${actualStatus}, 진행=${processedChunks}/${totalChunks}`,
          );

          // 완료된 작업인 경우에만 결과 조회
          if (actualStatus === "completed") {
            try {
              const analysisResults = await getLlmAnalysisResults(
                doc.id,
                0,
                200,
              );

              if (
                analysisResults &&
                analysisResults.results &&
                analysisResults.results.length > 0
              ) {
                // 모든 청크의 LLM 응답을 마크다운 형식으로 합치기
                // 연속된 빈 줄을 최소화하여 공백 제거
                const combinedResponse = analysisResults.results
                  .map((result, index) => {
                    // LLM 응답에서 2개 이상의 연속된 줄바꿈을 1개로 줄임
                    const cleanedResponse = (result.llmResponse || "")
                      .replace(/\n{2,}/g, "\n") // 2개 이상의 줄바꿈을 1개로 (빈 줄 제거)
                      .trim(); // 앞뒤 공백 제거
                    return `### 📄 청크 ${index + 1}\n${cleanedResponse}`;
                  })
                  .join("\n\n---\n\n");

                return {
                  documentId: doc.id,
                  documentName: doc.fileName,
                  totalChunks,
                  analyzedChunks: analysisResults.results.length,
                  status: "completed",
                  combinedResponse,
                  uploadDate: doc.uploadDate,
                };
              } else {
                // 완료되었지만 결과가 없는 경우
                return {
                  documentId: doc.id,
                  documentName: doc.fileName,
                  totalChunks,
                  analyzedChunks: processedChunks,
                  status: "completed",
                  combinedResponse: t("rag.analysisSummaryManager.noResults", "분석이 완료되었지만 결과가 없습니다."),
                  uploadDate: doc.uploadDate,
                };
              }
            } catch (resultsErr) {
              console.warn(
                `[AnalysisSummaryManager] 문서 ${doc.fileName}: 결과 조회 실패, 상태는 completed`,
                resultsErr,
              );
              // 결과 조회 실패해도 작업은 완료된 것으로 표시
              return {
                documentId: doc.id,
                documentName: doc.fileName,
                totalChunks,
                analyzedChunks: processedChunks,
                status: "completed",
                combinedResponse:
                  t("rag.analysisSummaryManager.noResultsError", "분석이 완료되었지만 결과 조회에 실패했습니다."),
                uploadDate: doc.uploadDate,
              };
            }
          }

          // 진행 중, 일시정지, 취소됨, 실패 등의 상태는 그대로 반환
          return {
            documentId: doc.id,
            documentName: doc.fileName,
            totalChunks,
            analyzedChunks: processedChunks,
            status: actualStatus,
            combinedResponse: null,
            uploadDate: doc.uploadDate,
            errorMessage: jobStatus.errorMessage,
          };
        } catch (err) {
          // 예상치 못한 에러는 실패로 표시
          console.error(
            `[AnalysisSummaryManager] 문서 ${doc.fileName} 조회 실패:`,
            err,
          );
          return {
            documentId: doc.id,
            documentName: doc.fileName,
            totalChunks: doc.totalChunks || 0,
            analyzedChunks: 0,
            status: "error",
            combinedResponse: null,
            uploadDate: doc.uploadDate,
            errorMessage: err.response?.data?.message || err.message,
          };
        }
      });

      const results = await Promise.all(summariesPromises);
      // 이제 모든 문서를 포함 (null 필터링 제거)

      debugLog(
        "AnalysisSummaryManager",
        "전체 문서:",
        results.length,
        "개 (분석 완료/진행/미시작 포함)",
      );

      setDocumentSummaries(results);
    } catch (err) {
      console.error("[AnalysisSummaryManager] 요약 로드 실패:", err);
      setError(
        err.response?.data?.message || t("rag.analysisSummaryManager.loadError", "요약 목록을 불러오는데 실패했습니다."),
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, listDocuments, getLlmAnalysisStatus, getLlmAnalysisResults]);

  useEffect(() => {
    loadDocumentSummaries();
  }, [loadDocumentSummaries]);

  // 페이지 변경
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 페이지 크기 변경
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 요약 상세보기
  const handleViewDetail = (summary) => {
    setSelectedSummary(summary);
    setDetailDialogOpen(true);
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "success";
    if (progress >= 50) return "primary";
    return "warning";
  };

  // 상태별 표시 정보
  const getStatusInfo = (status) => {
    switch (status) {
      case "not_started":
        return {
          label: t("rag.summary.status.notStarted", "미분석"),
          color: "default",
          icon: "⏸️",
        };
      case "processing":
        return {
          label: t("rag.summary.status.processing", "진행 중"),
          color: "primary",
          icon: "⏳",
        };
      case "paused":
        return {
          label: t("rag.summary.status.paused", "일시정지"),
          color: "warning",
          icon: "⏸️",
        };
      case "completed":
        return {
          label: t("rag.summary.status.completed", "완료"),
          color: "success",
          icon: "✅",
        };
      case "cancelled":
        return {
          label: t("rag.summary.status.cancelled", "취소됨"),
          color: "default",
          icon: "🚫",
        };
      case "error":
        return {
          label: t("rag.summary.status.error", "실패"),
          color: "error",
          icon: "❌",
        };
      default:
        return {
          label: t("rag.summary.status.unknown", "알 수 없음"),
          color: "default",
          icon: "❓",
        };
    }
  };

  // LLM 분석 시작 핸들러
  const handleStartAnalysis = (summary) => {
    // RAGDocumentManager의 handleLlmAnalysis를 호출하기 위해 document 객체 전달
    if (onLlmAnalysis) {
      onLlmAnalysis(summary.documentId);
    }
  };

  // 페이지네이션 적용
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSummaries = documentSummaries.slice(startIndex, endIndex);

  if (loading && documentSummaries.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {t("rag.summary.loading", "요약 목록을 불러오는 중...")}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={5} className="glass-border" sx={{ p: 3 }}>
        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 헤더 */}
        <Typography
          variant="h3"
          className="gradient-heading text-grotesque"
          sx={{ mb: 3 }}
        >
          {t("rag.summary.title", "분석 요약 관리 ({count}개 문서)", {
            count: documentSummaries.length,
          })}
        </Typography>

        {/* 요약 목록 테이블 */}
        {documentSummaries.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {t("rag.summary.empty", "LLM 분석이 완료된 문서가 없습니다.")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t(
                "rag.summary.emptyDescription",
                "문서를 업로드하고 LLM 분석을 실행해주세요.",
              )}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="30%">{t("rag.summary.table.fileName", "문서명")}</TableCell>
                    <TableCell width="12%" align="center">
                      {t("rag.summary.table.chunks", "청크 수")}
                    </TableCell>
                    <TableCell width="12%" align="center">
                      {t("rag.summary.table.progress", "진행률")}
                    </TableCell>
                    <TableCell width="12%" align="center">
                      {t("rag.summary.table.status", "상태")}
                    </TableCell>
                    <TableCell width="17%">{t("rag.summary.table.uploadDate", "업로드 일시")}</TableCell>
                    <TableCell width="17%" align="center">
                      {t("rag.summary.table.actions", "작업")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSummaries.map((summary) => {
                    const progress =
                      summary.totalChunks > 0
                        ? Math.round(
                            (summary.analyzedChunks / summary.totalChunks) *
                              100,
                          )
                        : 0;
                    const statusInfo = getStatusInfo(summary.status);

                    return (
                      <TableRow key={summary.documentId} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DescriptionIcon color="primary" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {summary.documentName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${summary.analyzedChunks} / ${summary.totalChunks}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {summary.status === "not_started" ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              -
                            </Typography>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              <CircularProgress
                                variant="determinate"
                                value={progress}
                                size={32}
                                color={getProgressColor(progress)}
                              />
                              <Typography variant="caption">
                                {progress}%
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            color={statusInfo.color}
                            icon={<span>{statusInfo.icon}</span>}
                          />
                        </TableCell>
                        <TableCell>{formatDate(summary.uploadDate)}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            {summary.status === "not_started" && (
                              <Tooltip
                                title={t(
                                  "rag.summary.tooltip.startAnalysis",
                                  "LLM 분석 시작",
                                )}
                              >
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleStartAnalysis(summary)}
                                >
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(summary.status === "completed" ||
                              summary.status === "processing" ||
                              summary.status === "paused") && (
                              <Tooltip
                                title={t(
                                  "rag.summary.tooltip.viewSummary",
                                  "요약 보기",
                                )}
                              >
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetail(summary)}
                                  disabled={
                                    !summary.combinedResponse &&
                                    summary.status !== "processing"
                                  }
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <TablePagination
              component="div"
              count={documentSummaries.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage={t(
                "rag.summary.pagination.rowsPerPage",
                "페이지당 행 수:",
              )}
            />
          </>
        )}
      </Paper>
      {/* 요약 상세보기 다이얼로그 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedSummary(null);
          setIsFullScreen(false);
        }}
        maxWidth="lg"
        fullWidth
        fullScreen={isFullScreen}
        slotProps={{
          paper: {
            className: "glass-surface",
            elevation: 5,
          },
        }}
      >
        <DialogTitle
          className="gradient-heading text-grotesque"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid rgba(6, 182, 212, 0.3)",
            pb: 2,
          }}
        >
          <Typography variant="h4" className="gradient-heading text-grotesque">
            {t("rag.summary.dialog.title", "LLM 분석 요약 - {name}", {
              name: selectedSummary?.documentName,
            })}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip
              title={
                isFullScreen
                  ? t("rag.summary.tooltip.exitFullscreen", "전체화면 종료")
                  : t("rag.summary.tooltip.fullscreen", "전체화면")
              }
            >
              <IconButton
                onClick={() => setIsFullScreen(!isFullScreen)}
                size="small"
                color="primary"
              >
                {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => {
                setDetailDialogOpen(false);
                setSelectedSummary(null);
                setIsFullScreen(false);
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSummary ? (
            <Box>
              {/* 메타 정보 */}
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Chip
                  label={t(
                    "rag.summary.dialog.totalChunks",
                    "총 {count}개 청크",
                    { count: selectedSummary.totalChunks },
                  )}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={t(
                    "rag.summary.dialog.analyzedChunks",
                    "분석 완료: {count}개",
                    { count: selectedSummary.analyzedChunks },
                  )}
                  size="small"
                  color="success"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: "auto" }}
                >
                  {t("rag.summary.dialog.uploadDate", "업로드: {date}", {
                    date: formatDate(selectedSummary.uploadDate),
                  })}
                </Typography>
              </Box>

              {/* 통합 요약 내용 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  {t(
                    "rag.summary.dialog.analysisResults",
                    "LLM 분석 결과 요약",
                  )}
                </Typography>
                {selectedSummary.status === "not_started" ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t(
                      "rag.summary.dialog.notStartedMessage",
                      "아직 LLM 분석이 실행되지 않았습니다. 문서 목록에서 LLM 분석을 시작해주세요.",
                    )}
                  </Alert>
                ) : selectedSummary.status === "error" ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {t(
                      "rag.summary.dialog.errorMessage",
                      "분석 중 오류가 발생했습니다: {error}",
                      {
                        error:
                          selectedSummary.errorMessage || t("common.unknown", "알 수 없는 오류"),
                      },
                    )}
                  </Alert>
                ) : selectedSummary.status === "processing" ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {t(
                      "rag.summary.dialog.processingMessage",
                      "LLM 분석이 진행 중입니다. 잠시 후 다시 확인해주세요.",
                    )}
                  </Alert>
                ) : (
                  <Box
                    data-color-mode={colorMode}
                    className="glass-surface shadow-glass-medium"
                    sx={{
                      ...summaryMarkdownStyles,
                      mt: 2,
                      maxHeight: isFullScreen ? "calc(100vh - 250px)" : "600px",
                    }}
                  >
                    <MDEditor.Markdown
                      source={
                        selectedSummary.combinedResponse ||
                        t("rag.analysisSummaryManager.noAnalysisResults", "분석 결과가 없습니다.")
                      }
                    />
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetailDialogOpen(false);
              setSelectedSummary(null);
              setIsFullScreen(false);
            }}
          >
            {t("common.close", "닫기")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

AnalysisSummaryManager.propTypes = {
  projectId: PropTypes.string.isRequired,
  onLlmAnalysis: PropTypes.func, // LLM 분석 시작 핸들러
};

export default AnalysisSummaryManager;
