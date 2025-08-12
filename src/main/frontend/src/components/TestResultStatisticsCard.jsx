// src/components/TestResultStatisticsCard.jsx
// ICT-194 Phase 3: React 성능 최적화 적용

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import CountUp from 'react-countup';
import {
  CheckCircle,
  Cancel,
  Block,
  PauseCircle
} from '@mui/icons-material';

/**
 * ICT-185: 테스트 결과 통계 카드 컴포넌트
 * Pass/Fail/NotRun/Blocked 통계를 수치로 표시
 * ICT-194 Phase 3: React 성능 최적화 적용
 */
function TestResultStatisticsCard({ statistics, loading = false, error = null }) {
  // ICT-194 Phase 3: 로딩 상태 컴포넌트 메모이제이션
  const loadingCard = useMemo(() => (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          테스트 결과 통계
        </Typography>
        <Typography>로딩 중...</Typography>
      </CardContent>
    </Card>
  ), []);

  // ICT-194 Phase 3: 에러 상태 컴포넌트 메모이제이션
  const errorCard = useMemo(() => (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="error">
          테스트 결과 통계
        </Typography>
        <Typography color="error">에러: {error}</Typography>
      </CardContent>
    </Card>
  ), [error]);

  // ICT-194 Phase 3: 빈 상태 컴포넌트 메모이제이션  
  const emptyCard = useMemo(() => (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          테스트 결과 통계
        </Typography>
        <Typography>데이터 없음</Typography>
      </CardContent>
    </Card>
  ), []);

  // ICT-194 Phase 3: 통계 아이템 배열 메모이제이션 - statistics 변경 시만 재계산
  const statisticItems = useMemo(() => [
    {
      label: '성공',
      value: statistics?.passCount || 0,
      percentage: statistics?.passRate || 0,
      color: '#00C49F',
      icon: <CheckCircle sx={{ color: '#00C49F' }} />
    },
    {
      label: '실패', 
      value: statistics?.failCount || 0,
      percentage: statistics?.failRate || 0,
      color: '#FF4D4F',
      icon: <Cancel sx={{ color: '#FF4D4F' }} />
    },
    {
      label: '차단됨',
      value: statistics?.blockedCount || 0, 
      percentage: statistics?.blockedRate || 0,
      color: '#FFBB28',
      icon: <Block sx={{ color: '#FFBB28' }} />
    },
    {
      label: '미실행',
      value: statistics?.notRunCount || 0,
      percentage: statistics?.notRunRate || 0, 
      color: '#B0BEC5',
      icon: <PauseCircle sx={{ color: '#B0BEC5' }} />
    }
  ], [statistics]);

  if (loading) return loadingCard;
  if (error) return errorCard;
  if (!statistics) return emptyCard;

  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          테스트 결과 통계
        </Typography>
        
        {/* 주요 지표 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="success.dark">
                성공률
              </Typography>
              <Typography variant="h5" color="success.dark">
                <CountUp end={statistics.passRate || 0} duration={1} suffix="%" />
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.dark">
                총 테스트
              </Typography>
              <Typography variant="h5" color="primary.dark">
                <CountUp end={statistics.totalTests || 0} duration={1} />
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 상세 통계 */}
        <Grid container spacing={1}>
          {statisticItems.map((item) => (
            <Grid item xs={6} key={item.label}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1,
                bgcolor: `${item.color}10`,
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
                    <CountUp end={item.value} duration={1} /> ({item.percentage}%)
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