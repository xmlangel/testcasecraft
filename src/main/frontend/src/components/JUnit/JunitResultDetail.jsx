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
    History as HistoryIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useAppContext } from '../../context/AppContext';
import junitResultService from '../../services/junitResultService';
import JunitTestCaseEditor from './JunitTestCaseEditor';
import JunitVersionManager from './JunitVersionManager';

/**
 * JUnit 테스트 결과 상세 뷰 컴포넌트
 */
const JunitResultDetail = () => {
    const { testResultId, projectId } = useParams();
    const navigate = useNavigate();
    const { currentProject } = useAppContext();

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
    const [pageSize, setPageSize] = useState(50);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchText, setSearchText] = useState('');

    // 상태별 설정
    const statusConfig = {
        PASSED: { 
            color: 'success', 
            icon: <PassIcon />, 
            label: '통과',
            bgColor: '#e8f5e8'
        },
        FAILED: { 
            color: 'error', 
            icon: <FailIcon />, 
            label: '실패',
            bgColor: '#ffebee'
        },
        ERROR: { 
            color: 'warning', 
            icon: <ErrorIcon />, 
            label: '에러',
            bgColor: '#fff3e0'
        },
        SKIPPED: { 
            color: 'default', 
            icon: <SkipIcon />, 
            label: '스킵',
            bgColor: '#f5f5f5'
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
            setError('테스트 결과 상세 정보를 불러오는데 실패했습니다.');
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
            setError('테스트 케이스를 불러오는데 실패했습니다.');
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
    const handleEditSave = (updatedTestCase) => {
        // 테스트 케이스 목록 업데이트
        setTestCases(prev => 
            prev.map(tc => tc.id === updatedTestCase.testCase.id ? updatedTestCase.testCase : tc)
        );
        setEditDialogOpen(false);
        setSelectedTestCase(null);
    };

    // 탭 변경
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                return '날짜 정보 없음';
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
                return '알 수 없는 날짜 형식';
            }
            
            // 유효한 날짜인지 확인
            if (isNaN(date.getTime())) {
                console.warn('유효하지 않은 날짜 값:', dateValue);
                // 원본 값이 문자열이면 그대로 표시
                if (typeof dateValue === 'string' && dateValue.trim()) {
                    return dateValue.trim();
                }
                return '유효하지 않은 날짜';
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
            return '날짜 처리 오류';
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
                    테스트 결과를 불러오는 중...
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
                    자동화 테스트로 돌아가기
                </Button>
            </Container>
        );
    }

    if (!testResult) {
        return (
            <Container>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    테스트 결과를 찾을 수 없습니다.
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
                    자동화 테스트로 돌아가기
                </Button>
            </Container>
        );
    }

    const successRate = testResult.totalTests > 0 
        ? ((testResult.totalTests - testResult.failures - testResult.errors) / testResult.totalTests * 100)
        : 0;

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
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
                        자동화 테스트로 돌아가기
                    </Button>
                    <Box>
                        <Typography variant="h4" component="h1">
                            {testResult.testExecutionName || testResult.fileName}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            업로드: {formatSafeDate(testResult.uploadedAt)} | {testResult.uploadedBy?.displayName || testResult.uploadedBy?.username}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => setVersionManagerOpen(true)}
                    >
                        버전 관리
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadData}
                        disabled={loading}
                    >
                        새로고침
                    </Button>
                </Box>
            </Box>

            {/* 통계 카드 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: '#e8f5e8' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PassIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped}
                            </Typography>
                            <Typography variant="body2">통과</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <FailIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="h4" color="error.main">
                                {testResult.failures}
                            </Typography>
                            <Typography variant="body2">실패</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ErrorIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {testResult.errors}
                            </Typography>
                            <Typography variant="body2">에러</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ bgcolor: '#f5f5f5' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SkipIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="h4" color="text.secondary">
                                {testResult.skipped}
                            </Typography>
                            <Typography variant="body2">스킵</Typography>
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
                            <Typography variant="body2">성공률</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="테스트 케이스" />
                    <Tab label="실패한 테스트" />
                    <Tab label="느린 테스트" />
                </Tabs>
            </Box>

            {/* 테스트 케이스 탭 */}
            {tabValue === 0 && (
                <Card>
                    <CardContent>
                        {/* 스위트 선택 및 필터 */}
                        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>테스트 스위트</InputLabel>
                                <Select
                                    value={selectedSuite?.id || ''}
                                    onChange={(e) => {
                                        const suite = testSuites.find(s => s.id === e.target.value);
                                        if (suite) handleSuiteChange(suite);
                                    }}
                                >
                                    {testSuites.map(suite => (
                                        <MenuItem key={suite.id} value={suite.id}>
                                            {suite.name} ({suite.tests}개)
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>상태</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="ALL">전체</MenuItem>
                                    <MenuItem value="PASSED">통과</MenuItem>
                                    <MenuItem value="FAILED">실패</MenuItem>
                                    <MenuItem value="ERROR">에러</MenuItem>
                                    <MenuItem value="SKIPPED">스킵</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                placeholder="테스트 케이스 검색..."
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
                                        <TableCell>테스트명</TableCell>
                                        <TableCell>클래스</TableCell>
                                        <TableCell align="center">상태</TableCell>
                                        <TableCell align="center">실행시간</TableCell>
                                        <TableCell align="center">편집정보</TableCell>
                                        <TableCell align="center">작업</TableCell>
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
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {testCase.userTitle || testCase.name}
                                                    </Typography>
                                                    {testCase.userTitle && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            원본: {testCase.name}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {testCase.className}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                        <Chip
                                                            icon={status.icon}
                                                            label={status.label}
                                                            color={status.color}
                                                            size="small"
                                                        />
                                                        {testCase.userStatus && testCase.userStatus !== testCase.status && (
                                                            <Chip
                                                                label="편집됨"
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">
                                                        {formatDuration(testCase.time || 0)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {hasUserEdits && (
                                                        <Box display="flex" gap={0.5} justifyContent="center">
                                                            {testCase.tags && (
                                                                <Chip label="태그" size="small" color="info" variant="outlined" />
                                                            )}
                                                            {testCase.userNotes && (
                                                                <Chip label="노트" size="small" color="success" variant="outlined" />
                                                            )}
                                                            {testCase.priority && testCase.priority !== 'MEDIUM' && (
                                                                <Chip 
                                                                    label={testCase.priority === 'HIGH' ? '높음' : '낮음'} 
                                                                    size="small" 
                                                                    color={testCase.priority === 'HIGH' ? 'error' : 'default'} 
                                                                    variant="outlined" 
                                                                />
                                                            )}
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="테스트 케이스 편집">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditTestCase(testCase)}
                                                            color={hasUserEdits ? 'primary' : 'default'}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
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
        </Container>
    );
};

// 실패한 테스트 탭 컴포넌트
const FailedTestsTab = ({ testResultId, onEditTestCase }) => {
    const [failedTests, setFailedTests] = useState([]);
    const [loading, setLoading] = useState(false);

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

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    실패한 테스트 케이스 ({failedTests.length}개)
                </Typography>
                {failedTests.map((testCase, index) => (
                    <Accordion key={testCase.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Chip
                                    icon={testCase.status === 'FAILED' ? <FailIcon /> : <ErrorIcon />}
                                    label={testCase.status === 'FAILED' ? '실패' : '에러'}
                                    color={testCase.status === 'FAILED' ? 'error' : 'warning'}
                                    size="small"
                                />
                                <Typography sx={{ flexGrow: 1 }}>
                                    {testCase.userTitle || testCase.name}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTestCase(testCase);
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ pl: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {testCase.className}
                                </Typography>
                                {testCase.failureMessage && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            실패 메시지:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="error"
                                            sx={{
                                                fontFamily: 'monospace',
                                                bgcolor: '#ffebee',
                                                p: 1,
                                                borderRadius: 1,
                                                whiteSpace: 'pre-wrap'
                                            }}
                                        >
                                            {testCase.failureMessage}
                                        </Typography>
                                    </Box>
                                )}
                                {testCase.stackTrace && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            스택 트레이스:
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                bgcolor: '#f5f5f5',
                                                p: 1,
                                                borderRadius: 1,
                                                whiteSpace: 'pre-wrap',
                                                display: 'block',
                                                maxHeight: '200px',
                                                overflow: 'auto'
                                            }}
                                        >
                                            {testCase.stackTrace}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
                {failedTests.length === 0 && (
                    <Alert severity="success">
                        실패한 테스트 케이스가 없습니다!
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

// 느린 테스트 탭 컴포넌트
const SlowestTestsTab = ({ testResultId, onEditTestCase }) => {
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
                    가장 느린 테스트 케이스 (상위 {slowestTests.length}개)
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
                        실행 시간 데이터가 없습니다.
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default JunitResultDetail;