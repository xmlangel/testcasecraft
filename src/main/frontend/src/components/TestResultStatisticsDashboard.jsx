// src/components/TestResultStatisticsDashboard.jsx
// ICT-194 Phase 3: React 성능 최적화 적용

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Alert,
  Snackbar,
  Typography,
  Paper,
  Divider,
  useTheme,

  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

// ICT-187 컴포넌트들
import TestResultStatisticsCard from './TestResultStatisticsCard';
import TestResultPieChart from './TestResultPieChart';
import TestResultBarChart from './TestResultBarChart';
import StatisticsFilterPanel from './StatisticsFilterPanel';

// 서비스
import testResultService, { handleTestResultError } from '../services/testResultService';
import junitResultService from '../services/junitResultService';
import { useAppContext } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';

/**
 * ICT-187: 테스트 결과 통계 대시보드 메인 컴포넌트
 * Pass/Fail/NotRun/Blocked 통계를 종합적으로 표시
 */
function TestResultStatisticsDashboard() {
  // AppContext에서 필요한 데이터
  const {
    activeProject,
    projects = [],
    testPlans = [],
    testExecutions = []
  } = useAppContext();

  // I18n 훅
  const { t } = useI18n();

  // 반응형 처리를 위한 미디어 쿼리
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 960px 미만

  // 상태 관리
  const [filters, setFilters] = useState({
    testPlanId: '',
    testExecutionId: '',
    dateRange: 'all',

    viewType: 'overview',
    source: 'manual', // manual, automated, total
    depth: 1
  });

  const [statistics, setStatistics] = useState(null);
  const [manualStatistics, setManualStatistics] = useState(null);
  const [automatedStatistics, setAutomatedStatistics] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPercentage, setShowPercentage] = useState(false);

  // 활성 프로젝트 변경 시 필터 초기화
  useEffect(() => {
    if (activeProject?.id) {
      setFilters(prev => ({
        ...prev,
        testPlanId: '',
        testExecutionId: ''
      }));
    }
  }, [activeProject?.id]);

  // 필터 변경 시 데이터 새로고침


  // 보기 형태 변경 시 비교 데이터 로드
  useEffect(() => {
    if (filters.viewType !== 'overview') {
      loadComparisonData();
    }
  }, [filters.viewType, filters.depth, activeProject?.id, filters.testPlanId, filters.testExecutionId]);

  /**
   * 통계 데이터 로드
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */


  // Load Automated Statistics
  const loadAutomatedStatistics = useCallback(async () => {
    if (!activeProject?.id) return;
    try {
      const data = await junitResultService.getJunitStatistics(activeProject.id, filters.dateRange === 'all' ? '30d' : filters.dateRange);

      // Calculate counts
      const totalTests = data.totalTests || 0;
      const passCount = data.totalPassed || 0;
      const failCount = (data.failures || 0) + (data.errors || 0);
      const skippedCount = data.skipped || 0;
      const blockedCount = 0;
      const notRunCount = 0;

      // Calculate rates
      const passRate = totalTests > 0 ? (passCount / totalTests) * 100 : 0;
      const failRate = totalTests > 0 ? (failCount / totalTests) * 100 : 0;
      const blockedRate = 0;
      const notRunRate = 0;

      // Transform JUnit stats to match TestResultStatistics format
      const transformed = {
        totalTests,
        passCount,
        failCount,
        skippedCount,
        blockedCount,
        notRunCount,
        passRate,
        failRate,
        blockedRate,
        notRunRate,
        successRate: data.successRate || 0,
        executionRate: 100, // Automated tests are usually considered executed if they exist
        jiraLinkedCount: 0, // Automated tests don't have JIRA links yet
        calculatedAt: new Date().toISOString()
      };
      setAutomatedStatistics(transformed);
    } catch (err) {
      console.error('Failed to load automated statistics:', err);
    }
  }, [activeProject?.id, filters.dateRange]);

  // Load Manual Statistics
  const loadManualStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        projectId: activeProject?.id || undefined,
        testPlanId: filters.testPlanId || undefined,
        testExecutionId: filters.testExecutionId || undefined,
        useCache: true
      };

      const data = await testResultService.getTestResultStatistics(params);
      setManualStatistics(data);
    } catch (err) {
      const errorInfo = handleTestResultError(err, 'statistics loading');
      setError(errorInfo.message);
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id, filters.testPlanId, filters.testExecutionId]);

  useEffect(() => {
    loadManualStatistics();
    loadAutomatedStatistics();
  }, [loadManualStatistics, loadAutomatedStatistics]);

  // Combine Statistics based on Source
  useEffect(() => {
    if (filters.source === 'manual') {
      setStatistics(manualStatistics);
    } else if (filters.source === 'automated') {
      setStatistics(automatedStatistics);
    } else if (filters.source === 'total') {
      if (manualStatistics && automatedStatistics) {
        const total = {
          totalTests: manualStatistics.totalTests + automatedStatistics.totalTests,
          passCount: manualStatistics.passCount + automatedStatistics.passCount,
          failCount: manualStatistics.failCount + automatedStatistics.failCount,
          skippedCount: manualStatistics.skippedCount + automatedStatistics.skippedCount,
          blockedCount: manualStatistics.blockedCount + automatedStatistics.blockedCount,
          notRunCount: manualStatistics.notRunCount + automatedStatistics.notRunCount,
          calculatedAt: new Date().toISOString()
        };

        // Calculate latest results for total
        total.totalCaseCount = (manualStatistics.totalCaseCount || 0) + (automatedStatistics.totalTests || 0); // Automated is treated as 1:1 case:result here for now
        total.latestPassCount = (manualStatistics.latestPassCount || 0) + (automatedStatistics.passCount || 0);
        total.latestFailCount = (manualStatistics.latestFailCount || 0) + (automatedStatistics.failCount || 0);
        total.latestBlockedCount = (manualStatistics.latestBlockedCount || 0) + (automatedStatistics.skippedCount || 0);
        total.latestNotRunCount = (manualStatistics.latestNotRunCount || 0) + (automatedStatistics.notRunCount || 0);

        // Calculate rates
        total.passRate = total.totalTests > 0 ? (total.passCount / total.totalTests) * 100 : 0;
        total.failRate = total.totalTests > 0 ? (total.failCount / total.totalTests) * 100 : 0;
        total.blockedRate = total.totalTests > 0 ? (total.blockedCount / total.totalTests) * 100 : 0;
        total.notRunRate = total.totalTests > 0 ? (total.notRunCount / total.totalTests) * 100 : 0;

        // Latest rates
        total.latestPassRate = total.totalCaseCount > 0 ? (total.latestPassCount / total.totalCaseCount) * 100 : 0;
        total.latestFailRate = total.totalCaseCount > 0 ? (total.latestFailCount / total.totalCaseCount) * 100 : 0;
        total.latestBlockedRate = total.totalCaseCount > 0 ? (total.latestBlockedCount / total.totalCaseCount) * 100 : 0;
        total.latestNotRunRate = total.totalCaseCount > 0 ? (total.latestNotRunCount / total.totalCaseCount) * 100 : 0;

        // Recalculate execution and success rates
        const executed = total.totalTests - total.notRunCount;
        total.executionRate = total.totalTests > 0 ? (executed / total.totalTests) * 100 : 0;
        total.successRate = executed > 0 ? (total.passCount / executed) * 100 : 0;

        const latestExecuted = total.totalCaseCount - total.latestNotRunCount;
        total.latestSuccessRate = latestExecuted > 0 ? (total.latestPassCount / latestExecuted) * 100 : 0;

        // Jira link rate approximation (if needed)
        total.jiraLinkedCount = (manualStatistics.jiraLinkedCount || 0); // Automated usually doesn't have this yet

        setStatistics(total);
      } else {
        setStatistics(manualStatistics || automatedStatistics);
      }
    }
  }, [filters.source, manualStatistics, automatedStatistics]);

  /**
   * 폴더별 통계 계산 로직 구현
   * ICT-FOLDER-STATS: folderPath를 기반으로 Depth별 그룹화 및 집계
   */
  const calculateFolderStatistics = useCallback((reportData, depth) => {
    if (!reportData || !Array.isArray(reportData)) return [];

    const statsMap = new Map();

    reportData.forEach(item => {
      const folderPath = item.folderPath || '';
      // '/' 또는 '>' 등으로 구분될 수 있으나 TestResultReportDto 주석에는 "Root/API/Authentication" 형식임
      // 실제 데이터가 "Userv2.0 > 로그인/로그아웃" 형태일 수도 있으므로 유연하게 처리
      const separators = /[\/>]/;
      const parts = folderPath.split(separators).map(p => p.trim()).filter(p => p);
      
      // 요청된 depth까지만 경로 추출 (최대 parts.length)
      const targetParts = parts.slice(0, Math.min(depth, parts.length));
      
      // 만약 depth보다 경로가 짧다면, 하위 폴더가 없는 것이므로 해당 경로 그대로 사용
      // 만약 folderPath가 비어있다면 'Root' 처리
      const groupKey = targetParts.length > 0 ? targetParts.join(' > ') : (item.testCaseName ? 'Uncategorized' : 'Root');
      
      if (!statsMap.has(groupKey)) {
        statsMap.set(groupKey, {
          name: groupKey,
          pass_count: 0,
          fail_count: 0,
          blocked_count: 0,
          not_run_count: 0,
          total: 0
        });
      }
      
      const stats = statsMap.get(groupKey);
      const result = item.result || 'NOT_RUN';
      
      if (result === 'PASS') stats.pass_count++;
      else if (result === 'FAIL') stats.fail_count++;
      else if (result === 'BLOCKED') stats.blocked_count++;
      else stats.not_run_count++;
      
      stats.total++;
    });

    return Array.from(statsMap.values())
      .map(s => ({
        ...s,
        // BarChart 등에서 사용하는 key 이름에 맞춤 (findStatisticsByTestPlan 등 참고)
        name: s.name,
        pass_count: s.pass_count,
        fail_count: s.fail_count,
        blocked_count: s.blocked_count,
        not_run_count: s.not_run_count
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  /**
   * 비교 데이터 로드
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const loadComparisonData = useCallback(async () => {
    if (filters.viewType === 'overview') return;

    try {
      if (filters.viewType === 'by-folder') {
        const reportParams = {
          projectId: activeProject?.id,
          testPlanId: filters.testPlanId || undefined,
          testExecutionId: filters.testExecutionId || undefined
        };
        const reportData = await testResultService.getDetailedTestResultReport(reportParams);
        const folderStats = calculateFolderStatistics(reportData, filters.depth || 1);
        setComparisonData(folderStats);
      } else {
        const comparisonType = filters.viewType === 'by-plan' ? 'by-plan' : 'by-executor';
        const data = await testResultService.getComparisonStatistics(comparisonType, {
          projectId: activeProject?.id,
          source: filters.source // Source 전달 ('manual', 'automated', 'total')
        });
        setComparisonData(data);
      }
    } catch (err) {
      console.error('Failed to load comparison data:', err);
      // 비교 데이터는 실패해도 전체 UI를 막지 않음
      setComparisonData([]);
    }
  }, [filters.viewType, filters.depth, filters.source, activeProject?.id, filters.testPlanId, filters.testExecutionId, calculateFolderStatistics]);

  /**
   * 새로고침 핸들러
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const handleRefresh = useCallback(() => {
    testResultService.clearCache();
    loadManualStatistics();
    loadAutomatedStatistics();
    if (filters.viewType !== 'overview') {
      loadComparisonData();
    }
  }, [loadManualStatistics, loadAutomatedStatistics, loadComparisonData, filters.viewType]);

  /**
   * 필터 변경 핸들러
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSourceChange = (event, newSource) => {
    if (newSource !== null) {
      setFilters(prev => ({ ...prev, source: newSource }));
    }
  };

  /**
   * 에러 닫기
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  // ICT-194 Phase 3: 차트 제목 메모이제이션
  const comparisonChartTitle = useMemo(() => {
    if (filters.viewType === 'by-folder') {
      return t('testResultDashboard.chart.folderComparison', '폴더별 결과 비교');
    }
    return filters.viewType === 'by-plan'
      ? t('testResultDashboard.chart.planComparison', '테스트 플랜별 결과 비교')
      : t('testResultDashboard.chart.executorComparison', '실행자별 결과 비교');
  }, [filters.viewType, t]);

  // ICT-194 Phase 3: 통계 요약 정보 메모이제이션
  const statisticsSummary = useMemo(() => {
    if (!statistics) return null;

    const isLatestMode = !!statistics.totalCaseCount;

    return {
      executionRate: isLatestMode 
        ? (statistics.latestSuccessRate !== undefined ? (100 - (statistics.latestNotRunRate || 0)).toFixed(2) : 0)
        : statistics.executionRate?.toFixed(2) || 0,
      successRate: isLatestMode
        ? statistics.latestSuccessRate?.toFixed(2) || 0
        : statistics.successRate?.toFixed(2) || 0,
      jiraLinkRate: statistics.totalTests > 0
        ? (((statistics.jiraLinkedCount || 0) / statistics.totalTests) * 100).toFixed(2)
        : 0,
      lastUpdated: statistics.calculatedAt
        ? new Date(statistics.calculatedAt).toLocaleString('ko-KR')
        : t('testResultDashboard.summary.unknown', '알 수 없음')
    };
  }, [statistics, t]);

  return (
    <Box sx={{ p: 0 }}>

      {/* 필터 패널 */}
      <StatisticsFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        projects={projects}
        testPlans={testPlans}
        testExecutions={testExecutions}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Source Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={filters.source}
          exclusive
          onChange={handleSourceChange}
          aria-label="statistics source"
          size="small"
        >
          <ToggleButton value="manual">
            {t('dashboard.source.manual', '수동 테스트')}
          </ToggleButton>
          <ToggleButton value="automated">
            {t('dashboard.source.automated', '자동화 테스트')}
          </ToggleButton>
          <ToggleButton value="total">
            {t('dashboard.source.total', '전체 합계')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 메인 대시보드 - 반응형 개선 */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ minHeight: '400px' }}>
        {/* 전체 개요 모드 */}
        {filters.viewType === 'overview' && (
          <>
            {/* 모바일: 세로 배치, 데스크탑: 좌우 분할 */}
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TestResultStatisticsCard
                statistics={statistics}
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{ height: '100%' }}>
              <TestResultPieChart
                statistics={statistics}
                loading={loading}
                isMobile={isMobile}
              />
            </Grid>
          </>
        )}

        {/* 비교 모드 - 반응형 개선 */}
        {filters.viewType !== 'overview' && (
          <>
            {/* 모바일: 전체 폭, 태블릿+: 1/3 폭 */}
            <Grid size={{ xs: 12, md: 12, lg: 4 }}>
              <TestResultStatisticsCard
                statistics={statistics}
                loading={loading}
              />
            </Grid>

            {/* 비교 차트 - 데이터가 있을 때만 표시 */}
            {!loading &&
              (filters.viewType === 'by-plan' || filters.viewType === 'by-executor') &&
              comparisonData &&
              Array.isArray(comparisonData) &&
              comparisonData.length > 0 && (
                <Grid size={{ xs: 12, md: 12, lg: 8 }}>
                  <TestResultBarChart
                    data={comparisonData}
                    loading={false}
                    title={comparisonChartTitle}
                    showPercentage={showPercentage}
                    onTogglePercentage={setShowPercentage}
                    isMobile={isMobile}
                  />
                </Grid>
              )}
          </>
        )}

        {/* 추가 정보 패널 - 반응형 개선 */}
        {statisticsSummary && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{
              p: { xs: 1.5, sm: 2 },
              mt: { xs: 1, md: 2 },
              borderRadius: { xs: 1, md: 2 }
            }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  fontWeight: { xs: 600, md: 500 }
                }}
              >
                {t('testResultDashboard.summary.title', '통계 요약')}
              </Typography>
              <Divider sx={{ mb: { xs: 1.5, md: 2 } }} />

              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('testResultDashboard.summary.executionRate', '실행률')}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h6" : "h6"}
                    color="primary"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      fontWeight: { xs: 700, md: 600 }
                    }}
                  >
                    {statisticsSummary.executionRate}%
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('testResultDashboard.summary.successRate', '성공률')}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h6" : "h6"}
                    color="success.main"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      fontWeight: { xs: 700, md: 600 }
                    }}
                  >
                    {statisticsSummary.successRate}%
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('testResultDashboard.summary.jiraLinkRate', 'JIRA 연동률')}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h6" : "h6"}
                    color="info.main"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                      fontWeight: { xs: 700, md: 600 }
                    }}
                  >
                    {statisticsSummary.jiraLinkRate}%
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('testResultDashboard.summary.lastUpdated', '최종 업데이트')}
                  </Typography>
                  <Typography
                    variant={isMobile ? "body2" : "body2"}
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.825rem', md: '0.875rem' },
                      wordBreak: { xs: 'break-all', md: 'normal' }
                    }}
                  >
                    {isMobile
                      ? statisticsSummary.lastUpdated.split(' ')[0] // 모바일에서는 날짜만
                      : statisticsSummary.lastUpdated
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 에러 스낵바 - 반응형 개선 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'right'
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: { xs: '90vw', sm: '400px' },
            maxWidth: { xs: '95vw', sm: '600px' }
          }
        }}
      >
        <Alert
          severity="error"
          onClose={handleCloseError}
          variant="filled"
          sx={{
            fontSize: { xs: '0.875rem', md: '1rem' },
            '& .MuiAlert-message': {
              wordBreak: 'break-word'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TestResultStatisticsDashboard;