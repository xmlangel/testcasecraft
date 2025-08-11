// src/components/OrganizationDashboard.jsx
import React, { useState, useEffect } from 'react';
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
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
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
import { OrganizationService } from '../services/organizationService';
import { demoOrganizationsData, organizationHelpers } from '../models/demoOrganizationData';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`dashboard-tabpanel-${index}`}
    aria-labelledby={`dashboard-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8DD1E1'];

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
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    organizations: [],
    totalProjects: 0,
    totalTestCases: 0,
    totalMembers: 0,
    totalUsers: 0, // 총 사용자 수 추가
    projectsByOrg: [],
    testResultStats: [],
    recentActivity: [],
    memberActivity: [],
  });

  const organizationService = new OrganizationService(api);

  useEffect(() => {
    console.log('[OrganizationDashboard] Projects changed:', projects?.length, projects);
    if (projects && projects.length > 0) {
      console.log('[OrganizationDashboard] Loading dashboard data with projects:', projects.length);
      loadDashboardData();
    } else if (projects && projects.length === 0) {
      // 프로젝트가 없는 경우에도 로딩 완료 처리
      console.log('[OrganizationDashboard] No projects found, setting empty data');
      setLoading(false);
      setDashboardData({
        organizations: [],
        totalProjects: 0,
        totalTestCases: 0,
        totalMembers: 0,
        totalUsers: 0,
        projectsByOrg: [],
        testResultStats: [],
        recentActivity: [],
        memberActivity: [],
      });
    } else {
      console.log('[OrganizationDashboard] Projects still loading...');
    }
  }, [projects]); // projects 의존성 추가

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('[OrganizationDashboard] Using real projects data:', projects);
      
      // 각 프로젝트별 상세 로그
      projects.forEach((project, index) => {
        console.log(`[OrganizationDashboard] Project ${index + 1}:`, {
          name: project.name,
          testCaseCount: project.testCaseCount,
          memberCount: project.memberCount,
          id: project.id
        });
      });
      
      // 실제 프로젝트 데이터 사용
      const totalTestCases = projects.reduce((sum, project) => sum + (project.testCaseCount || 0), 0);
      const totalMembers = projects.reduce((sum, project) => sum + (project.memberCount || 0), 0);
      const totalProjects = projects.length;
      
      console.log('[OrganizationDashboard] Calculated - totalTestCases:', totalTestCases, 'totalMemberships:', totalMembers, 'totalProjects:', totalProjects);
      console.log('[OrganizationDashboard] Note: totalMemberships는 중복 사용자를 포함한 프로젝트 참여 수입니다.');
      
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
        console.log('[OrganizationDashboard] 조직 데이터를 가져올 수 없어 빈 배열 사용:', error.message);
      }

      // 사용자 통계 데이터 가져오기
      let totalUsers = 0;
      try {
        const userStatsResponse = await api(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/statistics`);
        if (userStatsResponse.ok) {
          const userStats = await userStatsResponse.json();
          totalUsers = userStats.totalUsers || 0;
          console.log('[OrganizationDashboard] User statistics loaded:', userStats);
        }
      } catch (error) {
        console.log('[OrganizationDashboard] 사용자 통계를 가져올 수 없어 0으로 설정:', error.message);
      }

      // 테스트 결과 통계 (임시 데모 데이터 - 실제 구현 시 수정 필요)
      const testResultStats = [
        { name: '성공', value: Math.round(totalTestCases * 0.7), color: '#00C49F' },
        { name: '실패', value: Math.round(totalTestCases * 0.1), color: '#FF4D4F' },
        { name: '차단됨', value: Math.round(totalTestCases * 0.05), color: '#FFBB28' },
        { name: '미실행', value: Math.round(totalTestCases * 0.15), color: '#B0BEC5' },
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

      // 멤버 활동도 (데모 데이터 사용)
      const memberActivity = organizationHelpers.getMemberActivityRanking(null, 5).map(member => ({
        name: member.name,
        tests: member.testsCompleted,
        projects: member.projectsInvolved,
        avatar: member.avatar,
        organizationName: member.organizationName,
      }));

      setDashboardData({
        organizations,
        totalProjects,
        totalTestCases,
        totalMembers,
        totalUsers, // 사용자 통계에서 가져온 총 사용자 수
        projectsByOrg,
        testResultStats,
        recentActivity,
        memberActivity,
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test_completed': return <CheckCircleIcon color="success" />;
      case 'project_created': return <AssignmentIcon color="primary" />;
      case 'member_joined': return <PersonIcon color="info" />;
      default: return <ScheduleIcon />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        대시보드
      </Typography>

      {/* 주요 지표 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="총 조직 수"
            value={dashboardData.organizations.length}
            icon={<BusinessIcon />}
            color="primary"
            subtitle="활성 조직"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="총 프로젝트 수"
            value={dashboardData.totalProjects}
            icon={<AssignmentIcon />}
            color="success"
            subtitle="전체 프로젝트"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="총 테스트케이스"
            value={dashboardData.totalTestCases}
            icon={<ListAltIcon />}
            color="warning"
            subtitle="작성된 테스트케이스"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="총 사용자 수"
            value={dashboardData.totalUsers}
            icon={<PersonIcon />}
            color="secondary"
            subtitle="등록된 사용자"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="총 프로젝트 참여"
            value={dashboardData.totalMembers}
            icon={<GroupIcon />}
            color="info"
            subtitle="프로젝트 멤버십 수"
          />
        </Grid>
      </Grid>

      {/* 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="조직 현황" />
          <Tab label="테스트 통계" />
          <Tab label="활동 내역" />
        </Tabs>
      </Box>

      {/* 조직 현황 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                조직별 프로젝트 분포
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.projectsByOrg}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="projects" fill="#8884d8" name="프로젝트 수" />
                    <Bar dataKey="members" fill="#82ca9d" name="멤버 수" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                조직 목록
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
                            프로젝트: {projects.filter(p => p.organization?.id === org.id).length}개
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            멤버: {org.memberCount || 0}명
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 테스트 통계 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                테스트 결과 분포
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
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                테스트 결과 상세
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
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 활동 내역 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                최근 활동
              </Typography>
              <List>
                {dashboardData.recentActivity.map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    divider={index < dashboardData.recentActivity.length - 1}
                  >
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {activity.user.avatar}
                          </Avatar>
                          <Typography variant="body2">
                            <strong>{activity.user.name}</strong>이(가) {activity.message}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(activity.timestamp)}
                          </Typography>
                          {activity.organizationName && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              • {activity.organizationName}
                            </Typography>
                          )}
                          {activity.projectName && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              • {activity.projectName}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                활발한 멤버
              </Typography>
              <List>
                {dashboardData.memberActivity.map((member, index) => (
                  <ListItem key={index} divider={index < dashboardData.memberActivity.length - 1}>
                    <ListItemIcon>
                      <Avatar>{member.avatar}</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">{member.name}</Typography>
                          <Chip 
                            size="small" 
                            label={member.organizationName} 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            테스트: {member.tests}개
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            프로젝트: {member.projects}개
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default OrganizationDashboard;