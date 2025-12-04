// src/components/TestCase/TestResultTrendSection.jsx
// ICT-224: 테스트 결과 트렌드 분석 컴포넌트

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TREND_CHART_COLORS } from '../../constants/chartColors';

/**
 * 테스트 결과 트렌드 분석 컴포넌트
 * - 시간별 성과 추이 차트 (일별/주별/월별)
 * - 실행자별 성과 비교 차트
 * - 테스트플랜별 품질 트렌드
 * - Pass Rate 변화 분석
 */
const TestResultTrendSection = ({
  testResults = [],
  projectId,
  onRefresh,
  loading = false
}) => {
  // 상태 관리
  const [expanded, setExpanded] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly
  const [analysisType, setAnalysisType] = useState('timeline'); // timeline, executor, testplan
  const [refreshing, setRefreshing] = useState(false);

  // 시간 범위 옵션
  const timeRangeOptions = [
    { value: '7d', label: '최근 7일' },
    { value: '30d', label: '최근 30일' },
    { value: '90d', label: '최근 90일' }
  ];

  // 보기 모드 옵션
  const viewModeOptions = [
    { value: 'daily', label: '일별' },
    { value: 'weekly', label: '주별' },
    { value: 'monthly', label: '월별' }
  ];

  // 분석 유형 옵션
  const analysisTypeOptions = [
    { value: 'timeline', label: '시간별 추이', icon: <TimelineIcon /> },
    { value: 'executor', label: '실행자별', icon: <BarChartIcon /> },
    { value: 'testplan', label: '테스트플랜별', icon: <PieChartIcon /> }
  ];

  // 필터링된 테스트 결과
  const filteredResults = useMemo(() => {
    const days = parseInt(timeRange.replace('d', ''));
    const cutoffDate = subDays(new Date(), days);
    
    return testResults.filter(result => {
      if (!result.executedAt) return false;
      const executedDate = typeof result.executedAt === 'string' 
        ? parseISO(result.executedAt) 
        : result.executedAt;
      return isValid(executedDate) && executedDate >= cutoffDate;
    });
  }, [testResults, timeRange]);

  // 시간별 추이 데이터 생성
  const timelineData = useMemo(() => {
    if (!filteredResults.length) return [];

    const groupedData = {};
    
    filteredResults.forEach(result => {
      const date = typeof result.executedAt === 'string' 
        ? parseISO(result.executedAt) 
        : result.executedAt;
      
      if (!isValid(date)) return;

      let key;
      switch (viewMode) {
        case 'weekly':
          key = format(startOfDay(date), 'yyyy-MM-dd');
          // 주별 그룹핑 로직 (간단화)
          const weekStart = subDays(date, date.getDay());
          key = format(startOfDay(weekStart), 'yyyy-MM-dd');
          break;
        case 'monthly':
          key = format(date, 'yyyy-MM');
          break;
        default: // daily
          key = format(date, 'yyyy-MM-dd');
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          PASS: 0,
          FAIL: 0,
          BLOCKED: 0,
          NOT_RUN: 0,
          total: 0
        };
      }

      groupedData[key][result.result] = (groupedData[key][result.result] || 0) + 1;
      groupedData[key].total += 1;
    });

    // 날짜순 정렬 및 Pass Rate 계산
    return Object.values(groupedData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        passRate: item.total > 0 ? Math.round((item.PASS / item.total) * 100) : 0,
        displayDate: viewMode === 'monthly' 
          ? format(new Date(item.date + '-01'), 'yyyy년 MM월')
          : format(new Date(item.date), 'MM/dd', { locale: ko })
      }));
  }, [filteredResults, viewMode]);

  // 실행자별 데이터 생성
  const executorData = useMemo(() => {
    if (!filteredResults.length) return [];

    const groupedData = {};
    
    filteredResults.forEach(result => {
      const executor = result.executorName || '미지정';
      
      if (!groupedData[executor]) {
        groupedData[executor] = {
          executor,
          PASS: 0,
          FAIL: 0,
          BLOCKED: 0,
          NOT_RUN: 0,
          total: 0
        };
      }

      groupedData[executor][result.result] = (groupedData[executor][result.result] || 0) + 1;
      groupedData[executor].total += 1;
    });

    return Object.values(groupedData)
      .sort((a, b) => b.total - a.total)
      .map(item => ({
        ...item,
        passRate: item.total > 0 ? Math.round((item.PASS / item.total) * 100) : 0
      }));
  }, [filteredResults]);

  // 테스트플랜별 데이터 생성
  const testPlanData = useMemo(() => {
    if (!filteredResults.length) return [];

    const groupedData = {};
    
    filteredResults.forEach(result => {
      const testPlan = result.testPlanName || '기본 플랜';
      
      if (!groupedData[testPlan]) {
        groupedData[testPlan] = {
          name: testPlan,
          PASS: 0,
          FAIL: 0,
          BLOCKED: 0,
          NOT_RUN: 0,
          total: 0
        };
      }

      groupedData[testPlan][result.result] = (groupedData[testPlan][result.result] || 0) + 1;
      groupedData[testPlan].total += 1;
    });

    return Object.values(groupedData)
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({
        ...item,
        passRate: item.total > 0 ? Math.round((item.PASS / item.total) * 100) : 0,
        color: TREND_CHART_COLORS[index % TREND_CHART_COLORS.length]
      }));
  }, [filteredResults]);

  // 트렌드 계산
  const calculateTrend = (data, field) => {
    if (data.length < 2) return 'flat';
    
    const recent = data.slice(-3).map(item => item[field]);
    const older = data.slice(-6, -3).map(item => item[field]);
    
    if (recent.length === 0 || older.length === 0) return 'flat';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'flat';
  };

  // 트렌드 아이콘
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };

  // 데이터 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('트렌드 데이터 새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 요약 카드 렌더링
  const renderSummaryCards = () => {
    const totalTests = filteredResults.length;
    const passRate = totalTests > 0 
      ? Math.round((filteredResults.filter(r => r.result === 'PASS').length / totalTests) * 100) 
      : 0;
    const trend = calculateTrend(timelineData, 'passRate');
    
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                {totalTests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 테스트 실행
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {passRate}%
                </Typography>
                {getTrendIcon(trend)}
              </Box>
              <Typography variant="body2" color="text.secondary">
                평균 Pass Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                {executorData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                활성 실행자
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                {testPlanData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                테스트 플랜
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // 차트 렌더링
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (analysisType) {
      case 'timeline':
        return renderTimelineChart();
      case 'executor':
        return renderExecutorChart();
      case 'testplan':
        return renderTestPlanChart();
      default:
        return null;
    }
  };

  // 시간별 추이 차트
  const renderTimelineChart = () => {
    if (!timelineData.length) {
      return <Alert severity="info">선택한 기간에 데이터가 없습니다.</Alert>;
    }

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pass Rate 추이
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip 
                  formatter={(value, name) => [`${value}%`, 'Pass Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="passRate" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              결과 분포 (누적)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="PASS" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="FAIL" stackId="1" stroke="#ff7c7c" fill="#ff7c7c" />
                <Area type="monotone" dataKey="BLOCKED" stackId="1" stroke="#ffc658" fill="#ffc658" />
                <Area type="monotone" dataKey="NOT_RUN" stackId="1" stroke="#d084d0" fill="#d084d0" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // 실행자별 차트
  const renderExecutorChart = () => {
    if (!executorData.length) {
      return <Alert severity="info">실행자 데이터가 없습니다.</Alert>;
    }

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              실행자별 테스트 결과
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executorData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="executor" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="PASS" fill="#82ca9d" name="Pass" />
                <Bar dataKey="FAIL" fill="#ff7c7c" name="Fail" />
                <Bar dataKey="BLOCKED" fill="#ffc658" name="Blocked" />
                <Bar dataKey="NOT_RUN" fill="#d084d0" name="Not Run" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              실행자별 Pass Rate
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {executorData.slice(0, 8).map((executor, index) => (
                <Box key={executor.executor} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{executor.executor}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {executor.passRate}%
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      backgroundColor: 'grey.200', 
                      borderRadius: 1 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${executor.passRate}%`, 
                        height: '100%', 
                        backgroundColor: TREND_CHART_COLORS[index % TREND_CHART_COLORS.length], 
                        borderRadius: 1 
                      }} 
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // 테스트플랜별 차트
  const renderTestPlanChart = () => {
    if (!testPlanData.length) {
      return <Alert severity="info">테스트 플랜 데이터가 없습니다.</Alert>;
    }

    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              테스트플랜별 분포
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={testPlanData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="total"
                  label={({ name, total }) => `${name}: ${total}`}
                >
                  {testPlanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              플랜별 Pass Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testPlanData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <RechartsTooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
                <Bar dataKey="passRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Accordion expanded={expanded} onChange={(e, isExpanded) => setExpanded(isExpanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <TimelineIcon color="primary" />
            <Typography variant="h6">트렌드 분석</Typography>
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
          <Box>
            {/* 컨트롤 패널 */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>기간</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="기간"
                >
                  {timeRangeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>단위</InputLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  label="단위"
                >
                  {viewModeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <ButtonGroup size="small" variant="outlined">
                {analysisTypeOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={analysisType === option.value ? 'contained' : 'outlined'}
                    onClick={() => setAnalysisType(option.value)}
                    startIcon={option.icon}
                  >
                    {option.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
            
            {/* 요약 카드 */}
            {renderSummaryCards()}
            
            {/* 차트 */}
            {renderChart()}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TestResultTrendSection;