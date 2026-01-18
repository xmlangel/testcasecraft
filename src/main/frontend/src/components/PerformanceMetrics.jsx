// src/components/PerformanceMetrics.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    LinearProgress,
    Chip,
    useTheme,
    alpha,
    Divider
} from '@mui/material';
import {
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    TrendingUp as TrendingUpIcon,
    Cached as CachedIcon,
    Timer as TimerIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import CountUp from 'react-countup';
import StyledDashboardPaper from './common/StyledDashboardPaper';
import { useI18n } from '../context/I18nContext';

const PerformanceMetricCard = ({ title, value, unit, icon, color = 'primary', loading = false }) => {
    const theme = useTheme();

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div">
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <>
                                    <CountUp end={value} duration={1} decimals={value < 10 ? 1 : 0} />
                                    {unit && <Typography component="span" variant="h6" color="text.secondary"> {unit}</Typography>}
                                </>
                            )}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: alpha(theme.palette[color].main, 0.1),
                            borderRadius: 2,
                            p: 1.5,
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

const PerformanceMetrics = () => {
    const theme = useTheme();
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [metrics, setMetrics] = useState(null);
    const [systemResources, setSystemResources] = useState(null);
    const [usageMetrics, setUsageMetrics] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            setError('');

            // 대시보드 메트릭 조회
            const metricsResponse = await fetch('/api/monitoring/metrics/dashboard');
            if (!metricsResponse.ok) {
                throw new Error('Failed to load metrics');
            }
            const metricsData = await metricsResponse.json();

            // 시스템 리소스 조회
            const resourcesResponse = await fetch('/api/monitoring/system/resources');
            if (!resourcesResponse.ok) {
                throw new Error('Failed to load system resources');
            }
            const resourcesData = await resourcesResponse.json();

            // 사용량 메트릭 조회
            try {
                const usageResponse = await fetch('/api/monitoring/usage/page-visits');
                if (usageResponse.ok) {
                    const usageData = await usageResponse.json();
                    setUsageMetrics(usageData);
                }
            } catch (err) {
                console.warn('Failed to load usage metrics:', err);
            }

            setMetrics(metricsData);
            setSystemResources(resourcesData);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || t('performance.error.loadFailed', '성능 메트릭을 불러오는데 실패했습니다.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();

        // 30초마다 자동 새로고침
        const interval = setInterval(() => {
            loadMetrics();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading && !metrics) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
                <Chip
                    label={t('performance.button.retry', '다시 시도')}
                    size="small"
                    onClick={loadMetrics}
                    sx={{ ml: 2, cursor: 'pointer' }}
                />
            </Alert>
        );
    }

    // 캐시 메트릭 데이터 추출
    const cacheMetrics = metrics?.cacheMetrics || {};
    const projectCache = cacheMetrics.projectCache || {};
    const testCaseCache = cacheMetrics.testCaseCache || {};

    // 시스템 리소스 데이터 추출
    const cpu = systemResources?.cpuUsage || 0;
    const memory = systemResources?.memoryUsage || 0;
    const diskSpace = systemResources?.diskUsage || 0;

    // 성능 지표 데이터
    const avgResponseTime = metrics?.performanceMetrics?.averageResponseTime || 0;
    const requestsPerSecond = metrics?.performanceMetrics?.requestsPerSecond || 0;
    const activeConnections = metrics?.performanceMetrics?.activeConnections || 0;

    return (
        <Box>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                    {t('performance.title', '시스템 성능 메트릭')}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    {lastUpdated && (
                        <Chip
                            label={t('performance.lastUpdated', '최근 업데이트: {time}').replace('{time}', lastUpdated.toLocaleTimeString('ko-KR'))}
                            size="small"
                            variant="outlined"
                        />
                    )}
                    <Chip
                        icon={<RefreshIcon />}
                        label={t('performance.refresh', '새로고침')}
                        size="small"
                        color="primary"
                        onClick={loadMetrics}
                        sx={{ cursor: 'pointer' }}
                    />
                </Box>
            </Box>

            {/* 시스템 리소스 */}
            <StyledDashboardPaper sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {t('performance.systemResources', '시스템 리소스')}
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PerformanceMetricCard
                            title={t('performance.cpu', 'CPU 사용률')}
                            value={cpu}
                            unit="%"
                            icon={<SpeedIcon />}
                            color="primary"
                            loading={loading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PerformanceMetricCard
                            title={t('performance.memory', '메모리 사용률')}
                            value={memory}
                            unit="%"
                            icon={<MemoryIcon />}
                            color="warning"
                            loading={loading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PerformanceMetricCard
                            title={t('performance.disk', '디스크 사용률')}
                            value={diskSpace}
                            unit="%"
                            icon={<StorageIcon />}
                            color="error"
                            loading={loading}
                        />
                    </Grid>
                </Grid>
            </StyledDashboardPaper>

            {/* 캐시 성능 */}
            <StyledDashboardPaper sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {t('performance.cache', '캐시 성능')}
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('performance.cache.project', '프로젝트 캐시')}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2">{t('performance.cache.hitRate', '적중률')}</Typography>
                                <Typography variant="h6">{(projectCache.hitRate || 0).toFixed(1)}%</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={projectCache.hitRate || 0}
                                sx={{
                                    height: 8,
                                    borderRadius: 5,
                                    mb: 2,
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: theme.palette.success.main,
                                    },
                                }}
                            />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">{t('performance.cache.hit', '적중')}</Typography>
                                        <Typography variant="h6">{projectCache.hitCount || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">{t('performance.cache.miss', '누락')}</Typography>
                                        <Typography variant="h6">{projectCache.missCount || 0}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {t('performance.cache.testcase', '테스트케이스 캐시')}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2">{t('performance.cache.hitRate', '적중률')}</Typography>
                                <Typography variant="h6">{(testCaseCache.hitRate || 0).toFixed(1)}%</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={testCaseCache.hitRate || 0}
                                sx={{
                                    height: 8,
                                    borderRadius: 5,
                                    mb: 2,
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: theme.palette.info.main,
                                    },
                                }}
                            />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">{t('performance.cache.hit', '적중')}</Typography>
                                        <Typography variant="h6">{testCaseCache.hitCount || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">{t('performance.cache.miss', '누락')}</Typography>
                                        <Typography variant="h6">{testCaseCache.missCount || 0}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </StyledDashboardPaper>

            {/* 애플리케이션 성능 */}
            <StyledDashboardPaper>
                <Typography variant="h6" gutterBottom>
                    {t('performance.application', '애플리케이션 성능')}
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PerformanceMetricCard
                            title={t('performance.avgResponseTime', '평균 응답 시간')}
                            value={avgResponseTime}
                            unit="ms"
                            icon={<TimerIcon />}
                            color="info"
                            loading={loading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PerformanceMetricCard
                            title={t('performance.requestsPerSecond', '초당 요청 수')}
                            value={requestsPerSecond}
                            unit="req/s"
                            icon={<TrendingUpIcon />}
                            color="success"
                            loading={loading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PerformanceMetricCard
                            title={t('performance.activeConnections', '활성 연결')}
                            value={activeConnections}
                            unit=""
                            icon={<CachedIcon />}
                            color="secondary"
                            loading={loading}
                        />
                    </Grid>
                </Grid>
            </StyledDashboardPaper>

            {/* 사용량 요약 */}
            {usageMetrics && (
                <StyledDashboardPaper sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('performance.usage', '사용량 요약')}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('performance.usage.todayVisits', '오늘 방문')}
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    <CountUp end={usageMetrics.totalDailyVisits || 0} duration={1} />
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('performance.usage.uniqueVisitors', '오늘 고유 방문자')}
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    <CountUp end={usageMetrics.totalUniqueVisitors || 0} duration={1} />
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('performance.usage.activeSessions', '활성 세션')}
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    <CountUp end={usageMetrics.activeVisitors || 0} duration={1} />
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('performance.usage.recentMinutes', '최근 {minutes}분 기준').replace('{minutes}', usageMetrics.rollingDayWindowMinutes || 10)}
                                </Typography>
                            </Box>
                        </Grid>

                        {usageMetrics.pages && usageMetrics.pages.length > 0 && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                                    {t('performance.usage.topPages', '상위 페이지')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {usageMetrics.pages.slice(0, 5).map((page) => (
                                        <Box
                                            key={page.pagePath}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                bgcolor: 'background.default',
                                                borderRadius: 1
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {page.pagePath}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {page.dailyCount}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('performance.usage.totalAccumulated', '누적 {total}').replace('{total}', page.totalCount)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {usageMetrics.dailySummaries && usageMetrics.dailySummaries.length > 0 && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                                    {t('performance.usage.dailySummary', '일별 방문 요약')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {usageMetrics.dailySummaries.slice(0, 5).map((summary) => (
                                        <Box
                                            key={summary.date}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                bgcolor: 'background.default',
                                                borderRadius: 1
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {summary.date}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {summary.totalVisits}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('performance.usage.uniqueCount', '고유 {count}').replace('{count}', summary.uniqueVisitors)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </StyledDashboardPaper>
            )}
        </Box>
    );
};

export default PerformanceMetrics;
