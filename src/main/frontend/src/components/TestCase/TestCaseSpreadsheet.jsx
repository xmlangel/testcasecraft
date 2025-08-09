// src/components/TestCase/TestCaseSpreadsheet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  RemoveCircle as RemoveStepIcon,
  AddCircle as AddStepIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import Spreadsheet from 'react-spreadsheet';

const TestCaseSpreadsheet = ({ 
  data, 
  onChange, 
  onSave,
  readOnly = false,
  projectId 
}) => {
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // 동적 스텝 관리 상태
  const [maxSteps, setMaxSteps] = useState(3); // 기본 3개 스텝
  const [stepMenuAnchor, setStepMenuAnchor] = useState(null);
  const [stepSettingsOpen, setStepSettingsOpen] = useState(false);
  const [tempMaxSteps, setTempMaxSteps] = useState(3);

  // 동적 컬럼 라벨 생성 함수
  const generateColumnLabels = (stepCount) => {
    const baseColumns = ['이름', '설명', '사전조건', '예상결과'];
    const stepColumns = [];
    
    for (let i = 1; i <= stepCount; i++) {
      stepColumns.push(`Step ${i}`);
      stepColumns.push(`Expected ${i}`);
    }
    
    return [...baseColumns, ...stepColumns];
  };

  // 테스트케이스 데이터를 스프레드시트 형태로 변환
  useEffect(() => {
    if (!data || data.length === 0) {
      // 기본 빈 행들 생성 (10행)
      const baseFields = [
        { value: '' }, // 이름
        { value: '' }, // 설명
        { value: '' }, // 사전조건
        { value: '' }, // 예상결과
      ];
      
      const stepFields = [];
      for (let i = 0; i < maxSteps; i++) {
        stepFields.push({ value: '' }); // Step description
        stepFields.push({ value: '' }); // Step expected result
      }
      
      const emptyRow = [...baseFields, ...stepFields];
      const emptyRows = Array.from({ length: 10 }, () => [...emptyRow]);
      setSpreadsheetData(emptyRows);
      return;
    }

    // 기존 데이터에서 최대 스텝 수 자동 감지
    const maxStepsInData = Math.max(
      maxSteps, 
      ...data.map(tc => tc.steps?.length || 0)
    );
    
    if (maxStepsInData > maxSteps && maxStepsInData <= 10) {
      setMaxSteps(maxStepsInData);
      setTempMaxSteps(maxStepsInData);
    }

    // 실제 데이터를 스프레드시트 형태로 변환
    const convertedData = data.map(testCase => {
      const row = [
        { value: testCase.name || '' },
        { value: testCase.description || '' },
        { value: testCase.preCondition || '' },
        { value: testCase.expectedResults || '' },
      ];

      // Steps 추가 (동적 개수)
      for (let i = 0; i < maxSteps; i++) {
        const step = testCase.steps?.[i];
        row.push({ value: step?.description || '' });
        row.push({ value: step?.expectedResult || '' });
      }

      return row;
    });
    setSpreadsheetData(convertedData);
  }, [data, maxSteps]);

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = useCallback((newData) => {
    // 데이터가 실제로 변경되었는지 확인
    if (!newData || JSON.stringify(newData) === JSON.stringify(spreadsheetData)) {
      return;
    }

    setSpreadsheetData(newData);
    setHasChanges(true);
    
    if (onChange) {
      // 스프레드시트 데이터를 테스트케이스 형태로 변환
      const convertedTestCases = newData
        .filter(row => row.some(cell => cell?.value?.trim())) // 빈 행 제외
        .map((row, index) => {
          // 기존 데이터에서 ID 찾기 (순서 기반)
          const existingTestCase = data?.[index];
          
          const steps = [];
          
          // 동적 스텝 개수에 따라 변환
          for (let i = 0; i < maxSteps; i++) {
            const stepDescIndex = 4 + (i * 2);
            const stepExpectedIndex = 4 + (i * 2) + 1;
            
            const stepDesc = row[stepDescIndex]?.value || '';
            const stepExpected = row[stepExpectedIndex]?.value || '';
            
            if (stepDesc.trim()) { // 빈 스텝은 제외
              steps.push({
                stepNumber: i + 1,
                description: stepDesc,
                expectedResult: stepExpected,
              });
            }
          }

          return {
            id: existingTestCase?.id || `temp-${Date.now()}-${index}`,
            name: row[0]?.value || '',
            description: row[1]?.value || '',
            preCondition: row[2]?.value || '',
            expectedResults: row[3]?.value || '',
            steps: steps,
            type: 'testcase',
            displayOrder: index + 1,
            projectId: projectId,
            parentId: existingTestCase?.parentId || null,
          };
        });

      onChange(convertedTestCases);
    }
  }, [spreadsheetData, onChange, data, maxSteps, projectId]);

  // 행 추가 핸들러
  const handleAddRows = useCallback((count = 5) => {
    const baseFields = [
      { value: '' }, // 이름
      { value: '' }, // 설명
      { value: '' }, // 사전조건
      { value: '' }, // 예상결과
    ];
    
    const stepFields = [];
    for (let i = 0; i < maxSteps; i++) {
      stepFields.push({ value: '' }); // Step description
      stepFields.push({ value: '' }); // Step expected result
    }
    
    const emptyRow = [...baseFields, ...stepFields];
    const newRows = Array.from({ length: count }, () => [...emptyRow]);
    const updatedData = [...spreadsheetData, ...newRows];
    setSpreadsheetData(updatedData);
    setHasChanges(true);
  }, [spreadsheetData, maxSteps]);

  // 일괄 저장 핸들러
  const handleBulkSave = useCallback(async () => {
    if (!onSave || !hasChanges) return;
    
    setIsLoading(true);
    try {
      // 현재 스프레드시트 데이터를 변환하여 저장
      const convertedTestCases = spreadsheetData
        .filter(row => row.some(cell => cell?.value?.trim()))
        .map((row, index) => {
          const existingTestCase = data?.[index];
          
          const steps = [];
          
          // 동적 스텝 개수에 따라 변환
          for (let i = 0; i < maxSteps; i++) {
            const stepDescIndex = 4 + (i * 2);
            const stepExpectedIndex = 4 + (i * 2) + 1;
            
            const stepDesc = row[stepDescIndex]?.value || '';
            const stepExpected = row[stepExpectedIndex]?.value || '';
            
            if (stepDesc.trim()) { // 빈 스텝은 제외
              steps.push({
                stepNumber: i + 1,
                description: stepDesc,
                expectedResult: stepExpected,
              });
            }
          }

          return {
            id: existingTestCase?.id || `temp-${Date.now()}-${index}`,
            name: row[0]?.value || '',
            description: row[1]?.value || '',
            preCondition: row[2]?.value || '',
            expectedResults: row[3]?.value || '',
            steps: steps,
            type: 'testcase',
            displayOrder: index + 1,
            projectId: projectId,
            parentId: existingTestCase?.parentId || null,
          };
        });

      await onSave(convertedTestCases);
      setHasChanges(false);
      setSnackbarMessage(`${convertedTestCases.length}개의 테스트케이스가 저장되었습니다.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('저장 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onSave, hasChanges, spreadsheetData, data, maxSteps, projectId]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    // 원본 데이터로 복원
    const originalData = data || [];
    if (originalData.length === 0) {
      const baseFields = [
        { value: '' }, // 이름
        { value: '' }, // 설명
        { value: '' }, // 사전조건
        { value: '' }, // 예상결과
      ];
      
      const stepFields = [];
      for (let i = 0; i < maxSteps; i++) {
        stepFields.push({ value: '' }); // Step description
        stepFields.push({ value: '' }); // Step expected result
      }
      
      const emptyRow = [...baseFields, ...stepFields];
      const emptyRows = Array.from({ length: 10 }, () => [...emptyRow]);
      setSpreadsheetData(emptyRows);
    } else {
      const convertedData = originalData.map(testCase => {
        const row = [
          { value: testCase.name || '' },
          { value: testCase.description || '' },
          { value: testCase.preCondition || '' },
          { value: testCase.expectedResults || '' },
        ];

        // Steps 추가 (동적 개수)
        for (let i = 0; i < maxSteps; i++) {
          const step = testCase.steps?.[i];
          row.push({ value: step?.description || '' });
          row.push({ value: step?.expectedResult || '' });
        }

        return row;
      });
      setSpreadsheetData(convertedData);
    }
    setHasChanges(false);
  }, [data, maxSteps]);

  // 스텝 수 변경 핸들러들
  const handleStepMenuOpen = (event) => {
    setStepMenuAnchor(event.currentTarget);
  };

  const handleStepMenuClose = () => {
    setStepMenuAnchor(null);
  };

  const handleStepSettingsOpen = () => {
    setStepSettingsOpen(true);
    setTempMaxSteps(maxSteps);
    handleStepMenuClose();
  };

  const handleStepSettingsClose = () => {
    setStepSettingsOpen(false);
    setTempMaxSteps(maxSteps);
  };

  const handleStepCountChange = () => {
    if (tempMaxSteps >= 1 && tempMaxSteps <= 10 && tempMaxSteps !== maxSteps) {
      // 기존 데이터를 새로운 스텝 수에 맞게 조정
      const adjustedData = spreadsheetData.map(row => {
        // 기본 4개 컬럼은 유지
        const baseRow = row.slice(0, 4);
        
        // 기존 스텝 데이터 추출
        const existingSteps = [];
        const currentStepCount = Math.floor((row.length - 4) / 2);
        for (let i = 0; i < currentStepCount; i++) {
          existingSteps.push({
            description: row[4 + i * 2]?.value || '',
            expectedResult: row[4 + i * 2 + 1]?.value || ''
          });
        }
        
        // 새로운 스텝 수에 맞게 조정
        const newStepFields = [];
        for (let i = 0; i < tempMaxSteps; i++) {
          const existingStep = existingSteps[i];
          newStepFields.push({ value: existingStep?.description || '' });
          newStepFields.push({ value: existingStep?.expectedResult || '' });
        }
        
        return [...baseRow, ...newStepFields];
      });

      setMaxSteps(tempMaxSteps);
      setSpreadsheetData(adjustedData);
      setHasChanges(true);
      setSnackbarMessage(`스텝 수가 ${tempMaxSteps}개로 변경되었습니다.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
    setStepSettingsOpen(false);
  };

  const handleQuickStepChange = (delta) => {
    const newStepCount = Math.min(10, Math.max(1, maxSteps + delta));
    if (newStepCount !== maxSteps) {
      setTempMaxSteps(newStepCount);
      handleStepCountChange();
    }
    handleStepMenuClose();
  };

  // 컬럼 라벨 정의 (동적 생성)
  const columnLabels = generateColumnLabels(maxSteps);

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        {/* 헤더 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              테스트케이스 스프레드시트
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={`${spreadsheetData.filter(row => row.some(cell => cell?.value?.trim())).length}개 행`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`${maxSteps}개 스텝`} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
              {hasChanges && (
                <Chip 
                  label="변경됨" 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
          
          {/* 액션 버튼들 */}
          {!readOnly && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                새로고침
              </Button>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddRows(5)}
                disabled={isLoading}
              >
                행 추가
              </Button>
              
              {/* 스텝 관리 메뉴 */}
              <IconButton
                size="small"
                onClick={handleStepMenuOpen}
                disabled={isLoading}
                aria-label="스텝 관리"
              >
                <SettingsIcon />
              </IconButton>
              
              <Button
                variant="contained"
                size="small"
                startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleBulkSave}
                disabled={!hasChanges || isLoading || !onSave}
                color="primary"
              >
                {isLoading ? '저장 중...' : '일괄 저장'}
              </Button>
            </Box>
          )}
        </Box>

        {/* 사용법 안내 */}
        {!readOnly && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>사용법:</strong> Excel과 같이 셀을 클릭하여 직접 편집하세요. 
              Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.
              <br />
              <strong>스텝 관리:</strong> ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).
            </Typography>
          </Alert>
        )}

        {/* 스프레드시트 */}
        <Box sx={{ mt: 2, minHeight: 300, overflow: 'auto' }}>
          <Spreadsheet
            key={`spreadsheet-${maxSteps}-${projectId || 'no-project'}`}
            data={spreadsheetData}
            onChange={readOnly ? undefined : handleSpreadsheetChange}
            columnLabels={columnLabels}
          />
        </Box>

        {/* 하단 정보 */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            * 현재 {maxSteps}개 스텝으로 설정되어 있습니다. 최대 10개 스텝까지 확장 가능합니다.
          </Typography>
          
          {hasChanges && !readOnly && (
            <Typography variant="caption" color="warning.main">
              ⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 스텝 관리 메뉴 */}
      <Menu
        anchorEl={stepMenuAnchor}
        open={Boolean(stepMenuAnchor)}
        onClose={handleStepMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => handleQuickStepChange(1)} disabled={maxSteps >= 10}>
          <ListItemIcon>
            <AddStepIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>스텝 추가 ({maxSteps + 1}개)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleQuickStepChange(-1)} disabled={maxSteps <= 1}>
          <ListItemIcon>
            <RemoveStepIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>스텝 제거 ({maxSteps - 1}개)</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleStepSettingsOpen}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>스텝 수 직접 설정...</ListItemText>
        </MenuItem>
      </Menu>

      {/* 스텝 설정 다이얼로그 */}
      <Dialog
        open={stepSettingsOpen}
        onClose={handleStepSettingsClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>스텝 수 설정</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="스텝 수"
            type="number"
            fullWidth
            variant="outlined"
            value={tempMaxSteps}
            onChange={(e) => setTempMaxSteps(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            inputProps={{ min: 1, max: 10 }}
            helperText="1개부터 10개까지 설정 가능합니다."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStepSettingsClose}>취소</Button>
          <Button 
            onClick={handleStepCountChange} 
            variant="contained"
            disabled={tempMaxSteps === maxSteps}
          >
            적용
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

TestCaseSpreadsheet.propTypes = {
  data: PropTypes.array,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  readOnly: PropTypes.bool,
  projectId: PropTypes.string,
};

export default TestCaseSpreadsheet;