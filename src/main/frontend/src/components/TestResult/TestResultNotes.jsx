import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { NavigateBefore as NavigateBeforeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import MDEditor from '@uiw/react-md-editor';

const TestResultNotes = ({
    notes,
    setNotes,
    isViewer,
    t,
    darkMode,
    height = 300,
    onNext,
    onPrevious,
    currentIndex,
    totalCount
}) => {
    // localStorage key
    const STORAGE_KEY = 'notes-editor-preview-mode';

    // 에디터 모드 상태 (edit, live, preview)
    const [previewMode, setPreviewMode] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        // 초기값이 없을 경우: 내용이 있으면 preview, 없으면 live
        return (notes && notes.length > 0) ? 'preview' : 'live';
    });

    // 전체화면 상태 감지
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 에스케이프 키 또는 MDEditor의 전체화면 토글 감지를 위한 효과
    useEffect(() => {
        const handleFullscreenChange = () => {
            // MDEditor는 클래스 이름 변경으로 전체화면을 처리하므로 DOM 상태 확인
            const editorElement = document.querySelector('.w-md-editor-fullscreen');
            setIsFullscreen(!!editorElement);
        };

        const observer = new MutationObserver(handleFullscreenChange);
        const editorContainer = document.querySelector('[data-testid="result-notes-input"]')?.closest('.w-md-editor');
        
        if (editorContainer) {
            observer.observe(editorContainer, { attributes: true, attributeFilter: ['class'] });
        }

        return () => observer.disconnect();
    }, []);

    // 디버그 모드일 때 노트 내 첨부파일 URL 로그 출력
    useEffect(() => {
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

    // 모드 변경 핸들러
    const handleModeChange = (mode) => {
        if (!mode) return;
        setPreviewMode(mode);
        localStorage.setItem(STORAGE_KEY, mode);
    };

    return (
        <Box sx={{ mt: 2, position: 'relative' }}>
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
                        if (value !== undefined && value !== null && value.length <= 10000) {
                            setNotes(value);
                        } else if (value === undefined || value === null || value === '') {
                            setNotes('');
                        }
                    }}
                    preview={previewMode}
                    height={height}
                    disabled={isViewer}
                    textareaProps={{
                        'data-testid': 'result-notes-input'
                    }}
                />
                
                {/* 전체화면 모드일 때 상단 내비게이션 바 */}
                {isFullscreen && (
                    <Box sx={{
                        position: 'fixed',
                        top: 10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        px: 3,
                        py: 1,
                        borderRadius: 10,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <Button
                            variant="text"
                            startIcon={<NavigateBeforeIcon />}
                            onClick={onPrevious}
                            disabled={!onPrevious || currentIndex <= 0 || isViewer || totalCount <= 1}
                            sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
                        >
                            {t('common.button.previous', '이전')}
                        </Button>
                        
                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mx: 2 }}>
                            {totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : ''}
                        </Typography>

                        <Button
                            variant="text"
                            endIcon={<NavigateNextIcon />}
                            onClick={onNext}
                            disabled={!onNext || currentIndex >= totalCount - 1 || isViewer || totalCount <= 1}
                            sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
                        >
                            {t('common.button.next', '다음')}
                        </Button>
                    </Box>
                )}

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
