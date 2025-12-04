// src/components/TestCase/JiraIntegrationReportSection.jsx
// ICT-224: JIRA 연동 리포트 섹션 컴포넌트

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { JIRA_STATUS_COLORS, CHART_COLORS } from '../../constants/statusColors';

/**
 * JIRA 연동 리포트 섹션 컴포넌트
 * - JIRA 이슈 상태별 집계 표시
 * - 테스트 케이스별 연결된 JIRA 이슈 정보
 * - 미연결 테스트 케이스 식별
 * - JIRA 이슈 링크 및 상태 업데이트
 */
const JiraIntegrationReportSection = ({
  testResults = [],
  projectId,
  onRefresh,
  loading = false
}) => {
  // 상태 관리
  const [jiraData, setJiraData] = useState({
    statusSummary: [],
    issueDetails: [],
    unlinkedCases: []
  });
  const [expanded, setExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // JIRA 상태별 색상 매핑
  const getJiraStatusColor = (status) => {
    return JIRA_STATUS_COLORS[status] || JIRA_STATUS_COLORS.Default;
  };

  // JIRA 상태별 아이콘
  const getJiraStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircleIcon fontSize="small" />;
      case 'Blocked':
        return <ErrorIcon fontSize="small" />;
      case 'In Progress':
        return <WarningIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  // JIRA 데이터 분석
  useEffect(() => {
    analyzeJiraData();
  }, [testResults]);

  // JIRA 데이터 분석 함수
  const analyzeJiraData = () => {
    if (!testResults.length) {
      setJiraData({
        statusSummary: [],
        issueDetails: [],
        unlinkedCases: []
      });
      return;
    }

    // JIRA 이슈가 있는 케이스와 없는 케이스 분리
    const linkedCases = testResults.filter(result => result.jiraIssueKey);
    const unlinkedCases = testResults.filter(result => !result.jiraIssueKey);

    // JIRA 상태별 집계
    const statusCounts = {};
    linkedCases.forEach(result => {
      const status = result.jiraStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusSummary = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: getJiraStatusColor(status)
    }));

    // JIRA 이슈 상세 정보
    const issueMap = {};
    linkedCases.forEach(result => {
      const issueKey = result.jiraIssueKey;
      if (!issueMap[issueKey]) {
        issueMap[issueKey] = {
          issueKey,
          status: result.jiraStatus || 'Unknown',
          testCases: [],
          results: { PASS: 0, FAIL: 0, BLOCKED: 0, NOT_RUN: 0 }
        };
      }
      
      issueMap[issueKey].testCases.push({
        id: result.testCaseId,
        name: result.testCaseName,
        result: result.result,
        executedAt: result.executedAt,
        folderPath: result.folderPath
      });
      
      issueMap[issueKey].results[result.result] = 
        (issueMap[issueKey].results[result.result] || 0) + 1;
    });

    const issueDetails = Object.values(issueMap);

    setJiraData({
      statusSummary,
      issueDetails,
      unlinkedCases: unlinkedCases.map(result => ({
        id: result.testCaseId,
        name: result.testCaseName,
        folderPath: result.folderPath,
        result: result.result,
        executedAt: result.executedAt
      }))
    });
  };

  // 데이터 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('JIRA 데이터 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // JIRA 이슈 링크 열기
  const openJiraIssue = (issueKey) => {
    // 실제 JIRA 서버 URL로 변경 필요
    const jiraBaseUrl = import.meta.env.VITE_JIRA_BASE_URL || 'https://your-jira-server.com';
    window.open(`${jiraBaseUrl}/browse/${issueKey}`, '_blank');
  };

  // 통계 카드 렌더링
  const renderSummaryCards = () => {
    const totalLinked = jiraData.issueDetails.length;
    const totalUnlinked = jiraData.unlinkedCases.length;
    const totalCases = totalLinked + totalUnlinked;
    const linkageRate = totalCases > 0 ? Math.round((totalLinked / totalCases) * 100) : 0;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <LinkIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {totalLinked}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                연결된 케이스
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <LinkOffIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {totalUnlinked}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                미연결 케이스
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AssignmentIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {jiraData.issueDetails.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 JIRA 이슈
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {linkageRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                연동률
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // 상태별 차트 렌더링
  const renderStatusChart = () => {
    if (!jiraData.statusSummary.length) {
      return (
        <Alert severity="info">
          JIRA 연동 데이터가 없습니다.
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              JIRA 상태별 분포
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={jiraData.statusSummary}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {jiraData.statusSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              상태별 케이스 수
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={jiraData.statusSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <RechartsTooltip />
                L304: <Bar dataKey="count" fill={CHART_COLORS[4]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // JIRA 이슈 상세 목록 렌더링
  const renderIssueDetails = () => {
    if (!jiraData.issueDetails.length) {
      return (
        <Alert severity="info">
          연결된 JIRA 이슈가 없습니다.
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>JIRA 이슈</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="center">연결된 케이스</TableCell>
              <TableCell align="center">Pass</TableCell>
              <TableCell align="center">Fail</TableCell>
              <TableCell align="center">기타</TableCell>
              <TableCell align="center">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jiraData.issueDetails.map((issue) => (
              <TableRow key={issue.issueKey} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReportIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight="medium">
                      {issue.issueKey}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getJiraStatusIcon(issue.status)}
                    label={issue.status}
                    size="small"
                    sx={{ 
                      backgroundColor: getJiraStatusColor(issue.status),
                      color: 'white'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Badge badgeContent={issue.testCases.length} color="primary">
                    <AssignmentIcon />
                  </Badge>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={issue.results.PASS || 0} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={issue.results.FAIL || 0} 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={(issue.results.BLOCKED || 0) + (issue.results.NOT_RUN || 0)} 
                    size="small" 
                    color="default" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="JIRA에서 열기">
                    <IconButton 
                      size="small" 
                      onClick={() => openJiraIssue(issue.issueKey)}
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
    );
  };

  // 미연결 케이스 목록 렌더링
  const renderUnlinkedCases = () => {
    if (!jiraData.unlinkedCases.length) {
      return (
        <Alert severity="success">
          모든 테스트 케이스가 JIRA 이슈와 연결되어 있습니다.
        </Alert>
      );
    }

    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {jiraData.unlinkedCases.length}개의 테스트 케이스가 JIRA 이슈와 연결되지 않았습니다.
        </Alert>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>폴더 경로</TableCell>
                <TableCell>테스트 케이스</TableCell>
                <TableCell>결과</TableCell>
                <TableCell>실행 일시</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jiraData.unlinkedCases.slice(0, 10).map((testCase) => (
                <TableRow key={testCase.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {testCase.folderPath}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {testCase.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={testCase.result} 
                      size="small"
                      color={testCase.result === 'PASS' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {testCase.executedAt ? new Date(testCase.executedAt).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {jiraData.unlinkedCases.length > 10 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            ... 및 {jiraData.unlinkedCases.length - 10}개 더
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Accordion expanded={expanded} onChange={(e, isExpanded) => setExpanded(isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <BugReportIcon color="primary" />
            <Typography variant="h6">JIRA 연동 리포트</Typography>
            <Box sx={{ ml: 'auto', mr: 2 }}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={refreshing}
              >
                {refreshing ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* 요약 카드 */}
              {renderSummaryCards()}
              
              {/* 상태별 차트 */}
              <Box sx={{ mb: 3 }}>
                {renderStatusChart()}
              </Box>
              
              {/* JIRA 이슈 상세 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  JIRA 이슈 상세
                </Typography>
                {renderIssueDetails()}
              </Box>
              
              {/* 미연결 케이스 */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  미연결 테스트 케이스
                </Typography>
                {renderUnlinkedCases()}
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default JiraIntegrationReportSection;