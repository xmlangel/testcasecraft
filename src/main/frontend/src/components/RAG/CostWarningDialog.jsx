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
import { useTranslation } from '../../context/I18nContext.jsx';

/**
 * 비용 경고 다이얼로그
 * LLM 분석 시작 전 예상 비용을 표시하고 사용자 확인을 받습니다.
 */
function CostWarningDialog({ open, onClose, onConfirm, costEstimate = null, loading = false, selectedConfigName = '' }) {
  if (!costEstimate) {
    return null;
  }

  const { t } = useTranslation();
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
  const chunkCountLabel = t(
    'rag.analysis.costWarning.chunkCount',
    '총 {count} 개 청크',
    { count: totalChunks?.toLocaleString() || '0' }
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AttachMoneyIcon color={isHighCost ? 'warning' : 'primary'} />
        {t('rag.analysis.costWarning.title', 'LLM 분석 비용 예상')}
      </DialogTitle>

      <DialogContent dividers>
        {/* 경고 메시지 */}
        {isHighCost && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
            {t(
              'rag.analysis.costWarning.highCostAlert',
              '이 작업은 비용이 많이 발생할 수 있습니다. 계속하시겠습니까?'
            )}
          </Alert>
        )}

        {/* 모델 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('rag.analysis.costWarning.modelSection', 'LLM 모델')}
          </Typography>
          <Typography variant="body1">
            {selectedConfigName ? (
              <>
                <strong>{selectedConfigName}</strong>
                <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                  ({modelPricing?.provider} / {modelPricing?.model})
                </Typography>
              </>
            ) : (
              <>
                <strong>{modelPricing?.provider}</strong> / {modelPricing?.model}
              </>
            )}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 청크 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('rag.analysis.costWarning.targetSection', '분석 대상')}
          </Typography>
          <Chip label={chunkCountLabel} color="primary" size="small" />
        </Box>

        {/* 토큰 사용량 예상 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('rag.analysis.costWarning.tokenUsageSection', '예상 토큰 사용량')}
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • {t('rag.analysis.costWarning.inputTokens', '입력 토큰')}:{' '}
              <strong>{estimatedInputTokens?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2">
              • {t('rag.analysis.costWarning.outputTokens', '출력 토큰')}:{' '}
              <strong>{estimatedOutputTokens?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="primary">
              • {t('rag.analysis.costWarning.totalTokens', '총 토큰')}:{' '}
              <strong>{estimatedTotalTokens?.toLocaleString()}</strong>
            </Typography>
          </Box>
        </Box>

        {/* 비용 상세 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('rag.analysis.costWarning.costSection', '예상 비용 (USD)')}
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • {t('rag.analysis.costWarning.inputCost', '입력 비용')}:{' '}
              ${costBreakdown?.inputCostUsd?.toFixed(4) || '0.0000'}
            </Typography>
            <Typography variant="body2">
              • {t('rag.analysis.costWarning.outputCost', '출력 비용')}:{' '}
              ${costBreakdown?.outputCostUsd?.toFixed(4) || '0.0000'}
            </Typography>
            <Typography variant="h6" color={isHighCost ? 'warning.main' : 'primary.main'} sx={{ mt: 1 }}>
              {t('rag.analysis.costWarning.totalCost', '총 예상 비용')}:{' '}
              <strong>${totalCost.toFixed(2)}</strong>
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {t(
                'rag.analysis.costWarning.costPerChunk',
                '(청크당 약 ${cost})',
                { cost: costPerChunkUsd?.toFixed(4) || '0.0000' }
              )}
            </Typography>
          </Box>
        </Box>

        {/* 가격 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('rag.analysis.costWarning.priceSection', '모델 가격표 (1K 토큰 기준)')}
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              • {t('rag.analysis.costWarning.priceInput', '입력')}:{' '}
              ${modelPricing?.inputPricePer1k?.toFixed(4) || '0.0000'}
            </Typography>
            <Typography variant="body2">
              • {t('rag.analysis.costWarning.priceOutput', '출력')}:{' '}
              ${modelPricing?.outputPricePer1k?.toFixed(4) || '0.0000'}
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
          {t('common.buttons.cancel', '취소')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isHighCost ? 'warning' : 'primary'}
          disabled={loading}
        >
          {loading
            ? t('rag.analysis.costWarning.starting', '시작 중...')
            : t('rag.analysis.costWarning.confirm', '확인 및 분석 시작')}
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
  selectedConfigName: PropTypes.string,
};

export default CostWarningDialog;
