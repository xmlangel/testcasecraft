// src/main/frontend/src/components/JUnit/JunitResultDetail.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import junitResultService from "../../services/junitResultService";
import SlowestTestsTab from "./SlowestTestsTab.jsx";
import FailedTestsTab from "./FailedTestsTab.jsx";
import useAccordionState from "./hooks/useAccordionState.js";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as ErrorIcon,
  SkipNext as SkipIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  BugReport as BugIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../../context/I18nContext";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";

import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import JunitTestCaseEditor from "./JunitTestCaseEditor";
import TestCaseDetailPanel from "./TestCaseDetailPanel";
import { STATUS_COLORS, RESULT_COLORS } from "../../constants/statusColors";
import useJunitExport from "./hooks/useJunitExport.js";
import JunitStatsCard from "./JunitStatsCard.jsx";
import { PAGE_CONTAINER_SX } from "../../styles/layoutConstants";

/**
 * JUnit 테스트 결과 상세 뷰 컴포넌트
 */
const JunitResultDetail = () => {
  const { testResultId, projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useAppContext();
  const { t, currentLanguage } = useI18n();
  const theme = useTheme();

  // 전체 스윗을 나타내는 특별한 ID
  const ALL_SUITES_ID = "ALL_SUITES";

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testSuites, setTestSuites] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [testCases, setTestCases] = useState([]);

  // 편집 관련 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(null);

  const calculateDynamicPageSize = () => {
    // containerHeight is approx 100vh - 400px.
    // subtract internal margins, header, filters, pagination (~150px)
    const availableHeight = window.innerHeight - 550;
    const rowHeight = 45; // Table size="small" row height
    const calculated = Math.floor(availableHeight / rowHeight);
    return Math.max(10, Math.min(calculated, 100)); // Ensure between 10 and 100
  };

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(calculateDynamicPageSize());
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const isDarkMode = theme.palette.mode === "dark";

  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editRefreshTrigger, setEditRefreshTrigger] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  // 이 결과의 케이스를 연결한 테스트케이스 (역방향 노출)
  const [linkedTestCases, setLinkedTestCases] = useState([]);

  // PDF/CSV 내보내기 (useJunitExport 훅)
  const { exportingPDF, exportingCSV, handleExportToPDF, handleExportToCSV } =
    useJunitExport({ testResult, testSuites, t });

  // Accordion 섹션 확장 상태 + localStorage (useAccordionState 훅)
  const { expandedSections, handleAccordionChange } = useAccordionState();

  // 상태별 설정
  const statusConfig = {
    PASSED: {
      color: "success",
      icon: <PassIcon sx={{ color: RESULT_COLORS.PASS }} />,
      label: t("junit.stats.passed"),
      bgColor: isDarkMode
        ? alpha(theme.palette.success.main, 0.2)
        : alpha(RESULT_COLORS.PASS, 0.1),
      textColor: RESULT_COLORS.PASS,
    },
    FAILED: {
      color: "error",
      icon: <FailIcon sx={{ color: RESULT_COLORS.FAIL }} />,
      label: t("junit.stats.failed"),
      bgColor: isDarkMode
        ? alpha(theme.palette.error.main, 0.2)
        : alpha(RESULT_COLORS.FAIL, 0.1),
      textColor: RESULT_COLORS.FAIL,
    },
    ERROR: {
      color: "warning",
      icon: <ErrorIcon sx={{ color: STATUS_COLORS.ERROR }} />,
      label: t("junit.stats.error"),
      bgColor: isDarkMode
        ? alpha(theme.palette.warning.main, 0.2)
        : alpha(STATUS_COLORS.ERROR, 0.1),
      textColor: STATUS_COLORS.ERROR,
    },
    SKIPPED: {
      color: "default",
      icon: <SkipIcon sx={{ color: RESULT_COLORS.SKIPPED }} />,
      label: t("junit.stats.skipped"),
      bgColor: isDarkMode
        ? alpha(theme.palette.action.disabledBackground, 0.1)
        : alpha(RESULT_COLORS.SKIPPED, 0.1),
      textColor: RESULT_COLORS.SKIPPED,
    },
  };

  // 데이터 로드
  const loadData = async () => {
    if (!testResultId) return;

    setLoading(true);
    setError(null);

    try {
      // 병렬로 데이터 로드
      const [resultResponse, suitesResponse] = await Promise.all([
        junitResultService.getJunitResultDetail(testResultId),
        junitResultService.getTestSuitesByResult(testResultId),
      ]);

      setTestResult(resultResponse.testResult || resultResponse);
      setTestSuites(suitesResponse.testSuites || []);

      // 기본값으로 '전체' 선택
      if (suitesResponse.testSuites && suitesResponse.testSuites.length > 0) {
        setSelectedSuite({ id: ALL_SUITES_ID, name: t("common.all") });
        await loadAllTestCases(suitesResponse.testSuites, 0);
      }
    } catch (err) {
      console.error("Failed to load JUnit result details:", err);
      setError(t("junit.detail.loadFailedDetail"));
    } finally {
      setLoading(false);
    }
  };

  // 전체 테스트 케이스 로드 (모든 스윗) - Lazy Loading 방식
  const loadAllTestCases = async (
    suites,
    pageNum = 0,
    currentStatus = statusFilter,
  ) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setTestCases([]);
      } else {
        setIsLoadingMore(true);
      }

      // 각 스윗의 테스트 케이스 개수로 전체 개수 계산 (초기값)
      // 주의: 서버 사이드 필터링 시에는 이 개수가 정확하지 않을 수 있음
      let totalTestCases = suites.reduce(
        (sum, suite) => sum + (suite.tests || 0),
        0,
      );

      const pageStartIndex = pageNum * pageSize;
      const pageEndIndex = pageStartIndex + pageSize;

      const pageCases = [];
      let currentIndex = 0;

      for (let i = 0; i < suites.length; i++) {
        const suite = suites[i];
        const suiteTestCount = suite.tests || 0;
        const suiteStartIndex = currentIndex;
        const suiteEndIndex = currentIndex + suiteTestCount;

        if (suiteEndIndex > pageStartIndex && suiteStartIndex < pageEndIndex) {
          const suitePageStart = Math.max(0, pageStartIndex - suiteStartIndex);
          const suitePageEnd = Math.min(
            suiteTestCount,
            pageEndIndex - suiteStartIndex,
          );
          const suitePage = Math.floor(suitePageStart / pageSize);

          try {
            const response = await junitResultService.getTestCasesBySuite(
              suite.id,
              suitePage,
              pageSize,
              currentStatus === "ALL" ? null : currentStatus,
            );

            const cases = response.content || [];
            const localStart = suitePageStart % pageSize;
            const localEnd = localStart + (suitePageEnd - suitePageStart);
            const selectedCases = cases.slice(localStart, localEnd);

            const casesWithSuite = selectedCases.map((tc) => ({
              ...tc,
              suiteName: suite.name,
              suiteId: suite.id,
            }));

            pageCases.push(...casesWithSuite);

            // 전체 페이지 정보 업데이트 (첫 로딩 시에만 대략적 계산)
            if (pageNum === 0 && i === 0) {
              setTotalPages(response.totalPages || 0);
            }
          } catch (error) {
            console.warn(
              `Failed to load test cases for suite ${suite.name}:`,
              error,
            );
          }
        }

        currentIndex += suiteTestCount;
        if (currentIndex >= pageEndIndex) break;
      }

      if (pageNum === 0) {
        setTestCases(pageCases);
      } else {
        setTestCases((prev) => [...prev, ...pageCases]);
      }

      setHasMore(pageCases.length >= pageSize || currentIndex < totalTestCases);
    } catch (err) {
      console.error("Failed to load all test cases:", err);
      setError(t("junit.detail.loadTestCasesFailed"));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 단일 스윗의 테스트 케이스 로드
  const loadTestCases = async (
    suiteId,
    pageNum = 0,
    currentStatus = statusFilter,
  ) => {
    if (!suiteId) return;

    try {
      if (pageNum === 0) {
        setLoading(true);
        setTestCases([]);
      } else {
        setIsLoadingMore(true);
      }

      const response = await junitResultService.getTestCasesBySuite(
        suiteId,
        pageNum,
        pageSize,
        currentStatus === "ALL" ? null : currentStatus,
      );

      const newCases = response.content || [];
      if (pageNum === 0) {
        setTestCases(newCases);
      } else {
        setTestCases((prev) => [...prev, ...newCases]);
      }

      setTotalPages(response.totalPages || 0);
      setHasMore(pageNum < (response.totalPages || 0) - 1);
    } catch (err) {
      console.error("Failed to load test cases:", err);
      setError(t("junit.detail.loadTestCasesFailed"));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [testResultId]);

  // 이 결과의 케이스를 연결한 테스트케이스(역방향) 로드
  useEffect(() => {
    if (!testResultId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await junitResultService.getLinkedTestCases(testResultId);
        if (!cancelled) setLinkedTestCases(res?.content || []);
      } catch (err) {
        if (!cancelled) setLinkedTestCases([]);
        console.error("연결된 테스트케이스 로드 실패:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testResultId]);

  // 창 크기 조절에 따른 동적 pageSize 업데이트
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setPageSize((prevSize) => {
          const newSize = calculateDynamicPageSize();
          return prevSize !== newSize ? newSize : prevSize;
        });
      }, 500); // 500ms debounce
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // pageSize 변경 시 리스트 갱신 (초기 로딩 제외)
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedSuite && testSuites.length > 0) {
      setPage(0);
      if (selectedSuite.id === ALL_SUITES_ID) {
        loadAllTestCases(testSuites, 0);
      } else {
        loadTestCases(selectedSuite.id, 0);
      }
    }
  }, [pageSize]);

  // 스위트 선택 변경
  const handleSuiteChange = async (suite) => {
    setSelectedSuite(suite);
    setPage(1);

    if (suite.id === ALL_SUITES_ID) {
      // 전체 선택 시 - 페이지 0부터 시작
      await loadAllTestCases(testSuites, 0);
    } else {
      // 특정 스윗 선택 시
      await loadTestCases(suite.id, 0);
    }
  };

  // 페이지 변경 (인피니티 스크롤 로드 모어)
  const lastElementRef = useCallback(
    (node) => {
      if (loading || isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, isLoadingMore, hasMore],
  );

  // 페이지 번호 변경 감지하여 추가 로드
  useEffect(() => {
    if (page > 0) {
      if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
        loadAllTestCases(testSuites, page);
      } else if (selectedSuite) {
        loadTestCases(selectedSuite.id, page);
      }
    }
  }, [page]);

  // 스택오버플로우 방지를 위해 handlePageChange는 제거하거나 빈 함수로 유지
  const handlePageChange = () => {};

  // 테스트 케이스 편집
  const handleEditTestCase = (testCase) => {
    setSelectedTestCase(testCase);
    setEditDialogOpen(true);
  };

  // 편집 완료 핸들러
  const handleEditSave = async (updatedTestCaseResponse) => {
    // 백엔드 응답에서 실제 테스트케이스 데이터 추출
    const updatedTestCase =
      updatedTestCaseResponse.testCase || updatedTestCaseResponse;

    // 테스트 케이스 목록 업데이트
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === updatedTestCase.id ? updatedTestCase : tc)),
    );

    // 다이얼로그 닫기
    setEditDialogOpen(false);
    setSelectedTestCase(null);
    setEditRefreshTrigger((prev) => prev + 1);

    // 선택된 스위트 데이터 새로고침 (페이지 유지)
    if (selectedSuite) {
      if (selectedSuite.id === ALL_SUITES_ID) {
        await loadAllTestCases(testSuites, page);
      } else {
        await loadTestCases(selectedSuite.id, page);
      }
    }
  };

  // ICT-337: 테스트 케이스 클릭 핸들러
  const handleTestCaseClick = (testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setShowDetailPanel(true);
  };

  // ICT-337: 상세 패널 닫기
  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedTestCaseId(null);
  };

  // 테스트 케이스 네비게이션: 이전
  const handleNavigatePrev = async () => {
    const currentIndex = filteredTestCases.findIndex(
      (tc) => tc.id === selectedTestCaseId,
    );

    if (currentIndex > 0) {
      // 현재 페이지 내에서 이전 케이스로 이동
      const prevTestCase = filteredTestCases[currentIndex - 1];
      setSelectedTestCaseId(prevTestCase.id);
    } else if (page > 1) {
      // 이전 페이지로 이동
      const newPage = page - 1;
      setPage(newPage);

      if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
        await loadAllTestCases(testSuites, newPage - 1);
      } else if (selectedSuite) {
        await loadTestCases(selectedSuite.id, newPage - 1);
      }

      // 다음 틱에 마지막 케이스 선택 (페이지가 로드된 후)
      setTimeout(() => {
        const newFilteredCases = testCases.filter((testCase) => {
          const matchesStatus =
            statusFilter === "ALL" || testCase.status === statusFilter;
          const matchesSearch =
            !searchText ||
            testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
            testCase.className
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            (testCase.userTitle &&
              testCase.userTitle
                .toLowerCase()
                .includes(searchText.toLowerCase()));
          return matchesStatus && matchesSearch;
        });

        if (newFilteredCases.length > 0) {
          setSelectedTestCaseId(
            newFilteredCases[newFilteredCases.length - 1].id,
          );
        }
      }, 100);
    }
  };

  // 테스트 케이스 네비게이션: 다음
  const handleNavigateNext = async () => {
    const currentIndex = filteredTestCases.findIndex(
      (tc) => tc.id === selectedTestCaseId,
    );

    if (currentIndex < filteredTestCases.length - 1) {
      // 현재 페이지 내에서 다음 케이스로 이동
      const nextTestCase = filteredTestCases[currentIndex + 1];
      setSelectedTestCaseId(nextTestCase.id);
    } else if (page < totalPages) {
      // 다음 페이지로 이동
      const newPage = page + 1;
      setPage(newPage);

      if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
        await loadAllTestCases(testSuites, newPage - 1);
      } else if (selectedSuite) {
        await loadTestCases(selectedSuite.id, newPage - 1);
      }

      // 다음 틱에 첫 번째 케이스 선택 (페이지가 로드된 후)
      setTimeout(() => {
        const newFilteredCases = testCases.filter((testCase) => {
          const matchesStatus =
            statusFilter === "ALL" || testCase.status === statusFilter;
          const matchesSearch =
            !searchText ||
            testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
            testCase.className
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            (testCase.userTitle &&
              testCase.userTitle
                .toLowerCase()
                .includes(searchText.toLowerCase()));
          return matchesStatus && matchesSearch;
        });

        if (newFilteredCases.length > 0) {
          setSelectedTestCaseId(newFilteredCases[0].id);
        }
      }, 100);
    }
  };

  // 실행 시간 포맷
  const formatDuration = (seconds) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // 안전한 날짜 포맷팅 함수
  const formatSafeDate = (dateValue) => {
    try {
      if (!dateValue) {
        return t("junit.detail.noDateInfo");
      }

      let date;

      // 다양한 날짜 형식 처리
      if (typeof dateValue === "string") {
        // ISO 형식이 아닌 경우 처리
        if (dateValue.includes("T") || dateValue.includes("-")) {
          date = new Date(dateValue);
        } else {
          // 숫자 문자열인 경우 (timestamp)
          const timestamp = parseInt(dateValue);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          } else {
            date = new Date(dateValue);
          }
        }
      } else if (typeof dateValue === "number") {
        // timestamp 처리
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else if (Array.isArray(dateValue) && dateValue.length >= 6) {
        // Java LocalDateTime 배열 형식 처리: [year, month, day, hour, minute, second, nanosecond]
        const [year, month, day, hour, minute, second, nanosecond] = dateValue;
        // JavaScript Date의 월은 0부터 시작하므로 1을 빼야 함
        date = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
          second,
          Math.floor((nanosecond || 0) / 1000000),
        );
      } else {
        console.warn("Unsupported date format:", typeof dateValue, dateValue);
        return t("junit.detail.unknownDateFormat");
      }

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn("Invalid date value:", dateValue);
        // 원본 값이 문자열이면 그대로 표시
        if (typeof dateValue === "string" && dateValue.trim()) {
          return dateValue.trim();
        }
        return t("junit.detail.invalidDate");
      }

      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: currentLanguage === "en" ? enUS : ko,
      });
    } catch (error) {
      console.error("Date formatting error:", error, "Input:", dateValue);
      // 에러 발생 시 원본 값 표시 (문자열인 경우)
      if (typeof dateValue === "string" && dateValue.trim()) {
        return dateValue.trim();
      }
      return t("junit.detail.dateProcessingError");
    }
  };

  // 서버 사이드 필터링 적용을 위한 useEffect
  useEffect(() => {
    if (isFirstRender.current || !selectedSuite) return;

    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      if (selectedSuite.id === ALL_SUITES_ID) {
        loadAllTestCases(testSuites, 0, statusFilter);
      } else {
        loadTestCases(selectedSuite.id, 0, statusFilter);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, searchText]);

  // 렌더링용 테스트 케이스 (필터링 로직 제거)
  const filteredTestCases = testCases;

  if (loading) {
    return (
      <Container>
        <LinearProgress sx={{ mt: 2 }} />
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          {t("junit.detail.loadingDetail")}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => {
            if (projectId) {
              navigate(`/projects/${projectId}/automation`);
            } else if (currentProject?.id) {
              navigate(`/projects/${currentProject.id}/automation`);
            } else {
              navigate(-1);
            }
          }}
          sx={{ mt: 2 }}
        >
          {t("junit.detail.backToAutomation")}
        </Button>
      </Container>
    );
  }

  if (!testResult) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t("junit.detail.notFound")}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => {
            if (projectId) {
              navigate(`/projects/${projectId}/automation`);
            } else if (currentProject?.id) {
              navigate(`/projects/${currentProject.id}/automation`);
            } else {
              navigate(-1);
            }
          }}
          sx={{ mt: 2 }}
        >
          {t("junit.detail.backToAutomation")}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => {
              if (projectId) {
                navigate(`/projects/${projectId}/automation`);
              } else if (currentProject?.id) {
                navigate(`/projects/${currentProject.id}/automation`);
              } else {
                navigate(-1);
              }
            }}
            variant="outlined"
            data-testid="automation-detail-back-button"
          >
            {t("junit.detail.backToAutomation")}
          </Button>
          <Box>
            <Typography variant="h4" component="h1" color="text.primary">
              {testResult.testExecutionName || testResult.fileName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t("junit.detail.upload")}:{" "}
              {formatSafeDate(testResult.uploadedAt)} |{" "}
              {testResult.uploadedBy?.displayName ||
                testResult.uploadedBy?.username ||
                t("junit.detail.unknownUploader")}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToPDF}
            disabled={exportingPDF || !testResult}
            color="primary"
            sx={{
              "&:hover": {
                bgcolor: "primary.light",
                color: "white",
              },
            }}
            data-testid="automation-export-pdf-button"
          >
            {exportingPDF
              ? t("junit.detail.exportingPDF")
              : t("junit.detail.exportPDF")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TableChartIcon />}
            onClick={handleExportToCSV}
            disabled={exportingCSV || !testResult}
            color="secondary"
            sx={{
              "&:hover": {
                bgcolor: "secondary.light",
                color: "white",
              },
            }}
            data-testid="automation-export-csv-button"
          >
            {exportingCSV
              ? t("junit.detail.exportingCSV")
              : t("junit.detail.exportCSV")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            data-testid="automation-detail-refresh-button"
          >
            {t("junit.detail.refresh")}
          </Button>
        </Box>
      </Box>

      {/* 통계 카드 섹션 (JunitStatsCard) */}
      <JunitStatsCard
        testResult={testResult}
        expandedSections={expandedSections}
        handleAccordionChange={handleAccordionChange}
        t={t}
      />

      {/* 연결된 테스트케이스 (역방향): 이 결과의 케이스를 연결한 TC들 */}
      {linkedTestCases.length > 0 && (
        <Box
          sx={{
            mt: 2,
            mb: 1,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.primary">
            {t("junit.detail.linkedTestCases", "연결된 테스트케이스")} (
            {linkedTestCases.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {linkedTestCases.map((item) => (
              <Chip
                key={`${item.testCaseId}-${item.junitCaseId}`}
                variant="outlined"
                clickable
                onClick={() => {
                  const pid = item.projectId || projectId;
                  if (pid)
                    navigate(`/projects/${pid}/testcases/${item.testCaseId}`);
                }}
                title={t(
                  "junit.detail.openLinkedTestCase",
                  "클릭하면 해당 테스트케이스로 이동합니다",
                )}
                sx={{ cursor: "pointer" }}
                label={
                  (item.displayId ? `${item.displayId} · ` : "") +
                  (item.testCaseName || item.testCaseId) +
                  (item.junitCaseName ? `  ← ${item.junitCaseName}` : "")
                }
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 테스트 케이스 리스트 영역 - Accordion 적용 */}
      <Stack spacing={2}>
        {/* 전체 테스트 케이스 리스트 */}
        <Accordion
          expanded={expandedSections.testCases}
          onChange={handleAccordionChange("testCases")}
          sx={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
            borderRadius: "8px !important",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <TableChartIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                {t("junit.detail.tab.testCases", "테스트 케이스")}
              </Typography>
              {!expandedSections.testCases && (
                <Chip
                  label={`${testResult?.totalTests || 0}${t(
                    "common.unit.count",
                    "개",
                  )}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem", ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 0 }}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                gap: 2,
                height: "calc(100vh - 400px)",
                position: "relative",
              }}
            >
              {/* 좌측 패널: 테스트 케이스 목록 */}
              {sidebarVisible && (
                <Card
                  sx={{
                    flex: showDetailPanel ? "1 1 30%" : "1 1 100%",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    border: "none",
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
                    {/* 스위트 선택 및 필터 */}
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        flexWrap: "wrap",
                        p: 2,
                      }}
                    >
                      <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>{t("junit.detail.testSuite")}</InputLabel>
                        <Select
                          value={selectedSuite?.id || ""}
                          label={t("junit.detail.testSuite")}
                          onChange={(e) => {
                            if (e.target.value === ALL_SUITES_ID) {
                              handleSuiteChange({
                                id: ALL_SUITES_ID,
                                name: t("common.all"),
                              });
                            } else {
                              const suite = testSuites.find(
                                (s) => s.id === e.target.value,
                              );
                              if (suite) handleSuiteChange(suite);
                            }
                          }}
                        >
                          <MenuItem key={ALL_SUITES_ID} value={ALL_SUITES_ID}>
                            {t("common.all")} ({testResult?.totalTests || 0}
                            {t("common.unit.count")})
                          </MenuItem>
                          {testSuites.map((suite) => (
                            <MenuItem key={suite.id} value={suite.id}>
                              {suite.name} ({suite.tests}
                              {t("common.unit.count")})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel>{t("common.status")}</InputLabel>
                        <Select
                          value={statusFilter}
                          label={t("common.status")}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="ALL">{t("common.all")}</MenuItem>
                          <MenuItem value="PASSED">
                            {t("junit.stats.passed")}
                          </MenuItem>
                          <MenuItem value="FAILED">
                            {t("junit.stats.failed")}
                          </MenuItem>
                          <MenuItem value="ERROR">
                            {t("junit.stats.error")}
                          </MenuItem>
                          <MenuItem value="SKIPPED">
                            {t("junit.stats.skipped")}
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        placeholder={t("junit.detail.testCaseSearch")}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>

                    {/* 테스트 케이스 테이블 */}
                    <TableContainer sx={{ flex: 1 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center" width="100px">
                              {t("common.status")}
                            </TableCell>
                            {selectedSuite?.id === ALL_SUITES_ID && (
                              <TableCell
                                sx={{
                                  whiteSpace: "nowrap",
                                  maxWidth: { xs: 80, sm: 120, md: 150 },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <Tooltip
                                  title={t("junit.detail.testSuite")}
                                  arrow
                                  placement="top"
                                >
                                  <span>{t("junit.detail.testSuite")}</span>
                                </Tooltip>
                              </TableCell>
                            )}
                            <TableCell>{t("junit.detail.testName")}</TableCell>
                            <TableCell>
                              {t("junit.editor.notes", "노트")}
                            </TableCell>
                            <TableCell align="center" width="80px">
                              {t("junit.detail.edit")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredTestCases.map((testCase) => {
                            const status =
                              statusConfig[testCase.status] ||
                              statusConfig.PASSED;
                            const hasUserEdits =
                              testCase.userTitle ||
                              testCase.userDescription ||
                              testCase.userNotes ||
                              testCase.userStatus ||
                              testCase.tags;

                            return (
                              <TableRow
                                key={testCase.id}
                                sx={{
                                  bgcolor: hasUserEdits
                                    ? "action.hover"
                                    : "inherit",
                                  "&:hover": { bgcolor: "action.selected" },
                                }}
                                data-testid="automation-case-row"
                              >
                                <TableCell align="center">
                                  <Chip
                                    icon={status.icon}
                                    label={status.label}
                                    size="small"
                                    sx={{
                                      bgcolor: status.bgColor,
                                      color: status.textColor,
                                      fontWeight: "bold",
                                      height: 20,
                                      fontSize: "0.7rem",
                                      "& .MuiChip-icon": {
                                        color: "inherit",
                                        fontSize: "1rem",
                                      },
                                    }}
                                  />
                                </TableCell>
                                {selectedSuite?.id === ALL_SUITES_ID && (
                                  <TableCell
                                    sx={{
                                      whiteSpace: "nowrap",
                                      maxWidth: { xs: 80, sm: 120, md: 150 },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    <Tooltip
                                      title={testCase.suiteName || "-"}
                                      arrow
                                      placement="top"
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: "block",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {testCase.suiteName || "-"}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                )}
                                <TableCell
                                  sx={{
                                    maxWidth: {
                                      xs: 120,
                                      sm: 200,
                                      md: 300,
                                      xl: 400,
                                    },
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <Tooltip
                                    title={
                                      <React.Fragment>
                                        <Typography variant="body2">
                                          {testCase.userTitle || testCase.name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "rgba(255,255,255,0.7)",
                                          }}
                                        >
                                          {testCase.userTitle
                                            ? `${t("junit.detail.original")}: ${
                                                testCase.name
                                              }`
                                            : ""}
                                        </Typography>
                                      </React.Fragment>
                                    }
                                    arrow
                                    placement="top"
                                  >
                                    <Box sx={{ overflow: "hidden" }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                          cursor: "pointer",
                                          color: "primary.main",
                                          display: "block",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                        onClick={() =>
                                          handleTestCaseClick(testCase.id)
                                        }
                                        data-testid="automation-case-name"
                                      >
                                        {testCase.userTitle || testCase.name}
                                      </Typography>
                                      {testCase.userTitle && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                          sx={{
                                            fontSize: "0.65rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {t("junit.detail.original")}:{" "}
                                          {testCase.name}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Tooltip>
                                </TableCell>
                                <TableCell
                                  sx={{ maxWidth: 200 }}
                                  data-testid="automation-case-note-cell"
                                >
                                  {testCase.userNotes ? (
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
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {testCase.userNotes}
                                      </Typography>
                                    </Tooltip>
                                  ) : (
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                    >
                                      -
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditTestCase(testCase)}
                                    color="primary"
                                    data-testid="automation-edit-case-button"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* 인피니티 스크롤 Sentinel 및 로딩 인디케이터 */}
                          <TableRow ref={lastElementRef}>
                            <TableCell
                              colSpan={
                                selectedSuite?.id === ALL_SUITES_ID ? 5 : 4
                              }
                              sx={{ p: 0, border: "none" }}
                            >
                              {isLoadingMore && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 2,
                                    width: "100%",
                                  }}
                                >
                                  <CircularProgress size={24} />
                                  <Typography
                                    variant="body2"
                                    sx={{ ml: 1, color: "text.secondary" }}
                                  >
                                    {t(
                                      "common.loadingMore",
                                      "더 불러오는 중...",
                                    )}
                                  </Typography>
                                </Box>
                              )}
                              {!hasMore && testCases.length > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 2,
                                    width: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    {t(
                                      "common.noMoreData",
                                      "모든 데이터를 불러왔습니다.",
                                    )}
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* 페이지네이션 제거됨 (인피니티 스크롤로 대체) */}
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
                    title={
                      sidebarVisible ? t("common.collapse") : t("common.expand")
                    }
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
                      {sidebarVisible ? (
                        <ChevronLeftIcon />
                      ) : (
                        <ChevronRightIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* 우측 패널: 테스트 케이스 상세 정보 */}
              {showDetailPanel &&
                (() => {
                  const currentIndex = filteredTestCases.findIndex(
                    (tc) => tc.id === selectedTestCaseId,
                  );
                  return (
                    <Card
                      sx={{
                        flex: sidebarVisible ? "1 1 70%" : "1 1 100%",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <TestCaseDetailPanel
                        testCaseId={selectedTestCaseId}
                        refreshTrigger={editRefreshTrigger}
                        onClose={handleCloseDetailPanel}
                        onEditTestCase={handleEditTestCase}
                        onNavigatePrev={handleNavigatePrev}
                        onNavigateNext={handleNavigateNext}
                        hasPrev={currentIndex > 0 || page > 1}
                        hasNext={
                          currentIndex < filteredTestCases.length - 1 ||
                          page < totalPages
                        }
                      />
                    </Card>
                  );
                })()}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 실패한 테스트 목록 */}
        <Accordion
          expanded={expandedSections.failedTests}
          onChange={handleAccordionChange("failedTests")}
          sx={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
            borderRadius: "8px !important",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: alpha(theme.palette.error.main, 0.03) }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <BugIcon color="error" />
              <Typography variant="subtitle1" fontWeight="bold">
                {t("junit.detail.tab.failedTests", "실패한 테스트")}
              </Typography>
              {!expandedSections.failedTests && (
                <Chip
                  label={`${testResult?.failures + testResult?.errors || 0}${t(
                    "common.unit.count",
                    "개",
                  )}`}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem", ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 1 }}>
            <FailedTestsTab
              testResultId={testResultId}
              onEditTestCase={handleEditTestCase}
              refreshTrigger={editRefreshTrigger}
            />
          </AccordionDetails>
        </Accordion>

        {/* 느린 테스트 목록 */}
        <Accordion
          expanded={expandedSections.slowTests}
          onChange={handleAccordionChange("slowTests")}
          sx={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
            borderRadius: "8px !important",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: alpha(theme.palette.warning.main, 0.03) }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <SpeedIcon color="warning" />
              <Typography variant="subtitle1" fontWeight="bold">
                {t("junit.detail.tab.slowTests", "느린 테스트")}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 1 }}>
            <SlowestTestsTab
              testResultId={testResultId}
              onEditTestCase={handleEditTestCase}
              refreshTrigger={editRefreshTrigger}
            />
          </AccordionDetails>
        </Accordion>
      </Stack>
      {/* 테스트 케이스 편집 다이얼로그 */}
      <JunitTestCaseEditor
        testCase={selectedTestCase}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedTestCase(null);
        }}
        onSave={handleEditSave}
      />
    </Box>
  );
};

// 실패한 테스트 탭 컴포넌트 - ICT-337 확장: Split Panel 구조
export default JunitResultDetail;
