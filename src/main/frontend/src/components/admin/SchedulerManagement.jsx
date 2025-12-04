import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Switch,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
    Edit as EditIcon,
    PlayArrow as PlayIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useScheduler } from '../../context/SchedulerContext';
import { useI18n } from '../../context/I18nContext';
import { useAppContext } from '../../context/AppContext';
import SchedulerConfigDialog from './SchedulerConfigDialog';

/**
 * 스케줄러 관리 메인 페이지
 */
const SchedulerManagement = () => {
    const { t } = useI18n();
    const { user } = useAppContext();
    const { configs, loading, error, fetchConfigs, toggleEnabled, executeNow } = useScheduler();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    // 현재 시간 업데이트 (매초)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleEdit = (config) => {
        setSelectedConfig(config);
        setEditDialogOpen(true);
    };

    const handleToggleEnabled = async (taskKey) => {
        try {
            await toggleEnabled(taskKey);
            setSuccessMessage(t('scheduler.status.changed', '스케줄 상태가 변경되었습니다.'));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    const handleExecuteNow = async (taskKey, taskName) => {
        if (!window.confirm(t('scheduler.confirm.execute', '"{taskName}" 작업을 즉시 실행하시겠습니까?').replace('{taskName}', taskName))) {
            return;
        }

        try {
            await executeNow(taskKey);
            setSuccessMessage(t('scheduler.task.executed', '작업이 실행되었습니다.'));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Execute failed:', err);
        }
    };

    const handleRefresh = () => {
        fetchConfigs();
    };

    const formatScheduleExpression = (config) => {
        if (!config || !config.scheduleType) {
            return 'N/A';
        }
        if (config.scheduleType === 'CRON') {
            return config.cronExpression || 'N/A';
        } else if (config.scheduleType === 'FIXED_RATE') {
            return `${formatMilliseconds(config.fixedRateMs)} (Fixed Rate)`;
        } else if (config.scheduleType === 'FIXED_DELAY') {
            return `${formatMilliseconds(config.fixedDelayMs)} (Fixed Delay)`;
        }
        return 'N/A';
    };

    const formatMilliseconds = (ms) => {
        if (!ms) return 'N/A';
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return t('scheduler.time.seconds', '{seconds}초').replace('{seconds}', seconds);
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('scheduler.time.minutes', '{minutes}분').replace('{minutes}', minutes);
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('scheduler.time.hours', '{hours}시간').replace('{hours}', hours);
        const days = Math.floor(hours / 24);
        return t('scheduler.time.days', '{days}일').replace('{days}', days);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';

        try {
            let date;

            // Java LocalDateTime이 배열로 올 경우: [year, month, day, hour, minute, second]
            if (Array.isArray(dateString)) {
                const [year, month, day, hour, minute, second] = dateString;
                date = new Date(year, month - 1, day, hour, minute, second || 0);
            } else {
                // ISO 문자열 형식
                date = new Date(dateString);
            }

            // 사용자의 타임존 설정 사용 (기본값: 'Asia/Seoul')
            const timezone = user?.timeZone || user?.timezone || 'Asia/Seoul';

            return date.toLocaleString('ko-KR', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch (err) {
            console.error('Date parsing error:', err, dateString);
            return '-';
        }
    };

    const columns = [
        {
            field: 'taskName',
            headerName: t('scheduler.column.taskName', '작업 이름'),
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'scheduleExpression',
            headerName: t('scheduler.column.scheduleExpression', '스케줄 표현식'),
            flex: 1,
            minWidth: 200,
            // 백엔드에서 이미 계산된 scheduleExpression 사용
        },
        {
            field: 'scheduleType',
            headerName: t('scheduler.column.type', '타입'),
            width: 120,
            renderCell: (params) => params?.value ? (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'CRON' ? 'primary' : 'secondary'}
                />
            ) : <span>-</span>,
        },
        {
            field: 'nextExecutionTime',
            headerName: t('scheduler.column.nextExecution', '다음 실행'),
            width: 180,
            valueGetter: (params) => params?.value ? formatDateTime(params.value) : '-',
        },
        {
            field: 'lastExecutionTime',
            headerName: t('scheduler.column.lastExecution', '마지막 실행'),
            width: 180,
            valueGetter: (params) => params?.value ? formatDateTime(params.value) : '-',
        },
        {
            field: 'lastExecutionStatus',
            headerName: t('scheduler.column.status', '상태'),
            width: 100,
            renderCell: (params) => {
                if (!params.value) return '-';
                const color = params.value === 'SUCCESS' ? 'success' : 'error';
                return <Chip label={params.value} size="small" color={color} />;
            },
        },
        {
            field: 'enabled',
            headerName: t('scheduler.column.enabled', '활성화'),
            width: 100,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() => handleToggleEnabled(params.row.taskKey)}
                    color="primary"
                />
            ),
        },
        {
            field: 'actions',
            headerName: t('scheduler.column.actions', '작업'),
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('scheduler.tooltip.edit', '편집')}>
                        <IconButton
                            size="small"
                            onClick={() => handleEdit(params.row)}
                            color="primary"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('scheduler.tooltip.execute', '즉시 실행')}>
                        <IconButton
                            size="small"
                            onClick={() => handleExecuteNow(params.row.taskKey, params.row.taskName)}
                            color="success"
                            disabled={!params.row.enabled}
                        >
                            <PlayIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const CustomToolbar = () => (
        <GridToolbarContainer sx={{ p: 2, justifyContent: 'space-between' }}>
            <GridToolbarQuickFilter />
            <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                variant="outlined"
                size="small"
            >
                {t('scheduler.refresh', '새로고침')}
            </Button>
        </GridToolbarContainer>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {t('scheduler.title', '스케줄러 관리')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('scheduler.description', '백그라운드 작업의 실행 시간을 동적으로 관리합니다. Cron 표현식을 변경하면 서버 재시작 없이 즉시 반영됩니다.')}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t('scheduler.currentTime', '현재 시간 ({timezone})').replace('{timezone}', user?.timeZone || user?.timezone || 'Asia/Seoul')}
                        </Typography>
                        <Chip
                            label={currentTime.toLocaleString('ko-KR', {
                                timeZone: user?.timeZone || user?.timezone || 'Asia/Seoul',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })}
                            color="primary"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                <Box sx={{ height: 600, width: '100%' }}>
                    {loading && configs.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DataGrid
                            rows={configs}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            disableSelectionOnClick
                            slots={{
                                toolbar: CustomToolbar,
                            }}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    padding: '8px',
                                },
                            }}
                        />
                    )}
                </Box>
            </Paper>

            {selectedConfig && (
                <SchedulerConfigDialog
                    open={editDialogOpen}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setSelectedConfig(null);
                    }}
                    config={selectedConfig}
                    onSuccess={(message) => {
                        setSuccessMessage(message);
                        setTimeout(() => setSuccessMessage(''), 3000);
                        fetchConfigs();
                    }}
                />
            )}
        </Box>
    );
};

export default SchedulerManagement;
