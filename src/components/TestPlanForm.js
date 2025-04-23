// /src/components/TestPlanForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
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
  const { state, addTestPlan, updateTestPlan, getTestCase } = useAppContext();
  const { testCases, testPlans } = state;
  
  const [formOpen, setFormOpen] = useState(true);
  const [testPlan, setTestPlan] = useState(
    testPlanId 
      ? testPlans.find(plan => plan.id === testPlanId) 
      : createTestPlan(`plan-${uuidv4()}`, '')
  );
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState([]);
  
  // 초기 선택된 테스트케이스 설정
  useEffect(() => {
    if (testPlanId) {
      const plan = testPlans.find(p => p.id === testPlanId);
      if (plan) {
        setTestPlan(plan);
        setSelectedTestCaseIds(plan.testCaseIds || []);
      }
    }
  }, [testPlanId, testPlans]);
  
  // 폼 필드 변경 핸들러
  const handleChange = (field) => (event) => {
    setTestPlan({
      ...testPlan,
      [field]: event.target.value
    });
  };
  
  // 테스트케이스 선택 변경 핸들러
  const handleSelectionChange = (selectedIds) => {
    setSelectedTestCaseIds(selectedIds);
  };
  
  // 테스트 플랜 저장 핸들러
  const handleSave = () => {
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
    if (onSave) {
      onSave();
    }
  };
  
  // 취소 핸들러
  const handleCancel = () => {
    setFormOpen(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  if (!formOpen) {
    return null;
  }
  
  return (
    <Dialog
      open={formOpen}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
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
                    if (!testCase) return null;
                    return (
                      <ListItem key={id}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={true}
                            onChange={() => {
                              setSelectedTestCaseIds(selectedTestCaseIds.filter(tcId => tcId !== id));
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={testCase.name}
                          secondary={testCase.description ? 
                            (testCase.description.length > 50 ? 
                              `${testCase.description.substring(0, 50)}...` : 
                              testCase.description) : 
                            null
                          }
                        />
                      </ListItem>
                    );
                  })
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>취소</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!testPlan.name || selectedTestCaseIds.length === 0}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestPlanForm;
