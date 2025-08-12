// src/components/TestCase/TestResultDetailTable.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Link,
  Button,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  gridClasses
} from '@mui/x-data-grid';
import {
  Launch as LaunchIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  GetApp as GetAppIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext.jsx';
import { TestResult } from '../../models/testExecution.jsx';
import jiraService from '../../services/jiraService.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const TestResultDetailTable = ({ projectId, onViewResult, dense = false }) => {
  const { testCases, activeProject, user, api } = useAppContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jiraConfig, setJiraConfig] = useState(null);
  const [columnVisibilityMenuAnchor, setColumnVisibilityMenuAnchor] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState({
    folder: true,
    testCase: true,
    result: true,
    executedDate: true,
    executor: true,
    notes: true,
    jiraId: true,
    jiraStatus: false // 기본적으로 숨김
  });

  // ICT-190: 내보내기 기능 상태
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('EXCEL');
  const [exporting, setExporting] = useState(false);

  // 테스트 결과 상태별 색상 매핑
  const resultColors = {
    [TestResult.PASS]: 'success',
    [TestResult.FAIL]: 'error',
    [TestResult.BLOCKED]: 'warning',
    [TestResult.NOT_RUN]: 'default'
  };

  // JIRA 설정 로드
  useEffect(() => {
    const loadJiraConfig = async () => {
      try {
        const config = await jiraService.getActiveConfig();
        setJiraConfig(config);
      } catch (error) {
        console.warn('JIRA 설정을 불러올 수 없습니다:', error);
      }
    };
    loadJiraConfig();
  }, []);

  // 테스트 결과 데이터 로드
  useEffect(() => {
    const fetchTestResults = async () => {
      if (!projectId || !testCases) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ICT-185: 새로운 테스트 결과 리포트 API 사용
        const response = await api(`${API_BASE_URL}/api/test-results/report?projectId=${projectId}&page=0&size=1000`);
        if (!response.ok) {
          throw new Error('테스트 결과를 불러올 수 없습니다');
        }

        const reportData = await response.json();
        const testResults = reportData.content || [];
        
        // 테이블 데이터 구성 - ICT-185 리포트 응답 구조에 맞춰 수정
        const tableData = testResults.map((result, index) => {
          const testCase = testCases.find(tc => tc.id === result.testCaseId);
          const parentFolder = testCase?.parentId 
            ? testCases.find(tc => tc.id === testCase.parentId) 
            : null;

          // JIRA ID는 이미 분리되어 있음
          const jiraId = result.jiraIssueKey;
          // 추가 JIRA ID 추출 (비고 필드에서)
          const additionalJiraIds = jiraService.extractIssueKeys(result.notes || '');
          const allJiraIds = jiraId ? [jiraId, ...additionalJiraIds.filter(id => id !== jiraId)] : additionalJiraIds;
          const hasMultipleJiraIds = allJiraIds.length > 1;

          return {
            id: `${result.testCaseId}-${result.testExecutionId}-${index}`,
            testCaseId: result.testCaseId,
            resultId: index, // 고유 ID로 사용
            folder: result.folderPath || parentFolder?.name || '루트',
            testCase: result.testCaseName || testCase?.name || '알 수 없는 테스트케이스',
            result: result.result,
            executedDate: result.executedAt ? new Date(result.executedAt) : null,
            executor: result.executorName || '시스템',
            notes: result.notes || '',
            jiraId: jiraId,
            jiraIds: allJiraIds, // 모든 JIRA ID 목록
            hasMultipleJiraIds,
            jiraStatus: result.jiraStatus || null, // ICT-185에서 제공되는 JIRA 상태
            executionId: result.testExecutionId,
            testPlanName: result.testPlanName || ''
          };
        });

        setRows(tableData);
      } catch (err) {
        console.error('테스트 결과 로드 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [projectId, testCases, api]);

  // DataGrid 컬럼 정의
  const columns = useMemo(() => [
    {
      field: 'folder',
      headerName: '폴더',
      width: 150,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'testCase',
      headerName: '테스트케이스',
      flex: 1,
      minWidth: 200,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={params.value}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {params.value}
            </Typography>
          </Tooltip>
          {onViewResult && (
            <IconButton
              size="small"
              onClick={() => onViewResult(params.row.testCaseId, params.row.executionId)}
              sx={{ p: 0.5 }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )
    },
    {
      field: 'result',
      headerName: '결과',
      width: 120,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Chip
          label={params.value === TestResult.PASS ? '성공' :
                params.value === TestResult.FAIL ? '실패' :
                params.value === TestResult.BLOCKED ? '차단됨' : '미실행'}
          color={resultColors[params.value] || 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'executedDate',
      headerName: '시행일자',
      width: 140,
      headerClassName: 'table-header',
      type: 'dateTime',
      renderCell: (params) => (
        params.value ? (
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {format(params.value, 'yyyy-MM-dd HH:mm', { locale: ko })}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            -
          </Typography>
        )
      )
    },
    {
      field: 'executor',
      headerName: '실행자',
      width: 100,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'notes',
      headerName: '비고',
      flex: 1,
      minWidth: 150,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Tooltip title={params.value || '비고 없음'}>
          <Typography
            variant="body2"
            sx={{ 
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'jiraId',
      headerName: 'JIRA ID',
      width: 120,
      headerClassName: 'table-header',
      renderCell: (params) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const jiraUrl = jiraConfig?.serverUrl 
          ? `${jiraConfig.serverUrl}/browse/${params.value}`
          : `https://jira.company.com/browse/${params.value}`;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Link
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {params.value}
            </Link>
            {params.row.hasMultipleJiraIds && (
              <Tooltip title={`총 ${params.row.jiraIds.length}개의 JIRA ID`}>
                <Chip label={`+${params.row.jiraIds.length - 1}`} size="small" variant="outlined" />
              </Tooltip>
            )}
            <IconButton 
              size="small" 
              component="a" 
              href={jiraUrl} 
              target="_blank"
              sx={{ p: 0.25 }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    },
    {
      field: 'jiraStatus',
      headerName: 'JIRA 상태',
      width: 120,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          {params.value || '알 수 없음'}
        </Typography>
      )
    }
  ], [jiraConfig, resultColors, onViewResult]);

  // 컬럼 표시/숨김 토글
  const handleColumnVisibilityToggle = useCallback((field) => {
    setColumnVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  // 표시할 컬럼 필터링
  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibility[col.field] !== false);
  }, [columns, columnVisibility]);

  // ICT-190: 내보내기 기능 핸들러
  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

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
        size: 10000 // 대용량 데이터 처리
      };

      // API 호출
      const response = await api(`${API_BASE_URL}/api/test-results/export`, {
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

      setExportDialogOpen(false);
      
    } catch (error) {
      console.error('내보내기 오류:', error);
      alert('파일 내보내기 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // 커스텀 툴바 컴포넌트
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'space-between', p: 1 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        
        {/* 컬럼 표시/숨김 설정 */}
        <Button
          size="small"
          startIcon={<SettingsIcon />}
          onClick={(event) => setColumnVisibilityMenuAnchor(event.currentTarget)}
        >
          컬럼 설정
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* ICT-190: 고급 내보내기 버튼 */}
        <Button
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportClick}
          variant="outlined"
          color="primary"
        >
          고급 내보내기
        </Button>
        
        <GridToolbarExport 
          csvOptions={{
            fileName: `테스트결과_${activeProject?.name || 'export'}_${format(new Date(), 'yyyyMMdd_HHmm')}`,
            utf8WithBom: true
          }}
          printOptions={{
            fileName: `테스트결과_${activeProject?.name || 'export'}_${format(new Date(), 'yyyyMMdd_HHmm')}`
          }}
        />
      </Box>
    </GridToolbarContainer>
  );

  // ICT-194: 개선된 에러 상태 UI
  if (error) {
    return (
      <Paper sx={{ width: '100%', p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          textAlign: 'center'
        }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
            ⚠️
          </Typography>
          <Typography variant="h6" color="error.main" gutterBottom>
            테스트 결과를 불러올 수 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            {error}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.reload()}
              startIcon={<VisibilityIcon />}
            >
              새로고침
            </Button>
            <Button 
              variant="outlined"
              onClick={() => setError(null)}
            >
              다시 시도
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%' }}>
      {/* ICT-194: 개선된 헤더 - 모바일 반응형 */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 0 }
      }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            테스트 결과 상세 목록
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rows.length}개의 테스트 결과
          </Typography>
        </Box>
        
        {/* 모바일용 빠른 액션 버튼 */}
        <Box sx={{ 
          display: { xs: 'flex', sm: 'none' }, 
          gap: 1,
          width: '100%',
          justifyContent: 'flex-end'
        }}>
          <Button
            size="small"
            startIcon={<SettingsIcon />}
            onClick={(event) => setColumnVisibilityMenuAnchor(event.currentTarget)}
            variant="outlined"
          >
            컬럼
          </Button>
          <Button
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
            variant="contained"
            color="primary"
          >
            내보내기
          </Button>
        </Box>
      </Box>

      {/* ICT-194: 반응형 데이터그리드 */}
      <Box sx={{ 
        height: { xs: 400, sm: dense ? 400 : 600 }, 
        width: '100%',
        '& .MuiDataGrid-root': {
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          },
          '& .MuiDataGrid-cell': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '4px', sm: '8px' }
          }
        }
      }}>
        <DataGrid
          rows={rows}
          columns={visibleColumns}
          loading={loading}
          pageSize={dense ? 10 : 25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          pagination
          sortingOrder={['desc', 'asc']}
          disableSelectionOnClick
          density={dense ? 'compact' : 'standard'}
          components={{
            Toolbar: CustomToolbar
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'executedDate', sort: 'desc' }]
            },
            pagination: {
              pageSize: dense ? 10 : 25
            }
          }}
          sx={{
            border: 'none',
            '& .table-header': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              fontWeight: 600
            },
            [`& .${gridClasses.row}:hover`]: {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
            },
            // 모바일에서 스크롤 개선
            '& .MuiDataGrid-virtualScroller': {
              '&::-webkit-scrollbar': {
                height: { xs: '6px', sm: '8px' },
                width: { xs: '6px', sm: '8px' }
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '3px'
              }
            }
          }}
        />
      </Box>

      {/* ICT-194: 개선된 컬럼 설정 메뉴 - 향상된 사용자 경험 */}
      <Menu
        anchorEl={columnVisibilityMenuAnchor}
        open={Boolean(columnVisibilityMenuAnchor)}
        onClose={() => setColumnVisibilityMenuAnchor(null)}
        PaperProps={{
          sx: { 
            minWidth: 280, 
            maxWidth: 320,
            borderRadius: 2,
            boxShadow: 3
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {/* 메뉴 헤더 */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.light',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle1" color="primary.dark" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon fontSize="small" />
            컬럼 표시 설정
          </Typography>
          <Typography variant="caption" color="text.secondary">
            표시할 컬럼을 선택해주세요
          </Typography>
        </Box>

        {/* 전체 선택/해제 버튼 */}
        <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => {
                  // 모든 컬럼 표시
                  const newVisibility = {};
                  columns.forEach(col => {
                    newVisibility[col.field] = true;
                  });
                  setColumnVisibility(newVisibility);
                }}
                sx={{ fontSize: '0.75rem' }}
              >
                전체 표시
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={() => {
                  // 필수 컬럼만 표시
                  const newVisibility = {};
                  columns.forEach(col => {
                    newVisibility[col.field] = ['testCase', 'result', 'executedDate'].includes(col.field);
                  });
                  setColumnVisibility(newVisibility);
                }}
                sx={{ fontSize: '0.75rem' }}
              >
                필수만 표시
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* 컬럼별 설정 */}
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {columns.map((col, index) => {
            const isVisible = columnVisibility[col.field] !== false;
            const isEssential = ['testCase', 'result'].includes(col.field);
            
            return (
              <MenuItem 
                key={col.field} 
                sx={{ 
                  py: 1, 
                  px: 2,
                  '&:hover': { 
                    bgcolor: isVisible ? 'primary.light' : 'action.hover'
                  },
                  bgcolor: isVisible ? 'action.selected' : 'transparent'
                }}
                onClick={() => !isEssential && handleColumnVisibilityToggle(col.field)}
                disabled={isEssential}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  {/* 체크박스 */}
                  <Checkbox
                    checked={isVisible}
                    onChange={() => handleColumnVisibilityToggle(col.field)}
                    size="small"
                    disabled={isEssential}
                    color="primary"
                  />
                  
                  {/* 컬럼 정보 */}
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      color={isVisible ? 'primary.dark' : 'text.primary'}
                      fontWeight={isVisible ? 'medium' : 'normal'}
                    >
                      {col.headerName}
                    </Typography>
                    {isEssential && (
                      <Typography variant="caption" color="warning.main">
                        필수 컬럼
                      </Typography>
                    )}
                  </Box>

                  {/* 컬럼 순서 표시 */}
                  <Typography variant="caption" color="text.secondary">
                    {index + 1}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })}
        </Box>

        <Divider />

        {/* 하단 요약 정보 */}
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            📊 표시 중: {visibleColumns.length}/{columns.length}개 컬럼
          </Typography>
          <Typography variant="caption" color="text.secondary">
            💡 팁: 테스트케이스와 결과는 필수 컬럼으로 항상 표시됩니다
          </Typography>
        </Box>
      </Menu>

      {/* ICT-194: 개선된 내보내기 다이얼로그 - 향상된 UI/UX */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)} 
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
            {/* 파일 형식 선택 - 개선된 카드 형태 */}
            <Typography variant="h6" gutterBottom color="primary">
              📄 내보내기 형식 선택
            </Typography>
            <Grid container spacing={2}>
              {[
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
              ].map((format) => (
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
                  <Chip label={`${rows.length}건`} size="small" color="primary" />
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
            onClick={() => setExportDialogOpen(false)}
            disabled={exporting}
            size="large"
            sx={{ minWidth: 100 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleExportConfirm}
            variant="contained"
            disabled={exporting || rows.length === 0}
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
    </Paper>
  );
};

export default TestResultDetailTable;