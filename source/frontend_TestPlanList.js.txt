// /src/components/TestPlanList.js
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
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const TestPlanList = ({ onNewTestPlan, onEditTestPlan, onStartExecution }) => {
  const { state, deleteTestPlan } = useAppContext();
  const { testPlans } = state;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = useCallback((testPlanId) => {
    setPlanToDelete(testPlanId);
    setDeleteDialogOpen(true);
  }, []);

  // 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  }, []);

  // 테스트 플랜 삭제 확인
  const handleConfirmDelete = useCallback(() => {
    if (planToDelete) {
      deleteTestPlan(planToDelete);
    }
    handleCloseDeleteDialog();
  }, [planToDelete, deleteTestPlan, handleCloseDeleteDialog]);

  // 테스트케이스 수 계산
  const getTestCaseCount = (testPlan) => Array.isArray(testPlan.testCaseIds) ? testPlan.testCaseIds.length : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">테스트 플랜</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onNewTestPlan}
            aria-label="새 테스트 플랜 추가"
          >
            새 테스트 플랜
          </Button>
        </Box>

        {testPlans.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            테스트 플랜이 없습니다. 새 테스트 플랜을 생성하세요.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {testPlans.map((plan, index) => (
              <React.Fragment key={plan.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start" key={plan.id} data-testid={`testplan-${plan.id}`}>
                  <ListItemText
                    primary={plan.name}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" component="span">
                          테스트케이스: {getTestCaseCount(plan)}개
                        </Typography>
                        <br />
                        {plan.description
                          ? (plan.description.length > 60
                            ? `${plan.description.substring(0, 60)}...`
                            : plan.description)
                          : <span style={{ color: '#aaa' }}>설명이 없습니다.</span>
                        }
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label={`${plan.name} 실행`}
                      onClick={() => onStartExecution(plan.id)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label={`${plan.name} 수정`}
                      onClick={() => onEditTestPlan(plan.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label={`${plan.name} 삭제`}
                      onClick={() => handleOpenDeleteDialog(plan.id)}
                    >
                      <DeleteIcon />
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
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>테스트 플랜 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 테스트 플랜을 삭제하면 관련된 모든 테스트 실행 데이터도 함께 삭제됩니다.
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

TestPlanList.propTypes = {
  onNewTestPlan: PropTypes.func.isRequired,
  onEditTestPlan: PropTypes.func.isRequired,
  onStartExecution: PropTypes.func.isRequired,
};

export default TestPlanList;
