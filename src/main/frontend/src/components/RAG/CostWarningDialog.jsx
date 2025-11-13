// src/components/RAG/CostWarningDialog.jsx
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
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * 비용 경고 다이얼로그
 * LLM 분석 시작 전 예상 비용을 표시하고 사용자 확인을 받습니다.
 */
function CostWarningDialog({ open, onClose, onConfirm, costEstimate, loading }) {
  if (!costEstimate) {
    return null;
  }

  const {
    totalChunks,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedTotalTokens,
    costBreakdown,
    costPerChunkUsd,
    modelPricing,
    warnings = [],
  } = costEstimate;

  const totalCost = costBreakdown?.totalCostUsd || 0;
  const isHighCost = totalCost > 1.0; // $1 이상이면 고비용으로 간주

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AttachMoneyIcon color={isHighCost ? 'warning' : 'primary'} />
        LLM 분석 비용 예상
      </DialogTitle>

      <DialogContent dividers>
        {/* 경고 메시지 */}
        {isHighCost && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
            이 작업은 비용이 많이 발생할 수 있습니다. 계속하시겠습니까?
          </Alert>
        )}

        {/* 모델 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            LLM 모델
          </Typography>
          <Typography variant="body1">
            <strong>{modelPricing?.provider}</strong> / {modelPricing?.model}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 청크 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            분석 대상
          </Typography>
          <Chip label={`총 ${totalChunks?.toLocaleString()} 개 청크`} color="primary" size="small" />
        </Box>

        {/* 토큰 사용량 예상 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            예상 토큰 사용량
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • 입력 토큰: <strong>{estimatedInputTokens?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2">
              • 출력 토큰: <strong>{estimatedOutputTokens?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="primary">
              • 총 토큰: <strong>{estimatedTotalTokens?.toLocaleString()}</strong>
            </Typography>
          </Box>
        </Box>

        {/* 비용 상세 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            예상 비용 (USD)
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • 입력 비용: ${costBreakdown?.inputCostUsd?.toFixed(4) || '0.0000'}
            </Typography>
            <Typography variant="body2">
              • 출력 비용: ${costBreakdown?.outputCostUsd?.toFixed(4) || '0.0000'}
            </Typography>
            <Typography variant="h6" color={isHighCost ? 'warning.main' : 'primary.main'} sx={{ mt: 1 }}>
              총 예상 비용: <strong>${totalCost.toFixed(2)}</strong>
            </Typography>
            <Typography variant="caption" color="textSecondary">
              (청크당 약 ${costPerChunkUsd?.toFixed(4) || '0.0000'})
            </Typography>
          </Box>
        </Box>

        {/* 가격 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            모델 가격표 (1K 토큰 기준)
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • 입력: ${modelPricing?.inputPricePer1k?.toFixed(4) || '0.0000'}
            </Typography>
            <Typography variant="body2">
              • 출력: ${modelPricing?.outputPricePer1k?.toFixed(4) || '0.0000'}
            </Typography>
          </Box>
        </Box>

        {/* 추가 경고 메시지 */}
        {warnings.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {warnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                {warning}
              </Typography>
            ))}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isHighCost ? 'warning' : 'primary'}
          disabled={loading}
        >
          {loading ? '시작 중...' : '확인 및 분석 시작'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CostWarningDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  costEstimate: PropTypes.shape({
    documentId: PropTypes.string,
    totalChunks: PropTypes.number,
    estimatedInputTokens: PropTypes.number,
    estimatedOutputTokens: PropTypes.number,
    estimatedTotalTokens: PropTypes.number,
    costBreakdown: PropTypes.shape({
      inputCostUsd: PropTypes.number,
      outputCostUsd: PropTypes.number,
      totalCostUsd: PropTypes.number,
    }),
    costPerChunkUsd: PropTypes.number,
    modelPricing: PropTypes.shape({
      provider: PropTypes.string,
      model: PropTypes.string,
      inputPricePer1k: PropTypes.number,
      outputPricePer1k: PropTypes.number,
    }),
    warnings: PropTypes.arrayOf(PropTypes.string),
  }),
  loading: PropTypes.bool,
};

CostWarningDialog.defaultProps = {
  costEstimate: null,
  loading: false,
};

export default CostWarningDialog;
