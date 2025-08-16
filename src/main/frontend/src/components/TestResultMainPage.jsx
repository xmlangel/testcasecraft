// src/components/TestResultMainPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  TableView as TableViewIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

// ICT-187에서 완성된 컴포넌트들 import
import TestResultStatisticsDashboard from './TestResultStatisticsDashboard.jsx';
// ICT-188에서 개발된 상세 테이블 컴포넌트 import
import TestResultDetailTable from './TestCase/TestResultDetailTable.jsx';
// ICT-201에서 구현된 추이 분석 컴포넌트 import
import TestResultTrendAnalysis from './TestResultTrendAnalysis.jsx';
import { useAppContext } from '../context/AppContext.jsx';

/**
 * ICT-192: 테스트 결과 보기 메인 페이지
 * ICT-185 Epic의 핵심 요구사항인 "테스트 결과" 전용 탭 구현
 * 
 * 기존 완성 컴포넌트들과 통합:
 * - ICT-186: 백엔드 API (TestResultReportController, Service, DTO)
 * - ICT-187: 통계 대시보드 UI (StatisticsCard, PieChart, BarChart, FilterPanel)
 */
function TestResultMainPage() {
  const { activeProject } = useAppContext();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // 테스트 결과 상세보기 핸들러
  const handleViewResult = (testCaseId, executionId) => {
    navigate(`/projects/${activeProject?.id}/executions/${executionId}/testcase/${testCaseId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BarChartIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h4" component="h1" color="primary">
            테스트 결과
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          프로젝트의 모든 테스트 결과를 통합하여 분석하고 관리할 수 있습니다.
        </Typography>

        {/* 기능 소개 카드 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  통계 대시보드
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pass/Fail/NotRun/Blocked 결과 분포를 시각화하여 한눈에 파악
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  추이 분석
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  테스트 플랜별, 실행자별 결과 비교 및 성능 추이 분석
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BarChartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  상세 리포트
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  폴더별, 케이스별 상세 결과와 JIRA 연동 상태 관리
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* 메인 컨텐츠: 탭 기반 뷰 */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<AssessmentIcon />} 
            label="통계 대시보드" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<TrendingUpIcon />} 
            label="추이 분석" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<TableViewIcon />} 
            label="상세 테이블" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<DescriptionIcon />} 
            label="상세 리포트" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Paper>

      {/* 탭 내용 */}
      <Box>
        {tabValue === 0 && (
          <Box>
            <TestResultStatisticsDashboard />
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <TestResultTrendAnalysis />
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <TestResultDetailTable 
              projectId={activeProject?.id}
              onViewResult={handleViewResult}
              dense={false}
            />
          </Box>
        )}
        
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              p: 3,
              bgcolor: 'primary.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" color="primary" gutterBottom>
                  📊 상세 리포트
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  고급 필터링, 커스텀 리포트, JIRA 연동 기능이 포함된 상세 리포트 화면입니다.
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              textAlign: 'center',
              py: 6,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🚧 개발 진행 중
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                상세 리포트 컴포넌트를 개발 중입니다.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                예정 기능: 고급 필터링 • 사용자 정의 리포트 • Excel/PDF 내보내기 • JIRA 연동
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default TestResultMainPage;