import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { listToTree } from '../../utils/treeUtils.jsx';
import PropTypes from 'prop-types';
import { useI18n } from '../../context/I18nContext.jsx';
import { debugLog } from '../../utils/logger';
import testCaseService from '../../services/testCaseService.js';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  useGridApiRef
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Save as SaveIcon,
  GridOn as GridIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistRemove as RemoveStepIcon
} from '@mui/icons-material';

// Custom Toolbar
function CustomToolbar({ onAddRow, onSave, hasChanges }) {
  const { t } = useI18n();
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flexGrow: 1 }} />
      <Button startIcon={<AddIcon />} onClick={onAddRow}>
        {t('testcase.spreadsheet.button.addRow', '행 추가')}
      </Button>
      <Button
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={!hasChanges}
        variant="contained"
        size="small"
        sx={{ ml: 1 }}
      >
        {t('common.save', '저장')}
      </Button>
    </GridToolbarContainer>
  );
}

const TestCaseDatasheetGrid = ({
  data,
  onChange,
  onSave,
  onRefresh,
  readOnly = false,
  projectId
}) => {
  const { t } = useI18n();
  const apiRef = useGridApiRef();
  const [gridRows, setGridRows] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [maxSteps, setMaxSteps] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [stepMenuAnchor, setStepMenuAnchor] = useState(null);
  const [stepSettingsOpen, setStepSettingsOpen] = useState(false);
  const [tempMaxSteps, setTempMaxSteps] = useState(3);

  // 트리 구조를 평면화하면서 트리 순서를 유지하는 함수
  const flattenTreeInOrder = useCallback((data) => {
    if (!data || data.length === 0) return [];

    // AI 생성 데이터 감지
    const isAIGeneratedData = data.some(item =>
      item.__isAIGenerated === true ||
      (item.id && item.id.startsWith('temp-ai-'))
    );

    if (isAIGeneratedData) {
      return data;
    }

    const treeData = listToTree(data, null);

    const flattenWithRenderTreeLogic = (nodes, result = []) => {
      let sortedNodes = nodes.slice();
      sortedNodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      sortedNodes.forEach(node => {
        result.push(node);
        if (Array.isArray(node.children) && node.children.length > 0) {
          flattenWithRenderTreeLogic(node.children, result);
        }
      });

      return result;
    };

    return flattenWithRenderTreeLogic(treeData);
  }, []);

  // 데이터 기반으로 최대 스텝 수 감지
  useEffect(() => {
    if (data && data.length > 0) {
      const maxStepsInData = Math.max(
        3,
        ...data.map(tc => tc.steps?.length || 0)
      );

      if (maxStepsInData > maxSteps && maxStepsInData <= 20) {
        setMaxSteps(maxStepsInData);
      }
    }
  }, [data, maxSteps]);

  // 데이터 변환: TestCase -> Grid Row
  const convertDataToGrid = useCallback((testCases) => {
    if (!testCases || testCases.length === 0) {
      return [];
    }

    const flattenedTestCases = flattenTreeInOrder(testCases);

    return flattenedTestCases.map((testCase, index) => {
      const row = {
        id: testCase.id || `temp - ${Date.now()} -${index} `,
        displayId: testCase.displayId || testCase.sequentialId || '',
        displayOrder: testCase.displayOrder || (index + 1) * 10,
        type: testCase.type === 'folder' ? 'folder' : 'testcase',
        parentFolder: testCase.parentId ? (flattenedTestCases.find(item => item.id === testCase.parentId)?.name || '') : '',
        name: testCase.name || '',
        description: testCase.description || '',
        preCondition: testCase.preCondition || '',
        postCondition: testCase.postCondition || '',
        expectedResults: testCase.expectedResults || '',
        isAutomated: testCase.isAutomated === true || testCase.isAutomated === 'Y',
        executionType: testCase.executionType || (testCase.isAutomated ? 'Automation' : 'Manual'),
        testTechnique: testCase.testTechnique || '',
        originalData: testCase
      };

      // 스텝 데이터 변환
      for (let i = 0; i < maxSteps; i++) {
        const stepNum = i + 1;
        if (testCase[`step${stepNum}_description`] !== undefined || testCase[`step${stepNum} _description`] !== undefined) {
          // AI generated flat structure
          row[`step${stepNum} _description`] = testCase[`step${stepNum}_description`] || testCase[`step${stepNum} _description`] || '';
          row[`step${stepNum} _expected`] = testCase[`step${stepNum}_expectedResult`] || testCase[`step${stepNum} _expectedResult`] || '';
        } else {
          // Standard structure
          const step = testCase.steps?.[i];
          row[`step${stepNum} _description`] = step?.description || '';
          row[`step${stepNum} _expected`] = step?.expectedResult || '';
        }
      }

      return row;
    });
  }, [flattenTreeInOrder, maxSteps]);

  // 초기 데이터 로드
  useEffect(() => {
    const newRows = convertDataToGrid(data);
    setGridRows(newRows);
    // AI 생성 데이터일 경우 저장 활성화
    if (data && data.length > 0 && data.some(item => item.__isAIGenerated === true)) {
      setHasChanges(true);
    }
  }, [data, convertDataToGrid]);

  // 컬럼 정의
  const columns = useMemo(() => {
    const baseColumns = [
      { field: 'displayId', headerName: 'ID', width: 90, editable: false },
      { field: 'displayOrder', headerName: t('testcase.spreadsheet.column.order', '순서'), width: 70, type: 'number', editable: true },
      {
        field: 'type',
        headerName: t('testcase.spreadsheet.column.type', '타입'),
        width: 100,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['folder', 'testcase']
      },
      { field: 'parentFolder', headerName: t('testcase.spreadsheet.column.parentFolder', '상위폴더'), width: 120, editable: true },
      { field: 'name', headerName: t('testcase.spreadsheet.column.name', '이름'), width: 200, editable: true },
      { field: 'description', headerName: t('testcase.spreadsheet.column.description', '설명'), width: 250, editable: true },
      { field: 'preCondition', headerName: t('testcase.spreadsheet.column.preCondition', '사전조건'), width: 200, editable: true },
      { field: 'postCondition', headerName: t('testcase.spreadsheet.column.postCondition', '사후조건'), width: 200, editable: true },
      { field: 'expectedResults', headerName: t('testcase.spreadsheet.column.expectedResults', '예상결과'), width: 200, editable: true },
      {
        field: 'isAutomated',
        headerName: t('testcase.spreadsheet.column.isAutomated', '자동화'),
        width: 100,
        type: 'boolean',
        editable: true
      },
      {
        field: 'executionType',
        headerName: 'Type',
        width: 120,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['Manual', 'Automation', 'Hybrid']
      },
      { field: 'testTechnique', headerName: t('testcase.spreadsheet.column.testTechnique', '기법'), width: 150, editable: true },
    ];

    const stepColumns = [];
    for (let i = 0; i < maxSteps; i++) {
      stepColumns.push(
        {
          field: `step${i + 1} _description`,
          headerName: t('testcase.spreadsheet.column.step', 'Step {number}', { number: i + 1 }),
          width: 200,
          editable: true
        },
        {
          field: `step${i + 1} _expected`,
          headerName: t('testcase.spreadsheet.column.expected', 'Expected {number}', { number: i + 1 }),
          width: 200,
          editable: true
        }
      );
    }

    return [...baseColumns, ...stepColumns];
  }, [t, maxSteps]);

  // 행 업데이트 처리
  const processRowUpdate = useCallback((newRow, oldRow) => {
    // 변경 사항이 있는지 확인
    const hasChanged = JSON.stringify(newRow) !== JSON.stringify(oldRow);

    if (hasChanged) {
      setHasChanges(true);
      // 그리드 상태 업데이트
      setGridRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? newRow : row)));

      // 상위 컴포넌트에 변경 알림 (선택적)
      if (onChange) {
        // 전체 데이터를 변환해서 보내는 것은 비용이 크므로, 나중에 저장 시점에 변환
      }
    }
    return newRow;
  }, [onChange]);

  // 행 추가 핸들러
  const handleAddRow = useCallback(() => {
    const id = `new- ${Date.now()} `;
    const newRow = {
      id,
      displayId: '',
      displayOrder: gridRows.length > 0 ? Math.max(...gridRows.map(r => r.displayOrder || 0)) + 10 : 10,
      type: 'testcase',
      parentFolder: '',
      name: '',
      description: '',
      preCondition: '',
      postCondition: '',
      expectedResults: '',
      isAutomated: false,
      executionType: 'Manual',
      testTechnique: ''
    };

    // 스텝 초기화
    for (let i = 0; i < maxSteps; i++) {
      newRow[`step${i + 1} _description`] = '';
      newRow[`step${i + 1} _expected`] = '';
    }

    setGridRows((prev) => [...prev, newRow]);
    setHasChanges(true);

    // 새 행으로 포커스 이동 (선택적)
    setTimeout(() => {
      apiRef.current.scrollToIndexes({ rowIndex: gridRows.length });
    }, 100);

  }, [gridRows, maxSteps, apiRef]);

  // 폴더명으로 폴더 ID 찾기
  const findFolderIdByName = useCallback((folderName, allData) => {
    if (!folderName || !folderName.trim()) return null;
    const folder = allData.find(item => item.type === 'folder' && item.name === folderName.trim());
    return folder ? folder.id : null;
  }, []);

  const [deletedIds, setDeletedIds] = useState(new Set());
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  // 행 삭제 핸들러
  const handleDeleteRows = useCallback(() => {
    if (rowSelectionModel.length === 0) return;

    const selectedIds = new Set(rowSelectionModel);

    // 삭제할 행 중 기존 데이터(DB에 있는) ID만 추적
    const newDeletedIds = new Set(deletedIds);
    rowSelectionModel.forEach(id => {
      if (!String(id).startsWith('temp-') && !String(id).startsWith('new-')) {
        newDeletedIds.add(id);
      }
    });
    setDeletedIds(newDeletedIds);

    // 그리드에서 제거
    setGridRows(prev => prev.filter(row => !selectedIds.has(row.id)));
    setRowSelectionModel([]);
    setHasChanges(true);
  }, [rowSelectionModel, deletedIds]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsLoading(true);

    try {
      // Grid Row -> TestCase Data 변환
      const convertedTestCases = gridRows.map((row, index) => {
        const steps = [];
        for (let i = 0; i < maxSteps; i++) {
          const desc = row[`step${i + 1} _description`];
          const exp = row[`step${i + 1} _expected`];
          if (desc || exp) {
            steps.push({
              stepNumber: i + 1,
              description: desc || '',
              expectedResult: exp || ''
            });
          }
        }

        // 상위 폴더 ID 찾기
        let parentId = row.originalData?.parentId || null;

        // 사용자가 폴더명을 변경했거나 비웠을 경우
        if (row.parentFolder !== undefined) {
          if (!row.parentFolder || row.parentFolder.trim() === '') {
            // 폴더명을 비웠으면 루트로 이동 (빈 문자열 전송)
            parentId = "";
          } else {
            // 폴더명이 있으면 ID 찾기
            // 현재 그리드 데이터 내에서 먼저 찾기 (새로 생성된 폴더일 수 있음)
            const parentInGrid = gridRows.find(r => r.type === 'folder' && r.name === row.parentFolder);
            if (parentInGrid) {
              parentId = parentInGrid.id; // 주의: 새 폴더의 경우 임시 ID일 수 있음. 백엔드 처리 필요.
            } else {
              // 원본 데이터에서 찾기
              parentId = findFolderIdByName(row.parentFolder, data || []);
            }
          }
        }

        // 디버깅 로그: 각 행의 변환 결과 확인
        debugLog('Spreadsheet', `Row ${index} (${row.name}): parentFolder = '${row.parentFolder}', parentId = '${parentId}'`);

        return {
          id: row.id.startsWith('temp-') || row.id.startsWith('new-') ? null : row.id,
          name: row.name,
          description: row.description,
          type: row.type,
          displayOrder: row.displayOrder,
          parentId: parentId,
          preCondition: row.preCondition,
          postCondition: row.postCondition,
          expectedResults: row.expectedResults,
          isAutomated: row.isAutomated,
          executionType: row.executionType,
          testTechnique: row.testTechnique,
          steps: steps,
          projectId: projectId
        };
      });

      // 유효성 검사 (이름 필수)
      const validTestCases = convertedTestCases.filter(tc => tc.name && tc.name.trim() !== '');

      debugLog('Spreadsheet', 'convertedTestCases:', convertedTestCases);
      debugLog('Spreadsheet', 'validTestCases:', validTestCases);
      debugLog('Spreadsheet', 'deletedIds:', Array.from(deletedIds));

      if (validTestCases.length === 0 && deletedIds.size === 0) {
        setSnackbarMessage(t('testcase.spreadsheet.message.noChanges', '저장할 데이터가 없습니다.'));
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      // 배치 저장 호출 (삭제 목록 포함)
      await onSave(validTestCases, Array.from(deletedIds));

      setHasChanges(false);
      setDeletedIds(new Set());
      setSnackbarMessage(t('common.saveSuccess', '저장되었습니다.'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Save error:', error);
      setSnackbarMessage(t('common.saveError', '저장 중 오류가 발생했습니다.'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh, t, gridRows, maxSteps, onSave, data, projectId, findFolderIdByName, deletedIds]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // 스텝 관리 핸들러들
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

  // 스텝 수 변경 핸들러
  const handleStepCountChange = () => {
    if (tempMaxSteps >= 1 && tempMaxSteps <= 20 && tempMaxSteps !== maxSteps) {
      // 기존 데이터 유지하면서 스텝 수 조정
      const adjustedData = gridRows.map(row => {
        const newRow = { ...row };

        // 새로운 스텝 필드 추가 또는 기존 필드 제거
        if (tempMaxSteps > maxSteps) {
          // 스텝 추가
          for (let i = maxSteps; i < tempMaxSteps; i++) {
            newRow[`step${i + 1} _description`] = '';
            newRow[`step${i + 1} _expected`] = '';
          }
        } else if (tempMaxSteps < maxSteps) {
          // 스텝 제거
          for (let i = tempMaxSteps; i < maxSteps; i++) {
            delete newRow[`step${i + 1} _description`];
            delete newRow[`step${i + 1} _expected`];
          }
        }

        return newRow;
      });

      setGridRows(adjustedData);
      setMaxSteps(tempMaxSteps);
      setHasChanges(true);
      setSnackbarMessage(t('testcase.spreadsheet.notification.stepChanged', '스텝 수가 {count}개로 변경되었습니다.').replace('{count}', tempMaxSteps));
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
    setStepSettingsOpen(false);
  };

  const handleQuickStepChange = (delta) => {
    const newStepCount = Math.min(20, Math.max(1, maxSteps + delta));
    if (newStepCount !== maxSteps) {
      setTempMaxSteps(newStepCount);
      // 바로 적용
      setTimeout(() => {
        handleStepCountChange();
      }, 0);
    }
    handleStepMenuClose();
  };


  return (
    <Card sx={{ minHeight: 500 }}>
      <CardContent>
        {/* 헤더 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GridIcon color="primary" />
              {t('testcase.spreadsheet.header.title', '테스트케이스 스프레드시트')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={t('testcase.spreadsheet.status.rows', '{count}개 행', { count: gridRows.filter(row => row.name?.trim() || Object.values(row).some(val => typeof val === 'string' && val.trim())).length })}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={t('testcase.spreadsheet.status.steps', '{count}개 스텝', { count: maxSteps })}
                size="small"
                variant="outlined"
                color="secondary"
              />
              <Chip
                label={t('testcase.spreadsheet.status.batchEdit', '대량 편집')}
                size="small"
                variant="outlined"
                color="success"
              />
              {hasChanges && (
                <Chip
                  label={t('testcase.spreadsheet.status.changed', '변경됨')}
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
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {t('testcase.spreadsheet.button.refresh', '새로고침')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<RemoveStepIcon />}
                onClick={handleDeleteRows}
                disabled={isLoading || rowSelectionModel.length === 0}
              >
                {t('testcase.spreadsheet.button.deleteRows', '선택 삭제')}
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                disabled={isLoading}
              >
                {t('testcase.spreadsheet.button.addRows', '행 추가')}
              </Button>

              {/* 스텝 관리 메뉴 */}
              <IconButton
                size="small"
                onClick={handleStepMenuOpen}
                disabled={isLoading}
                aria-label={t('testcase.spreadsheet.button.stepManagement', '스텝 관리')}
              >
                <SettingsIcon />
              </IconButton>

              <Button
                variant="contained"
                size="small"
                startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!hasChanges || isLoading || !onSave}
                color="primary"
              >
                {isLoading ? t('testcase.spreadsheet.button.saving', '저장 중...') : t('testcase.spreadsheet.button.save', '일괄 저장')}
              </Button>
            </Box>
          )}
        </Box>

        {/* 사용법 안내 */}
        {!readOnly && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{t('testcase.advancedGrid.features.title', '고급 기능:')}</strong> {t('testcase.advancedGrid.features.edit', '더블 클릭으로 셀 편집, Enter로 편집 완료 및 다음 행 이동, Tab으로 다음 셀 이동.')}
              <br />
              <strong>{t('testcase.advancedGrid.multiSelect.title', '다중 선택:')}</strong> {t('testcase.advancedGrid.multiSelect.range', '체크박스로 여러 행을 선택하여 일괄 삭제할 수 있습니다.')}
              <br />
              <strong>{t('testcase.advancedGrid.tips.title', '팁:')}</strong> {t('testcase.advancedGrid.tips.multiline', '여러 줄 입력이 필요한 경우 일반 입력 모드를 사용하세요.')}
            </Typography>
          </Alert>
        )}

        {/* DataGrid */}
        <Box sx={{ mt: 2, height: 600, width: '100%' }}>
          <DataGrid
            apiRef={apiRef}
            rows={gridRows}
            columns={columns}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.error('Row update error:', error)}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => setRowSelectionModel(newSelection)}
            rowSelectionModel={rowSelectionModel}
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: { onAddRow: handleAddRow, onSave: handleSave, hasChanges },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 100, page: 0 },
              },
            }}
            pageSizeOptions={[25, 50, 100]}
            sx={{
              '& .MuiDataGrid-cell': {
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                lineHeight: '1.5',
                padding: '8px',
                display: 'flex',
                alignItems: 'center'
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f5f5',
                fontWeight: 'bold',
                color: (theme) => theme.palette.text.primary,
              }
            }}
          />
        </Box>

        {/* 하단 정보 */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('testcase.spreadsheet.footer.info', '* MUI DataGrid 기반 고급 스프레드시트 • {count}개 스텝 • 효율적인 대량 편집 지원', { count: maxSteps })}
          </Typography>

          {hasChanges && !readOnly && (
            <Typography variant="caption" color="warning.main">
              {t('testcase.spreadsheet.footer.warning', '⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.')}
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
        <MenuItem onClick={() => handleQuickStepChange(1)} disabled={maxSteps >= 20}>
          <ListItemIcon>
            <AddStepIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('testcase.spreadsheet.stepMenu.addStep', '스텝 추가 ({count}개)', { count: maxSteps + 1 })}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleQuickStepChange(-1)} disabled={maxSteps <= 1}>
          <ListItemIcon>
            <RemoveStepIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('testcase.spreadsheet.stepMenu.removeStep', '스텝 제거 ({count}개)', { count: maxSteps - 1 })}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleStepSettingsOpen}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('testcase.spreadsheet.stepMenu.settings', '스텝 수 직접 설정...')}</ListItemText>
        </MenuItem>
      </Menu>
      {/* 스텝 설정 다이얼로그 */}
      <Dialog
        open={stepSettingsOpen}
        onClose={handleStepSettingsClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('testcase.spreadsheet.stepDialog.title', '스텝 수 설정')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('testcase.spreadsheet.stepDialog.description', '테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('testcase.spreadsheet.stepDialog.label', '스텝 수')}
            type="number"
            fullWidth
            variant="outlined"
            value={tempMaxSteps}
            onChange={(e) => setTempMaxSteps(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            helperText={t('testcase.spreadsheet.stepDialog.helper', '1개부터 20개까지 설정 가능합니다.')}
            slotProps={{
              htmlInput: { min: 1, max: 20 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStepSettingsClose}>{t('testcase.spreadsheet.stepDialog.cancel', '취소')}</Button>
          <Button
            onClick={handleStepCountChange}
            variant="contained"
            disabled={tempMaxSteps === maxSteps}
          >
            {t('testcase.spreadsheet.stepDialog.apply', '적용')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

TestCaseDatasheetGrid.propTypes = {
  data: PropTypes.array,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  onRefresh: PropTypes.func,
  readOnly: PropTypes.bool,
  projectId: PropTypes.string,
};

export default TestCaseDatasheetGrid;
