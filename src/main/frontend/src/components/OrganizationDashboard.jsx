// src/components/OrganizationDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import StyledDashboardPaper from './common/StyledDashboardPaper';
import { API_CONFIG } from '../utils/apiConstants.js';
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  ListAlt as ListAltIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import CountUp from 'react-countup';
import { useAppContext } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
// ICT-272: 표준 레이아웃 패턴 import
import { PAGE_CONTAINER_SX, GRID_SETTINGS } from '../styles/layoutConstants';
import { OrganizationService } from '../services/organizationService';
import { demoOrganizationsData, organizationHelpers } from '../models/demoOrganizationData';

import TabPanel from './common/TabPanel';

import { COLORS } from '../constants/colors';
import usageMetricsService from '../services/usageMetricsService.js';

const MetricCard = ({ title, value, icon, color = 'primary', subtitle, loading = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <CountUp end={value} duration={1} />
            )}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, { 
            sx: { fontSize: 32, color: `${color}.main` } 
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const OrganizationDashboard = () => {
  const { api, user, projects } = useAppContext();
  const { t } = useI18n();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usageMetrics, setUsageMetrics] = useState(null);
  const [usageMetricsLoading, setUsageMetricsLoading] = useState(false);
  const [usageMetricsError, setUsageMetricsError] = useState(null);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    organizations: [],
    totalProjects: 0,
    totalTestCases: 0,
    totalMembers: 0,
    totalUsers: 0, // 총 사용자 수 추가
    projectsByOrg: [],
    testResultStats: [],
  });

  const organizationService = new OrganizationService(api);

  const loadUsageMetrics = useCallback(async () => {
    setUsageMetricsLoading(true);
    setUsageMetricsError(null);

    try {
      const metrics = await usageMetricsService.fetchUsageMetrics();
      setUsageMetrics(metrics);
    } catch (error) {
      setUsageMetrics(null);
      setUsageMetricsError(error.message || 'Failed to load usage metrics');
    } finally {
      setUsageMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0) {
      loadDashboardData();
    } else if (projects && projects.length === 0) {
      // 프로젝트가 없는 경우에도 로딩 완료 처리
      setLoading(false);
      setDashboardData({
        organizations: [],
        totalProjects: 0,
        totalTestCases: 0,
        totalMembers: 0,
        totalUsers: 0,
        projectsByOrg: [],
        testResultStats: [],
      });
    } else {
    }
  }, [projects]); // projects 의존성 추가

  useEffect(() => {
    loadUsageMetrics();
    const interval = setInterval(() => {
      loadUsageMetrics();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUsageMetrics]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      
      // 실제 프로젝트 데이터 사용
      const totalTestCases = projects.reduce((sum, project) => sum + (project.testCaseCount || 0), 0);
      const totalMembers = projects.reduce((sum, project) => sum + (project.memberCount || 0), 0);
      const totalProjects = projects.length;
      
      
      // 조직별 프로젝트 통계 (실제 데이터 기반)
      const organizationGroups = {};
      projects.forEach(project => {
        const orgName = project.organization?.name || '독립 프로젝트';
        if (!organizationGroups[orgName]) {
          organizationGroups[orgName] = {
            name: orgName,
            projects: 0,
            members: 0,
            testCases: 0
          };
        }
        organizationGroups[orgName].projects++;
        organizationGroups[orgName].members += project.memberCount || 0;
        organizationGroups[orgName].testCases += project.testCaseCount || 0;
      });
      
      const projectsByOrg = Object.values(organizationGroups);

      // 조직 데이터 가져오기 (organizationService 사용)
      let organizations = [];
      try {
        organizations = await organizationService.getOrganizations();
      } catch (error) {
      }

      // 사용자 통계 데이터 가져오기
      let totalUsers = 0;
      try {
        const userStatsResponse = await api(`/api/admin/users/statistics`);
        if (userStatsResponse.ok) {
          const userStats = await userStatsResponse.json();
          totalUsers = userStats.totalUsers || 0;
        }
      } catch (error) {
      }

      // 테스트 결과 통계 (임시 데모 데이터 - 실제 구현 시 수정 필요)
      const testResultStats = [
        { name: t('organization.dashboard.testResults.success'), value: Math.round(totalTestCases * 0.7), color: '#00C49F' },
        { name: t('organization.dashboard.testResults.failure'), value: Math.round(totalTestCases * 0.1), color: '#FF4D4F' },
        { name: t('organization.dashboard.testResults.blocked'), value: Math.round(totalTestCases * 0.05), color: '#FFBB28' },
        { name: t('organization.dashboard.testResults.notRun'), value: Math.round(totalTestCases * 0.15), color: '#B0BEC5' },
      ];

      // 최근 활동 데이터 (데모 데이터 사용)
      const recentActivity = organizationHelpers.getRecentActivities(null, 10).map(activity => ({
        id: activity.id,
        type: activity.type,
        user: { name: activity.userName, avatar: activity.userAvatar },
        message: activity.message,
        timestamp: activity.timestamp,
        organizationName: activity.organizationName,
        projectName: activity.projectName,
      }));

      // 멤버 활동도 데이터 제거 - 실제 API 연동 없음

      setDashboardData({
        organizations,
        totalProjects,
        totalTestCases,
        totalMembers,
        totalUsers, // 사용자 통계에서 가져온 총 사용자 수
        projectsByOrg,
        testResultStats,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUsageMetricsRefresh = useCallback(() => {
    loadUsageMetrics();
  }, [loadUsageMetrics]);

  const usageTopPages = usageMetrics?.pages ? usageMetrics.pages.slice(0, 5) : [];
  const usageDailySummaries = usageMetrics?.dailySummaries || [];
  const usageActiveWindowMinutes = usageMetrics?.rollingDayWindowMinutes || 10;
  const usageGeneratedAt = usageMetrics?.generatedAt ? new Date(usageMetrics.generatedAt) : null;
  const usageLastUpdatedLabel = usageGeneratedAt
    ? usageGeneratedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const usageRecentDailySummaries = usageDailySummaries.slice(-5);



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('organization.dashboard.title')}
      </Typography>

      <StyledDashboardPaper sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" fontWeight={600}>
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
      </StyledDashboardPaper>


      {/* 주요 지표 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalOrganizations')}
            value={dashboardData.organizations.length}
            icon={<BusinessIcon />}
            color="primary"
            subtitle={t('organization.dashboard.metrics.totalOrganizations.subtitle')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalProjects')}
            value={dashboardData.totalProjects}
            icon={<AssignmentIcon />}
            color="success"
            subtitle={t('organization.dashboard.metrics.totalProjects.subtitle')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalTestCases')}
            value={dashboardData.totalTestCases}
            icon={<ListAltIcon />}
            color="warning"
            subtitle={t('organization.dashboard.metrics.totalTestCases.subtitle')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalUsers')}
            value={dashboardData.totalUsers}
            icon={<PersonIcon />}
            color="secondary"
            subtitle={t('organization.dashboard.metrics.totalUsers.subtitle')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalMembers')}
            value={dashboardData.totalMembers}
            icon={<GroupIcon />}
            color="info"
            subtitle={t('organization.dashboard.metrics.totalMembers.subtitle')}
          />
        </Grid>
      </Grid>

      {/* 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('organization.dashboard.tabs.organizationStatus')} />
          <Tab label={t('organization.dashboard.tabs.testStatistics')} />
        </Tabs>
      </Box>

      {/* 조직 현황 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <StyledDashboardPaper>
              <Typography variant="h6" gutterBottom>
                {t('organization.dashboard.charts.projectDistribution')}
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.projectsByOrg}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="projects" fill="#8884d8" name={t('organization.dashboard.charts.projectDistribution.projects')} />
                    <Bar dataKey="members" fill="#82ca9d" name={t('organization.dashboard.charts.projectDistribution.members')} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </StyledDashboardPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledDashboardPaper sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {t('organization.dashboard.charts.organizationList')}
              </Typography>
              <List>
                {dashboardData.organizations.map((org, index) => (
                  <ListItem key={org.id} divider={index < dashboardData.organizations.length - 1}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={org.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('organization.dashboard.list.projectCount', {count: projects.filter(p => p.organization?.id === org.id).length})}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('organization.dashboard.list.memberCount', {count: projects.filter(p => p.organization?.id === org.id).reduce((sum, p) => sum + (p.memberCount || 0), 0)})}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </StyledDashboardPaper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 테스트 통계 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledDashboardPaper>
              <Typography variant="h6" gutterBottom>
                {t('organization.dashboard.charts.testResultDistribution')}
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.testResultStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.testResultStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </StyledDashboardPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledDashboardPaper>
              <Typography variant="h6" gutterBottom>
                {t('organization.dashboard.charts.testResultDetails')}
              </Typography>
              <Box>
                {dashboardData.testResultStats.map((stat, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1">{stat.name}</Typography>
                      <Typography variant="h6">{stat.value}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.value / dashboardData.testResultStats.reduce((sum, s) => sum + s.value, 0)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </StyledDashboardPaper>
          </Grid>
        </Grid>
      </TabPanel>

    </Box>
  );
};

export default OrganizationDashboard;
