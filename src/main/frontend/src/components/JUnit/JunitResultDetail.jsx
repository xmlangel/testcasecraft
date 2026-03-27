// src/main/frontend/src/components/JUnit/JunitResultDetail.jsx

import React, { useState, useEffect } from "react";
import junitResultService from "../../services/junitResultService";
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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
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
  Assessment,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../../context/I18nContext";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import JunitTestCaseEditor from "./JunitTestCaseEditor";
import TestCaseDetailPanel from "./TestCaseDetailPanel";
import { STATUS_COLORS, RESULT_COLORS } from "../../constants/statusColors";
import { exportTestResultToPDF } from "../../utils/pdfExportUtils";
import { exportTestResultToCSV } from "../../utils/csvExportUtils";
import { PAGE_CONTAINER_SX } from "../../styles/layoutConstants";

/**
 * JUnit 테스트 결과 상세 뷰 컴포넌트
 */
const JunitResultDetail = () => {
  const { testResultId, projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useAppContext();
  const { t } = useI18n();
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(calculateDynamicPageSize());

  const [statusFilter, setStatusFilter] = useState("ALL");
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const isDarkMode = theme.palette.mode === "dark";

  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editRefreshTrigger, setEditRefreshTrigger] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // PDF 내보내기 관련 상태
  const [exportingPDF, setExportingPDF] = useState(false);

  // CSV 내보내기 관련 상태
  const [exportingCSV, setExportingCSV] = useState(false);

  // Accordion state - 섹션별 확장 상태 관리
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem(
      "testcase-manager-junit-detail-expanded-sections",
    );
    if (saved !== null) return JSON.parse(saved);

    // 기존 stats 상태 마이그레이션 확인
    const oldStatsSaved = localStorage.getItem(
      "testcase-manager-junit-detail-stats-accordion",
    );
    const statsInitial =
      oldStatsSaved !== null ? JSON.parse(oldStatsSaved) : true;

    return {
      stats: statsInitial,
      testCases: true,
      failedTests: false,
      slowTests: false,
    };
  });

  const handleAccordionChange = (section) => (event, isExpanded) => {
    const newExpanded = { ...expandedSections, [section]: isExpanded };
    setExpandedSections(newExpanded);
    localStorage.setItem(
      "testcase-manager-junit-detail-expanded-sections",
      JSON.stringify(newExpanded),
    );
  };

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
      console.error("JUnit 결과 상세 로드 실패:", err);
      setError(t("junit.detail.loadFailedDetail"));
    } finally {
      setLoading(false);
    }
  };

  // 전체 테스트 케이스 로드 (모든 스윗) - Lazy Loading 방식
  const loadAllTestCases = async (suites, pageNum = 0) => {
    try {
      // 각 스윗의 테스트 케이스 개수로 전체 개수 계산 (초기값)
      let totalTestCases = suites.reduce(
        (sum, suite) => sum + (suite.tests || 0),
        0,
      );
      const initialTotalPages = Math.ceil(totalTestCases / pageSize);
      setTotalPages(initialTotalPages);

      // 현재 페이지의 시작/끝 인덱스 계산
      const pageStartIndex = pageNum * pageSize;
      const pageEndIndex = pageStartIndex + pageSize;

      // 현재 페이지에 필요한 스윗과 범위 계산
      const pageCases = [];
      let currentIndex = 0;

      for (let i = 0; i < suites.length; i++) {
        const suite = suites[i];
        const suiteTestCount = suite.tests || 0;
        const suiteStartIndex = currentIndex;
        const suiteEndIndex = currentIndex + suiteTestCount;

        // 이 스윗이 현재 페이지 범위와 겹치는지 확인
        if (suiteEndIndex > pageStartIndex && suiteStartIndex < pageEndIndex) {
          // 스윗 내에서 어느 부분을 가져와야 하는지 계산
          const suitePageStart = Math.max(0, pageStartIndex - suiteStartIndex);
          const suitePageEnd = Math.min(
            suiteTestCount,
            pageEndIndex - suiteStartIndex,
          );
          const suitePage = Math.floor(suitePageStart / pageSize);
          const suitePageSize = suitePageEnd - suitePageStart;

          try {
            // 해당 스윗의 필요한 부분만 로드
            const response = await junitResultService.getTestCasesBySuite(
              suite.id,
              suitePage,
              Math.min(pageSize, suiteTestCount),
            );

            const cases = response.content || [];

            // 필요한 범위만 추출
            const localStart = suitePageStart % pageSize;
            const localEnd = localStart + suitePageSize;
            const selectedCases = cases.slice(localStart, localEnd);

            // 각 테스트 케이스에 스윗 정보 추가
            const casesWithSuite = selectedCases.map((tc) => ({
              ...tc,
              suiteName: suite.name,
              suiteId: suite.id,
            }));

            pageCases.push(...casesWithSuite);
          } catch (error) {
            console.warn(
              `스윗 ${suite.name}의 테스트 케이스 로드 실패:`,
              error,
            );
          }
        }

        currentIndex += suiteTestCount;

        // 현재 페이지 범위를 벗어났으면 더 이상 로드하지 않음
        if (currentIndex >= pageEndIndex) {
          break;
        }
      }

      setTestCases(pageCases);
    } catch (err) {
      console.error("전체 테스트 케이스 로드 실패:", err);
      setError(t("junit.detail.loadTestCasesFailed"));
    }
  };

  // 단일 스윗의 테스트 케이스 로드
  const loadTestCases = async (suiteId, pageNum = 0) => {
    if (!suiteId) return;

    try {
      const response = await junitResultService.getTestCasesBySuite(
        suiteId,
        pageNum,
        pageSize,
      );
      setTestCases(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error("테스트 케이스 로드 실패:", err);
      setError(t("junit.detail.loadTestCasesFailed"));
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
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
      if (selectedSuite.id === ALL_SUITES_ID) {
        loadAllTestCases(testSuites, 0);
      } else {
        loadTestCases(selectedSuite.id, 0);
      }
      setPage(1);
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

  // 페이지 변경
  const handlePageChange = async (event, newPage) => {
    setPage(newPage);

    if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
      // 전체 보기에서 페이징 - Lazy Loading
      await loadAllTestCases(testSuites, newPage - 1);
    } else if (selectedSuite) {
      // 특정 스윗에서 페이징
      await loadTestCases(selectedSuite.id, newPage - 1);
    }
  };

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
        await loadAllTestCases(testSuites, page - 1);
      } else {
        await loadTestCases(selectedSuite.id, page - 1);
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

  // PDF 내보내기 핸들러
  const handleExportToPDF = async () => {
    if (!testResult) {
      alert(t("junit.detail.exportPDFAlert"));
      return;
    }

    try {
      setExportingPDF(true);

      // 모든 테스트 케이스를 가져오기 (페이징 없이)
      let allTestCases = [];
      for (const suite of testSuites) {
        try {
          const response = await junitResultService.getTestCasesBySuite(
            suite.id,
            0,
            1000,
          );
          allTestCases = [...allTestCases, ...(response.content || [])];
        } catch (error) {
          console.warn(
            `Failed to load test cases for suite ${suite.id}:`,
            error,
          );
        }
      }

      // PDF 내보내기 실행
      const result = await exportTestResultToPDF(
        testResult,
        testSuites,
        allTestCases,
      );

      if (result.success) {
        alert(`${t("junit.detail.exportPDFComplete")}: ${result.fileName}`);
      } else {
        alert(`${t("junit.detail.exportPDFFailed")}: ${result.message}`);
      }
    } catch (error) {
      console.error("PDF 내보내기 오류:", error);
      alert(t("junit.detail.exportPDFError") + ": " + error.message);
    } finally {
      setExportingPDF(false);
    }
  };

  // CSV 내보내기 핸들러
  const handleExportToCSV = async () => {
    if (!testResult) {
      alert(t("junit.detail.exportCSVAlert"));
      return;
    }

    try {
      setExportingCSV(true);

      // 모든 테스트 케이스 수집
      const allTestCases = [];
      for (const suite of testSuites) {
        try {
          const response = await junitResultService.getTestCasesBySuite(
            suite.id,
            0,
            1000,
          );
          allTestCases.push(...(response.content || []));
        } catch (error) {
          console.warn(
            `스위트 ${suite.name}의 테스트 케이스 로드 실패:`,
            error,
          );
        }
      }

      // CSV 내보내기 실행
      const result = await exportTestResultToCSV(
        testResult,
        testSuites,
        allTestCases,
      );

      if (result.success) {
        alert(`${t("junit.detail.exportCSVComplete")}: ${result.fileName}`);
      } else {
        alert(`${t("junit.detail.exportCSVFailed")}: ${result.message}`);
      }
    } catch (error) {
      console.error("CSV 내보내기 오류:", error);
      alert(t("junit.detail.exportCSVError") + ": " + error.message);
    } finally {
      setExportingCSV(false);
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
        console.warn("지원하지 않는 날짜 형식:", typeof dateValue, dateValue);
        return t("junit.detail.unknownDateFormat");
      }

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn("유효하지 않은 날짜 값:", dateValue);
        // 원본 값이 문자열이면 그대로 표시
        if (typeof dateValue === "string" && dateValue.trim()) {
          return dateValue.trim();
        }
        return t("junit.detail.invalidDate");
      }

      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error, "Input:", dateValue);
      // 에러 발생 시 원본 값 표시 (문자열인 경우)
      if (typeof dateValue === "string" && dateValue.trim()) {
        return dateValue.trim();
      }
      return t("junit.detail.dateProcessingError");
    }
  };

  // 필터링된 테스트 케이스
  const filteredTestCases = testCases.filter((testCase) => {
    const matchesStatus =
      statusFilter === "ALL" || testCase.status === statusFilter;
    const matchesSearch =
      !searchText ||
      testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
      testCase.className.toLowerCase().includes(searchText.toLowerCase()) ||
      (testCase.userTitle &&
        testCase.userTitle.toLowerCase().includes(searchText.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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

  const successRate =
    testResult.totalTests > 0
      ? ((testResult.totalTests - testResult.failures - testResult.errors) /
          testResult.totalTests) *
        100
      : 0;

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
            <Typography variant="h4" component="h1">
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
      {/* 통계 카드 섹션 - Accordion 적용 */}
      <Accordion
        expanded={expandedSections.stats}
        onChange={handleAccordionChange("stats")}
        sx={{
          mb: 3,
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
            <Assessment color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">
              {t("junit.sections.statistics", "통계 개요")}
            </Typography>
            {!expandedSections.stats && testResult && (
              <Box sx={{ display: "flex", gap: 2, ml: 2 }}>
                <Chip
                  label={`${t("junit.stats.total")}: ${testResult.totalTests}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${t("junit.stats.passed")}: ${
                    testResult.totalTests -
                    testResult.failures -
                    testResult.errors -
                    testResult.skipped
                  }`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
                <Chip
                  label={`${t("junit.stats.failed")}: ${testResult.failures}`}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
                <Chip
                  label={`${successRate.toFixed(1)}%`}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: "bold" }}
                />
              </Box>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  bgcolor: alpha(RESULT_COLORS.PASS, 0.1),
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: alpha(RESULT_COLORS.PASS, 0.2),
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <PassIcon
                    sx={{ fontSize: 32, color: RESULT_COLORS.PASS, mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: RESULT_COLORS.PASS, fontWeight: "bold" }}
                  >
                    {testResult.totalTests -
                      testResult.failures -
                      testResult.errors -
                      testResult.skipped}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {t("junit.stats.passed")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  bgcolor: alpha(RESULT_COLORS.FAIL, 0.1),
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: alpha(RESULT_COLORS.FAIL, 0.2),
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <FailIcon
                    sx={{ fontSize: 32, color: RESULT_COLORS.FAIL, mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: RESULT_COLORS.FAIL, fontWeight: "bold" }}
                  >
                    {testResult.failures}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {t("junit.stats.failed")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  bgcolor: alpha(STATUS_COLORS.ERROR, 0.1),
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: alpha(STATUS_COLORS.ERROR, 0.2),
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <ErrorIcon
                    sx={{ fontSize: 32, color: STATUS_COLORS.ERROR, mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: STATUS_COLORS.ERROR, fontWeight: "bold" }}
                  >
                    {testResult.errors}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {t("junit.stats.error")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  bgcolor: alpha(RESULT_COLORS.SKIPPED, 0.1),
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: alpha(RESULT_COLORS.SKIPPED, 0.2),
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <SkipIcon
                    sx={{ fontSize: 32, color: RESULT_COLORS.SKIPPED, mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    sx={{ color: RESULT_COLORS.SKIPPED, fontWeight: "bold" }}
                  >
                    {testResult.skipped}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {t("junit.stats.skipped")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <SpeedIcon
                    sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    color="primary.main"
                    sx={{ fontWeight: "bold" }}
                  >
                    {successRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" display="block">
                    {t("junit.stats.successRate")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

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
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 2,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                          size="small"
                        />
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
        console.error("실패한 테스트 로드 실패:", err);
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

// 느린 테스트 탭 컴포넌트
const SlowestTestsTab = ({
  testResultId,
  onEditTestCase,
  refreshTrigger = 0,
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  const [slowestTests, setSlowestTests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSlowestTests = async () => {
      setLoading(true);
      try {
        const response = await junitResultService.getSlowestTestCases(
          testResultId,
          20,
        );
        setSlowestTests(response.slowestCases || []);
      } catch (err) {
        console.error("느린 테스트 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSlowestTests();
  }, [testResultId, refreshTrigger]);

  const formatDuration = (seconds) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 1 }}>
      <List sx={{ p: 0 }}>
        {slowestTests.map((testCase, index) => (
          <ListItem
            key={testCase.id}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              mb: 1.5,
              bgcolor:
                index < 3
                  ? alpha(theme.palette.warning.main, 0.05)
                  : "background.paper",
              boxShadow: "none",
              p: 1.5,
            }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onEditTestCase(testCase)}
                color="primary"
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SpeedIcon
                color={index < 3 ? "warning" : "action"}
                fontSize="small"
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {testCase.userTitle || testCase.name}
                  </Typography>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    color={index < 3 ? "warning" : "default"}
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                  <Chip
                    label={formatDuration(testCase.time || 0)}
                    size="small"
                    color="primary"
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold" }}
                  />
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                >
                  {testCase.className}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      {slowestTests.length === 0 && (
        <Alert severity="info">{t("junit.detail.noExecutionTimeData")}</Alert>
      )}
    </Box>
  );
};

export default JunitResultDetail;
