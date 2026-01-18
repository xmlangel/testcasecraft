// src/components/RAG/ResumeAnalysisDialog.jsx
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
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * LLM 분석 재개/처음부터 시작 선택 다이얼로그
 * 기존 진행률이 있을 때 사용자에게 선택권 제공
 */
function ResumeAnalysisDialog({ open, onClose, onResume, onRestart, status }) {
  if (!status) {
    return null;
  }

  const { progress } = status;
  const analyzedChunks = progress?.processedChunks || progress?.analyzedChunks || 0;
  const totalChunks = progress?.totalChunks || 0;
  const percentage = totalChunks > 0 ? Math.round((analyzedChunks / totalChunks) * 100) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          기존 분석 진행 내역 발견
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          이 문서에 대한 LLM 분석이 이미 진행 중이거나 일시정지되어 있습니다.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            진행 상태: <strong>{status.status === 'paused' ? '일시정지' : '진행 중'}</strong>
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                분석 진행률
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {analyzedChunks} / {totalChunks} 청크 ({percentage}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          어떻게 하시겠습니까?
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Alert severity="success" icon={<PlayArrowIcon />}>
            <strong>이어서 하기:</strong> 기존 진행 내역을 유지하고 {analyzedChunks + 1}번 청크부터 계속 분석합니다.
          </Alert>
          <Alert severity="warning" icon={<RestartAltIcon />}>
            <strong>처음부터 시작:</strong> 기존 진행 내역을 모두 삭제하고 1번 청크부터 다시 분석합니다.
            (이미 분석된 {analyzedChunks}개 청크의 비용이 다시 발생합니다)
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          취소
        </Button>
        <Button
          onClick={onRestart}
          color="warning"
          variant="outlined"
          startIcon={<RestartAltIcon />}
        >
          처음부터 시작
        </Button>
        <Button
          onClick={onResume}
          color="primary"
          variant="contained"
          startIcon={<PlayArrowIcon />}
        >
          이어서 하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ResumeAnalysisDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onRestart: PropTypes.func.isRequired,
  status: PropTypes.shape({
    status: PropTypes.string,
    progress: PropTypes.shape({
      processedChunks: PropTypes.number,
      analyzedChunks: PropTypes.number,
      totalChunks: PropTypes.number,
    }),
  }),
};

export default ResumeAnalysisDialog;
