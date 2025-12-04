// src/components/TestPlanForm.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Grid, Paper, CircularProgress, Alert
} from '@mui/material';
import { useAppContext } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import TestCaseTree from './TestCaseTree.jsx';

const TestPlanForm = ({ testPlanId, onCancel, onSave }) => {
  const {
    activeProject,
    testPlans = [],
    addTestPlan,
    updateTestPlan,
    testCases,
    activeTestPlan
  } = useAppContext();

  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    testCaseIds: [],
    projectId: activeProject?.id || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 기존 플랜 데이터 초기화
  useEffect(() => {
    if (activeTestPlan && activeTestPlan.id === testPlanId) {
      setFormData({
        name: activeTestPlan.name,
        description: activeTestPlan.description,
        testCaseIds: activeTestPlan.testCaseIds,
        projectId: activeTestPlan.projectId
      });
    } else if (testPlanId) {
      const existingPlan = testPlans.find(p => p.id === testPlanId);
      if (existingPlan) {
        setFormData({
          name: existingPlan.name,
          description: existingPlan.description,
          testCaseIds: existingPlan.testCaseIds,
          projectId: existingPlan.projectId
        });
      }
    }
  }, [testPlanId, testPlans, activeTestPlan]);

  // 입력 핸들러
  const handleChange = field => e => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  // 테스트케이스 선택 핸들러
  const handleTestCaseSelect = selectedIds => {
    setFormData(prev => ({ ...prev, testCaseIds: selectedIds }));
  };

  // 유효성 검사
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('testPlan.validation.nameRequired', '테스트 플랜 이름은 필수 입력 항목입니다'));
      return false;
    }
    if (formData.testCaseIds.length === 0) {
      setError(t('testPlan.validation.testcaseRequired', '최소 한 개 이상의 테스트케이스를 선택해야 합니다'));
      return false;
    }
    return true;
  };

  // 저장 처리
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        projectId: activeProject.id
      };

      if (testPlanId) {
        await updateTestPlan({ ...payload, id: testPlanId });
      } else {
        await addTestPlan(payload);
      }

      onSave?.();
    } catch (err) {
      setError(t('testPlan.error.saveFailed', '저장 처리 중 오류가 발생했습니다: ') + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 실제 테스트케이스만 카운트
  const selectedTestCaseCount = formData.testCaseIds
    ? formData.testCaseIds.filter(
      id => {
        const tc = testCases.find(tc => tc.id === id);
        return tc && tc.type === "testcase";
      }
    ).length
    : 0;

  return (
    <Dialog open maxWidth="lg" fullWidth onClose={onCancel}>
      <DialogTitle>
        {testPlanId ? t('testPlan.form.title.edit', '테스트 플랜 수정') : t('testPlan.form.title.create', '새 테스트 플랜 생성')}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 기본 정보 입력 섹션 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('testPlan.form.planName', '플랜 이름')}
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              margin="normal"
              required
              disabled={loading}
            />

            <TextField
              label={t('testPlan.form.description', '설명')}
              value={formData.description}
              onChange={handleChange('description')}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              disabled={loading}
            />
          </Grid>

          {/* 테스트케이스 선택 섹션 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 2, height: '400px' }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('testPlan.form.testcaseSelection', '테스트케이스 선택')} ({t('testPlan.form.selectedCount', '{count}개 선택됨', { count: selectedTestCaseCount })})
              </Typography>

              {activeProject?.id ? (
                <TestCaseTree
                  projectId={activeProject.id}
                  selectable={true}
                  selectedIds={formData.testCaseIds}
                  onSelectionChange={handleTestCaseSelect}
                  showMinimalToolbar={true}
                />
              ) : (
                <Typography color="textSecondary">
                  {t('testPlan.form.projectSelectFirst', '프로젝트를 먼저 선택해주세요')}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          color="secondary"
          disabled={loading}
        >
          {t('testPlan.form.button.cancel', '취소')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!formData.name || !activeProject || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? t('testPlan.form.button.processing', '처리 중...') : t('testPlan.form.button.save', '저장')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TestPlanForm.propTypes = {
  testPlanId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

export default TestPlanForm;