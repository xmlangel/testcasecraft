// src/components/JUnit/JunitVersionManager.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
    Grid,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Paper,
    LinearProgress,
    Tab,
    Tabs,
} from '@mui/material';
import {
    History as HistoryIcon,
    Restore as RestoreIcon,
    Compare as CompareIcon,
    Backup as BackupIcon,
    Storage as StorageIcon,
    Timeline as TimelineIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    CloudUpload as UploadIcon,
    Settings as SettingsIcon,
    Refresh as RefreshIcon,
    Launch as LaunchIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import junitVersionService from '../../services/junitVersionService';

/**
 * ICT-204: JUnit 파일 버전 관리 컴포넌트
 */
const JunitVersionManager = ({ testResultId, onClose, open = false }) => {
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [versionHistory, setVersionHistory] = useState(null);
    const [storageStats, setStorageStats] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // 버전 비교 상태
    const [compareDialogOpen, setCompareDialogOpen] = useState(false);
    const [compareVersion1, setCompareVersion1] = useState('');
    const [compareVersion2, setCompareVersion2] = useState('');
    const [comparisonResult, setComparisonResult] = useState(null);
    
    // 복원 상태
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [restorePath, setRestorePath] = useState('');
    
    // 백업 상태
    const [backupDialogOpen, setBackupDialogOpen] = useState(false);
    const [backupVersion, setBackupVersion] = useState(-1);

    // 데이터 로드
    useEffect(() => {
        if (open && testResultId) {
            loadData();
        }
    }, [open, testResultId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [historyResponse, statsResponse] = await Promise.all([
                junitVersionService.getVersionHistory(testResultId),
                junitVersionService.getStorageStatistics().catch(() => null) // 관리자 권한이 없을 수 있음
            ]);
            
            setVersionHistory(historyResponse.history);
            if (statsResponse) {
                setStorageStats(statsResponse.statistics);
            }
            
        } catch (err) {
            console.error('버전 관리 데이터 로드 실패:', err);
            setError(junitVersionService.handleError(err));
        } finally {
            setLoading(false);
        }
    };

    // 버전 생성
    const handleCreateVersion = async (description = '') => {
        if (!testResultId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // 실제로는 현재 테스트 결과의 원본 파일 경로를 가져와야 함
            const originalPath = `/uploads/junit/${testResultId}/original.xml`;
            
            await junitVersionService.createVersion(testResultId, originalPath, description);
            
            setSuccess('새 버전이 생성되었습니다.');
            await loadData();
            
        } catch (err) {
            console.error('버전 생성 실패:', err);
            setError(junitVersionService.handleError(err));
        } finally {
            setLoading(false);
        }
    };

    // 버전 복원
    const handleRestoreVersion = async () => {
        if (!selectedVersion || !restorePath.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const result = await junitVersionService.restoreVersion(
                testResultId, 
                selectedVersion.versionNumber, 
                restorePath
            );
            
            if (result.restoreResult.checksumValid) {
                setSuccess(`버전 ${selectedVersion.versionNumber}이 성공적으로 복원되었습니다.`);
            } else {
                setSuccess(`버전 ${selectedVersion.versionNumber}이 복원되었지만 체크섬 검증에 실패했습니다.`);
            }
            
            setRestoreDialogOpen(false);
            setSelectedVersion(null);
            setRestorePath('');
            
        } catch (err) {
            console.error('버전 복원 실패:', err);
            setError(junitVersionService.handleError(err));
        } finally {
            setLoading(false);
        }
    };

    // 버전 비교
    const handleCompareVersions = async () => {
        if (!compareVersion1 || !compareVersion2) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const result = await junitVersionService.compareVersions(
                testResultId, 
                parseInt(compareVersion1), 
                parseInt(compareVersion2)
            );
            
            setComparisonResult(result.comparison);
            
        } catch (err) {
            console.error('버전 비교 실패:', err);
            setError(junitVersionService.handleError(err));
        } finally {
            setLoading(false);
        }
    };

    // 백업 생성
    const handleCreateBackup = async () => {
        setLoading(true);
        setError(null);
        
        try {
            await junitVersionService.createBackup(testResultId, backupVersion);
            
            setSuccess('백업이 생성되었습니다.');
            setBackupDialogOpen(false);
            await loadData();
            
        } catch (err) {
            console.error('백업 생성 실패:', err);
            setError(junitVersionService.handleError(err));
        } finally {
            setLoading(false);
        }
    };

    // 탭 패널 컴포넌트
    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`version-tabpanel-${index}`}
            aria-labelledby={`version-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            slotProps={{
                paper: { sx: { minHeight: '80vh' } }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon />
                    <Typography variant="h6">버전 관리</Typography>
                    <Typography variant="caption" color="text.secondary">
                        테스트 ID: {testResultId}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab label="버전 히스토리" />
                        <Tab label="스토리지 통계" />
                        <Tab label="백업 관리" />
                    </Tabs>
                </Box>

                {/* 버전 히스토리 탭 */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => handleCreateVersion('수동 버전 생성')}
                            disabled={loading}
                        >
                            새 버전 생성
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CompareIcon />}
                            onClick={() => setCompareDialogOpen(true)}
                            disabled={!versionHistory || versionHistory.versions.length < 2}
                        >
                            버전 비교
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

                    {versionHistory && versionHistory.versions.length > 0 ? (
                        <List>
                            {versionHistory.versions.map((version) => {
                                const statusInfo = junitVersionService.getVersionStatusInfo(version);
                                
                                return (
                                    <ListItem key={version.versionId} divider>
                                        <ListItemIcon>
                                            <TimelineIcon color={statusInfo.color} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        버전 {version.versionNumber}
                                                    </Typography>
                                                    <Chip 
                                                        label={statusInfo.label}
                                                        size="small"
                                                        color={statusInfo.color}
                                                        variant="outlined"
                                                    />
                                                    {version.compressed && (
                                                        <Chip 
                                                            label="압축됨" 
                                                            size="small" 
                                                            color="info"
                                                            variant="outlined" 
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {version.description || '설명 없음'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true, locale: ko })} • 
                                                        {version.createdBy} • 
                                                        {junitVersionService.formatFileSize(version.fileSize)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="복원">
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedVersion(version);
                                                        setRestorePath(`/restore/${testResultId}_v${version.versionNumber}.xml`);
                                                        setRestoreDialogOpen(true);
                                                    }}
                                                >
                                                    <RestoreIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })}
                        </List>
                    ) : (
                        <Alert severity="info">
                            아직 생성된 버전이 없습니다. 새 버전을 생성해보세요.
                        </Alert>
                    )}
                </TabPanel>

                {/* 스토리지 통계 탭 */}
                <TabPanel value={tabValue} index={1}>
                    {storageStats ? (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            버전 파일
                                        </Typography>
                                        <Typography variant="h4" color="primary">
                                            {storageStats.versionFileCount}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {junitVersionService.formatFileSize(storageStats.versionStorageSize)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            백업 파일
                                        </Typography>
                                        <Typography variant="h4" color="secondary">
                                            {storageStats.backupFileCount}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {junitVersionService.formatFileSize(storageStats.backupStorageSize)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            설정 상태
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Chip
                                                icon={storageStats.compressionEnabled ? <CheckIcon /> : <ErrorIcon />}
                                                label={`압축: ${storageStats.compressionEnabled ? '활성화' : '비활성화'}`}
                                                color={storageStats.compressionEnabled ? 'success' : 'error'}
                                                variant="outlined"
                                            />
                                            <Chip
                                                icon={storageStats.autoBackupEnabled ? <CheckIcon /> : <ErrorIcon />}
                                                label={`자동 백업: ${storageStats.autoBackupEnabled ? '활성화' : '비활성화'}`}
                                                color={storageStats.autoBackupEnabled ? 'success' : 'warning'}
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="h5" sx={{ mt: 2 }}>
                                            총 사용량: {junitVersionService.formatFileSize(storageStats.totalStorageSize)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            {/* 최적화 제안 */}
                            {(() => {
                                const suggestions = junitVersionService.getOptimizationSuggestions(storageStats);
                                return suggestions.length > 0 && (
                                    <Grid size={{ xs: 12 }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    최적화 제안
                                                </Typography>
                                                {suggestions.map((suggestion, index) => (
                                                    <Alert 
                                                        key={index}
                                                        severity={suggestion.priority === 'high' ? 'warning' : 'info'}
                                                        sx={{ mb: 1 }}
                                                    >
                                                        <Typography variant="subtitle2">
                                                            {suggestion.title}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {suggestion.description}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {suggestion.action}
                                                        </Typography>
                                                    </Alert>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })()}
                        </Grid>
                    ) : (
                        <Alert severity="warning">
                            스토리지 통계를 조회할 권한이 없습니다. (관리자 권한 필요)
                        </Alert>
                    )}
                </TabPanel>

                {/* 백업 관리 탭 */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<BackupIcon />}
                            onClick={() => setBackupDialogOpen(true)}
                            disabled={loading}
                        >
                            백업 생성
                        </Button>
                    </Box>

                    {versionHistory && (() => {
                        const backupRecommendation = junitVersionService.shouldRecommendBackup(versionHistory);
                        return backupRecommendation.recommend && (
                            <Alert 
                                severity={backupRecommendation.urgency === 'high' ? 'warning' : 'info'}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="subtitle2">백업 권장</Typography>
                                <Typography variant="body2">{backupRecommendation.reason}</Typography>
                            </Alert>
                        );
                    })()}

                    <Typography variant="body2" color="text.secondary">
                        백업은 버전과 별도로 관리되며, 시스템 장애 시 데이터 복구에 사용됩니다.
                        정기적인 백업을 통해 데이터 손실을 방지할 수 있습니다.
                    </Typography>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
            {/* 버전 비교 다이얼로그 */}
            <Dialog open={compareDialogOpen} onClose={() => setCompareDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>버전 비교</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>첫 번째 버전</InputLabel>
                                <Select
                                    value={compareVersion1}
                                    onChange={(e) => setCompareVersion1(e.target.value)}
                                >
                                    {versionHistory?.versions.map((v) => (
                                        <MenuItem key={v.versionId} value={v.versionNumber}>
                                            버전 {v.versionNumber}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>두 번째 버전</InputLabel>
                                <Select
                                    value={compareVersion2}
                                    onChange={(e) => setCompareVersion2(e.target.value)}
                                >
                                    {versionHistory?.versions.map((v) => (
                                        <MenuItem key={v.versionId} value={v.versionNumber}>
                                            버전 {v.versionNumber}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {comparisonResult && (
                        <Paper sx={{ mt: 3, p: 2 }}>
                            <Typography variant="h6" gutterBottom>비교 결과</Typography>
                            <Typography variant="body2" sx={{
                                marginBottom: "16px"
                            }}>
                                {comparisonResult.summary}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption">크기 차이:</Typography>
                                    <Typography variant="body2">
                                        {comparisonResult.sizeDifference > 0 ? '+' : ''}
                                        {junitVersionService.formatFileSize(Math.abs(comparisonResult.sizeDifference))}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption">시간 차이:</Typography>
                                    <Typography variant="body2">
                                        {junitVersionService.formatTimeDifference(comparisonResult.timeDifference)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCompareDialogOpen(false)}>취소</Button>
                    <Button 
                        onClick={handleCompareVersions} 
                        variant="contained"
                        disabled={!compareVersion1 || !compareVersion2 || loading}
                    >
                        비교
                    </Button>
                </DialogActions>
            </Dialog>
            {/* 버전 복원 다이얼로그 */}
            <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>버전 복원</DialogTitle>
                <DialogContent>
                    {selectedVersion && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                버전 {selectedVersion.versionNumber}을 복원하시겠습니까?
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                                marginBottom: "16px"
                            }}>
                                생성일: {new Date(selectedVersion.createdAt).toLocaleString('ko-KR')}
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="복원 경로"
                                fullWidth
                                variant="outlined"
                                value={restorePath}
                                onChange={(e) => setRestorePath(e.target.value)}
                                placeholder="/path/to/restore/file.xml"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestoreDialogOpen(false)}>취소</Button>
                    <Button 
                        onClick={handleRestoreVersion} 
                        variant="contained"
                        disabled={!restorePath.trim() || loading}
                    >
                        복원
                    </Button>
                </DialogActions>
            </Dialog>
            {/* 백업 생성 다이얼로그 */}
            <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>백업 생성</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>백업할 버전</InputLabel>
                        <Select
                            value={backupVersion}
                            onChange={(e) => setBackupVersion(e.target.value)}
                        >
                            <MenuItem value={-1}>최신 버전</MenuItem>
                            {versionHistory?.versions.map((v) => (
                                <MenuItem key={v.versionId} value={v.versionNumber}>
                                    버전 {v.versionNumber}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBackupDialogOpen(false)}>취소</Button>
                    <Button 
                        onClick={handleCreateBackup} 
                        variant="contained"
                        disabled={loading}
                    >
                        백업 생성
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default JunitVersionManager;