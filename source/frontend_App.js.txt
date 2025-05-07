// src/App.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  CssBaseline,
  AppBar,
  Toolbar,
  Box,
  Button,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { AppProvider, useAppContext } from "./context/AppContext";
import ProjectManager from "./components/ProjectManager";
import ProjectHeader from "./components/ProjectHeader";
import TestCaseTree from "./components/TestCaseTree";
import TestCaseForm from "./components/TestCaseForm";
import TestPlanList from "./components/TestPlanList";
import TestPlanForm from "./components/TestPlanForm";
import TestExecutionList from "./components/TestExecutionList";
import TestExecutionForm from "./components/TestExecutionForm";
import Login from "./components/Login";
import UserProfileDialog from "./components/UserProfileDialog";

const STORAGE_KEY = "testcase-manager-ui-state";

function saveUIState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadUIState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const fetchUserInfo = async (token) => {
  const res = await fetch("http://localhost:8080/api/auth/me", {
    headers: {
      "Authorization": token ? `Bearer ${token}` : undefined,
    },
  });
  if (!res.ok) throw new Error("사용자 정보 조회 실패");
  return await res.json();
};

const AppContent = ({ user, onLogout, onUserUpdated }) => {
  const { activeProject, setActiveProject, projects } = useAppContext();

  const uiState = loadUIState();

  const [tabIndex, setTabIndex] = useState(uiState.tabIndex ?? 0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(uiState.activeTestCaseId ?? null);
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  const [projectSelectionOpen, setProjectSelectionOpen] = useState(!uiState.activeProjectId);
  const [initialLoad, setInitialLoad] = useState(false);

  // 사용자 메뉴 상태
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !initialLoad) {
      const { activeProjectId } = uiState;
      if (activeProjectId) {
        const project = projects.find((p) => p.id === activeProjectId);
        if (project) setActiveProject(project.id);
      }
      setInitialLoad(true);
    }
    // eslint-disable-next-line
  }, [projects, initialLoad, setActiveProject]);

  useEffect(() => {
    saveUIState({
      activeProjectId: activeProject ? activeProject.id : null,
      tabIndex,
      activeTestCaseId,
    });
  }, [activeProject, tabIndex, activeTestCaseId]);

  useEffect(() => {
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
    if (testCase) {
      setActiveTestCaseId(testCase.id);
    } else {
      setActiveTestCaseId(null);
    }
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
    setEditingTestExecutionId(testExecutionId);
    setShowTestExecutionForm(true);
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

  // 사용자 메뉴 핸들러
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
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    onLogout();
    handleUserMenuClose();
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            테스트 관리 시스템
          </Typography>
          {activeProject && (
            <Button
              color="inherit"
              onClick={() => setProjectSelectionOpen(true)}
            >
              프로젝트 변경
            </Button>
          )}
          {/* 사용자 메뉴 (우측상단) */}
          {user && (
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
                <MenuItem onClick={handleProfileOpen}>사용자 정보 변경</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {projectSelectionOpen ? (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              프로젝트 선택
            </Typography>
            <ProjectManager onSelectProject={handleProjectSelect} />
          </Box>
        ) : activeProject ? (
          <>
            <ProjectHeader
              tabIndex={tabIndex}
              onTabChange={handleTabChange}
            />

            {tabIndex === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: "calc(100vh - 180px)" }}>
                    <TestCaseTree
                      projectId={activeProject.id}
                      onSelectTestCase={handleSelectTestCase}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TestCaseForm
                    projectId={activeProject.id}
                    testCaseId={activeTestCaseId}
                  />
                </Grid>
              </Grid>
            )}

            {tabIndex === 1 && (
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

            {tabIndex === 2 && (
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
                    onEditExecution={handleViewTestExecution}
                    onViewExecution={handleViewTestExecution}
                  />
                )}
              </Paper>
            )}
          </>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              프로젝트를 선택하거나 생성해주세요.
            </Alert>
          </Box>
        )}
      </Container>
      {/* 사용자 정보 변경 다이얼로그 */}
      <UserProfileDialog
        open={profileDialogOpen}
        onClose={handleProfileClose}
        user={user}
        onUserUpdated={onUserUpdated}
        closeAfterTransition={false}
      />
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 로그인 성공 시 서버에서 사용자 정보 fetch
  const handleLoginSuccess = async (loginResult) => {
    localStorage.setItem("jwtToken", loginResult.token);
    try {
      const userInfo = await fetchUserInfo(loginResult.token);
      setUser({ ...userInfo, token: loginResult.token });
    } catch {
      setUser(null);
      localStorage.removeItem("jwtToken");
    }
    setLoadingUser(false);
  };

  // 앱 시작/새로고침 시 서버에서 사용자 정보 fetch
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setLoadingUser(false);
      return;
    }
    fetchUserInfo(token)
      .then((userInfo) => {
        setUser({ ...userInfo, token });
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("jwtToken");
        setLoadingUser(false);
      });
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  const handleUserUpdated = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  if (loadingUser) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <React.Fragment>
        <CssBaseline />
        <Login onLoginSuccess={handleLoginSuccess} />
      </React.Fragment>
    );
  }

  return (
    <AppProvider>
      <AppContent user={user} onLogout={handleLogout} onUserUpdated={handleUserUpdated} />
    </AppProvider>
  );
};

export default App;
