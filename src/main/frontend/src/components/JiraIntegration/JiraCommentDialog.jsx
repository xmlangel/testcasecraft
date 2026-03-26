// src/components/JiraIntegration/JiraCommentDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    Typography,
    CircularProgress,
    IconButton,
    Chip,
    FormControlLabel,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Close as CloseIcon,
    Send as SendIcon,
    BugReport as BugIcon,
    Link as LinkIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Edit as EditIcon,
    Visibility as PreviewIcon
} from '@mui/icons-material';
import { jiraService } from '../../services/jiraService';
import { useI18n } from '../../context/I18nContext';
import { getLocalizedResultConfig } from '../../utils/testResultConstants';

const JiraCommentDialog = ({
    open,
    onClose,
    testResult = null,
    testCase = null,
    linkedIssues = [],
    onCommentAdded = null
}) => {
    const { t } = useI18n();
    const theme = useTheme();
    const [issueKey, setIssueKey] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0: Edit, 1: Preview
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [autoGenerateComment, setAutoGenerateComment] = useState(true);
    const [detectedIssues, setDetectedIssues] = useState([]);
    const [jiraStatus, setJiraStatus] = useState(null);

    useEffect(() => {
        if (open) {
            resetForm();
            checkJiraStatus();

            // 감지된 JIRA 이슈 키 수집
            const allDetectedIssues = [];

            // 1순위: testResult에 이미 입력된 jiraIssueKey
            if (testResult?.jiraIssueKey && testResult.jiraIssueKey.trim()) {
                allDetectedIssues.push(testResult.jiraIssueKey.trim());
            }

            // 2순위: 연결된 이슈들 추가
            if (linkedIssues && linkedIssues.length > 0) {
                allDetectedIssues.push(...linkedIssues.map(issue => issue.key));
            }

            // 3순위: 테스트 결과 노트에서 감지된 이슈들 추가
            if (testResult?.notes) {
                const notesIssues = jiraService.extractIssueKeys(testResult.notes);
                allDetectedIssues.push(...notesIssues);
            }

            // 중복 제거
            const uniqueIssues = [...new Set(allDetectedIssues)];
            setDetectedIssues(uniqueIssues);

            if (uniqueIssues.length > 0) {
                setIssueKey(uniqueIssues[0]); // 첫 번째 이슈를 기본값으로 설정 (testResult.jiraIssueKey가 우선)
            }

            // 자동 코멘트 생성
            if (autoGenerateComment) {
                generateComment();
            }
        }
    }, [open, testResult, testCase, autoGenerateComment]);

    const resetForm = () => {
        setIssueKey('');
        setComment('');
        setError(null);
        setSuccess(false);
        setDetectedIssues([]);
        setActiveTab(0);
    };

    const checkJiraStatus = async () => {
        try {
            const status = await jiraService.getConnectionStatus();
            setJiraStatus(status);

            if (!status.hasConfig || !status.isConnected) {
                setError(t('jira.comment.error.noConfig'));
            }
        } catch (error) {
            console.error('JIRA 상태 확인 실패:', error);
            setError(t('jira.comment.error.checkStatusFailed'));
        }
    };

    const generateComment = () => {
        if (!testResult || !testCase) return;

        const statusIcon = getResultIcon(testResult.result);
        const statusText = getResultText(testResult.result);

        let generatedComment = `${statusIcon} **${t('jira.comment.template.title')}**\n\n`;
        generatedComment += `**${t('jira.comment.template.testCase')}** ${testCase.name}\n`;
        generatedComment += `**${t('jira.comment.template.result')}** ${statusText}\n`;
        generatedComment += `**${t('jira.comment.template.executedAt')}** ${new Date().toLocaleString('ko-KR')}\n\n`;

        if (testResult.notes && testResult.notes.trim()) {
            generatedComment += `**${t('jira.comment.template.details')}**\n${testResult.notes}\n\n`;
        }

        if (testResult.result === 'FAIL' || testResult.result === 'BLOCKED') {
            generatedComment += `**${t('jira.comment.template.actionRequired')}**\n`;
        }

        generatedComment += `\n---\n*${t('jira.comment.template.footer')}*`;

        setComment(generatedComment);
    };

    const getResultIcon = (result) => {
        switch (result) {
            case 'PASS': return '✅';
            case 'FAIL': return '❌';
            case 'BLOCKED': return '⚠️';
            case 'NOT_RUN': return '⏳';
            default: return '📝';
        }
    };

    const getResultText = (result) => {
        const config = getLocalizedResultConfig(result, t);
        return config ? config.label : t('testResult.status.unknown');
    };

    const handleIssueKeyChange = (event) => {
        const value = event.target.value.toUpperCase();
        setIssueKey(value);
        setError(null);
    };

    const handleSendComment = async () => {
        if (!issueKey.trim()) {
            setError(t('jira.comment.error.issueKeyRequired'));
            return;
        }

        if (!jiraService.isValidIssueKey(issueKey)) {
            setError(t('jira.comment.error.invalidIssueKey'));
            return;
        }

        if (!comment.trim()) {
            setError(t('jira.comment.error.commentRequired'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await jiraService.addTestResultComment(issueKey.trim(), comment.trim());

            setSuccess(true);

            if (onCommentAdded) {
                onCommentAdded(issueKey.trim(), comment.trim());
            }

            // 성공 메시지 표시 후 자동으로 닫기
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error('JIRA 코멘트 추가 실패:', error);
            setError(jiraService.getUserFriendlyErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDetectedIssueClick = (detectedIssue) => {
        setIssueKey(detectedIssue);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            disableRestoreFocus
            slotProps={{
                paper: {
                    sx: { minHeight: '400px' }
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugIcon />
                    {t('jira.comment.dialogTitle')}
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* JIRA 연결 상태 표시 */}
                    {jiraStatus && (
                        <Alert
                            severity={jiraStatus.hasConfig && jiraStatus.isConnected ? 'success' : 'warning'}
                            icon={jiraStatus.hasConfig && jiraStatus.isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
                        >
                            {jiraStatus.hasConfig && jiraStatus.isConnected
                                ? t('jira.comment.connectionStatus.connected', { serverUrl: jiraStatus.serverUrl })
                                : t('jira.comment.connectionStatus.notConnected')
                            }
                        </Alert>
                    )}

                    {/* 에러 메시지 */}
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {/* 성공 메시지 */}
                    {success && (
                        <Alert severity="success">
                            {t('jira.comment.success.added')}
                        </Alert>
                    )}

                    {/* 감지된 이슈 키 표시 */}
                    {detectedIssues.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                {linkedIssues.length > 0 ? t('jira.comment.detectedIssues.linked') : t('jira.comment.detectedIssues.fromNotes')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {detectedIssues.map((issue) => {
                                    const isLinked = linkedIssues.some(li => li.key === issue);
                                    return (
                                        <Chip
                                            key={issue}
                                            label={issue}
                                            variant={issueKey === issue ? 'filled' : 'outlined'}
                                            color={issueKey === issue ? 'primary' : (isLinked ? 'success' : 'default')}
                                            clickable
                                            onClick={() => handleDetectedIssueClick(issue)}
                                            icon={<LinkIcon />}
                                        />
                                    );
                                })}
                            </Box>
                            {linkedIssues.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {t('jira.comment.detectedIssues.legend')}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* JIRA 이슈 키 입력 */}
                    <TextField
                        label={t('jira.comment.field.issueKey.label')}
                        value={issueKey}
                        onChange={handleIssueKeyChange}
                        placeholder={t('jira.comment.field.issueKey.placeholder')}
                        fullWidth
                        helperText={t('jira.comment.field.issueKey.helper')}
                        disabled={loading || success}
                    />

                    {/* 자동 코멘트 생성 옵션 */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoGenerateComment}
                                onChange={(e) => {
                                    setAutoGenerateComment(e.target.checked);
                                    if (e.target.checked) {
                                        generateComment();
                                    }
                                }}
                                disabled={loading || success}
                            />
                        }
                        label={t('jira.comment.field.autoGenerate.label')}
                    />

                    {/* 코멘트 내용 입력 / 미리보기 */}
                    <Box sx={{ width: '100%' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                            variant="fullWidth"
                        >
                            <Tab icon={<EditIcon />} iconPosition="start" label={t('jira.comment.tab.edit', '편집')} />
                            <Tab icon={<PreviewIcon />} iconPosition="start" label={t('jira.comment.tab.preview', '미리보기')} />
                        </Tabs>

                        {activeTab === 0 ? (
                            <TextField
                                label={t('jira.comment.field.comment.label')}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                fullWidth
                                multiline
                                rows={8}
                                placeholder={t('jira.comment.field.comment.placeholder')}
                                disabled={loading || success}
                                helperText={t('jira.comment.field.comment.charCount', { count: comment.length })}
                            />
                        ) : (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    minHeight: '228px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                                    '& p': { m: 0, mb: 1.5 },
                                    '& p:last-child': { mb: 0 },
                                    '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                                    '& ul, & ol': { pl: 2.5, mb: 1.5 },
                                    '& li': { mb: 0.5 },
                                    '& code': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'grey.200',
                                        px: 0.5,
                                        py: 0.25,
                                        borderRadius: 0.5,
                                        fontFamily: 'monospace',
                                    },
                                    '& pre': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'grey.200',
                                        p: 1.5,
                                        borderRadius: 1,
                                        overflowX: 'auto',
                                        '& code': { bgcolor: 'transparent', p: 0 }
                                    },
                                    '& blockquote': {
                                        borderLeft: 4,
                                        borderColor: 'divider',
                                        pl: 2,
                                        py: 0.5,
                                        m: 0,
                                        mb: 1.5,
                                        fontStyle: 'italic',
                                        color: 'text.secondary'
                                    },
                                    '& hr': { my: 2, border: 0, borderTop: 1, borderColor: 'divider' }
                                }}
                            >
                                {comment ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {comment}
                                    </ReactMarkdown>
                                ) : (
                                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        {t('jira.comment.preview.empty', '미리 볼 내용이 없습니다.')}
                                    </Typography>
                                )}
                            </Paper>
                        )}
                    </Box>

                    {/* 테스트 정보 표시 */}
                    {testCase && testResult && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                {t('jira.comment.testInfo.title')}
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        {getResultIcon(testResult.result)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={testCase.name}
                                        secondary={t('jira.comment.testInfo.result', { result: getResultText(testResult.result) })}
                                    />
                                </ListItem>
                                {testResult.notes && (
                                    <>
                                        <Divider />
                                        <ListItem>
                                            <ListItemText
                                                primary={t('jira.comment.testInfo.notes')}
                                                secondary={testResult.notes}
                                                slotProps={{
                                                    secondary: {
                                                        sx: {
                                                            whiteSpace: 'pre-line',
                                                            maxHeight: '100px',
                                                            overflow: 'auto'
                                                        }
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    </>
                                )}
                            </List>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                >
                    {success ? t('jira.comment.button.close') : t('jira.comment.button.cancel')}
                </Button>

                {!success && (
                    <Button
                        variant="contained"
                        onClick={handleSendComment}
                        disabled={loading || !issueKey.trim() || !comment.trim()}
                        startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                    >
                        {loading ? t('jira.comment.button.sending') : t('jira.comment.button.send')}
                    </Button>
                )}

                {!success && autoGenerateComment && (
                    <Button
                        variant="outlined"
                        onClick={generateComment}
                        disabled={loading}
                    >
                        {t('jira.comment.button.regenerate')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default JiraCommentDialog;