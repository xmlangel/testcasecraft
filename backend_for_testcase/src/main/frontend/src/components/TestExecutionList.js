// src/components/TestExecutionList.js

import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, LinearProgress, Chip, CircularProgress, Alert, Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { ExecutionStatus } from '../models/testExecution';

const EXECUTIONS_PER_PAGE = 5;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const TestExecutionList = ({ onNewExecution, onEditExecution, onViewExecution }) => {
  const { getTestPlan, activeProject, user, testCases } = useAppContext();
  const [testExecutions, setTestExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);
  const [page, setPage] = useState(1);

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isUser = user?.role === 'USER';
  const isViewer = user?.role === 'VIEWER';

  const fetchTestExecutions = async () => {
    if (!activeProject?.id) {
      setTestExecutions([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(
        `${API_BASE_URL}/api/test-executions/by-project/${activeProject.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch executions');
      const data = await response.json();
      setTestExecutions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!executionToDelete) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(
        `${API_BASE_URL}/api/test-executions/${executionToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      if (!response.ok) throw new Error('Delete failed');
      setTestExecutions((prev) => prev.filter((e) => e.id !== executionToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchTestExecutions();
    // eslint-disable-next-line
  }, [activeProject?.id]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // 폴더를 제외한 테스트케이스만 대상으로 진행률 계산
  const calculateProgress = (execution) => {
    const testPlan = getTestPlan(execution.testPlanId);
    if (!testPlan?.testCaseIds?.length || !Array.isArray(testCases)) return 0;

    // 폴더가 아닌 테스트케이스만 필터링
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
        return <Chip size="small" icon={<ScheduleIcon />} label="Not Started" color="default" />;
      case ExecutionStatus.INPROGRESS:
        return <Chip size="small" icon={<PlayArrowIcon />} label="In Progress" color="primary" />;
      case ExecutionStatus.COMPLETED:
        return <Chip size="small" icon={<CheckCircleIcon />} label="Completed" color="success" />;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(testExecutions.length / EXECUTIONS_PER_PAGE);
  const paginatedExecutions = testExecutions.slice(
    (page - 1) * EXECUTIONS_PER_PAGE,
    page * EXECUTIONS_PER_PAGE
  );

  if (isLoading)
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
            실행 이력
          </Typography>
          {(isAdminOrManager) && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onNewExecution}
            >
              새 실행
            </Button>
          )}
        </Box>
        {testExecutions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            실행 이력이 없습니다.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {paginatedExecutions.map((execution, index) => {
              const testPlan = getTestPlan(execution.testPlanId);
              const progress = calculateProgress(execution);
              return (
                <React.Fragment key={execution.id}>
                  {index !== 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start" button onClick={() => onViewExecution(execution.id)}>
                    <ListItemText
                      primary={
                        // primaryTypographyProps로 component="span" 지정
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                            {execution.name}
                          </Typography>
                          {renderStatusChip(execution.status)}
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
                      primaryTypographyProps={{ component: "span" }}
                      secondaryTypographyProps={{ component: "span" }}
                    />
                    <ListItemSecondaryAction>
                      {(isAdminOrManager || isUser) && (
                        <IconButton
                          edge="end"
                          aria-label="execute"
                          onClick={e => {
                            e.stopPropagation();
                            onEditExecution(execution.id);
                          }}
                          sx={{ color: '#1976d2' }}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      )}
                      {isAdminOrManager && (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={e => {
                            e.stopPropagation();
                            setExecutionToDelete(execution.id);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="view"
                        onClick={e => {
                          e.stopPropagation();
                          onViewExecution(execution.id);
                        }}
                        sx={{ color: '#1976d2' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>실행 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>정말로 이 실행을 삭제하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TestExecutionList;
