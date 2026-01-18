import React from 'react';
import PropTypes from "prop-types";
import { Box, Button, Typography, Collapse, Alert, useTheme } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from '../../context/I18nContext.jsx';

const TestExecutionGuide = ({ open, onClose }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const steps = [
        {
            title: t('testExecution.guide.step1.title'),
            description: t('testExecution.guide.step1.description')
        },
        {
            title: t('testExecution.guide.step2.title'),
            description: t('testExecution.guide.step2.description')
        },
        {
            title: t('testExecution.guide.step3.title'),
            description: t('testExecution.guide.step3.description')
        },
        {
            title: t('testExecution.guide.step4.title'),
            description: t('testExecution.guide.step4.description')
        },
        {
            title: t('testExecution.guide.step5.title'),
            description: t('testExecution.guide.step5.description')
        },
        {
            title: t('testExecution.guide.step6.title'),
            description: t('testExecution.guide.step6.description')
        }
    ];

    return (
        <Collapse in={open}>
            <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={onClose}
                        startIcon={<CloseIcon />}
                    >
                        {t('common.close')}
                    </Button>
                }
            >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                    {t('testExecution.guide.title')}
                </Typography>
                {steps.map((step, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                            {step.title}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                            {step.description}
                        </Typography>
                    </Box>
                ))}
            </Alert>
        </Collapse>
    );
};

TestExecutionGuide.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TestExecutionGuide;
