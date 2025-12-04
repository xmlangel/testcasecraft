// src/components/TestPlanList.jsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Card, CardContent, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, LinearProgress, Divider,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow, CheckCircle, Schedule, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { ExecutionStatus } from '../models/testExecution.jsx';
import { formatDateSafe, safeParseDate } from '../utils/dateUtils';
import TestPlanAutomatedLinkDialog from './TestPlanAutomatedLinkDialog';
import { Link as LinkIcon } from '@mui/icons-material';

const ADMIN_ROLES = ['ADMIN', 'MANAGER'];
const PLANS_PER_PAGE = 10;
// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

const TestPlanList = ({ onNewTestPlan, onEditTestPlan, onStartExecution, onEditExecution, onViewExecution }) => {
  const {
    activeProject,
    testPlans,
    projectsLoading,
    testPlansLoading,
    deleteTestPlan,
    testCases,
    user,
    api,
  } = useAppContext();

  const { t } = useI18n();

  // Local state
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [page, setPage] = useState(1);

  // Accordion state
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('testcase-manager-testplan-accordion');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
    localStorage.setItem('testcase-manager-testplan-accordion', JSON.stringify(isExpanded));
  };

  // Test execution dialog state
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [selectedTestPlan, setSelectedTestPlan] = useState(null);
  const [testExecutions, setTestExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [linkedAutomatedTests, setLinkedAutomatedTests] = useState([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPlanForLink, setSelectedPlanForLink] = useState(null);
  const [automatedTestCounts, setAutomatedTestCounts] = useState({});

  // Derived state
  const projectId = activeProject?.id;
  const globalLoading = projectsLoading || testPlansLoading;
  const canManage = ADMIN_ROLES.includes(user?.role);

  // 생성일(createdAt) 기준 정렬
  const sortedTestPlans = useMemo(() => {
    return [...testPlans].sort((a, b) => {
      const dateA = safeParseDate(a.createdAt);
      const dateB = safeParseDate(b.createdAt);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });
  }, [testPlans]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedTestPlans.length / PLANS_PER_PAGE);
  const paginatedPlans = useMemo(() => {
    const start = (page - 1) * PLANS_PER_PAGE;
    return sortedTestPlans.slice(start, start + PLANS_PER_PAGE);
  }, [sortedTestPlans, page]);

  // Fetch test executions for a specific test plan
  const fetchTestExecutionsForPlan = useCallback(async (testPlanId) => {
    if (!activeProject?.id) return;
    try {
      setExecutionsLoading(true);
      const response = await api(`/api/test-executions/by-project/${activeProject.id}`);
      if (!response.ok) throw new Error('Failed to fetch executions');
      const data = await response.json();
      // Filter executions for the specific test plan
      const planExecutions = data.filter(execution => execution.testPlanId === testPlanId);
      setTestExecutions(planExecutions);
    } catch (err) {
      setError(err.message);
    } finally {
      setExecutionsLoading(false);
    }
  }, [activeProject?.id, api]);

  // Fetch linked automated tests for a plan
  const fetchLinkedAutomatedTests = useCallback(async (testPlanId) => {
    if (!activeProject?.id) return;
    try {
      const response = await api(`/api/junit-results/by-plan/${testPlanId}`);
      if (!response.ok) {
        console.error('Failed to fetch linked automated tests');
        return;
      }
      const data = await response.json();
      setLinkedAutomatedTests(data.content || []);
    } catch (err) {
      console.error('Error fetching linked automated tests:', err);
      setLinkedAutomatedTests([]);
    }
  }, [activeProject, api]);

  // Fetch automated test counts for all plans
  const fetchAutomatedTestCounts = useCallback(async () => {
    if (!activeProject?.id || sortedTestPlans.length === 0) return;
    const isDebug = localStorage.getItem('debug') === 'true';
    if (isDebug) console.log('Fetching automated test counts for', sortedTestPlans.length, 'plans');
    try {
      const counts = {};
      for (const plan of sortedTestPlans) {
        try {
          const response = await api(`/api/junit-results/by-plan/${plan.id}`);
          if (response.ok) {
            const data = await response.json();
            const count = data.count || data.content?.length || 0;
            if (isDebug) console.log(`Plan ${plan.id} (${plan.name}): ${count} automated tests`, data);
            counts[plan.id] = count;
          } else {
            console.warn(`Failed to fetch for plan ${plan.id}:`, response.status);
            counts[plan.id] = 0;
          }
        } catch (err) {
          console.error(`Error fetching for plan ${plan.id}:`, err);
          counts[plan.id] = 0;
        }
      }
      if (isDebug) console.log('Final counts:', counts);
      setAutomatedTestCounts(counts);
    } catch (err) {
      console.error('Error fetching automated test counts:', err);
    }
  }, [activeProject, sortedTestPlans, api]);

  // Fetch counts when plans change
  useEffect(() => {
    fetchAutomatedTestCounts();
  }, [fetchAutomatedTestCounts]);

  // Handle execution button click
  const handleExecutionClick = useCallback(async (testPlan) => {
    setSelectedTestPlan(testPlan);
    setExecutionDialogOpen(true);
    setExecutionsLoading(true);
    await Promise.all([
      fetchTestExecutionsForPlan(testPlan.id),
      fetchLinkedAutomatedTests(testPlan.id)
    ]);
    setExecutionsLoading(false);
  }, [fetchTestExecutionsForPlan, fetchLinkedAutomatedTests]);

  const handleLinkClick = (testPlan) => {
    setSelectedPlanForLink(testPlan);
    setLinkDialogOpen(true);
  };

  // Calculate progress for test execution
  const calculateProgress = useCallback((execution) => {
    if (!selectedTestPlan?.testCaseIds?.length || !Array.isArray(testCases)) return 0;
    const caseIds = selectedTestPlan.testCaseIds.filter(id => {
      const tc = testCases.find(tc => tc.id === id);
      return tc && tc.type === 'testcase';
    });
    if (caseIds.length === 0) return 0;
    const completedTests = caseIds.filter(id => {
      const resultObj = execution.results?.find(r => r.testCaseId === id);
      return resultObj && resultObj.result && resultObj.result !== 'NOTRUN';
    }).length;
    return Math.round((completedTests / caseIds.length) * 100);
  }, [selectedTestPlan, testCases]);

  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case ExecutionStatus.NOTSTARTED:
        return <Chip size="small" icon={<Schedule />} label={t('testPlan.status.notStarted', 'Not Started')} color="default" />;
      case ExecutionStatus.INPROGRESS:
        return <Chip size="small" icon={<PlayArrow />} label={t('testPlan.status.inProgress', 'In Progress')} color="primary" />;
      case ExecutionStatus.COMPLETED:
        return <Chip size="small" icon={<CheckCircle />} label={t('testPlan.status.completed', 'Completed')} color="success" />;
      default:
        return null;
    }
  };

  // Delete confirmation handler
  const handleConfirmDelete = useCallback(async () => {
    if (!planToDelete) return;
    try {
      setLocalLoading(true);
      await deleteTestPlan(planToDelete);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
      setDeleteDialogOpen(false);
    }
  }, [planToDelete, deleteTestPlan]);

  // Project selection check
  if (!projectId) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
            {t('testPlan.form.projectSelectFirst', '프로젝트를 먼저 선택하세요.')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" component="h2">
          {activeProject?.name}
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => onNewTestPlan(projectId)}
            disabled={globalLoading}
          >
            {t('testPlan.list.add', '테스트 플랜 추가')}
          </Button>
        )}
      </Box>
      <Accordion expanded={expanded} onChange={handleAccordionChange} sx={{ width: '100%' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            {t('testPlan.list.title', '테스트 플랜 목록')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {globalLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : sortedTestPlans.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 3 }}>
              {t('testPlan.list.empty.message', '등록된 테스트 플랜이 없습니다.')}
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="testplan table">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('testPlan.list.table.id', 'ID')}</TableCell>
                      <TableCell>{t('testPlan.list.table.name', '이름')}</TableCell>
                      <TableCell>{t('testPlan.list.table.description', '설명')}</TableCell>
                      <TableCell align="center">{t('testPlan.list.table.testcaseCount', '테스트케이스 수')}</TableCell>
                      <TableCell align="center">{t('testPlan.list.table.automationCount', '자동화 테스트')}</TableCell>
                      <TableCell align="center">{t('testPlan.list.table.createdAt', '생성일')}</TableCell>
                      <TableCell align="center">{t('testPlan.list.table.execute', '실행')}</TableCell>
                      <TableCell align="center">{t('testPlan.list.table.edit', '수정')}</TableCell>
                      <TableCell align="center">{t('testPlan.list.table.delete', '삭제')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell
                          onClick={() => handleExecutionClick(plan)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          {plan.id}
                        </TableCell>
                        <TableCell
                          onClick={() => handleExecutionClick(plan)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          {plan.name}
                        </TableCell>
                        <TableCell
                          onClick={() => handleExecutionClick(plan)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <span style={{ color: '#aaa' }}>{plan.description}</span>
                        </TableCell>
                        <TableCell
                          align="center"
                          onClick={() => handleExecutionClick(plan)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          {plan.testCaseIds?.length ?? 0}
                        </TableCell>
                        <TableCell
                          align="center"
                          onClick={() => canManage && handleLinkClick(plan)}
                          sx={{ cursor: canManage ? 'pointer' : 'default', '&:hover': canManage ? { backgroundColor: 'action.hover' } : {} }}
                        >
                          <Chip
                            label={automatedTestCounts[plan.id] || 0}
                            size="small"
                            color={(automatedTestCounts[plan.id] || 0) > 0 ? "success" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {formatDateSafe(plan.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            edge="end"
                            onClick={() => handleExecutionClick(plan)}
                            disabled={localLoading}
                            title={t('testPlan.list.table.execute', '실행 및 결과')}
                          >
                            <PlayArrow />
                          </IconButton>
                          {canManage && (
                            <IconButton
                              edge="end"
                              onClick={() => handleLinkClick(plan)}
                              disabled={localLoading}
                              title={t('testPlan.list.table.linkAutomated', '자동화 테스트 연결')}
                              sx={{
                                ml: 1,
                                color: (automatedTestCounts[plan.id] || 0) > 0 ? 'success.main' : 'text.disabled'
                              }}
                            >
                              <LinkIcon />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {canManage && (
                            <IconButton
                              edge="end"
                              onClick={() => onEditTestPlan(plan.id)}
                              disabled={localLoading}
                              title={t('testPlan.list.table.edit', '수정')}
                            >
                              <Edit />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {canManage && (
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setPlanToDelete(plan.id);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={localLoading}
                              title={t('testPlan.list.table.delete', '삭제')}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>
      {/* 테스트 실행 다이얼로그 */}
      <Dialog
        open={executionDialogOpen}
        onClose={() => setExecutionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>
          {t('testPlan.execution.dialog.title', '테스트 실행 - {planName}', { planName: selectedTestPlan?.name })}
        </DialogTitle>
        <DialogContent>
          {executionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => {
                    setExecutionDialogOpen(false);
                    onStartExecution(selectedTestPlan?.id);
                  }}
                  sx={{ mb: 2 }}
                >
                  {t('testPlan.execution.button.newExecution', '새 실행 생성')}
                </Button>
              </Box>
              {testExecutions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  {t('testPlan.execution.empty.message', '이 테스트 플랜의 실행 이력이 없습니다.')}
                </Typography>
              ) : (
                <List>
                  {testExecutions.map((execution, index) => {
                    const progress = calculateProgress(execution);
                    return (
                      <React.Fragment key={execution.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" component="span">
                                  {execution.name}
                                </Typography>
                                {renderStatusChip(execution.status)}
                              </Box>
                            }
                            secondary={
                              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" component="span">
                                  {t('testPlan.execution.list.createdAt', '생성일: {date}', { date: formatDateSafe(execution.createdAt) })}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress variant="determinate" value={progress} />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
                                  </Box>
                                </Box>
                              </Box>
                            }
                            slotProps={{
                              primary: { component: "div" },
                              secondary: { component: "div" }
                            }} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => {
                                setExecutionDialogOpen(false);
                                onEditExecution(execution.id);
                              }}
                              sx={{ color: '#1976d2', mr: 1 }}
                              title={t('testPlan.execution.action.edit', '편집')}
                            >
                              <PlayArrow />
                            </IconButton>

                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </>
          )}

          {/* Automated Tests Section */}
          {!executionsLoading && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('testPlan.execution.automated.title', '연결된 자동화 테스트')}
              </Typography>
              {linkedAutomatedTests.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  {t('testPlan.execution.automated.empty', '연결된 자동화 테스트가 없습니다.')}
                </Typography>
              ) : (
                <List>
                  {linkedAutomatedTests.map((result) => (
                    <React.Fragment key={result.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" component="span">
                                {result.testExecutionName || result.fileName}
                              </Typography>
                              <Chip
                                label={result.status}
                                size="small"
                                color={result.status === 'COMPLETED' ? 'success' : 'default'}
                              />
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'block', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {t('testPlan.execution.list.createdAt', '업로드: {date}', { date: formatDateSafe(result.uploadedAt) })}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  Total: {result.totalTests} | Pass: {result.totalTests - result.failures - result.errors - result.skipped} | Fail: {result.failures + result.errors}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={result.successRate || 0}
                                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                  color={result.successRate >= 90 ? "success" : result.successRate >= 70 ? "warning" : "error"}
                                />
                              </Box>
                            </Box>
                          }
                          slotProps={{
                            primary: { component: "div" },
                            secondary: { component: "div" }
                          }} />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionDialogOpen(false)}>
            {t('testPlan.execution.dialog.close', '닫기')}
          </Button>
        </DialogActions>
      </Dialog >
      <TestPlanAutomatedLinkDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        testPlanId={selectedPlanForLink?.id}
        onLinkComplete={() => {
          // Refresh automation counts for all plans
          fetchAutomatedTestCounts();
          // If execution dialog is open, refresh linked tests
          if (executionDialogOpen && selectedTestPlan) {
            fetchLinkedAutomatedTests(selectedTestPlan.id);
          }
        }}
      />
      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} disableRestoreFocus>
        <DialogTitle>{t('testPlan.delete.dialog.title', '테스트 플랜 삭제')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('testPlan.delete.dialog.message', '정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={localLoading}>
            {t('testPlan.delete.button.cancel', '취소')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={localLoading}
            startIcon={localLoading ? <CircularProgress size={16} /> : null}
            variant="contained"
          >
            {t('testPlan.delete.button.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

TestPlanList.propTypes = {
  onNewTestPlan: PropTypes.func.isRequired,
  onEditTestPlan: PropTypes.func.isRequired,
  onStartExecution: PropTypes.func.isRequired,
  onEditExecution: PropTypes.func.isRequired,
  onViewExecution: PropTypes.func.isRequired,
};

export default TestPlanList;
