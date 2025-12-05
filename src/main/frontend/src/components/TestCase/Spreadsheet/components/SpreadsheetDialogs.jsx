// src/components/TestCase/Spreadsheet/components/SpreadsheetDialogs.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    Alert
} from '@mui/material';
import {
    CreateNewFolder as CreateNewFolderIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { useI18n } from '../../../../context/I18nContext';

/**
 * 스텝 설정 다이얼로그
 */
export const StepSettingsDialog = ({
    open,
    onClose,
    tempMaxSteps,
    setTempMaxSteps,
    maxSteps,
    onApply,
    t
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            disableRestoreFocus
        >
            <DialogTitle>{t('testcase.spreadsheet.stepDialog.title', '스텝 수 설정')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('testcase.spreadsheet.stepDialog.description', '테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.')}
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('testcase.spreadsheet.stepDialog.label', '스텝 수')}
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={tempMaxSteps}
                    onChange={(e) => setTempMaxSteps(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    inputProps={{ min: 1, max: 10 }}
                    helperText={t('testcase.spreadsheet.stepDialog.helper', '1개부터 10개까지 설정 가능합니다.')}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('testcase.spreadsheet.stepDialog.cancel', '취소')}</Button>
                <Button
                    onClick={onApply}
                    variant="contained"
                    disabled={tempMaxSteps === maxSteps}
                >
                    {t('testcase.spreadsheet.stepDialog.apply', '적용')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

StepSettingsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    tempMaxSteps: PropTypes.number.isRequired,
    setTempMaxSteps: PropTypes.func.isRequired,
    maxSteps: PropTypes.number.isRequired,
    onApply: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
};

/**
 * 폴더 생성 다이얼로그
 */
export const FolderCreateDialog = ({
    open,
    onClose,
    folderName,
    setFolderName,
    onCreate,
    t
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            disableRestoreFocus
        >
            <DialogTitle>{t('testcase.spreadsheet.folderDialog.title', '새 폴더 생성')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('testcase.spreadsheet.folderDialog.description', '새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.')}
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('testcase.spreadsheet.folderDialog.label', '폴더명')}
                    fullWidth
                    variant="outlined"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && folderName.trim()) {
                            onCreate();
                        }
                    }}
                    placeholder={t('testcase.spreadsheet.folderDialog.placeholder', '예: API 테스트, UI 테스트')}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('testcase.spreadsheet.folderDialog.cancel', '취소')}</Button>
                <Button
                    onClick={onCreate}
                    variant="contained"
                    disabled={!folderName.trim()}
                    startIcon={<CreateNewFolderIcon />}
                >
                    {t('testcase.spreadsheet.folderDialog.create', '생성')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

FolderCreateDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    folderName: PropTypes.string.isRequired,
    setFolderName: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
};

/**
 * 검증 결과 상세 패널 다이얼로그
 */
export const ValidationResultDialog = ({
    open,
    onClose,
    validationResult
}) => {
    const theme = useTheme();
    const { t } = useI18n();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            disableRestoreFocus
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {validationResult?.isValid ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon color="success" />
                            <Typography variant="h6">{t('testcase.spreadsheet.validation.titleSuccess', '데이터 검증 완료')}</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon color="warning" />
                            <Typography variant="h6">{t('testcase.spreadsheet.validation.title', '데이터 검증 결과')}</Typography>
                        </Box>
                    )}
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {validationResult && (
                    <Box>
                        {/* 요약 정보 */}
                        <Card sx={{
                            mb: 2,
                            bgcolor: validationResult.isValid
                                ? (theme.palette.mode === 'dark' ? 'rgba(102, 187, 106, 0.15)' : 'success.light')
                                : (theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.15)' : 'warning.light')
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('testcase.spreadsheet.validation.summary', '검증 요약')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={t('testcase.spreadsheet.validation.rows', '{count}개 행', { count: validationResult.summary.totalRows })}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={t('testcase.spreadsheet.validation.folders', '{count}개 폴더', { count: validationResult.summary.folderCount })}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={t('testcase.spreadsheet.validation.testcases', '{count}개 테스트케이스', { count: validationResult.summary.testCaseCount })}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                    />
                                    {validationResult.summary.errorCount > 0 && (
                                        <Chip
                                            label={t('testcase.spreadsheet.validation.errorCount', '{count}개 오류', { count: validationResult.summary.errorCount })}
                                            size="small"
                                            color="error"
                                            variant="filled"
                                        />
                                    )}
                                    {validationResult.summary.warningCount > 0 && (
                                        <Chip
                                            label={t('testcase.spreadsheet.validation.warningCount', '{count}개 경고', { count: validationResult.summary.warningCount })}
                                            size="small"
                                            color="warning"
                                            variant="filled"
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 오류 목록 */}
                        {validationResult.errors.length > 0 && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <ErrorIcon color="error" />
                                        <Typography variant="h6" color="error.main">
                                            {t('testcase.spreadsheet.validation.errors', '해결이 필요한 오류 ({count}개)', { count: validationResult.errors.length })}
                                        </Typography>
                                    </Box>
                                    {validationResult.errors.map((error, index) => (
                                        <Alert
                                            key={index}
                                            severity="error"
                                            sx={{
                                                mb: 1,
                                                ...(theme.palette.mode === 'dark' && {
                                                    bgcolor: 'rgba(211, 47, 47, 0.15)',
                                                    color: '#ffcdd2',
                                                    '& .MuiAlert-icon': {
                                                        color: '#ef5350'
                                                    }
                                                })
                                            }}
                                            action={
                                                <Chip
                                                    label={`${error.row}${t('testcase.spreadsheet.validation.row', '행')}`}
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                />
                                            }
                                        >
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {error.column} {t('testcase.spreadsheet.validation.column', '컬럼')}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {error.message}
                                                </Typography>
                                                {error.suggestion && (
                                                    <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                                        {t('testcase.spreadsheet.validation.solution', '💡 해결 방법:')} {error.suggestion}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* 경고 목록 */}
                        {validationResult.warnings.length > 0 && (
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <WarningIcon color="warning" />
                                        <Typography variant="h6" color="warning.main">
                                            {t('testcase.spreadsheet.validation.warnings', '권장 사항 ({count}개)', { count: validationResult.warnings.length })}
                                        </Typography>
                                    </Box>
                                    {validationResult.warnings.map((warning, index) => (
                                        <Alert
                                            key={index}
                                            severity="warning"
                                            sx={{
                                                mb: 1,
                                                ...(theme.palette.mode === 'dark' && {
                                                    bgcolor: 'rgba(255, 160, 0, 0.15)',
                                                    color: '#ffe0b2',
                                                    '& .MuiAlert-icon': {
                                                        color: '#ffb74d'
                                                    }
                                                })
                                            }}
                                            action={
                                                <Chip
                                                    label={`${warning.row}${t('testcase.spreadsheet.validation.row', '행')}`}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            }
                                        >
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {warning.column} {t('testcase.spreadsheet.validation.column', '컬럼')}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {warning.message}
                                                </Typography>
                                                {warning.suggestion && (
                                                    <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                                        {t('testcase.spreadsheet.validation.improvement', '💡 개선 방법:')} {warning.suggestion}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* 검증 성공 메시지 */}
                        {validationResult.isValid && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body1">
                                    {t('testcase.spreadsheet.validation.successMessage', '모든 데이터가 유효합니다! 저장할 준비가 완료되었습니다.')}
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>{t('testcase.spreadsheet.validation.close', '닫기')}</Button>
                {validationResult && !validationResult.isValid && (
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => {
                            onClose();
                            // 스프레드시트의 첫 번째 오류 행으로 스크롤 (구현 가능하다면)
                        }}
                    >
                        {t('testcase.spreadsheet.validation.gotoError', '오류 위치로 이동')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

ValidationResultDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    validationResult: PropTypes.shape({
        isValid: PropTypes.bool,
        errors: PropTypes.array,
        warnings: PropTypes.array,
        summary: PropTypes.shape({
            totalRows: PropTypes.number,
            errorCount: PropTypes.number,
            warningCount: PropTypes.number,
            folderCount: PropTypes.number,
            testCaseCount: PropTypes.number
        })
    })
};
