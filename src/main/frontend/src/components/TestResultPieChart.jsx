// src/components/TestResultPieChart.jsx

import React from 'react';
import { useTranslation } from '../context/I18nContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { Circle } from '@mui/icons-material';
import { RESULT_COLORS } from '../constants/statusColors';

/**
 * ICT-187: 테스트 결과 파이차트 컴포넌트
 * Pass/Fail/NotRun/Blocked 분포를 시각화
 */
function TestResultPieChart({ statistics, loading = false }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const RESULT_LABELS = {
    PASS: t('testResult.status.pass'),
    FAIL: t('testResult.status.fail'),
    BLOCKED: t('testResult.status.blocked'),
    NOT_RUN: t('testResult.status.notRun'),
    NOTRUN: t('testResult.status.notRun')
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <Card sx={{ minHeight: 350 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('testResult.pieChart.title')}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('testResult.pieChart.loading')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음 상태 처리
  if (!statistics || statistics.totalTests === 0) {
    return (
      <Card sx={{ minHeight: 350 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {t('testResult.pieChart.title')}
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('testResult.pieChart.noData')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 파이차트 데이터 준비
  const pieData = [
    {
      name: 'PASS',
      label: RESULT_LABELS.PASS,
      value: statistics.passCount || 0,
      percentage: statistics.passRate || 0,
      color: RESULT_COLORS.PASS
    },
    {
      name: 'FAIL',
      label: RESULT_LABELS.FAIL,
      value: statistics.failCount || 0,
      percentage: statistics.failRate || 0,
      color: RESULT_COLORS.FAIL
    },
    {
      name: 'BLOCKED',
      label: RESULT_LABELS.BLOCKED,
      value: statistics.blockedCount || 0,
      percentage: statistics.blockedRate || 0,
      color: RESULT_COLORS.BLOCKED
    },
    {
      name: 'NOT_RUN',
      label: RESULT_LABELS.NOT_RUN,
      value: statistics.notRunCount || 0,
      percentage: statistics.notRunRate || 0,
      color: RESULT_COLORS.NOTRUN
    }
  ].filter(item => item.value > 0); // 값이 0인 항목 제외

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ color: data.color, mb: 0.5 }}>
            {data.label}
          </Typography>
          <Typography variant="body2" color="text.primary">
            {t('testResult.pieChart.count')}: {data.value}건
          </Typography>
          <Typography variant="body2" color="text.primary">
            {t('testResult.pieChart.percentage')}: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // 커스텀 레이블
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // 5% 미만인 경우 레이블 숨김

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card sx={{ minHeight: 350 }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {t('testResult.pieChart.title')}
        </Typography>

        {/* 차트 영역 */}
        <Box sx={{ height: 250, mt: 1 }}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ReTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* 범례 */}
        <List dense sx={{ mt: 1, pt: 0 }}>
          {pieData.map((item) => (
            <ListItem key={item.name} sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <Circle sx={{ color: item.color, fontSize: 12 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value}건 ({item.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* 총계 */}
        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {t('testResult.pieChart.totalTestCases', { total: statistics.totalTests })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TestResultPieChart;