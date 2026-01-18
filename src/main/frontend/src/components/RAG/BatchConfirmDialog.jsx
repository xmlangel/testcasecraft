// src/components/RAG/BatchConfirmDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * 배치 확인 다이얼로그
 * 10개 청크 단위로 처리 후 사용자에게 계속 진행 여부를 묻습니다.
 */
function BatchConfirmDialog({
  open,
  onContinue,
  onPause,
  onCancel,
  status = null,
  loading = false,
}) {
  if (!status) {
    return null;
  }

  // Nested structure from FastAPI
  const progress = status.progress || {};
  const costInfo = status.actualCostSoFar || {};

  const totalChunks = progress.totalChunks || 0;
  const processedChunks = progress.processedChunks || 0;
  const progressPercentage = progress.percentage || 0;
  const totalTokensUsed = costInfo.totalTokensUsed || 0;
  const totalCostUsd = costInfo.totalCostUsd || 0;

  const remainingChunks = totalChunks - processedChunks;
  const currentCost = totalCostUsd;

  return (
    <Dialog open={open} onClose={onPause} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PauseCircleIcon color="primary" />
        배치 처리 완료 - 계속하시겠습니까?
      </DialogTitle>

      <DialogContent dividers>
        {/* 진행 상황 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              진행 상황
            </Typography>
            <Typography variant="body2" color="primary" fontWeight="bold">
              {progressPercentage?.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage || 0}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            {processedChunks} / {totalChunks} 청크 처리 완료
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 실제 사용 비용 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            <AttachMoneyIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
            실제 사용 비용
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • 사용된 토큰: <strong>{totalTokensUsed?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
              누적 비용: <strong>${currentCost.toFixed(4)}</strong>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 남은 작업 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            남은 작업
          </Typography>
          <Chip
            label={`${remainingChunks} 개 청크 남음`}
            color="secondary"
            size="small"
          />
        </Box>

        {/* 안내 메시지 */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            배치 단위 처리가 완료되었습니다. 계속 진행하면 다음 배치가 처리됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • <strong>계속</strong>: 다음 배치 처리
          </Typography>
          <Typography variant="body2">
            • <strong>일시정지</strong>: 나중에 재개 가능
          </Typography>
          <Typography variant="body2">
            • <strong>중단</strong>: 분석 완전 종료 (지금까지 결과는 보존)
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button
          onClick={onCancel}
          startIcon={<StopCircleIcon />}
          color="error"
          disabled={loading}
        >
          중단
        </Button>
        <Box>
          <Button
            onClick={onPause}
            startIcon={<PauseCircleIcon />}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            일시정지
          </Button>
          <Button
            onClick={onContinue}
            startIcon={<PlayCircleIcon />}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? '처리 중...' : '계속'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

BatchConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onContinue: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  status: PropTypes.shape({
    jobId: PropTypes.string,
    documentId: PropTypes.string,
    llmConfigId: PropTypes.string,
    status: PropTypes.string,
    progress: PropTypes.shape({
      totalChunks: PropTypes.number,
      processedChunks: PropTypes.number,
      percentage: PropTypes.number,
    }),
    actualCostSoFar: PropTypes.shape({
      totalTokensUsed: PropTypes.number,
      totalCostUsd: PropTypes.number,
    }),
    startedAt: PropTypes.string,
    pausedAt: PropTypes.string,
  }),
  loading: PropTypes.bool,
};

export default BatchConfirmDialog;
