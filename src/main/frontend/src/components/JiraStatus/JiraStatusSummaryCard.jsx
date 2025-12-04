// src/main/frontend/src/components/JiraStatus/JiraStatusSummaryCard.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    LinearProgress,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Grid,
    Link,
    CircularProgress,
    Alert,
    Divider,
    Avatar,
    Badge,
    ButtonGroup,
    Button
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    OpenInNew as OpenInNewIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Pending as PendingIcon,
    Sync as SyncIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';

/**
 * ICT-189: JIRA 상태 요약 카드 컴포넌트
 * JIRA 이슈와 연결된 테스트 결과 정보를 표시하는 UI 컴포넌트
 */
const JiraStatusSummaryCard = ({
    jiraStatusData,
    onRefresh,
    onFilter,
    loading = false,
    error = null,
    showActions = true,
    compact = false
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const { t } = useTranslation();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleRefresh = () => {
        handleMenuClose();
        if (onRefresh) {
            onRefresh();
        }
    };

    const handleOpenJira = (jiraUrl) => {
        if (jiraUrl) {
            window.open(jiraUrl, '_blank');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'done':
            case 'resolved':
            case 'closed':
                return 'success';
            case 'in progress':
            case 'in review':
                return 'info';
            case 'blocked':
            case 'error':
                return 'error';
            case 'to do':
            case 'open':
                return 'default';
            default:
                return 'default';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'highest':
            case 'high':
                return <ErrorIcon color="error" fontSize="small" />;
            case 'medium':
                return <WarningIcon color="warning" fontSize="small" />;
            case 'low':
            case 'lowest':
                return <CheckCircleIcon color="success" fontSize="small" />;
            default:
                return <PendingIcon color="action" fontSize="small" />;
        }
    };

    const getSyncStatusIcon = (syncStatus) => {
        switch (syncStatus?.toLowerCase()) {
            case 'synced':
                return <CheckCircleIcon color="success" fontSize="small" />;
            case 'failed':
                return <ErrorIcon color="error" fontSize="small" />;
            case 'in_progress':
                return <SyncIcon color="info" fontSize="small" />;
            default:
                return <PendingIcon color="action" fontSize="small" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const calculateProgressValue = (distribution) => {
        if (!distribution) return 0;

        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return 0;

        const passed = distribution.PASS || 0;
        return (passed / total) * 100;
    };

    const filteredData = jiraStatusData?.filter(item => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return item.isActiveIssue;
        if (filterStatus === 'failed') return item.hasFailedTests;
        if (filterStatus === 'passed') return item.allTestsPassed;
        return true;
    }) || [];

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            {t('jira.summary.loadingData')}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        {t('jira.summary.error', { error })}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!jiraStatusData || jiraStatusData.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="info">
                        {t('jira.summary.noData')}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                {/* 헤더 */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                        {t('jira.summary.title')}
                        <Badge badgeContent={filteredData.length} color="primary" sx={{ ml: 1 }} />
                    </Typography>

                    {showActions && (
                        <Box>
                            {/* 필터 버튼 */}
                            <ButtonGroup size="small" sx={{ mr: 1 }}>
                                <Button
                                    variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterStatus('all')}
                                >
                                    {t('jira.summary.filterAll')}
                                </Button>
                                <Button
                                    variant={filterStatus === 'active' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterStatus('active')}
                                >
                                    {t('jira.summary.filterInProgress')}
                                </Button>
                                <Button
                                    variant={filterStatus === 'failed' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterStatus('failed')}
                                >
                                    {t('jira.summary.filterFailed')}
                                </Button>
                                <Button
                                    variant={filterStatus === 'passed' ? 'contained' : 'outlined'}
                                    onClick={() => setFilterStatus('passed')}
                                >
                                    {t('jira.summary.filterPassed')}
                                </Button>
                            </ButtonGroup>

                            {/* 메뉴 버튼 */}
                            <IconButton size="small" onClick={handleMenuOpen}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleRefresh}>
                                    <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
                                    {t('jira.summary.refresh')}
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Box>

                {/* JIRA 이슈 목록 */}
                <Grid container spacing={2}>
                    {filteredData.map((item, index) => (
                        <Grid size={{ xs: 12, md: compact ? 12 : 6 }} key={item.jiraIssueKey || index}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 2 }}>
                                    {/* 이슈 헤더 */}
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Box flex={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Link
                                                    href="#"
                                                    onClick={() => handleOpenJira(item.jiraIssueUrl)}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        textDecoration: 'none',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                >
                                                    {item.jiraIssueKey}
                                                </Link>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenJira(item.jiraIssueUrl)}
                                                >
                                                    <OpenInNewIcon fontSize="small" />
                                                </IconButton>
                                                {getPriorityIcon(item.priority)}
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {item.summary}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* 상태 칩들 */}
                                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                                        <Chip
                                            label={item.currentStatus}
                                            color={getStatusColor(item.currentStatus)}
                                            size="small"
                                        />
                                        <Chip
                                            label={item.issueType}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <Chip
                                            icon={getSyncStatusIcon(item.syncStatus)}
                                            label={item.syncStatus || 'NOT_SYNCED'}
                                            size="small"
                                            color={item.syncStatus === 'SYNCED' ? 'success' :
                                                item.syncStatus === 'FAILED' ? 'error' : 'default'}
                                        />
                                    </Box>

                                    {/* 테스트 결과 진행률 */}
                                    <Box mb={2}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('jira.summary.testResultsCount', { count: item.linkedTestCount })}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {Math.round(item.successRate || 0)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculateProgressValue(item.testResultDistribution)}
                                            color={item.successRate >= 80 ? 'success' :
                                                item.successRate >= 60 ? 'warning' : 'error'}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    {/* 테스트 결과 분포 */}
                                    {item.testResultDistribution && (
                                        <Box mb={2}>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                {Object.entries(item.testResultDistribution).map(([status, count]) => (
                                                    <Chip
                                                        key={status}
                                                        label={`${status}: ${count}`}
                                                        size="small"
                                                        variant="outlined"
                                                        color={
                                                            status === 'PASS' ? 'success' :
                                                                status === 'FAIL' ? 'error' :
                                                                    status === 'BLOCKED' ? 'warning' : 'default'
                                                        }
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 1 }} />

                                    {/* 최근 테스트 정보 */}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {t('jira.summary.latestTest')} {item.latestTestResult}
                                            {item.latestExecutor && ` (${item.latestExecutor})`}
                                        </Typography>
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            {t('jira.summary.executionTime')} {formatDate(item.latestTestDate)}
                                        </Typography>
                                        {item.lastSyncAt && (
                                            <>
                                                <br />
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('jira.summary.sync')} {formatDate(item.lastSyncAt)}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>

                                    {/* 동기화 오류 메시지 */}
                                    {item.syncError && (
                                        <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
                                            {item.syncError}
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* 요약 통계 */}
                {!compact && (
                    <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
                        <Typography variant="subtitle2" gutterBottom>
                            {t('jira.summary.summaryStats')}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('jira.summary.totalIssues')}
                                </Typography>
                                <Typography variant="h6">
                                    {jiraStatusData.length}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('jira.summary.connectedResults')}
                                </Typography>
                                <Typography variant="h6">
                                    {jiraStatusData.filter(item => item.isActiveIssue).length}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('jira.summary.hasNoFailed')}
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                    {jiraStatusData.filter(item => item.allTestsPassed).length}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('jira.summary.hasFailed')}
                                </Typography>
                                <Typography variant="h6" color="error.main">
                                    {jiraStatusData.filter(item => item.hasFailedTests).length}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default JiraStatusSummaryCard;