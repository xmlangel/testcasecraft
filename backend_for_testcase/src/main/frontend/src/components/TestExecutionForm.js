// src/components/TestExecutionForm.js

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Paper, Divider, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, Check as CheckIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { ExecutionStatus, TestResult } from '../models/testExecution';
import TestResultForm from './TestResultForm';
import TestCaseResultsTable from './TestCaseResultsTable';
import StatusInfoItem from './StatusInfoItem';

const TABLE_ROW_HEIGHT = 50;
const TABLE_HEADER_HEIGHT = 50;
const TABLE_PAGE_SIZE = 10;

//const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://qaspecialist.shop';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const TestExecutionForm = ({ executionId, onCancel, onSave }) => {
  const {
    testPlans = [],
    getTestCase,
    getTestPlan,
    fetchTestExecutions,
    addOrUpdateTestExecution,
    startTestExecution,
    completeTestExecution,
    user,
    activeProject,
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
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchExecution = async () => {
      if (!executionId) {
        setExecution({
          id: null,
          name: '',
          testPlanId: '',
          projectId: activeProject?.id || '',
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
        setSelectedPlan(getTestPlan(data.testPlanId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExecution();
  }, [executionId, getTestPlan, activeProject]);

  const handlePlanChange = useCallback(
    event => {
      const planId = event.target.value;
      const plan = getTestPlan(planId);
      setSelectedPlan(plan);
      setExecution(prev => ({ ...prev, testPlanId: planId, results: [] }));
      setPage(1);
    },
    [getTestPlan]
  );

  const handleChange = useCallback(
    field => event => {
      setExecution(prev => ({ ...prev, [field]: event.target.value }));
    },
    []
  );

  // projectId를 반드시 포함하여 저장
  const handleSaveOrUpdate = async () => {
    if (!execution.name || !execution.testPlanId || !execution.projectId) return;
    setSaving(true);
    try {
      const saved = await addOrUpdateTestExecution(execution);
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

  const handleStartExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.NOTSTARTED) return;
    setSaving(true);
    try {
      const updated = await startTestExecution(execution.id);
      setExecution(updated);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.INPROGRESS) return;
    setSaving(true);
    try {
      const updated = await completeTestExecution(execution.id);
      setExecution(updated);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenResultForm = useCallback(testCaseId => {
    setSelectedTestCaseId(testCaseId);
    setIsResultFormOpen(true);
  }, []);

  const handleCloseResultForm = useCallback(() => {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  }, []);

  const handleSaveResult = useCallback(
    async (result, notes) => {
      if (!execution?.id || !selectedTestCaseId) return;
      setSaving(true);
      try {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/api/test-executions/${execution.id}`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });
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

  const calculateProgress = useCallback(() => {
    if (!selectedPlan?.testCaseIds?.length) return 0;
    const totalTests = selectedPlan.testCaseIds.length;
    const completedTests = execution?.results?.filter(
      r => r.result && r.result !== TestResult.NOTRUN
    ).length || 0;
    return Math.round((completedTests / totalTests) * 100);
  }, [selectedPlan, execution]);

  const getResultCounts = useCallback(() => {
    if (!selectedPlan?.testCaseIds?.length) {
      return { NOTRUN: 0, PASS: 0, FAIL: 0, BLOCKED: 0, TOTAL: 0 };
    }
    const total = selectedPlan.testCaseIds.length;
    const results = execution?.results || [];
    let counts = { NOTRUN: 0, PASS: 0, FAIL: 0, BLOCKED: 0, TOTAL: total };
    selectedPlan.testCaseIds.forEach(testCaseId => {
      const resultEntry = results.find(r => r.testCaseId === testCaseId);
      const result = resultEntry?.result;
      if (!result || result === TestResult.NOTRUN) {
        counts.NOTRUN += 1;
      } else if (result === TestResult.PASS) {
        counts.PASS += 1;
      } else if (result === TestResult.FAIL) {
        counts.FAIL += 1;
      } else if (result === TestResult.BLOCKED) {
        counts.BLOCKED += 1;
      }
    });
    return counts;
  }, [selectedPlan, execution]);

  const renderStatusChip = useCallback(status => {
    const statusConfig = {
      [ExecutionStatus.NOTSTARTED]: { label: '대기중', color: 'default' },
      [ExecutionStatus.INPROGRESS]: { label: '진행중', color: 'primary' },
      [ExecutionStatus.COMPLETED]: { label: '완료', color: 'success' }
    };
    const { label, color } = statusConfig[status] || {};
    return <span><Typography component="span" color={color}>{label}</Typography></span>;
  }, []);

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

  if (!formOpen) return null;

  const tableAreaHeight = TABLE_HEADER_HEIGHT + TABLE_ROW_HEIGHT * TABLE_PAGE_SIZE;

  return (
    <Dialog open={formOpen} onClose={onCancel} maxWidth="lg" fullWidth aria-labelledby="execution-dialog">
      <DialogTitle id="execution-dialog">{executionId ? '테스트 실행' : '새 테스트 실행 생성'}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : execution && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {execution?.id && (
                <TextField label="실행 ID" value={execution.id} fullWidth margin="normal" variant="outlined" disabled InputProps={{ readOnly: true }} />
              )}
              <TextField
                label="프로젝트"
                value={
                  activeProject?.name ||
                  (user?.projects?.find(p => p.id === execution.projectId)?.name ?? '')
                }
                fullWidth
                margin="normal"
                variant="outlined"
                disabled
                inputProps={{ readOnly: true, 'aria-label': '프로젝트 이름' }}
              />
              <TextField
                label="실행 이름"
                value={execution.name}
                onChange={handleChange('name')}
                fullWidth margin="normal" variant="outlined" required
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
                    <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="설명"
                value={execution.description}
                onChange={handleChange('description')}
                fullWidth margin="normal" variant="outlined" multiline rows={3}
                disabled={!canEditBasicInfo}
                inputProps={{ 'aria-label': '실행 설명 입력' }}
              />
            </Grid>
            {execution?.id && (
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>상태 정보</Typography>
                  <Box sx={{ mb: 2 }}>
                    <StatusInfoItem label="상태" value={renderStatusChip(execution.status)} />
                    <StatusInfoItem label="시작일시" value={execution.startDate ? new Date(execution.startDate).toLocaleString() : '-'} />
                    <StatusInfoItem label="완료일시" value={execution.endDate ? new Date(execution.endDate).toLocaleString() : '-'} />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>진행률: {calculateProgress()}%</Typography>
                    <Box sx={{ height: 8, borderRadius: 4, background: '#eee', mt: 1 }}>
                      <Box sx={{ width: `${calculateProgress()}%`, height: 8, borderRadius: 4, background: '#1976d2' }} />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {(() => {
                      const counts = getResultCounts();
                      return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">NOT RUN</Typography>
                            <Typography variant="body2">{counts.NOTRUN}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="success.main">PASS</Typography>
                            <Typography variant="body2">{counts.PASS}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="error.main">FAIL</Typography>
                            <Typography variant="body2">{counts.FAIL}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="warning.main">BLOCKED</Typography>
                            <Typography variant="body2">{counts.BLOCKED}</Typography>
                          </Box>
                          <Divider sx={{ my: 0.5 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="bold">Total</Typography>
                            <Typography variant="body2" fontWeight="bold">{counts.TOTAL}</Typography>
                          </Box>
                        </Box>
                      );
                    })()}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained" color="primary" startIcon={<PlayArrowIcon />}
                      onClick={handleStartExecution}
                      disabled={!canStartExecution || saving}
                      aria-label="실행 시작"
                    >실행 시작</Button>
                    <Button
                      variant="contained" color="success" startIcon={<CheckIcon />}
                      onClick={handleCompleteExecution}
                      disabled={!canCompleteExecution || saving}
                      aria-label="실행 완료"
                    >실행 완료</Button>
                  </Box>
                </Paper>
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Box sx={{
                minHeight: `${tableAreaHeight}px`,
                maxHeight: `${tableAreaHeight}px`,
                overflowY: 'auto',
                background: '#fff',
                borderRadius: 1,
                border: '1px solid #eee',
                p: 0
              }}>
                <TestCaseResultsTable
                  selectedPlan={selectedPlan}
                  execution={execution}
                  getTestCase={getTestCase}
                  canEnterResults={canEnterResults}
                  onOpenResultForm={handleOpenResultForm}
                  page={page}
                  setPage={setPage}
                  pageSize={TABLE_PAGE_SIZE}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} aria-label="실행 편집 취소">취소</Button>
        {canEditBasicInfo && (
          <Button
            onClick={handleSaveOrUpdate}
            variant="contained"
            color="primary"
            disabled={!execution?.name || !execution?.testPlanId || !execution?.projectId || saving}
            aria-label="실행 저장"
            startIcon={saving && <CircularProgress size={20} />}
          >저장</Button>
        )}
      </DialogActions>
      <TestResultForm
        open={isResultFormOpen}
        testCaseId={selectedTestCaseId}
        executionId={execution?.id}
        currentResult={execution?.results?.find(r => r.testCaseId === selectedTestCaseId)}
        onClose={handleCloseResultForm}
        onSave={handleSaveResult}
      />
      <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError('')}>
        <Alert severity="error" onClose={() => setSaveError('')}>{saveError}</Alert>
      </Snackbar>
    </Dialog>
  );
};

TestExecutionForm.propTypes = {
  executionId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

export default TestExecutionForm;
