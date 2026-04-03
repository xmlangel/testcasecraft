// src/App.js

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import React, { useState, useRef } from "react";
import {
  Container,
  Paper,
  Typography,
  CssBaseline,
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAppContext, AppProvider } from "./context/AppContext";
import {
  ThemeProvider,
  useTheme as useCustomTheme,
} from "./context/ThemeContext.jsx";
import { I18nProvider, useTranslation } from "./context/I18nContext.jsx";
import ProjectManager from "./components/ProjectManager.jsx";
import ProjectHeader from "./components/ProjectHeader.jsx";
import TestCaseTree from "./components/TestCaseTree.jsx";
import TestCaseHybridForm from "./components/TestCase/TestCaseHybridForm.jsx";
import TestPlanForm from "./components/TestPlanForm.jsx";
import TestPlanList from "./components/TestPlanList.jsx";
import TestExecutionList from "./components/TestExecutionList.jsx";
import TestExecutionForm from "./components/TestExecutionForm.jsx";
import TestCaseResultPage from "./components/TestCaseResultPage.jsx";
import TestResultMainPage from "./components/TestResultMainPage.jsx";
import UserProfileDialog from "./components/UserProfileDialog.jsx";
import Dashboard from "./components/Dashboard.jsx";
import OrganizationList from "./components/OrganizationList.jsx";
import OrganizationDetail from "./components/OrganizationDetail.jsx";
import SystemDashboard from "./components/SystemDashboard.jsx";
import UserList from "./components/UserManagement/UserList.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import JiraStatusIndicator from "./components/JiraIntegration/JiraStatusIndicator.jsx";
import JunitResultDashboard from "./components/JunitResult/JunitResultDashboard.jsx";
import JunitResultDetail from "./components/JUnit/JunitResultDetail.jsx";
import MailSettingsManager from "./components/MailSettings/MailSettingsManager.jsx";
import TranslationManagement from "./components/admin/TranslationManagement.jsx";
import CommonDocumentManagement from "./components/admin/CommonDocumentManagement.jsx";
import ServerTimeDisplay from "./components/ServerTimeDisplay.jsx";
import RAGDocumentManager from "./components/RAG/RAGDocumentManager.jsx";
import ExploratorySessionWorkspace from "./components/ExploratorySessionWorkspace.jsx";
import RateLimitDialog from "./components/RateLimitDialog.jsx";
import { RAGProvider, useRAG } from "./context/RAGContext.jsx";
import { LlmConfigProvider } from "./context/LlmConfigContext.jsx";
import usePageViewTracker from "./hooks/usePageViewTracker.js";
import { SchedulerProvider } from "./context/SchedulerContext.jsx";
import SchedulerManagement from "./components/admin/SchedulerManagement.jsx";
import EmailVerification from "./components/EmailVerification.jsx";
import SessionExpiryDialog from "./components/common/SessionExpiryDialog.jsx";
import JiraIssueRedirect from "./components/JiraIntegration/JiraIssueRedirect.jsx";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from "@mui/icons-material";

const STORAGEKEY = "testcase-manager-ui-state";
const TRACKED_PAGE_PATHS = [
  "/dashboard",
  "/organizations",
  "/organizations/*",
  "/projects",
  "/projects/*",
  "/users",
  "/mail-settings",
  "/translation-management",
  "/llm-config",
  "/projectdashboard",
];
import {
  getDynamicApiUrl,
  getShowExploratorySessionTab,
} from "./utils/apiConstants";

function saveUIState(state) {
  localStorage.setItem(STORAGEKEY, JSON.stringify(state));
}
function loadUIState() {
  try {
    const raw = localStorage.getItem(STORAGEKEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// 리사이저 컴포넌트
const Resizer = ({ onDrag }) => {
  const dragging = useRef(false);

  const handleMouseDown = (e) => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    onDrag(e.movementX);
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = "";
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Box
      sx={{
        width: "6px",
        cursor: "col-resize",
        background: "#eee",
        flexShrink: 0,
        zIndex: 2,
        "&:hover": { background: "#ccc" },
      }}
      onMouseDown={handleMouseDown}
      data-testid="resizer"
    />
  );
};

const AppContent = () => {
  const theme = useTheme();
  const { t, initialized: i18nInitialized } = useTranslation();
  const { mode, toggleTheme } = useCustomTheme();

  const {
    user,
    loadingUser,
    handleLogout,
    handleUserUpdated,
    projects,
    projectsLoading,
    activeProject,
    setActiveProject,
    sessionExpired,
    handleDialogRefresh,
    handleDialogLogin,
  } = useAppContext();

  const [showExploratorySessionTab, setShowExploratorySessionTab] = useState(
    getShowExploratorySessionTab(),
  );

  // 런타임 설정 로드 (ICT-340 연동)
  React.useEffect(() => {
    const loadConfig = async () => {
      await getDynamicApiUrl(); // 설정 로드 트리거
      setShowExploratorySessionTab(getShowExploratorySessionTab());
    };
    loadConfig();
  }, []);

  const { isRagEnabled } = useRAG();
  // 탐색 세션 탭 비노출 상태에서는 직접 접근도 허용하지 않는다.
  const EXPLORATORY_TAB = showExploratorySessionTab
    ? isRagEnabled
      ? 7
      : 6
    : -1;

  const navigate = useNavigate();
  const location = useLocation();

  usePageViewTracker({
    enabled: !!user && !loadingUser && user?.role === "ADMIN",
    include: TRACKED_PAGE_PATHS,
  });

  const uiState = loadUIState();
  const [tabIndex, setTabIndex] = useState(uiState.tabIndex ?? 0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(
    uiState.activeTestCaseId ?? null,
  );
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  const [projectSelectionOpen, setProjectSelectionOpen] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [managementAnchorEl, setManagementAnchorEl] = useState(null);
  const [
    selectedTestPlanIdForNewExecution,
    setSelectedTestPlanIdForNewExecution,
  ] = useState(null);

  // 사용자 로그인 완료 시 initialLoad 설정 (프로젝트가 없어도 로딩 완료로 처리)
  React.useEffect(() => {
    if (user && !loadingUser && !initialLoad) {
      setInitialLoad(true);
    }
  }, [user, loadingUser, initialLoad]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // 전역 에러 스낵바 상태 (ICT-373 403 디버깅)
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSeverity, setErrorSeverity] = useState("error");

  React.useEffect(() => {
    const handleApiError = (event) => {
      const { message, severity } = event.detail;
      setErrorMessage(message);
      setErrorSeverity(severity || "error");
      setErrorSnackbarOpen(true);
    };

    window.addEventListener("api-error", handleApiError);
    return () => {
      window.removeEventListener("api-error", handleApiError);
    };
  }, []);

  const handleErrorSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setErrorSnackbarOpen(false);
  };

  // 트리/폼 사이즈 상태 및 트리 표시/숨김 상태 (ICT-315)
  const [treeWidth, setTreeWidth] = useState(340); // px
  const [treeVisible, setTreeVisible] = useState(uiState.treeVisible ?? true); // 트리 표시/숨김 상태
  const minWidth = 200;
  const maxWidth = 600;

  // 트리 토글 핸들러 (ICT-315)
  const handleTreeToggle = () => {
    setTreeVisible(!treeVisible);
  };

  const handleResizerDrag = (dx) => {
    setTreeWidth((w) => {
      const next = w + dx;
      if (next < minWidth) return minWidth;
      if (next > maxWidth) return maxWidth;
      return next;
    });
  };

  // URL에서 프로젝트 ID 추출
  const getProjectIdFromUrl = () => {
    const path = location.pathname;
    const match = path.match(/^\/projects\/([^/]+)/);
    return match ? match[1] : null;
  };

  // URL에서 테스트 케이스 ID 추출
  const getTestCaseIdFromUrl = () => {
    const path = location.pathname;
    const match = path.match(/^\/projects\/[^/]+\/testcases\/([^/]+)/);
    return match ? match[1] : null;
  };

  // URL이 테스트케이스 섹션인지 확인
  const isTestCasesSection = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^/]+\/testcases/);
  };

  // URL이 테스트플랜 섹션인지 확인
  const isTestPlansSection = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/testplans/);
  };

  // URL에서 테스트 플랜 ID 추출
  const getTestPlanIdFromUrl = () => {
    const path = location.pathname;
    const match = path.match(/^\/projects\/[^\/]+\/testplans\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // URL이 새 테스트플랜 생성 페이지인지 확인
  const isNewTestPlanUrl = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/testplans\/new$/);
  };

  // URL이 테스트실행 섹션인지 확인
  // /executions 경로더라도 viewType 쿼리 파라미터가 있으면 결과 대시보드 섹션으로 처리
  const isTestExecutionsSection = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const hasViewType = searchParams.has("viewType");
    if (hasViewType) return false; // viewType이 있으면 결과 탭에서 렌더링
    return path.match(/^\/projects\/[^\/]+\/executions/);
  };

  // URL에서 테스트 실행 ID 추출
  const getTestExecutionIdFromUrl = () => {
    const path = location.pathname;
    const match = path.match(/^\/projects\/[^\/]+\/executions\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // URL이 새 테스트실행 생성 페이지인지 확인
  const isNewTestExecutionUrl = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/executions\/new$/);
  };

  // URL이 테스트결과 섹션인지 확인
  // /results 경로 외에도 /executions에 viewType 쿼리 파라미터가 있는 경우도 포함
  const isTestResultsSection = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const hasViewType = searchParams.has("viewType");
    if (path.match(/^\/projects\/[^\/]+\/executions/) && hasViewType)
      return true;
    return path.match(/^\/projects\/[^\/]+\/results/);
  };

  // URL이 자동화 테스트 결과 섹션인지 확인 (기존 junit 경로도 지원)
  const isAutomationTestsSection = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/(junit|automation)/);
  };

  // URL이 RAG 문서 섹션인지 확인
  const isRagSection = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/rag/);
  };

  // URL이 탐색 세션 섹션인지 확인
  const isExploratorySection = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/exploratory/);
  };

  // URL 경로에 따른 화면 표시 결정
  React.useEffect(() => {
    const urlProjectId = getProjectIdFromUrl();
    const isHomePage = location.pathname === "/";
    const isProjectsPage = location.pathname === "/projects";
    const isDashboardPage = location.pathname === "/dashboard";
    const isOrganizationPage = location.pathname.startsWith("/organizations");

    // 사용자나 프로젝트가 아직 로드되지 않았으면 대기
    if (
      loadingUser ||
      projectsLoading ||
      (user && projects.length === 0 && !initialLoad)
    ) {
      return;
    }

    if (
      (isHomePage || isProjectsPage || !urlProjectId) &&
      !isOrganizationPage &&
      !isDashboardPage
    ) {
      setProjectSelectionOpen(true);
      setActiveProject(null);
    } else if (!isOrganizationPage && !isDashboardPage) {
      setProjectSelectionOpen(false);
    }
  }, [location.pathname, projects.length, initialLoad, loadingUser, user]);

  // URL 기반 프로젝트, 테스트 케이스, 테스트 플랜, 테스트 실행 로딩
  React.useEffect(() => {
    if (loadingUser || !initialLoad) {
      return;
    }

    const urlProjectId = getProjectIdFromUrl();
    const urlTestCaseId = getTestCaseIdFromUrl();
    const urlTestPlanId = getTestPlanIdFromUrl();
    const urlTestExecutionId = getTestExecutionIdFromUrl();

    if (urlProjectId) {
      const project = projects.find((p) => p.id === urlProjectId);
      if (project) {
        if (!activeProject || activeProject.id !== project.id) {
          setActiveProject(project);
        }

        if (urlTestCaseId) {
          setTabIndex(1);
          setActiveTestCaseId(urlTestCaseId);
        } else if (isTestCasesSection()) {
          setTabIndex(1);
          setActiveTestCaseId(null);
        } else if (urlTestPlanId) {
          setTabIndex(2);
          if (urlTestPlanId === "new") {
            // 새 테스트플랜 생성
            setEditingTestPlanId(null);
            setShowTestPlanForm(true);
          } else {
            // 기존 테스트플랜 편집
            setEditingTestPlanId(urlTestPlanId);
            setShowTestPlanForm(true);
          }
        } else if (isTestPlansSection()) {
          setTabIndex(2);
          setShowTestPlanForm(false);
          setEditingTestPlanId(null);
        } else if (urlTestExecutionId) {
          setTabIndex(3);
          if (urlTestExecutionId === "new") {
            // 새 테스트실행 생성
            setEditingTestExecutionId(null);
            setShowTestExecutionForm(true);
          } else {
            // 기존 테스트실행 편집
            setEditingTestExecutionId(urlTestExecutionId);
            setShowTestExecutionForm(true);
          }
        } else if (isTestExecutionsSection()) {
          setTabIndex(3);
          setShowTestExecutionForm(false);
          setEditingTestExecutionId(null);
        } else if (isTestResultsSection()) {
          setTabIndex(4);
          setActiveTestCaseId(null);
        } else if (isAutomationTestsSection()) {
          setTabIndex(5);
          setActiveTestCaseId(null);
        } else if (isRagSection()) {
          // RAG 비활성화 시 /rag URL 직접 접근하면 대시보드로 리다이렉트
          if (!isRagEnabled) {
            navigate(`/projects/${urlProjectId}`);
            setTabIndex(0);
          } else {
            setTabIndex(6);
          }
          setActiveTestCaseId(null);
        } else if (isExploratorySection()) {
          if (showExploratorySessionTab) {
            setTabIndex(EXPLORATORY_TAB);
          } else {
            navigate(`/projects/${urlProjectId}`);
            setTabIndex(0);
          }
          setActiveTestCaseId(null);
        } else {
          // 기본 프로젝트 URL 접근 시 대시보드 탭 표시
          setTabIndex(0);
          setActiveTestCaseId(null);
        }
      } else if (projects.length > 0) {
        navigate("/");
      }
    } else if (location.pathname === "/") {
      // 홈페이지 접근 시 프로젝트 선택 페이지로 이동
      navigate("/projects");
    }
  }, [
    projects,
    initialLoad,
    location.pathname,
    navigate,
    activeProject,
    setActiveProject,
    uiState.activeProjectId,
    loadingUser,
    user,
  ]);

  React.useEffect(() => {
    saveUIState({
      activeProjectId: activeProject ? activeProject.id : null,
      tabIndex,
      activeTestCaseId,
      treeVisible, // ICT-315: 트리 표시 상태 저장
    });
  }, [activeProject, tabIndex, activeTestCaseId, treeVisible]);

  React.useEffect(() => {
    if (!showExploratorySessionTab) {
      const maxVisibleTabIndex = isRagEnabled ? 6 : 5;
      if (tabIndex > maxVisibleTabIndex) {
        setTabIndex(0);
      }
    }
  }, [tabIndex, isRagEnabled]);

  React.useEffect(() => {
    if (
      activeProject &&
      !getTestCaseIdFromUrl() &&
      !isTestCasesSection() &&
      !isTestPlansSection() &&
      !isTestExecutionsSection() &&
      !isTestResultsSection() &&
      !isAutomationTestsSection() &&
      !isRagSection() &&
      !isExploratorySection()
    ) {
      setTabIndex(0);
    }
  }, [activeProject, location.pathname]);

  const handleProjectSelect = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    const projectId = activeProject?.id;
    if (projectId) {
      if (newValue === 1) {
        // 테스트케이스 탭
        if (activeTestCaseId) {
          navigate(`/projects/${projectId}/testcases/${activeTestCaseId}`);
        } else {
          navigate(`/projects/${projectId}/testcases`);
        }
      } else if (newValue === 2) {
        // 테스트플랜 탭
        if (editingTestPlanId && showTestPlanForm) {
          navigate(`/projects/${projectId}/testplans/${editingTestPlanId}`);
        } else {
          navigate(`/projects/${projectId}/testplans`);
        }
      } else if (newValue === 3) {
        // 테스트실행 탭
        if (editingTestExecutionId && showTestExecutionForm) {
          navigate(
            `/projects/${projectId}/executions/${editingTestExecutionId}`,
          );
        } else {
          navigate(`/projects/${projectId}/executions`);
        }
      } else if (newValue === 4) {
        // 테스트결과 탭
        navigate(`/projects/${projectId}/results`);
      } else if (newValue === 5) {
        // 자동화 테스트 탭
        navigate(`/projects/${projectId}/automation`);
      } else if (newValue === 6) {
        if (isRagEnabled) {
          // RAG 활성화 시: 6 = RAG 문서 탭
          navigate(`/projects/${projectId}/rag`);
        } else if (showExploratorySessionTab) {
          // RAG 비활성화 시: 6 = 탘색 세션 탭
          navigate(`/projects/${projectId}/exploratory`);
        } else {
          navigate(`/projects/${projectId}`);
        }
      } else if (newValue === 7 && showExploratorySessionTab) {
        // RAG 활성화 시만 탭 7이 존재 (= 탘색 세션)
        navigate(`/projects/${projectId}/exploratory`);
      } else {
        // 대시보드(0) 탭
        navigate(`/projects/${projectId}`);
      }
    }
  };

  const handleSelectTestCase = (testCase) => {
    const projectId =
      typeof activeProject === "object" ? activeProject?.id : activeProject;
    if (testCase && projectId) {
      setActiveTestCaseId(testCase.id);
      navigate(`/projects/${projectId}/testcases/${testCase.id}`);
    } else if (projectId) {
      setActiveTestCaseId(null);
      navigate(`/projects/${projectId}`);
    }
  };

  const handleNewTestPlan = () => {
    const projectId = activeProject?.id;
    if (projectId) {
      setEditingTestPlanId(null);
      setShowTestPlanForm(true);
      navigate(`/projects/${projectId}/testplans/new`);
    }
  };

  const handleEditTestPlan = (testPlanId) => {
    const projectId = activeProject?.id;
    if (projectId) {
      setEditingTestPlanId(testPlanId);
      setShowTestPlanForm(true);
      navigate(`/projects/${projectId}/testplans/${testPlanId}`);
    }
  };

  const handleCloseTestPlanForm = () => {
    const projectId = activeProject?.id;
    setShowTestPlanForm(false);
    setEditingTestPlanId(null);
    if (projectId) {
      navigate(`/projects/${projectId}/testplans`);
    }
  };

  const handleNewTestExecution = () => {
    const projectId = activeProject?.id;
    if (projectId) {
      // 전체화면 페이지로 이동
      navigate(`/projects/${projectId}/executions/new`);
    }
  };

  const handleEditTestExecution = (testExecutionId) => {
    const projectId = activeProject?.id;
    if (projectId) {
      setEditingTestExecutionId(testExecutionId);
      setShowTestExecutionForm(true);
      navigate(`/projects/${projectId}/executions/${testExecutionId}`);
    }
  };

  const handleViewTestExecution = (testExecutionId) => {
    // 전체화면 상세로 이동 (기존 로직 유지)
    window.location.href = `/executions/${testExecutionId}`;
  };

  const handleStartExecutionFromPlan = (testPlanId) => {
    const projectId = activeProject?.id;
    if (projectId) {
      // 전체화면 페이지로 이동 (쿼리 파라미터 사용)
      navigate(
        `/projects/${projectId}/executions/new?testPlanId=${testPlanId}`,
      );
    }
  };

  const handleCloseTestExecutionForm = () => {
    const projectId = activeProject?.id;
    setShowTestExecutionForm(false);
    setEditingTestExecutionId(null);
    setSelectedTestPlanIdForNewExecution(null);
    if (projectId) {
      navigate(`/projects/${projectId}/executions`);
    }
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileOpen = () => {
    setProfileDialogOpen(true);
    handleUserMenuClose();
  };

  const handleProfileClose = () => {
    setProfileDialogOpen(false);
  };

  const handleManagementMenuOpen = (event) => {
    setManagementAnchorEl(event.currentTarget);
  };

  const handleManagementMenuClose = () => {
    setManagementAnchorEl(null);
  };

  const handleManagementNavigate = (targetPath) => {
    navigate(targetPath);
    handleManagementMenuClose();
  };

  // ProtectedRoute에서 이미 인증을 확인했으므로 user는 항상 존재함

  // 관리 메뉴 접근 권한 확인 함수
  const hasManagementAccess = (user) => {
    return user?.role === "ADMIN" || user?.role === "MANAGER";
  };

  // 시스템 관리자 권한 확인 함수 (대시보드용)
  const hasSystemAdminAccess = (user) => {
    return user?.role === "ADMIN";
  };

  // 프로젝트가 없는 경우 안내 메시지 컴포넌트
  const NoProjectsMessage = () => (
    <Container maxWidth={false} sx={{ mt: 4, px: 2, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        {t("project.messages.noParticipatingProjects")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {t("project.messages.needInvitation")}
      </Typography>
      <Typography variant="body1" color="primary" sx={{ fontWeight: "medium" }}>
        {t("project.messages.requestInvitation")}
      </Typography>
    </Container>
  );

  // 권한 없음 페이지 컴포넌트
  const UnauthorizedPage = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        {t("common.unauthorized.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("common.unauthorized.message")}
      </Typography>
      <Button variant="contained" onClick={() => navigate("/projects")}>
        {t("common.unauthorized.backToProjects")}
      </Button>
    </Box>
  );

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar variant="dense" sx={{ minHeight: "64px !important" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate("/projects")}
          >
            <Box
              component="img"
              src={
                theme.palette.mode === "dark"
                  ? "/testcasecraft_dark.jpg"
                  : "/testcasecraft_light.jpg"
              }
              alt="TestCaseCraft"
              sx={{
                height: 60,
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Box>
          {hasSystemAdminAccess(user) && (
            <Button color="inherit" onClick={() => navigate("/dashboard")}>
              {t("header.nav.dashboard")}
            </Button>
          )}
          {hasSystemAdminAccess(user) && (
            <>
              <Button
                color="inherit"
                onClick={handleManagementMenuOpen}
                endIcon={<KeyboardArrowDownIcon />}
                aria-haspopup="true"
                aria-controls={
                  Boolean(managementAnchorEl) ? "management-menu" : undefined
                }
              >
                {t("header.nav.managementMenu", "관리 메뉴")}
              </Button>
              <Menu
                id="management-menu"
                anchorEl={managementAnchorEl}
                open={Boolean(managementAnchorEl)}
                onClose={handleManagementMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: { minWidth: 200, mt: 1 },
                }}
                slotProps={{
                  list: { dense: true },
                }}
              >
                <MenuItem
                  onClick={() => handleManagementNavigate("/organizations")}
                >
                  <Typography variant="body2">
                    {t("header.nav.organizationManagement")}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={() => handleManagementNavigate("/users")}>
                  <Typography variant="body2">
                    {t("header.nav.userManagement")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleManagementNavigate("/mail-settings")}
                >
                  <Typography variant="body2">
                    {t("header.nav.mailSettings")}
                  </Typography>
                </MenuItem>
                {/* <MenuItem onClick={() => handleManagementNavigate('/translation-management')}>
                  <Typography variant="body2">
                    {t('header.nav.translationManagement')}
                  </Typography>
                </MenuItem> */}
                <MenuItem
                  onClick={() => handleManagementNavigate("/llm-config")}
                >
                  <Typography variant="body2">
                    {t("header.nav.llmConfig", "LLM 설정")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleManagementNavigate("/scheduler")}
                >
                  <Typography variant="body2">
                    {t("header.nav.schedulerManagement", "스케줄러 관리")}
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          )}
          <Button
            color="inherit"
            onClick={() => navigate("/projects")}
            data-testid="project-selection-nav"
          >
            {t("header.nav.projectSelection")}
          </Button>

          {/* JIRA 상태 인디케이터 */}
          <Box sx={{ ml: 2, mr: 1 }}>
            <JiraStatusIndicator compact={true} />
          </Box>

          {/* Dark/Light 모드 토글 버튼 */}
          <Box sx={{ ml: 1 }}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label="toggle theme"
              title={
                mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          <Box sx={{ ml: 1 }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleUserMenuOpen}
              aria-label="user menu"
            >
              <Avatar>{user.name ? user.name[0] : "U"}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={handleProfileOpen}
                data-testid="profile-menu-item"
              >
                {t("header.userMenu.profile")}
              </MenuItem>
              <MenuItem onClick={handleLogout} data-testid="logout-menu-item">
                {t("header.userMenu.logout")}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 1, mb: 4, px: 2 }}>
        {loadingUser || !initialLoad || !i18nInitialized ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>
              {t("common.loading", "로딩 중...")}
            </Typography>
          </Box>
        ) : location.pathname === "/dashboard" ? (
          hasSystemAdminAccess(user) ? (
            <SystemDashboard />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname === "/organizations" ? (
          hasSystemAdminAccess(user) ? (
            <OrganizationList />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname === "/users" ? (
          hasSystemAdminAccess(user) ? (
            <UserList />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname === "/mail-settings" ? (
          hasSystemAdminAccess(user) ? (
            <MailSettingsManager />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname === "/translation-management" ? (
          hasSystemAdminAccess(user) ? (
            <TranslationManagement />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname.startsWith("/llm-config") ? (
          hasSystemAdminAccess(user) ? (
            <CommonDocumentManagement />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname === "/scheduler" ? (
          hasSystemAdminAccess(user) ? (
            <SchedulerManagement />
          ) : (
            <UnauthorizedPage />
          )
        ) : location.pathname === "/projectdashboard" ? (
          <Dashboard />
        ) : location.pathname.startsWith("/organizations/") ? (
          hasSystemAdminAccess(user) ? (
            (() => {
              const match = location.pathname.match(
                /^\/organizations\/([^\/]+)/,
              );
              const organizationId = match ? match[1] : null;
              return <OrganizationDetail organizationId={organizationId} />;
            })()
          ) : (
            <UnauthorizedPage />
          )
        ) : projectSelectionOpen ? (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t("header.nav.projectSelection")}
            </Typography>
            <ProjectManager onSelectProject={handleProjectSelect} />
          </Box>
        ) : (
          <>
            {activeProject && (
              <>
                <ProjectHeader
                  tabIndex={tabIndex}
                  onTabChange={handleTabChange}
                  showExploratoryTab={showExploratorySessionTab}
                />
                {tabIndex === 0 && (
                  <Paper sx={{ p: 2, minHeight: "calc(100vh - 180px)" }}>
                    <Dashboard />
                  </Paper>
                )}
                {tabIndex === 1 && (
                  <Box sx={{ display: "flex", height: "calc(100vh - 180px)" }}>
                    {/* 트리 토글 버튼 - ICT-315 */}
                    {!treeVisible && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 16,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 10,
                          backgroundColor: "background.paper",
                          boxShadow: 2,
                          borderRadius: 1,
                        }}
                      >
                        <IconButton
                          onClick={handleTreeToggle}
                          size="small"
                          sx={{
                            color: "primary.main",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                          title={t("testcase.tree.tooltip.open")}
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </Box>
                    )}

                    {/* 트리 영역 */}
                    {treeVisible && (
                      <>
                        <Paper
                          sx={{
                            width: treeWidth,
                            minWidth,
                            maxWidth,
                            height: "100%",
                            transition: "width 0.3s ease-in-out",
                            display: "flex",
                            flexDirection: "column",
                            p: 2,
                            position: "relative",
                          }}
                          elevation={3}
                        >
                          {/* 트리 닫기 버튼 */}
                          <Box
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 8,
                              zIndex: 5,
                            }}
                          >
                            <IconButton
                              onClick={handleTreeToggle}
                              size="small"
                              sx={{
                                color: "text.secondary",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                  color: "primary.main",
                                },
                              }}
                              title={t("testcase.tree.tooltip.close")}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                          </Box>

                          <TestCaseTree
                            projectId={
                              typeof activeProject === "object"
                                ? activeProject.id
                                : activeProject
                            }
                            onSelectTestCase={handleSelectTestCase}
                            selectedTestCaseId={activeTestCaseId}
                          />
                        </Paper>
                        <Resizer onDrag={handleResizerDrag} />
                      </>
                    )}

                    {/* 입력폼/스프레드시트 영역 */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        ml: treeVisible ? 1 : 0,
                        transition: "margin-left 0.3s ease-in-out",
                      }}
                    >
                      <TestCaseHybridForm
                        projectId={
                          typeof activeProject === "object"
                            ? activeProject.id
                            : activeProject
                        }
                        testCaseId={activeTestCaseId}
                      />
                    </Box>
                  </Box>
                )}
                {tabIndex === 2 && (
                  <Paper sx={{ p: 2, minHeight: "calc(100vh - 180px)" }}>
                    {showTestPlanForm ? (
                      <TestPlanForm
                        testPlanId={editingTestPlanId}
                        onCancel={handleCloseTestPlanForm}
                        onSave={handleCloseTestPlanForm}
                      />
                    ) : (
                      <TestPlanList
                        onNewTestPlan={handleNewTestPlan}
                        onEditTestPlan={handleEditTestPlan}
                        onStartExecution={handleStartExecutionFromPlan}
                        onEditExecution={handleEditTestExecution}
                        onViewExecution={handleViewTestExecution}
                      />
                    )}
                  </Paper>
                )}
                {tabIndex === 3 && (
                  <Paper sx={{ p: 2, minHeight: "calc(100vh - 180px)" }}>
                    {showTestExecutionForm ? (
                      <TestExecutionForm
                        executionId={editingTestExecutionId}
                        projectId={activeProject?.id}
                        initialTestPlanId={selectedTestPlanIdForNewExecution}
                        onCancel={handleCloseTestExecutionForm}
                        onSave={handleCloseTestExecutionForm}
                      />
                    ) : (
                      <TestExecutionList
                        onNewExecution={handleNewTestExecution}
                        onEditExecution={handleEditTestExecution}
                      />
                    )}
                  </Paper>
                )}
                {tabIndex === 4 && (
                  <Paper sx={{ p: 2, minHeight: "calc(100vh - 180px)" }}>
                    <TestResultMainPage />
                  </Paper>
                )}
                {tabIndex === 5 && (
                  <Box sx={{ minHeight: "calc(100vh - 180px)" }}>
                    <JunitResultDashboard />
                  </Box>
                )}
                {/* RAG 문서 탭: RAG 활성화 + tabIndex 6일 때만 표시 */}
                {tabIndex === 6 && isRagEnabled && activeProject && (
                  <Box sx={{ minHeight: "calc(100vh - 180px)" }}>
                    <RAGDocumentManager projectId={activeProject.id} />
                  </Box>
                )}
                {/* 탘색 세션 탭: RAG 활성화 시 tabIndex 7, 비활성화 시 tabIndex 6 */}
                {showExploratorySessionTab &&
                  tabIndex === EXPLORATORY_TAB &&
                  activeProject && (
                    <Box sx={{ minHeight: "calc(100vh - 180px)" }}>
                      <ExploratorySessionWorkspace
                        projectId={activeProject.id}
                      />
                    </Box>
                  )}
              </>
            )}
          </>
        )}
      </Container>
      <UserProfileDialog
        open={profileDialogOpen}
        onClose={handleProfileClose}
        user={user}
        onUserUpdated={handleUserUpdated}
      />
      {/* Rate Limit 다이얼로그 */}
      <RateLimitDialog />
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleErrorSnackbarClose}
          severity={errorSeverity}
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <SessionExpiryDialog
        open={sessionExpired}
        onRefresh={handleDialogRefresh}
        onLogin={handleDialogLogin}
      />
    </>
  );
};

// 전체화면 실행 상세 페이지
function TestExecutionFullPage() {
  const { id, projectId, executionId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTestPlanId = searchParams.get("testPlanId");
  const { sessionExpired, handleDialogRefresh, handleDialogLogin } =
    useAppContext();

  const actualExecutionId = executionId || id; // executionId는 새로운 패턴, id는 레거시
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#fafbfc",
        px: 2,
        py: 0,
      }}
    >
      <TestExecutionForm
        executionId={actualExecutionId}
        projectId={projectId}
        initialTestPlanId={initialTestPlanId}
        onCancel={() => navigate(-1)}
        onSave={() => navigate(-1)}
      />
      <SessionExpiryDialog
        open={sessionExpired}
        onRefresh={handleDialogRefresh}
        onLogin={handleDialogLogin}
      />
    </Box>
  );
}

const AppWrapper = () => {
  const { initialized } = useTranslation();

  // Splash Screen 제거 로직 이동 (ICT-337 등 전용 페이지 직접 접근 시 무한 로딩 해결)
  React.useEffect(() => {
    if (initialized) {
      const splash = document.getElementById("splash-screen");
      if (splash) {
        // 이미 앱이 로드되었으므로 페이드아웃 시작
        splash.style.opacity = "0";
        const timer = setTimeout(() => {
          if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }, 500); // transition 시간(0.5s)에 맞춤
        return () => clearTimeout(timer);
      }
    }
  }, [initialized]);

  if (!initialized) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "text.secondary",
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.6 },
              "50%": { opacity: 1 },
            },
          }}
        >
          Initializing Experience...
        </Typography>
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route for email verification */}
        <Route path="/verify-email" element={<EmailVerification />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/executions/:id"
          element={
            <ProtectedRoute>
              <TestExecutionFullPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/executions/new"
          element={
            <ProtectedRoute>
              <TestExecutionFullPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/executions/:executionId"
          element={
            <ProtectedRoute>
              <TestExecutionFullPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/executions/:executionId/testcases/:testCaseId/result"
          element={
            <ProtectedRoute>
              <TestCaseResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/junit-results/:testResultId"
          element={
            <ProtectedRoute>
              <JunitResultDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/junit-results/:testResultId"
          element={
            <ProtectedRoute>
              <JunitResultDetail />
            </ProtectedRoute>
          }
        />
        {/* 새로운 자동화 테스트 경로 */}
        <Route
          path="/automation-tests/:testResultId"
          element={
            <ProtectedRoute>
              <JunitResultDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/automation-results/:testResultId"
          element={
            <ProtectedRoute>
              <JunitResultDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jira-redirect/:issueKey"
          element={
            <ProtectedRoute>
              <JiraIssueRedirect />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* 서버 시간 표시 */}
      <ServerTimeDisplay />
    </BrowserRouter>
  );
};

const App = () => (
  <AppProvider>
    <I18nProvider>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </I18nProvider>
  </AppProvider>
);

export default App;
