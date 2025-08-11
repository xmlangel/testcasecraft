// src/components/TestResultStatisticsCard.jsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Tooltip
} from '@mui/material';
import CountUp from 'react-countup';
import {
  CheckCircle,
  Cancel,
  Block,
  PauseCircle,
  PlayArrow
} from '@mui/icons-material';

/**
 * ICT-187: 테스트 결과 통계 카드 컴포넌트
 * Pass/Fail/NotRun/Blocked 통계를 수치로 표시
 */
function TestResultStatisticsCard({ statistics, loading = false }) {
  // 로딩 상태 처리
  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 280 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            테스트 결과 통계
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            통계 데이터를 불러오는 중...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음 상태 처리
  if (!statistics || statistics.totalTests === 0) {
    return (
      <Card sx={{ height: '100%', minHeight: 280 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            테스트 결과 통계
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              통계 데이터가 없습니다.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 통계 아이템 데이터
  const statisticItems = [
    {
      label: '성공',
      value: statistics.passCount || 0,
      percentage: statistics.passRate || 0,
      color: '#00C49F',
      icon: <CheckCircle sx={{ color: '#00C49F' }} />,
      description: '성공한 테스트 케이스 수'
    },
    {
      label: '실패',
      value: statistics.failCount || 0,
      percentage: statistics.failRate || 0,
      color: '#FF4D4F',
      icon: <Cancel sx={{ color: '#FF4D4F' }} />,
      description: '실패한 테스트 케이스 수'
    },
    {
      label: '차단됨',
      value: statistics.blockedCount || 0,
      percentage: statistics.blockedRate || 0,
      color: '#FFBB28',
      icon: <Block sx={{ color: '#FFBB28' }} />,
      description: '차단된 테스트 케이스 수'
    },
    {
      label: '미실행',
      value: statistics.notRunCount || 0,
      percentage: statistics.notRunRate || 0,
      color: '#B0BEC5',
      icon: <PauseCircle sx={{ color: '#B0BEC5' }} />,
      description: '아직 실행되지 않은 테스트 케이스 수'
    }
  ];

  return (
    <Card sx={{ height: '100%', minHeight: 280 }}>
      <CardContent>
        {/* 제목 및 총 테스트 수 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            테스트 결과 통계
          </Typography>
          <Chip 
            icon={<PlayArrow />}
            label={`총 ${statistics.totalTests}건`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* 주요 지표 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                실행률
              </Typography>
              <Typography variant="h5" color="success.main">
                <CountUp 
                  end={statistics.executionRate || 0} 
                  duration={1.5}
                  decimals={1}
                  suffix="%" 
                />
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                성공률
              </Typography>
              <Typography variant="h5" color="primary.main">
                <CountUp 
                  end={statistics.successRate || 0} 
                  duration={1.5}
                  decimals={1}
                  suffix="%" 
                />
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 상세 통계 */}
        <Grid container spacing={1}>
          {statisticItems.map((item) => (
            <Grid item xs={6} key={item.label}>
              <Tooltip title={item.description} arrow>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    border: `1px solid ${item.color}20`,
                    bgcolor: `${item.color}08`,
                    cursor: 'help'
                  }}
                >
                  <Box sx={{ mr: 1 }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" component="span">
                        <CountUp 
                          end={item.value} 
                          duration={1.5}
                        />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (<CountUp 
                          end={item.percentage} 
                          duration={1.5}
                          decimals={1}
                          suffix="%" 
                        />)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* 계산 시간 */}
        {statistics.calculatedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {new Date(statistics.calculatedAt).toLocaleString('ko-KR')} 기준
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default TestResultStatisticsCard;