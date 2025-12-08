// src/components/TestResultBarChart.jsx

import React from 'react';
import { useTranslation } from '../context/I18nContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  FormControl,
  FormControlLabel,
  Switch,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Info } from '@mui/icons-material';
import { RESULT_COLORS } from '../constants/statusColors';

/**
 * ICT-187: 테스트 결과 바차트 컴포넌트
 * 테스트 플랜별 또는 실행자별 비교 통계
 */
function TestResultBarChart({
  data,
  loading = false,
  title = "테스트 결과 비교",
  showPercentage = false,
  onTogglePercentage = null
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  // 기존 Dashboard.jsx와 동일한 색상 사용
  const CHART_COLORS_MAP = {
    passCount: RESULT_COLORS.PASS,
    failCount: RESULT_COLORS.FAIL,
    blockedCount: RESULT_COLORS.BLOCKED,
    notRunCount: RESULT_COLORS.NOTRUN
  };

  // 데이터 검증 - 맨 먼저 체크
  if (!data || !Array.isArray(data) || data.length === 0 || data.every(item => (item.totalTests || 0) === 0)) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('testResult.chart.noCompareData')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 로딩 상태 처리
  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('testResult.chart.loadingData')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 퍼센트 모드용 데이터 변환
  const processedData = showPercentage
    ? data.map(item => {
      const total = (item.passCount || 0) + (item.failCount || 0) +
        (item.blockedCount || 0) + (item.notRunCount || 0);

      if (total === 0) return { ...item, passCount: 0, failCount: 0, blockedCount: 0, notRunCount: 0 };

      return {
        ...item,
        passCount: ((item.passCount || 0) / total * 100).toFixed(1),
        failCount: ((item.failCount || 0) / total * 100).toFixed(1),
        blockedCount: ((item.blockedCount || 0) / total * 100).toFixed(1),
        notRunCount: ((item.notRunCount || 0) / total * 100).toFixed(1)
      };
    })
    : data;

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const originalItem = data.find(d => d.name === label || d.label === label);

      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
            minWidth: 200
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
            {label}
          </Typography>
          {payload.map((entry) => {
            const originalValue = originalItem ? originalItem[entry.dataKey] || 0 : 0;
            return (
              <Box key={entry.dataKey} sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: entry.color }}>
                  {getDataKeyLabel(entry.dataKey)}: {' '}
                  {showPercentage
                    ? `${entry.value}% (${originalValue}건)`
                    : `${entry.value}건`
                  }
                </Typography>
              </Box>
            );
          })}
          {originalItem && (
            <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                총 {(originalItem.passCount + originalItem.failCount +
                  originalItem.blockedCount + originalItem.notRunCount)}건
              </Typography>
            </Box>
          )}
        </Box>
      );
    }
    return null;
  };

  // 데이터 키 레이블 변환
  const getDataKeyLabel = (dataKey) => {
    const labels = {
      passCount: t('testResult.status.pass'),
      failCount: t('testResult.status.fail'),
      blockedCount: t('testResult.status.blocked'),
      notRunCount: t('testResult.status.notRun')
    };
    return labels[dataKey] || dataKey;
  };

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent>
        {/* 제목 및 옵션 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            <Tooltip title={t('testResult.chart.tooltip')} arrow>
              <Info fontSize="small" color="action" />
            </Tooltip>
          </Box>

          {onTogglePercentage && (
            <FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPercentage}
                    onChange={(e) => onTogglePercentage(e.target.checked)}
                    size="small"
                  />
                }
                label={t('testResult.chart.percentageView')}
                labelPlacement="start"
              />
            </FormControl>
          )}
        </Box>

        {/* 차트 영역 */}
        <Box sx={{ width: '100%', mt: 1, minWidth: 300 }}>
          <ResponsiveContainer width="100%" aspect={2}>
            <BarChart
              data={processedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                label={{
                  value: showPercentage ? t('testResult.chart.yAxisPercent') : t('testResult.chart.yAxisCount'),
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.secondary
                }}
              />
              <ReTooltip content={<CustomTooltip />} />
              <Legend />

              {/* 스택된 바 차트 */}
              <Bar
                dataKey="passCount"
                stackId="a"
                fill={CHART_COLORS_MAP.passCount}
                name={t('testResult.status.pass')}
              />
              <Bar
                dataKey="failCount"
                stackId="a"
                fill={CHART_COLORS_MAP.failCount}
                name={t('testResult.status.fail')}
              />
              <Bar
                dataKey="blockedCount"
                stackId="a"
                fill={CHART_COLORS_MAP.blockedCount}
                name={t('testResult.status.blocked')}
              />
              <Bar
                dataKey="notRunCount"
                stackId="a"
                fill={CHART_COLORS_MAP.notRunCount}
                name={t('testResult.status.notRun')}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 요약 정보 */}
        <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {t('testResult.chart.compareItems', { count: data.length })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TestResultBarChart;