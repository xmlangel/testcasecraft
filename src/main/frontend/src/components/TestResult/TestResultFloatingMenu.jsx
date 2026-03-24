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
  result,
  onResultChange,
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
  t,
  isNotesFullscreen = false
}) => {
  const theme = useTheme();
  
  // Navigation disabled logic
  const prevDisabled = !onPrevious || currentIndex <= 0 || isViewer || totalCount <= 1;
  const nextDisabled = !onNext || currentIndex >= totalCount - 1 || isViewer || totalCount <= 1;

  const resultOptions = [
    { value: 'NOTRUN', label: 'N', color: theme.palette.grey[500], tooltip: t('testResult.status.notRun', '실행 안 함') },
    { value: 'PASS', label: 'P', color: theme.palette.success.main, tooltip: t('testResult.status.pass', '성공') },
    { value: 'FAIL', label: 'F', color: theme.palette.error.main, tooltip: t('testResult.status.fail', '실패') },
    { value: 'BLOCKED', label: 'B', color: theme.palette.warning.main, tooltip: t('testResult.status.blocked', '차단됨') },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: isNotesFullscreen ? 11000 : 1300,
        width: 'auto',
        maxWidth: '95vw',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 0.8,
          px: 1.5,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Navigation Section */}
        <Stack direction="row" alignItems="center" spacing={0}>
          <Tooltip title={t('common.button.previous', '이전')}>
            <span>
              <IconButton 
                onClick={onPrevious} 
                disabled={prevDisabled}
                color="primary"
                size="small"
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Box sx={{ minWidth: 45, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
              {totalCount > 0 ? `${currentIndex + 1}/${totalCount}` : '-/-'}
            </Typography>
          </Box>

          <Tooltip title={t('common.button.next', '다음')}>
            <span>
              <IconButton 
                onClick={onNext} 
                disabled={nextDisabled}
                color="primary"
                size="small"
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

        {/* Result Selection Section */}
        <Stack direction="row" spacing={0.5} sx={{ px: 0.5 }}>
          {resultOptions.map((opt) => (
            <Tooltip key={opt.value} title={opt.tooltip}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => !isViewer && onResultChange(opt.value)}
                  disabled={isViewer}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    bgcolor: result === opt.value ? opt.color : 'transparent',
                    color: result === opt.value ? '#fff' : opt.color,
                    border: `1px solid ${opt.color}`,
                    '&:hover': {
                      bgcolor: result === opt.value ? opt.color : alpha(opt.color, 0.1),
                    },
                    transition: 'all 0.2s',
                    transform: result === opt.value ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {opt.label}
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

        {/* Action Section */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {shouldShowJiraButton && shouldShowJiraButton() && !isViewer && (
            <Tooltip title={t('testResult.form.jiraComment', 'JIRA 코멘트')}>
              <span>
                <IconButton
                  color="warning"
                  onClick={handleOpenJiraDialog}
                  disabled={loading}
                  size="small"
                >
                  <BugReportIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}

          <Button
            onClick={onClose}
            variant="text"
            color="inherit"
            size="small"
            sx={{ 
              borderRadius: 8, 
              px: 1.5,
              fontSize: '0.8rem',
              display: { xs: 'none', md: 'inline-flex' }
            }}
          >
            {t('common.button.cancel', '취소')}
          </Button>
          
          <IconButton 
            onClick={onClose} 
            sx={{ display: { xs: 'flex', md: 'none' } }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {!isViewer && (
            <Button
              ref={saveButtonRef}
              onClick={onSave}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon fontSize="small" />}
              disabled={loading || !testCase}
              sx={{ 
                borderRadius: 8, 
                px: 2,
                fontSize: '0.8rem',
                minWidth: '70px',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
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
