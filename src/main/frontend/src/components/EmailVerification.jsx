// src/main/frontend/src/components/EmailVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [verificationResult, setVerificationResult] = useState(null);

    useEffect(() => {
        if (!token) {
            setVerificationResult({
                success: false,
                message: '유효하지 않은 인증 링크입니다.',
                error: 'INVALID',
            });
            setLoading(false);
            return;
        }

        // 토큰 검증 API 호출
        const verifyToken = async () => {
            try {
                const response = await axios.get(`/api/email-verification/verify?token=${token}`);
                setVerificationResult(response.data);
            } catch (error) {
                console.error('Email verification error:', error);
                setVerificationResult({
                    success: false,
                    message: '인증 처리 중 오류가 발생했습니다.',
                    error: 'ERROR',
                });
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleGoToLogin = () => {
        navigate('/');
    };

    const handleResend = async () => {
        // 재발송 로직 - userId가 필요하므로 여기서는 안내 메시지만 표시
        alert('재발송 기능은 로그인 후 프로필 설정에서 이용 가능합니다.');
    };

    // 로딩 중
    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 3 }}>
                        이메일 인증 처리 중...
                    </Typography>
                </Paper>
            </Container>
        );
    }

    // 결과 아이콘 및 색상 결정
    const getResultConfig = () => {
        if (verificationResult.success) {
            return {
                icon: <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />,
                severity: 'success',
                title: '인증 완료!',
            };
        }

        switch (verificationResult.error) {
            case 'EXPIRED':
                return {
                    icon: <WarningIcon sx={{ fontSize: 80, color: 'warning.main' }} />,
                    severity: 'warning',
                    title: '링크 만료',
                };
            case 'USED':
                return {
                    icon: <InfoIcon sx={{ fontSize: 80, color: 'info.main' }} />,
                    severity: 'info',
                    title: '이미 사용됨',
                };
            case 'INVALID':
            case 'ERROR':
            default:
                return {
                    icon: <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />,
                    severity: 'error',
                    title: '인증 실패',
                };
        }
    };

    const config = getResultConfig();

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Card elevation={4}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    {/* 아이콘 */}
                    <Box sx={{ mb: 3 }}>
                        {config.icon}
                    </Box>

                    {/* 제목 */}
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        {config.title}
                    </Typography>

                    {/* 메시지 */}
                    <Alert severity={config.severity} sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
                        <Typography variant="body1">
                            {verificationResult.message}
                        </Typography>
                    </Alert>

                    {/* 액션 버튼 */}
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {verificationResult.success && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleGoToLogin}
                            >
                                로그인 페이지로 이동
                            </Button>
                        )}

                        {verificationResult.error === 'EXPIRED' && (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleResend}
                                >
                                    인증 이메일 재발송
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    onClick={handleGoToLogin}
                                >
                                    로그인 페이지로 이동
                                </Button>
                            </>
                        )}

                        {(verificationResult.error === 'USED' || verificationResult.error === 'INVALID' || verificationResult.error === 'ERROR') && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleGoToLogin}
                            >
                                로그인 페이지로 이동
                            </Button>
                        )}
                    </Box>

                    {/* 추가 안내 */}
                    {verificationResult.success && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                            이메일 인증이 완료되었습니다. 이제 모든 기능을 사용하실 수 있습니다.
                        </Typography>
                    )}

                    {verificationResult.error === 'EXPIRED' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                            인증 링크는 24시간 동안만 유효합니다. 새로운 인증 이메일을 요청해주세요.
                        </Typography>
                    )}

                    {verificationResult.error === 'USED' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                            이 계정은 이미 인증되었습니다. 로그인하여 계속 진행하세요.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default EmailVerification;
