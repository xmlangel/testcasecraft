import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,


  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TestResultForm from './TestResultForm.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { invalidateDashboardCache } from '../services/dashboardService';

import { API_CONFIG } from '../utils/apiConstants.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

const TestCaseResultPage = () => {
  const { projectId, executionId, testCaseId } = useParams();
  const navigate = useNavigate();
  const { api } = useAppContext();
  
  const [execution, setExecution] = useState(null);
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 테스트 실행과 테스트케이스 정보를 병렬로 조회
        const [executionResponse, testCaseResponse] = await Promise.all([
          api(`${API_BASE_URL}/api/test-executions/${executionId}`),
          api(`${API_BASE_URL}/api/testcases/${testCaseId}`)
        ]);

        if (!executionResponse.ok) {
          throw new Error('테스트 실행 정보를 불러올 수 없습니다.');
        }
        if (!testCaseResponse.ok) {
          throw new Error('테스트케이스 정보를 불러올 수 없습니다.');
        }

        const executionData = await executionResponse.json();
        const testCaseData = await testCaseResponse.json();
        
        setExecution(executionData);
        setTestCase(testCaseData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && executionId && testCaseId) {
      fetchData();
    }
  }, [projectId, executionId, testCaseId, api]);

  const handleBack = () => {
    navigate(`/executions/${executionId}`);
  };

  const handleSave = (updatedExecution) => {
    setExecution(updatedExecution);
    
    // ICT-198: 대시보드 캐시 무효화
    try {
      invalidateDashboardCache();
      console.log('Dashboard cache invalidated from TestCaseResultPage.');
    } catch (e) {
      console.error('Failed to invalidate dashboard cache:', e);
    }

    // 저장 후 테스트 실행 페이지로 돌아가기
    handleBack();
  };

  const handleClose = () => {
    handleBack();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              테스트 결과 입력
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            테스트 결과 입력
          </Typography>
          {testCase && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              {testCase.name}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        <Paper sx={{ p: 0 }}>
          {execution && testCase && (
            <TestResultForm
              open={true}
              testCaseId={testCaseId}
              executionId={executionId}
              currentResult={execution.results?.find((r) => r.testCaseId === testCaseId)}
              onClose={handleClose}
              onSave={handleSave}
              fullPage={true}
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default TestCaseResultPage;