import React from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, TextField } from '@mui/material';
import { TextFields as TextFieldsIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import MDEditor from '@uiw/react-md-editor';

const TestResultNotes = ({
    notes,
    setNotes,
    isMarkdownMode,
    setIsMarkdownMode,
    isViewer,
    t,
    darkMode,
    height = 300
}) => {
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <ToggleButtonGroup
                    value={isMarkdownMode ? 'markdown' : 'text'}
                    exclusive
                    onChange={(e, newMode) => {
                        if (newMode !== null) {
                            setIsMarkdownMode(newMode === 'markdown');
                        }
                    }}
                    size="small"
                    disabled={isViewer}
                >
                    <ToggleButton value="text" aria-label="text mode">
                        <TextFieldsIcon sx={{ mr: 0.5 }} fontSize="small" />
                        {t('testResult.form.mode.text', '텍스트')}
                    </ToggleButton>
                    <ToggleButton value="markdown" aria-label="markdown mode">
                        <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
                        {t('testResult.form.mode.markdown', 'Markdown')}
                    </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color={notes.length >= 9500 ? 'error' : 'text.secondary'}>
                    {notes.length}/10,000
                </Typography>
            </Box>

            {isMarkdownMode ? (
                <Box sx={{ mt: 1 }} data-color-mode={darkMode ? 'dark' : 'light'}>
                    <MDEditor
                        value={notes}
                        onChange={(value) => {
                            if (value && value.length <= 10000) {
                                setNotes(value);
                            } else if (!value) {
                                setNotes('');
                            }
                        }}
                        preview="edit"
                        height={height}
                        disabled={isViewer}
                    />
                    {notes.length >= 9500 && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            {notes.length >= 10000 ? t('testResult.form.notesLimitError') :
                                t('testResult.form.notesLimitWarning', { remaining: 10000 - notes.length })}
                        </Typography>
                    )}
                </Box>
            ) : (
                <TextField
                    label={t('testResult.form.notesPlaceholder', { length: notes.length })}
                    value={notes}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= 10000) {
                            setNotes(newValue);
                        }
                    }}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ mt: 1 }}
                    disabled={isViewer}
                    error={notes.length >= 9500}
                    helperText={
                        notes.length >= 10000 ? t('testResult.form.notesLimitError') :
                            notes.length >= 9500 ? t('testResult.form.notesLimitWarning', { remaining: 10000 - notes.length }) :
                                t('testResult.form.notesHelp')
                    }
                />
            )}
        </>
    );
};

export default TestResultNotes;
