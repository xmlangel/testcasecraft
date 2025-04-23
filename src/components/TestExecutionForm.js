// /src/components/TestExecutionForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { 
  createTestExecution, 
  ExecutionStatus, 
  TestResult 
} from '../models/testExecution';
import TestResultForm from './TestResultForm';

const TestExecutionForm = ({ executionId, onCancel, onSave }) => {
  const { 
    state, 
    addTestExecution, 
    updateTestExecution, 
    startTestExecution, 
    completeTestExecution,
    updateTestResult,
    getTestCase,
    getTestPlan
  } = useAppContext();
  const { testPlans, testExecutions, testCases } = state;
  
  const [formOpen, setFormOpen] = useState(true);
  const [execution, setExecution] = useState(
    executionId 
      ? testExecutions.find(exec => exec.id === executionId) 
      : createTestExecution(`exec-${uuidv4()}`, '', '', '')
  );
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  
  // 초기 테스트 실행 및 플랜 설정
  useEffect(() => {
    if (executionId) {
      const exec = testExecutions.find(e => e.id === executionId);
      if (exec) {
        setExecution(exec);
        const plan = testPlans.find(p => p.id === exec.testPlanId);
        setSelectedPlan(plan);
      }
    }
  }, [executionId, testExecutions, testPlans]);
  
  // 테스트 플랜 변경 시 호출
  const handlePlanChange = (event) => {
    const planId = event.target.value;
    const plan = testPlans.find(p => p.id === planId);
    setSelectedPlan(plan);
    setExecution({
      ...execution,
      testPlanId: planId,
      results: {}
    });
  };
  
  // 폼 필드 변경 핸들러
  const handleChange = (field) => (event) => {
    setExecution({
      ...execution,
      [field]: event.target.value
    });
  };
  
  // 테스트 실행 시작 핸들러
  const handleStartExecution = () => {
    if (execution.id && execution.status === ExecutionStatus.NOT_STARTED) {
      startTestExecution(execution.id);
      setExecution({
        ...execution,
        status: ExecutionStatus.IN_PROGRESS,
        startDate: new Date().toISOString()
      });
    }
  };
  
  // 테스트 실행 완료 핸들러
  const handleCompleteExecution = () => {
    if (execution.id && execution.status === ExecutionStatus.IN_PROGRESS) {
      completeTestExecution(execution.id);
      setExecution({
        ...execution,
        status: ExecutionStatus.COMPLETED,
        endDate: new Date().toISOString()
      });
    }
  };
  
  // 결과 입력 폼 열기
  const handleOpenResultForm = (testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setIsResultFormOpen(true);
  };
  
  // 결과 입력 폼 닫기
  const handleCloseResultForm = () => {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  };
  
  // 테스트 결과 저장
  const handleSaveResult = (result, notes) => {
    if (execution.id && selectedTestCaseId) {
      updateTestResult(execution.id, selectedTestCaseId, result, notes);
      
      setExecution({
        ...execution,
        results: {
          ...execution.results,
          [selectedTestCaseId]: {
            result,
            notes,
            executedAt: new Date().toISOString()
          }
        }
      });
    }
    handleCloseResultForm();
  };
  
  // 테스트 실행 저장 핸들러
  const handleSave = () => {
    const updatedExecution = {
      ...execution,
      updatedAt: new Date().toISOString()
    };
    
    if (executionId) {
      updateTestExecution(updatedExecution);
    } else {
      addTestExecution(updatedExecution);
    }
    
    setFormOpen(false);
    if (onSave) {
      onSave(updatedExecution.id);
    }
  };
  
  // 취소 핸들러
  const handleCancel = () => {
    setFormOpen(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  // 테스트 결과 상태에 따른 아이콘 렌더링
  const renderResultIcon = (result) => {
    switch (result) {
      case TestResult.PASS:
        return <CheckIcon fontSize="small" color="success" />;
      case TestResult.FAIL:
        return <ClearIcon fontSize="small" color="error" />;
      case TestResult.BLOCKED:
        return <StopIcon fontSize="small" color="warning" />;
      default:
        return <HourglassEmptyIcon fontSize="small" color="disabled" />;
    }
  };
  
  // 진행률 계산
  const calculateProgress = () => {
    if (!selectedPlan || !selectedPlan.testCaseIds.length) return 0;
    
    const totalTests = selectedPlan.testCaseIds.length;
    const results = execution.results || {};
    const completedTests = Object.keys(results).filter(
      id => results[id].result !== TestResult.NOT_RUN
    ).length;
    
    return Math.round((completedTests / totalTests) * 100);
  };
  
  if (!formOpen) {
    return null;
  }
  
  const canEditBasicInfo = execution.status === ExecutionStatus.NOT_STARTED;
  const canStartExecution = execution.status === ExecutionStatus.NOT_STARTED && execution.testPlanId;
  const canCompleteExecution = execution.status === ExecutionStatus.IN_PROGRESS;
  const canEnterResults = execution.status === ExecutionStatus.IN_PROGRESS;
  
  return (
    <Dialog
      open={formOpen}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {executionId ? '테스트 실행 상세' : '새 테스트 실행 생성'}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="테스트 실행 이름"
              value={execution.name || ''}
              onChange={handleChange('name')}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              disabled={!canEditBasicInfo}
            />
            
            <FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}>
              <InputLabel id="test-plan-select-label">테스트 플랜</InputLabel>
              <Select
                labelId="test-plan-select-label"
                value={execution.testPlanId || ''}
                onChange={handlePlanChange}
                label="테스트 플랜"
              >
                <MenuItem value="">
                  <em>선택하세요</em>
                </MenuItem>
                {testPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="설명"
              value={execution.description || ''}
              onChange={handleChange('description')}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              disabled={!canEditBasicInfo}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                상태 정보
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">상태:</Typography>
                  <Chip 
                    size="small" 
                    label={execution.status} 
                    color={
                      execution.status === ExecutionStatus.COMPLETED 
                        ? 'success' 
                        : execution.status === ExecutionStatus.IN_PROGRESS 
                          ? 'primary' 
                          : 'default'
                    }
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">시작 일시:</Typography>
                  <Typography variant="body2">
                    {execution.startDate 
                      ? new Date(execution.startDate).toLocaleString() 
                      : '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">종료 일시:</Typography>
                  <Typography variant="body2">
                    {execution.endDate 
                      ? new Date(execution.endDate).toLocaleString() 
                      : '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    진행률: {calculateProgress()}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress()} 
                    sx={{ height: 10, borderRadius: 5 }} 
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartExecution}
                  disabled={!canStartExecution}
                >
                  테스트 시작
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleCompleteExecution}
                  disabled={!canCompleteExecution}
                >
                  테스트 완료
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          테스트케이스 및 결과
        </Typography>
        
        {selectedPlan ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="5%">No.</TableCell>
                  <TableCell width="40%">테스트케이스</TableCell>
                  <TableCell width="20%">결과</TableCell>
                  <TableCell width="25%">메모</TableCell>
                  <TableCell width="10%" align="center">동작</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPlan.testCaseIds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        이 테스트 플랜에는 테스트케이스가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedPlan.testCaseIds.map((testCaseId, index) => {
                    const testCase = getTestCase(testCaseId);
                    if (!testCase) return null;
                    
                    const result = execution.results && execution.results[testCaseId]
                      ? execution.results[testCaseId]
                      : { result: TestResult.NOT_RUN, notes: '' };
                    
                    return (
                      <TableRow key={testCaseId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{testCase.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderResultIcon(result.result)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {result.result}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxHeight: 40, overflow: 'hidden' }}>
                            {result.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenResultForm(testCaseId)}
                            disabled={!canEnterResults}
                          >
                            {renderResultIcon(result.result)}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            테스트 플랜을 선택하세요.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>닫기</Button>
        {execution.status === ExecutionStatus.NOT_STARTED && (
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={!execution.name || !execution.testPlanId}
          >
            저장
          </Button>
        )}
      </DialogActions>
      
      {/* 테스트 결과 입력 폼 */}
      {isResultFormOpen && selectedTestCaseId && (
        <TestResultForm 
          open={isResultFormOpen}
          testCaseId={selectedTestCaseId}
          executionId={execution.id}
          currentResult={
            execution.results && execution.results[selectedTestCaseId]
              ? execution.results[selectedTestCaseId]
              : { result: TestResult.NOT_RUN, notes: '' }
          }
          onClose={handleCloseResultForm}
          onSave={handleSaveResult}
        />
      )}
    </Dialog>
  );
};

export default TestExecutionForm;
