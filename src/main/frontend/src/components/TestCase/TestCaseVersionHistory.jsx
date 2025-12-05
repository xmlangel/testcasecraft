// src/components/TestCase/TestCaseVersionHistory.jsx

import React, { useState, useEffect } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Chip, Divider, Paper, Grid, CircularProgress, Alert
} from '@mui/material';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/I18nContext';
import VersionComparison from './VersionComparison';

const TestCaseVersionHistory = ({
  testCaseId,
  open,
  onClose,
  onRestore
}) => {
  const { api } = useAppContext();
  const { t } = useTranslation();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState([]);

  // 버전 히스토리 조회
  const fetchVersionHistory = async () => {
    if (!testCaseId || !open) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api(`/api/testcase-versions/testcase/${testCaseId}/history`);
      if (!response.ok) {
        throw new Error(t('testcase.versionHistory.error.fetchFailed'));
      }
      const data = await response.json();
      setVersions(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error(t('testcase.versionHistory.error.fetchError'), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersionHistory();
  }, [testCaseId, open]);

  // 버전 복원
  const handleRestore = async (versionId) => {
    try {
      setLoading(true);
      const response = await api(`/api/testcase-versions/${versionId}/restore`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(t('testcase.versionHistory.error.restoreFailed'));
      }

      const data = await response.json();
      if (onRestore) {
        onRestore(data.data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
      console.error(t('testcase.versionHistory.error.restoreError'), err);
    } finally {
      setLoading(false);
    }
  };

  // 버전 상세 보기
  const handleViewVersion = async (versionId) => {
    try {
      const response = await api(`/api/testcase-versions/${versionId}`);
      if (!response.ok) {
        throw new Error(t('testcase.versionHistory.error.viewFailed'));
      }
      const data = await response.json();
      setSelectedVersion(data.data);
    } catch (err) {
      console.error(t('testcase.versionHistory.error.viewError'), err);
      setError(t('testcase.versionHistory.error.viewFailed'));
    }
  };

  // 버전 비교
  const handleCompareVersions = (version1Id, version2Id) => {
    setCompareVersions([version1Id, version2Id]);
    setCompareDialogOpen(true);
  };

  // 변경 유형에 따른 색상 반환
  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'primary';
      case 'MANUAL_SAVE': return 'info';
      case 'RESTORE': return 'warning';
      default: return 'default';
    }
  };

  // 변경 유형 라벨 반환
  const getChangeTypeLabel = (changeType) => {
    switch (changeType) {
      case 'CREATE': return t('testcase.versionHistory.changeType.create');
      case 'UPDATE': return t('testcase.versionHistory.changeType.update');
      case 'MANUAL_SAVE': return t('testcase.versionHistory.changeType.manualSave');
      case 'RESTORE': return t('testcase.versionHistory.changeType.restore');
      default: return t('testcase.versionHistory.changeType.unknown');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { height: '80vh' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          {t('testcase.versionHistory.title')}
          <IconButton
            onClick={onClose}
            sx={{ marginLeft: 'auto' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {!loading && !error && (
            <List sx={{ p: 0 }}>
              {versions.map((version, index) => (
                <React.Fragment key={version.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      backgroundColor: version.isCurrentVersion ? 'action.selected' : 'transparent'
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {version.versionLabel}
                          </Typography>
                          {version.isCurrentVersion && (
                            <Chip
                              label={t('testcase.versionHistory.current')}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={getChangeTypeLabel(version.changeType)}
                            size="small"
                            color={getChangeTypeColor(version.changeType)}
                            variant="filled"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {version.changeSummary || t('testcase.versionHistory.changeSummary.empty')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {version.createdByName || t('testcase.versionHistory.creator.unknown')} • {' '}
                            {version.createdAt ? formatDistanceToNow(new Date(version.createdAt), {
                              addSuffix: true,
                              locale: ko
                            }) : t('testcase.versionHistory.time.unknown')}
                          </Typography>
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewVersion(version.id)}
                          title={t('testcase.versionHistory.action.view')}
                        >
                          <ViewIcon />
                        </IconButton>

                        {!version.isCurrentVersion && (
                          <IconButton
                            size="small"
                            onClick={() => handleRestore(version.id)}
                            title={t('testcase.versionHistory.action.restore')}
                            color="primary"
                          >
                            <RestoreIcon />
                          </IconButton>
                        )}

                        {index < versions.length - 1 && (
                          <IconButton
                            size="small"
                            onClick={() => handleCompareVersions(version.id, versions[index + 1].id)}
                            title={t('testcase.versionHistory.action.compare')}
                          >
                            <CompareIcon />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {index < versions.length - 1 && <Divider />}
                </React.Fragment>
              ))}

              {versions.length === 0 && !loading && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    {t('testcase.versionHistory.empty')}
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
      {/* 버전 상세 보기 다이얼로그 */}
      <Dialog
        open={!!selectedVersion}
        onClose={() => setSelectedVersion(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('testcase.versionDetail.title')} - {selectedVersion?.versionLabel}
        </DialogTitle>
        <DialogContent dividers>
          {selectedVersion && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>{t('testcase.versionDetail.section.basic')}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.name')}</strong> {selectedVersion.name}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.description')}</strong> {selectedVersion.description || t('testcase.versionDetail.field.none')}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.preCondition')}</strong> {selectedVersion.preCondition || t('testcase.versionDetail.field.none')}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.expectedResults')}</strong> {selectedVersion.expectedResults || t('testcase.versionDetail.field.none')}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.priority')}</strong> {selectedVersion.priority || t('testcase.versionDetail.field.none')}</Typography>
                </Paper>
              </Grid>

              {selectedVersion.steps && selectedVersion.steps.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>{t('testcase.versionDetail.section.steps')}</Typography>
                    {selectedVersion.steps.map((step, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>{t('testcase.versionDetail.step.number')} {step.stepNumber}:</strong> {step.action}
                        </Typography>
                        {step.expectedResult && (
                          <Typography variant="body2" color="text.secondary">
                            {t('testcase.versionDetail.step.expectedResult')} {step.expectedResult}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>{t('testcase.versionDetail.section.version')}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.versionNumber')}</strong> v{selectedVersion.versionNumber}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.changeType')}</strong> {getChangeTypeLabel(selectedVersion.changeType)}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.changeSummary')}</strong> {selectedVersion.changeSummary}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.creator')}</strong> {selectedVersion.createdByName}</Typography>
                  <Typography><strong>{t('testcase.versionDetail.field.createdAt')}</strong> {new Date(selectedVersion.createdAt).toLocaleString('ko-KR')}</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVersion(null)}>{t('testcase.versionDetail.button.close')}</Button>
        </DialogActions>
      </Dialog>
      {/* 버전 비교 다이얼로그 */}
      <VersionComparison
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        version1Id={compareVersions[1]}
        version2Id={compareVersions[0]}
      />
    </>
  );
};

export default TestCaseVersionHistory;