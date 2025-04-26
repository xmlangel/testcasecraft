// /src/App.js
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  CssBaseline,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FormatListBulleted as TestCaseIcon,
  Assignment as TestPlanIcon,
  PlayCircle as ExecutionIcon
} from '@mui/icons-material';
import { AppProvider } from './context/AppContext';
import TestCaseTree from './components/TestCaseTree';
import TestCaseForm from './components/TestCaseForm';
import TestPlanList from './components/TestPlanList';
import TestPlanForm from './components/TestPlanForm';
import TestExecutionList from './components/TestExecutionList';
import TestExecutionForm from './components/TestExecutionForm';

const App = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(null);
  
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  
  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  
  // 테스트케이스 선택 핸들러
  const handleSelectTestCase = (testCase) => {
    if (testCase) {
      setActiveTestCaseId(testCase.id);
    } else {
      setActiveTestCaseId(null);
    }
  };
  
  // 테스트 플랜 생성 모달 열기
  const handleNewTestPlan = () => {
    setEditingTestPlanId(null);
    setShowTestPlanForm(true);
  };
  
  // 테스트 플랜 수정 모달 열기
  const handleEditTestPlan = (testPlanId) => {
    setEditingTestPlanId(testPlanId);
    setShowTestPlanForm(true);
  };
  
  // 테스트 플랜 모달 닫기
  const handleCloseTestPlanForm = () => {
    setShowTestPlanForm(false);
    setEditingTestPlanId(null);
  };
  
  // 테스트 실행 생성 모달 열기
  const handleNewTestExecution = () => {
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
  };
  
  // 테스트 실행 보기/수정 모달 열기
  const handleViewTestExecution = (testExecutionId) => {
    setEditingTestExecutionId(testExecutionId);
    setShowTestExecutionForm(true);
  };
  
  // 테스트 플랜에서 테스트 실행 시작
  const handleStartExecutionFromPlan = (testPlanId) => {
    setTabIndex(2); // 테스트 실행 탭으로 이동
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
    // 선택된 플랜 정보는 TestExecutionForm 내부에서 처리할 예정
  };
  
  // 테스트 실행 모달 닫기
  const handleCloseTestExecutionForm = () => {
    setShowTestExecutionForm(false);
    setEditingTestExecutionId(null);
  };
  
  return (
    <AppProvider>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            테스트케이스 관리 도구
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<TestCaseIcon />} label="테스트케이스" />
          <Tab icon={<TestPlanIcon />} label="테스트 플랜" />
          <Tab icon={<ExecutionIcon />} label="테스트 실행" />
        </Tabs>
        
        {/* 테스트케이스 관리 탭 */}
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
        
        {/* 테스트 플랜 관리 탭 */}
        {tabIndex === 1 && (
          <Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}>
            <TestPlanList 
              onNewTestPlan={handleNewTestPlan}
              onEditTestPlan={handleEditTestPlan}
              onStartExecution={handleStartExecutionFromPlan}
            />
            
            {showTestPlanForm && (
              <TestPlanForm 
                testPlanId={editingTestPlanId}
                onCancel={handleCloseTestPlanForm}
                onSave={handleCloseTestPlanForm}
              />
            )}
          </Paper>
        )}
        
        {/* 테스트 실행 관리 탭 */}
        {tabIndex === 2 && (
          <Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}>
            <TestExecutionList 
              onNewExecution={handleNewTestExecution}
              onEditExecution={handleViewTestExecution}
              onViewExecution={handleViewTestExecution}
            />
            
            {showTestExecutionForm && (
              <TestExecutionForm
                executionId={editingTestExecutionId}
                onCancel={handleCloseTestExecutionForm}
                onSave={handleCloseTestExecutionForm}
              />
            )}
          </Paper>
        )}
      </Container>
    </AppProvider>
  );
};

export default App;
