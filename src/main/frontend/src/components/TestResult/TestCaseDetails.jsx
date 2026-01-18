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

    // 디버그 모드일 때 첨부파일 URL 로그 출력
    React.useEffect(() => {
        const isDebug = localStorage.getItem('debug') === 'true';
        if (!isDebug || !testCase) return;

        const checkContent = (field, content) => {
            if (!content) return;
            if (content.includes('/api/testcase-attachments/public/')) {
                console.log(`[DEBUG] Found public attachment URL in ${field}:`, content);
                // URL 추출
                const matches = content.match(/\/api\/testcase-attachments\/public\/[^)"\s]+/g);
                if (matches) {
                    console.log(`[DEBUG] Extracted URLs from ${field}:`, matches);
                }
            }
        };

        console.log(`[DEBUG] Checking TestCase ${testCase.id} (${testCase.name}) for public attachment URLs`);
        checkContent('description', testCase.description);
        checkContent('preCondition', testCase.preCondition);
        checkContent('expectedResults', testCase.expectedResults);
        checkContent('postCondition', testCase.postCondition);
        checkContent('testTechnique', testCase.testTechnique);

        if (testCase.steps) {
            testCase.steps.forEach((step, index) => {
                checkContent(`step[${index}].description`, step.description);
                checkContent(`step[${index}].expectedResult`, step.expectedResult);
            });
        }
    }, [testCase]);

    return (
        <>
            <Paper elevation={0} sx={{ mb: 3, p: 3, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {testCase.displayId && (
                        <Chip
                            label={testCase.displayId}
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1 }}
                        />
                    )}
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
                                                    <Box data-color-mode={darkMode ? 'dark' : 'light'} sx={MULTILINE_SCROLLS_SX}>
                                                        <MDEditor.Markdown
                                                            source={step.description || ''}
                                                            style={{
                                                                fontSize: '0.875rem',
                                                                backgroundColor: 'transparent',
                                                                color: theme.palette.text.primary
                                                            }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box data-color-mode={darkMode ? 'dark' : 'light'} sx={MULTILINE_SCROLLS_SX}>
                                                        <MDEditor.Markdown
                                                            source={step.expectedResult || ''}
                                                            style={{
                                                                fontSize: '0.875rem',
                                                                backgroundColor: 'transparent',
                                                                color: theme.palette.text.secondary
                                                            }}
                                                        />
                                                    </Box>
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
                            {t('testResult.form.postCondition')}
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
                            {t('testResult.form.automationStatus')}
                        </Typography>
                        <Chip
                            label={testCase.isAutomated ? t('testResult.form.automated') : t('testResult.form.manual')}
                            color={testCase.isAutomated ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>

                    {testCase.executionType && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                {t('testResult.form.executionType')}
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
                            {t('testResult.form.testTechnique')}
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
                            {t('testResult.form.tags')}
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
