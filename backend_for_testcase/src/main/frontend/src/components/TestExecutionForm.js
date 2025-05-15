// src/components/TestExecutionForm.js
import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  Pagination
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { ExecutionStatus, TestResult } from '../models/testExecution';
import TestResultForm from './TestResultForm';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const PAGE_SIZE = 10; // 한 페이지에 보여줄 테스트케이스 수

const TestExecutionForm = ({ executionId, onCancel, onSave }) => {
  const {
    testPlans = [],
    getTestCase,
    getTestPlan,
    fetchTestExecutions
  } = useAppContext();

  const [formOpen, setFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [execution, setExecution] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);

  // 실행 데이터 로드
  useEffect(() => {
    const fetchExecution = async () => {
      if (!executionId) {
        setExecution({
          id: null,
          name: '',
          testPlanId: '',
          description: '',
          status: ExecutionStatus.NOTSTARTED,
          startDate: null,
          endDate: null,
          results: [],
          createdAt: null,
          updatedAt: null
        });
        setSelectedPlan(null);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_BASE}/api/test-executions/${executionId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        if (!res.ok) throw new Error('테스트 실행 정보를 불러올 수 없습니다.');
        const data = await res.json();
        setExecution(data);
        const plan = getTestPlan(data.testPlanId);
        setSelectedPlan(plan);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExecution();
  }, [executionId, getTestPlan]);

  // 테스트플랜 선택 변경
  const handlePlanChange = useCallback(
    event => {
      const planId = event.target.value;
      const plan = getTestPlan(planId);
      setSelectedPlan(plan);
      setExecution(prev => ({
        ...prev,
        testPlanId: planId,
        results: [],
      }));
      setPage(1); // 플랜 변경 시 페이지 초기화
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

  // 실행 저장(신규/수정)
  const handleSaveOrUpdate = async () => {
    if (!execution.name || !execution.testPlanId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const payload = {
        ...execution,
        testPlanId: execution.testPlanId,
        name: execution.name,
        description: execution.description
      };
      let res, saved;
      if (execution.id) {
        res = await fetch(`${API_BASE}/api/test-executions/${execution.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/api/test-executions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined
          },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || '저장 실패');
      }
      saved = await res.json();
      setExecution(saved);
      if (onSave) onSave(saved.id);
      setFormOpen(true);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 실행 시작
  const handleStartExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.NOTSTARTED) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(`${API_BASE}/api/test-executions/${execution.id}/start`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!res.ok) throw new Error('실행 시작 실패');
      const updated = await res.json();
      setExecution(updated);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 실행 완료
  const handleCompleteExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.INPROGRESS) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(`${API_BASE}/api/test-executions/${execution.id}/complete`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!res.ok) throw new Error('실행 완료 실패');
      const updated = await res.json();
      setExecution(updated);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

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

  // 결과 저장 (백엔드 호출)
  const handleSaveResult = useCallback(
    async (result, notes) => {
      if (!execution?.id || !selectedTestCaseId) return;
      setSaving(true);
      try {
        const token = localStorage.getItem('jwtToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(
          `${API_BASE}/api/test-executions/${execution.id}`,
          {
            method: 'GET',
            headers,
            credentials: 'include',
          }
        );
        let updated;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          updated = await res.json();
        } else {
          updated = null;
        }
        if (!res.ok) {
          const errMsg = updated?.message || '결과 저장 실패';
          throw new Error(errMsg);
        }
        setExecution(updated);
        if (fetchTestExecutions) fetchTestExecutions();
      } catch (err) {
        setSaveError(err.message);
      } finally {
        setSaving(false);
        handleCloseResultForm();
      }
    },
    [execution, selectedTestCaseId, fetchTestExecutions, handleCloseResultForm]
  );

  // 진행률 계산
  const calculateProgress = useCallback(() => {
    if (!selectedPlan?.testCaseIds?.length) return 0;
    const totalTests = selectedPlan.testCaseIds.length;
    const completedTests = execution?.results?.filter(
      r => r.result && r.result !== TestResult.NOTRUN
    ).length || 0;
    return Math.round((completedTests / totalTests) * 100);
  }, [selectedPlan, execution]);

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

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

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
        {executionId ? '테스트 실행' : '새 테스트 실행 생성'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : execution && (
          <Grid container spacing={2}>
            {/* Left Column - Form Inputs */}
            <Grid item xs={12} md={6}>
              {execution?.id && (
                <TextField
                  label="실행 ID"
                  value={execution.id}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  disabled
                  InputProps={{ readOnly: true }}
                />
              )}
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
            {execution?.id && (
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
                      disabled={!canStartExecution || saving}
                      aria-label="실행 시작"
                    >
                      실행 시작
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={handleCompleteExecution}
                      disabled={!canCompleteExecution || saving}
                      aria-label="실행 완료"
                    >
                      실행 완료
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              {/* Test Case List + Pagination */}
              <TestCaseResultsTable
                selectedPlan={selectedPlan}
                execution={execution}
                getTestCase={getTestCase}
                canEnterResults={canEnterResults}
                onOpenResultForm={handleOpenResultForm}
                page={page}
                setPage={setPage}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} aria-label="실행 편집 취소">
          취소
        </Button>
        {canEditBasicInfo && (
          <Button
            onClick={handleSaveOrUpdate}
            variant="contained"
            color="primary"
            disabled={!execution?.name || !execution?.testPlanId || saving}
            aria-label="실행 저장"
            startIcon={saving && <CircularProgress size={20} />}
          >
            저장
          </Button>
        )}
      </DialogActions>
      {/* 결과 입력 폼 */}
      <TestResultForm
        open={isResultFormOpen}
        testCaseId={selectedTestCaseId}
        executionId={execution?.id}
        currentResult={execution?.results?.find(r => r.testCaseId === selectedTestCaseId)}
        onClose={handleCloseResultForm}
        onSave={handleSaveResult}
      />

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError('')}
      >
        <Alert severity="error" onClose={() => setSaveError('')}>
          {saveError}
        </Alert>
      </Snackbar>
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
  onOpenResultForm,
  page,
  setPage
}) => {
  const results = execution?.results || [];

  if (!selectedPlan)
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        테스트 플랜을 먼저 선택하세요.
      </Typography>
    );

  const testCaseIds = selectedPlan.testCaseIds || [];
  const total = testCaseIds.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 페이지네이션된 테스트케이스 slice
  const pagedTestCaseIds = testCaseIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box>
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
            {total === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    테스트케이스가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedTestCaseIds.map((testCaseId, idx) => {
                const testCase = getTestCase(testCaseId);
                const resultEntry = results.find(r => r.testCaseId === testCaseId) || {};
                const result = resultEntry.result || TestResult.NOTRUN;
                const notes = resultEntry.notes || '';

                return testCase ? (
                  <TableRow key={testCaseId}>
                    <TableCell>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell>{testCase.name}</TableCell>
                    <TableCell>
                      <ResultCell result={result} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {execution?.id && (
                        <IconButton
                          size="small"
                          onClick={() => onOpenResultForm(testCaseId)}
                          disabled={!canEnterResults}
                          aria-label={`${testCase.name} 결과 입력`}
                        >
                          <ResultIcon result={result} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ) : null;
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {total > PAGE_SIZE && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="small"
          />
        </Box>
      )}
    </Box>
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
    <Typography variant="body2">
      {result ? result.replace(/_/g, '') : 'NOTRUN'}
    </Typography>
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
  onOpenResultForm: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired
};
ResultIcon.propTypes = {
  result: PropTypes.string
};
ResultCell.propTypes = {
  result: PropTypes.string
};

export default TestExecutionForm;
