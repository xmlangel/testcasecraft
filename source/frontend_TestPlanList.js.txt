// src/components/TestPlanList.js
// TestPlanList.js 상단에 추가
import React, { useState, useCallback } from 'react';
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
  // 수정된 부분: state 객체를 거치지 않고 바로 구조 분해
  const { activeProject, testPlans = [], projectsLoading, testPlansLoading, deleteTestPlan } = useAppContext();

  // Local state management
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Derived state
  const projectId = activeProject?.id;
  const globalLoading = projectsLoading || testPlansLoading;

  // Delete confirmation handler
  const handleConfirmDelete = useCallback(async () => {
    if (!planToDelete) return;
    
    try {
      setLocalLoading(true);
      await deleteTestPlan(planToDelete);
    } catch (err) {
      setError(err.message || '삭제 처리 중 오류 발생');
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
            프로젝트를 먼저 선택해주세요
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Data presentation helpers
  const getTestCaseCount = (testPlan) => testPlan.testCaseIds?.length || 0;
  const getPlanDescription = (plan) => 
    plan.description || <span style={{ color: '#aaa' }}>설명이 없습니다</span>;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          gap: 2
        }}>
          <Typography variant="h6" component="h2">
            {activeProject?.name} 테스트 플랜
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => onNewTestPlan(projectId)}
            disabled={globalLoading}
          >
            새 플랜 추가
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {globalLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : testPlans.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 3 }}>
            등록된 테스트 플랜이 없습니다
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {testPlans.map((plan, index) => (
              <React.Fragment key={plan.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={plan.name}
                    secondary={
                      <>
                        <Typography 
                          component="span" 
                          variant="body2" 
                          color="text.primary"
                          display="block"
                        >
                          테스트케이스: {getTestCaseCount(plan)}개
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {getPlanDescription(plan)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => onStartExecution(plan.id)}
                      disabled={localLoading}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => onEditTestPlan(plan.id)}
                      disabled={localLoading}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setPlanToDelete(plan.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={localLoading}
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>플랜 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            해당 플랜과 연관된 모든 실행 기록이 영구적으로 삭제됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={localLoading}
          >
            취소
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            disabled={localLoading}
            startIcon={localLoading && <CircularProgress size={16} />}
          >
            삭제 진행
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