// src/main/frontend/src/components/JUnit/JunitTestCaseEditor.jsx

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Chip,
    Grid,
    Alert,
    Divider,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    History as HistoryIcon,
    Visibility as ViewIcon,
    BugReport as BugIcon,
    CheckCircle as PassIcon,
    Warning as WarningIcon,
    SkipNext as SkipIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import junitResultService from '../../services/junitResultService';
import { STATUS_COLORS } from '../../constants/statusColors';

/**
 * JUnit 테스트 케이스 편집 컴포넌트
 * 기존 TestResult 편집 시스템과 연동
 */
const JunitTestCaseEditor = ({
    testCase,
    isOpen,
    onClose,
    onSave,
    readOnly = false
}) => {
    const { user } = useAppContext();
    const { t } = useI18n();
    const [editForm, setEditForm] = useState({
        userTitle: '',
        userDescription: '',
        userNotes: '',
        userStatus: null,
        tags: '',
        priority: 'MEDIUM'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showOriginalData, setShowOriginalData] = useState(false);

    // 상태별 색상 및 아이콘 매핑
    const statusConfig = {
        PASSED: {
            color: 'success',
            icon: <PassIcon />,
            label: t('junit.stats.passed'),
            description: t('junit.editor.status.passedDesc')
        },
        FAILED: {
            color: 'error',
            icon: <BugIcon />,
            label: t('junit.stats.failed'),
            description: t('junit.editor.status.failedDesc')
        },
        ERROR: {
            color: 'warning',
            icon: <WarningIcon />,
            label: t('junit.stats.error'),
            description: t('junit.editor.status.errorDesc')
        },
        SKIPPED: {
            color: 'default',
            icon: <SkipIcon />,
            label: t('junit.stats.skipped'),
            description: t('junit.editor.status.skippedDesc')
        }
    };

    // 우선순위 옵션
    const priorityOptions = [
        { value: 'HIGH', label: t('junit.editor.priority.high'), color: 'error' },
        { value: 'MEDIUM', label: t('junit.editor.priority.medium'), color: 'warning' },
        { value: 'LOW', label: t('junit.editor.priority.low'), color: 'info' }
    ];

    // 초기 데이터 로드
    useEffect(() => {
        if (testCase && isOpen) {
            setEditForm({
                userTitle: testCase.userTitle || '',
                userDescription: testCase.userDescription || '',
                userNotes: testCase.userNotes || '',
                userStatus: testCase.userStatus || null,
                tags: testCase.tags || '',
                priority: testCase.priority || 'MEDIUM'
            });
            setError(null);
        }
    }, [testCase, isOpen]);

    // 폼 데이터 변경 핸들러
    const handleFormChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 저장 핸들러
    const handleSave = async () => {
        if (!testCase?.id) {
            setError(t('junit.editor.error.noTestCase'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // JUnit 테스트 케이스 업데이트 API 호출
            const updatedTestCase = await junitResultService.updateTestCase(
                testCase.id,
                editForm.userTitle.trim() || null,
                editForm.userDescription.trim() || null,
                editForm.userNotes.trim() || null,
                editForm.userStatus,
                editForm.tags.trim() || null,
                editForm.priority,
                user.username
            );

            // 성공 시 상위 컴포넌트에 알림
            if (onSave) {
                onSave(updatedTestCase);
            }

            onClose();

        } catch (err) {
            console.error('테스트 케이스 저장 실패:', err);
            setError(err.message || t('junit.editor.error.saveFailed'));
        } finally {
            setLoading(false);
        }
    };

    // 취소 핸들러
    const handleCancel = () => {
        setEditForm({
            userTitle: testCase?.userTitle || '',
            userDescription: testCase?.userDescription || '',
            userNotes: testCase?.userNotes || '',
            userStatus: testCase?.userStatus || null,
            tags: testCase?.tags || '',
            priority: testCase?.priority || 'MEDIUM'
        });
        setError(null);
        onClose();
    };

    // 태그 배열 변환
    const getTagsArray = (tags) => {
        if (!tags) return [];
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    };

    // 실행 시간 포맷
    const formatDuration = (seconds) => {
        if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
        if (seconds < 60) return `${seconds.toFixed(2)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}m ${remainingSeconds}s`;
    };

    if (!testCase) return null;

    const originalStatus = statusConfig[testCase.status] || statusConfig.PASSED;
    const userStatus = editForm.userStatus ? statusConfig[editForm.userStatus] : null;

    return (
        <Dialog
            open={isOpen}
            onClose={readOnly ? onClose : handleCancel}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    sx: { minHeight: '600px' }
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <EditIcon color="primary" />
                        <Typography variant="h6">
                            {t('junit.editor.title')} {readOnly ? t('junit.editor.viewMode') : t('junit.editor.editMode')}
                        </Typography>
                        <Chip
                            icon={originalStatus.icon}
                            label={originalStatus.label}
                            color={originalStatus.color}
                            size="small"
                        />
                    </Box>
                    <Box>
                        <Tooltip title={t('junit.editor.viewOriginalData')}>
                            <IconButton
                                onClick={() => setShowOriginalData(!showOriginalData)}
                                color={showOriginalData ? 'primary' : 'default'}
                            >
                                <ViewIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('junit.editor.editHistory')}>
                            <IconButton>
                                <HistoryIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* 원본 데이터 섹션 */}
                    {showOriginalData && (
                        <Grid size={{ xs: 12 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="text.secondary">
                                        {t('junit.editor.originalJunitData', '원본 JUnit 데이터')}
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '150px' }}>
                                                        {t('junit.editor.testName', '테스트 이름')}
                                                    </TableCell>
                                                    <TableCell>{testCase.name}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        {t('junit.editor.className', '클래스명')}
                                                    </TableCell>
                                                    <TableCell>{testCase.className}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        {t('junit.editor.executionTime', '실행 시간')}
                                                    </TableCell>
                                                    <TableCell>{formatDuration(testCase.time || 0)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        {t('junit.editor.originalStatus', '원본 상태')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={originalStatus.icon}
                                                            label={originalStatus.label}
                                                            color={originalStatus.color}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                                {testCase.failureMessage && (
                                                    <TableRow>
                                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                            {t('junit.editor.failureMessage', '실패 메시지')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color="error"
                                                                sx={{
                                                                    whiteSpace: 'pre-wrap',
                                                                    fontFamily: 'monospace',
                                                                    bgcolor: alpha(STATUS_COLORS.FAILED, 0.1),
                                                                    p: 1,
                                                                    borderRadius: 1
                                                                }}
                                                            >
                                                                {testCase.failureMessage}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {testCase.stackTrace && (
                                                    <TableRow>
                                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                            {t('junit.editor.stackTrace', '스택 트레이스')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    whiteSpace: 'pre-wrap',
                                                                    fontFamily: 'monospace',
                                                                    bgcolor: alpha(STATUS_COLORS.SKIPPED, 0.1),
                                                                    p: 1,
                                                                    borderRadius: 1,
                                                                    display: 'block',
                                                                    maxHeight: '200px',
                                                                    overflow: 'auto'
                                                                }}
                                                            >
                                                                {testCase.stackTrace}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                            <Divider sx={{ my: 3 }} />
                        </Grid>
                    )}

                    {/* 사용자 편집 섹션 */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('junit.editor.userEditInfo', '사용자 편집 정보')}
                        </Typography>
                    </Grid>

                    {/* 제목 편집 */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label={t('junit.editor.userDefinedTitle', '사용자 정의 제목')}
                            placeholder={testCase.name}
                            value={editForm.userTitle}
                            onChange={(e) => handleFormChange('userTitle', e.target.value)}
                            disabled={readOnly}
                            helperText={t('junit.editor.userDefinedTitleHelp', '테스트 케이스에 대한 사용자 정의 제목을 입력하세요.')}
                        />
                    </Grid>

                    {/* 설명 편집 */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="사용자 정의 설명"
                            placeholder={t('junit.editor.userDescriptionPlaceholder', '이 테스트 케이스에 대한 상세한 설명을 입력하세요...')}
                            value={editForm.userDescription}
                            onChange={(e) => handleFormChange('userDescription', e.target.value)}
                            disabled={readOnly}
                        />
                    </Grid>

                    {/* 사용자 상태와 우선순위 */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('junit.editor.userDefinedStatus', '사용자 정의 상태')}</InputLabel>
                            <Select
                                value={editForm.userStatus || ''}
                                onChange={(e) => handleFormChange('userStatus', e.target.value || null)}
                                disabled={readOnly}
                            >
                                <MenuItem value="">
                                    <em>{t('junit.editor.useOriginalStatus', '원본 상태 사용')}</em>
                                </MenuItem>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <MenuItem key={key} value={key}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {config.icon}
                                            {config.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('junit.editor.priorityLabel', '우선순위')}</InputLabel>
                            <Select
                                value={editForm.priority}
                                onChange={(e) => handleFormChange('priority', e.target.value)}
                                disabled={readOnly}
                            >
                                {priorityOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Chip
                                            label={option.label}
                                            color={option.color}
                                            size="small"
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* 태그 편집 */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label={t('junit.editor.tags')}
                            placeholder={t('junit.editor.tagsPlaceholder')}
                            value={editForm.tags}
                            onChange={(e) => handleFormChange('tags', e.target.value)}
                            disabled={readOnly}
                            helperText={t('junit.editor.tagsHelp')}
                        />
                        {editForm.tags && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {getTagsArray(editForm.tags).map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        )}
                    </Grid>

                    {/* 노트 편집 */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t('junit.editor.notes')}
                            placeholder={t('junit.editor.notesPlaceholder')}
                            value={editForm.userNotes}
                            onChange={(e) => handleFormChange('userNotes', e.target.value)}
                            disabled={readOnly}
                        />
                    </Grid>

                    {/* 현재 상태 미리보기 */}
                    {(userStatus || editForm.userTitle || editForm.tags) && (
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                        {t('junit.editor.preview')}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            {editForm.userTitle || testCase.name}
                                        </Typography>
                                        {userStatus && (
                                            <Chip
                                                icon={userStatus.icon}
                                                label={userStatus.label}
                                                color={userStatus.color}
                                                size="small"
                                            />
                                        )}
                                        <Chip
                                            label={priorityOptions.find(p => p.value === editForm.priority)?.label}
                                            color={priorityOptions.find(p => p.value === editForm.priority)?.color}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                    {editForm.tags && (
                                        <Box display="flex" gap={0.5} flexWrap="wrap">
                                            {getTagsArray(editForm.tags).map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={readOnly ? onClose : handleCancel}
                    startIcon={<CancelIcon />}
                    disabled={loading}
                >
                    {readOnly ? t('common.close') : t('common.cancel')}
                </Button>
                {!readOnly && (
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        startIcon={<SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? t('junit.editor.saving') : t('common.save')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default JunitTestCaseEditor;