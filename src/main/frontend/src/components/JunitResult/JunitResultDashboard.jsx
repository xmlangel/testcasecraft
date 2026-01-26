// src/components/JunitResult/JunitResultDashboard.jsx

/**
 * ICT-200: Allure 스타일 JUnit 테스트 결과 대시보드
 * JUnit XML 파일 업로드 및 테스트 결과 시각화
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Tab,
  Tabs,
  AppBar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  CloudUpload,
  Assessment,
  Error,
  CheckCircle,
  Warning,
  Schedule,
  Refresh,
  Delete,
  Visibility,
  TrendingUp,
  BarChart,
  PieChart,
  Add,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import junitResultService from '../../services/junitResultService';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import JunitProcessingProgress from '../JUnit/JunitProcessingProgress';

// 색상 팔레트 (Allure 스타일)
import { STATUS_COLORS as COLORS, RESULT_COLORS, CHART_COLORS } from '../../constants/statusColors';
import { PAGE_CONTAINER_SX } from '../../styles/layoutConstants';

// 안전한 날짜 포맷팅 함수
const formatSafeDate = (dateValue, t) => {
  try {
    if (!dateValue) {
      return t('junit.date.noInfo', '날짜 정보 없음');
    }

    let date;

    // 다양한 날짜 형식 처리
    if (typeof dateValue === 'string') {
      // ISO 형식이 아닌 경우 처리
      if (dateValue.includes('T') || dateValue.includes('-')) {
        date = new Date(dateValue);
      } else {
        // 숫자 문자열인 경우 (timestamp)
        const timestamp = parseInt(dateValue);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        } else {
          date = new Date(dateValue);
        }
      }
    } else if (typeof dateValue === 'number') {
      // timestamp 처리
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (Array.isArray(dateValue) && dateValue.length >= 6) {
      // Java LocalDateTime 배열 형식 처리: [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour, minute, second, nanosecond] = dateValue;
      // JavaScript Date의 월은 0부터 시작하므로 1을 빼야 함
      date = new Date(year, month - 1, day, hour, minute, second, Math.floor((nanosecond || 0) / 1000000));
    } else {
      console.warn('지원하지 않는 날짜 형식:', typeof dateValue, dateValue);
      return t('junit.date.unknown', '알 수 없는 날짜 형식');
    }

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 날짜 값:', dateValue);
      // 원본 값이 문자열이면 그대로 표시
      if (typeof dateValue === 'string' && dateValue.trim()) {
        return dateValue.trim();
      }
      return t('junit.date.invalid', '유효하지 않은 날짜');
    }

    return date;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error, 'Input:', dateValue);
    // 에러 발생 시 원본 값 표시 (문자열인 경우)
    if (typeof dateValue === 'string' && dateValue.trim()) {
      return dateValue.trim();
    }
    return t('junit.date.error', '날짜 처리 오류');
  }
};

// 월일만 표시하는 함수 (툴팁에 전체 정보)
const formatDateShort = (dateValue, t) => {
  const safeDate = formatSafeDate(dateValue, t);

  if (safeDate instanceof Date) {
    const month = (safeDate.getMonth() + 1).toString().padStart(2, '0');
    const day = safeDate.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }

  return safeDate; // 오류 메시지 그대로 반환
};

// 전체 날짜 정보 표시 함수 (툴팁용)
const formatDateFull = (dateValue, t) => {
  const safeDate = formatSafeDate(dateValue, t);

  if (safeDate instanceof Date) {
    return safeDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  return safeDate; // 오류 메시지 그대로 반환
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`junit-tabpanel-${index}`}
      aria-labelledby={`junit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function JunitResultDashboard() {
  const { activeProject, user } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 진행률 추적 상태
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [processingTestResultId, setProcessingTestResultId] = useState(null);

  // Accordion state
  const [accordionExpanded, setAccordionExpanded] = useState(() => {
    const saved = localStorage.getItem('testcase-manager-junit-accordion');
    return saved ? JSON.parse(saved) : {
      statistics: true,
      charts: true,
      list: true
    };
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    const newExpanded = { ...accordionExpanded, [panel]: isExpanded };
    setAccordionExpanded(newExpanded);
    localStorage.setItem('testcase-manager-junit-accordion', JSON.stringify(newExpanded));
  };

  // 데이터 로드
  const loadData = useCallback(async (showLoader = true) => {
    if (!activeProject?.id) return;

    if (showLoader) setLoading(true);
    setError(null);

    try {
      // 병렬로 데이터 로드
      const [resultsResponse, statisticsResponse] = await Promise.all([
        junitResultService.getJunitResultsByProject(activeProject.id, page, 20),
        junitResultService.getJunitStatistics(activeProject.id, timeRange)
      ]);

      setTestResults(resultsResponse.content || []);
      setTotalPages(resultsResponse.totalPages || 0);
      setStatistics(statisticsResponse);

    } catch (err) {
      console.error('JUnit 결과 로드 실패:', err);
      setError(t('junit.error.loadFailed'));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [activeProject?.id, page, timeRange]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 파일 업로드 처리
  const handleFileUpload = async (uploadData) => {
    if (!activeProject?.id) {
      setError('프로젝트가 선택되지 않았습니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await junitResultService.uploadJunitXml(
        uploadData.file,
        activeProject.id,
        uploadData.executionName,
        uploadData.description
      );

      setUploadProgress(100);
      setUploadDialogOpen(false);
      setSelectedFile(null);

      // 비동기 처리인 경우 진행률 다이얼로그 표시
      if (result.isAsync && result.testResultId) {
        setProcessingTestResultId(result.testResultId);
        setProcessingDialogOpen(true);
      }

      // 성공 후 데이터 새로고침
      await loadData(false);

    } catch (err) {
      console.error('파일 업로드 실패:', err);
      setError(`파일 업로드 실패: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // 테스트 결과 삭제
  const handleDeleteResult = async (resultId) => {
    if (!window.confirm(t('junit.confirm.deleteResult'))) {
      return;
    }

    setLoading(true);
    try {
      await junitResultService.deleteJunitResult(resultId);
      await loadData(false);
    } catch (err) {
      console.error('삭제 실패:', err);
      setError(`삭제 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 통계 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!statistics) return { pieData: [], barData: [], trendData: [] };

    // 파이 차트 데이터 (전체 테스트 상태별)
    const pieData = [
      { name: t('junit.stats.passed', '통과'), value: statistics.totalPassed || 0, color: RESULT_COLORS.PASS },
      { name: t('junit.stats.failed', '실패'), value: statistics.totalFailed || 0, color: RESULT_COLORS.FAIL },
      { name: t('junit.stats.error', '에러'), value: statistics.totalErrors || 0, color: COLORS.ERROR },
      { name: t('junit.stats.skipped', '스킵'), value: statistics.totalSkipped || 0, color: RESULT_COLORS.SKIPPED }
    ].filter(item => item.value > 0);

    // 바 차트 데이터 (최근 실행 결과별)
    const barData = testResults.slice(0, 10).map(result => ({
      name: result.testExecutionName?.substring(0, 20) || result.fileName?.substring(0, 20),
      [t('junit.stats.passed')]: result.totalTests - result.failures - result.errors - result.skipped,
      [t('junit.stats.failed')]: result.failures,
      [t('junit.stats.error')]: result.errors,
      [t('junit.stats.skipped')]: result.skipped,
      successRate: result.successRate
    }));

    // 트렌드 차트 데이터 (시간별 성공률)
    const trendData = testResults.slice(0, 15).reverse().map((result, index) => ({
      name: `${index + 1}`,
      successRate: result.successRate || 0,
      totalTests: result.totalTests,
      uploadedAt: result.uploadedAt
    }));

    return { pieData, barData, trendData };
  }, [statistics, testResults]);

  // 동일한 파일명별로 결과 그룹화 (최신순 정렬)
  const groupedTestResults = useMemo(() => {
    if (!testResults || testResults.length === 0) return [];

    const groups = {};
    testResults.forEach(result => {
      const fileName = result.fileName || 'unknown';
      if (!groups[fileName]) {
        groups[fileName] = {
          fileName,
          results: [],
          latestUploadedAt: result.uploadedAt
        };
      }
      groups[fileName].results.push(result);

      // 그룹의 가장 최신 시간 업데이트 (문자열 또는 숫자 비교)
      if (new Date(result.uploadedAt) > new Date(groups[fileName].latestUploadedAt)) {
        groups[fileName].latestUploadedAt = result.uploadedAt;
      }
    });

    // 각 그룹 내 결과들을 업로드 시간 내림차순으로 정렬
    Object.values(groups).forEach(group => {
      group.results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    });

    // 그룹들을 가장 최근 실행이 있는 순서대로 정렬하여 배열로 반환
    return Object.values(groups).sort((a, b) => new Date(b.latestUploadedAt) - new Date(a.latestUploadedAt));
  }, [testResults]);

  // 확장된 그룹 상태 관리
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroupExpand = (fileName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 비동기 처리 완료 핸들러
  const handleProcessingComplete = async (testResultId) => {
    // 데이터 새로고침
    await loadData(false);

    // 진행률 다이얼로그 자동 닫기
    setTimeout(() => {
      setProcessingDialogOpen(false);
      setProcessingTestResultId(null);
    }, 2000);
  };

  // 진행률 다이얼로그 닫기
  const handleProcessingDialogClose = () => {
    setProcessingDialogOpen(false);
    setProcessingTestResultId(null);
  };

  if (!activeProject) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('junit.message.selectProject')}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('junit.dashboard.title')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('junit.dashboard.subtitle', { projectName: activeProject.name })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadData()}
            disabled={loading}
          >
            {t('junit.dashboard.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialogOpen(true)}
            disabled={loading}
          >
            {t('junit.dashboard.uploadResult')}
          </Button>
        </Box>
      </Box>

      {/* 로딩 상태 */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* 에러 알림 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 전체 통계 카드 */}
      {statistics && (
        <Accordion expanded={accordionExpanded.statistics} onChange={handleAccordionChange('statistics')} sx={{ mb: 4 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">{t('junit.sections.statistics', '통계 개요')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: isDarkMode ? alpha(theme.palette.success.main, 0.15) : alpha(RESULT_COLORS.PASS, 0.1) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ color: RESULT_COLORS.PASS, fontWeight: 'bold' }}>
                          {statistics.totalPassed || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('junit.stats.passedTests')}
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ fontSize: 40, color: RESULT_COLORS.PASS }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: isDarkMode ? alpha(theme.palette.error.main, 0.15) : alpha(RESULT_COLORS.FAIL, 0.1) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ color: RESULT_COLORS.FAIL, fontWeight: 'bold' }}>
                          {statistics.totalFailed || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('junit.stats.failedTests')}
                        </Typography>
                      </Box>
                      <Error sx={{ fontSize: 40, color: RESULT_COLORS.FAIL }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: isDarkMode ? alpha(theme.palette.warning.main, 0.15) : alpha(COLORS.ERROR, 0.1) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ color: COLORS.ERROR, fontWeight: 'bold' }}>
                          {statistics.totalErrors || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('junit.stats.errorTests')}
                        </Typography>
                      </Box>
                      <Warning sx={{ fontSize: 40, color: COLORS.ERROR }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.1) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" color="text.secondary">
                          {statistics.averageSuccessRate?.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('junit.stats.averageSuccessRate')}
                        </Typography>
                      </Box>
                      <Assessment sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid >
          </AccordionDetails >
        </Accordion >
      )
      }

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('junit.tab.overview')} />
          <Tab label={t('junit.tab.recentResults')} />
        </Tabs>
      </Box>

      {/* 개요 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Accordion expanded={accordionExpanded.charts} onChange={handleAccordionChange('charts')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">{t('junit.sections.charts', '차트 분석')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* 테스트 상태 분포 (파이 차트) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('junit.chart.testStatusDistribution')}
                    </Typography>
                    {chartData.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={chartData.pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {chartData.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              color: theme.palette.text.primary,
                              borderColor: theme.palette.divider
                            }}
                            itemStyle={{ color: theme.palette.text.primary }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                          {t('junit.empty.noResults', '테스트 결과가 없습니다')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* 최근 실행 결과 (바 차트) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('junit.chart.recentExecutionResults')}
                    </Typography>
                    {chartData.barData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={chartData.barData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
                          <YAxis tick={{ fill: theme.palette.text.secondary }} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              color: theme.palette.text.primary,
                              borderColor: theme.palette.divider
                            }}
                            itemStyle={{ color: theme.palette.text.primary }}
                          />
                          <Legend />
                          <Bar dataKey={t('junit.stats.passed')} fill={RESULT_COLORS.PASS} />
                          <Bar dataKey={t('junit.stats.failed')} fill={RESULT_COLORS.FAIL} />
                          <Bar dataKey={t('junit.stats.error')} fill={COLORS.ERROR} />
                          <Bar dataKey={t('junit.stats.skipped')} fill={RESULT_COLORS.SKIPPED} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                          {t('junit.empty.noResults', '테스트 결과가 없습니다')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </TabPanel>

      {/* 최근 결과 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Accordion expanded={accordionExpanded.list} onChange={handleAccordionChange('list')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">{t('junit.sections.list', '테스트 실행 목록')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('junit.table.recentTestExecutionResults')}
                </Typography>
                {groupedTestResults.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width="40">{/* 확장 아이콘 */}</TableCell>
                          <TableCell>{t('junit.dashboard.list.fileName', '파일명')}</TableCell>
                          <TableCell>{t('junit.dashboard.list.testPlan', '테스트 플랜')}</TableCell>
                          <TableCell>{t('junit.dashboard.list.executionName', '실행 이름')}</TableCell>
                          <TableCell align="center">{t('junit.table.totalTests')}</TableCell>
                          <TableCell align="center">{t('junit.table.successRate')}</TableCell>
                          <TableCell align="center">{t('junit.table.status')}</TableCell>
                          <TableCell align="center">{t('junit.table.uploadTime')}</TableCell>
                          <TableCell align="center">{t('junit.table.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedTestResults.map((group) => {
                          const latestResult = group.results[0];
                          const isExpanded = expandedGroups[group.fileName];
                          const hasMultiple = group.results.length > 1;

                          return (
                            <React.Fragment key={group.fileName}>
                              {/* 그룹의 메인 행 (가장 최신 결과) */}
                              <TableRow
                                sx={{
                                  bgcolor: isExpanded ? alpha(theme.palette.action.hover, 0.05) : 'inherit',
                                  '& > *': { borderBottom: 'unset' }
                                }}
                              >
                                <TableCell>
                                  {hasMultiple && (
                                    <IconButton
                                      aria-label="expand row"
                                      size="small"
                                      onClick={() => toggleGroupExpand(group.fileName)}
                                    >
                                      {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                                    </IconButton>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button
                                      variant="text"
                                      sx={{
                                        textAlign: 'left',
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        color: 'primary.main',
                                        '&:hover': {
                                          backgroundColor: 'transparent',
                                          textDecoration: 'underline'
                                        },
                                        padding: 0,
                                        minWidth: 'auto',
                                        fontWeight: 'bold'
                                      }}
                                      onClick={() => navigate(`/projects/${activeProject.id}/junit-results/${latestResult.id}`)}
                                    >
                                      {group.fileName}
                                    </Button>
                                    {hasMultiple && (
                                      <Chip
                                        label={group.results.length}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {latestResult.testPlanName ? (
                                    <Chip
                                      label={latestResult.testPlanName}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontSize: '0.75rem' }}
                                    />
                                  ) : '-'}
                                </TableCell>
                                <TableCell>{latestResult.testExecutionName || '-'}</TableCell>
                                <TableCell align="center">
                                  <Badge badgeContent={latestResult.failures + latestResult.errors} color="error">
                                    <Typography variant="body2">{latestResult.totalTests}</Typography>
                                  </Badge>
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={latestResult.successRate || 0}
                                      sx={{ width: 40, height: 4 }}
                                      color={junitResultService.getSuccessRateColor(latestResult.successRate)}
                                    />
                                    <Typography variant="caption">
                                      {(latestResult.successRate || 0).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  {(() => {
                                    const statusInfo = junitResultService.getTestStatusInfo(latestResult.status, t);
                                    return (
                                      <Chip
                                        label={statusInfo.label}
                                        size="small"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 20,
                                          bgcolor: (latestResult.status === 'PASSED' || latestResult.status === 'COMPLETED') ? (isDarkMode ? alpha(theme.palette.success.main, 0.2) : alpha(RESULT_COLORS.PASS, 0.1)) :
                                            (latestResult.status === 'FAILED' || latestResult.status === 'ERROR') ? (isDarkMode ? alpha(theme.palette.error.main, 0.2) : alpha(RESULT_COLORS.FAIL, 0.1)) :
                                              latestResult.status === 'SKIPPED' ? (isDarkMode ? alpha(theme.palette.action.disabledBackground, 0.1) : alpha(RESULT_COLORS.SKIPPED, 0.1)) :
                                                (latestResult.status === 'PARSING' || latestResult.status === 'UPLOADING') ? (isDarkMode ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.info.main, 0.1)) :
                                                  statusInfo.bgColor,
                                          color: (latestResult.status === 'PASSED' || latestResult.status === 'COMPLETED') ? (isDarkMode ? theme.palette.success.light : RESULT_COLORS.PASS) :
                                            (latestResult.status === 'FAILED' || latestResult.status === 'ERROR') ? (isDarkMode ? theme.palette.error.light : RESULT_COLORS.FAIL) :
                                              latestResult.status === 'SKIPPED' ? (isDarkMode ? theme.palette.text.disabled : RESULT_COLORS.SKIPPED) :
                                                (latestResult.status === 'PARSING' || latestResult.status === 'UPLOADING') ? (isDarkMode ? theme.palette.info.light : theme.palette.info.main) :
                                                  'inherit',
                                          fontWeight: 'bold'
                                        }}
                                      />
                                    );
                                  })()}
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title={formatDateFull(latestResult.uploadedAt, t)} arrow>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                      {formatDateShort(latestResult.uploadedAt, t)}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/projects/${activeProject.id}/junit-results/${latestResult.id}`)}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteResult(latestResult.id)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>

                              {/* 확장된 경우의 하위 실행 이력 행들 */}
                              {isExpanded && hasMultiple && group.results.slice(1).map((result) => {
                                const statusInfo = junitResultService.getTestStatusInfo(result.status, t);
                                return (
                                  <TableRow
                                    key={result.id}
                                    sx={{
                                      bgcolor: alpha(theme.palette.action.hover, 0.03),
                                      '& > td': { py: 0.5 }
                                    }}
                                  >
                                    <TableCell />
                                    <TableCell sx={{ pl: 4 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        L {t('junit.list.previousExecution', '이전 실행')}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {result.testPlanName ? (
                                        <Typography variant="caption">{result.testPlanName}</Typography>
                                      ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="caption">{result.testExecutionName || '-'}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="caption">{result.totalTests}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="caption">{(result.successRate || 0).toFixed(1)}%</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={statusInfo.label}
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: '0.65rem',
                                          bgcolor: (result.status === 'PASSED' || result.status === 'COMPLETED') ? (isDarkMode ? alpha(theme.palette.success.main, 0.15) : alpha(RESULT_COLORS.PASS, 0.05)) :
                                            (result.status === 'FAILED' || result.status === 'ERROR') ? (isDarkMode ? alpha(theme.palette.error.main, 0.15) : alpha(RESULT_COLORS.FAIL, 0.05)) :
                                              result.status === 'SKIPPED' ? (isDarkMode ? alpha(theme.palette.action.disabledBackground, 0.1) : alpha(RESULT_COLORS.SKIPPED, 0.05)) :
                                                statusInfo.bgColor
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="caption">{formatDateShort(result.uploadedAt, t)}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Tooltip title={t('common.view')}>
                                        <IconButton
                                          size="small"
                                          onClick={() => navigate(`/projects/${activeProject.id}/junit-results/${result.id}`)}
                                        >
                                          <Visibility sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title={t('common.delete')}>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteResult(result.id)}
                                        >
                                          <Delete sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {t('junit.empty.noResults', '테스트 결과가 없습니다')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('junit.empty.uploadPrompt', 'JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.')}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      {t('junit.empty.firstUpload', '첫 번째 테스트 결과 업로드')}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      </TabPanel>


      {/* 업로드 FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setUploadDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* 파일 업로드 다이얼로그 */}
      <JunitUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        loading={loading}
        progress={uploadProgress}
      />

      {/* 대용량 파일 처리 진행률 다이얼로그 */}
      <JunitProcessingProgress
        testResultId={processingTestResultId}
        isVisible={processingDialogOpen}
        onClose={handleProcessingDialogClose}
        onComplete={handleProcessingComplete}
      />
    </Box >
  );
}

// 파일 업로드 다이얼로그 컴포넌트
function JunitUploadDialog({ open, onClose, onUpload, loading, progress }) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [executionName, setExecutionName] = useState('');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [uploadLimits, setUploadLimits] = useState(null);

  // 업로드 제한 정보 로드
  useEffect(() => {
    const loadUploadLimits = async () => {
      try {
        const response = await fetch('/api/config/upload-limits');
        if (response.ok) {
          const limits = await response.json();
          setUploadLimits(limits);
        }
      } catch (error) {
        console.warn('업로드 제한 정보 로드 실패:', error);
        // 기본값 설정
        setUploadLimits({
          maxFileSize: '100MB',
          junitMaxSizeFormatted: '100.0 MB',
          allowedExtensions: ['.xml']
        });
      }
    };

    if (open) {
      loadUploadLimits();
    }
  }, [open]);

  const handleFileSelect = (file) => {
    // 기본 validation 수행
    const validation = junitResultService.validateUploadFile(file);
    if (!validation.isValid) {
      setValidationError(validation.errors.join(', '));
      setSelectedFile(null);
      return;
    }

    // 파일 크기 추가 검증
    if (uploadLimits) {
      const maxSizeBytes = parseInt(uploadLimits.junitMaxSize);
      if (file.size > maxSizeBytes) {
        const fileSizeFormatted = formatFileSize(file.size);
        setValidationError(`파일 크기가 너무 큽니다. (${fileSizeFormatted} / 최대 ${uploadLimits.junitMaxSizeFormatted})`);
        setSelectedFile(null);
        return;
      }
    }

    setValidationError('');
    setSelectedFile(file);

    // {t('junit.comment.fileNameExtraction')}
    if (!executionName && file.name) {
      const name = file.name.replace(/\.(xml|XML)$/, '');
      setExecutionName(name);
    }
  };

  // 파일 크기 포맷 함수 (프론트엔드용)
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    onUpload({
      file: selectedFile,
      executionName: executionName.trim(),
      description: description.trim()
    });
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFile(null);
      setExecutionName('');
      setDescription('');
      setValidationError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} disableRestoreFocus maxWidth="md" fullWidth>
      <DialogTitle>{t('junit.upload.dialog.title')}</DialogTitle>
      <DialogContent>
        {/* 드래그 앤 드롭 영역 */}
        <Box
          sx={{
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragOver ? 'action.hover' : 'background.paper',
            mb: 3,
            transition: 'all 0.2s ease'
          }}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {selectedFile ? (
            <Box>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('junit.upload.fileSize', '크기')}: {junitResultService.formatFileSize(selectedFile.size)}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => setSelectedFile(null)}
              >
                {t('junit.upload.changeFile', '다른 파일 선택')}
              </Button>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {t('junit.upload.dragDrop')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {uploadLimits ? t('junit.upload.maxSize', { maxSize: uploadLimits.junitMaxSizeFormatted }) : t('junit.upload.maxSize', { maxSize: '...' })}
                {uploadLimits?.allowedExtensions && (
                  <span> {t('junit.upload.allowedFormats', { formats: uploadLimits.allowedExtensions.join(', ') })}</span>
                )}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                {t('junit.upload.selectFile')}
                <input
                  type="file"
                  hidden
                  accept=".xml"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </Button>
            </Box>
          )}
        </Box>

        {/* 검증 오류 표시 */}
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {/* 업로드 진행률 */}
        {loading && progress > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload sx={{ fontSize: 16 }} />
              {selectedFile && t('junit.upload.uploadingFile', '"{fileName}" 업로드 중...', { fileName: selectedFile.name })}
              {uploadLimits && ` (${t('junit.upload.max', '최대')} ${uploadLimits.junitMaxSizeFormatted})`}
            </Typography>
          </Box>
        )}

        {/* 메타데이터 입력 */}
        {selectedFile && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('junit.upload.executionInfo', '테스트 실행 정보')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input
                type="text"
                placeholder={t('junit.placeholder.executionName')}
                value={executionName}
                onChange={(e) => setExecutionName(e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <textarea
                placeholder={t('junit.placeholder.description', '설명 (선택사항)')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('common.cancel', '취소')}
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          startIcon={loading ? <Schedule /> : <CloudUpload />}
        >
          {loading ? t('junit.dashboard.uploading', '업로드 중...') : t('junit.dashboard.upload', '업로드')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}