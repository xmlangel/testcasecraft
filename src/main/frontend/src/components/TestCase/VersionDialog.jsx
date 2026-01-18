// src/components/TestCase/VersionDialog.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
} from '@mui/material';
import { Save as SaveVersionIcon } from '@mui/icons-material';

/**
 * 수동 버전 생성 다이얼로그 컴포넌트
 */
const VersionDialog = ({
    open,
    versionLabel,
    versionDescription,
    savingVersion,
    t,
    onSave,
    onCancel,
    onLabelChange,
    onDescriptionChange,
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{t('testcase.version.dialog.title', '수동 버전 생성')}</DialogTitle>
            <DialogContent>
                <TextField
                    label={t('testcase.version.form.label', '버전 라벨')}
                    value={versionLabel}
                    onChange={(e) => onLabelChange(e.target.value)}
                    fullWidth
                    margin="normal"
                    placeholder={t('testcase.version.form.labelPlaceholder', '예: v2.1 수정사항 반영')}
                    helperText={t('testcase.version.form.labelHelperText', '버전을 식별할 수 있는 라벨을 입력하세요.')}
                />
                <TextField
                    label={t('testcase.version.form.description', '버전 설명')}
                    value={versionDescription}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    placeholder={t('testcase.version.form.descriptionPlaceholder', '이 버전에서 변경된 내용을 상세히 설명하세요.')}
                    helperText={t('testcase.version.form.descriptionHelperText', '선택 사항입니다. 빈 칸으로 두면 \'수동 버전 생성\'으로 설정됩니다.')}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{t('testcase.version.button.cancel', '취소')}</Button>
                <Button
                    onClick={onSave}
                    variant="contained"
                    disabled={!versionLabel.trim() || savingVersion}
                    startIcon={savingVersion ? <CircularProgress size={20} color="inherit" /> : <SaveVersionIcon />}
                >
                    {savingVersion ? t('testcase.version.button.creating', '생성 중...') : t('testcase.version.button.create', '버전 생성')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

VersionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    versionLabel: PropTypes.string.isRequired,
    versionDescription: PropTypes.string.isRequired,
    savingVersion: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onLabelChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
};

export default VersionDialog;
