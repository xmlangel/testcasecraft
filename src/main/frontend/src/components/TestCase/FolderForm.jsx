// src/components/TestCase/FolderForm.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    TextField,
    CircularProgress,
    Snackbar,

    Alert,
    Autocomplete,
    Chip,
} from '@mui/material';
import TestCaseFormHeader from './TestCaseFormHeader.jsx';
import TestCaseFormMetadata from './TestCaseFormMetadata.jsx';
import MarkdownFieldEditor from './MarkdownFieldEditor.jsx';
import VersionDialog from './VersionDialog.jsx';

/**
 * 폴더 생성/수정 폼 컴포넌트
 */
const FolderForm = ({
    testCaseId,
    testCase,
    errors,
    projectId,
    isViewer,
    isSaving,
    infoOpen,
    setInfoOpen,
    folderInfoOpen,
    setFolderInfoOpen,
    snackbarOpen,
    snackbarError,
    versionDialogOpen,
    versionLabel,
    versionDescription,
    savingVersion,
    t,
    theme,
    onSave,
    onCancel,
    onChange,
    onMarkdownPaste,
    onSnackbarClose,
    onVersionLabelChange,
    onVersionDescriptionChange,
    onSaveVersion,
    onCancelVersion,
    onAddNew,
    availableTags,
    onTagChange,
}) => {
    const isSaveDisabled = () => {
        if (isViewer) return true;
        if (!testCase.name || !testCase.name.trim()) return true;
        return false;
    };

    return (
        <Card sx={{ minHeight: 400 }}>
            <CardContent>
                <TestCaseFormHeader
                    testCaseId={testCaseId}
                    testCase={testCase}
                    isViewer={isViewer}
                    isSaving={isSaving}
                    isFolder={true}
                    t={t}
                    onSave={onSave}
                    onCancel={onCancel}
                    onAddNew={onAddNew}
                />

                <TestCaseFormMetadata
                    testCase={testCase}
                    projectId={projectId}
                    infoOpen={infoOpen}
                    setInfoOpen={setInfoOpen}
                    isViewer={isViewer}
                    t={t}
                    onChange={onChange}
                />

                <Box sx={{ mt: 2 }}>
                    <TextField
                        label={t('testcase.form.name', '이름')}
                        value={testCase.name || ''}
                        onChange={onChange('name')}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.name}
                        placeholder={t('testcase.form.folderName', '폴더 이름')}
                        helperText={errors.name}
                        disabled={isViewer}
                    />

                    <MarkdownFieldEditor
                        label={t('testcase.form.description', '설명')}
                        value={testCase.description || ''}
                        placeholder={t('testcase.form.folderDescription', '폴더 설명')}
                        height={300}
                        isViewer={isViewer}
                        theme={theme}
                        t={t}
                        onChange={(value) => onChange('description')({ target: { value } })}
                        onPaste={(event) => onMarkdownPaste(event, { type: 'field', field: 'description' })}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={availableTags || []}
                            value={testCase.tags || []}
                            onChange={(event, newValue) => onTagChange(newValue)}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => {
                                    const { key, ...tagProps } = getTagProps({ index });
                                    return (
                                        <Chip
                                            key={key}
                                            variant="outlined"
                                            label={option}
                                            {...tagProps}
                                            disabled={isViewer}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label={t('testcase.form.tags', '태그')}
                                    placeholder={t('testcase.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                                    helperText={t('testcase.helper.folderTags', '폴더에 태그를 추가하면 하위 모든 테스트케이스에도 적용됩니다 (자동 전파)')}
                                    margin="normal"
                                />
                            )}
                            disabled={isViewer}
                        />
                    </Box>
                </Box>
            </CardContent>

            <CardActions>
                {!isViewer && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSave}
                        disabled={isSaveDisabled() || isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSaving ? t('testcase.button.saving', '저장 중...') : t('testcase.button.save', '저장')}
                    </Button>
                )}
            </CardActions>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={onSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={onSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {t('testcase.message.saved', '저장되었습니다.')}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!snackbarError}
                autoHideDuration={4000}
                onClose={onSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={onSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {snackbarError}
                </Alert>
            </Snackbar>

            <VersionDialog
                open={versionDialogOpen}
                versionLabel={versionLabel}
                versionDescription={versionDescription}
                savingVersion={savingVersion}
                t={t}
                onSave={onSaveVersion}
                onCancel={onCancelVersion}
                onLabelChange={onVersionLabelChange}
                onDescriptionChange={onVersionDescriptionChange}
            />
        </Card>
    );
};

FolderForm.propTypes = {
    testCaseId: PropTypes.string,
    testCase: PropTypes.object.isRequired,
    errors: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    isViewer: PropTypes.bool,
    isSaving: PropTypes.bool,
    infoOpen: PropTypes.bool.isRequired,
    setInfoOpen: PropTypes.func.isRequired,
    folderInfoOpen: PropTypes.bool.isRequired,
    setFolderInfoOpen: PropTypes.func.isRequired,
    snackbarOpen: PropTypes.bool.isRequired,
    snackbarError: PropTypes.string,
    versionDialogOpen: PropTypes.bool.isRequired,
    versionLabel: PropTypes.string.isRequired,
    versionDescription: PropTypes.string.isRequired,
    savingVersion: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onMarkdownPaste: PropTypes.func.isRequired,
    onSnackbarClose: PropTypes.func.isRequired,
    onVersionLabelChange: PropTypes.func.isRequired,
    onVersionDescriptionChange: PropTypes.func.isRequired,
    onSaveVersion: PropTypes.func.isRequired,
    onCancelVersion: PropTypes.func.isRequired,
    onAddNew: PropTypes.func,
    availableTags: PropTypes.array,
    onTagChange: PropTypes.func,
};

export default FolderForm;
