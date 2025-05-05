// src/components/TestExecutionList.js
import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { ExecutionStatus } from '../models/testExecution';

const TestExecutionList = ({ onNewExecution, onEditExecution, onViewExecution }) => {
  // context에서 state를 거치지 않고 직접 testExecutions를 구조분해 (기본값 []로 안전하게)
  const { testExecutions = [], deleteTestExecution, getTestPlan } = useAppContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);

  // 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = (executionId) => {
    setExecutionToDelete(executionId);
    setDeleteDialogOpen(true);
  };

  // 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setExecutionToDelete(null);
  };

  // 테스트 실행 삭제 확인
  const handleConfirmDelete = () => {
    if (executionToDelete) {
      deleteTestExecution(executionToDelete);
    }
    handleCloseDeleteDialog();
  };

  // 테스트 진행률 계산 (NOTRUN 제외)
  const calculateProgress = (execution) => {
    const testPlan = getTestPlan(execution.testPlanId);
    if (!testPlan?.testCaseIds?.length) return 0;
    const totalTests = testPlan.testCaseIds.length;
    const results = execution.results || {};
    const completedTests = testPlan.testCaseIds.filter(
      id => results[id] && results[id].result && results[id].result !== 'NOTRUN'
    ).length;
    return Math.round((completedTests / totalTests) * 100);
  };

  // 상태에 따른 칩 렌더링
  const renderStatusChip = (status) => {
    switch (status) {
      case ExecutionStatus.NOT_STARTED:
        return <Chip size="small" icon={<ScheduleIcon />} label="대기중" color="default" />;
      case ExecutionStatus.IN_PROGRESS:
        return <Chip size="small" icon={<PlayArrowIcon />} label="진행중" color="primary" />;
      case ExecutionStatus.COMPLETED:
        return <Chip size="small" icon={<CheckCircleIcon />} label="완료" color="success" />;
      default:
        return null;
    }
  };

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
                        aria-label="수정"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditExecution(execution.id);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="삭제"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(execution.id);
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
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>테스트 실행 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 테스트 실행을 삭제하면 모든 테스트 결과 데이터가 함께 삭제됩니다.
            삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>취소</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TestExecutionList;
