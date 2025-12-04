// src/components/TestCase/TestResultDetailReportView.jsx
// ICT-223: TestResultDetailReportView 상세 리포트 컴포넌트 구현

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

// 서비스 및 컨텍스트 임포트
import { useAppContext } from '../../context/AppContext.jsx';
import { 
  getDetailedTestResultReport, 
  getTestResultStatistics,
  handleTestResultError 
} from '../../services/testResultService.js';
import TestResultExportDialog from './TestResultExportDialog.jsx';
// ICT-224: 고급 기능 컴포넌트 임포트
import DetailReportPresetManager from './DetailReportPresetManager.jsx';
import JiraIntegrationReportSection from './JiraIntegrationReportSection.jsx';
import TestResultTrendSection from './TestResultTrendSection.jsx';
// Markdown 뷰어
import MarkdownViewer from '../common/MarkdownViewer.jsx';

/**
 * 상세 리포트 뷰 컴포넌트 (ICT-223)
 * 고급 필터링, 데이터 그리드, 통계 차트, 내보내기 기능 포함
 */
const TestResultDetailReportView = ({ 
  projectId, 
  activeProject,
  onError 
}) => {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  
  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25
  });
  const [rowCount, setRowCount] = useState(0);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    // 검색 필터
    searchText: '',
    testCaseName: '',
    folderPath: '',
    executorName: '',
    
    // 결과 필터
    result: [],
    jiraStatus: [],
    
    // 날짜 필터
    startDate: null,
    endDate: null,
    
    // 고급 필터
    hasNotes: null,
    hasJiraIssue: null,
    isRecent: false,
    
    // ICT-224: 복합 검색 조건
    useRegex: false,
    caseSensitive: false,
    exactMatch: false,
    excludeTerms: '',
    multipleExecutors: [],
    dateRange: 'all' // all, today, week, month, custom
  });
  
  // UI 상태
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // ICT-224: 성능 최적화 상태
  const [cache, setCache] = useState(new Map());
  const [virtualScrolling, setVirtualScrolling] = useState(false);
  const [lazyLoading, setLazyLoading] = useState(true);
  
  const { projects } = useAppContext();

  // 컬럼 정의
  const columns = [
    {
      field: 'folderPath',
      headerName: '폴더 경로',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'testCaseName',
      headerName: '테스트 케이스',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.testCaseDescription && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.testCaseDescription}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'result',
      headerName: '결과',
      width: 120,
      renderCell: (params) => {
        const getResultColor = (result) => {
          switch (result) {
            case 'PASS': return 'success';
            case 'FAIL': return 'error';
            case 'BLOCKED': return 'warning';
            case 'NOT_RUN': return 'default';
            default: return 'default';
          }
        };
        
        return (
          <Chip 
            label={params.value} 
            color={getResultColor(params.value)}
            size="small"
            variant="filled"
          />
        );
      }
    },
    {
      field: 'executedAt',
      headerName: '실행 일시',
      width: 180,
      renderCell: (params) => {
        if (!params.value) return '-';
        try {
          const date = typeof params.value === 'string' ? parseISO(params.value) : params.value;
          return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm', { locale: ko }) : '-';
        } catch {
          return '-';
        }
      }
    },
    {
      field: 'executorName',
      headerName: '실행자',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || '미지정'} 
          variant="outlined" 
          size="small"
        />
      )
    },
    {
      field: 'notes',
      headerName: '비고',
      width: 200,
      renderCell: (params) => {
        const notesContent = params.value;

        if (!notesContent) {
          return <Typography variant="body2" color="text.secondary">-</Typography>;
        }

        // Tooltip 내용: Markdown 렌더링
        const tooltipContent = (
          <Box sx={{ maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
            <MarkdownViewer content={notesContent} />
          </Box>
        );

        return (
          <Tooltip title={tooltipContent} arrow placement="top-start">
            <Typography variant="body2" noWrap sx={{ cursor: 'help' }}>
              {notesContent}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'jiraIssueKey',
      headerName: 'JIRA',
      width: 120,
      renderCell: (params) => {
        if (!params.value) return '-';
        return (
          <Box>
            <Typography variant="body2" color="primary">
              {params.value}
            </Typography>
            {params.row.jiraStatus && (
              <Chip 
                label={params.row.jiraStatus} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
        );
      }
    }
  ];

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 필터 구성
      const filterConfig = {
        projectId,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        
        // 검색 필터
        searchText: filters.searchText || undefined,
        testCaseName: filters.testCaseName || undefined,
        folderPath: filters.folderPath || undefined,
        executorName: filters.executorName || undefined,
        
        // 결과 필터
        result: filters.result.length > 0 ? filters.result : undefined,
        jiraStatus: filters.jiraStatus.length > 0 ? filters.jiraStatus : undefined,
        
        // 날짜 필터
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        
        // 고급 필터
        hasNotes: filters.hasNotes,
        hasJiraIssue: filters.hasJiraIssue,
        isRecent: filters.isRecent,
        
        // ICT-224: 복합 검색 조건
        useRegex: filters.useRegex,
        caseSensitive: filters.caseSensitive,
        exactMatch: filters.exactMatch,
        excludeTerms: filters.excludeTerms || undefined,
        dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined
      };
      
      // ICT-224: 캐싱 로직
      const cacheKey = JSON.stringify(filterConfig);
      if (cache.has(cacheKey) && lazyLoading) {
        const cachedData = cache.get(cacheKey);
        setData(cachedData.content || []);
        setRowCount(cachedData.totalElements || 0);
        setStatistics(cachedData.statistics);
        setLoading(false);
        return;
      }
      
      // 데이터 및 통계 병렬 로드
      const [reportResult, statisticsResult] = await Promise.all([
        getDetailedTestResultReport(filterConfig),
        getTestResultStatistics({ projectId })
      ]);
      
      setData(reportResult.content || []);
      setRowCount(reportResult.totalElements || 0);
      setStatistics(statisticsResult);
      
      // ICT-224: 캐시 업데이트 (최대 10개 항목 유지)
      if (lazyLoading) {
        const newCache = new Map(cache);
        if (newCache.size >= 10) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        newCache.set(cacheKey, {
          content: reportResult.content || [],
          totalElements: reportResult.totalElements || 0,
          statistics: statisticsResult,
          timestamp: Date.now()
        });
        setCache(newCache);
      }
      
    } catch (err) {
      const errorInfo = handleTestResultError(err, 'detailed report loading');
      setError(errorInfo.message);
      onError?.(errorInfo);
    } finally {
      setLoading(false);
    }
  }, [projectId, paginationModel, filters, onError]);

  // 초기 로드 및 의존성 변경 시 리로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 필터 변경 핸들러
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPaginationModel(prev => ({ ...prev, page: 0 })); // 필터 변경시 첫 페이지로
  };

  // 필터 초기화
  const handleFilterReset = () => {
    setFilters({
      searchText: '',
      testCaseName: '',
      folderPath: '',
      executorName: '',
      result: [],
      jiraStatus: [],
      startDate: null,
      endDate: null,
      hasNotes: null,
      hasJiraIssue: null,
      isRecent: false,
      // ICT-224: 복합 검색 조건 초기화
      useRegex: false,
      caseSensitive: false,
      exactMatch: false,
      excludeTerms: '',
      multipleExecutors: [],
      dateRange: 'all'
    });
  };

  // 검색 실행
  const handleSearch = () => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    loadData();
  };

  // 결과 옵션
  const resultOptions = ['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN'];
  const jiraStatusOptions = ['To Do', 'In Progress', 'Done', 'Blocked'];

  // 통계 카드 렌더링
  const renderStatisticsCards = () => {
    if (!statistics) return null;

    const cards = [
      {
        title: '총 테스트 케이스',
        value: statistics.totalTestCases || 0,
        icon: <AssessmentIcon />,
        color: 'primary'
      },
      {
        title: '실행률',
        value: `${statistics.executionRate || 0}%`,
        icon: <TimelineIcon />,
        color: 'info'
      },
      {
        title: '통과율',
        value: `${statistics.passRate || 0}%`,
        icon: <PieChartIcon />,
        color: 'success'
      },
      {
        title: '평균 실행시간',
        value: `${statistics.averageExecutionTime || 0}분`,
        icon: <BarChartIcon />,
        color: 'warning'
      }
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: `${card.color}.main` }}>
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          상세 리포트
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
            disabled={loading || data.length === 0}
          >
            내보내기
          </Button>
        </Stack>
      </Box>
      {/* 통계 카드 */}
      {renderStatisticsCards()}
      {/* ICT-224: 필터 프리셋 관리 */}
      <Box sx={{ mb: 3 }}>
        <DetailReportPresetManager
          currentFilters={filters}
          onApplyPreset={(presetFilters, presetName) => {
            setFilters(presetFilters);
            setPaginationModel(prev => ({ ...prev, page: 0 }));
          }}
          onSavePreset={(preset) => {
          }}
          projectId={projectId}
        />
      </Box>
      {/* 필터 패널 */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
          <Accordion expanded={filterExpanded} onChange={(e, expanded) => setFilterExpanded(expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon color="primary" />
                <Typography variant="h6">고급 필터</Typography>
                {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== '')) && (
                  <Chip label="필터 적용됨" size="small" color="primary" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* 검색 필터 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="통합 검색"
                    placeholder={t('testResult.detailReport.searchPlaceholder', '테스트 케이스명, 폴더 경로, 실행자 등')}
                    value={filters.searchText}
                    onChange={(e) => handleFilterChange('searchText', e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                      }
                    }}
                  />
                </Grid>
                
                {/* 결과 필터 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>테스트 결과</InputLabel>
                    <Select
                      multiple
                      value={filters.result}
                      onChange={(e) => handleFilterChange('result', e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {resultOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox checked={filters.result.indexOf(option) > -1} />
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 날짜 필터 - 간단한 TextField로 구현 */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="시작 날짜"
                    value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      handleFilterChange('startDate', date);
                    }}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="종료 날짜"
                    value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      handleFilterChange('endDate', date);
                    }}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                  />
                </Grid>

                {/* 고급 옵션 */}
                <Grid size={{ xs: 12 }}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.hasNotes === true}
                          onChange={(e) => handleFilterChange('hasNotes', e.target.checked ? true : null)}
                        />
                      }
                      label="비고 있음"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.hasJiraIssue === true}
                          onChange={(e) => handleFilterChange('hasJiraIssue', e.target.checked ? true : null)}
                        />
                      }
                      label="JIRA 이슈 연결됨"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.isRecent}
                          onChange={(e) => handleFilterChange('isRecent', e.target.checked)}
                        />
                      }
                      label="최근 7일 이내"
                    />
                  </FormGroup>
                </Grid>

                {/* ICT-224: 복합 검색 조건 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    복합 검색 옵션
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="제외할 검색어"
                    placeholder="쉼표로 구분하여 입력"
                    value={filters.excludeTerms}
                    onChange={(e) => handleFilterChange('excludeTerms', e.target.value)}
                    helperText="이 단어들이 포함된 결과는 제외됩니다"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>날짜 범위</InputLabel>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      label="날짜 범위"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value="today">오늘</MenuItem>
                      <MenuItem value="week">이번 주</MenuItem>
                      <MenuItem value="month">이번 달</MenuItem>
                      <MenuItem value="custom">사용자 정의</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.useRegex}
                          onChange={(e) => handleFilterChange('useRegex', e.target.checked)}
                        />
                      }
                      label="정규표현식 사용"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.caseSensitive}
                          onChange={(e) => handleFilterChange('caseSensitive', e.target.checked)}
                        />
                      }
                      label="대소문자 구분"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.exactMatch}
                          onChange={(e) => handleFilterChange('exactMatch', e.target.checked)}
                        />
                      }
                      label="완전 일치"
                    />
                  </FormGroup>
                </Grid>

                {/* ICT-224: 성능 최적화 옵션 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    성능 최적화
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={virtualScrolling}
                          onChange={(e) => setVirtualScrolling(e.target.checked)}
                        />
                      }
                      label="가상 스크롤링"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={lazyLoading}
                          onChange={(e) => setLazyLoading(e.target.checked)}
                        />
                      }
                      label="지연 로딩"
                    />
                    <Tooltip title={`캐시된 항목: ${cache.size}/10`}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setCache(new Map())}
                        disabled={cache.size === 0}
                      >
                        캐시 초기화
                      </Button>
                    </Tooltip>
                  </FormGroup>
                </Grid>

                {/* 필터 액션 */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      검색
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleFilterReset}
                    >
                      초기화
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
      </Paper>
      {/* 오류 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {/* 데이터 그리드 */}
      <Paper variant="outlined">
        <DataGrid
          rows={data}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          loading={loading}
          pageSizeOptions={virtualScrolling ? [100, 250, 500, 1000] : [10, 25, 50, 100]}
          paginationMode="server"
          disableRowSelectionOnClick
          getRowId={(row) => row.id || `${row.testCaseId}-${row.executedAt}`}
          virtualization={virtualScrolling}
          rowHeight={virtualScrolling ? 40 : 52}
          sx={{
            minHeight: virtualScrolling ? 600 : 400,
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                gap: 2
              }}>
                <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  조건에 맞는 테스트 결과가 없습니다
                </Typography>
                <Button variant="outlined" onClick={handleFilterReset}>
                  필터 초기화
                </Button>
              </Box>
            ),
            loadingOverlay: () => (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                gap: 2
              }}>
                <CircularProgress />
                <Typography>데이터를 불러오는 중...</Typography>
              </Box>
            )
          }}
        />
      </Paper>
      {/* ICT-224: JIRA 연동 리포트 섹션 */}
      <Box sx={{ mb: 3 }}>
        <JiraIntegrationReportSection
          testResults={data}
          projectId={projectId}
          onRefresh={loadData}
          loading={loading}
        />
      </Box>
      {/* ICT-224: 트렌드 분석 섹션 */}
      <Box sx={{ mb: 3 }}>
        <TestResultTrendSection
          testResults={data}
          projectId={projectId}
          onRefresh={loadData}
          loading={loading}
        />
      </Box>
      {/* 내보내기 다이얼로그 */}
      <TestResultExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        projectId={projectId}
        visibleColumns={columns}
        rows={data}
        totalRows={rowCount}
        activeProject={activeProject}
      />
    </Box>
  );
};

export default TestResultDetailReportView;
