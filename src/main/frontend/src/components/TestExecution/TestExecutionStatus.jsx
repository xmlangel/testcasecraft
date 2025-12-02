import React from 'react';
import PropTypes from "prop-types";
import { Box, Typography, Paper, Chip, LinearProgress, Button } from "@mui/material";
import { alpha } from '@mui/material/styles';
import {
    PlayArrow as PlayArrowIcon,
    Check as CheckIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    HourglassEmpty as HourglassEmptyIcon,
    Block as BlockIcon,
} from "@mui/icons-material";
import { useTranslation } from '../../context/I18nContext.jsx';
import StatusInfoItem from "../StatusInfoItem.jsx";
import { formatDateSafe } from '../../utils/dateUtils';
import { RESULT_COLORS } from '../../constants/statusColors';

const TestExecutionStatus = ({
    execution,
    statusCounts,
    progress,
    canStartExecution,
    canCompleteExecution,
    canRestartExecution,
    handleStartExecution,
    handleCompleteExecution,
    handleRestartExecution,
    saving
}) => {
    const { t } = useTranslation();

    return (
        <Paper variant="outlined" sx={{ p: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Box sx={{ display: "flex", gap: 3, mb: 1, alignItems: "center" }}>
                <StatusInfoItem label={t('testExecution.form.status')} value={execution?.status || "-"} compact />
                <StatusInfoItem
                    label={t('testExecution.form.startDate')}
                    value={formatDateSafe(execution?.startDate)}
                    compact
                />
                <StatusInfoItem
                    label={t('testExecution.form.endDate')}
                    value={formatDateSafe(execution?.endDate)}
                    compact
                />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip icon={<CheckCircleIcon sx={{ color: RESULT_COLORS.PASS, fontSize: '1rem' }} />} label={`Pass: ${statusCounts.PASS}`} size="small" sx={{ bgcolor: alpha(RESULT_COLORS.PASS, 0.1), height: 24 }} />
                    <Chip icon={<CancelIcon sx={{ color: RESULT_COLORS.FAIL, fontSize: '1rem' }} />} label={`Fail: ${statusCounts.FAIL}`} size="small" sx={{ bgcolor: alpha(RESULT_COLORS.FAIL, 0.1), height: 24 }} />
                    <Chip icon={<HourglassEmptyIcon sx={{ color: RESULT_COLORS.NOTRUN, fontSize: '1rem' }} />} label={`NotRun: ${statusCounts.NOTRUN}`} size="small" sx={{ bgcolor: alpha(RESULT_COLORS.NOTRUN, 0.1), height: 24 }} />
                    <Chip icon={<BlockIcon sx={{ color: RESULT_COLORS.BLOCKED, fontSize: '1rem' }} />} label={`Blocked: ${statusCounts.BLOCKED}`} size="small" sx={{ bgcolor: alpha(RESULT_COLORS.BLOCKED, 0.1), height: 24 }} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                        {t('testExecution.form.totalCount', { count: statusCounts.total })}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 200, maxWidth: 400 }}>
                    <Typography variant="caption" sx={{ minWidth: 50 }}>
                        {t('testExecution.form.progress')}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" sx={{ minWidth: 35, textAlign: 'right' }}>
                        {progress}%
                    </Typography>
                </Box>

                <Box>
                    {canStartExecution && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleStartExecution}
                            disabled={saving}
                            size="small"
                        >
                            {t('testExecution.actions.startExecution')}
                        </Button>
                    )}
                    {canCompleteExecution && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={handleCompleteExecution}
                            disabled={saving}
                            size="small"
                        >
                            {t('testExecution.actions.completeExecution')}
                        </Button>
                    )}
                    {canRestartExecution && (
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleRestartExecution}
                            disabled={saving}
                            size="small"
                        >
                            {t('testExecution.actions.restartExecution')}
                        </Button>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

TestExecutionStatus.propTypes = {
    execution: PropTypes.object,
    statusCounts: PropTypes.object.isRequired,
    progress: PropTypes.number.isRequired,
    canStartExecution: PropTypes.bool,
    canCompleteExecution: PropTypes.bool,
    canRestartExecution: PropTypes.bool,
    handleStartExecution: PropTypes.func.isRequired,
    handleCompleteExecution: PropTypes.func.isRequired,
    handleRestartExecution: PropTypes.func.isRequired,
    saving: PropTypes.bool,
};

export default TestExecutionStatus;
