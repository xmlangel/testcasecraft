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
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationResult?.isValid ? (
                            <InfoIcon color="success" />
                        ) : (
                            <WarningIcon color="warning" />
                        )}
                        <Typography variant="h6" fontWeight="bold">
                            {validationResult?.isValid
                                ? t('testcase.spreadsheet.validation.titleSuccess', '데이터 검증 완료')
                                : t('testcase.spreadsheet.validation.title', '데이터 검증 결과')
                            }
                        </Typography>
                    </Box>
                    <Chip
                        label={validationResult?.isValid ? "PASS" : "ISSUES FOUND"}
                        color={validationResult?.isValid ? "success" : "warning"}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
                {validationResult && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Summary Section - Cleaner Design */}
                        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('testcase.spreadsheet.validation.summary', '검증 요약')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Chip
                                        icon={<InfoIcon />}
                                        label={t('testcase.spreadsheet.validation.rows', '총 {count}행', { count: validationResult.summary.totalRows })}
                                        variant="filled"
                                        color="default"
                                    />
                                    <Box sx={{ width: 1, height: 20, bgcolor: 'divider' }} />
                                    <Chip
                                        label={t('testcase.spreadsheet.validation.testcases', '테스트케이스 {count}개', { count: validationResult.summary.testCaseCount })}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={t('testcase.spreadsheet.validation.folders', '폴더 {count}개', { count: validationResult.summary.folderCount })}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Box sx={{ flexGrow: 1 }} />
                                    {validationResult.summary.errorCount > 0 && (
                                        <Chip
                                            label={t('testcase.spreadsheet.validation.errorCount', '오류 {count}건', { count: validationResult.summary.errorCount })}
                                            color="error"
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    )}
                                    {validationResult.summary.warningCount > 0 && (
                                        <Chip
                                            label={t('testcase.spreadsheet.validation.warningCount', '경고 {count}건', { count: validationResult.summary.warningCount })}
                                            color="warning"
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Errors Section */}
                        {validationResult.errors.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" color="error.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                                    <ErrorIcon fontSize="small" />
                                    {t('testcase.spreadsheet.validation.errors', '오류 ({count})', { count: validationResult.errors.length })}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {validationResult.errors.map((error, index) => (
                                        <Alert
                                            key={index}
                                            severity="error"
                                            variant="outlined"
                                            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'error.light' }}
                                            icon={<ErrorIcon fontSize="small" />}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Chip
                                                            label={`${error.row}${t('testcase.spreadsheet.validation.row', '행')}`}
                                                            size="small"
                                                            color="error"
                                                            variant="soft" // If 'soft' is not supported, it might fall back or ignore. safer to use predefined or standard.
                                                            sx={{ borderRadius: 1, height: 20, fontSize: '0.75rem' }}
                                                        />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            {error.column} {t('testcase.spreadsheet.validation.column', '컬럼')}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.primary">
                                                        {error.message}
                                                    </Typography>
                                                    {error.suggestion && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                                                            💡 {error.suggestion}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Alert>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Warnings Section */}
                        {validationResult.warnings.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" color="warning.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                                    <WarningIcon fontSize="small" />
                                    {t('testcase.spreadsheet.validation.warnings', '권장 사항 ({count})', { count: validationResult.warnings.length })}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {validationResult.warnings.map((warning, index) => (
                                        <Alert
                                            key={index}
                                            severity="warning"
                                            variant="outlined"
                                            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'warning.light' }}
                                            icon={<WarningIcon fontSize="small" />}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Chip
                                                            label={`${warning.row}${t('testcase.spreadsheet.validation.row', '행')}`}
                                                            size="small"
                                                            color="warning"
                                                            sx={{ borderRadius: 1, height: 20, fontSize: '0.75rem' }}
                                                        />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            {warning.column} {t('testcase.spreadsheet.validation.column', '컬럼')}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.primary">
                                                        {warning.message}
                                                    </Typography>
                                                    {warning.suggestion && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                                                            💡 {warning.suggestion}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Alert>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Success Section */}
                        {validationResult.isValid && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, textAlign: 'center' }}>
                                <InfoIcon color="success" sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h6" gutterBottom>
                                    {t('testcase.spreadsheet.validation.successTitle', '검증 통과')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {t('testcase.spreadsheet.validation.successMessage', '모든 데이터가 유효합니다. 저장할 준비가 되었습니다.')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    {t('testcase.spreadsheet.validation.close', '닫기')}
                </Button>
                {validationResult && !validationResult.isValid && (
                    <Button
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => {
                            onClose();
                        }}
                    >
                        {t('testcase.spreadsheet.validation.gotoError', '확인')}
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


