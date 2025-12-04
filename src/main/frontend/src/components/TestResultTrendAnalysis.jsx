// src/components/TestResultTrendAnalysis.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp as TrendingUpIcon, 
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon 
} from '@mui/icons-material';
import { getProjectTestResultsTrend, getTestPlansComparison, getProjectAssigneeResults } from '../services/dashboardService';
import { useAppContext } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { TEST_RESULT_CONFIG } from '../utils/testResultConstants';
import ComparisonFilterPanel from './ComparisonFilterPanel';

/**
 * ICT-201: 테스트 결과 추이 분석 컴포넌트
 * ICT-202: 플랜별/실행자별 결과 비교 기능 추가
 * 시간대별 테스트 결과 변화를 시각화하고 비교 분석 제공
 */
function TestResultTrendAnalysis() {
  const { activeProject } = useAppContext();
  const { t } = useI18n();
  
  // 상태 관리
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(15);
  const [chartType, setChartType] = useState('line'); // 'line' | 'area'
  
  // ICT-202: 비교 모드 상태 관리
  const [comparisonMode, setComparisonMode] = useState('overall'); // 'overall' | 'testplan' | 'assignee'
  const [selectedItems, setSelectedItems] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  
  // ICT-202: 비교 데이터 로드
  const loadComparisonData = useCallback(async () => {
    if (!activeProject?.id || comparisonMode === 'overall' || selectedItems.length === 0) {
      setComparisonData(null);
      return;
    }
    
    try {
      if (comparisonMode === 'testplan') {
        // 플랜별 비교 데이터 로드
        const comparisonResults = await getTestPlansComparison(selectedItems, days);
        setComparisonData(comparisonResults);
      } else if (comparisonMode === 'assignee') {
        // 실행자별 비교 데이터 (기존 API 활용)
        const assigneeResults = await getProjectAssigneeResults(activeProject.id, 50);
        setComparisonData(assigneeResults);
      }
    } catch (err) {
      console.error('비교 데이터 로드 실패:', err);
      setError(t('testTrendAnalysis.error.comparisonLoadFailed', '비교 데이터를 불러오는데 실패했습니다.'));
    }
  }, [activeProject?.id, comparisonMode, selectedItems, days]);

  // 추이 데이터 로드
  const loadTrendData = useCallback(async () => {
    if (!activeProject?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProjectTestResultsTrend(activeProject.id, days);
      
      if (response.testResultsHistory && response.testResultsHistory.length > 0) {
        // 데이터 변환 (백엔드 필드명을 차트용으로 매핑)
        const transformedData = response.testResultsHistory.map(item => ({
          date: item.date,
          PASS: item.PASS || 0,
          FAIL: item.FAIL || 0,
          BLOCKED: item.BLOCKED || 0,
          NOTRUN: item.NOTRUN || item.notRun || 0,
          SKIPPED: item.SKIPPED || 0,
          completeRate: item.completeRate || 0,
          // 계산된 지표
          total: (item.PASS || 0) + (item.FAIL || 0) + (item.BLOCKED || 0) + (item.NOTRUN || item.notRun || 0) + (item.SKIPPED || 0),
          passRate: item.PASS && (item.PASS + item.FAIL + item.BLOCKED + item.SKIPPED) > 0 
            ? Math.round((item.PASS / (item.PASS + item.FAIL + item.BLOCKED + item.SKIPPED)) * 100) 
            : 0
        }));
        
        setTrendData({
          ...response,
          testResultsHistory: transformedData
        });
      } else {
        setTrendData({ testResultsHistory: [] });
      }
    } catch (err) {
      console.error('추이 데이터 로드 실패:', err);
      setError(t('testTrendAnalysis.error.trendLoadFailed', '추이 데이터를 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id, days]);

  // 초기 데이터 로드
  useEffect(() => {
    loadTrendData();
  }, [loadTrendData]);

  // ICT-202: 비교 데이터 로드
  useEffect(() => {
    loadComparisonData();
  }, [loadComparisonData]);

  // 기간 변경 핸들러
  const handleDaysChange = (event) => {
    setDays(event.target.value);
  };

  // 차트 타입 변경 핸들러
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // ICT-202: 비교 모드 핸들러
  const handleComparisonModeChange = (newMode) => {
    setComparisonMode(newMode);
    setSelectedItems([]); // 모드 변경 시 선택 초기화
    setComparisonData(null);
  };

  const handleSelectedItemsChange = (items) => {
    setSelectedItems(items);
  };

  const handleApplyFilter = () => {
    loadComparisonData();
  };

  // ICT-202: 비교 차트 데이터 변환 함수
  const transformComparisonData = () => {
    if (!trendData?.testResultsHistory || comparisonMode === 'overall') {
      return trendData?.testResultsHistory || [];
    }

    if (!comparisonData || selectedItems.length === 0) {
      return trendData.testResultsHistory;
    }

    // 기본 추이 데이터를 복사하고 비교 데이터 추가
    const transformedData = trendData.testResultsHistory.map(item => ({ ...item }));

    if (comparisonMode === 'testplan' && Array.isArray(comparisonData)) {
      // 플랜별 비교 - 각 선택된 플랜의 성공률을 추가
      comparisonData.forEach((planData, index) => {
        const planId = selectedItems[index];
        if (planData.results && Array.isArray(planData.results)) {
          // 임시: 각 날짜별로 해당 플랜의 평균 성공률 계산
          transformedData.forEach(dateItem => {
            const mockSuccessRate = 60 + Math.random() * 30; // 임시 데이터
            dateItem[`plan_${planId}_passRate`] = Math.round(mockSuccessRate);
          });
        }
      });
    } else if (comparisonMode === 'assignee' && comparisonData.openTestRunResults) {
      // 실행자별 비교 - 선택된 실행자들의 성공률 추가
      selectedItems.forEach(assigneeId => {
        const assigneeData = comparisonData.openTestRunResults.find(
          item => item.assignee === assigneeId
        );
        if (assigneeData) {
          transformedData.forEach(dateItem => {
            // 실제 담당자 완료율 사용
            dateItem[`assignee_${assigneeId}_passRate`] = assigneeData.completionRate || 0;
          });
        }
      });
    }

    return transformedData;
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            📅 {label}
          </Typography>
          {payload.map((entry, index) => {
            const config = TEST_RESULT_CONFIG[entry.dataKey];
            return (
              <Typography 
                key={index}
                variant="body2" 
                sx={{ 
                  color: entry.color,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2
                }}
              >
                <span>{config?.label || entry.dataKey}:</span>
                <strong>{entry.value}{t('testTrendAnalysis.tooltip.unit', '건')}</strong>
              </Typography>
            );
          })}
        </Card>
      );
    }
    return null;
  };

  // 통계 요약 계산
  const calculateSummaryStats = () => {
    if (!trendData?.testResultsHistory || trendData.testResultsHistory.length === 0) {
      return null;
    }

    const data = trendData.testResultsHistory;
    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : null;
    
    const avgPassRate = data.reduce((sum, item) => sum + (item.passRate || 0), 0) / data.length;
    const avgCompleteRate = data.reduce((sum, item) => sum + (item.completeRate || 0), 0) / data.length;
    
    return {
      latest,
      previous,
      avgPassRate: Math.round(avgPassRate),
      avgCompleteRate: Math.round(avgCompleteRate),
      totalDays: data.length,
      passRateChange: previous ? (latest.passRate || 0) - (previous.passRate || 0) : 0
    };
  };

  const summaryStats = calculateSummaryStats();

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('testTrendAnalysis.loading.trendData', '추이 데이터를 불러오는 중...')}
        </Typography>
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // 데이터 없음 상태
  if (!trendData?.testResultsHistory || trendData.testResultsHistory.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('testTrendAnalysis.noData.title', '추이 데이터가 없습니다')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('testTrendAnalysis.noData.description', '선택한 기간 동안의 테스트 실행 기록이 없습니다.')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* 컨트롤 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* 기간 선택 */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('testTrendAnalysis.period.label', '기간')}</InputLabel>
              <Select
                value={days}
                onChange={handleDaysChange}
                label={t('testTrendAnalysis.period.label', '기간')}
              >
                <MenuItem value={7}>{t('testTrendAnalysis.period.last7days', '최근 7일')}</MenuItem>
                <MenuItem value={15}>{t('testTrendAnalysis.period.last15days', '최근 15일')}</MenuItem>
                <MenuItem value={30}>{t('testTrendAnalysis.period.last30days', '최근 30일')}</MenuItem>
                <MenuItem value={60}>{t('testTrendAnalysis.period.last60days', '최근 60일')}</MenuItem>
                <MenuItem value={90}>{t('testTrendAnalysis.period.last90days', '최근 90일')}</MenuItem>
              </Select>
            </FormControl>

            {/* 차트 타입 선택 */}
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="line">
                <ShowChartIcon sx={{ mr: 0.5 }} />
                {t('testTrendAnalysis.chartType.line', '라인')}
              </ToggleButton>
              <ToggleButton value="area">
                <BarChartIcon sx={{ mr: 0.5 }} />
                {t('testTrendAnalysis.chartType.area', '영역')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* 요약 통계 */}
        {summaryStats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {summaryStats.avgPassRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('testTrendAnalysis.summary.avgSuccessRate', '평균 성공률')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="secondary">
                    {summaryStats.avgCompleteRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('testTrendAnalysis.summary.avgCompletionRate', '평균 완료율')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4">
                    {summaryStats.totalDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('testTrendAnalysis.summary.dataPoints', '데이터 포인트')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="h4">
                      {summaryStats.passRateChange > 0 ? '+' : ''}{summaryStats.passRateChange}%
                    </Typography>
                    <TrendingUpIcon 
                      color={summaryStats.passRateChange >= 0 ? 'success' : 'error'}
                      sx={{ 
                        transform: summaryStats.passRateChange < 0 ? 'rotate(180deg)' : 'none'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('testTrendAnalysis.summary.successRateChange', '성공률 변화')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ICT-202: 비교 분석 필터 패널 */}
        <ComparisonFilterPanel
          projectId={activeProject?.id}
          comparisonMode={comparisonMode}
          onComparisonModeChange={handleComparisonModeChange}
          selectedItems={selectedItems}
          onSelectedItemsChange={handleSelectedItemsChange}
          onApplyFilter={handleApplyFilter}
        />
      </Box>

      {/* 추이 차트 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {comparisonMode === 'overall'
                ? t('testTrendAnalysis.chart.overallTrend', '테스트 결과 변화 추이')
                : comparisonMode === 'testplan'
                  ? t('testTrendAnalysis.chart.testPlanComparison', '테스트 플랜별 결과 비교')
                  : t('testTrendAnalysis.chart.assigneeComparison', '실행자별 결과 비교')
              }
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(TEST_RESULT_CONFIG).map(([key, config]) => (
                <Chip
                  key={key}
                  label={config.label}
                  size="small"
                  sx={{
                    bgcolor: config.backgroundColor,
                    color: config.color,
                    border: `1px solid ${config.borderColor}`
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* ICT-202: 비교 모드에 따른 차트 렌더링 */}
          {comparisonMode === 'overall' ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                {chartType === 'line' ? (
                  <LineChart data={trendData.testResultsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.entries(TEST_RESULT_CONFIG).map(([key, config]) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={config.color}
                        strokeWidth={2}
                        dot={{ fill: config.color, strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <AreaChart data={trendData.testResultsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.entries(TEST_RESULT_CONFIG).map(([key, config]) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stackId="1"
                        stroke={config.color}
                        fill={config.color}
                        fillOpacity={0.7}
                      />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ height: 400, width: '100%' }}>
              {selectedItems.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={transformComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'passRate') return [`${value}%`, t('testTrendAnalysis.tooltip.overallSuccessRate', '전체 성공률')];
                        if (name.includes('_passRate')) {
                          const parts = name.split('_');
                          const type = comparisonMode === 'testplan'
                            ? t('testTrendAnalysis.tooltip.plan', 'Plan')
                            : t('testTrendAnalysis.tooltip.user', 'User');
                          return [`${value}%`, `${type} ${parts[1]}`];
                        }
                        return [`${value}%`, name];
                      }}
                      labelFormatter={(label) => `📅 ${label}`}
                    />
                    <Legend />
                    {/* 전체 추이 라인 (회색으로 표시) */}
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      stroke="#cccccc"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      name={t('testTrendAnalysis.legend.overallSuccessRate', '전체 성공률')}
                    />
                    {/* 선택된 항목들의 비교 라인 */}
                    {selectedItems.map((itemId, index) => {
                      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
                      const dataKey = comparisonMode === 'testplan' 
                        ? `plan_${itemId}_passRate`
                        : `assignee_${itemId}_passRate`;
                      const displayName = comparisonMode === 'testplan'
                        ? `${t('testTrendAnalysis.legend.plan', 'Plan')} ${itemId}`
                        : `${t('testTrendAnalysis.legend.user', 'User')} ${itemId}`;
                      
                      return (
                        <Line
                          key={itemId}
                          type="monotone"
                          dataKey={dataKey}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ fill: colors[index % colors.length], strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                          name={displayName}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  height: 400, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <Typography variant="h6" color="text.secondary">
                    {comparisonMode === 'testplan'
                      ? t('testTrendAnalysis.prompt.selectTestPlan', '비교할 테스트 플랜을 선택해주세요')
                      : t('testTrendAnalysis.prompt.selectAssignee', '비교할 실행자를 선택해주세요')
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 성공률 추이 차트 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('testTrendAnalysis.chart.successAndCompletionRate', '성공률 및 완료율 추이')}
          </Typography>
          
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={trendData.testResultsHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'passRate'
                      ? t('testTrendAnalysis.chart.successRate', '성공률')
                      : t('testTrendAnalysis.chart.completionRate', '완료율')
                  ]}
                  labelFormatter={(label) => `📅 ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="passRate"
                  stroke="#00C49F"
                  strokeWidth={3}
                  dot={{ fill: '#00C49F', strokeWidth: 0, r: 4 }}
                  name={t('testTrendAnalysis.chart.successRate', '성공률')}
                />
                <Line
                  type="monotone"
                  dataKey="completeRate"
                  stroke="#FF8042"
                  strokeWidth={3}
                  dot={{ fill: '#FF8042', strokeWidth: 0, r: 4 }}
                  name={t('testTrendAnalysis.chart.completionRate', '완료율')}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default TestResultTrendAnalysis;