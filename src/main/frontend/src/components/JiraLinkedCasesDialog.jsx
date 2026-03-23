// src/components/JiraLinkedCasesDialog.jsx
// JIRA 연동률 클릭 시 연결된 JIRA 이슈 목록 (중복 제거) 다이얼로그

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
  Link,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import testResultService from '../services/testResultService';
import jiraService from '../services/jiraService';
import { useI18n } from '../context/I18nContext';

/**
 * JiraLinkedCasesDialog
 *
 * JIRA 연동률 클릭 시 연결된 JIRA 이슈 목록을 보여주는 다이얼로그
 * - jiraIssueKey 기준 중복 제거 (Set)
 * - 각 이슈 키와 연결된 테스트 케이스 목록 함께 표시
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - projectId: string | number
 *  - testPlanIds: string[]
 *  - testExecutionId: string | null
 */
function JiraLinkedCasesDialog({
  open,
  onClose,
  projectId,
  testPlanIds = [],
  testExecutionId = null
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const navigate = useNavigate();

  const [jiraItems, setJiraItems] = useState([]); // [{ jiraKey, testCases: [...] }]
  const [activeConfig, setActiveConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // JIRA 연동 케이스 조회 및 jiraKey 기준 중복 제거 그룹핑
  const loadJiraLinkedCases = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const reportParams = {
        projectId,
        testPlanIds: testPlanIds && testPlanIds.length > 0
          ? (Array.isArray(testPlanIds) ? testPlanIds : [testPlanIds])
          : undefined,
        testExecutionIds: testExecutionId ? [testExecutionId] : undefined,
        includeNotExecuted: false,
        size: 2000
      };

      const response = await testResultService.getDetailedTestResultReport(reportParams);
      const allData = response?.content || (Array.isArray(response) ? response : []);

      // jiraIssueKey가 있는 케이스만 필터링
      const linkedCases = allData.filter(item => item.jiraIssueKey && item.jiraIssueKey.trim() !== '');

      // jiraIssueKey 기준으로 그룹핑 (중복 제거)
      const jiraMap = new Map();
      linkedCases.forEach(item => {
        const key = item.jiraIssueKey.trim();
        if (!jiraMap.has(key)) {
          jiraMap.set(key, {
            jiraKey: key,
            testCases: []
          });
        }
        jiraMap.get(key).testCases.push({
          testCaseId: item.testCaseId,
          testCaseName: item.testCaseName,
          testExecutionId: item.testExecutionId,
          folderPath: item.folderPath,
          result: item.result || 'NOT_RUN'
        });
      });

      // 알파벳 순 정렬
      const sorted = Array.from(jiraMap.values()).sort((a, b) =>
        a.jiraKey.localeCompare(b.jiraKey)
      );

      setJiraItems(sorted);
    } catch (err) {
      console.error('JiraLinkedCasesDialog: JIRA 목록 조회 실패', err);
      setError(t('testResult.jiraDialog.loadError', 'JIRA 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [projectId, testPlanIds, testExecutionId, t]);

  // 활성화된 JIRA 설정 로드
  const loadJiraConfig = useCallback(async () => {
    try {
      const config = await jiraService.getActiveConfig();
      setActiveConfig(config);
    } catch (err) {
      console.error('JiraLinkedCasesDialog: JIRA 설정 로드 실패', err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadJiraLinkedCases();
      loadJiraConfig();
    } else {
      setJiraItems([]);
      setActiveConfig(null);
      setError(null);
    }
  }, [open, loadJiraLinkedCases, loadJiraConfig]);

  // result 값 정규화
  const normalizeResult = (result) => {
    if (!result) return 'NOT_RUN';
    const r = String(result).toUpperCase().replace(/[^A-Z]/g, '_');
    if (r === 'NOTRUN' || r === 'NOT_RUN') return 'NOT_RUN';
    return r;
  };

  // 테스트 실행 또는 결과로 이동
  const handleGoToExecution = useCallback((item) => {
    const targetExecutionId = item.testExecutionId || testExecutionId;
    const normalizedResult = normalizeResult(item.result);

    if (projectId && targetExecutionId) {
      if (normalizedResult === 'FAIL') {
        navigate(`/projects/${projectId}/executions/${targetExecutionId}/testcases/${item.testCaseId}/result`);
      } else {
        navigate(`/projects/${projectId}/executions/${targetExecutionId}?scrollTo=${item.testCaseId}`);
      }
    } else if (projectId) {
      navigate(`/projects/${projectId}/executions`);
    }
    onClose();
  }, [projectId, testExecutionId, navigate, onClose]);

  // 결과 유형별 Chip 색상
  const getResultChip = (result) => {
    const colorMap = {
      PASS: 'success',
      FAIL: 'error',
      BLOCKED: 'warning',
      NOT_RUN: 'default'
    };
    const labelMap = {
      PASS: t('testResult.status.pass', 'Pass'),
      FAIL: t('testResult.status.fail', 'Fail'),
      BLOCKED: t('testResult.status.blocked', 'Blocked'),
      NOT_RUN: t('testResult.status.notRun', '미실행')
    };
    return (
      <Chip
        size="small"
        label={labelMap[result] || result}
        color={colorMap[result] || 'default'}
        sx={{ height: 18, fontSize: '0.65rem' }}
      />
    );
  };

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
      {/* 제목 */}
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pr: 6,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <BugReportIcon sx={{ color: theme.palette.info.main }} />
        <Typography variant="h6" component="span">
          {t('testResult.jiraDialog.title', 'JIRA 연동 이슈 목록')}
        </Typography>
        {!loading && (
          <Chip
            label={t('testResult.jiraDialog.count', '{count}건').replace('{count}', jiraItems.length)}
            size="small"
            sx={{
              ml: 1,
              bgcolor: alpha(theme.palette.info.main, 0.12),
              color: theme.palette.info.main,
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

      {/* 내용 */}
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : jiraItems.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <Typography color="text.secondary">
              {t('testResult.jiraDialog.empty', '연동된 JIRA 이슈가 없습니다.')}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: '55vh' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '18%' }}>
                    {t('testResult.jiraDialog.col.jiraKey', 'JIRA 이슈')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>
                    {t('testResult.jiraDialog.col.testCase', '테스트 케이스')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                    {t('testResult.jiraDialog.col.folder', '폴더 경로')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>
                    {t('testResult.jiraDialog.col.result', '결과')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {jiraItems.map((jiraItem) =>
                  jiraItem.testCases.map((tc, tcIndex) => (
                    <TableRow
                      key={`${jiraItem.jiraKey}-${tc.testCaseId}-${tcIndex}`}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.info.main, 0.04)
                        }
                      }}
                    >
                      {/* JIRA Key - 같은 키의 첫 번째 행에만 표시 (rowSpan) */}
                      {tcIndex === 0 && (
                        <TableCell
                          rowSpan={jiraItem.testCases.length}
                          sx={{
                            verticalAlign: 'top',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.info.main, 0.04)
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="info.main"
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {jiraItem.jiraKey}
                            </Typography>
                            <Tooltip title={t('testResult.jiraDialog.openJira', 'JIRA에서 열기')}>
                              <IconButton
                                size="small"
                                component={Link}
                                href={activeConfig?.serverUrl 
                                  ? `${activeConfig.serverUrl}/browse/${jiraItem.jiraKey}`
                                  : `#`}
                                target={activeConfig?.serverUrl ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                disabled={!activeConfig?.serverUrl}
                                sx={{
                                  p: 0.3,
                                  color: 'info.main',
                                  '&:hover': { color: 'info.dark' }
                                }}
                              >
                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('testResult.jiraDialog.caseCount', '{count}개 케이스').replace('{count}', jiraItem.testCases.length)}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell 
                        onClick={() => handleGoToExecution(tc)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        <Typography variant="body2" noWrap title={tc.testCaseName} color="primary">
                          {tc.testCaseName || t('testResult.filteredCases.unnamed', '(이름 없음)')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" noWrap title={tc.folderPath || ''}>
                          {tc.folderPath || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getResultChip(tc.result)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={
                            normalizeResult(tc.result) === 'FAIL'
                              ? t('testResult.filteredCases.goToResult', '결과 상세 보기')
                              : (tc.testExecutionId || testExecutionId)
                                ? t('testResult.filteredCases.goToExecution', '실행으로 이동')
                                : t('testResult.filteredCases.goToExecutionList', '실행 목록으로 이동')
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleGoToExecution(tc)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      {/* 하단 버튼 */}
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {!loading && !error && jiraItems.length > 0 &&
            t('testResult.jiraDialog.deduplicatedNote', '* JIRA 이슈 키 기준 중복 제거된 목록')
          }
        </Typography>
        <Button onClick={onClose} size="small">
          {t('common.close', '닫기')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default JiraLinkedCasesDialog;
