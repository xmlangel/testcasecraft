// src/components/RateLimitDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppContext } from '../context/AppContext';

const RateLimitDialog = () => {
  const { rateLimitError, retryAfter, clearRateLimitError } = useAppContext();
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (rateLimitError && retryAfter > 0) {
      setCountdown(retryAfter);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // 카운트다운 종료 시 자동으로 다이얼로그 닫기
            clearRateLimitError();
            // 페이지 자동 새로고침 (선택적)
            // window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [rateLimitError, retryAfter, clearRateLimitError]);

  const progress = ((retryAfter - countdown) / retryAfter) * 100;

  const handleClose = () => {
    clearRateLimitError();
  };

  const handleRetryNow = () => {
    clearRateLimitError();
    window.location.reload();
  };

  return (
    <Dialog
      open={!!rateLimitError}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderTop: '4px solid #d32f2f',
            boxShadow: '0 8px 32px rgba(211, 47, 47, 0.3)',
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: '#fff3f3',
          color: '#d32f2f',
          fontWeight: 'bold',
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 48,
            color: '#d32f2f',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        />
        <Box>
          <Typography variant="h6" component="div" fontWeight="bold">
            🚨 요청 제한 초과 / Request Limit Exceeded
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
            {rateLimitError?.message || '동일 IP에서 1초에 60번 이상 요청이 발생했습니다.'}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
            Multiple requests were detected from the same IP within one second.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            1초 후 다시 시도해주세요 / Please try again in 1 second.
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: '#fafafa',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            border: '2px dashed #ff9800',
          }}
        >
          <Typography variant="h2" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
            {countdown}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            초 후 자동으로 재시도 가능합니다 / Auto retry will be available after the countdown.
          </Typography>

          <Box sx={{ mt: 2, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#ffe0b2',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#ff9800',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% 완료 / complete
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#fff8e1',
            borderRadius: 1,
            border: '1px solid #ffecb3',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            💡 팁 / Tips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 페이지를 너무 자주 새로고침하지 마세요 / Please avoid refreshing too frequently.
            <br />
            • 잠시 기다렸다가 다시 시도해주세요 / Wait a moment before trying again.
            <br />
            • 문제가 계속되면 관리자에게 문의하세요 / Contact your administrator if the issue persists.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          닫기 Close
        </Button>
        <Button
          onClick={handleRetryNow}
          variant="contained"
          color="warning"
          disabled={countdown > 0}
          sx={{
            fontWeight: 'bold',
            '&:disabled': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          {countdown > 0 ? `재시도 (${countdown}초) / Retry (${countdown}s)` : '지금 재시도 / Retry now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RateLimitDialog;
