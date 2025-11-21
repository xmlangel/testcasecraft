import React from 'react';
import {
    Box, Typography, Chip, Divider, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MDEditor from '@uiw/react-md-editor';

const Subtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const MULTILINE_SCROLLS_SX = {
    whiteSpace: 'pre-line',
    maxHeight: '20em',
    overflowY: 'auto',
    display: 'block'
};

const TestCaseDetails = ({ testCase, t }) => {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';

    if (!testCase) return null;

    return (
        <>
            <Paper elevation={0} sx={{ mb: 3, p: 3, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Subtitle variant="subtitle1" gutterBottom sx={{ mb: 0 }}>
                        {testCase.parentName && testCase.parentName !== '상위없음'
                            ? `${testCase.parentName} >> ${testCase.name}`
                            : testCase.name}
                    </Subtitle>
                    {testCase.priority && (
                        <Chip
                            label={testCase.priority}
                            color={
                                testCase.priority === 'High' ? 'error' :
                                    testCase.priority === 'Medium' ? 'warning' : 'info'
                            }
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    )}
                </Box>
                {testCase.description && (
                    <Box data-color-mode={darkMode ? 'dark' : 'light'}>
                        <MDEditor.Markdown
                            source={testCase.description}
                            style={{
                                padding: '12px',
                                backgroundColor: darkMode ? 'transparent' : theme.palette.action.hover,
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                color: theme.palette.text.primary
                            }}
                        />
                    </Box>
                )}
            </Paper>

            <Paper elevation={0} sx={{ mb: 3, p: 3, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
                <Subtitle variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    {t('testResult.form.preCondition')}
                </Subtitle>
                {testCase.preCondition && (
                    <Box data-color-mode={darkMode ? 'dark' : 'light'}>
                        <MDEditor.Markdown
                            source={testCase.preCondition}
                            style={{
                                padding: '12px',
                                backgroundColor: darkMode ? 'transparent' : theme.palette.action.hover,
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                color: theme.palette.text.primary
                            }}
                        />
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {testCase.steps?.length > 0 && (
                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Subtitle variant="subtitle2" gutterBottom>
                            {t('testResult.form.testSteps')}
                        </Subtitle>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="10%">No.</TableCell>
                                        <TableCell width="60%">Step</TableCell>
                                        <TableCell width="30%">Expected</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {testCase.steps
                                        .sort((a, b) => a.stepNumber - b.stepNumber)
                                        .map((step) => (
                                            <TableRow key={step.stepNumber}>
                                                <TableCell>{step.stepNumber}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={MULTILINE_SCROLLS_SX}>
                                                        {step.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                                                        {step.expectedResult}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box>
                    <Subtitle variant="subtitle1" gutterBottom>
                        {t('testResult.form.expectedResult')}
                    </Subtitle>
                    {testCase.expectedResults && (
                        <Box data-color-mode={darkMode ? 'dark' : 'light'}>
                            <MDEditor.Markdown
                                source={testCase.expectedResults}
                                style={{
                                    padding: '12px',
                                    backgroundColor: darkMode ? 'transparent' : theme.palette.action.hover,
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    color: theme.palette.text.primary
                                }}
                            />
                        </Box>
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 사후조건 */}
                {testCase.postCondition && (
                    <Box sx={{ mb: 2 }}>
                        <Subtitle variant="subtitle1" gutterBottom>
                            사후조건
                        </Subtitle>
                        <Box data-color-mode={darkMode ? 'dark' : 'light'}>
                            <MDEditor.Markdown
                                source={testCase.postCondition}
                                style={{
                                    padding: '12px',
                                    backgroundColor: darkMode ? 'transparent' : theme.palette.action.hover,
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    color: theme.palette.text.primary
                                }}
                            />
                        </Box>
                    </Box>
                )}

                {/* 자동화 여부, 실행 타입 */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            자동화 여부
                        </Typography>
                        <Chip
                            label={testCase.isAutomated ? '자동화' : '수동'}
                            color={testCase.isAutomated ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>

                    {testCase.executionType && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                실행 타입
                            </Typography>
                            <Chip
                                label={testCase.executionType}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        </Box>
                    )}
                </Box>

                {/* 테스트 기법 */}
                {testCase.testTechnique && (
                    <Box sx={{ mb: 2 }}>
                        <Subtitle variant="subtitle1" gutterBottom>
                            테스트 기법
                        </Subtitle>
                        <Box data-color-mode={darkMode ? 'dark' : 'light'}>
                            <MDEditor.Markdown
                                source={testCase.testTechnique}
                                style={{
                                    padding: '12px',
                                    backgroundColor: darkMode ? 'transparent' : theme.palette.action.hover,
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    color: theme.palette.text.primary
                                }}
                            />
                        </Box>
                    </Box>
                )}

                {/* 테스트 케이스 태그 */}
                {testCase.tags && testCase.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Subtitle variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                            태그
                        </Subtitle>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {testCase.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
            </Paper>
        </>
    );
};

export default TestCaseDetails;
