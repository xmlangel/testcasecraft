// src/components/TestResultStatisticsCard.jsx
// ICT-194 Phase 3: React 성능 최적화 적용

import React, { useMemo, useCallback } from 'react';
import { useTranslation } from '../context/I18nContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import CountUp from 'react-countup';
import {
  CheckCircle,
  Cancel,
  Block,
  PauseCircle
} from '@mui/icons-material';
import { RESULT_COLORS } from '../constants/statusColors';

/**
 * ICT-185: 테스트 결과 통계 카드 컴포넌트
 * Pass/Fail/NotRun/Blocked 통계를 수치로 표시
 * ICT-194 Phase 3: React 성능 최적화 적용
 */
function TestResultStatisticsCard({ statistics, loading = false, error = null }) {
  const { t } = useTranslation();
  const theme = useTheme();

  // ICT-194 Phase 3: 로딩 상태 컴포넌트 메모이제이션
  const loadingCard = useMemo(() => (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('testResult.statistics.title')}
        </Typography>
        <Typography>{t('testResult.statistics.loading')}</Typography>
      </CardContent>
    </Card>
  ), [t]);

  // ICT-194 Phase 3: 에러 상태 컴포넌트 메모이제이션
  const errorCard = useMemo(() => (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="error">
          {t('testResult.statistics.title')}
        </Typography>
        <Typography color="error">{t('testResult.statistics.error', { error })}</Typography>
      </CardContent>
    </Card>
  ), [error, t]);

  // ICT-194 Phase 3: 빈 상태 컴포넌트 메모이제이션
  const emptyCard = useMemo(() => (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('testResult.statistics.title')}
        </Typography>
        <Typography>{t('testResult.statistics.noData')}</Typography>
      </CardContent>
    </Card>
  ), [t]);

  // ICT-194 Phase 3: 통계 아이템 배열 메모이제이션 - statistics 변경 시만 재계산
  const statisticItems = useMemo(() => [
    {
      label: t('testResult.status.pass'),
      value: statistics?.passCount || 0,
      percentage: statistics?.passRate || 0,
      color: RESULT_COLORS.PASS,
      icon: <CheckCircle sx={{ color: RESULT_COLORS.PASS }} />
    },
    {
      label: t('testResult.status.fail'),
      value: statistics?.failCount || 0,
      percentage: statistics?.failRate || 0,
      color: RESULT_COLORS.FAIL,
      icon: <Cancel sx={{ color: RESULT_COLORS.FAIL }} />
    },
    {
      label: t('testResult.status.blocked'),
      value: statistics?.blockedCount || 0,
      percentage: statistics?.blockedRate || 0,
      color: RESULT_COLORS.BLOCKED,
      icon: <Block sx={{ color: RESULT_COLORS.BLOCKED }} />
    },
    {
      label: t('testResult.status.notRun'),
      value: statistics?.notRunCount || 0,
      percentage: statistics?.notRunRate || 0,
      color: RESULT_COLORS.NOTRUN,
      icon: <PauseCircle sx={{ color: RESULT_COLORS.NOTRUN }} />
    }
  ], [statistics, t]);

  if (loading) return loadingCard;
  if (error) return errorCard;
  if (!statistics) return emptyCard;

  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('testResult.statistics.title')}
        </Typography>

        {/* 주요 지표 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{
              textAlign: 'center',
              p: 1,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              borderRadius: 1
            }}>
              <Typography variant="body2" color="success.main" fontWeight="bold">
                {t('testResult.statistics.successRate')}
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                <CountUp end={statistics.passRate || 0} duration={1} suffix="%" />
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{
              textAlign: 'center',
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 1
            }}>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                {t('testResult.statistics.totalTests')}
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                <CountUp end={statistics.totalTests || 0} duration={1} />
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 상세 통계 */}
        <Grid container spacing={1}>
          {statisticItems.map((item) => (
            <Grid size={{ xs: 6 }} key={item.label}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                bgcolor: alpha(item.color, 0.1),
                borderRadius: 1
              }}>
                <Box sx={{ mr: 1 }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    <CountUp end={item.value} duration={1} /> ({Math.round(item.percentage)}%)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default TestResultStatisticsCard;