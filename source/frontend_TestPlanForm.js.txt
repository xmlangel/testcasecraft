// src/components/TestPlanForm.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  Typography,
  Checkbox,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { createTestPlan } from '../models/testPlan';
import TestCaseTree from './TestCaseTree';

const TestPlanForm = ({ testPlanId, onCancel, onSave }) => {
  // 여기서 바로 testPlans 등 꺼냄
  const { testPlans = [], addTestPlan, updateTestPlan, getTestCase } = useAppContext();

  const [formOpen, setFormOpen] = useState(true);
  const [testPlan, setTestPlan] = useState(
    testPlanId && testPlans
      ? testPlans.find(plan => plan.id === testPlanId) || createTestPlan(`plan-${uuidv4()}`, '')
      : createTestPlan(`plan-${uuidv4()}`, '')
  );
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState([]);
  const [errors, setErrors] = useState({ name: '' });

  // testPlans 의존성 추가 및 안전한 접근
  useEffect(() => {
    if (testPlanId && testPlans) {
      const plan = testPlans.find(p => p.id === testPlanId);
      if (plan) {
        setTestPlan(plan);
        setSelectedTestCaseIds(plan.testCaseIds || []);
      }
    }
  }, [testPlanId, testPlans]);

  // 이하 동일
  const handleChange = useCallback((field) => (event) => {
    setTestPlan(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleSelectionChange = useCallback((selectedIds) => {
    setSelectedTestCaseIds(selectedIds);
  }, []);

  const validate = useCallback(() => {
    const newErrors = { name: '' };
    let isValid = true;

    if (!testPlan.name.trim()) {
      newErrors.name = '테스트 플랜 이름을 입력해 주세요';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [testPlan.name]);

  const handleSave = useCallback(() => {
    if (!validate()) return;

    const updatedTestPlan = {
      ...testPlan,
      testCaseIds: selectedTestCaseIds,
      updatedAt: new Date().toISOString()
    };

    if (testPlanId) {
      updateTestPlan(updatedTestPlan);
    } else {
      addTestPlan(updatedTestPlan);
    }

    setFormOpen(false);
    onSave?.();
  }, [testPlan, selectedTestCaseIds, testPlanId, updateTestPlan, addTestPlan, onSave, validate]);

  const handleCancel = useCallback(() => {
    setFormOpen(false);
    onCancel?.();
  }, [onCancel]);

  if (!formOpen) return null;

  return (
    <Dialog
      open={formOpen}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
      aria-labelledby="testplan-dialog"
    >
      <DialogTitle id="testplan-dialog">
        {testPlanId ? '테스트 플랜 수정' : '새 테스트 플랜 생성'}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="테스트 플랜 이름"
          value={testPlan.name}
          onChange={handleChange('name')}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.name}
          helperText={errors.name}
          inputProps={{ 'aria-label': '테스트 플랜 이름 입력' }}
        />

        <TextField
          label="설명"
          value={testPlan.description || ''}
          onChange={handleChange('description')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
          inputProps={{ 'aria-label': '테스트 플랜 설명 입력' }}
        />

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          테스트케이스 선택
        </Typography>

        <Grid container spacing={2} sx={{ minHeight: 400 }}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ height: '100%', p: 2 }}>
              <TestCaseTree
                selectable={true}
                selectedIds={selectedTestCaseIds}
                onSelectionChange={handleSelectionChange}
              />
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ height: '100%', p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                선택된 테스트케이스 ({selectedTestCaseIds.length})
              </Typography>

              <List sx={{ overflow: 'auto', maxHeight: 400 }}>
                {selectedTestCaseIds.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="선택된 테스트케이스가 없습니다."
                      secondary="왼쪽 트리에서 테스트케이스를 선택하세요."
                    />
                  </ListItem>
                ) : (
                  selectedTestCaseIds.map(id => {
                    const testCase = getTestCase(id);
                    return testCase ? (
                      <ListItem key={id}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={true}
                            onChange={() => setSelectedTestCaseIds(prev =>
                              prev.filter(tcId => tcId !== id)
                            )}
                            inputProps={{
                              'aria-label': `${testCase.name} 선택 해제`
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={testCase.name}
                          secondary={testCase.description?.substring(0, 50)}
                        />
                      </ListItem>
                    ) : null;
                  })
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel}
          aria-label="테스트 플랜 편집 취소"
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!testPlan.name || selectedTestCaseIds.length === 0}
          aria-label="테스트 플랜 저장"
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TestPlanForm.propTypes = {
  testPlanId: PropTypes.string,
  onCancel: PropTypes.func,
  onSave: PropTypes.func
};

export default TestPlanForm;
