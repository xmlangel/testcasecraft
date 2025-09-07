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
import VersionComparison from './VersionComparison';

const TestCaseVersionHistory = ({ 
  testCaseId, 
  open, 
  onClose, 
  onRestore 
}) => {
  const { api } = useAppContext();
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
        throw new Error('버전 히스토리 조회에 실패했습니다.');
      }
      const data = await response.json();
      setVersions(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('버전 히스토리 조회 실패:', err);
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
        throw new Error('버전 복원에 실패했습니다.');
      }
      
      const data = await response.json();
      if (onRestore) {
        onRestore(data.data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('버전 복원 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 버전 상세 보기
  const handleViewVersion = async (versionId) => {
    try {
      const response = await api(`/api/testcase-versions/${versionId}`);
      if (!response.ok) {
        throw new Error('버전 상세 조회에 실패했습니다.');
      }
      const data = await response.json();
      setSelectedVersion(data.data);
    } catch (err) {
      console.error('버전 상세 조회 실패:', err);
      setError('버전 상세 조회에 실패했습니다.');
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
      case 'CREATE': return '생성';
      case 'UPDATE': return '수정';
      case 'MANUAL_SAVE': return '수동 저장';
      case 'RESTORE': return '복원';
      default: return '알 수 없음';
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          테스트케이스 버전 히스토리
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
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {version.versionLabel}
                          </Typography>
                          {version.isCurrentVersion && (
                            <Chip 
                              label="현재" 
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
                            {version.changeSummary || '변경 내용 없음'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {version.createdByName || '알 수 없음'} • {' '}
                            {version.createdAt ? formatDistanceToNow(new Date(version.createdAt), { 
                              addSuffix: true, 
                              locale: ko 
                            }) : '시간 정보 없음'}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewVersion(version.id)}
                          title="상세 보기"
                        >
                          <ViewIcon />
                        </IconButton>
                        
                        {!version.isCurrentVersion && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleRestore(version.id)}
                            title="이 버전으로 복원"
                            color="primary"
                          >
                            <RestoreIcon />
                          </IconButton>
                        )}
                        
                        {index < versions.length - 1 && (
                          <IconButton 
                            size="small"
                            onClick={() => handleCompareVersions(version.id, versions[index + 1].id)}
                            title="다음 버전과 비교"
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
                    버전 히스토리가 없습니다.
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
          버전 상세 정보 - {selectedVersion?.versionLabel}
        </DialogTitle>
        <DialogContent dividers>
          {selectedVersion && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>기본 정보</Typography>
                  <Typography><strong>이름:</strong> {selectedVersion.name}</Typography>
                  <Typography><strong>설명:</strong> {selectedVersion.description || '없음'}</Typography>
                  <Typography><strong>사전 조건:</strong> {selectedVersion.preCondition || '없음'}</Typography>
                  <Typography><strong>예상 결과:</strong> {selectedVersion.expectedResults || '없음'}</Typography>
                  <Typography><strong>우선순위:</strong> {selectedVersion.priority || '없음'}</Typography>
                </Paper>
              </Grid>
              
              {selectedVersion.steps && selectedVersion.steps.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>테스트 스텝</Typography>
                    {selectedVersion.steps.map((step, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>단계 {step.stepNumber}:</strong> {step.action}
                        </Typography>
                        {step.expectedResult && (
                          <Typography variant="body2" color="text.secondary">
                            예상 결과: {step.expectedResult}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>버전 정보</Typography>
                  <Typography><strong>버전 번호:</strong> v{selectedVersion.versionNumber}</Typography>
                  <Typography><strong>변경 유형:</strong> {getChangeTypeLabel(selectedVersion.changeType)}</Typography>
                  <Typography><strong>변경 요약:</strong> {selectedVersion.changeSummary}</Typography>
                  <Typography><strong>생성자:</strong> {selectedVersion.createdByName}</Typography>
                  <Typography><strong>생성 시간:</strong> {new Date(selectedVersion.createdAt).toLocaleString('ko-KR')}</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVersion(null)}>닫기</Button>
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