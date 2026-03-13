import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

const TestResultFloatingMenu = ({
  onPrevious,
  onNext,
  onSave,
  onClose,
  currentIndex,
  totalCount,
  isViewer,
  loading,
  shouldShowJiraButton,
  handleOpenJiraDialog,
  testCase,
  saveButtonRef,
  t
}) => {
  const theme = useTheme();
  
  // Navigation disabled logic
  const prevDisabled = !onPrevious || currentIndex <= 0 || isViewer || totalCount <= 1;
  const nextDisabled = !onNext || currentIndex >= totalCount - 1 || isViewer || totalCount <= 1;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300, // Drawer나 Dialog 위에 떠야 함
        width: 'auto',
        maxWidth: '90vw',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 1,
          px: 2,
          borderRadius: 10, // Pill shape
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Navigation Section */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title={t('common.button.previous', '이전')}>
            <span>
              <IconButton 
                onClick={onPrevious} 
                disabled={prevDisabled}
                color="primary"
                size="medium"
              >
                <NavigateBeforeIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Box sx={{ minWidth: 60, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : '- / -'}
            </Typography>
          </Box>

          <Tooltip title={t('common.button.next', '다음')}>
            <span>
              <IconButton 
                onClick={onNext} 
                disabled={nextDisabled}
                color="primary"
                size="medium"
              >
                <NavigateNextIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />

        {/* Action Section */}
        <Stack direction="row" spacing={1} alignItems="center">
          {shouldShowJiraButton && shouldShowJiraButton() && !isViewer && (
            <Tooltip title={t('testResult.form.jiraComment', 'JIRA 코멘트')}>
              <IconButton
                color="warning"
                onClick={handleOpenJiraDialog}
                disabled={loading}
                size="medium"
              >
                <BugReportIcon />
              </IconButton>
            </Tooltip>
          )}

          <Button
            onClick={onClose}
            variant="text"
            color="inherit"
            sx={{ 
              borderRadius: 8, 
              px: 2,
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            {t('common.button.cancel', '취소')}
          </Button>
          
          {/* 모바일용 닫기 아이콘 */}
          <IconButton 
            onClick={onClose} 
            sx={{ display: { xs: 'flex', sm: 'none' } }}
            size="medium"
          >
            <CloseIcon />
          </IconButton>

          {!isViewer && (
            <Button
              ref={saveButtonRef}
              onClick={onSave}
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading || !testCase}
              sx={{ 
                borderRadius: 8, 
                px: 3,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                }
              }}
              data-testid="floating-save-button"
            >
              {t('common.button.save', '저장')}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default TestResultFloatingMenu;
