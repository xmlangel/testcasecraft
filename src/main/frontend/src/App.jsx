// src/App.js

import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
  } = useAppContext();

  const uiState = loadUIState();
  const [tabIndex, setTabIndex] = useState(uiState.tabIndex ?? 0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(uiState.activeTestCaseId ?? null);
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  const [projectSelectionOpen, setProjectSelectionOpen] = useState(!uiState.activeProjectId);
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

  React.useEffect(() => {
    if (projectSelectionOpen && activeProject) {
      setActiveProject(null);
    }
    // eslint-disable-next-line
  }, [projectSelectionOpen]);

  React.useEffect(() => {
    if (projects.length > 0 && !initialLoad) {
      const activeProjectId = uiState.activeProjectId;
      if (activeProjectId) {
        const project = projects.find((p) => p.id === activeProjectId);
        if (project) setActiveProject(project.id);
      }
      setInitialLoad(true);
    }
  }, [projects, initialLoad]);

  React.useEffect(() => {
    saveUIState({
      activeProjectId: activeProject ? activeProject : null,
      tabIndex,
      activeTestCaseId,
    });
  }, [activeProject, tabIndex, activeTestCaseId]);

  React.useEffect(() => {
    if (activeProject) {
      setTabIndex(0);
      setActiveTestCaseId(null);
      setShowTestPlanForm(false);
      setEditingTestPlanId(null);
      setShowTestExecutionForm(false);
      setEditingTestExecutionId(null);
      setProjectSelectionOpen(false);
    } else {
      setProjectSelectionOpen(true);
    }
  }, [activeProject]);

  const handleProjectSelect = (projectId) => {
    setActiveProject(projectId);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setActiveTestCaseId(null);
  };

  const handleSelectTestCase = (testCase) => {
    if (testCase) setActiveTestCaseId(testCase.id);
    else setActiveTestCaseId(null);
  };

  const handleNewTestPlan = () => {
    setEditingTestPlanId(null);
    setShowTestPlanForm(true);
  };

  const handleEditTestPlan = (testPlanId) => {
    setEditingTestPlanId(testPlanId);
    setShowTestPlanForm(true);
  };

  const handleCloseTestPlanForm = () => {
    setShowTestPlanForm(false);
    setEditingTestPlanId(null);
  };

  const handleNewTestExecution = () => {
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
  };

  const handleViewTestExecution = (testExecutionId) => {
    // 전체화면 상세로 이동
    window.location.href = `/executions/${testExecutionId}`;
  };

  const handleStartExecutionFromPlan = (testPlanId) => {
    setTabIndex(2);
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
  };

  const handleCloseTestExecutionForm = () => {
    setShowTestExecutionForm(false);
    setEditingTestExecutionId(null);
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
        <Login onLoginSuccess={handleLoginSuccess} />
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
          <Button color="inherit" onClick={() => setProjectSelectionOpen(true)}>
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
                        projectId={activeProject?.id}
                        onSelectTestCase={handleSelectTestCase}
                      />
                    </Paper>
                    <Resizer onDrag={handleResizerDrag} />
                    <Box sx={{ flex: 1, minWidth: 0, ml: 1 }}>
                      <TestCaseForm
                        projectId={activeProject?.id}
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
                        // 실행 상세 전체화면 이동
                        onEditExecution={handleViewTestExecution}
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
