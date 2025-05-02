// src/App.js
import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';

import { AppProvider, useAppContext } from './context/AppContext';
import ProjectManager from './components/ProjectManager';
import ProjectHeader from './components/ProjectHeader';
import TestCaseTree from './components/TestCaseTree';
import TestCaseForm from './components/TestCaseForm';
import TestPlanList from './components/TestPlanList';
import TestPlanForm from './components/TestPlanForm';
import TestExecutionList from './components/TestExecutionList';
import TestExecutionForm from './components/TestExecutionForm';

const AppContent = () => {
  const { 
    activeProject, 
    setActiveProject, 
    projects 
  } = useAppContext();
  
  const [tabIndex, setTabIndex] = useState(0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(null);
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  const [projectSelectionOpen, setProjectSelectionOpen] = useState(true);

  // Reset state when active project changes
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
    setTabIndex(2); // Switch to Execution tab
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
    // TestExecutionForm에서 testPlanId를 처리
  };

  const handleCloseTestExecutionForm = () => {
    setShowTestExecutionForm(false);
    setEditingTestExecutionId(null);
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
        </Toolbar>
      </AppBar>

      {/* 메인 콘텐츠 */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {projectSelectionOpen ? (
          // 프로젝트 선택 화면
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              프로젝트 선택
            </Typography>
            <ProjectManager onSelectProject={handleProjectSelect} />
          </Box>
        ) : (
          // 프로젝트 작업 화면
          activeProject ? (
            <>
              <ProjectHeader 
                tabIndex={tabIndex} 
                onTabChange={handleTabChange} 
              />
              
              {/* 탭 컨텐츠 */}
              {tabIndex === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: 'calc(100vh - 180px)' }}>
                      <TestCaseTree onSelectTestCase={handleSelectTestCase} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TestCaseForm testCaseId={activeTestCaseId} />
                  </Grid>
                </Grid>
              )}

              {tabIndex === 1 && (
                <Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}>
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
                <Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}>
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
          )
        )}
      </Container>
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
