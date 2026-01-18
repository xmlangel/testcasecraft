// src/components/SystemDashboard.jsx
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
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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

import TabPanel from './common/TabPanel';
import PerformanceMetrics from './PerformanceMetrics';

import { COLORS } from '../constants/colors';
import { RESULT_COLORS } from '../constants/statusColors';
import usageMetricsService from '../services/usageMetricsService.js';

const MetricCard = ({ title, value, icon, color = 'primary', subtitle, loading = false }) => {
  const theme = useTheme();

  return (
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
              backgroundColor: alpha(theme.palette[color].main, 0.1),
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
};

const SystemDashboard = () => {
  const { api, user, projects } = useAppContext();
  const { t } = useI18n();
  const theme = useTheme();
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
        { name: t('organization.dashboard.testResults.success', 'Success'), value: Math.round(totalTestCases * 0.7), color: RESULT_COLORS.PASS },
        { name: t('organization.dashboard.testResults.failure', 'Failure'), value: Math.round(totalTestCases * 0.1), color: RESULT_COLORS.FAIL },
        { name: t('organization.dashboard.testResults.blocked', 'Blocked'), value: Math.round(totalTestCases * 0.05), color: RESULT_COLORS.BLOCKED },
        { name: t('organization.dashboard.testResults.notRun', 'Not Run'), value: Math.round(totalTestCases * 0.15), color: RESULT_COLORS.NOTRUN },
      ];

      // 최근 활동 데이터 (데모 데이터 사용 중지)
      const recentActivity = [];

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
      {/* 주요 지표 */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalOrganizations')}
            value={dashboardData.organizations.length}
            icon={<BusinessIcon />}
            color="primary"
            subtitle={t('organization.dashboard.metrics.totalOrganizations.subtitle')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalProjects')}
            value={dashboardData.totalProjects}
            icon={<AssignmentIcon />}
            color="success"
            subtitle={t('organization.dashboard.metrics.totalProjects.subtitle')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalTestCases')}
            value={dashboardData.totalTestCases}
            icon={<ListAltIcon />}
            color="warning"
            subtitle={t('organization.dashboard.metrics.totalTestCases.subtitle')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalUsers')}
            value={dashboardData.totalUsers}
            icon={<PersonIcon />}
            color="secondary"
            subtitle={t('organization.dashboard.metrics.totalUsers.subtitle')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <MetricCard
            title={t('organization.dashboard.metrics.totalMembers')}
            value={dashboardData.totalMembers}
            icon={<GroupIcon />}
            color="info"
            subtitle={t('organization.dashboard.metrics.totalMembers.subtitle')}
          />
        </Grid>
      </Grid>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('organization.dashboard.tabs.organizationStatus')} />
          <Tab label={t('organization.dashboard.tabs.testStatistics')} />
          <Tab label={t('organization.dashboard.tabs.performanceMetrics')} />
        </Tabs>
      </Box>
      {/* 조직 현황 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <StyledDashboardPaper>
              <Typography variant="h6" gutterBottom>
                {t('organization.dashboard.charts.projectDistribution')}
              </Typography>
              <Box width="100%" height={300}>
                <ResponsiveContainer width="100%" height={300}>
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
          <Grid size={{ xs: 12, md: 4 }}>
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
                      secondary={`${t('organization.dashboard.list.projectCount', { count: projects.filter(p => p.organization?.id === org.id).length })} / ${t('organization.dashboard.list.memberCount', { count: projects.filter(p => p.organization?.id === org.id).reduce((sum, p) => sum + (p.memberCount || 0), 0) })}`}
                      slotProps={{
                        secondary: {
                          component: 'span',
                          variant: 'body2',
                          color: 'text.secondary'
                        }
                      }}
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
          <Grid size={{ xs: 12, md: 6 }}>
            <StyledDashboardPaper>
              <Typography variant="h6" gutterBottom>
                {t('organization.dashboard.charts.testResultDistribution')}
              </Typography>
              <Box width="100%" height={300}>
                <ResponsiveContainer width="100%" height={300}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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
      {/* 성능 메트릭 탭 */}
      <TabPanel value={tabValue} index={2}>
        <PerformanceMetrics />
      </TabPanel>
    </Box>
  );
};

export default SystemDashboard;
