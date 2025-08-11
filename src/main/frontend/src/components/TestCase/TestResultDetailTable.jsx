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
  Alert
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
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext.jsx';
import { TestResult } from '../../models/testExecution.jsx';
import jiraService from '../../services/jiraService.js';

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

        // 모든 테스트 실행 결과 조회
        const response = await api(`/api/test-results/by-project/${projectId}`);
        if (!response.ok) {
          throw new Error('테스트 결과를 불러올 수 없습니다');
        }

        const testResults = await response.json();
        
        // 테스트 케이스별로 최신 결과만 추출하여 테이블 데이터 구성
        const tableData = testResults.map((result, index) => {
          const testCase = testCases.find(tc => tc.id === result.testCaseId);
          const parentFolder = testCase?.parentId 
            ? testCases.find(tc => tc.id === testCase.parentId) 
            : null;

          // JIRA ID 추출 (비고 필드에서)
          const jiraIds = jiraService.extractIssueKeys(result.notes || '');
          const primaryJiraId = jiraIds.length > 0 ? jiraIds[0] : null;
          const hasMultipleJiraIds = jiraIds.length > 1;

          return {
            id: `${result.testCaseId}-${result.id}`,
            testCaseId: result.testCaseId,
            resultId: result.id,
            folder: parentFolder?.name || '루트',
            testCase: testCase?.name || '알 수 없는 테스트케이스',
            result: result.result,
            executedDate: result.executedAt ? new Date(result.executedAt) : null,
            executor: result.executorName || '시스템',
            notes: result.notes || '',
            jiraId: primaryJiraId,
            jiraIds: jiraIds, // 모든 JIRA ID 목록
            hasMultipleJiraIds,
            jiraStatus: null, // 추후 JIRA API를 통해 상태 조회
            executionId: result.executionId,
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
      
      <GridToolbarExport 
        csvOptions={{
          fileName: `테스트결과_${activeProject?.name || 'export'}_${format(new Date(), 'yyyyMMdd_HHmm')}`,
          utf8WithBom: true
        }}
        printOptions={{
          fileName: `테스트결과_${activeProject?.name || 'export'}_${format(new Date(), 'yyyyMMdd_HHmm')}`
        }}
      />
    </GridToolbarContainer>
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2">
          테스트 결과 상세 목록
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rows.length}개의 테스트 결과
        </Typography>
      </Box>

      <Box sx={{ height: dense ? 400 : 600, width: '100%' }}>
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
            }
          }}
        />
      </Box>

      {/* 컬럼 설정 메뉴 */}
      <Menu
        anchorEl={columnVisibilityMenuAnchor}
        open={Boolean(columnVisibilityMenuAnchor)}
        onClose={() => setColumnVisibilityMenuAnchor(null)}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">컬럼 표시/숨김</Typography>
        </MenuItem>
        <Divider />
        {columns.map(col => (
          <MenuItem key={col.field} sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={columnVisibility[col.field] !== false}
                  onChange={() => handleColumnVisibilityToggle(col.field)}
                  size="small"
                />
              }
              label={col.headerName}
              sx={{ margin: 0, width: '100%' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export default TestResultDetailTable;