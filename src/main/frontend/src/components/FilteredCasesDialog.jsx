// src/components/FilteredCasesDialog.jsx
// 미실행(NOT_RUN) / 실패(FAIL) 케이스 목록 다이얼로그 - 해당 테스트 실행으로 이동 가능

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  PauseCircle as PauseCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import testResultService from '../services/testResultService';
import { useI18n } from '../context/I18nContext';

/**
 * FilteredCasesDialog
 *
 * 미실행(NOT_RUN) 또는 실패(FAIL) 케이스 목록을 보여주고,
 * 해당 테스트 실행 화면으로 이동할 수 있는 공용 다이얼로그
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - resultType: 'NOT_RUN' | 'FAIL'
 *  - projectId: string | number
 *  - testPlanIds: string[] (선택된 플랜 ID 배열)
 *  - testExecutionId: string (선택된 실행 ID, 없으면 null)
 */
function FilteredCasesDialog({
  open,
  onClose,
  resultType = 'NOT_RUN',
  projectId,
  testPlanIds = [],
  testExecutionId = null
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isNotRun = resultType === 'NOT_RUN';

  // 다이얼로그 제목
  const dialogTitle = isNotRun
    ? t('testResult.filteredCases.notRunTitle', '미실행 케이스 목록')
    : t('testResult.filteredCases.failTitle', '실패 케이스 목록');

  // 결과 유형 색상
  const resultColor = isNotRun ? theme.palette.grey[500] : theme.palette.error.main;
  const ResultIcon = isNotRun ? PauseCircleIcon : CancelIcon;

  // result 값 정규화 (NOTRUN → NOT_RUN 등 혼재 대응)
  const normalizeResult = (result) => {
    if (!result) return 'NOT_RUN';
    const r = String(result).toUpperCase().replace(/[^A-Z]/g, '_');
    if (r === 'NOTRUN' || r === 'NOT_RUN') return 'NOT_RUN';
    return r;
  };

  // 케이스 목록 조회 - 페이지네이션 전체 수집
  const loadCases = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // 백엔드 results 필터에 맞게 전달
      // NOTRUN/NOT_RUN 혼재를 위해 양쪽 다 요청하거나 includeNotExecuted 활용
      const backendResults = isNotRun ? null : ['FAIL']; // NOT_RUN은 includeNotExecuted로 처리

      const PAGE_SIZE = 2000; // 한 번에 최대 가져올 수
      let page = 0;
      let allData = [];
      let hasMore = true;

      while (hasMore) {
        const reportParams = {
          projectId,
          testPlanIds: testPlanIds && testPlanIds.length > 0
            ? (Array.isArray(testPlanIds) ? testPlanIds : [testPlanIds])
            : undefined,
          testExecutionIds: testExecutionId ? [testExecutionId] : undefined,
          includeNotExecuted: isNotRun ? true : false,
          results: backendResults,
          page,
          size: PAGE_SIZE,
        };

        const response = await testResultService.getDetailedTestResultReport(reportParams);

        // Page<T> 응답 구조 처리
        let pageData = [];
        let totalElements = 0;
        if (response && response.content) {
          pageData = response.content;
          totalElements = response.totalElements || 0;
        } else if (Array.isArray(response)) {
          pageData = response;
          totalElements = response.length;
        }

        allData = [...allData, ...pageData];

        // 다음 페이지 필요 여부 판단
        const fetched = (page + 1) * PAGE_SIZE;
        hasMore = pageData.length === PAGE_SIZE && fetched < totalElements;
        page++;

        // 안전망: 최대 10페이지 (20,000건) 초과 방지
        if (page >= 10) break;
      }

      // result 값 정규화 후 타입 필터링
      const filtered = allData.filter(item => {
        const normalized = normalizeResult(item.result);
        return normalized === resultType;
      });

      setCases(filtered);
    } catch (err) {
      console.error('FilteredCasesDialog: 케이스 목록 조회 실패', err);
      setError(t('testResult.filteredCases.loadError', '케이스 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [projectId, testPlanIds, testExecutionId, isNotRun, resultType, t]);


  // 다이얼로그 열릴 때 데이터 로드
  useEffect(() => {
    if (open) {
      loadCases();
    } else {
      // 닫힐 때 초기화
      setCases([]);
      setError(null);
    }
  }, [open, loadCases]);

  // 테스트 실행으로 이동
  const handleGoToExecution = useCallback((item) => {
    // 해당 케이스의 실행 ID 결정
    const targetExecutionId = item.testExecutionId || testExecutionId;

    if (projectId && targetExecutionId) {
      // 특정 실행으로 이동
      navigate(`/projects/${projectId}/executions/${targetExecutionId}`);
    } else if (projectId) {
      // 실행 목록으로 이동
      navigate(`/projects/${projectId}/executions`);
    }
    onClose();
  }, [projectId, testExecutionId, navigate, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '80vh' }
      }}
    >
      {/* 다이얼로그 제목 */}
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pr: 6,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <ResultIcon sx={{ color: resultColor }} />
        <Typography variant="h6" component="span">
          {dialogTitle}
        </Typography>
        {!loading && (
          <Chip
            label={t('testResult.filteredCases.count', '{count}건').replace('{count}', cases.length)}
            size="small"
            sx={{
              ml: 1,
              bgcolor: alpha(resultColor, 0.12),
              color: resultColor,
              fontWeight: 'bold'
            }}
          />
        )}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 다이얼로그 내용 */}
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : cases.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <Typography color="text.secondary">
              {isNotRun
                ? t('testResult.filteredCases.noNotRun', '미실행 케이스가 없습니다.')
                : t('testResult.filteredCases.noFail', '실패 케이스가 없습니다.')}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: '55vh' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                    {t('testResult.filteredCases.col.testCase', '테스트 케이스')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>
                    {t('testResult.filteredCases.col.folder', '폴더 경로')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                    {t('testResult.filteredCases.col.testPlan', '테스트 플랜')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center' }}>
                    {t('testResult.filteredCases.col.action', '이동')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((item, index) => (
                  <TableRow
                    key={`${item.testCaseId}-${index}`}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(resultColor, 0.04)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" noWrap title={item.testCaseName}>
                        {item.testCaseName || t('testResult.filteredCases.unnamed', '(이름 없음)')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        title={item.folderPath || ''}
                      >
                        {item.folderPath || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.testPlanName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={
                          (item.testExecutionId || testExecutionId)
                            ? t('testResult.filteredCases.goToExecution', '실행으로 이동')
                            : t('testResult.filteredCases.goToExecutionList', '실행 목록으로 이동')
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleGoToExecution(item)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      {/* 하단 액션 */}
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        {!loading && !error && cases.length > 0 && projectId && testExecutionId && (
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => {
              navigate(`/projects/${projectId}/executions/${testExecutionId}`);
              onClose();
            }}
            size="small"
          >
            {t('testResult.filteredCases.goToExecutionAll', '실행 페이지로 이동')}
          </Button>
        )}
        <Button onClick={onClose} size="small">
          {t('common.close', '닫기')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilteredCasesDialog;
