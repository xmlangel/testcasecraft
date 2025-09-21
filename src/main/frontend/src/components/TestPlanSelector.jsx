// src/components/TestPlanSelector.jsx

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import { useI18n } from '../context/I18nContext.jsx';

const TestPlanSelector = ({
  testPlans,
  selectedTestPlan,
  onTestPlanChange,
  loading = false,
  disabled = false,
  size = 'medium'
}) => {
  const { t } = useI18n();
  return (
    <Box sx={{ minWidth: 250 }}>
      <FormControl fullWidth size={size} disabled={disabled}>
        <InputLabel id="test-plan-selector-label">
          {t('testPlan.selector.label', '테스트 플랜 선택')}
        </InputLabel>
        <Select
          labelId="test-plan-selector-label"
          id="test-plan-selector"
          value={selectedTestPlan?.id || ''}
          label={t('testPlan.selector.label', '테스트 플랜 선택')}
          onChange={(e) => {
            const selectedPlan = testPlans.find(plan => plan.id === e.target.value);
            onTestPlanChange(selectedPlan || null);
          }}
          endAdornment={loading && (
            <CircularProgress size={20} sx={{ mr: 2 }} />
          )}
        >
          <MenuItem value="">
            <em>{t('testPlan.selector.all', '전체')}</em>
          </MenuItem>
          {testPlans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" noWrap>
                  {plan.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={t('testPlan.selector.caseCount', '{count}개 케이스', { count: plan.testCaseIds?.length || 0 })}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  {plan.description && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ ml: 1, opacity: 0.7 }}
                      noWrap
                    >
                      {plan.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedTestPlan && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('testPlan.selector.selected', '선택된 플랜: {planName}', { planName: selectedTestPlan.name })}
            {selectedTestPlan.testCaseIds && (
              <> {t('testPlan.selector.testcaseCount', '({count}개 테스트케이스)', { count: selectedTestPlan.testCaseIds.length })}</>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TestPlanSelector;