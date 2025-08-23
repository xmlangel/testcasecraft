// src/components/TestCase/TestResultExportDialog.jsx
// ICT-194 Phase 2: TestResultDetailTable 컴포넌트 분할 - 내보내기 다이얼로그 분리

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext.jsx';
import { API_ENDPOINTS, buildUrl } from '../../utils/apiConstants.js';

/**
 * 테스트 결과 내보내기 다이얼로그 컴포넌트
 * ICT-190 기능을 별도 컴포넌트로 분리하여 재사용성 향상
 */
const TestResultExportDialog = ({
  open,
  onClose,
  projectId,
  visibleColumns = [],
  totalRows = 0,
  activeProject = null
}) => {
  const { api } = useAppContext();
  const [exportFormat, setExportFormat] = useState('EXCEL');
  const [exporting, setExporting] = useState(false);

  // 내보내기 형식 옵션
  const exportFormats = [
    {
      value: 'EXCEL',
      title: 'Excel (.xlsx)',
      description: '서식과 차트 포함, 업무용 보고서에 최적',
      icon: '📊',
      features: ['통계 차트 포함', '서식 유지', '필터링 가능']
    },
    {
      value: 'PDF',
      title: 'PDF (.pdf)',
      description: '인쇄 및 공유용, 레이아웃 고정',
      icon: '📋',
      features: ['인쇄 최적화', '레이아웃 고정', '범용 호환성']
    },
    {
      value: 'CSV',
      title: 'CSV (.csv)',
      description: '데이터 분석용, 가벼운 파일 크기',
      icon: '📈',
      features: ['데이터 분석 최적', '가벼운 용량', '호환성 우수']
    }
  ];

  /**
   * 내보내기 실행
   */
  const handleExportConfirm = async () => {
    if (!projectId) {
      alert('프로젝트가 선택되지 않았습니다.');
      return;
    }

    try {
      setExporting(true);

      // 표시되는 컬럼들의 필드명 가져오기
      const displayColumns = visibleColumns.map(col => {
        switch (col.field) {
          case 'folder': return 'folderPath';
          case 'testCase': return 'testCaseName';
          case 'result': return 'result';
          case 'executedDate': return 'executedAt';
          case 'executor': return 'executorName';
          case 'notes': return 'notes';
          case 'jiraId': return 'jiraIssueKey';
          case 'jiraStatus': return 'jiraStatus';
          // ICT-277: 새로 추가된 컬럼들 매핑 추가
          case 'preCondition': return 'preCondition';
          case 'expectedResults': return 'expectedResults';
          case 'steps': return 'steps';
          default: return col.field;
        }
      });

      // 내보내기 필터 생성
      const exportFilter = {
        projectId: projectId,
        exportFormat: exportFormat,
        displayColumns: displayColumns,
        includeStatistics: true,
        page: 0,
        size: 10000 // 최대 10,000건으로 제한
      };

      // API 호출
      const response = await api(buildUrl(API_ENDPOINTS.TEST_RESULTS.EXPORT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportFilter)
      });

      if (!response.ok) {
        throw new Error(`내보내기 실패: ${response.status} ${response.statusText}`);
      }

      // 파일 다운로드
      const blob = await response.blob();
      const fileExtension = exportFormat.toLowerCase() === 'excel' ? 'xlsx' : exportFormat.toLowerCase();
      const fileName = `테스트결과_${activeProject?.name || 'export'}_${format(new Date(), 'yyyyMMdd_HHmm')}.${fileExtension}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
      
    } catch (error) {
      console.error('내보내기 오류:', error);
      alert('파일 내보내기 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 3 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center',
        gap: 1
      }}>
        <FileDownloadIcon />
        테스트 결과 내보내기
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          {/* 파일 형식 선택 */}
          <Typography variant="h6" gutterBottom color="primary">
            📄 내보내기 형식 선택
          </Typography>
          <Grid container spacing={2}>
            {exportFormats.map((format) => (
              <Grid item xs={12} md={4} key={format.value}>
                <Card 
                  variant={exportFormat === format.value ? "outlined" : "elevation"}
                  sx={{ 
                    cursor: 'pointer', 
                    border: exportFormat === format.value ? '2px solid' : '1px solid',
                    borderColor: exportFormat === format.value ? 'primary.main' : 'divider',
                    bgcolor: exportFormat === format.value ? 'primary.light' : 'background.paper',
                    '&:hover': { 
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => setExportFormat(format.value)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {format.icon}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      color={exportFormat === format.value ? 'primary.dark' : 'text.primary'}
                    >
                      {format.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {format.description}
                    </Typography>
                    <Box>
                      {format.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            m: 0.25, 
                            fontSize: '0.75rem',
                            bgcolor: exportFormat === format.value ? 'white' : 'transparent'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 내보내기 정보 요약 */}
        <Box sx={{ 
          bgcolor: 'grey.50', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 내보내기 정보
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  📊 총 데이터 건수:
                </Typography>
                <Chip label={`${totalRows}건`} size="small" color="primary" />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  🔍 표시 컬럼 수:
                </Typography>
                <Chip label={`${visibleColumns.length}개`} size="small" color="secondary" />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                📂 내보낼 컬럼: {visibleColumns.map(col => col.headerName).join(', ')}
              </Typography>
            </Grid>
          </Grid>

          {/* 형식별 안내 메시지 */}
          {exportFormat === 'EXCEL' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 Excel 형식에는 통계 차트와 요약 시트가 별도로 포함됩니다.
              </Typography>
            </Alert>
          )}

          {exportFormat === 'PDF' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                🖨️ PDF는 A4 용지에 최적화되어 인쇄하기 좋습니다.
              </Typography>
            </Alert>
          )}

          {exportFormat === 'CSV' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                📈 CSV는 데이터만 포함되며, Excel이나 Google Sheets에서 열어보세요.
              </Typography>
            </Alert>
          )}
        </Box>

        {/* 내보내기 진행 상태 */}
        {exporting && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2, 
            mt: 3,
            p: 3,
            bgcolor: 'primary.light',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.main'
          }}>
            <CircularProgress size={24} color="primary" />
            <Typography variant="body1" color="primary.dark" fontWeight="medium">
              파일을 생성하고 있습니다... 잠시만 기다려주세요
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button 
          onClick={onClose}
          disabled={exporting}
          size="large"
          sx={{ minWidth: 100 }}
        >
          취소
        </Button>
        <Button 
          onClick={handleExportConfirm}
          variant="contained"
          disabled={exporting || totalRows === 0}
          startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
          size="large"
          sx={{ 
            minWidth: 140,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 4
            }
          }}
        >
          {exporting ? '생성 중...' : `${exportFormat} 내보내기`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestResultExportDialog;