// src/components/TestExecutionForm.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
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
  Divider,
  CircularProgress
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
import { createTestExecution, ExecutionStatus, TestResult } from '../models/testExecution';
import TestResultForm from './TestResultForm';

const TestExecutionForm = ({ executionId, onCancel, onSave }) => {
  // context에서 state를 거치지 않고 직접 구조분해 (기본값 []로 안전하게)
  const {
    testPlans = [],
    testExecutions = [],
    addTestExecution,
    updateTestExecution,
    startTestExecution,
    completeTestExecution,
    updateTestResult,
    getTestCase,
    getTestPlan
  } = useAppContext();

  const [formOpen, setFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 실행 상태 초기화 (안전한 접근)
  const initialExecution = useMemo(
    () =>
      executionId && testExecutions
        ? testExecutions.find(exec => exec.id === executionId) ||
          createTestExecution(`exec-${uuidv4()}`, '', '', '')
        : createTestExecution(`exec-${uuidv4()}`, '', '', ''),
    [executionId, testExecutions]
  );

  const [execution, setExecution] = useState(initialExecution);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);

  // 데이터 로드 효과 (종속성 정확히 지정)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        if (executionId && testExecutions) {
          const exec = testExecutions.find(e => e.id === executionId);
          if (exec) {
            const plan = getTestPlan(exec.testPlanId);
            setSelectedPlan(plan);
            setExecution(exec);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [executionId, testExecutions, getTestPlan]);

  // 테스트플랜 선택 변경
  const handlePlanChange = useCallback(
    event => {
      const planId = event.target.value;
      const plan = getTestPlan(planId);
      setSelectedPlan(plan);
      setExecution(prev => ({
        ...prev,
        testPlanId: planId,
        results: {},
      }));
    },
    [getTestPlan]
  );

  // 입력 필드 변경 핸들러
  const handleChange = useCallback(
    field => event => {
      setExecution(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    },
    []
  );

  // 실행 시작
  const handleStartExecution = useCallback(() => {
    if (execution?.id && execution.status === ExecutionStatus.NOTSTARTED) {
      startTestExecution(execution.id);
      setExecution(prev => ({
        ...prev,
        status: ExecutionStatus.INPROGRESS,
        startDate: new Date().toISOString()
      }));
    }
  }, [execution, startTestExecution]);

  // 실행 완료
  const handleCompleteExecution = useCallback(() => {
    if (execution?.id && execution.status === ExecutionStatus.INPROGRESS) {
      completeTestExecution(execution.id);
      setExecution(prev => ({
        ...prev,
        status: ExecutionStatus.COMPLETED,
        endDate: new Date().toISOString()
      }));
    }
  }, [execution, completeTestExecution]);

  // 결과 입력 폼 열기
  const handleOpenResultForm = useCallback(testCaseId => {
    setSelectedTestCaseId(testCaseId);
    setIsResultFormOpen(true);
  }, []);

  // 결과 입력 폼 닫기
  const handleCloseResultForm = useCallback(() => {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  }, []);

  // 결과 저장
  const handleSaveResult = useCallback(
    (result, notes) => {
      if (execution?.id && selectedTestCaseId) {
        updateTestResult(execution.id, selectedTestCaseId, result, notes);
        setExecution(prev => ({
          ...prev,
          results: {
            ...prev.results,
            [selectedTestCaseId]: {
              result,
              notes,
              executedAt: new Date().toISOString()
            }
          }
        }));
      }
      handleCloseResultForm();
    },
    [execution, selectedTestCaseId, updateTestResult, handleCloseResultForm]
  );

  // 진행률 계산
  const calculateProgress = useCallback(() => {
    if (!selectedPlan?.testCaseIds?.length) return 0;
    const totalTests = selectedPlan.testCaseIds.length;
    const completedTests = Object.values(execution.results || {}).filter(
      result => result.result && result.result !== TestResult.NOTRUN
    ).length;
    return Math.round((completedTests / totalTests) * 100);
  }, [selectedPlan, execution.results]);

  // 상태 칩 렌더링
  const renderStatusChip = useCallback(status => {
    const statusConfig = {
      [ExecutionStatus.NOTSTARTED]: { label: '대기중', color: 'default' },
      [ExecutionStatus.INPROGRESS]: { label: '진행중', color: 'primary' },
      [ExecutionStatus.COMPLETED]: { label: '완료', color: 'success' }
    };
    const { label, color } = statusConfig[status] || {};
    return <Chip size="small" label={label} color={color} />;
  }, []);

  // 권한 제어
  const canEditBasicInfo = execution.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution =
    execution.status === ExecutionStatus.NOTSTARTED && execution.testPlanId;
  const canCompleteExecution = execution.status === ExecutionStatus.INPROGRESS;
  const canEnterResults = execution.status === ExecutionStatus.INPROGRESS;

  if (!formOpen) return null;

  return (
    <Dialog
      open={formOpen}
      onClose={onCancel}
      maxWidth="lg"
      fullWidth
      aria-labelledby="execution-dialog"
    >
      <DialogTitle id="execution-dialog">
        {executionId ? '테스트 실행 수정' : '새 테스트 실행 생성'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {/* Left Column - Form Inputs */}
            <Grid item xs={12} md={6}>
              <TextField
                label="실행 이름"
                value={execution.name}
                onChange={handleChange('name')}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                disabled={!canEditBasicInfo}
                inputProps={{ 'aria-label': '실행 이름 입력' }}
              />

              <FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}>
                <InputLabel id="test-plan-label">테스트 플랜</InputLabel>
                <Select
                  labelId="test-plan-label"
                  value={execution.testPlanId || ''}
                  onChange={handlePlanChange}
                  label="테스트 플랜"
                  aria-label="테스트 플랜 선택"
                >
                  <MenuItem value="">
                    <em>선택하세요</em>
                  </MenuItem>
                  {testPlans.map(plan => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="설명"
                value={execution.description}
                onChange={handleChange('description')}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
                disabled={!canEditBasicInfo}
                inputProps={{ 'aria-label': '실행 설명 입력' }}
              />
            </Grid>

            {/* Right Column - Status Info */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  상태 정보
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <StatusInfoItem label="상태" value={renderStatusChip(execution.status)} />
                  <StatusInfoItem
                    label="시작일시"
                    value={execution.startDate ? new Date(execution.startDate).toLocaleString() : '-'}
                  />
                  <StatusInfoItem
                    label="완료일시"
                    value={execution.endDate ? new Date(execution.endDate).toLocaleString() : '-'}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    진행률: {calculateProgress()}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartExecution}
                    disabled={!canStartExecution}
                    aria-label="실행 시작"
                  >
                    실행 시작
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={handleCompleteExecution}
                    disabled={!canCompleteExecution}
                    aria-label="실행 완료"
                  >
                    실행 완료
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              {/* Test Case List */}
              <TestCaseResultsTable
                selectedPlan={selectedPlan}
                execution={execution}
                getTestCase={getTestCase}
                canEnterResults={canEnterResults}
                onOpenResultForm={handleOpenResultForm}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} aria-label="실행 편집 취소">
          취소
        </Button>
        {execution.status === ExecutionStatus.NOTSTARTED && (
          <Button
            onClick={() => {
              const updated = { ...execution, updatedAt: new Date().toISOString() };
              if (executionId) {
                updateTestExecution(updated);
              } else {
                addTestExecution(updated);
              }
              onSave?.(updated.id);
              setFormOpen(false);
            }}
            variant="contained"
            color="primary"
            disabled={!execution.name || !execution.testPlanId}
            aria-label="실행 저장"
          >
            저장
          </Button>
        )}
      </DialogActions>

      {/* 결과 입력 폼 */}
      <TestResultForm
        open={isResultFormOpen}
        testCaseId={selectedTestCaseId}
        executionId={execution.id}
        currentResult={execution.results?.[selectedTestCaseId]}
        onClose={handleCloseResultForm}
        onSave={handleSaveResult}
      />
    </Dialog>
  );
};

const StatusInfoItem = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

const TestCaseResultsTable = ({
  selectedPlan,
  execution,
  getTestCase,
  canEnterResults,
  onOpenResultForm
}) => {
  const results = execution.results || {};
  if (!selectedPlan)
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        테스트 플랜을 먼저 선택하세요.
      </Typography>
    );
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="테스트케이스 결과 테이블">
        <TableHead>
          <TableRow>
            <TableCell width="5%">No.</TableCell>
            <TableCell width="40%">테스트케이스</TableCell>
            <TableCell width="25%">결과</TableCell>
            <TableCell width="20%">비고</TableCell>
            <TableCell width="10%" align="center">
              입력
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedPlan.testCaseIds?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  테스트케이스가 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            selectedPlan.testCaseIds.map((testCaseId, index) => {
              const testCase = getTestCase(testCaseId);
              const result = results[testCaseId] || { result: TestResult.NOTRUN, notes: '' };
              return testCase ? (
                <TableRow key={testCaseId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{testCase.name}</TableCell>
                  <TableCell>
                    <ResultCell result={result.result} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {result.notes || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => onOpenResultForm(testCaseId)}
                      disabled={!canEnterResults}
                      aria-label={`${testCase.name} 결과 입력`}
                    >
                      <ResultIcon result={result.result} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ) : null;
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ResultIcon = ({ result }) => {
  const iconMap = {
    [TestResult.PASS]: <CheckIcon color="success" />,
    [TestResult.FAIL]: <ClearIcon color="error" />,
    [TestResult.BLOCKED]: <StopIcon color="warning" />,
    [TestResult.NOTRUN]: <HourglassEmptyIcon color="disabled" />
  };
  return iconMap[result] || null;
};

const ResultCell = ({ result }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <ResultIcon result={result} />
    <Typography variant="body2">{result.replace(/_/g, '')}</Typography>
  </Box>
);

TestExecutionForm.propTypes = {
  executionId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func
};
StatusInfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired
};
TestCaseResultsTable.propTypes = {
  selectedPlan: PropTypes.object,
  execution: PropTypes.object.isRequired,
  getTestCase: PropTypes.func.isRequired,
  canEnterResults: PropTypes.bool.isRequired,
  onOpenResultForm: PropTypes.func.isRequired
};
ResultIcon.propTypes = {
  result: PropTypes.string
};
ResultCell.propTypes = {
  result: PropTypes.string
};

export default TestExecutionForm;
