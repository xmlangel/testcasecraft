import React from 'react';
import PropTypes from "prop-types";
import { Box, Typography, Paper, Divider, Chip, LinearProgress, Button } from "@mui/material";
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
        <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
                {t('testExecution.form.executionInfo')}
            </Typography>
            <Box sx={{ mb: 2 }}>
                <StatusInfoItem label={t('testExecution.form.status')} value={execution?.status || "-"} />
                <StatusInfoItem
                    label={t('testExecution.form.startDate')}
                    value={formatDateSafe(execution?.startDate)}
                />
                <StatusInfoItem
                    label={t('testExecution.form.endDate')}
                    value={formatDateSafe(execution?.endDate)}
                />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Chip icon={<CheckCircleIcon sx={{ color: RESULT_COLORS.PASS }} />} label={`Pass: ${statusCounts.PASS}`} sx={{ bgcolor: alpha(RESULT_COLORS.PASS, 0.1) }} />
                <Chip icon={<CancelIcon sx={{ color: RESULT_COLORS.FAIL }} />} label={`Fail: ${statusCounts.FAIL}`} sx={{ bgcolor: alpha(RESULT_COLORS.FAIL, 0.1) }} />
                <Chip icon={<HourglassEmptyIcon sx={{ color: RESULT_COLORS.NOTRUN }} />} label={`NotRun: ${statusCounts.NOTRUN}`} sx={{ bgcolor: alpha(RESULT_COLORS.NOTRUN, 0.1) }} />
                <Chip icon={<BlockIcon sx={{ color: RESULT_COLORS.BLOCKED }} />} label={`Blocked: ${statusCounts.BLOCKED}`} sx={{ bgcolor: alpha(RESULT_COLORS.BLOCKED, 0.1) }} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    {t('testExecution.form.totalCount', { count: statusCounts.total })}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ minWidth: 70 }}>
                    {t('testExecution.form.progress')}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ flex: 1, height: 10, borderRadius: 4, minWidth: 80 }}
                />
                <Typography variant="body2" sx={{ minWidth: 40, ml: 1 }}>
                    {progress}%
                </Typography>
            </Box>
            {canStartExecution && (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartExecution}
                    disabled={saving}
                    sx={{ ml: 2 }}
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
                    sx={{ ml: 2 }}
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
                    sx={{ ml: 2 }}
                >
                    {t('testExecution.actions.restartExecution')}
                </Button>
            )}
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
