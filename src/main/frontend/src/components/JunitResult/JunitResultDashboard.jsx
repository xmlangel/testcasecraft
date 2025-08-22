// src/components/JunitResult/JunitResultDashboard.jsx

/**
 * ICT-200: Allure 스타일 JUnit 테스트 결과 대시보드
 * JUnit XML 파일 업로드 및 테스트 결과 시각화
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Tab,
  Tabs,
  AppBar,
} from '@mui/material';
import {
  CloudUpload,
  Assessment,
  Error,
  CheckCircle,
  Warning,
  Schedule,
  Refresh,
  Delete,
  Visibility,
  TrendingUp,
  BarChart,
  PieChart,
  Add,
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import junitResultService from '../../services/junitResultService';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import JunitProcessingProgress from '../JUnit/JunitProcessingProgress';

// 색상 팔레트 (Allure 스타일)
import { STATUS_COLORS as COLORS, CHART_COLORS } from '../../constants/statusColors';

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
    
    return date;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error, 'Input:', dateValue);
    // 에러 발생 시 원본 값 표시 (문자열인 경우)
    if (typeof dateValue === 'string' && dateValue.trim()) {
      return dateValue.trim();
    }
    return '날짜 처리 오류';
  }
};

// 월일만 표시하는 함수 (툴팁에 전체 정보)
const formatDateShort = (dateValue) => {
  const safeDate = formatSafeDate(dateValue);
  
  if (safeDate instanceof Date) {
    const month = (safeDate.getMonth() + 1).toString().padStart(2, '0');
    const day = safeDate.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
  
  return safeDate; // 오류 메시지 그대로 반환
};

// 전체 날짜 정보 표시 함수 (툴팁용)
const formatDateFull = (dateValue) => {
  const safeDate = formatSafeDate(dateValue);
  
  if (safeDate instanceof Date) {
    return safeDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  return safeDate; // 오류 메시지 그대로 반환
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`junit-tabpanel-${index}`}
      aria-labelledby={`junit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function JunitResultDashboard() {
  const { activeProject, user } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // 진행률 추적 상태
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [processingTestResultId, setProcessingTestResultId] = useState(null);

  // 데이터 로드
  const loadData = useCallback(async (showLoader = true) => {
    if (!activeProject?.id) return;

    if (showLoader) setLoading(true);
    setError(null);

    try {
      // 병렬로 데이터 로드
      const [resultsResponse, statisticsResponse] = await Promise.all([
        junitResultService.getJunitResultsByProject(activeProject.id, page, 20),
        junitResultService.getJunitStatistics(activeProject.id, timeRange)
      ]);

      setTestResults(resultsResponse.content || []);
      setTotalPages(resultsResponse.totalPages || 0);
      setStatistics(statisticsResponse);

    } catch (err) {
      console.error('JUnit 결과 로드 실패:', err);
      setError('테스트 결과를 불러오는데 실패했습니다.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [activeProject?.id, page, timeRange]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 파일 업로드 처리
  const handleFileUpload = async (uploadData) => {
    if (!activeProject?.id) {
      setError('프로젝트가 선택되지 않았습니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await junitResultService.uploadJunitXml(
        uploadData.file,
        activeProject.id,
        uploadData.executionName,
        uploadData.description
      );

      setUploadProgress(100);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      
      // 비동기 처리인 경우 진행률 다이얼로그 표시
      if (result.isAsync && result.testResultId) {
        setProcessingTestResultId(result.testResultId);
        setProcessingDialogOpen(true);
      }
      
      // 성공 후 데이터 새로고침
      await loadData(false);

    } catch (err) {
      console.error('파일 업로드 실패:', err);
      setError(`파일 업로드 실패: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // 테스트 결과 삭제
  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('정말로 이 테스트 결과를 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      await junitResultService.deleteJunitResult(resultId);
      await loadData(false);
    } catch (err) {
      console.error('삭제 실패:', err);
      setError(`삭제 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 통계 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!statistics) return { pieData: [], barData: [], trendData: [] };

    // 파이 차트 데이터 (전체 테스트 상태별)
    const pieData = [
      { name: '통과', value: statistics.totalPassed || 0, color: COLORS.PASSED },
      { name: '실패', value: statistics.totalFailed || 0, color: COLORS.FAILED },
      { name: '에러', value: statistics.totalErrors || 0, color: COLORS.ERROR },
      { name: '스킵', value: statistics.totalSkipped || 0, color: COLORS.SKIPPED }
    ].filter(item => item.value > 0);

    // 바 차트 데이터 (최근 실행 결과별)
    const barData = testResults.slice(0, 10).map(result => ({
      name: result.testExecutionName?.substring(0, 20) || result.fileName?.substring(0, 20),
      통과: result.totalTests - result.failures - result.errors - result.skipped,
      실패: result.failures,
      에러: result.errors,
      스킵: result.skipped,
      successRate: result.successRate
    }));

    // 트렌드 차트 데이터 (시간별 성공률)
    const trendData = testResults.slice(0, 15).reverse().map((result, index) => ({
      name: `${index + 1}`,
      successRate: result.successRate || 0,
      totalTests: result.totalTests,
      uploadedAt: result.uploadedAt
    }));

    return { pieData, barData, trendData };
  }, [statistics, testResults]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 비동기 처리 완료 핸들러
  const handleProcessingComplete = async (testResultId) => {
    console.log('대용량 파일 처리 완료:', testResultId);
    
    // 데이터 새로고침
    await loadData(false);
    
    // 진행률 다이얼로그 자동 닫기
    setTimeout(() => {
      setProcessingDialogOpen(false);
      setProcessingTestResultId(null);
    }, 2000);
  };

  // 진행률 다이얼로그 닫기
  const handleProcessingDialogClose = () => {
    setProcessingDialogOpen(false);
    setProcessingTestResultId(null);
  };

  if (!activeProject) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          프로젝트를 먼저 선택해주세요.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            테스트 결과 대시보드
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {activeProject.name} - 자동화 테스트 결과 분석
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadData()}
            disabled={loading}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialogOpen(true)}
            disabled={loading}
          >
            테스트 결과 업로드
          </Button>
        </Box>
      </Box>

      {/* 로딩 상태 */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* 에러 알림 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 전체 통계 카드 */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {statistics.totalPassed || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      통과한 테스트
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="error.main">
                      {statistics.totalFailed || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      실패한 테스트
                    </Typography>
                  </Box>
                  <Error sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {statistics.totalErrors || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      에러 발생
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="text.secondary">
                      {statistics.averageSuccessRate?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      평균 성공률
                    </Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 40, color: 'text.secondary' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="개요" />
          <Tab label="최근 결과" />
          <Tab label="통계 차트" />
          <Tab label="트렌드 분석" />
        </Tabs>
      </Box>

      {/* 개요 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* 테스트 상태 분포 (파이 차트) */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  테스트 상태 분포
                </Typography>
                {chartData.pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData.pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {chartData.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      테스트 결과가 없습니다.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 최근 실행 결과 (바 차트) */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  최근 실행 결과
                </Typography>
                {chartData.barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={chartData.barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="통과" fill={COLORS.PASSED} />
                      <Bar dataKey="실패" fill={COLORS.FAILED} />
                      <Bar dataKey="에러" fill={COLORS.ERROR} />
                      <Bar dataKey="스킵" fill={COLORS.SKIPPED} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      테스트 결과가 없습니다.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 최근 결과 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              최근 테스트 실행 결과
            </Typography>
            {testResults.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>실행 이름</TableCell>
                      <TableCell>파일명</TableCell>
                      <TableCell align="center">총 테스트</TableCell>
                      <TableCell align="center">성공률</TableCell>
                      <TableCell align="center">상태</TableCell>
                      <TableCell align="center">업로드 시간</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testResults.map((result) => {
                      const statusInfo = junitResultService.getTestStatusInfo(result.status);
                      return (
                        <TableRow key={result.id}>
                          <TableCell>
                            {result.testExecutionName || '(이름 없음)'}
                          </TableCell>
                          <TableCell>{result.fileName}</TableCell>
                          <TableCell align="center">
                            <Badge badgeContent={result.failures + result.errors} color="error">
                              <Typography>{result.totalTests}</Typography>
                            </Badge>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={result.successRate || 0} 
                                sx={{ width: 60, height: 6 }}
                                color={junitResultService.getSuccessRateColor(result.successRate)}
                              />
                              <Typography variant="caption">
                                {(result.successRate || 0).toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={statusInfo.label}
                              size="small"
                              sx={{ bgcolor: statusInfo.bgColor }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={formatDateFull(result.uploadedAt)} arrow>
                              <Typography variant="body2" sx={{ cursor: 'help' }}>
                                {formatDateShort(result.uploadedAt)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="상세 보기">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/projects/${activeProject.id}/junit-results/${result.id}`)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="삭제">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteResult(result.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  테스트 결과가 없습니다
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  JUnit XML 파일을 업로드하여 테스트 결과를 분석해보세요.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialogOpen(true)}
                >
                  첫 번째 테스트 결과 업로드
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 통계 차트 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  상세 통계 정보
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  통계 차트 구현 예정
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 트렌드 분석 탭 */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              성공률 트렌드
            </Typography>
            {chartData.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip 
                    formatter={(value, name) => [`${value.toFixed(1)}%`, '성공률']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#2196F3" 
                    strokeWidth={3}
                    name="성공률 (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  트렌드 분석을 위한 데이터가 부족합니다.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 업로드 FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setUploadDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* 파일 업로드 다이얼로그 */}
      <JunitUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        loading={loading}
        progress={uploadProgress}
      />

      {/* 대용량 파일 처리 진행률 다이얼로그 */}
      <JunitProcessingProgress
        testResultId={processingTestResultId}
        isVisible={processingDialogOpen}
        onClose={handleProcessingDialogClose}
        onComplete={handleProcessingComplete}
      />
    </Container>
  );
}

// 파일 업로드 다이얼로그 컴포넌트
function JunitUploadDialog({ open, onClose, onUpload, loading, progress }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [executionName, setExecutionName] = useState('');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleFileSelect = (file) => {
    const validation = junitResultService.validateUploadFile(file);
    if (!validation.isValid) {
      setValidationError(validation.errors.join(', '));
      setSelectedFile(null);
      return;
    }
    
    setValidationError('');
    setSelectedFile(file);
    
    // 파일명에서 실행 이름 추출
    if (!executionName && file.name) {
      const name = file.name.replace(/\.(xml|XML)$/, '');
      setExecutionName(name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    onUpload({
      file: selectedFile,
      executionName: executionName.trim(),
      description: description.trim()
    });
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFile(null);
      setExecutionName('');
      setDescription('');
      setValidationError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>JUnit XML 파일 업로드</DialogTitle>
      <DialogContent>
        {/* 드래그 앤 드롭 영역 */}
        <Box
          sx={{
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: dragOver ? 'action.hover' : 'background.paper',
            mb: 3,
            transition: 'all 0.2s ease'
          }}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {selectedFile ? (
            <Box>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                크기: {junitResultService.formatFileSize(selectedFile.size)}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => setSelectedFile(null)}
              >
                다른 파일 선택
              </Button>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                JUnit XML 파일을 드래그하거나 클릭하여 선택
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                최대 100MB까지 업로드 가능
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                파일 선택
                <input
                  type="file"
                  hidden
                  accept=".xml"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </Button>
            </Box>
          )}
        </Box>

        {/* 검증 오류 표시 */}
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {/* 업로드 진행률 */}
        {loading && progress > 0 && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary">
              업로드 중... {progress}%
            </Typography>
          </Box>
        )}

        {/* 메타데이터 입력 */}
        {selectedFile && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              테스트 실행 정보
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input
                type="text"
                placeholder="실행 이름 (예: Sprint 24 Integration Tests)"
                value={executionName}
                onChange={(e) => setExecutionName(e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <textarea
                placeholder="설명 (선택사항)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          startIcon={loading ? <Schedule /> : <CloudUpload />}
        >
          {loading ? '업로드 중...' : '업로드'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}