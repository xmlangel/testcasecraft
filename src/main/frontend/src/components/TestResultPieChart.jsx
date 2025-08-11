// src/components/TestResultPieChart.jsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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

/**
 * ICT-187: 테스트 결과 파이차트 컴포넌트
 * Pass/Fail/NotRun/Blocked 분포를 시각화
 */
function TestResultPieChart({ statistics, loading = false }) {
  // 기존 Dashboard.jsx와 동일한 색상 사용
  const RESULT_COLORS = {
    PASS: '#00C49F',
    FAIL: '#FF4D4F',
    BLOCKED: '#FFBB28',
    NOT_RUN: '#B0BEC5',
    NOTRUN: '#B0BEC5'
  };

  const RESULT_LABELS = {
    PASS: '성공',
    FAIL: '실패',
    BLOCKED: '차단됨',
    NOT_RUN: '미실행',
    NOTRUN: '미실행'
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 350 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            테스트 결과 분포
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            차트 데이터를 불러오는 중...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음 상태 처리
  if (!statistics || statistics.totalTests === 0) {
    return (
      <Card sx={{ height: '100%', minHeight: 350 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            테스트 결과 분포
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              차트 데이터가 없습니다.
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
      color: RESULT_COLORS.NOT_RUN
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
          <Typography variant="body2">
            개수: {data.value}건
          </Typography>
          <Typography variant="body2">
            비율: {data.percentage.toFixed(1)}%
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
    <Card sx={{ height: '100%', minHeight: 350 }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          테스트 결과 분포
        </Typography>

        {/* 차트 영역 */}
        <Box sx={{ height: 250, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
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
            총 테스트 케이스: {statistics.totalTests}건
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TestResultPieChart;