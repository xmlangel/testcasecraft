// src/main/frontend/src/components/JUnit/JunitResultDetail.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    Warning as ErrorIcon,
    SkipNext as SkipIcon,
    ExpandMore as ExpandMoreIcon,
    Speed as SpeedIcon,
    BugReport as BugIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    History as HistoryIcon,
    FileDownload as FileDownloadIcon,
    TableChart as TableChartIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useAppContext } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import junitResultService from '../../services/junitResultService';
import JunitTestCaseEditor from './JunitTestCaseEditor';
import JunitVersionManager from './JunitVersionManager';
import TestCaseDetailPanel from './TestCaseDetailPanel';
import { STATUS_BG_COLORS } from '../../constants/statusColors';
import { exportTestResultToPDF } from '../../utils/pdfExportUtils';
import { exportTestResultToCSV } from '../../utils/csvExportUtils';
import { PAGE_CONTAINER_SX } from '../../styles/layoutConstants';

/**
 * JUnit 테스트 결과 상세 뷰 컴포넌트
 */
const JunitResultDetail = () => {
    const { testResultId, projectId } = useParams();
    const navigate = useNavigate();
    const { currentProject } = useAppContext();
    const { t } = useI18n();

    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [testSuites, setTestSuites] = useState([]);
    const [selectedSuite, setSelectedSuite] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    
    // 편집 관련 상태
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    
    // 버전 관리 상태
    const [versionManagerOpen, setVersionManagerOpen] = useState(false);
    
    // 페이징 및 필터링
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');
    
    // ICT-337: Split Panel 관련 상태
    const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
    const [showDetailPanel, setShowDetailPanel] = useState(false);

    // PDF 내보내기 관련 상태
    const [exportingPDF, setExportingPDF] = useState(false);

    // CSV 내보내기 관련 상태
    const [exportingCSV, setExportingCSV] = useState(false);

    // 상태별 설정
    const statusConfig = {
        PASSED: {
            color: 'success',
            icon: <PassIcon />,
            label: t('junit.stats.passed'),
            bgColor: STATUS_BG_COLORS.PASSED
        },
        FAILED: {
            color: 'error',
            icon: <FailIcon />,
            label: t('junit.stats.failed'),
            bgColor: STATUS_BG_COLORS.FAILED
        },
        ERROR: {
            color: 'warning',
            icon: <ErrorIcon />,
            label: t('junit.stats.error'),
            bgColor: STATUS_BG_COLORS.ERROR
        },
        SKIPPED: {
            color: 'default',
            icon: <SkipIcon />,
            label: t('junit.stats.skipped'),
            bgColor: STATUS_BG_COLORS.SKIPPED
        }
    };

    // 데이터 로드
    const loadData = async () => {
        if (!testResultId) return;

        setLoading(true);
        setError(null);

        try {
            // 병렬로 데이터 로드
            const [resultResponse, suitesResponse] = await Promise.all([
                junitResultService.getJunitResultDetail(testResultId),
                junitResultService.getTestSuitesByResult(testResultId)
            ]);

            setTestResult(resultResponse.testResult || resultResponse);
            setTestSuites(suitesResponse.testSuites || []);

            // 첫 번째 스위트를 기본 선택
            if (suitesResponse.testSuites && suitesResponse.testSuites.length > 0) {
                setSelectedSuite(suitesResponse.testSuites[0]);
                await loadTestCases(suitesResponse.testSuites[0].id);
            }

        } catch (err) {
            console.error('JUnit 결과 상세 로드 실패:', err);
            setError(t('junit.detail.loadFailedDetail'));
        } finally {
            setLoading(false);
        }
    };

    // 테스트 케이스 로드
    const loadTestCases = async (suiteId, pageNum = 0) => {
        if (!suiteId) return;

        try {
            const response = await junitResultService.getTestCasesBySuite(suiteId, pageNum, pageSize);
            setTestCases(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            console.error('테스트 케이스 로드 실패:', err);
            setError(t('junit.detail.loadTestCasesFailed'));
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadData();
    }, [testResultId]);

    // 스위트 선택 변경
    const handleSuiteChange = async (suite) => {
        setSelectedSuite(suite);
        setPage(1);
        await loadTestCases(suite.id, 0);
    };

    // 페이지 변경
    const handlePageChange = async (event, newPage) => {
        setPage(newPage);
        if (selectedSuite) {
            await loadTestCases(selectedSuite.id, newPage - 1);
        }
    };

    // 테스트 케이스 편집
    const handleEditTestCase = (testCase) => {
        setSelectedTestCase(testCase);
        setEditDialogOpen(true);
    };

    // 편집 완료 핸들러
    const handleEditSave = async (updatedTestCaseResponse) => {
        // 백엔드 응답에서 실제 테스트케이스 데이터 추출
        const updatedTestCase = updatedTestCaseResponse.testCase || updatedTestCaseResponse;
        
        // 테스트 케이스 목록 업데이트
        setTestCases(prev => 
            prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc)
        );
        
        // 다이얼로그 닫기
        setEditDialogOpen(false);
        setSelectedTestCase(null);
        
        // 선택된 스위트 데이터 새로고침 (페이지 유지)
        if (selectedSuite) {
            await loadTestCases(selectedSuite.id, page - 1);
        }
    };

    // 탭 변경
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    
    // ICT-337: 테스트 케이스 클릭 핸들러
    const handleTestCaseClick = (testCaseId) => {
        setSelectedTestCaseId(testCaseId);
        setShowDetailPanel(true);
    };

    // ICT-337: 상세 패널 닫기
    const handleCloseDetailPanel = () => {
        setShowDetailPanel(false);
        setSelectedTestCaseId(null);
    };

    // PDF 내보내기 핸들러
    const handleExportToPDF = async () => {
        if (!testResult) {
            alert(t('junit.detail.exportPDFAlert'));
            return;
        }

        try {
            setExportingPDF(true);

            // 모든 테스트 케이스를 가져오기 (페이징 없이)
            let allTestCases = [];
            for (const suite of testSuites) {
                try {
                    const response = await junitResultService.getTestCasesBySuite(suite.id, 0, 1000);
                    allTestCases = [...allTestCases, ...(response.content || [])];
                } catch (error) {
                    console.warn(`Failed to load test cases for suite ${suite.id}:`, error);
                }
            }

            // PDF 내보내기 실행
            const result = await exportTestResultToPDF(testResult, testSuites, allTestCases);

            if (result.success) {
                alert(`${t('junit.detail.exportPDFComplete')}: ${result.fileName}`);
            } else {
                alert(`${t('junit.detail.exportPDFFailed')}: ${result.message}`);
            }

        } catch (error) {
            console.error('PDF 내보내기 오류:', error);
            alert(t('junit.detail.exportPDFError') + ': ' + error.message);
        } finally {
            setExportingPDF(false);
        }
    };

    // CSV 내보내기 핸들러
    const handleExportToCSV = async () => {
        if (!testResult) {
            alert(t('junit.detail.exportCSVAlert'));
            return;
        }

        try {
            setExportingCSV(true);

            // 모든 테스트 케이스 수집
            const allTestCases = [];
            for (const suite of testSuites) {
                try {
                    const suiteTestCases = await junitResultService.getTestCasesBySuite(suite.id);
                    allTestCases.push(...suiteTestCases);
                } catch (error) {
                    console.warn(`스위트 ${suite.name}의 테스트 케이스 로드 실패:`, error);
                }
            }

            // CSV 내보내기 실행
            const result = await exportTestResultToCSV(testResult, testSuites, allTestCases);

            if (result.success) {
                alert(`${t('junit.detail.exportCSVComplete')}: ${result.fileName}`);
            } else {
                alert(`${t('junit.detail.exportCSVFailed')}: ${result.message}`);
            }

        } catch (error) {
            console.error('CSV 내보내기 오류:', error);
            alert(t('junit.detail.exportCSVError') + ': ' + error.message);
        } finally {
            setExportingCSV(false);
        }
    };

    // 실행 시간 포맷
    const formatDuration = (seconds) => {
        if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
        if (seconds < 60) return `${seconds.toFixed(2)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}m ${remainingSeconds}s`;
    };

    // 안전한 날짜 포맷팅 함수
    const formatSafeDate = (dateValue) => {
        try {
            if (!dateValue) {
                return t('junit.detail.noDateInfo');
            }
            
            let date;
            
            // 다양한 날짜 형식 처리
            if (typeof dateValue === 'string') {
                // ISO 형식이 아닌 경우 처리
                if (dateValue.includes('T') || dateValue.includes('-')) {
                    date = new Date(dateValue);
                } else {
                    // 숫자 문자열인 경우 (timestamp)
                    const timestamp = parseInt(dateValue);
                    if (!isNaN(timestamp)) {
                        date = new Date(timestamp);
                    } else {
                        date = new Date(dateValue);
                    }
                }
            } else if (typeof dateValue === 'number') {
                // timestamp 처리
                date = new Date(dateValue);
            } else if (dateValue instanceof Date) {
                date = dateValue;
            } else if (Array.isArray(dateValue) && dateValue.length >= 6) {
                // Java LocalDateTime 배열 형식 처리: [year, month, day, hour, minute, second, nanosecond]
                const [year, month, day, hour, minute, second, nanosecond] = dateValue;
                // JavaScript Date의 월은 0부터 시작하므로 1을 빼야 함
                date = new Date(year, month - 1, day, hour, minute, second, Math.floor((nanosecond || 0) / 1000000));
            } else {
                console.warn('지원하지 않는 날짜 형식:', typeof dateValue, dateValue);
                return t('junit.detail.unknownDateFormat');
            }
            
            // 유효한 날짜인지 확인
            if (isNaN(date.getTime())) {
                console.warn('유효하지 않은 날짜 값:', dateValue);
                // 원본 값이 문자열이면 그대로 표시
                if (typeof dateValue === 'string' && dateValue.trim()) {
                    return dateValue.trim();
                }
                return t('junit.detail.invalidDate');
            }
            
            return formatDistanceToNow(date, { 
                addSuffix: true, 
                locale: ko 
            });
        } catch (error) {
            console.error('날짜 포맷팅 오류:', error, 'Input:', dateValue);
            // 에러 발생 시 원본 값 표시 (문자열인 경우)
            if (typeof dateValue === 'string' && dateValue.trim()) {
                return dateValue.trim();
            }
            return t('junit.detail.dateProcessingError');
        }
    };

    // 필터링된 테스트 케이스
    const filteredTestCases = testCases.filter(testCase => {
        const matchesStatus = statusFilter === 'ALL' || testCase.status === statusFilter;
        const matchesSearch = !searchText || 
            testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
            testCase.className.toLowerCase().includes(searchText.toLowerCase()) ||
            (testCase.userTitle && testCase.userTitle.toLowerCase().includes(searchText.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <Container>
                <LinearProgress sx={{ mt: 2 }} />
                <Typography sx={{ mt: 2, textAlign: 'center' }}>
                    {t('junit.detail.loadingDetail')}
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
                <Button 
                    startIcon={<BackIcon />} 
                    onClick={() => {
                        if (projectId) {
                            navigate(`/projects/${projectId}/automation`);
                        } else if (currentProject?.id) {
                            navigate(`/projects/${currentProject.id}/automation`);
                        } else {
                            navigate(-1);
                        }
                    }}
                    sx={{ mt: 2 }}
                >
                    {t('junit.detail.backToAutomation')}
                </Button>
            </Container>
        );
    }

    if (!testResult) {
        return (
            <Container>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    {t('junit.detail.notFound')}
                </Alert>
                <Button 
                    startIcon={<BackIcon />} 
                    onClick={() => {
                        if (projectId) {
                            navigate(`/projects/${projectId}/automation`);
                        } else if (currentProject?.id) {
                            navigate(`/projects/${currentProject.id}/automation`);
                        } else {
                            navigate(-1);
                        }
                    }}
                    sx={{ mt: 2 }}
                >
                    {t('junit.detail.backToAutomation')}
                </Button>
            </Container>
        );
    }

    const successRate = testResult.totalTests > 0 
        ? ((testResult.totalTests - testResult.failures - testResult.errors) / testResult.totalTests * 100)
        : 0;

    return (
        <Box sx={PAGE_CONTAINER_SX.main}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<BackIcon />}
                        onClick={() => {
                            if (projectId) {
                                navigate(`/projects/${projectId}/automation`);
                            } else if (currentProject?.id) {
                                navigate(`/projects/${currentProject.id}/automation`);
                            } else {
                                navigate(-1);
                            }
                        }}
                        variant="outlined"
                    >
                        {t('junit.detail.backToAutomation')}
                    </Button>
                    <Box>
                        <Typography variant="h4" component="h1">
                            {testResult.testExecutionName || testResult.fileName}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {t('junit.detail.uploadInfo', {
                                date: formatSafeDate(testResult.uploadedAt),
                                uploader: testResult.uploadedBy?.displayName || testResult.uploadedBy?.username
                            })}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportToPDF}
                        disabled={exportingPDF || !testResult}
                        color="primary"
                        sx={{
                            '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'white'
                            }
                        }}
                    >
                        {exportingPDF ? t('junit.detail.exportingPDF') : t('junit.detail.exportPDF')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<TableChartIcon />}
                        onClick={handleExportToCSV}
                        disabled={exportingCSV || !testResult}
                        color="secondary"
                        sx={{
                            '&:hover': {
                                bgcolor: 'secondary.light',
                                color: 'white'
                            }
                        }}
                    >
                        {exportingCSV ? t('junit.detail.exportingCSV') : t('junit.detail.exportCSV')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => setVersionManagerOpen(true)}
                    >
                        {t('junit.detail.versionManagement')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadData}
                        disabled={loading}
                    >
                        {t('junit.detail.refresh')}
                    </Button>
                </Box>
            </Box>

            {/* 통계 카드 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: STATUS_BG_COLORS.PASSED }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PassIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.passed')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: STATUS_BG_COLORS.FAILED }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <FailIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="h4" color="error.main">
                                {testResult.failures}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.failed')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: STATUS_BG_COLORS.ERROR }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ErrorIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {testResult.errors}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.error')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: STATUS_BG_COLORS.SKIPPED }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SkipIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="h4" color="text.secondary">
                                {testResult.skipped}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.skipped')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary.main">
                                {successRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.successRate')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label={t('junit.detail.tab.testCases')} />
                    <Tab label={t('junit.detail.tab.failedTests')} />
                    <Tab label={t('junit.detail.tab.slowTests')} />
                </Tabs>
            </Box>

            {/* 테스트 케이스 탭 - ICT-337: Split Panel 레이아웃 */}
            {tabValue === 0 && (
                <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 400px)' }}>
                    {/* 좌측 패널: 테스트 케이스 목록 */}
                    <Card sx={{ 
                        flex: showDetailPanel ? '1 1 30%' : '1 1 100%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardContent sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                        {/* 스위트 선택 및 필터 */}
                        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>{t('junit.detail.testSuite')}</InputLabel>
                                <Select
                                    value={selectedSuite?.id || ''}
                                    onChange={(e) => {
                                        const suite = testSuites.find(s => s.id === e.target.value);
                                        if (suite) handleSuiteChange(suite);
                                    }}
                                >
                                    {testSuites.map(suite => (
                                        <MenuItem key={suite.id} value={suite.id}>
                                            {suite.name} ({suite.tests}{t('common.unit.count')})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>{t('common.status')}</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="ALL">{t('common.all')}</MenuItem>
                                    <MenuItem value="PASSED">{t('junit.stats.passed')}</MenuItem>
                                    <MenuItem value="FAILED">{t('junit.stats.failed')}</MenuItem>
                                    <MenuItem value="ERROR">{t('junit.stats.error')}</MenuItem>
                                    <MenuItem value="SKIPPED">{t('junit.stats.skipped')}</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                placeholder={t('junit.detail.testCaseSearch')}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* 테스트 케이스 테이블 */}
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">{t('common.status')}</TableCell>
                                        <TableCell>{t('junit.detail.testName')}</TableCell>
                                        <TableCell align="center" width="80px">{t('junit.detail.edit')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTestCases.map((testCase) => {
                                        const status = statusConfig[testCase.status] || statusConfig.PASSED;
                                        const hasUserEdits = testCase.userTitle || testCase.userDescription || 
                                                           testCase.userNotes || testCase.userStatus || testCase.tags;

                                        return (
                                            <TableRow 
                                                key={testCase.id}
                                                sx={{ 
                                                    bgcolor: hasUserEdits ? 'action.hover' : 'inherit',
                                                    '&:hover': { bgcolor: 'action.selected' }
                                                }}
                                            >
                                                <TableCell align="center">
                                                    <Chip
                                                        icon={status.icon}
                                                        label={status.label}
                                                        color={status.color}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight="medium"
                                                        sx={{ 
                                                            cursor: 'pointer',
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                        onClick={() => handleTestCaseClick(testCase.id)}
                                                    >
                                                        {testCase.userTitle || testCase.name}
                                                    </Typography>
                                                    {testCase.userTitle && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {t('junit.detail.original')}: {testCase.name}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditTestCase(testCase)}
                                                        color="primary"
                                                        sx={{ 
                                                            '&:hover': {
                                                                bgcolor: 'primary.light',
                                                                color: 'white'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>
                
                {/* ICT-337: 우측 패널 - 테스트 케이스 상세 정보 */}
                {showDetailPanel && (
                    <Card sx={{ 
                        flex: '1 1 70%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <TestCaseDetailPanel
                            testCaseId={selectedTestCaseId}
                            onClose={handleCloseDetailPanel}
                            onEditTestCase={handleEditTestCase}
                        />
                    </Card>
                )}
                </Box>
            )}

            {/* 실패한 테스트 탭 */}
            {tabValue === 1 && (
                <FailedTestsTab testResultId={testResultId} onEditTestCase={handleEditTestCase} />
            )}

            {/* 느린 테스트 탭 */}
            {tabValue === 2 && (
                <SlowestTestsTab testResultId={testResultId} onEditTestCase={handleEditTestCase} />
            )}

            {/* 테스트 케이스 편집 다이얼로그 */}
            <JunitTestCaseEditor
                testCase={selectedTestCase}
                isOpen={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedTestCase(null);
                }}
                onSave={handleEditSave}
            />

            {/* 버전 관리 다이얼로그 */}
            <JunitVersionManager
                testResultId={testResultId}
                open={versionManagerOpen}
                onClose={() => setVersionManagerOpen(false)}
            />
        </Box>
    );
};

// 실패한 테스트 탭 컴포넌트 - ICT-337 확장: Split Panel 구조
const FailedTestsTab = ({ testResultId, onEditTestCase }) => {
    const { t } = useI18n();
    const [failedTests, setFailedTests] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // ICT-337: 실패한 테스트 탭용 Split Panel 상태
    const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
    const [showDetailPanel, setShowDetailPanel] = useState(false);

    useEffect(() => {
        const loadFailedTests = async () => {
            setLoading(true);
            try {
                const response = await junitResultService.getFailedTestCases(testResultId);
                setFailedTests(response.failedCases || []);
            } catch (err) {
                console.error('실패한 테스트 로드 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        loadFailedTests();
    }, [testResultId]);

    // ICT-337: 실패한 테스트 케이스 클릭 핸들러
    const handleFailedTestCaseClick = (testCaseId) => {
        setSelectedTestCaseId(testCaseId);
        setShowDetailPanel(true);
    };
    
    // ICT-337: 상세 패널 닫기
    const handleCloseDetailPanel = () => {
        setShowDetailPanel(false);
        setSelectedTestCaseId(null);
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 400px)' }}>
            {/* 좌측 패널: 실패한 테스트 케이스 목록 */}
            <Card sx={{ 
                flex: showDetailPanel ? '1 1 30%' : '1 1 100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <CardContent sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <Typography variant="h6" gutterBottom>
                        {t('junit.detail.failedTestCases')} ({failedTests.length}{t('common.unit.count')})
                    </Typography>
                    
                    {failedTests.length === 0 ? (
                        <Alert severity="success">
                            {t('junit.detail.noFailedTests')}
                        </Alert>
                    ) : (
                        <Box sx={{ overflow: 'auto', flex: 1 }}>
                            {failedTests.map((testCase, index) => (
                                <Card key={testCase.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                            <Chip
                                                icon={testCase.status === 'FAILED' ? <FailIcon /> : <ErrorIcon />}
                                                label={testCase.status === 'FAILED' ? t('junit.stats.failed') : t('junit.stats.error')}
                                                color={testCase.status === 'FAILED' ? 'error' : 'warning'}
                                                size="small"
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            textDecoration: 'underline'
                                                        },
                                                        fontSize: '1rem',
                                                        fontWeight: 'medium',
                                                        mb: 1
                                                    }}
                                                    onClick={() => handleFailedTestCaseClick(testCase.id)}
                                                >
                                                    {testCase.userTitle || testCase.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                    {testCase.className}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => onEditTestCase(testCase)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Box>
                                        
                                        {/* 간단한 미리보기 - 실패 메시지만 축약 표시 */}
                                        {testCase.failureMessage && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('junit.detail.failureMessagePreview')}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="error"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        bgcolor: STATUS_BG_COLORS.FAILED,
                                                        p: 1,
                                                        borderRadius: 1,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {testCase.failureMessage.split('\n')[0].substring(0, 100)}
                                                    {testCase.failureMessage.length > 100 ? '...' : ''}
                                                </Typography>
                                                <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                                                    {t('junit.detail.clickForDetails')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
            
            {/* ICT-337: 우측 패널 - 실패한 테스트 케이스 상세 정보 */}
            {showDetailPanel && (
                <Card sx={{ 
                    flex: '1 1 70%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <TestCaseDetailPanel
                        testCaseId={selectedTestCaseId}
                        onClose={handleCloseDetailPanel}
                        onEditTestCase={onEditTestCase}
                    />
                </Card>
            )}
        </Box>
    );
};

// 느린 테스트 탭 컴포넌트
const SlowestTestsTab = ({ testResultId, onEditTestCase }) => {
    const { t } = useI18n();
    const [slowestTests, setSlowestTests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadSlowestTests = async () => {
            setLoading(true);
            try {
                const response = await junitResultService.getSlowestTestCases(testResultId, 20);
                setSlowestTests(response.slowestCases || []);
            } catch (err) {
                console.error('느린 테스트 로드 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSlowestTests();
    }, [testResultId]);

    const formatDuration = (seconds) => {
        if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
        if (seconds < 60) return `${seconds.toFixed(2)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}m ${remainingSeconds}s`;
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {t('junit.detail.slowestTestsTop', { count: slowestTests.length })}
                </Typography>
                <List>
                    {slowestTests.map((testCase, index) => (
                        <ListItem
                            key={testCase.id}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: index < 3 ? 'warning.light' : 'background.paper'
                            }}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => onEditTestCase(testCase)}>
                                    <EditIcon />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>
                                <SpeedIcon color={index < 3 ? 'warning' : 'action'} />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body1">
                                            {testCase.userTitle || testCase.name}
                                        </Typography>
                                        <Chip
                                            label={`#${index + 1}`}
                                            size="small"
                                            color={index < 3 ? 'warning' : 'default'}
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={formatDuration(testCase.time || 0)}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                }
                                secondary={testCase.className}
                            />
                        </ListItem>
                    ))}
                </List>
                {slowestTests.length === 0 && (
                    <Alert severity="info">
                        {t('junit.detail.noExecutionTimeData')}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default JunitResultDetail;