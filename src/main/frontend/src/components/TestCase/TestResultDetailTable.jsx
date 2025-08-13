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
  FileDownload as FileDownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext.jsx';
import { TestResult } from '../../models/testExecution.jsx';
import jiraService from '../../services/jiraService.js';
// ICT-194 Phase 2: 통합된 테스트 결과 상수 및 API 상수 사용
import { LEGACY_RESULT_COLORS, getResultLabel } from '../../utils/testResultConstants.js';
import { API_CONFIG, API_ENDPOINTS, buildUrl } from '../../utils/apiConstants.js';
// ICT-194 Phase 2: 컴포넌트 분할 - 분리된 컴포넌트들
import TestResultExportDialog from './TestResultExportDialog.jsx';
import TestResultColumnMenu from './TestResultColumnMenu.jsx';
// ICT-209: 테스트 결과 편집 기능
import TestResultEditDialog from './TestResultEditDialog.jsx';
import testResultEditService from '../../services/testResultEditService.js';

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

  // ICT-190: 내보내기 기능 상태 (ICT-194 Phase 2: 분리된 컴포넌트로 이동)
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // ICT-209: 테스트 결과 편집 기능 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [activeEdits, setActiveEdits] = useState({});

  // ICT-194 Phase 2: 통합된 테스트 결과 색상 사용
  const resultColors = LEGACY_RESULT_COLORS;

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

        // ICT-185: 새로운 테스트 결과 리포트 API 사용 (ICT-194 Phase 2: 통합 API 상수)
        const apiUrl = buildUrl(API_ENDPOINTS.TEST_RESULTS.REPORT) + `?projectId=${projectId}&page=0&size=1000`;
        const response = await api(apiUrl);
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
        
        // ICT-209: 활성 편집본 정보 로드
        await loadActiveEdits(tableData);
      } catch (err) {
        console.error('테스트 결과 로드 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [projectId, testCases, api]);

  // ICT-209: 활성 편집본 정보 로드
  const loadActiveEdits = async (testResults) => {
    try {
      const editPromises = testResults.map(async (result) => {
        try {
          const activeEdit = await testResultEditService.getActiveEdit(result.testCaseId);
          return { testResultId: result.testCaseId, activeEdit };
        } catch (error) {
          return { testResultId: result.testCaseId, activeEdit: null };
        }
      });

      const editResults = await Promise.all(editPromises);
      const editsMap = {};
      editResults.forEach(({ testResultId, activeEdit }) => {
        if (activeEdit) {
          editsMap[testResultId] = activeEdit;
        }
      });

      setActiveEdits(editsMap);
    } catch (error) {
      console.warn('활성 편집본 로드 실패:', error);
    }
  };

  // ICT-209: 편집 다이얼로그 열기
  const handleEditClick = (testResultId, executionId) => {
    const testResult = rows.find(row => row.testCaseId === testResultId && row.executionId === executionId);
    const testCase = testCases.find(tc => tc.id === testResultId);
    
    if (testResult && testCase) {
      setSelectedTestResult({
        id: testResult.testCaseId, // 실제 테스트 결과 ID
        testCaseId: testResult.testCaseId,
        result: testResult.result,
        notes: testResult.notes,
        jiraIssueKey: testResult.jiraId,
        jiraIssueUrl: testResult.jiraIds?.[0] || '',
        executedAt: testResult.executedDate,
        executorName: testResult.executor
      });
      setSelectedTestCase(testCase);
      setEditDialogOpen(true);
    }
  };

  // ICT-209: 편집 저장 완료 핸들러
  const handleEditSaved = async (editResult) => {
    console.log('편집 저장 완료:', editResult);
    
    // 테스트 결과 데이터 새로고침
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        
        const apiUrl = buildUrl(API_ENDPOINTS.TEST_RESULTS.REPORT) + `?projectId=${projectId}&page=0&size=1000`;
        const response = await api(apiUrl);
        if (!response.ok) {
          throw new Error('테스트 결과를 불러올 수 없습니다');
        }

        const reportData = await response.json();
        const testResults = reportData.content || [];
        
        const tableData = testResults.map((result, index) => {
          const testCase = testCases.find(tc => tc.id === result.testCaseId);
          const parentFolder = testCase?.parentId 
            ? testCases.find(tc => tc.id === testCase.parentId) 
            : null;

          const jiraId = result.jiraIssueKey;
          const additionalJiraIds = jiraService.extractIssueKeys(result.notes || '');
          const allJiraIds = jiraId ? [jiraId, ...additionalJiraIds.filter(id => id !== jiraId)] : additionalJiraIds;
          const hasMultipleJiraIds = allJiraIds.length > 1;

          return {
            id: `${result.testCaseId}-${result.testExecutionId}-${index}`,
            testCaseId: result.testCaseId,
            resultId: index,
            folder: result.folderPath || parentFolder?.name || '루트',
            testCase: result.testCaseName || testCase?.name || '알 수 없는 테스트케이스',
            result: result.result,
            executedDate: result.executedAt ? new Date(result.executedAt) : null,
            executor: result.executorName || '시스템',
            notes: result.notes || '',
            jiraId: jiraId,
            jiraIds: allJiraIds,
            hasMultipleJiraIds,
            jiraStatus: result.jiraStatus || null,
            executionId: result.testExecutionId,
            testPlanName: result.testPlanName || ''
          };
        });

        setRows(tableData);
        await loadActiveEdits(tableData);
      } catch (err) {
        console.error('테스트 결과 새로고침 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    await fetchTestResults();
  };

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
      minWidth: 250,
      headerClassName: 'table-header',
      renderCell: (params) => {
        const hasActiveEdit = activeEdits[params.row.testCaseId];
        const editStatusInfo = hasActiveEdit ? testResultEditService.getEditStatusInfo(hasActiveEdit.editStatus) : null;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={params.value}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {params.value}
                </Typography>
              </Tooltip>
              {hasActiveEdit && (
                <Tooltip title={`편집본: ${editStatusInfo.description}`}>
                  <Chip 
                    label={editStatusInfo.label}
                    size="small"
                    color={editStatusInfo.color}
                    variant="outlined"
                    sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* ICT-209: 편집 버튼 */}
              <Tooltip title="편집">
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(params.row.testCaseId, params.row.executionId)}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {onViewResult && (
                <Tooltip title="상세보기">
                  <IconButton
                    size="small"
                    onClick={() => onViewResult(params.row.testCaseId, params.row.executionId)}
                    sx={{ p: 0.5 }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'result',
      headerName: '결과',
      width: 120,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Chip
          label={getResultLabel(params.value)}
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

  // ICT-190: 내보내기 기능 핸들러 (ICT-194 Phase 2: 간소화)
  const handleExportClick = () => {
    setExportDialogOpen(true);
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

      {/* ICT-194 Phase 2: 분리된 컬럼 설정 메뉴 컴포넌트 사용 */}
      <TestResultColumnMenu
        anchorEl={columnVisibilityMenuAnchor}
        open={Boolean(columnVisibilityMenuAnchor)}
        onClose={() => setColumnVisibilityMenuAnchor(null)}
        columns={columns}
        columnVisibility={columnVisibility}
        onColumnVisibilityToggle={handleColumnVisibilityToggle}
        visibleColumns={visibleColumns}
      />

      {/* ICT-194 Phase 2: 분리된 내보내기 다이얼로그 컴포넌트 사용 */}
      <TestResultExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        projectId={projectId}
        visibleColumns={visibleColumns}
        totalRows={rows.length}
        activeProject={activeProject}
      />

      {/* ICT-209: 테스트 결과 편집 다이얼로그 */}
      <TestResultEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedTestResult(null);
          setSelectedTestCase(null);
        }}
        testResult={selectedTestResult}
        testCase={selectedTestCase}
        onEditSaved={handleEditSaved}
      />
    </Paper>
  );
};

export default TestResultDetailTable;