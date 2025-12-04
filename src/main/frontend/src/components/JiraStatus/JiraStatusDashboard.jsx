// src/main/frontend/src/components/JiraStatus/JiraStatusDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Tab,
    Tabs,
    Switch,
    FormControlLabel,
    Chip,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Assessment as AssessmentIcon,
    Bug as BugIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';

import { AppContext } from '../../context/AppContext';
import { useJiraStatusSummary, useJiraStatusStatistics } from '../../hooks/useJiraStatus';
import JiraStatusSummaryCard from './JiraStatusSummaryCard';

/**
 * ICT-189: JIRA 상태 대시보드
 * 프로젝트의 모든 JIRA 연동 상태를 종합적으로 표시하는 대시보드 컴포넌트
 */
const JiraStatusDashboard = () => {
    const { selectedProject } = useContext(AppContext);
    const [tabValue, setTabValue] = useState(0);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

    // JIRA 상태 요약 데이터
    const {
        data: jiraStatusData,
        loading: statusLoading,
        error: statusError,
        lastUpdated: statusLastUpdated,
        refresh: refreshStatus
    } = useJiraStatusSummary(selectedProject?.id, {
        autoRefresh: autoRefreshEnabled,
        refreshInterval: 5 * 60 * 1000, // 5분
        useCache: true
    });

    // JIRA 상태 통계 데이터
    const {
        data: statisticsData,
        loading: statisticsLoading,
        error: statisticsError,
        lastUpdated: statisticsLastUpdated,
        reload: reloadStatistics
    } = useJiraStatusStatistics(selectedProject?.id, {
        autoRefresh: autoRefreshEnabled,
        refreshInterval: 2 * 60 * 1000, // 2분
        useCache: true
    });

    /**
     * 전체 새로고침
     */
    const handleRefreshAll = () => {
        refreshStatus();
        reloadStatistics();
    };

    /**
     * 자동 새로고침 토글
     */
    const handleAutoRefreshToggle = (event) => {
        setAutoRefreshEnabled(event.target.checked);
    };

    /**
     * 탭 변경
     */
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    /**
     * 통계 카드 렌더링
     */
    const renderStatisticsCards = () => {
        if (!statisticsData) return null;

        return (
            <Grid container spacing={3}>
                {/* 전체 이슈 수 */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        전체 JIRA 이슈
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        {statisticsData.totalIssues || 0}
                                    </Typography>
                                </Box>
                                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 활성 이슈 수 */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        진행중 이슈
                                    </Typography>
                                    <Typography variant="h4" component="div">
                                        {statisticsData.activeIssues || 0}
                                    </Typography>
                                </Box>
                                <BugIcon color="info" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 모든 테스트 통과 */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        전체 통과
                                    </Typography>
                                    <Typography variant="h4" component="div" color="success.main">
                                        {statisticsData.issuesAllPassed || 0}
                                    </Typography>
                                </Box>
                                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 실패 포함 이슈 */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        실패 포함
                                    </Typography>
                                    <Typography variant="h4" component="div" color="error.main">
                                        {statisticsData.issuesWithFailures || 0}
                                    </Typography>
                                </Box>
                                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 상세 통계 */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                상태별 분포
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {statisticsData.statusDistribution && 
                                 Object.entries(statisticsData.statusDistribution).map(([status, count]) => (
                                    <Chip
                                        key={status}
                                        label={`${status}: ${count}`}
                                        color={
                                            status.toLowerCase().includes('done') ? 'success' :
                                            status.toLowerCase().includes('progress') ? 'info' :
                                            status.toLowerCase().includes('blocked') ? 'error' : 'default'
                                        }
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                우선순위별 분포
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {statisticsData.priorityDistribution && 
                                 Object.entries(statisticsData.priorityDistribution).map(([priority, count]) => (
                                    <Chip
                                        key={priority}
                                        label={`${priority}: ${count}`}
                                        color={
                                            priority.toLowerCase().includes('high') ? 'error' :
                                            priority.toLowerCase().includes('medium') ? 'warning' :
                                            priority.toLowerCase().includes('low') ? 'success' : 'default'
                                        }
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 동기화 상태 */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                동기화 상태 분포
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                {statisticsData.syncStatusDistribution && 
                                 Object.entries(statisticsData.syncStatusDistribution).map(([status, count]) => (
                                    <Chip
                                        key={status}
                                        label={`${status}: ${count}`}
                                        color={
                                            status === 'SYNCED' ? 'success' :
                                            status === 'FAILED' ? 'error' :
                                            status === 'IN_PROGRESS' ? 'info' : 'default'
                                        }
                                    />
                                ))}
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        연결된 총 테스트 수
                                    </Typography>
                                    <Typography variant="h5">
                                        {statisticsData.totalLinkedTests || 0}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        평균 성공률
                                    </Typography>
                                    <Typography variant="h5" color="primary">
                                        {statisticsData.averageSuccessRate || 0}%
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        마지막 업데이트
                                    </Typography>
                                    <Typography variant="body2">
                                        {statisticsLastUpdated ? 
                                            new Date(statisticsLastUpdated).toLocaleString('ko-KR') : 
                                            '-'
                                        }
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    /**
     * 탭 패널 렌더링
     */
    const renderTabPanel = (index) => {
        if (tabValue !== index) return null;

        switch (index) {
            case 0:
                // JIRA 상태 요약
                return (
                    <JiraStatusSummaryCard
                        jiraStatusData={jiraStatusData}
                        onRefresh={refreshStatus}
                        loading={statusLoading}
                        error={statusError?.message || statusError}
                        showActions={true}
                        compact={false}
                    />
                );
            
            case 1:
                // 통계
                if (statisticsLoading) {
                    return (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                            <CircularProgress />
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                통계 정보를 불러오는 중...
                            </Typography>
                        </Box>
                    );
                }
                
                if (statisticsError) {
                    return (
                        <Alert severity="error">
                            통계 정보를 불러오는데 실패했습니다: {statisticsError}
                        </Alert>
                    );
                }
                
                return renderStatisticsCards();
            
            default:
                return null;
        }
    };

    if (!selectedProject) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="info">
                    프로젝트를 선택해주세요.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* 헤더 */}
            <Box mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    JIRA 상태 대시보드
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{
                    marginBottom: "16px"
                }}>
                    {selectedProject.name} 프로젝트의 JIRA 연동 상태를 확인할 수 있습니다.
                </Typography>
                
                {/* 컨트롤 */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoRefreshEnabled}
                                    onChange={handleAutoRefreshToggle}
                                />
                            }
                            label="자동 새로고침"
                        />
                        {statusLastUpdated && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                마지막 업데이트: {new Date(statusLastUpdated).toLocaleString('ko-KR')}
                            </Typography>
                        )}
                    </Box>
                    
                    <Box>
                        <Chip
                            icon={<RefreshIcon />}
                            label="전체 새로고침"
                            onClick={handleRefreshAll}
                            clickable
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                </Box>
            </Box>
            {/* 탭 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="JIRA 이슈 목록" />
                    <Tab label="통계 및 분석" />
                </Tabs>
            </Paper>
            {/* 탭 내용 */}
            <Box>
                {renderTabPanel(tabValue)}
            </Box>
        </Container>
    );
};

export default JiraStatusDashboard;