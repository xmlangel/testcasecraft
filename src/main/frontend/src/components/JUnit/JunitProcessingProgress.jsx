// src/main/frontend/src/components/JUnit/JunitProcessingProgress.jsx

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    LinearProgress,
    Typography,
    Box,
    Card,
    CardContent,
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    CircularProgress
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon,
    PlayArrow as PlayIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext.jsx';

/**
 * JUnit 대용량 파일 처리 진행률 추적 컴포넌트
 */
const JunitProcessingProgress = ({ 
    testResultId, 
    isVisible, 
    onClose, 
    onComplete,
    initialData = null 
}) => {
    const { api } = useAppContext();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pollInterval, setPollInterval] = useState(null);

    // 진행률 단계 레이블
    const stepLabels = {
        0: '준비 중...',
        1: '파일 로딩',
        2: 'XML 파싱',
        3: '데이터 검증',
        4: '데이터 저장',
        5: '처리 완료'
    };

    // API 호출 함수
    const fetchProgress = async () => {
        try {
            const response = await api(`/api/junit-results/${testResultId}/processing-progress`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                setProgress(data);
                setError(null);

                // 완료되었거나 실패한 경우 폴링 중단
                if (data.isCompleted || data.isFailed) {
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        setPollInterval(null);
                    }

                    // 완료 콜백 호출
                    if (data.isCompleted && onComplete) {
                        setTimeout(() => {
                            onComplete(testResultId);
                        }, 1000);
                    }
                }
            } else {
                setError(data.error || '진행률을 가져올 수 없습니다.');
            }

        } catch (err) {
            console.error('진행률 조회 오류:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 초기 데이터 설정 및 폴링 시작
    useEffect(() => {
        if (!isVisible || !testResultId) return;

        // 초기 데이터가 있으면 설정
        if (initialData) {
            setProgress(initialData);
            setLoading(false);
        }

        // 즉시 한 번 조회
        fetchProgress();

        // 2초마다 폴링 시작
        const interval = setInterval(fetchProgress, 2000);
        setPollInterval(interval);

        // 정리 함수
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isVisible, testResultId]);

    // 다이얼로그 닫기
    const handleClose = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
        }
        onClose();
    };

    // 상태에 따른 아이콘 렌더링
    const renderStatusIcon = () => {
        if (loading) return <CircularProgress size={20} />;
        if (error) return <ErrorIcon color="error" />;
        if (progress?.isFailed) return <ErrorIcon color="error" />;
        if (progress?.isCompleted) return <CheckIcon color="success" />;
        return <PlayIcon color="primary" />;
    };

    // 상태에 따른 칩 색상
    const getChipColor = () => {
        if (error || progress?.isFailed) return 'error';
        if (progress?.isCompleted) return 'success';
        return 'primary';
    };

    // 예상 처리 시간 표시
    const renderEstimatedTime = () => {
        if (!progress || progress.isCompleted) return null;

        return (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    예상 처리 시간: {progress.estimatedProcessingTime || '계산 중...'}
                </Typography>
            </Box>
        );
    };

    // 파싱 세부 진행률 표시
    const renderParsingDetail = () => {
        if (!progress?.parsingProgress || progress.currentStep !== 2) return null;

        const { current, total } = progress.parsingProgress;
        const parsingPercentage = total > 0 ? (current / total) * 100 : 0;

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    테스트 스위트 파싱: {current}/{total}
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={parsingPercentage} 
                    sx={{ height: 4 }}
                />
            </Box>
        );
    };

    // 처리 단계 목록 렌더링
    const renderProcessSteps = () => {
        if (!progress) return null;

        const steps = [];
        for (let i = 1; i <= progress.totalSteps; i++) {
            const isCompleted = i < progress.currentStep;
            const isCurrent = i === progress.currentStep;
            const isPending = i > progress.currentStep;

            steps.push(
                <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemText
                        primary={
                            <Box display="flex" alignItems="center" gap={1}>
                                {isCompleted && <CheckIcon color="success" fontSize="small" />}
                                {isCurrent && <CircularProgress size={16} />}
                                {isPending && <ScheduleIcon color="disabled" fontSize="small" />}
                                <Typography 
                                    variant="body2" 
                                    color={isCompleted ? 'success.main' : isCurrent ? 'primary.main' : 'text.secondary'}
                                    fontWeight={isCurrent ? 'bold' : 'normal'}
                                >
                                    {stepLabels[i]}
                                </Typography>
                            </Box>
                        }
                    />
                </ListItem>
            );
        }

        return (
            <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent sx={{ py: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        처리 단계
                    </Typography>
                    <List dense disablePadding>
                        {steps}
                    </List>
                </CardContent>
            </Card>
        );
    };

    if (!isVisible) return null;

    return (
        <Dialog 
            open={isVisible} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={!progress?.isCompleted && !progress?.isFailed}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    {renderStatusIcon()}
                    대용량 파일 처리 진행 상황
                    <Chip 
                        label={progress?.isCompleted ? '완료' : progress?.isFailed ? '실패' : '처리 중'} 
                        color={getChipColor()}
                        size="small"
                    />
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {progress && (
                    <Box>
                        {/* 메인 진행률 바 */}
                        <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                    전체 진행률
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {Math.round(progress.progressPercentage)}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={progress.progressPercentage}
                                sx={{ height: 8, borderRadius: 4 }}
                                color={progress.isFailed ? 'error' : 'primary'}
                            />
                        </Box>

                        {/* 현재 상태 메시지 */}
                        <Typography variant="body1" gutterBottom>
                            <strong>상태:</strong> {progress.statusMessage}
                        </Typography>

                        {/* 파일 정보 */}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            파일 ID: {progress.testResultId}
                        </Typography>

                        {/* 마지막 업데이트 시간 */}
                        {progress.lastUpdated && (
                            <Typography variant="caption" color="text.secondary">
                                마지막 업데이트: {formatDistanceToNow(new Date(progress.lastUpdated), { 
                                    addSuffix: true, 
                                    locale: ko 
                                })}
                            </Typography>
                        )}

                        {/* 파싱 세부 진행률 */}
                        {renderParsingDetail()}

                        {/* 예상 시간 */}
                        {renderEstimatedTime()}

                        {/* 처리 단계 */}
                        {renderProcessSteps()}

                        {/* 완료 메시지 */}
                        {progress.isCompleted && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                파일 처리가 성공적으로 완료되었습니다. 
                                테스트 결과를 확인할 수 있습니다.
                            </Alert>
                        )}

                        {/* 실패 메시지 */}
                        {progress.isFailed && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                파일 처리 중 오류가 발생했습니다. 
                                관리자에게 문의하시기 바랍니다.
                            </Alert>
                        )}
                    </Box>
                )}

                {loading && !progress && (
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>진행률 정보를 불러오는 중...</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button 
                    onClick={handleClose}
                    disabled={!progress?.isCompleted && !progress?.isFailed && !error}
                >
                    {progress?.isCompleted || progress?.isFailed || error ? '닫기' : '백그라운드에서 계속'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JunitProcessingProgress;