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
  Paper,
  useTheme,
  useMediaQuery
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
  
  // 반응형 처리를 위한 미디어 쿼리
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // 960px 미만
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // 1280px 미만

  // 테스트 결과 상세보기 핸들러
  const handleViewResult = (testCaseId, executionId) => {
    navigate(`/projects/${activeProject?.id}/executions/${executionId}/testcase/${testCaseId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 0 } }}>
      {/* 페이지 헤더 - 반응형 개선 */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.5, md: 1 }, 
          mb: { xs: 1, md: 2 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' }
        }}>
          <BarChartIcon 
            color="primary" 
            sx={{ 
              fontSize: { xs: 24, sm: 26, md: 28 } 
            }} 
          />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            color="primary"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              fontWeight: { xs: 600, md: 400 }
            }}
          >
            테스트 결과
          </Typography>
        </Box>
        
        <Typography 
          variant={isMobile ? "body2" : "body1"} 
          color="text.secondary" 
          sx={{ 
            mb: { xs: 1.5, md: 2 },
            lineHeight: { xs: 1.4, md: 1.5 },
            display: { xs: 'none', sm: 'block' } // 모바일에서 설명 숨김
          }}
        >
          프로젝트의 모든 테스트 결과를 통합하여 분석하고 관리할 수 있습니다.
        </Typography>

        <Divider sx={{ mb: { xs: 2, md: 3 } }} />
      </Box>

      {/* 메인 컨텐츠: 탭 기반 뷰 - 반응형 개선 */}
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile={isMobile}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': { opacity: 0.3 }
            }
          }}
        >
          <Tab 
            icon={<AssessmentIcon />} 
            label={
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant={isMobile ? "body2" : "body2"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {isMobile ? "통계" : "통계 대시보드"}
                </Typography>
                {!isMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                  >
                    Pass/Fail/NotRun/Blocked 결과 분포를 시각화하여 한눈에 파악할 수 있습니다
                  </Typography>
                )}
              </Box>
            } 
            iconPosition={isMobile ? "top" : "start"}
            sx={{ 
              minHeight: { xs: 48, md: 72 }, 
              alignItems: { xs: 'center', md: 'flex-start' }, 
              textAlign: { xs: 'center', md: 'left' },
              minWidth: { xs: 80, sm: 120 },
              px: { xs: 1, sm: 2 }
            }}
          />
          <Tab 
            icon={<TrendingUpIcon />} 
            label={
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant={isMobile ? "body2" : "body2"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {isMobile ? "추이" : "추이 분석"}
                </Typography>
                {!isMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                  >
                    테스트 플랜별, 실행자별 결과 비교 및 성능 추이 분석이 가능합니다
                  </Typography>
                )}
              </Box>
            }
            iconPosition={isMobile ? "top" : "start"}
            sx={{ 
              minHeight: { xs: 48, md: 72 }, 
              alignItems: { xs: 'center', md: 'flex-start' }, 
              textAlign: { xs: 'center', md: 'left' },
              minWidth: { xs: 80, sm: 120 },
              px: { xs: 1, sm: 2 }
            }}
          />
          <Tab 
            icon={<TableViewIcon />} 
            label={
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant={isMobile ? "body2" : "body2"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {isMobile ? "테이블" : "상세 테이블"}
                </Typography>
                {!isMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                  >
                    전체 테스트 결과를 테이블 형태로 상세하게 확인할 수 있습니다
                  </Typography>
                )}
              </Box>
            }
            iconPosition={isMobile ? "top" : "start"}
            sx={{ 
              minHeight: { xs: 48, md: 72 }, 
              alignItems: { xs: 'center', md: 'flex-start' }, 
              textAlign: { xs: 'center', md: 'left' },
              minWidth: { xs: 80, sm: 120 },
              px: { xs: 1, sm: 2 }
            }}
          />
          <Tab 
            icon={<DescriptionIcon />} 
            label={
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant={isMobile ? "body2" : "body2"} 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {isMobile ? "리포트" : "상세 리포트"}
                </Typography>
                {!isMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                  >
                    폴더별, 케이스별 상세 결과와 JIRA 연동 상태 관리를 지원합니다
                  </Typography>
                )}
              </Box>
            }
            iconPosition={isMobile ? "top" : "start"}
            sx={{ 
              minHeight: { xs: 48, md: 72 }, 
              alignItems: { xs: 'center', md: 'flex-start' }, 
              textAlign: { xs: 'center', md: 'left' },
              minWidth: { xs: 80, sm: 120 },
              px: { xs: 1, sm: 2 }
            }}
          />
        </Tabs>
      </Paper>

      {/* 탭 내용 - 반응형 패딩 적용 */}
      <Box sx={{ px: { xs: 0, sm: 1, md: 0 } }}>
        {tabValue === 0 && (
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <TestResultStatisticsDashboard />
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <TestResultTrendAnalysis />
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <TestResultDetailTable 
              projectId={activeProject?.id}
              onViewResult={handleViewResult}
              dense={isMobile} // 모바일에서는 dense 모드
            />
          </Box>
        )}
        
        {tabValue === 3 && (
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <TestResultDetailReportView
              projectId={activeProject?.id}
              activeProject={activeProject}
              onError={(error) => {
                console.error('DetailReportView Error:', error);
                // 필요시 에러 처리 로직 추가
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default TestResultMainPage;