// src/components/TestCase/HierarchicalTestResultTreeView.jsx
// ICT-283: 계층적 테스트 결과 트리 뷰 컴포넌트

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Button,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  PlayArrow as PlayArrowIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  RadioButtonUnchecked as NotRunIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  VisibilityIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

// 서비스 및 컨텍스트 임포트
import { useAppContext } from '../../context/AppContext.jsx';
import {
  getHierarchicalTestResultReportSimple,
  exportHierarchicalTestResultReport,
  handleTestResultError
} from '../../services/testResultService.js';

/**
 * ICT-283: 계층적 테스트 결과 트리 뷰 컴포넌트
 * 테스트플랜 > 실행 > 케이스 3단계 계층 구조 표시
 * 미실행 케이스도 포함한 완전한 리포트
 */
const HierarchicalTestResultTreeView = ({
  projectId,
  activeProject,
  onError
}) => {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [hierarchicalData, setHierarchicalData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    testPlanId: null,
    testExecutionId: null,
    includeNotExecuted: true
  });

  const { projects } = useAppContext();

  // 결과별 아이콘 매핑
  const getResultIcon = (result, size = 'small') => {
    switch (result) {
      case 'PASS':
        return <CheckCircleIcon color="success" fontSize={size} />;
      case 'FAIL':
        return <CancelIcon color="error" fontSize={size} />;
      case 'BLOCKED':
        return <BlockIcon color="warning" fontSize={size} />;
      case 'NOT_RUN':
      default:
        return <NotRunIcon color="disabled" fontSize={size} />;
    }
  };

  // 결과별 색상 매핑
  const getResultColor = (result) => {
    switch (result) {
      case 'PASS': return 'success';
      case 'FAIL': return 'error';
      case 'BLOCKED': return 'warning';
      case 'NOT_RUN':
      default: return 'default';
    }
  };

  // 데이터 로드
  const loadHierarchicalData = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        projectId,
        testPlanId: filters.testPlanId,
        testExecutionId: filters.testExecutionId,
        includeNotExecuted: filters.includeNotExecuted,
        page: 0,
        size: 1000, // 대용량 데이터 로드
        useCache: true
      };

      const data = await getHierarchicalTestResultReportSimple(params);
      setHierarchicalData(data);

      // 기본적으로 첫 번째 레벨 노드들을 확장
      if (data.testPlans && data.testPlans.length > 0) {
        const defaultExpanded = data.testPlans.map(plan => `plan-${plan.id}`);
        setExpandedNodes(defaultExpanded);
      }

    } catch (err) {
      const errorInfo = handleTestResultError(err, 'hierarchical data loading');
      setError(errorInfo.message);
      onError?.(errorInfo);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, onError]);

  // 초기 로드
  useEffect(() => {
    loadHierarchicalData();
  }, [loadHierarchicalData]);

  // 노드 확장/축소 핸들러
  const handleNodeToggle = (event, nodeIds) => {
    setExpandedNodes(nodeIds);
  };

  // 노드 선택 핸들러
  const handleNodeSelect = (event, nodeId, nodeData) => {
    event.stopPropagation();
    setSelectedNode({ nodeId, ...nodeData });
    setDetailDialogOpen(true);
  };

  // 내보내기 핸들러
  const handleExport = async (format = 'EXCEL') => {
    try {
      setLoading(true);

      const filter = {
        projectId,
        testPlanId: filters.testPlanId,
        testExecutionId: filters.testExecutionId,
        includeNotExecuted: filters.includeNotExecuted,
        exportFormat: format,
        hierarchicalStructure: true,
        includeTestPlanInfo: true,
        includeTestExecutionInfo: true
      };

      const response = await exportHierarchicalTestResultReport(filter);

      // 파일 다운로드 처리
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      link.download = `hierarchical_test_report_${timestamp}.${format.toLowerCase()}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      const errorInfo = handleTestResultError(err, 'hierarchical report export');
      setError(errorInfo.message);
      onError?.(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  // 통계 카드 렌더링
  const renderStatisticsCard = () => {
    if (!hierarchicalData?.statistics) return null;

    const stats = hierarchicalData.statistics;

    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            전체 통계
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.totalPlans}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                테스트 플랜
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.totalExecutions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                실행
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {stats.totalTestCases}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                테스트 케이스
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.totalPassed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                통과
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.totalFailed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                실패
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.totalBlocked}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                차단
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {stats.totalNotRun}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                미실행
              </Typography>
            </Box>
          </Box>

          {/* 진행률 표시 */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                실행률: {stats.executionRate}%
              </Typography>
              <Typography variant="body2">
                통과율: {stats.passRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.passRate}
              color="success"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  // 테스트 케이스 노드 렌더링
  const renderTestCaseNode = (testCase, executionId) => {
    const nodeId = `case-${testCase.id || testCase.testCaseId}-${executionId}`;

    return (
      <TreeItem
        key={nodeId}
        itemId={nodeId}
        label={
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            cursor: 'pointer'
          }}
            onClick={(e) => handleNodeSelect(e, nodeId, {
              type: 'testCase',
              data: testCase
            })}
          >
            {getResultIcon(testCase.result)}
            <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
              {testCase.testCaseName}
            </Typography>
            <Chip
              label={testCase.result || 'NOT_RUN'}
              color={getResultColor(testCase.result)}
              size="small"
              sx={{ ml: 1, minWidth: 70 }}
            />
            {testCase.executorName && (
              <Chip
                label={testCase.executorName}
                variant="outlined"
                size="small"
                sx={{ ml: 0.5 }}
              />
            )}
          </Box>
        }
        sx={{
          '& .MuiTreeItem-content': {
            py: 0.5,
          }
        }}
      />
    );
  };

  // 테스트 실행 노드 렌더링
  const renderExecutionNode = (execution, planId) => {
    const nodeId = `execution-${execution.id}`;
    const stats = execution.statistics || {};

    return (
      <TreeItem
        key={nodeId}
        itemId={nodeId}
        label={
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5
          }}>
            <PlayArrowIcon color="primary" sx={{ mr: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {execution.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {execution.executedAt ?
                  format(parseISO(execution.executedAt), 'yyyy-MM-dd HH:mm', { locale: ko }) :
                  '미실행'
                }
                {execution.executedBy && ` · ${execution.executedBy}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Chip label={`${stats.totalCases || 0}건`} size="small" variant="outlined" />
              {stats.passed > 0 && (
                <Chip label={`✓${stats.passed}`} color="success" size="small" />
              )}
              {stats.failed > 0 && (
                <Chip label={`✗${stats.failed}`} color="error" size="small" />
              )}
              {stats.blocked > 0 && (
                <Chip label={`!${stats.blocked}`} color="warning" size="small" />
              )}
            </Box>
          </Box>
        }
        sx={{
          '& .MuiTreeItem-content': {
            py: 1,
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          }
        }}
      >
        {execution.testCases?.map(testCase =>
          renderTestCaseNode(testCase, execution.id)
        )}
      </TreeItem>
    );
  };

  // 테스트 플랜 노드 렌더링
  const renderPlanNode = (plan) => {
    const nodeId = `plan-${plan.id}`;
    const stats = plan.statistics || {};

    return (
      <TreeItem
        key={nodeId}
        itemId={nodeId}
        label={
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            px: 1
          }}>
            <FolderIcon color="primary" sx={{ mr: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {plan.name}
              </Typography>
              {plan.description && (
                <Typography variant="caption" color="text.secondary">
                  {plan.description}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Badge badgeContent={plan.totalExecutions} color="primary">
                <Chip label="실행" size="small" variant="outlined" />
              </Badge>
              {stats.totalCases > 0 && (
                <Chip
                  label={`${stats.passRate || 0}% 통과`}
                  color={stats.passRate >= 80 ? 'success' : stats.passRate >= 60 ? 'warning' : 'error'}
                  size="small"
                />
              )}
            </Box>
          </Box>
        }
        sx={{
          '& .MuiTreeItem-content': {
            py: 0.5,
          }
        }}
      >
        {plan.executions?.map(execution =>
          renderExecutionNode(execution, plan.id)
        )}
      </TreeItem>
    );
  };

  // 상세 정보 다이얼로그
  const renderDetailDialog = () => {
    if (!selectedNode) return null;

    const { type, data } = selectedNode;

    return (
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {type === 'testCase' ? '테스트 케이스 상세 정보' : '상세 정보'}
        </DialogTitle>
        <DialogContent>
          {type === 'testCase' && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {data.testCaseName}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  폴더 경로: {data.folderPath || '미지정'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  실행 결과: {data.result || 'NOT_RUN'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  실행자: {data.executorName || '미지정'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  실행 일시: {data.executedAt ?
                    format(parseISO(data.executedAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko }) :
                    '미실행'
                  }
                </Typography>
              </Box>

              {data.testCaseDescription && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    설명
                  </Typography>
                  <Typography variant="body2">
                    {data.testCaseDescription}
                  </Typography>
                </Box>
              )}

              {data.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    비고
                  </Typography>
                  <Typography variant="body2">
                    {data.notes}
                  </Typography>
                </Box>
              )}

              {data.jiraIssueKey && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    JIRA 연동
                  </Typography>
                  <Chip
                    label={data.jiraIssueKey}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  {data.jiraStatus && (
                    <Chip
                      label={data.jiraStatus}
                      color="default"
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading && !hierarchicalData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>계층적 리포트 로드 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
        <Button onClick={loadHierarchicalData} sx={{ ml: 2 }}>
          다시 시도
        </Button>
      </Alert>
    );
  }

  if (!hierarchicalData || !hierarchicalData.testPlans) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          표시할 테스트 데이터가 없습니다
        </Typography>
        <Button
          variant="outlined"
          onClick={loadHierarchicalData}
          sx={{ mt: 2 }}
        >
          새로고침
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderOpenIcon color="primary" />
          계층적 테스트 결과 리포트
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadHierarchicalData}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('EXCEL')}
            disabled={loading}
          >
            Excel 내보내기
          </Button>
        </Stack>
      </Box>

      {/* 통계 카드 */}
      {renderStatisticsCard()}

      {/* 로딩 표시 */}
      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* 계층적 트리 뷰 */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <SimpleTreeView
          slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon,
          }}
          expandedItems={expandedNodes}
          onExpandedItemsChange={(event, nodeIds) => setExpandedNodes(nodeIds)}
          sx={{ flexGrow: 1, overflowY: 'auto' }}
        >
          {hierarchicalData.testPlans.map(plan => renderPlanNode(plan))}
        </SimpleTreeView>
      </Paper>

      {/* 상세 정보 다이얼로그 */}
      {renderDetailDialog()}
    </Box>
  );
};

export default HierarchicalTestResultTreeView;