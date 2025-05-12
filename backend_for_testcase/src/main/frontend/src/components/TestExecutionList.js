// src/components/TestExecutionList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { ExecutionStatus } from '../models/testExecution';

const TestExecutionList = ({ onNewExecution, onEditExecution, onViewExecution }) => {
  const { getTestPlan } = useAppContext();
  const [testExecutions, setTestExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);

  // 테스트 실행 목록 조회
  const fetchTestExecutions = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('https://qaspecialist.shop/api/test-executions', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!response.ok) throw new Error('Failed to fetch executions');
      const data = await response.json();
      setTestExecutions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 테스트 실행 삭제
  const handleConfirmDelete = async () => {
    if (!executionToDelete) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:8080/api/test-executions/${executionToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!response.ok) throw new Error('Delete failed');
      setTestExecutions(prev => prev.filter(e => e.id !== executionToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchTestExecutions();
  }, []);

  // 진행률 계산 (백엔드 데이터 구조에 맞게 수정)
  const calculateProgress = (execution) => {
    const testPlan = getTestPlan(execution.testPlanId);
    if (!testPlan?.testCaseIds?.length) return 0;
    const totalTests = testPlan.testCaseIds.length;
    const completedTests = execution.results?.filter(r => r.result !== 'NOTRUN').length || 0;
    return Math.round((completedTests / totalTests) * 100);
  };

  // 상태 칩 표시
  const renderStatusChip = (status) => {
    switch (status) {
      case ExecutionStatus.NOTSTARTED:
        return <Chip size="small" icon={<ScheduleIcon />} label="대기중" color="default" />;
      case ExecutionStatus.INPROGRESS:
        return <Chip size="small" icon={<PlayArrowIcon />} label="진행중" color="primary" />;
      case ExecutionStatus.COMPLETED:
        return <Chip size="small" icon={<CheckCircleIcon />} label="완료" color="success" />;
      default:
        return null;
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">테스트 실행</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onNewExecution}
          >
            새 테스트 실행
          </Button>
        </Box>

        {testExecutions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            테스트 실행이 없습니다. 새 테스트 실행을 생성하세요.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {testExecutions.map((execution, index) => {
              const testPlan = getTestPlan(execution.testPlanId);
              const progress = calculateProgress(execution);

              return (
                <React.Fragment key={execution.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem 
                    alignItems="flex-start"
                    button
                    onClick={() => onViewExecution(execution.id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                            {execution.name}
                          </Typography>
                          {renderStatusChip(execution.status)}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary" component="span">
                            테스트 플랜: {testPlan ? testPlan.name : '삭제됨'}
                          </Typography>
                          <br />
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ flexGrow: 1, mr: 1 }} 
                            />
                            <Typography variant="body2">{progress}%</Typography>
                          </Box>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                    <IconButton
                        edge="end"
                        aria-label="실행"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditExecution(execution.id);
                        }}
                        sx={{ color: "#1976d2" }}
                      >
                        <PlayArrowIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="삭제"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExecutionToDelete(execution.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>테스트 실행 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 테스트 실행을 삭제하면 모든 테스트 결과 데이터가 함께 삭제됩니다.
            삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TestExecutionList;
