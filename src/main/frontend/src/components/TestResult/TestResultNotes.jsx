import React from 'react';
import { Box, Typography } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';

const TestResultNotes = ({
    notes,
    setNotes,
    isViewer,
    t,
    darkMode,
    height = 300
}) => {
    // 디버그 모드일 때 노트 내 첨부파일 URL 로그 출력
    React.useEffect(() => {
        const isDebug = localStorage.getItem('debug') === 'true';
        if (!isDebug || !notes) return;

        if (notes.includes('/api/testcase-attachments/public/')) {
            console.log('[DEBUG] Found public attachment URL in notes:', notes);
            const matches = notes.match(/\/api\/testcase-attachments\/public\/[^)"\s]+/g);
            if (matches) {
                console.log('[DEBUG] Extracted URLs from notes:', matches);
            }
        }
    }, [notes]);

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">{t('testResult.form.notes', '비고')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" color={notes.length >= 9500 ? 'error' : 'text.secondary'}>
                        {notes.length}/10,000
                    </Typography>
                </Box>
            </Box>

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
                    preview="live"
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
        </Box>
    );
};

export default TestResultNotes;
