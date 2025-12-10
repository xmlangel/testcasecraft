// src/main/frontend/src/components/JUnit/JunitResultDetail.jsx

import React, { useState, useEffect } from 'react';
import junitResultService from '../../services/junitResultService';
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
    Stack,
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
import { useTheme, alpha } from '@mui/material/styles';
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
    Download as DownloadIcon,
    Delete as DeleteIcon,
    History as HistoryIcon,
    FileDownload as FileDownloadIcon,
    TableChart as TableChartIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useAppContext } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import JunitTestCaseEditor from './JunitTestCaseEditor';
import TestCaseDetailPanel from './TestCaseDetailPanel';
import { STATUS_COLORS, RESULT_COLORS } from '../../constants/statusColors';
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
    const theme = useTheme();

    // 전체 스윗을 나타내는 특별한 ID
    const ALL_SUITES_ID = 'ALL_SUITES';

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

    // 페이징 및 필터링
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const location = useLocation();
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
            icon: <PassIcon sx={{ color: RESULT_COLORS.PASS }} />,
            label: t('junit.stats.passed'),
            bgColor: alpha(RESULT_COLORS.PASS, 0.1),
            textColor: RESULT_COLORS.PASS
        },
        FAILED: {
            color: 'error',
            icon: <FailIcon sx={{ color: RESULT_COLORS.FAIL }} />,
            label: t('junit.stats.failed'),
            bgColor: alpha(RESULT_COLORS.FAIL, 0.1),
            textColor: RESULT_COLORS.FAIL
        },
        ERROR: {
            color: 'warning',
            icon: <ErrorIcon sx={{ color: STATUS_COLORS.ERROR }} />,
            label: t('junit.stats.error'),
            bgColor: alpha(STATUS_COLORS.ERROR, 0.1),
            textColor: STATUS_COLORS.ERROR
        },
        SKIPPED: {
            color: 'default',
            icon: <SkipIcon sx={{ color: RESULT_COLORS.SKIPPED }} />,
            label: t('junit.stats.skipped'),
            bgColor: alpha(RESULT_COLORS.SKIPPED, 0.1),
            textColor: RESULT_COLORS.SKIPPED
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

            // 기본값으로 '전체' 선택
            if (suitesResponse.testSuites && suitesResponse.testSuites.length > 0) {
                setSelectedSuite({ id: ALL_SUITES_ID, name: t('common.all') });
                await loadAllTestCases(suitesResponse.testSuites, 0);
            }

        } catch (err) {
            console.error('JUnit 결과 상세 로드 실패:', err);
            setError(t('junit.detail.loadFailedDetail'));
        } finally {
            setLoading(false);
        }
    };

    // 전체 테스트 케이스 로드 (모든 스윗) - Lazy Loading 방식
    const loadAllTestCases = async (suites, pageNum = 0) => {
        try {
            // 각 스윗의 테스트 케이스 개수로 전체 개수 계산 (초기값)
            let totalTestCases = suites.reduce((sum, suite) => sum + (suite.tests || 0), 0);
            const initialTotalPages = Math.ceil(totalTestCases / pageSize);
            setTotalPages(initialTotalPages);

            // 현재 페이지의 시작/끝 인덱스 계산
            const pageStartIndex = pageNum * pageSize;
            const pageEndIndex = pageStartIndex + pageSize;

            // 현재 페이지에 필요한 스윗과 범위 계산
            const pageCases = [];
            let currentIndex = 0;

            for (let i = 0; i < suites.length; i++) {
                const suite = suites[i];
                const suiteTestCount = suite.tests || 0;
                const suiteStartIndex = currentIndex;
                const suiteEndIndex = currentIndex + suiteTestCount;

                // 이 스윗이 현재 페이지 범위와 겹치는지 확인
                if (suiteEndIndex > pageStartIndex && suiteStartIndex < pageEndIndex) {
                    // 스윗 내에서 어느 부분을 가져와야 하는지 계산
                    const suitePageStart = Math.max(0, pageStartIndex - suiteStartIndex);
                    const suitePageEnd = Math.min(suiteTestCount, pageEndIndex - suiteStartIndex);
                    const suitePage = Math.floor(suitePageStart / pageSize);
                    const suitePageSize = suitePageEnd - suitePageStart;

                    try {
                        // 해당 스윗의 필요한 부분만 로드
                        const response = await junitResultService.getTestCasesBySuite(
                            suite.id,
                            suitePage,
                            Math.min(pageSize, suiteTestCount)
                        );

                        const cases = response.content || [];

                        // 필요한 범위만 추출
                        const localStart = suitePageStart % pageSize;
                        const localEnd = localStart + suitePageSize;
                        const selectedCases = cases.slice(localStart, localEnd);

                        // 각 테스트 케이스에 스윗 정보 추가
                        const casesWithSuite = selectedCases.map(tc => ({
                            ...tc,
                            suiteName: suite.name,
                            suiteId: suite.id
                        }));

                        pageCases.push(...casesWithSuite);
                    } catch (error) {
                        console.warn(`스윗 ${suite.name}의 테스트 케이스 로드 실패:`, error);
                    }
                }

                currentIndex += suiteTestCount;

                // 현재 페이지 범위를 벗어났으면 더 이상 로드하지 않음
                if (currentIndex >= pageEndIndex) {
                    break;
                }
            }

            setTestCases(pageCases);

        } catch (err) {
            console.error('전체 테스트 케이스 로드 실패:', err);
            setError(t('junit.detail.loadTestCasesFailed'));
        }
    };

    // 단일 스윗의 테스트 케이스 로드
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

        if (suite.id === ALL_SUITES_ID) {
            // 전체 선택 시 - 페이지 0부터 시작
            await loadAllTestCases(testSuites, 0);
        } else {
            // 특정 스윗 선택 시
            await loadTestCases(suite.id, 0);
        }
    };

    // 페이지 변경
    const handlePageChange = async (event, newPage) => {
        setPage(newPage);

        if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
            // 전체 보기에서 페이징 - Lazy Loading
            await loadAllTestCases(testSuites, newPage - 1);
        } else if (selectedSuite) {
            // 특정 스윗에서 페이징
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

    // 테스트 케이스 네비게이션: 이전
    const handleNavigatePrev = async () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc.id === selectedTestCaseId);

        if (currentIndex > 0) {
            // 현재 페이지 내에서 이전 케이스로 이동
            const prevTestCase = filteredTestCases[currentIndex - 1];
            setSelectedTestCaseId(prevTestCase.id);
        } else if (page > 1) {
            // 이전 페이지로 이동
            const newPage = page - 1;
            setPage(newPage);

            if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
                await loadAllTestCases(testSuites, newPage - 1);
            } else if (selectedSuite) {
                await loadTestCases(selectedSuite.id, newPage - 1);
            }

            // 다음 틱에 마지막 케이스 선택 (페이지가 로드된 후)
            setTimeout(() => {
                const newFilteredCases = testCases.filter(testCase => {
                    const matchesStatus = statusFilter === 'ALL' || testCase.status === statusFilter;
                    const matchesSearch = !searchText ||
                        testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        testCase.className.toLowerCase().includes(searchText.toLowerCase()) ||
                        (testCase.userTitle && testCase.userTitle.toLowerCase().includes(searchText.toLowerCase()));
                    return matchesStatus && matchesSearch;
                });

                if (newFilteredCases.length > 0) {
                    setSelectedTestCaseId(newFilteredCases[newFilteredCases.length - 1].id);
                }
            }, 100);
        }
    };

    // 테스트 케이스 네비게이션: 다음
    const handleNavigateNext = async () => {
        const currentIndex = filteredTestCases.findIndex(tc => tc.id === selectedTestCaseId);

        if (currentIndex < filteredTestCases.length - 1) {
            // 현재 페이지 내에서 다음 케이스로 이동
            const nextTestCase = filteredTestCases[currentIndex + 1];
            setSelectedTestCaseId(nextTestCase.id);
        } else if (page < totalPages) {
            // 다음 페이지로 이동
            const newPage = page + 1;
            setPage(newPage);

            if (selectedSuite && selectedSuite.id === ALL_SUITES_ID) {
                await loadAllTestCases(testSuites, newPage - 1);
            } else if (selectedSuite) {
                await loadTestCases(selectedSuite.id, newPage - 1);
            }

            // 다음 틱에 첫 번째 케이스 선택 (페이지가 로드된 후)
            setTimeout(() => {
                const newFilteredCases = testCases.filter(testCase => {
                    const matchesStatus = statusFilter === 'ALL' || testCase.status === statusFilter;
                    const matchesSearch = !searchText ||
                        testCase.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        testCase.className.toLowerCase().includes(searchText.toLowerCase()) ||
                        (testCase.userTitle && testCase.userTitle.toLowerCase().includes(searchText.toLowerCase()));
                    return matchesStatus && matchesSearch;
                });

                if (newFilteredCases.length > 0) {
                    setSelectedTestCaseId(newFilteredCases[0].id);
                }
            }, 100);
        }
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
                    const response = await junitResultService.getTestCasesBySuite(suite.id, 0, 1000);
                    allTestCases.push(...(response.content || []));
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
                            {t('junit.detail.upload')}: {formatSafeDate(testResult.uploadedAt)} | {testResult.uploadedBy?.displayName || testResult.uploadedBy?.username || t('junit.detail.unknownUploader')}
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
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card sx={{ bgcolor: alpha(RESULT_COLORS.PASS, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PassIcon sx={{ fontSize: 40, color: RESULT_COLORS.PASS, mb: 1 }} />
                            <Typography variant="h4" sx={{ color: RESULT_COLORS.PASS, fontWeight: 'bold' }}>
                                {testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.passed')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card sx={{ bgcolor: alpha(RESULT_COLORS.FAIL, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <FailIcon sx={{ fontSize: 40, color: RESULT_COLORS.FAIL, mb: 1 }} />
                            <Typography variant="h4" sx={{ color: RESULT_COLORS.FAIL, fontWeight: 'bold' }}>
                                {testResult.failures}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.failed')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card sx={{ bgcolor: alpha(STATUS_COLORS.ERROR, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ErrorIcon sx={{ fontSize: 40, color: STATUS_COLORS.ERROR, mb: 1 }} />
                            <Typography variant="h4" sx={{ color: STATUS_COLORS.ERROR, fontWeight: 'bold' }}>
                                {testResult.errors}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.error')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card sx={{ bgcolor: alpha(RESULT_COLORS.SKIPPED, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SkipIcon sx={{ fontSize: 40, color: RESULT_COLORS.SKIPPED, mb: 1 }} />
                            <Typography variant="h4" sx={{ color: RESULT_COLORS.SKIPPED, fontWeight: 'bold' }}>
                                {testResult.skipped}
                            </Typography>
                            <Typography variant="body2">{t('junit.stats.skipped')}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
                                            if (e.target.value === ALL_SUITES_ID) {
                                                handleSuiteChange({ id: ALL_SUITES_ID, name: t('common.all') });
                                            } else {
                                                const suite = testSuites.find(s => s.id === e.target.value);
                                                if (suite) handleSuiteChange(suite);
                                            }
                                        }}
                                    >
                                        {/* 전체 옵션 */}
                                        <MenuItem key={ALL_SUITES_ID} value={ALL_SUITES_ID}>
                                            {t('common.all')} ({testResult?.totalTests || 0}{t('common.unit.count')})
                                        </MenuItem>

                                        {/* 개별 스윗 목록 */}
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
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                            </Box>

                            {/* 테스트 케이스 테이블 */}
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">{t('common.status')}</TableCell>
                                            {selectedSuite?.id === ALL_SUITES_ID && (
                                                <TableCell>{t('junit.detail.testSuite')}</TableCell>
                                            )}
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
                                                            size="small"
                                                            sx={{
                                                                bgcolor: status.bgColor,
                                                                color: status.textColor,
                                                                fontWeight: 'bold',
                                                                '& .MuiChip-icon': {
                                                                    color: 'inherit'
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    {selectedSuite?.id === ALL_SUITES_ID && (
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {testCase.suiteName || '-'}
                                                            </Typography>
                                                        </TableCell>
                                                    )}
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
                    {showDetailPanel && (() => {
                        const currentIndex = filteredTestCases.findIndex(tc => tc.id === selectedTestCaseId);
                        return (
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
                                    onNavigatePrev={handleNavigatePrev}
                                    onNavigateNext={handleNavigateNext}
                                    hasPrev={currentIndex > 0 || page > 1}
                                    hasNext={currentIndex < filteredTestCases.length - 1 || page < totalPages}
                                />
                            </Card>
                        );
                    })()}
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
                                                size="small"
                                                sx={{
                                                    bgcolor: testCase.status === 'FAILED' ? alpha(RESULT_COLORS.FAIL, 0.1) : alpha(STATUS_COLORS.ERROR, 0.1),
                                                    color: testCase.status === 'FAILED' ? RESULT_COLORS.FAIL : STATUS_COLORS.ERROR,
                                                    fontWeight: 'bold',
                                                    '& .MuiChip-icon': {
                                                        color: 'inherit'
                                                    }
                                                }}
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
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        p: 1,
                                                        borderRadius: 1,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        fontSize: '0.75rem',
                                                        color: RESULT_COLORS.FAIL,
                                                        bgcolor: alpha(RESULT_COLORS.FAIL, 0.05)
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
            {
                showDetailPanel && (() => {
                    const currentIndex = failedTests.findIndex(tc => tc.id === selectedTestCaseId);
                    return (
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
                                onNavigatePrev={() => {
                                    if (currentIndex > 0) {
                                        setSelectedTestCaseId(failedTests[currentIndex - 1].id);
                                    }
                                }}
                                onNavigateNext={() => {
                                    if (currentIndex < failedTests.length - 1) {
                                        setSelectedTestCaseId(failedTests[currentIndex + 1].id);
                                    }
                                }}
                                hasPrev={currentIndex > 0}
                                hasNext={currentIndex < failedTests.length - 1}
                            />
                        </Card>
                    );
                })()
            }
        </Box >
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