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

const TestPlanSelector = ({ 
  testPlans, 
  selectedTestPlan, 
  onTestPlanChange, 
  loading = false,
  disabled = false,
  size = 'medium'
}) => {
  return (
    <Box sx={{ minWidth: 250 }}>
      <FormControl fullWidth size={size} disabled={disabled}>
        <InputLabel id="test-plan-selector-label">
          테스트 플랜 선택
        </InputLabel>
        <Select
          labelId="test-plan-selector-label"
          id="test-plan-selector"
          value={selectedTestPlan?.id || ''}
          label="테스트 플랜 선택"
          onChange={(e) => {
            const selectedPlan = testPlans.find(plan => plan.id === e.target.value);
            onTestPlanChange(selectedPlan || null);
          }}
          endAdornment={loading && (
            <CircularProgress size={20} sx={{ mr: 2 }} />
          )}
        >
          <MenuItem value="">
            <em>전체</em>
          </MenuItem>
          {testPlans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" noWrap>
                  {plan.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={`${plan.testCaseIds?.length || 0}개 케이스`}
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
            선택된 플랜: <strong>{selectedTestPlan.name}</strong>
            {selectedTestPlan.testCaseIds && (
              <> ({selectedTestPlan.testCaseIds.length}개 테스트케이스)</>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TestPlanSelector;