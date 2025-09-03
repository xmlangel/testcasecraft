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
  Settings as SettingsIcon,
  Folder as FolderIcon,
  CreateNewFolder as CreateNewFolderIcon
} from '@mui/icons-material';
import Spreadsheet from 'react-spreadsheet';

const TestCaseSpreadsheet = ({
  data,
  onChange,
  onSave,
  onRefresh,
  readOnly = false,
  projectId
}) => {
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [renderError, setRenderError] = useState(null);

  // 디버깅: 컴포넌트 마운트 확인
  useEffect(() => {
    console.log('[TestCaseSpreadsheet] 컴포넌트 마운트됨', { data: data?.length, projectId });
  }, []);

  // 동적 스텝 관리 상태
  const [maxSteps, setMaxSteps] = useState(3); // 기본 3개 스텝
  const [stepMenuAnchor, setStepMenuAnchor] = useState(null);
  const [stepSettingsOpen, setStepSettingsOpen] = useState(false);
  const [tempMaxSteps, setTempMaxSteps] = useState(3);
  const [spreadsheetKey, setSpreadsheetKey] = useState(0);

  // 폴더 관련 상태
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  // 폴더 감지 유틸리티 함수 (ICT-339: 7컬럼 구조)
  const isFolderRow = (row) => {
    const cellValue = row[1]?.value;
    const typeValue = typeof cellValue === 'string' ? cellValue.trim().toLowerCase() : '';
    return typeValue === '폴더' || typeValue === 'folder' || typeValue === '📁';
  };

  // 폴더명 추출 함수 (ICT-339: 7컬럼 구조 - ID, 타입, 상위폴더, 이름, 설명, 사전조건, 예상결과)
  const extractFolderName = (row) => {
    // 네 번째 컬럼(이름)에서 폴더명을 직접 가져옴
    const cellValue = row[3]?.value;
    return typeof cellValue === 'string' ? cellValue.trim() : '';
  };

  // 상위 폴더 추출 함수 (ICT-339: 7컬럼 구조)
  const extractParentFolder = (row) => {
    const cellValue = row[2]?.value;
    return typeof cellValue === 'string' && cellValue.trim() ? cellValue.trim() : null;
  };

  // 동적 컬럼 라벨 생성 함수 (ICT-339: 순차 ID 컬럼 추가)
  const generateColumnLabels = (stepCount) => {
    const baseColumns = ['ID', '타입', '상위폴더', '이름', '설명', '사전조건', '예상결과'];
    const stepColumns = [];

    for (let i = 1; i <= stepCount; i++) {
      stepColumns.push(`Step ${i}`);
      stepColumns.push(`Expected ${i}`);
    }

    return [...baseColumns, ...stepColumns];
  };

  // 데이터 기반으로 최대 스텝 수 감지 (한 번만 실행)
  useEffect(() => {
    if (data && data.length > 0) {
      const maxStepsInData = Math.max(
        3, // 최소 3개
        ...data.map(tc => tc.steps?.length || 0)
      );
      
      if (maxStepsInData > maxSteps && maxStepsInData <= 10) {
        setMaxSteps(maxStepsInData);
        setTempMaxSteps(maxStepsInData);
      }
    }
  }, [data, maxSteps]); // 의존성 추가하되 조건 체크로 무한 루프 방지

  // 테스트케이스 데이터를 스프레드시트 형태로 변환
  useEffect(() => {
    if (!data || data.length === 0) {
      // 기본 빈 행들 생성 (10행) - ICT-339: 7컬럼 구조
      const baseFields = [
        { value: '' }, // ID (순차 ID)
        { value: '' }, // 타입
        { value: '' }, // 상위폴더
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

    // 실제 데이터를 스프레드시트 형태로 변환 - 7컬럼 구조 (ICT-339: 순차 ID 추가)
    const convertedData = data.map(testCase => {
      const row = [
        { value: testCase.sequentialId || '' }, // ID (순차 ID)
        { value: testCase.type === 'folder' ? '폴더' : '테스트케이스' }, // 타입
        { value: testCase.parentId ? (data.find(item => item.id === testCase.parentId)?.name || '') : '' }, // 상위폴더 (ICT-343: 실제 상위폴더명 표시)
        { value: testCase.name || '' }, // 이름
        { value: testCase.description || '' }, // 설명
        { value: testCase.preCondition || '' }, // 사전조건
        { value: testCase.expectedResults || '' }, // 예상결과
      ];

      // Steps 추가 (동적 개수) - 폴더는 스텝 없음
      for (let i = 0; i < maxSteps; i++) {
        if (testCase.type === 'folder') {
          row.push({ value: '' }); // 폴더는 스텝 없음
          row.push({ value: '' });
        } else {
          const step = testCase.steps?.[i];
          row.push({ value: step?.description || '' });
          row.push({ value: step?.expectedResult || '' });
        }
      }

      return row;
    });
    setSpreadsheetData(convertedData);
  }, [data, maxSteps]);

  // 스프레드시트 데이터 변경 핸들러 (무한 루프 방지)
  const handleSpreadsheetChange = useCallback((newData) => {
    // 데이터가 실제로 변경되었는지 확인
    if (!newData || JSON.stringify(newData) === JSON.stringify(spreadsheetData)) {
      return;
    }

    // 로컬 상태만 업데이트, onChange는 호출하지 않음
    setSpreadsheetData(newData);
    setHasChanges(true);
    
    // onChange는 일괄 저장 시에만 호출하도록 변경
    // 이렇게 하면 실시간으로 부모 상태를 업데이트하지 않아서 무한 루프 방지
  }, [spreadsheetData]);

  // 행 추가 핸들러 - 폴더셀 방식
  const handleAddRows = useCallback((count = 5) => {
    setSpreadsheetData(prevData => {
      const baseFields = [
        { value: '' }, // ID (순차 ID)
        { value: '' }, // 타입
        { value: '' }, // 상위폴더
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
      return [...prevData, ...newRows];
    });
    setHasChanges(true);
  }, [maxSteps]);

  // 폴더 추가 핸들러
  const handleAddFolder = () => {
    setFolderDialogOpen(true);
  };

  const handleFolderDialogClose = () => {
    setFolderDialogOpen(false);
    setFolderName('');
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;

    const folderRow = [
      { value: '' }, // ID (순차 ID) - 서버에서 자동 할당
      { value: '폴더' }, // 타입
      { value: '' }, // 상위폴더
      { value: folderName }, // 이름 (아이콘 없이 순수 폴더명)
      { value: `${folderName} 폴더` }, // 설명
      { value: '' }, // 사전조건 (폴더는 빈값)
      { value: '' }, // 예상결과 (폴더는 빈값)
    ];

    // 스텝 필드 추가 (빈값)
    for (let i = 0; i < maxSteps; i++) {
      folderRow.push({ value: '' }); // Step description
      folderRow.push({ value: '' }); // Step expected result
    }

    setSpreadsheetData(prevData => [folderRow, ...prevData]);
    setHasChanges(true);
    setSnackbarMessage(`폴더 "${folderName}"이 추가되었습니다.`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
    
    handleFolderDialogClose();
  };

  // 폴더명으로 폴더 ID를 찾는 헬퍼 함수 (ICT-343: 상위폴더 지정 기능)
  const findFolderIdByName = useCallback((folderName, allData) => {
    if (!folderName || !folderName.trim()) return null;
    
    // 현재 프로젝트의 폴더 중에서 이름이 일치하는 폴더 찾기
    const folder = allData.find(item => 
      item.type === 'folder' && 
      item.name === folderName.trim()
    );
    
    return folder ? folder.id : null;
  }, []);

  // 일괄 저장 핸들러 (폴더 지원 추가)
  const handleBulkSave = useCallback(async () => {
    if (!onSave || !hasChanges) return;

    setIsLoading(true);
    try {
      // 현재 스프레드시트 데이터를 변환 (상태 업데이트와 분리)
      const convertedTestCases = spreadsheetData
        .filter(row => row.some(cell => 
          typeof cell?.value === 'string' && cell.value.trim()
        ))
        .map((row, index) => {
          const existingTestCase = data?.[index];
          
          // 폴더인지 테스트케이스인지 판단 - 폴더셀 방식
          const isFolder = isFolderRow(row);
          
          let steps = [];
          let name = row[3]?.value || ''; // 네 번째 셀(이름)에서 이름 가져오기 (ICT-339: ID 컬럼 추가로 인덱스 +1)
          let parentFolderName = extractParentFolder(row); // 상위폴더 추출 (ICT-343)
          
          if (isFolder) {
            // 폴더인 경우: 이름은 이미 가져왔음
            // name은 이미 설정됨
          } else {
            // 테스트케이스인 경우: 스텝 처리
            for (let i = 0; i < maxSteps; i++) {
              const stepDescIndex = 7 + (i * 2); // 7컬럼 구조로 인덱스 업데이트 (ICT-339)
              const stepExpectedIndex = 7 + (i * 2) + 1;

              const stepDesc = row[stepDescIndex]?.value || '';
              const stepExpected = row[stepExpectedIndex]?.value || '';

              if (typeof stepDesc === 'string' && stepDesc.trim()) { // 빈 스텝은 제외
                steps.push({
                  stepNumber: i + 1,
                  description: stepDesc,
                  expectedResult: stepExpected,
                });
              }
            }
          }

          return {
            id: existingTestCase?.id || `temp-${Date.now()}-${index}`,
            sequentialId: existingTestCase?.sequentialId || null, // ICT-339: 새 테스트케이스는 백엔드에서 자동 할당
            name: name,
            description: isFolder ? `${name} 폴더` : (row[4]?.value || ''), // 설명 컬럼 (ICT-339: 인덱스 +1)
            preCondition: isFolder ? '' : (row[5]?.value || ''), // 사전조건 컬럼 (ICT-339: 인덱스 +1)
            expectedResults: isFolder ? '' : (row[6]?.value || ''), // 예상결과 컬럼 (ICT-339: 인덱스 +1)
            steps: steps,
            type: isFolder ? 'folder' : 'testcase',
            displayOrder: index + 1,
            projectId: projectId,
            parentId: parentFolderName ? findFolderIdByName(parentFolderName, data || []) : (existingTestCase?.parentId || null), // ICT-343: 상위폴더명을 실제 폴더 ID로 변환
          };
        });

      // 저장 실행 (상태 업데이트와 완전 분리)
      await onSave(convertedTestCases);
      
      // 성공 시 상태 업데이트
      setHasChanges(false);
      const folderCount = convertedTestCases.filter(tc => tc.type === 'folder').length;
      const testCaseCount = convertedTestCases.filter(tc => tc.type === 'testcase').length;
      setSnackbarMessage(`저장 완료: 폴더 ${folderCount}개, 테스트케이스 ${testCaseCount}개`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error) {
      setSnackbarMessage('저장 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onSave, hasChanges, spreadsheetData, data, maxSteps, projectId, isFolderRow, extractFolderName]);

  // 새로고침 핸들러 (ICT-158: 백엔드에서 최신 데이터 가져오기)
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsLoading(true);
      try {
        console.log('[ICT-158] 스프레드시트 새로고침: 백엔드에서 최신 데이터 가져오기 시작');
        await onRefresh();
        setHasChanges(false);
        setSnackbarMessage('최신 데이터로 새로고침되었습니다.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        console.log('[ICT-158] 스프레드시트 새로고침 완료');
      } catch (error) {
        console.error('[ICT-158] 새로고침 실패:', error);
        setSnackbarMessage('새로고침 중 오류가 발생했습니다: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // onRefresh가 없는 경우 기존 방식으로 폴백
      console.log('[ICT-158] onRefresh 함수가 없어 로컬 데이터로 복원');
      const originalData = data || [];
      if (originalData.length === 0) {
        const baseFields = [
          { value: '' }, // ID (순차 ID)
          { value: '' }, // 타입
          { value: '' }, // 상위폴더
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
            { value: testCase.sequentialId || '' }, // ID (순차 ID) - ICT-339: 백엔드에서 할당된 순차 ID 표시
            { value: testCase.type === 'folder' ? '폴더' : '테스트케이스' }, // 타입
            { value: testCase.parentId ? (originalData.find(item => item.id === testCase.parentId)?.name || '') : '' }, // 상위폴더 (ICT-343: 실제 상위폴더명 표시)
            { value: testCase.name || '' }, // 이름
            { value: testCase.description || '' }, // 설명
            { value: testCase.preCondition || '' }, // 사전조건
            { value: testCase.expectedResults || '' }, // 예상결과
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
    }
  }, [data, maxSteps, onRefresh]);

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

  // 특정 값으로 스텝 수 변경 (즉시 실행)
  const handleStepCountChangeWithValue = (newStepCount) => {
    if (newStepCount >= 1 && newStepCount <= 10 && newStepCount !== maxSteps) {
      // 기존 데이터를 새로운 스텝 수에 맞게 조정
      setSpreadsheetData(currentData => {
        const adjustedData = currentData.map(row => {
          // 기본 7개 컬럼은 유지 (ID, 타입, 상위폴더, 이름, 설명, 사전조건, 예상결과) - ICT-339
          const baseRow = row.slice(0, 7);

          // 기존 스텝 데이터 추출 (ICT-339: 7컬럼 구조)
          const existingSteps = [];
          const currentStepCount = Math.floor((row.length - 7) / 2);
          for (let i = 0; i < currentStepCount; i++) {
            existingSteps.push({
              description: row[7 + i * 2]?.value || '',
              expectedResult: row[7 + i * 2 + 1]?.value || ''
            });
          }

          // 새로운 스텝 수에 맞게 조정
          const newStepFields = [];
          for (let i = 0; i < newStepCount; i++) {
            const existingStep = existingSteps[i];
            newStepFields.push({ value: existingStep?.description || '' });
            newStepFields.push({ value: existingStep?.expectedResult || '' });
          }

          return [...baseRow, ...newStepFields];
        });
        
        return adjustedData;
      });

      setMaxSteps(newStepCount);
      setTempMaxSteps(newStepCount);
      setSpreadsheetKey(prev => prev + 1); // 스프레드시트 강제 리렌더링
      setHasChanges(true);
      setSnackbarMessage(`스텝 수가 ${newStepCount}개로 변경되었습니다.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };

  const handleStepCountChange = () => {
    handleStepCountChangeWithValue(tempMaxSteps);
    setStepSettingsOpen(false);
  };

  const handleQuickStepChange = (delta) => {
    const newStepCount = Math.min(10, Math.max(1, maxSteps + delta));
    if (newStepCount !== maxSteps) {
      // tempMaxSteps 업데이트 후 즉시 스텝 변경 로직 실행
      handleStepCountChangeWithValue(newStepCount);
    }
    handleStepMenuClose();
  };

  // 컬럼 라벨 정의 (동적 생성)
  const columnLabels = generateColumnLabels(maxSteps);

  // 에러 발생 시 에러 메시지 표시
  if (renderError) {
    return (
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">스프레드시트 렌더링 오류</Typography>
            <Typography variant="body2">{renderError.message}</Typography>
            <Button 
              variant="contained" 
              onClick={() => setRenderError(null)}
              sx={{ mt: 1 }}
            >
              다시 시도
            </Button>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 데이터 유효성 검사
  if (!Array.isArray(data)) {
    console.warn('[TestCaseSpreadsheet] data가 배열이 아닙니다:', data);
    return (
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6">데이터 로딩 중...</Typography>
            <Typography variant="body2">테스트케이스 데이터를 불러오고 있습니다.</Typography>
            <CircularProgress sx={{ mt: 1 }} />
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
                label={`${spreadsheetData.filter(row => row.some(cell => 
                  typeof cell?.value === 'string' && cell.value.trim()
                )).length}개 행`}
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
              
              <Button
                size="small"
                startIcon={<CreateNewFolderIcon />}
                onClick={handleAddFolder}
                disabled={isLoading}
                color="secondary"
              >
                폴더 추가
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
              <strong>폴더 기능:</strong> "폴더 추가" 버튼을 클릭하거나 이름 셀에 "📁 폴더명" 형태로 입력하면 폴더가 생성됩니다.
              <br />
              <strong>스텝 관리:</strong> ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).
            </Typography>
          </Alert>
        )}

        {/* 스프레드시트 */}
        <Box sx={{ mt: 2, minHeight: 300, overflow: 'auto' }}>
          <Spreadsheet
            key={`spreadsheet-${projectId || 'default'}-${maxSteps}-${spreadsheetKey}`}
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

      {/* 폴더 생성 다이얼로그 */}
      <Dialog
        open={folderDialogOpen}
        onClose={handleFolderDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>새 폴더 생성</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="폴더명"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && folderName.trim()) {
                handleCreateFolder();
              }
            }}
            placeholder="예: API 테스트, UI 테스트"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFolderDialogClose}>취소</Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained" 
            disabled={!folderName.trim()}
            startIcon={<CreateNewFolderIcon />}
          >
            생성
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
  onRefresh: PropTypes.func,
  readOnly: PropTypes.bool,
  projectId: PropTypes.string,
};

export default TestCaseSpreadsheet;