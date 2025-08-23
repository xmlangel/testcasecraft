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
// ICT-223에서 구현된 상세 리포트 컴포넌트 import
import TestResultDetailReportView from './TestCase/TestResultDetailReportView.jsx';
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
            label={
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="medium">통계 대시보드</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Pass/Fail/NotRun/Blocked 결과 분포를 시각화하여 한눈에 파악할 수 있습니다
                </Typography>
              </Box>
            } 
            iconPosition="start"
            sx={{ minHeight: 72, alignItems: 'flex-start', textAlign: 'left' }}
          />
          <Tab 
            icon={<TrendingUpIcon />} 
            label={
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="medium">추이 분석</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  테스트 플랜별, 실행자별 결과 비교 및 성능 추이 분석이 가능합니다
                </Typography>
              </Box>
            }
            iconPosition="start"
            sx={{ minHeight: 72, alignItems: 'flex-start', textAlign: 'left' }}
          />
          <Tab 
            icon={<TableViewIcon />} 
            label={
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="medium">상세 테이블</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  전체 테스트 결과를 테이블 형태로 상세하게 확인할 수 있습니다
                </Typography>
              </Box>
            }
            iconPosition="start"
            sx={{ minHeight: 72, alignItems: 'flex-start', textAlign: 'left' }}
          />
          <Tab 
            icon={<DescriptionIcon />} 
            label={
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="medium">상세 리포트</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  폴더별, 케이스별 상세 결과와 JIRA 연동 상태 관리를 지원합니다
                </Typography>
              </Box>
            }
            iconPosition="start"
            sx={{ minHeight: 72, alignItems: 'flex-start', textAlign: 'left' }}
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
          <TestResultDetailReportView
            projectId={activeProject?.id}
            activeProject={activeProject}
            onError={(error) => {
              console.error('DetailReportView Error:', error);
              // 필요시 에러 처리 로직 추가
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default TestResultMainPage;