// src/components/RecentTestResults.jsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Block,
  PlayArrow,
  Refresh,
  AccessTime,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
// ICT-194 Phase 2: 통합된 테스트 결과 상수 사용 (다국어 지원)
import { getLocalizedResultConfig } from '../utils/testResultConstants.js';
import { useI18n } from '../context/I18nContext';

const RecentTestResults = ({
  results = [],
  loading = false,
  error = null,
  onRefresh,
  showProjectInfo = true,
  showExecutionInfo = true,
  maxHeight = 400
}) => {
  const { t } = useI18n();
  const getResultConfig = (result) => getLocalizedResultConfig(result, t) || getLocalizedResultConfig('NOT_RUN', t);

  // Accordion state
  const [expanded, setExpanded] = React.useState(() => {
    const saved = localStorage.getItem('testcase-manager-recent-results-accordion');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
    localStorage.setItem('testcase-manager-recent-results-accordion', JSON.stringify(isExpanded));
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return t('recentResults.status.notRun');
    try {
      return formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: ko
      });
    } catch {
      return t('recentResults.status.unknown');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('recentResults.message.noResults')}
        </Typography>
      </Box>
    );
  }

  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('recentResults.title.withCount', { count: results.length })}
          </Typography>
          {onRefresh && (
            <Tooltip title={t('recentResults.button.refresh')}>
              <Box
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                sx={{
                  display: 'inline-flex',
                  cursor: 'pointer',
                  color: 'action.active',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                <Refresh fontSize="small" />
              </Box>
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Paper sx={{ maxHeight, overflow: 'auto', boxShadow: 'none' }}>
          <List sx={{ p: 0 }}>
            {results.map((result, index) => {
              const config = getResultConfig(result.result);
              const IconComponent = config.icon;

              return (
                <React.Fragment key={result.testResultId || index}>
                  <ListItem sx={{ py: 1.5, px: 2 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <IconComponent
                        sx={{
                          color: config.color,
                          fontSize: 20
                        }}
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {result.testCaseName || t('recentResults.testcase.fallback', { id: result.testCaseId })}
                          </Typography>
                          <Chip
                            label={config.label}
                            size="small"
                            sx={{
                              backgroundColor: config.color,
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {showProjectInfo && result.projectName && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('recentResults.label.project')} {result.projectName}
                            </Typography>
                          )}

                          {showExecutionInfo && result.testExecutionName && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('recentResults.label.execution')} {result.testExecutionName}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatRelativeTime(result.executedAt)}
                            </Typography>

                            {result.executedBy && (
                              <>
                                <Typography variant="caption" color="text.secondary">
                                  •
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {t('recentResults.label.executor')} {result.executedBy}
                                </Typography>
                              </>
                            )}
                          </Box>

                          {result.notes && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                fontStyle: 'italic',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {t('recentResults.label.notes')} {result.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>

                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

export default RecentTestResults;