// src/components/TestCase/VersionComparison.jsx

import React, { useState, useEffect } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Grid, Paper, Chip, Alert, CircularProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Compare as CompareIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext';

// Helper component to display version details
const VersionDetail = ({ version }) => {
  if (!version) return null;

  return (
    <Accordion sx={{ mt: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2">상세 내용 보기</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: 'background.paper', p: 2 }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>이름:</Typography>
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}><Typography variant="body2">{version.name}</Typography></Paper>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>설명:</Typography>
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{version.description || '-'}</Typography></Paper>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>사전 조건:</Typography>
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{version.preCondition || '-'}</Typography></Paper>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>예상 결과:</Typography>
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{version.expectedResults || '-'}</Typography></Paper>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>우선순위:</Typography>
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}><Typography variant="body2">{version.priority || '-'}</Typography></Paper>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>테스트 스텝:</Typography>
          {version.steps && version.steps.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '10%' }}>#</TableCell>
                    <TableCell sx={{ width: '45%' }}>Action</TableCell>
                    <TableCell sx={{ width: '45%' }}>Expected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {version.steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step, index) => (
                    <TableRow key={index}>
                      <TableCell>{step.stepNumber}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{step.description}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{step.expectedResult}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2">-</Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const VersionComparison = ({
  open,
  onClose,
  version1Id,
  version2Id
}) => {
  const { api } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [version1, setVersion1] = useState(null);
  const [version2, setVersion2] = useState(null);

  // 버전 비교 데이터 조회
  const fetchComparisonData = async () => {
    if (!version1Id || !version2Id || !open) return;

    setLoading(true);
    setError(null);

    try {
      // 버전 비교 API 호출
      const comparisonResponse = await api(`/api/testcase-versions/${version1Id}/compare/${version2Id}`);
      if (!comparisonResponse.ok) {
        throw new Error('버전 비교 데이터 조회에 실패했습니다.');
      }
      const comparisonResult = await comparisonResponse.json();
      setComparisonData(comparisonResult.data);

      // 개별 버전 상세 정보 조회
      const [version1Response, version2Response] = await Promise.all([
        api(`/api/testcase-versions/${version1Id}`),
        api(`/api/testcase-versions/${version2Id}`)
      ]);

      if (version1Response.ok && version2Response.ok) {
        const v1Data = await version1Response.json();
        const v2Data = await version2Response.json();
        setVersion1(v1Data.data);
        setVersion2(v2Data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('버전 비교 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, [version1Id, version2Id, open]);

  // 변경 유형에 따른 아이콘과 색상
  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'ADDED': return { icon: <AddIcon />, color: 'success' };
      case 'REMOVED': return { icon: <RemoveIcon />, color: 'error' };
      case 'MODIFIED': return { icon: <EditIcon />, color: 'warning' };
      default: return { icon: <EditIcon />, color: 'default' };
    }
  };

  // 필드별 비교 결과 렌더링
  const renderFieldComparison = (fieldName, fieldLabel, changes) => {
    if (!changes || changes.length === 0) return null;

    return (
      <Accordion key={fieldName} expanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {fieldLabel}
            <Chip size="small" label={`${changes.length}개 변경`} color="primary" />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>변경 유형</TableCell>
                  <TableCell>{version2?.versionLabel || 'Version 2'}</TableCell>
                  <TableCell>{version1?.versionLabel || 'Version 1'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changes.map((change, index) => {
                  const { icon, color } = getChangeIcon(change.changeType);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          icon={icon}
                          label={change.changeType}
                          size="small"
                          color={color}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: change.changeType === 'ADDED' ? 'rgba(46, 125, 50, 0.1)' :
                              change.changeType === 'MODIFIED' ? 'rgba(245, 124, 0, 0.1)' : 'transparent',
                            borderRadius: 1,
                            borderLeft: change.changeType !== 'REMOVED' ? `3px solid ${change.changeType === 'ADDED' ? '#2e7d32' :
                                change.changeType === 'MODIFIED' ? '#f57c00' : 'transparent'
                              }` : 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {change.newValue || '-'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: change.changeType === 'REMOVED' ? 'rgba(211, 47, 47, 0.1)' :
                              change.changeType === 'MODIFIED' ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                            borderRadius: 1,
                            borderLeft: change.changeType !== 'ADDED' ? `3px solid ${change.changeType === 'REMOVED' ? '#d32f2f' :
                                change.changeType === 'MODIFIED' ? '#bdbdbd' : 'transparent'
                              }` : 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {change.oldValue || '-'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };

  // 테스트 스텝 비교 렌더링
  const renderStepComparison = (stepChanges) => {
    if (!stepChanges || stepChanges.length === 0) return null;

    return (
      <Accordion expanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            테스트 스텝
            <Chip size="small" label={`${stepChanges.length}개 변경`} color="primary" />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {stepChanges.map((stepChange, index) => {
              const { icon, color } = getChangeIcon(stepChange.changeType);
              return (
                <Grid size={{ xs: 12 }} key={index}>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        icon={icon}
                        label={stepChange.changeType}
                        size="small"
                        color={color}
                      />
                      <Typography variant="subtitle2">
                        Step {stepChange.stepNumber}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          {version2?.versionLabel || 'Version 2'}
                        </Typography>
                        <Box
                          sx={{
                            p: 1,
                            mt: 1,
                            bgcolor: stepChange.changeType === 'ADDED' ? 'rgba(46, 125, 50, 0.1)' :
                              stepChange.changeType === 'MODIFIED' ? 'rgba(245, 124, 0, 0.1)' :
                                (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
                            borderRadius: 1,
                            minHeight: 60,
                            borderLeft: stepChange.changeType !== 'REMOVED' ? `3px solid ${stepChange.changeType === 'ADDED' ? '#2e7d32' :
                                stepChange.changeType === 'MODIFIED' ? '#f57c00' : 'transparent'
                              }` : 'none',
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            <strong>Action:</strong> {stepChange.newStep?.action || '-'}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            <strong>Expected:</strong> {stepChange.newStep?.expectedResult || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          {version1?.versionLabel || 'Version 1'}
                        </Typography>
                        <Box
                          sx={{
                            p: 1,
                            mt: 1,
                            bgcolor: stepChange.changeType === 'REMOVED' ? 'rgba(211, 47, 47, 0.1)' :
                              stepChange.changeType === 'MODIFIED' ? 'rgba(0, 0, 0, 0.05)' :
                                (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
                            borderRadius: 1,
                            minHeight: 60,
                            borderLeft: stepChange.changeType !== 'ADDED' ? `3px solid ${stepChange.changeType === 'REMOVED' ? '#d32f2f' :
                                stepChange.changeType === 'MODIFIED' ? '#bdbdbd' : 'transparent'
                              }` : 'none',
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            <strong>Action:</strong> {stepChange.oldStep?.action || '-'}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            <strong>Expected:</strong> {stepChange.oldStep?.expectedResult || '-'}
                          </Typography>
                        </Box>                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: { height: '90vh' }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CompareIcon />
        버전 비교
        {version1 && version2 && (
          <Typography variant="subtitle2" color="text.secondary">
            ({version2.versionLabel} ↔ {version1.versionLabel})
          </Typography>
        )}
        <Button
          onClick={onClose}
          sx={{ marginLeft: 'auto' }}
          size="small"
          startIcon={<CloseIcon />}
        >
          닫기
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>버전을 비교하고 있습니다...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && comparisonData && (
          <Box sx={{ p: 2 }}>
            {/* 버전 정보 헤더 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {version2?.versionLabel} (새 버전)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {version2?.changeSummary}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {version2?.createdByName} • {' '}
                    {version2?.createdAt ? formatDistanceToNow(new Date(version2.createdAt), {
                      addSuffix: true,
                      locale: ko
                    }) : ''}
                  </Typography>
                  <VersionDetail version={version2} />
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {version1?.versionLabel} (이전 버전)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {version1?.changeSummary}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {version1?.createdByName} • {' '}
                    {version1?.createdAt ? formatDistanceToNow(new Date(version1.createdAt), {
                      addSuffix: true,
                      locale: ko
                    }) : ''}
                  </Typography>
                  <VersionDetail version={version1} />
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* 비교 결과 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                변경 사항 요약
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {comparisonData.totalChanges > 0 ? (
                  <>
                    <Chip label={`총 ${comparisonData.totalChanges}개 변경`} color="info" />
                    {comparisonData.hasStepChanges && <Chip label="스텝 변경" color="warning" />}
                    {comparisonData.hasFieldChanges && <Chip label="필드 변경" color="primary" />}
                  </>
                ) : (
                  <Chip label="변경 사항 없음" color="success" />
                )}
              </Box>
            </Box>

            {comparisonData.totalChanges > 0 && (
              <Box>
                {/* 기본 정보 변경 사항 */}
                {comparisonData.fieldChanges?.name &&
                  renderFieldComparison('name', '테스트 이름', comparisonData.fieldChanges.name)}

                {comparisonData.fieldChanges?.description &&
                  renderFieldComparison('description', '설명', comparisonData.fieldChanges.description)}

                {comparisonData.fieldChanges?.preCondition &&
                  renderFieldComparison('preCondition', '사전 조건', comparisonData.fieldChanges.preCondition)}

                {comparisonData.fieldChanges?.expectedResults &&
                  renderFieldComparison('expectedResults', '예상 결과', comparisonData.fieldChanges.expectedResults)}

                {comparisonData.fieldChanges?.priority &&
                  renderFieldComparison('priority', '우선순위', comparisonData.fieldChanges.priority)}

                {/* 테스트 스텝 변경 사항 */}
                {comparisonData.stepChanges &&
                  renderStepComparison(comparisonData.stepChanges)}
              </Box>
            )}

            {comparisonData.totalChanges === 0 && (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  두 버전이 동일합니다
                </Typography>
                <Typography color="text.secondary">
                  선택한 버전들 간에 차이점이 없습니다.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionComparison;
