import React from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { NavigateBefore as NavigateBeforeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const TestResultHeader = ({
    onPrevious,
    onNext,
    currentIndex,
    totalCount,
    testCase,
    isViewer,
    t,
    hideButtons = false
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 3,
                p: 3,
                mb: 2,
                bgcolor: (theme) => theme.palette.background.paper,
                borderRadius: 2,
                boxShadow: 1
            }}
        >
            {!hideButtons && (
                <Button
                    variant="outlined"
                    startIcon={<NavigateBeforeIcon />}
                    onClick={onPrevious}
                    disabled={!onPrevious || currentIndex <= 0 || isViewer || totalCount <= 1}
                    sx={{ minWidth: 120 }}
                    data-testid="result-prev-button"
                >
                    {t('common.button.previous', '이전')}
                </Button>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }} data-testid="result-index-text">
                    {totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : '로딩 중...'}
                </Typography>
                {testCase?.displayId && (
                    <Typography variant="caption" color="text.secondary">
                        {testCase.displayId}
                    </Typography>
                )}
            </Box>

            {!hideButtons && (
                <Button
                    variant="outlined"
                    endIcon={<NavigateNextIcon />}
                    onClick={onNext}
                    disabled={!onNext || currentIndex >= totalCount - 1 || isViewer || totalCount <= 1}
                    sx={{ minWidth: 120 }}
                    data-testid="result-next-button"
                >
                    {t('common.button.next', '다음')}
                </Button>
            )}
        </Box>
    );
};

export default TestResultHeader;
