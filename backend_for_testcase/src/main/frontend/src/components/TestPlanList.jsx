// src/components/TestPlanList.jsx

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from '@mui/material';
import { Add, Edit, Delete, PlayArrow } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext.jsx';

const ADMIN_ROLES = ['ADMIN', 'MANAGER'];
const PLANS_PER_PAGE = 10;

const TestPlanList = ({ onNewTestPlan, onEditTestPlan, onStartExecution }) => {
  const {
    activeProject,
    testPlans,
    projectsLoading,
    testPlansLoading,
    deleteTestPlan,
    testCases,
    user,
  } = useAppContext();

  // Local state
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [page, setPage] = useState(1);

  // Derived state
  const projectId = activeProject?.id;
  const globalLoading = projectsLoading || testPlansLoading;
  const canManage = ADMIN_ROLES.includes(user?.role);

  // 생성일(createdAt) 기준 정렬
  const sortedTestPlans = useMemo(() => {
    return [...testPlans].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [testPlans]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedTestPlans.length / PLANS_PER_PAGE);
  const paginatedPlans = useMemo(() => {
    const start = (page - 1) * PLANS_PER_PAGE;
    return sortedTestPlans.slice(start, start + PLANS_PER_PAGE);
  }, [sortedTestPlans, page]);

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
            프로젝트를 먼저 선택하세요.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
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
              테스트 플랜 추가
            </Button>
          )}
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
        ) : sortedTestPlans.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 3 }}>
            등록된 테스트 플랜이 없습니다.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="testplan table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell>설명</TableCell>
                    <TableCell align="center">테스트케이스 수</TableCell>
                    <TableCell align="center">생성일</TableCell>
                    <TableCell align="center">실행</TableCell>
                    <TableCell align="center">수정</TableCell>
                    <TableCell align="center">삭제</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.id}</TableCell>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>
                        <span style={{ color: '#aaa' }}>{plan.description}</span>
                      </TableCell>
                      <TableCell align="center">{plan.testCaseIds?.length ?? 0}</TableCell>
                      <TableCell align="center">
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          edge="end"
                          onClick={() => onStartExecution(plan.id)}
                          disabled={localLoading}
                          title="실행"
                        >
                          <PlayArrow />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        {canManage && (
                          <IconButton
                            edge="end"
                            onClick={() => onEditTestPlan(plan.id)}
                            disabled={localLoading}
                            title="수정"
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
                            title="삭제"
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
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>테스트 플랜 삭제</DialogTitle>
          <DialogContent>
            <DialogContentText>
              정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={localLoading}>
              취소
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              disabled={localLoading}
              startIcon={localLoading ? <CircularProgress size={16} /> : null}
              variant="contained"
            >
              삭제
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

TestPlanList.propTypes = {
  onNewTestPlan: PropTypes.func.isRequired,
  onEditTestPlan: PropTypes.func.isRequired,
  onStartExecution: PropTypes.func.isRequired,
};

export default TestPlanList;
