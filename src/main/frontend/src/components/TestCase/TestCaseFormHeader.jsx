// src/components/TestCase/TestCaseFormHeader.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
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
}) => {
    return (
        <>
            <Typography variant="h6" gutterBottom>
                {isFolder
                    ? (testCaseId ? t('testcase.form.folder.edit', '테스트 폴더 수정') : t('testcase.form.folder.create', '테스트 폴더 생성'))
                    : (testCaseId ? t('testcase.form.title.edit', '테스트케이스 수정') : t('testcase.form.title.create', '테스트케이스 생성'))
                }
            </Typography>

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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
                    >
                        {isSaving ? t('testcase.form.button.saving', '저장 중...') : (testCaseId ? t('testcase.form.button.update', '수정') : t('testcase.form.button.save', '저장'))}
                    </Button>
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
};

export default TestCaseFormHeader;
