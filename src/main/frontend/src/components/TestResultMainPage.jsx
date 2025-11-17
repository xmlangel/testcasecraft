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
  Assessment as AssessmentIcon,
  TableView as TableViewIcon
} from '@mui/icons-material';

import TestResultStatisticsDashboard from './TestResultStatisticsDashboard.jsx';
import TestResultDetailTable from './TestCase/TestResultDetailTable.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { useTranslation } from '../context/I18nContext.jsx';
import { PAGE_CONTAINER_SX } from '../styles/layoutConstants';

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
  const { t } = useTranslation();
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
    // 유효한 탭 인덱스 범위(0-1) 확인
    if (newValue >= 0 && newValue <= 1) {
      setTabValue(newValue);
    }
  };

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
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
            {t('testResult.mainPage.title')}
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
          {t('testResult.mainPage.description')}
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
                  {isMobile ? t('testResult.tab.statistics') : t('testResult.tab.statisticsFull')}
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                  >
                    {t('testResult.tab.statisticsDescription')}
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
                  {isMobile ? t('testResult.tab.table') : t('testResult.tab.tableFull')}
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                  >
                    {t('testResult.tab.tableDescription')}
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
          <Box sx={{ mt: { xs: 1, md: 2 }, height: '100%' }}>
            <TestResultStatisticsDashboard />
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <TestResultDetailTable
              projectId={activeProject?.id}
              onViewResult={handleViewResult}
              dense={isMobile} // 모바일에서는 dense 모드
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default TestResultMainPage;