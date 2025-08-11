// src/components/StatisticsFilterPanel.jsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Refresh,
  FilterList,
  Clear,
  DateRange,
  Person,
  Assignment
} from '@mui/icons-material';

/**
 * ICT-187: 통계 필터링 패널 컴포넌트
 * 테스트 플랜별, 실행별, 날짜별 필터링 옵션
 */
function StatisticsFilterPanel({ 
  filters,
  onFiltersChange,
  projects = [],
  testPlans = [],
  testExecutions = [],
  loading = false,
  onRefresh = null
}) {

  // 필터 변경 핸들러
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    
    // 의존성 처리: 프로젝트 변경 시 테스트 플랜과 실행 초기화
    if (filterKey === 'projectId') {
      newFilters.testPlanId = '';
      newFilters.testExecutionId = '';
    }
    
    // 테스트 플랜 변경 시 실행 초기화
    if (filterKey === 'testPlanId') {
      newFilters.testExecutionId = '';
    }
    
    onFiltersChange(newFilters);
  };

  // 전체 초기화
  const handleClearAll = () => {
    onFiltersChange({
      projectId: '',
      testPlanId: '',
      testExecutionId: '',
      dateRange: 'all',
      viewType: 'overview'
    });
  };

  // 적용된 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.projectId) count++;
    if (filters.testPlanId) count++;
    if (filters.testExecutionId) count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    return count;
  };

  // 현재 프로젝트의 테스트 플랜들 필터링
  const availableTestPlans = filters.projectId 
    ? testPlans.filter(plan => plan.projectId === filters.projectId)
    : testPlans;

  // 현재 테스트 플랜의 실행들 필터링
  const availableTestExecutions = filters.testPlanId
    ? testExecutions.filter(exec => exec.testPlanId === filters.testPlanId)
    : testExecutions;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {/* 제목 및 액션 버튼 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="action" />
            <Typography variant="h6" component="h3">
              통계 필터
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Chip 
                label={`${getActiveFilterCount()}개 적용`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Tooltip title="데이터 새로고침" arrow>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={onRefresh}
                  disabled={loading}
                >
                  새로고침
                </Button>
              </Tooltip>
            )}
            
            <Tooltip title="모든 필터 초기화" arrow>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearAll}
                disabled={loading || getActiveFilterCount() === 0}
              >
                초기화
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {/* 필터 옵션들 */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {/* 프로젝트 선택 */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="project-select-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Assignment fontSize="small" />
                프로젝트
              </Box>
            </InputLabel>
            <Select
              labelId="project-select-label"
              value={filters.projectId || ''}
              label="프로젝트"
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>전체 프로젝트</em>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 테스트 플랜 선택 */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="testplan-select-label">테스트 플랜</InputLabel>
            <Select
              labelId="testplan-select-label"
              value={filters.testPlanId || ''}
              label="테스트 플랜"
              onChange={(e) => handleFilterChange('testPlanId', e.target.value)}
              disabled={loading || !filters.projectId}
            >
              <MenuItem value="">
                <em>전체 플랜</em>
              </MenuItem>
              {availableTestPlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 테스트 실행 선택 */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="execution-select-label">테스트 실행</InputLabel>
            <Select
              labelId="execution-select-label"
              value={filters.testExecutionId || ''}
              label="테스트 실행"
              onChange={(e) => handleFilterChange('testExecutionId', e.target.value)}
              disabled={loading || !filters.testPlanId}
            >
              <MenuItem value="">
                <em>전체 실행</em>
              </MenuItem>
              {availableTestExecutions.map((execution) => (
                <MenuItem key={execution.id} value={execution.id}>
                  {execution.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 기간 선택 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="daterange-select-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DateRange fontSize="small" />
                기간
              </Box>
            </InputLabel>
            <Select
              labelId="daterange-select-label"
              value={filters.dateRange || 'all'}
              label="기간"
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="all">전체 기간</MenuItem>
              <MenuItem value="today">오늘</MenuItem>
              <MenuItem value="week">최근 1주</MenuItem>
              <MenuItem value="month">최근 1개월</MenuItem>
              <MenuItem value="quarter">최근 3개월</MenuItem>
            </Select>
          </FormControl>

          {/* 보기 형태 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="viewtype-select-label">보기 형태</InputLabel>
            <Select
              labelId="viewtype-select-label"
              value={filters.viewType || 'overview'}
              label="보기 형태"
              onChange={(e) => handleFilterChange('viewType', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="overview">전체 개요</MenuItem>
              <MenuItem value="by-plan">플랜별 비교</MenuItem>
              <MenuItem value="by-executor">실행자별 비교</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* 현재 필터 상태 표시 */}
        {getActiveFilterCount() > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                적용 중인 필터:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filters.projectId && (
                  <Chip
                    label={`프로젝트: ${projects.find(p => p.id === filters.projectId)?.name || filters.projectId}`}
                    size="small"
                    variant="outlined"
                    onDelete={() => handleFilterChange('projectId', '')}
                  />
                )}
                {filters.testPlanId && (
                  <Chip
                    label={`플랜: ${availableTestPlans.find(p => p.id === filters.testPlanId)?.name || filters.testPlanId}`}
                    size="small"
                    variant="outlined"
                    onDelete={() => handleFilterChange('testPlanId', '')}
                  />
                )}
                {filters.testExecutionId && (
                  <Chip
                    label={`실행: ${availableTestExecutions.find(e => e.id === filters.testExecutionId)?.name || filters.testExecutionId}`}
                    size="small"
                    variant="outlined"
                    onDelete={() => handleFilterChange('testExecutionId', '')}
                  />
                )}
                {filters.dateRange && filters.dateRange !== 'all' && (
                  <Chip
                    label={`기간: ${filters.dateRange}`}
                    size="small"
                    variant="outlined"
                    onDelete={() => handleFilterChange('dateRange', 'all')}
                  />
                )}
              </Stack>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StatisticsFilterPanel;