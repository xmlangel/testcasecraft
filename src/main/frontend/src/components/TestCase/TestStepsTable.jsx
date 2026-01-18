// src/components/TestCase/TestStepsTable.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

/**
 * 테스트 스텝 테이블 컴포넌트
 */
const TestStepsTable = ({
    steps,
    errors,
    isViewer,
    t,
    theme,
    onAddStep,
    onDeleteStep,
    onMoveStep,
    onStepMarkdownChange,
    onMarkdownPaste,
}) => {
    return (
        <Box sx={{ mt: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                    {t('testcase.form.testSteps', '테스트 스텝')}
                </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                width={10}
                                sx={{
                                    width: 10,
                                    minWidth: 10,
                                    maxWidth: 15,
                                    textAlign: 'center',
                                    p: 0.5,
                                }}
                            >
                                {t('testcase.form.stepNumber', 'No.')}
                            </TableCell>
                            <TableCell
                                sx={{
                                    width: '50%',
                                    minWidth: 120,
                                    maxWidth: 'none',
                                }}
                            >
                                {t('testcase.form.step', 'Step')}
                            </TableCell>
                            <TableCell
                                sx={{
                                    width: '50%',
                                    minWidth: 120,
                                    maxWidth: 'none',
                                }}
                            >
                                {t('testcase.form.expected', 'Expected')}
                            </TableCell>
                            {!isViewer && (
                                <TableCell
                                    width={50}
                                    sx={{
                                        width: 50,
                                        minWidth: 45,
                                        maxWidth: 60,
                                        textAlign: 'center',
                                        p: 0.5,
                                    }}
                                >
                                    {t('testcase.form.reorder', '순서')}
                                </TableCell>
                            )}
                            <TableCell
                                width={10}
                                sx={{
                                    width: 10,
                                    minWidth: 10,
                                    maxWidth: 15,
                                    textAlign: 'center',
                                    p: 0.5,
                                }}
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {steps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isViewer ? 4 : 5} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        {t('testcase.message.addSteps', '스텝을 추가하세요.')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            steps
                                .sort((a, b) => a.stepNumber - b.stepNumber)
                                .map(step => (
                                    <TableRow key={step.stepNumber}>
                                        <TableCell sx={{ width: 28, minWidth: 24, maxWidth: 32, textAlign: 'center', p: 0.5 }}>
                                            {step.stepNumber}
                                        </TableCell>
                                        <TableCell sx={{ width: '44%', minWidth: 120 }}>
                                            <Box data-color-mode={theme.palette.mode}>
                                                <MDEditor
                                                    value={step.description || ''}
                                                    onChange={(value) => onStepMarkdownChange(step.stepNumber, 'description', value || '')}
                                                    preview="live"
                                                    height={200}
                                                    textareaProps={{
                                                        placeholder: t('testcase.form.stepDescription', 'Step 설명'),
                                                        onPaste: (event) => onMarkdownPaste(event, {
                                                            type: 'step',
                                                            field: 'description',
                                                            stepNumber: step.stepNumber,
                                                        })
                                                    }}
                                                    disabled={isViewer}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ width: '44%', minWidth: 120 }}>
                                            <Box data-color-mode={theme.palette.mode}>
                                                <MDEditor
                                                    value={step.expectedResult || ''}
                                                    onChange={(value) => onStepMarkdownChange(step.stepNumber, 'expectedResult', value || '')}
                                                    preview="live"
                                                    height={200}
                                                    textareaProps={{
                                                        placeholder: t('testcase.form.expectedResult', '예상 결과'),
                                                        onPaste: (event) => onMarkdownPaste(event, {
                                                            type: 'step',
                                                            field: 'expectedResult',
                                                            stepNumber: step.stepNumber,
                                                        })
                                                    }}
                                                    disabled={isViewer}
                                                />
                                            </Box>
                                        </TableCell>
                                        {!isViewer && (
                                            <TableCell align="center" sx={{ width: 50, minWidth: 45, maxWidth: 60, p: 0.5 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onMoveStep(step.stepNumber, 'up')}
                                                        disabled={step.stepNumber === 1}
                                                        sx={{ p: 0.25 }}
                                                    >
                                                        <ArrowUpIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onMoveStep(step.stepNumber, 'down')}
                                                        disabled={step.stepNumber === steps.length}
                                                        sx={{ p: 0.25 }}
                                                    >
                                                        <ArrowDownIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        )}
                                        <TableCell align="center" sx={{ width: 36, minWidth: 26, maxWidth: 40, p: 0.5 }}>
                                            {!isViewer && (
                                                <IconButton size="small" color="error" onClick={() => onDeleteStep(step.stepNumber)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {!isViewer && (
                <Button
                    startIcon={<AddIcon />}
                    onClick={onAddStep}
                    sx={{ mt: 1 }}
                    size="small"
                    variant="outlined"
                    color="primary"
                >
                    {t('testcase.button.addStep', '스텝 추가')}
                </Button>
            )}
        </Box>
    );
};

TestStepsTable.propTypes = {
    steps: PropTypes.array.isRequired,
    errors: PropTypes.object,
    isViewer: PropTypes.bool,
    t: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    onAddStep: PropTypes.func.isRequired,
    onDeleteStep: PropTypes.func.isRequired,
    onMoveStep: PropTypes.func.isRequired,
    onStepMarkdownChange: PropTypes.func.isRequired,
    onMarkdownPaste: PropTypes.func.isRequired,
};

export default TestStepsTable;
