// src/components/SchedulerList.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    alpha
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    AccessTime as AccessTimeIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import StyledDashboardPaper from './common/StyledDashboardPaper';

const SchedulerList = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [schedulerData, setSchedulerData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadSchedulerInfo = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/admin/scheduler/tasks');
            if (!response.ok) {
                throw new Error('Failed to load scheduler information');
            }
            const data = await response.json();

            setSchedulerData(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || '스케줄러 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedulerInfo();
    }, []);

    if (loading && !schedulerData) {
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
                    label="다시 시도"
                    size="small"
                    onClick={loadSchedulerInfo}
                    sx={{ ml: 2, cursor: 'pointer' }}
                />
            </Alert>
        );
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'CRON':
                return 'primary';
            case 'FIXED_RATE':
                return 'success';
            case 'FIXED_DELAY':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                    스케줄된 작업 목록
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    {lastUpdated && (
                        <Chip
                            label={`최근 업데이트: ${lastUpdated.toLocaleTimeString('ko-KR')}`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                    <Chip
                        icon={<RefreshIcon />}
                        label="새로고침"
                        size="small"
                        color="primary"
                        onClick={loadSchedulerInfo}
                        sx={{ cursor: 'pointer' }}
                    />
                </Box>
            </Box>

            {/* 요약 카드 */}
            <Grid container spacing={3} mb={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ScheduleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        총 스케줄 작업
                                    </Typography>
                                    <Typography variant="h4">
                                        {schedulerData?.totalTasks || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        활성 상태
                                    </Typography>
                                    <Typography variant="h5" color="success.main">
                                        정상 동작
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: 32, color: 'info.main' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        서버 시간대
                                    </Typography>
                                    <Typography variant="body1">
                                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 스케줄러 테이블 */}
            <StyledDashboardPaper>
                <Typography variant="h6" gutterBottom>
                    스케줄 상세 정보
                </Typography>
                {schedulerData?.note && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {schedulerData.note}
                    </Alert>
                )}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>작업 이름</strong></TableCell>
                                <TableCell><strong>스케줄</strong></TableCell>
                                <TableCell><strong>타입</strong></TableCell>
                                <TableCell><strong>설명</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {schedulerData?.tasks?.map((task, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight={600}>
                                            {task.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {task.method}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {task.schedule}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={task.type}
                                            size="small"
                                            color={getTypeColor(task.type)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {task.description}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledDashboardPaper>
        </Box>
    );
};

export default SchedulerList;
