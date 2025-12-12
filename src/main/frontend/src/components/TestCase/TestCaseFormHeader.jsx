// src/components/TestCase/TestCaseFormHeader.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { Save as SaveIcon, Add as AddIcon, SaveAs as SaveVersionIcon } from '@mui/icons-material';
import VersionIndicator from './VersionIndicator.jsx';

/**
 * 테스트케이스 폼 헤더 컴포넌트
 */
const TestCaseFormHeader = ({
    testCaseId,
    testCase,
    currentVersion,
    isViewer,
    isSaving,
    isFolder,
    t,
    onSave,
    onCancel,
    onVersionHistory,
    onCreateVersion,
    onAddNew,
    // continueAdding, // Removed
    // onContinueAddingChange, // Removed
}) => {
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 0 }}>
                    {isFolder
                        ? (testCaseId ? t('testcase.form.folder.edit', '테스트 폴더 수정') : t('testcase.form.folder.create', '테스트 폴더 생성'))
                        : (testCaseId ? t('testcase.form.title.edit', '테스트케이스 수정') : t('testcase.form.title.create', '테스트케이스 생성'))
                    }
                </Typography>
                {/* 테스트 케이스 추가 버튼 (상단으로 이동하여 저장 버튼과 구분) */}
                {!isFolder && onAddNew && (
                    <Button
                        onClick={onAddNew}
                        color="secondary"
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                    >
                        {t('testcase.form.button.add', '새 케이스 추가')}
                    </Button>
                )}
            </Box>

            {!isFolder && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box>
                        {testCase?.displayId && (
                            <Typography variant="body2" color="text.secondary">
                                {t('testcase.form.displayId', 'Display ID')}: <strong>{testCase.displayId}</strong>
                            </Typography>
                        )}
                    </Box>
                    {testCaseId && testCase?.type === 'testcase' && (
                        <VersionIndicator
                            testCaseId={testCaseId}
                            currentVersion={currentVersion}
                            onVersionHistory={onVersionHistory}
                            onCreateVersion={onCreateVersion}
                            showMenu={!isViewer}
                        />
                    )}
                </Box>
            )}

            {isFolder && testCase?.displayId && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Display ID: <strong>{testCase.displayId}</strong>
                </Typography>
            )}

            {!isViewer && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, alignItems: 'center' }}>


                    {/* 테스트 케이스 추가 버튼 (신규 생성 모드에서 유용) */}
                    {/* Removed: onAddNew button moved to top */}
                    <Button
                        onClick={onCancel}
                        color="inherit"
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        {t('testcase.form.button.cancel', '취소')}
                    </Button>
                    <Button
                        onClick={onSave}
                        variant="contained"
                        color="primary"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ mr: 1 }}
                    >
                        {isSaving ? t('testcase.form.button.saving', '저장 중...') : (testCaseId ? t('testcase.form.button.update', '수정') : t('testcase.form.button.save', '저장'))}
                    </Button>
                    {testCaseId && testCase?.type === 'testcase' && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onCreateVersion}
                            startIcon={<SaveVersionIcon />}
                        >
                            {t('testcase.version.button.create', '버전 생성')}
                        </Button>
                    )}
                </Box>
            )}
        </>
    );
};

TestCaseFormHeader.propTypes = {
    testCaseId: PropTypes.string,
    testCase: PropTypes.object,
    currentVersion: PropTypes.object,
    isViewer: PropTypes.bool,
    isSaving: PropTypes.bool,
    isFolder: PropTypes.bool,
    t: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onVersionHistory: PropTypes.func,
    onCreateVersion: PropTypes.func,
    onAddNew: PropTypes.func,
    continueAdding: PropTypes.bool,
    onContinueAddingChange: PropTypes.func,
};

export default TestCaseFormHeader;
