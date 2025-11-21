import React from 'react';
import PropTypes from "prop-types";
import { Box, Button, Typography, Divider, CircularProgress } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { useTranslation } from '../../context/I18nContext.jsx';
import TestExecutionGuide from './TestExecutionGuide.jsx';

const TestExecutionHeader = ({
    executionId,
    executionName,
    onCancel,
    onGoToList,
    onSaveOrUpdate,
    saving,
    canEditBasicInfo,
    startImmediately,
    showExecutionGuide,
    setShowExecutionGuide
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="h5" sx={{ flex: 1, minWidth: 200, fontWeight: "bold", color: "#1976d2" }}>
                    {executionId ? (
                        <>{t('testExecution.form.editTitle', { name: executionName })}
                        </>) : (
                        t('testExecution.form.registerTitle')
                    )}
                </Typography>
                {!executionId && (
                    <Button
                        onClick={() => setShowExecutionGuide(!showExecutionGuide)}
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        sx={{ mr: 1 }}
                    >
                        {showExecutionGuide ? t('testExecution.guide.hideGuide') : t('testExecution.guide.showGuide')}
                    </Button>
                )}
                <Button onClick={onGoToList} sx={{ mr: 1 }}>
                    {t('common.list')}
                </Button>
                <Button onClick={onCancel} sx={{ mr: 1 }}>
                    {t('common.cancel')}
                </Button>
                {canEditBasicInfo && (
                    <Button
                        onClick={onSaveOrUpdate}
                        variant="contained"
                        color="primary"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : null}
                    >
                        {startImmediately ? t('testExecution.form.saveAndStart') : t('common.save')}
                    </Button>
                )}
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* 테스트 실행 절차 안내 */}
            <TestExecutionGuide
                open={showExecutionGuide}
                onClose={() => setShowExecutionGuide(false)}
            />
        </>
    );
};

TestExecutionHeader.propTypes = {
    executionId: PropTypes.string,
    executionName: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onGoToList: PropTypes.func.isRequired,
    onSaveOrUpdate: PropTypes.func.isRequired,
    saving: PropTypes.bool,
    canEditBasicInfo: PropTypes.bool,
    startImmediately: PropTypes.bool,
    showExecutionGuide: PropTypes.bool,
    setShowExecutionGuide: PropTypes.func.isRequired,
};

export default TestExecutionHeader;
