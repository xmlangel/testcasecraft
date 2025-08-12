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
  Divider
} from '@mui/material';

// ICT-187 컴포넌트들
import TestResultStatisticsCard from './TestResultStatisticsCard';
import TestResultPieChart from './TestResultPieChart';
import TestResultBarChart from './TestResultBarChart';
import StatisticsFilterPanel from './StatisticsFilterPanel';

// 서비스
import testResultService, { handleTestResultError } from '../services/testResultService';
import { useAppContext } from '../context/AppContext';

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

  // 상태 관리
  const [filters, setFilters] = useState({
    projectId: '',
    testPlanId: '',
    testExecutionId: '',
    dateRange: 'all',
    viewType: 'overview'
  });

  const [statistics, setStatistics] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPercentage, setShowPercentage] = useState(false);

  // 활성 프로젝트 변경 시 필터 초기화
  useEffect(() => {
    if (activeProject?.id) {
      setFilters(prev => ({
        ...prev,
        projectId: activeProject.id,
        testPlanId: '',
        testExecutionId: ''
      }));
    }
  }, [activeProject?.id]);

  // 필터 변경 시 데이터 새로고침
  useEffect(() => {
    loadStatisticsData();
  }, [filters.projectId, filters.testPlanId, filters.testExecutionId, filters.dateRange]);

  // 보기 형태 변경 시 비교 데이터 로드
  useEffect(() => {
    if (filters.viewType !== 'overview') {
      loadComparisonData();
    }
  }, [filters.viewType, filters.projectId]);

  /**
   * 통계 데이터 로드
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const loadStatisticsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        projectId: filters.projectId || undefined,
        testPlanId: filters.testPlanId || undefined,
        testExecutionId: filters.testExecutionId || undefined,
        useCache: true
      };

      const data = await testResultService.getTestResultStatistics(params);
      setStatistics(data);
    } catch (err) {
      const errorInfo = handleTestResultError(err, 'statistics loading');
      setError(errorInfo.message);
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.projectId, filters.testPlanId, filters.testExecutionId]);

  /**
   * 비교 데이터 로드
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const loadComparisonData = useCallback(async () => {
    if (filters.viewType === 'overview') return;

    try {
      const comparisonType = filters.viewType === 'by-plan' ? 'by-plan' : 'by-executor';
      const data = await testResultService.getComparisonStatistics(comparisonType, {
        projectId: filters.projectId
      });
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to load comparison data:', err);
      // 비교 데이터는 실패해도 전체 UI를 막지 않음
      setComparisonData([]);
    }
  }, [filters.viewType, filters.projectId]);

  /**
   * 새로고침 핸들러
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const handleRefresh = useCallback(() => {
    testResultService.clearCache();
    loadStatisticsData();
    if (filters.viewType !== 'overview') {
      loadComparisonData();
    }
  }, [loadStatisticsData, loadComparisonData, filters.viewType]);

  /**
   * 필터 변경 핸들러
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * 에러 닫기
   * ICT-194 Phase 3: useCallback으로 메모이제이션 적용
   */
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  // ICT-194 Phase 3: 차트 제목 메모이제이션
  const comparisonChartTitle = useMemo(() => {
    return filters.viewType === 'by-plan' 
      ? '테스트 플랜별 결과 비교' 
      : '실행자별 결과 비교';
  }, [filters.viewType]);

  // ICT-194 Phase 3: 통계 요약 정보 메모이제이션
  const statisticsSummary = useMemo(() => {
    if (!statistics) return null;

    return {
      executionRate: statistics.executionRate?.toFixed(1) || 0,
      successRate: statistics.successRate?.toFixed(1) || 0,
      jiraLinkRate: statistics.totalTests > 0 
        ? ((statistics.jiraLinkedCount / statistics.totalTests) * 100).toFixed(1) 
        : 0,
      lastUpdated: statistics.calculatedAt 
        ? new Date(statistics.calculatedAt).toLocaleString('ko-KR')
        : '알 수 없음'
    };
  }, [statistics]);

  return (
    <Box sx={{ p: 2 }}>
      {/* 페이지 제목 */}
      <Typography variant="h4" component="h1" gutterBottom>
        테스트 결과 통계 대시보드
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        프로젝트별, 테스트 플랜별 테스트 결과를 시각화하여 분석할 수 있습니다.
      </Typography>

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

      {/* 메인 대시보드 */}
      <Grid container spacing={3}>
        {/* 전체 개요 모드 */}
        {filters.viewType === 'overview' && (
          <>
            {/* 상단: 통계 카드와 파이 차트 */}
            <Grid item xs={12} lg={6}>
              <TestResultStatisticsCard 
                statistics={statistics} 
                loading={loading} 
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <TestResultPieChart 
                statistics={statistics} 
                loading={loading} 
              />
            </Grid>
          </>
        )}

        {/* 비교 모드 */}
        {filters.viewType !== 'overview' && (
          <>
            {/* 왼쪽: 전체 통계 요약 */}
            <Grid item xs={12} lg={4}>
              <TestResultStatisticsCard 
                statistics={statistics} 
                loading={loading} 
              />
            </Grid>
            
            {/* 오른쪽: 비교 차트 */}
            <Grid item xs={12} lg={8}>
              <TestResultBarChart
                data={comparisonData}
                loading={loading}
                title={comparisonChartTitle}
                showPercentage={showPercentage}
                onTogglePercentage={setShowPercentage}
              />
            </Grid>
          </>
        )}

        {/* 추가 정보 패널 - ICT-194 Phase 3: 메모이제이션된 통계 사용 */}
        {statisticsSummary && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                통계 요약
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    실행률
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {statisticsSummary.executionRate}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    성공률
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {statisticsSummary.successRate}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    JIRA 연동률
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {statisticsSummary.jiraLinkRate}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    최종 업데이트
                  </Typography>
                  <Typography variant="body2">
                    {statisticsSummary.lastUpdated}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 에러 스낵바 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={handleCloseError}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TestResultStatisticsDashboard;