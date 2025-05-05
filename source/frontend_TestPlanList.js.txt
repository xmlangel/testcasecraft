// src/components/TestPlanList.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const TestPlanList = ({ onNewTestPlan, onEditTestPlan, onStartExecution }) => {
  const { state = {}, deleteTestPlan, fetchTestPlans } = useAppContext();
  const { activeProject, testPlans = [] } = state;

  // 상태 관리 훅 (최상단 배치)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // 프로젝트 ID 추출 (안전한 구조 분해)
  const projectId = activeProject?.id;

  // 테스트 플랜 조회 로직
  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        await fetchTestPlans(projectId);
      } catch (err) {
        setError(err.message || '테스트 플랜 조회 실패');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId, fetchTestPlans]);

  // 삭제 핸들러 (useCallback 최적화)
  const handleConfirmDelete = useCallback(async () => {
    if (!planToDelete) return;
    
    try {
      setLoading(true);
      await deleteTestPlan(planToDelete);
    } catch (err) {
      setError(err.message || '삭제 실패');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  }, [planToDelete, deleteTestPlan]);

  // 프로젝트 미선택 시 UI 처리
  if (!projectId) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography color="error" sx={{ textAlign: 'center' }}>
            프로젝트를 먼저 선택해주세요
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 테스트 플랜 생성 핸들러 (프로젝트 ID 강제 주입)
  const handleNewTestPlan = () => {
    onNewTestPlan({
      projectId: activeProject.id, // 필수 포함
      name: '새 테스트 플랜',
      description: '',
      testCaseIds: []
    });
  };

  // 테스트케이스 수 계산
  const getTestCaseCount = (testPlan) => 
    testPlan.testCaseIds?.length || 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">테스트 플랜</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleNewTestPlan}
            data-testid="new-testplan-btn"
          >
            새 테스트 플랜
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : testPlans.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            등록된 테스트 플랜이 없습니다
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {testPlans.map((plan, index) => (
              <React.Fragment key={plan.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start" data-testid={`testplan-${plan.id}`}>
                  <ListItemText
                    primary={plan.name}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" component="span">
                          테스트케이스: {getTestCaseCount(plan)}개
                        </Typography>
                        <br />
                        {plan.description || <span style={{ color: '#aaa' }}>설명이 없습니다</span>}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => onStartExecution(plan.id)}
                      aria-label="실행"
                      data-testid={`run-${plan.id}`}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => onEditTestPlan(plan.id)}
                      aria-label="수정"
                      data-testid={`edit-${plan.id}`}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => setPlanToDelete(plan.id)}
                      aria-label="삭제"
                      data-testid={`delete-${plan.id}`}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        data-testid="delete-dialog"
      >
        <DialogTitle>테스트 플랜 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            해당 테스트 플랜과 연결된 모든 실행 기록이 삭제됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            data-testid="cancel-delete-btn"
          >
            취소
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            autoFocus
            data-testid="confirm-delete-btn"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

TestPlanList.propTypes = {
  onNewTestPlan: PropTypes.func.isRequired,
  onEditTestPlan: PropTypes.func.isRequired,
  onStartExecution: PropTypes.func.isRequired,
};

export default TestPlanList;
