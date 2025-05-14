// src/App.js

import { BrowserRouter } from 'react-router-dom';
import React, { useState } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  useAppContext,
  AppProvider,
} from "./context/AppContext";
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
import Dashboard from "./components/Dashboard"; // 추가

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
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, height: "calc(100vh - 180px)" }}>
                        <TestCaseTree
                          projectId={activeProject?.id}
                          onSelectTestCase={handleSelectTestCase}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TestCaseForm
                        projectId={activeProject?.id}
                        testCaseId={activeTestCaseId}
                      />
                    </Grid>
                  </Grid>
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

const App = () => (
  <AppProvider>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AppContent />
    </BrowserRouter>
  </AppProvider>
);

export default App;
