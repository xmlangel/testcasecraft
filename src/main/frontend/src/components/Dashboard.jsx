// src/components/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Chip, Tooltip
} from "@mui/material";
import StyledPaper from "./common/StyledPaper";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as ReTooltip, Legend, LineChart, Line, ResponsiveContainer, CartesianGrid
} from "recharts";
import CountUp from "react-countup";
import { useAppContext } from "../context/AppContext";
import { useI18n } from '../context/I18nContext';
import TestPlanSelector from "./TestPlanSelector";
import RecentTestResults from "./RecentTestResults";
// ICT-135: 실제 대시보드 API 서비스 import
import dashboardService, { handleDashboardError } from "../services/dashboardService";
import usageMetricsService from "../services/usageMetricsService.js";
import { RESULT_COLORS } from '../constants/statusColors';
// ICT-272: 표준 레이아웃 패턴 import
import { PAGE_CONTAINER_SX, GRID_SETTINGS } from '../styles/layoutConstants';

// RESULT_LABELS는 이제 t() 함수로 번역됨

function Dashboard() {
  const { t } = useI18n();

  // AppContext에서 필요한 데이터와 함수들
  const {
    activeProject,
    testPlans,
    testPlansLoading,
    fetchRecentTestResultsByTestPlan,
    fetchOpenTestRunAssigneeResults,
    fetchOpenTestRunAssigneeResultsByProject,
    testCases
  } = useAppContext();

  // ICT-135: 대시보드 실제 데이터 상태
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  
  // 실제 데이터 계산
  const [realTotalCases, setRealTotalCases] = useState(0);
  const [realMemberCount, setRealMemberCount] = useState(0);

  // 컴포넌트 상태
  const [selectedTestPlan, setSelectedTestPlan] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  // 오픈 테스트런 담당자별 결과 상태
  const [openTestRunAssigneeResults, setOpenTestRunAssigneeResults] = useState([]);
  const [assigneeResultsLoading, setAssigneeResultsLoading] = useState(false);
  const [assigneeResultsError, setAssigneeResultsError] = useState(null);

  const [usageMetrics, setUsageMetrics] = useState(null);
  const [usageMetricsLoading, setUsageMetricsLoading] = useState(false);
  const [usageMetricsError, setUsageMetricsError] = useState(null);

  // 테스트 플랜별 최근 결과 조회
  const fetchResults = async (testPlan) => {
    if (!testPlan) {
      setRecentResults([]);
      return;
    }

    setResultsLoading(true);
    setResultsError(null);
    
    try {
      const results = await fetchRecentTestResultsByTestPlan(testPlan.id, 20);
      setRecentResults(results);
    } catch (error) {
      console.error('Error fetching recent test results:', error);
      setResultsError(error.message);
      setRecentResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  // 오픈 테스트런 담당자별 결과 조회
  const fetchAssigneeResults = async () => {
    setAssigneeResultsLoading(true);
    setAssigneeResultsError(null);
    
    try {
      let results;
      if (activeProject && activeProject.id) {
        results = await fetchOpenTestRunAssigneeResultsByProject(activeProject.id, 10);
      } else {
        results = await fetchOpenTestRunAssigneeResults(10);
      }
      setOpenTestRunAssigneeResults(results);
    } catch (error) {
      console.error('Error fetching open test run assignee results:', error);
      setAssigneeResultsError(error.message);
      setOpenTestRunAssigneeResults([]);
    } finally {
      setAssigneeResultsLoading(false);
    }
  };

  const loadUsageMetrics = useCallback(async () => {
    setUsageMetricsLoading(true);
    setUsageMetricsError(null);

    try {
      const metrics = await usageMetricsService.fetchUsageMetrics();
      setUsageMetrics(metrics);
    } catch (error) {
      console.error('[Dashboard] Failed to load usage metrics:', error);
      setUsageMetrics(null);
      setUsageMetricsError(error.message || 'Failed to load usage metrics');
    } finally {
      setUsageMetricsLoading(false);
    }
  }, []);

  const handleUsageMetricsRefresh = useCallback(() => {
    loadUsageMetrics().catch(() => {});
  }, [loadUsageMetrics]);

  // 테스트 플랜 변경 시 결과 조회
  useEffect(() => {
    fetchResults(selectedTestPlan);
  }, [selectedTestPlan]);

  useEffect(() => {
    loadUsageMetrics();

    const refreshInterval = setInterval(() => {
      loadUsageMetrics();
    }, 5 * 60 * 1000); // 5분 주기 자동 새로고침

    return () => clearInterval(refreshInterval);
  }, [loadUsageMetrics]);

  // ICT-135: 대시보드 데이터 로드 함수
  const loadDashboardData = async (projectId) => {
    if (!projectId) {
      setDashboardData(null);
      return;
    }

    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const data = await dashboardService.loadDashboardData(projectId);
      
      setDashboardData(data);
      
      // 데이터에서 실제 값 추출하여 설정
      if (data.summary && data.summary.totalCases) {
        setRealTotalCases(data.summary.totalCases);
      }
      
    } catch (error) {
      console.error('[Dashboard] Failed to load dashboard data:', error);
      const errorInfo = handleDashboardError(error);
      setDashboardError(errorInfo);
      setDashboardData(null);
    } finally {
      setDashboardLoading(false);
    }
  };

  // ICT-135: 대시보드 데이터 새로고침 함수
  const refreshDashboardData = async () => {
    if (!activeProject?.id) return;
    
    try {
      
      const data = await dashboardService.refreshDashboardData(activeProject.id);
      setDashboardData(data);
      setDashboardError(null);
      loadUsageMetrics().catch(() => {});
    } catch (error) {
      console.error('[Dashboard] Failed to refresh dashboard data:', error);
      const errorInfo = handleDashboardError(error);
      setDashboardError(errorInfo);
    }
  };

  // 활성 프로젝트 변경 시 실제 데이터 계산 및 대시보드 데이터 로드
  useEffect(() => {
    if (activeProject) {
      // 프로젝트에 testCaseCount가 있으면 사용, 없으면 testCases에서 계산
      if (activeProject.testCaseCount !== undefined) {
        setRealTotalCases(activeProject.testCaseCount);
      } else if (testCases && testCases.length > 0) {
        const projectTestCases = testCases.filter(tc => tc.projectId === activeProject.id);
        setRealTotalCases(projectTestCases.length);
      } else {
        setRealTotalCases(0); // ICT-135: fake 데이터 대신 0으로 초기화
      }
      
      // 프로젝트에 memberCount가 있으면 사용, 없으면 members 배열에서 계산
      if (activeProject.memberCount !== undefined) {
        setRealMemberCount(activeProject.memberCount);
      } else if (activeProject.members) {
        setRealMemberCount(activeProject.members.length);
      } else {
        setRealMemberCount(0);
      }
      
      // ICT-135: 대시보드 데이터 로드
      loadDashboardData(activeProject.id);
    } else {
      // 프로젝트가 없으면 전체 테스트케이스 개수 사용
      setRealTotalCases(testCases ? testCases.length : 0);
      setRealMemberCount(0);
      setDashboardData(null); // ICT-135: 프로젝트 없으면 대시보드 데이터도 초기화
    }
    
    fetchAssigneeResults();
  }, [activeProject]); // testCases 의존성 제거

  // testCases 로딩 완료 시 테스트케이스 수 재계산
  useEffect(() => {
    if (activeProject && testCases && testCases.length > 0) {
      // activeProject에 testCaseCount가 없는 경우에만 testCases에서 계산
      if (activeProject.testCaseCount === undefined) {
        const projectTestCases = testCases.filter(tc => tc.projectId === activeProject.id);
        setRealTotalCases(projectTestCases.length);
      }
    }
  }, [testCases, activeProject]);

  // 새로고침 함수
  const handleRefresh = () => {
    fetchResults(selectedTestPlan);
  };

  // 담당자별 결과 새로고침 함수
  const handleAssigneeResultsRefresh = () => {
    fetchAssigneeResults();
  };

  // ICT-135: 실제 API 데이터에서 파이차트 데이터 생성
  const lastResult = dashboardData?.summary?.lastResult || {
    PASS: 0,
    FAIL: 0,
    BLOCKED: 0,
    SKIPPED: 0,
    NOTRUN: 0,
  };
  
  const lastPieData = Object.entries(lastResult).map(([k, v]) => ({
    name: t(`dashboard.status.${k.toLowerCase()}`),
    key: k,
    value: v,
  }));

  // ICT-135: 실제 API 데이터 사용
  const totalCases = dashboardData?.summary?.totalCases || realTotalCases || 0;
  const completeRate = dashboardData?.summary?.completeRate || 
    (totalCases > 0 ? Math.round((lastResult.PASS / totalCases) * 100) : 0);
  const failRate = totalCases > 0 ? Math.round((lastResult.FAIL / totalCases) * 100) : 0;
  

  // ICT-135: 실제 API 데이터에서 차트 데이터 생성
  const testResultsHistory = dashboardData?.trend?.testResultsHistory || [];
  const openTestRunResults = dashboardData?.openTestRuns?.openTestRunResults || [];
  
  const openTestRunStacked = openTestRunResults.map((row) => ({
    assignee: row.assignee,
    ...row,
  }));

  const notRunHistory = testResultsHistory.map((row) => ({
    date: row.date,
    notRun: row.notRun || row.NOTRUN || 0,
  }));

  // 최근 업데이트 시간 - API 데이터 또는 현재 시간 사용
  const lastUpdated = dashboardData?.summary?.lastUpdated || 
    dashboardData?.trend?.endDate || 
    new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', year: 'numeric' });

  const usageTopPages = usageMetrics?.pages ? usageMetrics.pages.slice(0, 5) : [];
  const usageDailySummaries = usageMetrics?.dailySummaries || [];
  const usageActiveWindowMinutes = usageMetrics?.rollingDayWindowMinutes || 10;
  const usageGeneratedAt = usageMetrics?.generatedAt
    ? new Date(usageMetrics.generatedAt)
    : null;
  const usageLastUpdatedLabel = usageGeneratedAt
    ? usageGeneratedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const usageRecentDailySummaries = usageDailySummaries.slice(-5);

  // ICT-135: 에러 재시도 핸들러
  const handleRetry = () => {
    if (activeProject?.id) {
      loadDashboardData(activeProject.id);
    }
  };

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t('dashboard.title')}
        <Chip
          label={t('dashboard.lastUpdated', { date: lastUpdated })}
          color={dashboardLoading ? "default" : "primary"}
          size="small"
          sx={{ ml: 2, verticalAlign: "middle" }}
        />
        {/* ICT-135: 새로고침 버튼 추가 */}
        {activeProject && (
          <Tooltip title={t('dashboard.refresh.tooltip')}>
            <Chip
              label={t('dashboard.refresh.button')}
              color="secondary"
              size="small"
              onClick={refreshDashboardData}
              sx={{ ml: 1, verticalAlign: "middle", cursor: "pointer" }}
            />
          </Tooltip>
        )}
      </Typography>
      
      {/* ICT-135: 로딩 상태 표시 */}
      {dashboardLoading && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "info.50", borderRadius: 1 }}>
          <Typography variant="body2" color="info.main">
            {t('dashboard.loading.data')}
          </Typography>
        </Box>
      )}
      
      {/* ICT-136: 개선된 에러 상태 표시 */}
      {dashboardError && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "error.50", borderRadius: 1, border: "1px solid", borderColor: "error.200" }}>
          <Typography variant="body2" color="error.main" sx={{ mb: 1, fontWeight: "bold" }}>
            {dashboardError.type === 'SERVER_ERROR' && '🛠️'}
            {dashboardError.type === 'NETWORK_ERROR' && '🌐'}
            {dashboardError.type === 'AUTH_ERROR' && '🔐'}
            {dashboardError.type === 'NOT_FOUND_ERROR' && '🔍'}
            {dashboardError.type === 'PERMISSION_ERROR' && '🚫'}
            {dashboardError.type === 'DATA_ERROR' && '📊'}
            {!['SERVER_ERROR', 'NETWORK_ERROR', 'AUTH_ERROR', 'NOT_FOUND_ERROR', 'PERMISSION_ERROR', 'DATA_ERROR'].includes(dashboardError.type) && '⚠️'}
            {' '}{dashboardError.message}
          </Typography>
          {dashboardError.userAction && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: "italic" }}>
              {t('dashboard.error.solution', { action: dashboardError.userAction })}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {dashboardError.canRetry && (
              <Chip
                label={t('dashboard.error.retry')}
                color="error"
                size="small"
                onClick={handleRetry}
                sx={{ cursor: "pointer" }}
              />
            )}
            {dashboardError.type === 'AUTH_ERROR' && (
              <Chip
                label={t('dashboard.error.goToLogin')}
                color="warning"
                size="small"
                onClick={() => window.location.href = '/login'}
                sx={{ cursor: "pointer" }}
              />
            )}
            {dashboardError.details && (
              <Tooltip title={dashboardError.details}>
                <Chip
                  label={t('dashboard.error.details')}
                  variant="outlined"
                  size="small"
                  sx={{ cursor: "help" }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      )}
      
      {/* ICT-135: 데이터 없음 상태 표시 */}
      {!dashboardLoading && !dashboardError && !dashboardData && activeProject && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "warning.50", borderRadius: 1 }}>
          <Typography variant="body2" color="warning.main">
            {t('dashboard.noData.message')}
          </Typography>
        </Box>
      )}
      
      {/* 프로젝트 정보 요약 */}
      {activeProject && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "primary.50" }} elevation={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="h6" color="primary">
                {activeProject.name}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={t('dashboard.project.totalTestCases', { count: totalCases })}
                color="info"
                size="small"
                sx={{ mr: 1 }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={t('dashboard.project.members', { count: realMemberCount })}
                color="secondary"
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      <Grid {...GRID_SETTINGS.dashboardCards}>
        {/* Usage metrics */}
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t('dashboard.usage.title', '사용량 요약')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {usageLastUpdatedLabel && (
                  <Chip
                    label={t('dashboard.usage.lastUpdated', '최근 업데이트 {time}', { time: usageLastUpdatedLabel })}
                    size="small"
                    color="default"
                  />
                )}
                <Chip
                  label={t('dashboard.refresh.button')}
                  color="secondary"
                  size="small"
                  onClick={handleUsageMetricsRefresh}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Box>

            {usageMetricsLoading ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.usage.loading', '사용량 데이터를 불러오는 중입니다...')}
              </Typography>
            ) : usageMetricsError ? (
              <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                  {t('dashboard.usage.error', '사용량 데이터를 불러오지 못했습니다.')}
                </Typography>
                <Chip
                  label={t('dashboard.usage.retry', '다시 시도')}
                  color="error"
                  size="small"
                  onClick={handleUsageMetricsRefresh}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            ) : usageMetrics ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.usage.totalVisits', '오늘 방문')}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      <CountUp end={usageMetrics.totalDailyVisits || 0} duration={1} />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.usage.uniqueVisitors', '오늘 고유 방문자')}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      <CountUp end={usageMetrics.totalUniqueVisitors || 0} duration={1} />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.usage.activeVisitors', '활성 세션')}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      <CountUp end={usageMetrics.activeVisitors || 0} duration={1} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('dashboard.usage.activeWindow', '최근 {minutes}분 기준', { minutes: usageActiveWindowMinutes })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('dashboard.usage.topPages', '상위 페이지')}
                  </Typography>
                  {usageTopPages.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {usageTopPages.map((page) => (
                        <Box key={page.pagePath} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ maxWidth: '70%' }}>
                            {page.pagePath}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {page.dailyCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('dashboard.usage.totalLabel', '누적 {total}', { total: page.totalCount })}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.usage.noData', '집계된 방문 데이터가 없습니다.')}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('dashboard.usage.dailySummary', '일별 방문 요약')}
                  </Typography>
                  {usageDailySummaries.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {usageRecentDailySummaries.map((summary) => (
                        <Box key={summary.date} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="body2">
                            {summary.date}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
                            <Typography variant="body1" fontWeight={600}>
                              {summary.totalVisits}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('dashboard.usage.uniqueLabel', '고유 {count}', { count: summary.uniqueVisitors })}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.usage.noData', '집계된 방문 데이터가 없습니다.')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.usage.noData', '집계된 방문 데이터가 없습니다.')}
              </Typography>
            )}
          </StyledPaper>
        </Grid>
        {/* Last test case results */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="subtitle1" gutterBottom>
              {t('dashboard.charts.recentTestResults')}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PieChart width={120} height={120}>
                <Pie
                  data={lastPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={true}
                >
                  {lastPieData.map((entry) => (
                    <Cell key={entry.key} fill={RESULT_COLORS[entry.key]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
              <Box sx={{ ml: 2 }}>
                <Box sx={{ display: "flex", alignItems: "baseline" }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    <CountUp end={completeRate} duration={1} />%
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {t('dashboard.status.complete')}
                  </Typography>
                  {failRate > 0 && (
                    <Chip
                      label={t('dashboard.status.failureRate', { rate: failRate })}
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('dashboard.status.completedCount', {
                    completed: (lastResult.PASS + lastResult.FAIL + lastResult.BLOCKED + lastResult.SKIPPED),
                    total: totalCases
                  })}
                </Typography>
                {lastPieData.map((d) => (
                  <Box key={d.key} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: RESULT_COLORS[d.key], borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      <CountUp end={d.value} duration={1} /> {d.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </StyledPaper>
        </Grid>
        {/* Test case results (history) */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1">{t('dashboard.charts.testResultsTrend')}</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('dashboard.charts.last15Days')}</InputLabel>
                <Select label={t('dashboard.charts.last15Days')} value={t('dashboard.charts.last15Days')} disabled>
                  <MenuItem value={t('dashboard.charts.last15Days')}>{t('dashboard.charts.last15Days')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              {testResultsHistory.length > 0 ? (
                <LineChart data={testResultsHistory} isAnimationActive>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="PASS" stroke={RESULT_COLORS.PASS} name={t('dashboard.status.pass')} strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                  <Line type="monotone" dataKey="FAIL" stroke={RESULT_COLORS.FAIL} name={t('dashboard.status.fail')} strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                  <Line type="monotone" dataKey="BLOCKED" stroke={RESULT_COLORS.BLOCKED} name={t('dashboard.status.blocked')} strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                  <Line type="monotone" dataKey="NOTRUN" stroke={RESULT_COLORS.NOTRUN} name={t('dashboard.status.notrun')} strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                </LineChart>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardLoading ? t('dashboard.loading.chart') : t('dashboard.noData.chart')}
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>
        {/* Test case results in open test runs (bar) */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="subtitle1" gutterBottom>
              {t('dashboard.charts.openTestRunResults')}
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              {openTestRunResults.length > 0 ? (
                <BarChart data={openTestRunResults} layout="vertical" isAnimationActive>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="assignee" />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="PASS" stackId="a" fill={RESULT_COLORS.PASS} name={t('dashboard.status.pass')} isAnimationActive />
                  <Bar dataKey="NOTRUN" stackId="a" fill={RESULT_COLORS.NOTRUN} name={t('dashboard.status.notrun')} isAnimationActive />
                  <Bar dataKey="FAIL" stackId="a" fill={RESULT_COLORS.FAIL} name={t('dashboard.status.fail')} isAnimationActive />
                  <Bar dataKey="BLOCKED" stackId="a" fill={RESULT_COLORS.BLOCKED} name={t('dashboard.status.blocked')} isAnimationActive />
                </BarChart>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardLoading ? t('dashboard.loading.chart') : t('dashboard.noData.noActiveTestRuns')}
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>
        {/* Test case results by assignee (stacked bar) */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="subtitle1" gutterBottom>
              {t('dashboard.charts.assigneeResults')}
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={openTestRunStacked} layout="vertical" isAnimationActive>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="assignee" />
                <ReTooltip />
                <Legend />
                <Bar dataKey="PASS" stackId="a" fill={RESULT_COLORS.PASS} name={t('dashboard.status.pass')} isAnimationActive />
                <Bar dataKey="NOTRUN" stackId="a" fill={RESULT_COLORS.NOTRUN} name={t('dashboard.status.notrun')} isAnimationActive />
                <Bar dataKey="FAIL" stackId="a" fill={RESULT_COLORS.FAIL} name={t('dashboard.status.fail')} isAnimationActive />
                <Bar dataKey="BLOCKED" stackId="a" fill={RESULT_COLORS.BLOCKED} name={t('dashboard.status.blocked')} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>
        {/* Recent Test Results by Test Plan */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('dashboard.charts.testPlanResults')}
              </Typography>
              {activeProject && (
                <TestPlanSelector
                  testPlans={testPlans}
                  selectedTestPlan={selectedTestPlan}
                  onTestPlanChange={setSelectedTestPlan}
                  loading={testPlansLoading}
                  size="small"
                />
              )}
              {!activeProject && (
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.messages.selectProject')}
                </Typography>
              )}
            </Box>
            
            <RecentTestResults
              results={recentResults}
              loading={resultsLoading}
              error={resultsError}
              onRefresh={handleRefresh}
              showProjectInfo={false}
              showExecutionInfo={true}
              maxHeight={300}
            />
          </StyledPaper>
        </Grid>
        
        {/* Not Run test cases in open test runs (line chart) */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1">
                {t('dashboard.charts.notRunTrend')}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('dashboard.charts.last15Days')}</InputLabel>
                <Select label={t('dashboard.charts.last15Days')} value={t('dashboard.charts.last15Days')} disabled>
                  <MenuItem value={t('dashboard.charts.last15Days')}>{t('dashboard.charts.last15Days')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              {notRunHistory.length > 0 ? (
                <LineChart data={notRunHistory} isAnimationActive>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ReTooltip />
                  <Line type="monotone" dataKey="notRun" stroke={RESULT_COLORS.NOTRUN} name={t('dashboard.status.notrun')} strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                </LineChart>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardLoading ? t('dashboard.loading.chart') : t('dashboard.noData.chart')}
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
