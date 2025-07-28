// src/App.js

import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useRef } from "react";
import {
  Container, Paper, Typography, CssBaseline, AppBar, Toolbar,  Box,  Button, IconButton, Menu, MenuItem, Avatar, CircularProgress
} from "@mui/material";
import {
  useAppContext,
  AppProvider,
} from "./context/AppContext";
import ProjectManager from "./components/ProjectManager.jsx";
import ProjectHeader from "./components/ProjectHeader.jsx";
import TestCaseTree from "./components/TestCaseTree.jsx";
import TestCaseForm from "./components/TestCaseForm.jsx";
import TestPlanList from "./components/TestPlanList.jsx";
import TestPlanForm from "./components/TestPlanForm.jsx";
import TestExecutionList from "./components/TestExecutionList.jsx";
import TestExecutionForm from "./components/TestExecutionForm.jsx";
import Login from "./components/Login.jsx";
import UserProfileDialog from "./components/UserProfileDialog.jsx";
import Dashboard from "./components/Dashboard.jsx";

const STORAGEKEY = "testcase-manager-ui-state";
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
  const {
    user,
    loadingUser,
    handleLoginSuccess,
    handleLogout,
    handleUserUpdated,
    projects,
    activeProject,
    setActiveProject,
    testPlans,
    setActiveTestPlan,
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  
  const uiState = loadUIState();
  const [tabIndex, setTabIndex] = useState(uiState.tabIndex ?? 0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(uiState.activeTestCaseId ?? null);
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  const [projectSelectionOpen, setProjectSelectionOpen] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // 트리/폼 사이즈 상태
  const [treeWidth, setTreeWidth] = useState(340); // px
  const minWidth = 200;
  const maxWidth = 600;

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
    const match = path.match(/^\/projects\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // URL에서 테스트 케이스 ID 추출
  const getTestCaseIdFromUrl = () => {
    const path = location.pathname;
    const match = path.match(/^\/projects\/[^\/]+\/testcases\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // URL이 테스트케이스 섹션인지 확인
  const isTestCasesSection = () => {
    const path = location.pathname;
    return path.match(/^\/projects\/[^\/]+\/testcases/);
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
  const isTestExecutionsSection = () => {
    const path = location.pathname;
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

  

  // URL 경로에 따른 화면 표시 결정
  React.useEffect(() => {
    const urlProjectId = getProjectIdFromUrl();
    const isHomePage = location.pathname === '/';
    
    if (isHomePage || !urlProjectId) {
      setProjectSelectionOpen(true);
      setActiveProject(null);
    } else {
      setProjectSelectionOpen(false);
    }
  }, [location.pathname]);

  // URL 기반 프로젝트, 테스트 케이스, 테스트 플랜, 테스트 실행 로딩
  React.useEffect(() => {
    if (projects.length === 0 && !initialLoad) return;

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
          if (urlTestPlanId === 'new') {
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
          if (urlTestExecutionId === 'new') {
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
        } else {
          setTabIndex(0);
          setActiveTestCaseId(null);
        }
      } else if (projects.length > 0) {
        navigate('/');
      }
    } else if (location.pathname === '/') {
        const activeProjectId = uiState.activeProjectId;
        if (activeProjectId) {
          const project = projects.find((p) => p.id === activeProjectId);
          if (project) {
            navigate(`/projects/${activeProjectId}`);
          }
        }
    }
  }, [projects, initialLoad, location.pathname, navigate, loadingUser, activeProject, setActiveProject, uiState.activeProjectId]);

  React.useEffect(() => {
    saveUIState({
      activeProjectId: activeProject ? activeProject.id : null,
      tabIndex,
      activeTestCaseId,
    });
  }, [activeProject, tabIndex, activeTestCaseId]);

  React.useEffect(() => {
    if (activeProject && !getTestCaseIdFromUrl() && !isTestCasesSection() && !isTestPlansSection() && !isTestExecutionsSection()) {
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
          navigate(`/projects/${projectId}/executions/${editingTestExecutionId}`);
        } else {
          navigate(`/projects/${projectId}/executions`);
        }
      } else {
        // 대시보드(0) 탭
        navigate(`/projects/${projectId}`);
      }
    }
  };

  const handleSelectTestCase = (testCase) => {
    const projectId = activeProject?.id;
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
      setEditingTestExecutionId(null);
      setShowTestExecutionForm(true);
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
      setTabIndex(3);
      setEditingTestExecutionId(null);
      setShowTestExecutionForm(true);
      navigate(`/projects/${projectId}/executions/new`);
    }
  };

  const handleCloseTestExecutionForm = () => {
    const projectId = activeProject?.id;
    setShowTestExecutionForm(false);
    setEditingTestExecutionId(null);
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

  if (loadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <>
        <CssBaseline />
        <Login onLoginSuccess={(data) => handleLoginSuccess(data)} />
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            테스트케이스 관리툴
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            프로젝트 선택
          </Button>
          <Box sx={{ ml: 2 }}>
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
              <MenuItem onClick={handleProfileOpen}>프로필</MenuItem>
              <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {projectSelectionOpen ? (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              프로젝트 선택
            </Typography>
            <ProjectManager
              onSelectProject={handleProjectSelect}
              userRole={user?.role}
            />
          </Box>
        ) : (
          <>
            {activeProject && (
              <>
                <ProjectHeader
                  tabIndex={tabIndex}
                  onTabChange={handleTabChange}
                />
                {tabIndex === 0 && (
                  <Paper sx={{ p: 2, minHeight: "calc(100vh - 180px)" }}>
                    <Dashboard />
                  </Paper>
                )}
                {tabIndex === 1 && (
                  <Box sx={{ display: "flex", height: "calc(100vh - 180px)" }}>
                    <Paper
                      sx={{
                        width: treeWidth,
                        minWidth,
                        maxWidth,
                        height: "100%",
                        overflow: "auto",
                        transition: "width 0.1s",
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                      }}
                      elevation={3}
                    >
                      <TestCaseTree
                        projectId={typeof activeProject === 'object' ? activeProject.id : activeProject}
                        onSelectTestCase={handleSelectTestCase}
                        selectedTestCaseId={activeTestCaseId}
                      />
                    </Paper>
                    <Resizer onDrag={handleResizerDrag} />
                    <Box sx={{ flex: 1, minWidth: 0, ml: 1 }}>
                      <TestCaseForm
                        projectId={typeof activeProject === 'object' ? activeProject.id : activeProject}
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
                        onCancel={handleCloseTestExecutionForm}
                        onSave={handleCloseTestExecutionForm}
                      />
                    ) : (
                      <TestExecutionList
                        onNewExecution={handleNewTestExecution}
                        onEditExecution={handleEditTestExecution}
                        // 실행 상세 전체화면 이동
                        onViewExecution={handleViewTestExecution}
                      />
                    )}
                  </Paper>
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
    </>
  );
};

// 전체화면 실행 상세 페이지
function TestExecutionFullPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#fafbfc', p: 0 }}>
      <TestExecutionForm
        executionId={id}
        onCancel={() => navigate(-1)}
        onSave={() => navigate(-1)}
      />
    </Box>
  );
}

const App = () => (
  <AppProvider>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/*" element={<AppContent />} />
        <Route path="/executions/:id" element={<TestExecutionFullPage />} />
      </Routes>
    </BrowserRouter>
  </AppProvider>
);

export default App;
