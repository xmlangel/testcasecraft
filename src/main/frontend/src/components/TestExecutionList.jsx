// src/components/TestExecutionList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction,
  IconButton, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, LinearProgress, Chip, CircularProgress, Alert, Pagination,
  TextField, InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { useTranslation } from '../context/I18nContext.jsx';
import { ExecutionStatus } from '../models/testExecution.jsx';

const EXECUTIONS_PER_PAGE = 5;
// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

const TestExecutionList = ({ onNewExecution, onEditExecution }) => {
  const { getTestPlan, activeProject, user, testCases, fetchProjectTestCases, api } = useAppContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const [testExecutions, setTestExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isUser = user?.role === 'USER';

  // 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); // 검색 실행 트리거

  const fetchTestExecutions = useCallback(async (projectId, name) => {
    if (!projectId) {
      setTestExecutions([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      let url = `/api/test-executions/by-project/${projectId}`;
      if (name) {
        url += `?name=${encodeURIComponent(name)}`;
      }
      const response = await api(url);
      if (!response.ok) throw new Error('Failed to fetch executions');
      const data = await response.json();
      setTestExecutions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (activeProject?.id) {
      fetchProjectTestCases(activeProject.id);
      fetchTestExecutions(activeProject.id, searchQuery);
    } else {
      setTestExecutions([]);
    }
  }, [activeProject?.id, fetchProjectTestCases, fetchTestExecutions, triggerSearch]); // triggerSearch가 변경될 때 재검색

  const handleSearch = () => {
    setTriggerSearch(prev => prev + 1);
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleConfirmDelete = async () => {
    if (!executionToDelete) return;
    setIsLoading(true);
    try {
      const response = await api(`/api/test-executions/${executionToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      setTestExecutions((prev) => prev.filter((e) => e.id !== executionToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const calculateProgress = (execution) => {
    const testPlan = getTestPlan(execution.testPlanId);
    if (!testPlan?.testCaseIds?.length || !Array.isArray(testCases)) return 0;
    const caseIds = testPlan.testCaseIds.filter(id => {
      const tc = testCases.find(tc => tc.id === id);
      return tc && tc.type === 'testcase';
    });
    if (caseIds.length === 0) return 0;
    const completedTests = caseIds.filter(id => {
      const resultObj = execution.results?.find(r => r.testCaseId === id);
      return resultObj && resultObj.result && resultObj.result !== 'NOTRUN';
    }).length;
    return Math.round((completedTests / caseIds.length) * 100);
  };

  const renderStatusChip = (status) => {
    switch (status) {
      case ExecutionStatus.NOTSTARTED:
        return <Chip size="small" icon={<ScheduleIcon />} label={t('testExecution.status.notStarted')} color="default" />;
      case ExecutionStatus.INPROGRESS:
        return <Chip size="small" icon={<PlayArrowIcon />} label={t('testExecution.status.inProgress')} color="primary" />;
      case ExecutionStatus.COMPLETED:
        return <Chip size="small" icon={<CheckCircleIcon />} label={t('testExecution.status.completed')} color="success" />;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(testExecutions.length / EXECUTIONS_PER_PAGE);
  const paginatedExecutions = testExecutions.slice(
    (page - 1) * EXECUTIONS_PER_PAGE,
    page * EXECUTIONS_PER_PAGE
  );

  if (isLoading && !testExecutions.length) // 초기 로딩만 표시, 재검색 시에는 리스트 유지하면서 로딩 처리하려면 조건 변경 필요. 여기서는 간단히.
    return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  if (error)
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            {t('testExecution.list.title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder={t('testExecution.list.searchPlaceholder', 'Title Search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            {(isAdminOrManager) && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={onNewExecution}
              >
                {t('testExecution.list.newExecution')}
              </Button>
            )}
          </Box>
        </Box>
        {testExecutions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            {t('testExecution.list.noExecutions')}
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {paginatedExecutions.map((execution, index) => {
              const testPlan = getTestPlan(execution.testPlanId);
              const progress = calculateProgress(execution);
              return (
                <React.Fragment key={execution.id}>
                  {index !== 0 && <Divider component="li" />}
                  <ListItem
                    alignItems="flex-start"
                    disablePadding
                    secondaryAction={
                      isAdminOrManager && (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={e => {
                            e.stopPropagation();
                            setExecutionToDelete(execution.id);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemButton onClick={() => onEditExecution(execution.id)} alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                            {execution.displayId && (
                              <Chip
                                label={execution.displayId}
                                variant="outlined"
                                size="small"
                                sx={{ fontSize: '0.75rem', height: '20px', mr: 0.5 }}
                              />
                            )}
                            <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                              {execution.name}
                            </Typography>
                            {renderStatusChip(execution.status)}
                            {execution.tags && execution.tags.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                {execution.tags.map((tag, tagIndex) => (
                                  <Chip
                                    key={tagIndex}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem', height: '20px' }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body2" component="span" color="text.primary" sx={{ mr: 2 }}>
                              {testPlan ? testPlan.name : ''}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" component="span">
                              {progress}%
                            </Typography>
                          </Box>
                        }
                        slotProps={{
                          primary: { component: "span" },
                          secondary: { component: "span" }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </CardContent>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} disableRestoreFocus>
        <DialogTitle>{t('testExecution.list.delete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('testExecution.list.delete.confirm')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('testExecution.list.delete.cancel')}</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {t('testExecution.list.delete.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TestExecutionList;
