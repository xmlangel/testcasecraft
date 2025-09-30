// src/components/TestCase/TestResultFilterPanel.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import testResultService from '../../services/testResultService.js';

/**
 * ICT-263: 테스트결과 상세테이블 필터링 패널 컴포넌트
 */
const TestResultFilterPanel = ({
  projectId,
  onFilterChange,
  initialFilters = {},
  disabled = false
}) => {
  const { t } = useTranslation();
  const [testPlans, setTestPlans] = useState([]);
  const [testExecutions, setTestExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 필터 상태
  const [selectedTestPlan, setSelectedTestPlan] = useState(initialFilters.testPlanId || '');
  const [selectedTestExecution, setSelectedTestExecution] = useState(initialFilters.testExecutionId || '');
  
  // 초기 데이터 로드
  useEffect(() => {
    if (projectId) {
      loadTestPlans();
    }
  }, [projectId]);

  // 테스트 플랜 변경 시 테스트 실행 목록 갱신
  useEffect(() => {
    if (projectId && selectedTestPlan) {
      loadTestExecutions(selectedTestPlan);
    } else if (projectId) {
      loadTestExecutions();
    }
  }, [projectId, selectedTestPlan]);

  // 테스트 플랜 목록 로드
  const loadTestPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await testResultService.getTestPlansForFilter(projectId);
      if (response.success && response.data) {
        setTestPlans(response.data);
      } else {
        setTestPlans([]);
      }
    } catch (err) {
      console.error('테스트 플랜 로드 실패:', err);
      setError(t('testResult.filter.errorLoadPlans', '테스트 플랜 목록을 불러올 수 없습니다.'));
      setTestPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // 테스트 실행 목록 로드
  const loadTestExecutions = async (testPlanId = null) => {
    try {
      const response = await testResultService.getTestExecutionsForFilter(projectId, testPlanId);
      if (response.success && response.data) {
        setTestExecutions(response.data);
      } else {
        setTestExecutions([]);
      }
    } catch (err) {
      console.error('테스트 실행 로드 실패:', err);
      setTestExecutions([]);
    }
  };

  // 필터 적용
  const handleApplyFilter = () => {
    const filters = {
      testPlanId: selectedTestPlan || null,
      testExecutionId: selectedTestExecution || null
    };
    
    onFilterChange(filters);
  };

  // 필터 초기화
  const handleClearFilter = () => {
    setSelectedTestPlan('');
    setSelectedTestExecution('');
    onFilterChange({
      testPlanId: null,
      testExecutionId: null
    });
  };

  // 새로고침
  const handleRefresh = () => {
    loadTestPlans();
    if (selectedTestPlan) {
      loadTestExecutions(selectedTestPlan);
    } else {
      loadTestExecutions();
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ flex: 1 }}>
          {t('testResult.filter.title', '테스트 결과 필터')}
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading || disabled}
        >
          {t('testResult.filter.refresh', '새로고침')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        {/* 테스트 플랜 선택 */}
        <FormControl sx={{ minWidth: 200 }} disabled={loading || disabled}>
          <InputLabel>{t('testResult.filter.testPlan', '테스트 플랜')}</InputLabel>
          <Select
            value={selectedTestPlan}
            onChange={(e) => setSelectedTestPlan(e.target.value)}
            label={t('testResult.filter.testPlan', '테스트 플랜')}
            size="small"
          >
            <MenuItem value="">
              <em>{t('testResult.filter.allView', '전체 보기')}</em>
            </MenuItem>
            {testPlans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                <Box>
                  <Typography variant="body2">{plan.name}</Typography>
                  {plan.description && (
                    <Typography variant="caption" color="text.secondary">
                      {plan.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 테스트 실행 선택 */}
        <FormControl sx={{ minWidth: 200 }} disabled={loading || disabled}>
          <InputLabel>{t('testResult.filter.testExecution', '테스트 실행')}</InputLabel>
          <Select
            value={selectedTestExecution}
            onChange={(e) => setSelectedTestExecution(e.target.value)}
            label={t('testResult.filter.testExecution', '테스트 실행')}
            size="small"
          >
            <MenuItem value="">
              <em>{t('testResult.filter.allView', '전체 보기')}</em>
            </MenuItem>
            {testExecutions.map((execution) => (
              <MenuItem key={execution.id} value={execution.id}>
                <Box>
                  <Typography variant="body2">{execution.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={execution.status}
                      size="small"
                      color={execution.status === 'COMPLETED' ? 'success' : 
                             execution.status === 'INPROGRESS' ? 'warning' : 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '18px' }}
                    />
                    {execution.startDate && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(execution.startDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 액션 버튼들 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleApplyFilter}
            disabled={loading || disabled}
            startIcon={loading ? <CircularProgress size={16} /> : <FilterListIcon />}
          >
            {t('testResult.filter.apply', '필터 적용')}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilter}
            disabled={loading || disabled}
            startIcon={<ClearIcon />}
          >
            {t('testResult.filter.clear', '초기화')}
          </Button>
        </Box>
      </Box>

      {/* 현재 적용된 필터 표시 */}
      {(selectedTestPlan || selectedTestExecution) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {t('testResult.filter.activeFilters', '적용된 필터:')}
            </Typography>
            {selectedTestPlan && (
              <Chip
                label={`${t('testResult.filter.planPrefix', '플랜:')} ${testPlans.find(p => p.id === selectedTestPlan)?.name || selectedTestPlan}`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={() => setSelectedTestPlan('')}
              />
            )}
            {selectedTestExecution && (
              <Chip
                label={`${t('testResult.filter.executionPrefix', '실행:')} ${testExecutions.find(e => e.id === selectedTestExecution)?.name || selectedTestExecution}`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={() => setSelectedTestExecution('')}
              />
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default TestResultFilterPanel;