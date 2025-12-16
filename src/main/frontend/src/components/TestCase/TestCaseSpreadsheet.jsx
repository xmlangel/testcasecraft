// src/components/TestCase/TestCaseSpreadsheet.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { logWarn, logError, debugLog } from '../../utils/logger.js';
import { useI18n } from '../../context/I18nContext.jsx';
import testCaseService from '../../services/testCaseService.js';
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
  useTheme,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  RemoveCircle as RemoveStepIcon,
  AddCircle as AddStepIcon,
  Settings as SettingsIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import Spreadsheet from 'react-spreadsheet';

// 분리된 모듈 imports
import {
  flattenTreeInOrder,
  isFolderRow,
  extractFolderName,
  extractParentFolder,
  generateColumnLabels
} from './Spreadsheet/utils/SpreadsheetUtils.js';
import { getAllDescendants } from '../../utils/treeUtils.jsx';
import {
  findFolderIdByName,
  sortFoldersByHierarchy
} from './Spreadsheet/utils/FolderManagement.js';
import {
  validateSpreadsheetData,
  applyValidationStyling
} from './Spreadsheet/utils/SpreadsheetValidation.js';
import {
  exportToCSV,
  exportToExcel
} from './Spreadsheet/handlers/SpreadsheetExport.js';
import {
  StepSettingsDialog,
  FolderCreateDialog,
  ValidationResultDialog
} from './Spreadsheet/components/SpreadsheetDialogs.jsx';
import { DeleteConfirmationDialog } from './Spreadsheet/components/DeleteConfirmationDialog.jsx';
import KoreanAwareDataEditor from './Spreadsheet/components/KoreanAwareDataEditor.jsx';

const TestCaseSpreadsheet = ({
  data,
  onChange,
  onSave,
  onRefresh,
  readOnly = false,
  projectId,
  isLoading: externalLoading = false
}) => {
  const { t } = useI18n();
  const theme = useTheme();



  // 상태 관리
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = localLoading || externalLoading;
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [renderError, setRenderError] = useState(null);

  // 검증 관련 상태
  const [validationResult, setValidationResult] = useState(null);
  const [validationPanelOpen, setValidationPanelOpen] = useState(false);
  const [styledSpreadsheetData, setStyledSpreadsheetData] = useState([]);

  // 스텝 관리 상태
  const [maxSteps, setMaxSteps] = useState(3);
  const [stepMenuAnchor, setStepMenuAnchor] = useState(null);
  const [stepSettingsOpen, setStepSettingsOpen] = useState(false);
  const [tempMaxSteps, setTempMaxSteps] = useState(3);
  const [spreadsheetKey, setSpreadsheetKey] = useState(0);

  // 폴더 관련 상태
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  // 사용법 안내 펼침 상태
  const [usageExpanded, setUsageExpanded] = useState(false);

  // 전체화면 상태
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Export 관련 상태
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // 행 선택 관련 상태 (ICT-414)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const selectedRowIndexRef = useRef(null); // ref로도 관리하여 불필요한 재렌더링 방지
  const [selectedRange, setSelectedRange] = useState(null);
  const selectedRangeRef = useRef(null);

  // 삭제 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowsToDelete, setRowsToDelete] = useState([]);
  const [deleteTargetRange, setDeleteTargetRange] = useState(null);

  // 이전 데이터 참조
  const prevDataRef = useRef();

  // 컬럼 라벨 메모이제이션
  const memoizedColumnLabels = useMemo(() => generateColumnLabels(maxSteps, t), [maxSteps, t]);

  // 데이터 ID 문자열 생성 (깊은 비교용) - 실제 내용 기반 비교
  // ICT-414: displayOrder 제외 - 순서 변경이 재렌더링을 유발하지 않도록 함
  const dataIdString = useMemo(() => {
    if (!data || data.length === 0) return 'empty';
    return data.map(tc => `${tc.id}-${tc.name}-${tc.updatedAt || ''}`).join('|');
  }, [data]);

  // 데이터 기반으로 최대 스텝 수 감지
  useEffect(() => {
    if (data && data.length > 0) {
      const stepsLengths = data.map(tc => tc.steps?.length || 0).filter(len => Number.isFinite(len));
      const maxStepsInData = stepsLengths.length > 0 ? Math.max(3, ...stepsLengths) : 3;
      const validMaxSteps = Math.min(20, Math.max(1, maxStepsInData));

      if (validMaxSteps > maxSteps && validMaxSteps <= 20 && Number.isFinite(validMaxSteps)) {
        setMaxSteps(validMaxSteps);
        setTempMaxSteps(validMaxSteps);
      }
    }
  }, [data, maxSteps]);



  // 테스트케이스 데이터를 스프레드시트 형태로 변환 (useMemo로 메모이제이션)
  const memoizedSpreadsheetData = useMemo(() => {
    debugLog('Spreadsheet', '🔄 데이터 변환 시작:', data?.length, '개 테스트케이스, maxSteps:', maxSteps, 'dataId:', dataIdString);

    const safeMaxSteps = Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;

    if (!data || data.length === 0) {
      // 기본 빈 행들 생성
      const baseFields = [
        { value: '' }, // ID
        { value: '', readOnly: true }, // 작성자
        { value: '', readOnly: true }, // 수정자
        { value: '', readOnly: true }, // 순서 (ICT-414: readOnly로 변경 - 백엔드에서만 관리)
        { value: '' }, // 타입
        { value: '' }, // 상위폴더
        { value: '' }, // 이름
        { value: '' }, // 설명
        { value: '' }, // 사전조건
        { value: '' }, // 사후조건
        { value: '' }, // 예상결과
        { value: '' }, // 우선순위
        { value: '' }, // 수행유형
        { value: '' }, // 테스트기법
        { value: '' }, // 태그
      ];

      const stepFields = [];
      for (let i = 0; i < safeMaxSteps; i++) {
        stepFields.push({ value: '' });
        stepFields.push({ value: '' });
      }

      const emptyRow = [...baseFields, ...stepFields];
      const emptyRows = Array.from({ length: 10 }, () => [...emptyRow]);
      debugLog('Spreadsheet', '✅ 빈 데이터 생성');
      return emptyRows;
    }

    // 트리 구조를 평면화하면서 트리 순서를 유지
    const flattenedData = flattenTreeInOrder(data);

    const convertedData = flattenedData.map(testCase => {
      // 안전한 상위폴더명 추출
      let parentFolderName = '';
      if (testCase.parentId) {
        const parentFolder = data.find(item => item.id === testCase.parentId);
        parentFolderName = parentFolder?.name || '';
      }

      // ICT-414: displayOrder를 readOnly로 설정 - 백엔드에서만 관리
      const row = [
        { value: testCase.displayId || testCase.sequentialId || '', readOnly: true, testCaseId: testCase.id },
        { value: testCase.createdBy || '', readOnly: true },
        { value: testCase.updatedBy || '', readOnly: true },
        { value: testCase.displayOrder || '', readOnly: true }, // readOnly 추가
        { value: testCase.type === 'folder' ? t('testcase.type.folder', '폴더') : t('testcase.type.testcase', '테스트케이스'), readOnly: true },
        { value: parentFolderName || '' },
        { value: testCase.name || '' },
        { value: testCase.description || '' },
        { value: testCase.preCondition || '', readOnly: testCase.type === 'folder' },
        { value: testCase.postCondition || '', readOnly: testCase.type === 'folder' },
        { value: testCase.expectedResults || '', readOnly: testCase.type === 'folder' },
        { value: testCase.type === 'folder' ? '' : (testCase.priority || 'MEDIUM'), readOnly: testCase.type === 'folder' },
        { value: testCase.type === 'folder' ? '' : (testCase.executionType || 'Manual'), readOnly: testCase.type === 'folder' },
        { value: testCase.testTechnique || '', readOnly: testCase.type === 'folder' },
        { value: Array.isArray(testCase.tags) ? testCase.tags.join(', ') : (testCase.tags || ''), readOnly: testCase.type === 'folder' },
      ];

      // Steps 추가
      for (let i = 0; i < safeMaxSteps; i++) {
        if (testCase.type === 'folder') {
          row.push({ value: '', readOnly: true });
          row.push({ value: '', readOnly: true });
        } else {
          const step = testCase.steps?.[i];
          row.push({ value: step?.description || '' });
          row.push({ value: step?.expectedResult || '' });
        }
      }

      return row;
    });

    debugLog('Spreadsheet', '✅ 데이터 변환 완료 (메모이제이션):', convertedData.length, '행');
    return convertedData;
  }, [dataIdString, maxSteps, t]); // dataIdString을 의존성으로 사용하여 실제 내용이 변경되었을 때만 재계산

  // 메모이제이션된 데이터를 state에 동기화
  useEffect(() => {
    if (!hasChanges) {
      // Deep check to prevent unnecessary re-renders
      const isDifferent = JSON.stringify(memoizedSpreadsheetData) !== JSON.stringify(spreadsheetData);
      if (isDifferent) {
        setSpreadsheetData(memoizedSpreadsheetData);
      }
    }
  }, [memoizedSpreadsheetData, hasChanges, spreadsheetData]);

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = useCallback((newData) => {
    if (!newData || newData === prevDataRef.current) {
      return;
    }

    if (JSON.stringify(newData) === JSON.stringify(prevDataRef.current)) {
      return;
    }

    prevDataRef.current = newData;
    setSpreadsheetData(newData);
    setHasChanges(true);
  }, []);

  // 셀 선택 핸들러 - 행 인덱스 추적 (ICT-414)
  const handleCellSelect = useCallback((selected) => {
    if (!selected || !selected.range) {
      return;
    }

    const range = selected.range;

    // Deep comparison to prevent infinite loops
    const prevRange = selectedRangeRef.current;
    if (prevRange &&
      prevRange.start.row === range.start.row &&
      prevRange.start.column === range.start.column &&
      prevRange.end.row === range.end.row &&
      prevRange.end.column === range.end.column) {
      // 범위가 동일하면 상태 업데이트 및 리프레시 로직 건너뜀
      return;
    }

    // 범위 상태 업데이트
    selectedRangeRef.current = range;
    setSelectedRange(range);

    const rowIndex = range.start.row;

    // ref 값과 비교하여 실제로 변경된 경우에만 state 업데이트 (불필요한 재렌더링 방지)
    if (typeof rowIndex === 'number' && rowIndex !== selectedRowIndexRef.current) {
      selectedRowIndexRef.current = rowIndex;
      setSelectedRowIndex(rowIndex);
      debugLog('Spreadsheet', `행 ${rowIndex + 1} 선택됨 (index: ${rowIndex})`);
    }
  }, []); // 의존성 배열 비우기 - 콜백 재생성 방지

  // 행 추가 핸들러
  const handleAddRows = useCallback((count = 5) => {
    const safeMaxSteps = Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;
    const safeCount = Number.isFinite(count) && count >= 1 && count <= 100 ? count : 5;

    setSpreadsheetData(prevData => {
      const baseFields = [
        { value: '' },
        { value: '', readOnly: true },
        { value: '', readOnly: true },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
      ];

      const stepFields = [];
      for (let i = 0; i < safeMaxSteps; i++) {
        stepFields.push({ value: '' });
        stepFields.push({ value: '' });
      }

      const emptyRow = [...baseFields, ...stepFields];
      const newRows = Array.from({ length: safeCount }, () => [...emptyRow]);
      return [...prevData, ...newRows];
    });
    setHasChanges(true);
  }, [maxSteps]);

  // 행 삭제 핸들러 (다중 선택 지원)
  const handleDeleteRows = useCallback(() => {
    const currentRange = selectedRangeRef.current;
    if (!currentRange) {
      setSnackbarMessage('삭제할 행을 선택해주세요.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const startRow = Math.min(currentRange.start.row, currentRange.end.row);
    const endRow = Math.max(currentRange.start.row, currentRange.end.row);
    const count = endRow - startRow + 1;

    // 삭제 대상 행 정보 추출 (Display ID: 0번 컬럼, Name: 6번 컬럼)
    const targetRows = spreadsheetData.slice(startRow, endRow + 1);

    // 선택된 항목들과 그 하위 항목들을 모두 수집 (Map으로 중복 제거)
    const allDeleteItems = new Map();

    targetRows.forEach((row, index) => {
      const id = row[0]?.testCaseId;
      if (!id) return; // ID가 없는 행은 무시

      // 이미 추가된 항목이면 스킵
      if (allDeleteItems.has(id)) return;

      const type = row[4]?.value === t('testcase.type.folder', '폴더') ? 'folder' : 'testcase';

      // 현재 항목 추가
      allDeleteItems.set(id, {
        id: id,
        displayId: row[0]?.value || '',
        name: row[6]?.value || '',
        type: type,
        rowIndex: startRow + index
      });

      // 폴더인 경우 하위 항목들도 찾아서 추가 (data prop 사용)
      if (type === 'folder' && data) {
        const descendants = getAllDescendants(data, id);
        descendants.forEach(desc => {
          if (!allDeleteItems.has(desc.id)) {
            allDeleteItems.set(desc.id, {
              id: desc.id,
              displayId: desc.displayId || desc.sequentialId,
              name: desc.name,
              type: desc.type,
              // 하위 항목은 rowIndex를 알 수 없으므로 무시하거나 -1 처리 (화면 삭제 시에는 범위 삭제로 처리됨)
              rowIndex: -1
            });
          }
        });
      }
    });

    const deleteItems = Array.from(allDeleteItems.values());

    if (deleteItems.length === 0) {
      setSnackbarMessage('삭제할 유효한 항목이 없습니다.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setRowsToDelete(deleteItems);
    setDeleteTargetRange({ startRow, count });
    setDeleteDialogOpen(true);
  }, [spreadsheetData]);

  // 삭제 확정 핸들러
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetRange) return;

    // 실제 백엔드 삭제가 필요한 ID 추출 (temp-로 시작하거나 ID가 없는 경우는 제외)
    // 주의: temp- ID는 프론트엔드 임시 ID일 수 있으므로 testCaseId가 존재하고 숫자가 아니면(UUID 등) 확인 필요
    // 여기서는 testCaseId가 존재하면 삭제 시도. (Backend가 처리)
    const realIdsToDelete = rowsToDelete
      .filter(item => item.id && !String(item.id).startsWith('temp-'))
      .map(item => item.id);

    setLocalLoading(true);

    try {
      // 1. 백엔드 데이터 삭제 (실제 ID가 있는 경우만)
      if (realIdsToDelete.length > 0) {
        await testCaseService.batchDeleteTestCases(realIdsToDelete);
        debugLog('Spreadsheet', `백엔드에서 ${realIdsToDelete.length}개 항목 삭제 완료`);
      }

      // 2. 프론트엔드 상태 업데이트
      const { startRow, count } = deleteTargetRange;

      setSpreadsheetData(prevData => {
        const newData = [...prevData];

        // 선택된 행 삭제
        newData.splice(startRow, count);

        // ICT-414: displayOrder 재계산
        return newData.map((row, index) => {
          const newRow = [...row];
          // row가 유효하고 길이가 충분한지 확인
          if (newRow.length > 3) {
            newRow[3] = { ...newRow[3], value: index + 1 };
          }
          return newRow;
        });
      });

      setHasChanges(true); // 순서 변경 등으로 인한 저장 필요 상태 유지
      setSnackbarMessage(`${count}개 행이 삭제되었습니다.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // 트리 동기화를 위해 Refresh 호출
      if (onRefresh) {
        debugLog('Spreadsheet', '✅ 삭제 완료 - 트리 동기화 요청');
        onRefresh();
      }

      // 상태 초기화
      setDeleteDialogOpen(false);
      setRowsToDelete([]);
      setDeleteTargetRange(null);
      setSelectedRowIndex(null);
      selectedRowIndexRef.current = null;
      setSelectedRange(null);
      selectedRangeRef.current = null;

    } catch (error) {
      logError('삭제 중 오류 발생:', error);
      setSnackbarMessage('항목 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      // 에러 발생 시 다이얼로그 닫지 않음
    } finally {
      setLocalLoading(false);
    }
  }, [deleteTargetRange, rowsToDelete, onRefresh]);

  // 중간 행 삽입 핸들러 - 선택된 행 위에 추가 (ICT-414)
  // 다중 선택 시 범위의 시작(가장 위)을 기준으로 함
  const handleInsertRowAbove = useCallback(() => {
    const currentRange = selectedRangeRef.current;
    const currentSelectedRow = currentRange ? Math.min(currentRange.start.row, currentRange.end.row) : selectedRowIndexRef.current;

    if (currentSelectedRow === null || currentSelectedRow < 0) {
      setSnackbarMessage('행을 먼저 선택해주세요.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const safeMaxSteps = Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;

    setSpreadsheetData(prevData => {
      const baseFields = [
        { value: '' },
        { value: '', readOnly: true },
        { value: '', readOnly: true },
        { value: '', readOnly: true }, // displayOrder - readOnly (ICT-414)
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
      ];

      const stepFields = [];
      for (let i = 0; i < safeMaxSteps; i++) {
        stepFields.push({ value: '' });
        stepFields.push({ value: '' });
      }

      const emptyRow = [...baseFields, ...stepFields];
      const newData = [...prevData];

      // 선택된 행 위에 삽입
      newData.splice(currentSelectedRow, 0, emptyRow);

      // ICT-414: displayOrder 재계산 (시각적 순서 반영)
      return newData.map((row, index) => {
        const newRow = [...row];
        if (newRow.length > 3) {
          newRow[3] = { ...newRow[3], value: index + 1 };
        }
        return newRow;
      });
    });
    setHasChanges(true);
    setSnackbarMessage(`${currentSelectedRow + 1}번 행 위에 새 행이 추가되었습니다.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, [maxSteps]);

  // 중간 행 삽입 핸들러 - 선택된 행 아래에 추가 (ICT-414)
  // 다중 선택 시 범위의 끝(가장 아래)을 기준으로 함
  const handleInsertRowBelow = useCallback(() => {
    const currentRange = selectedRangeRef.current;
    const currentSelectedRow = currentRange ? Math.max(currentRange.start.row, currentRange.end.row) : selectedRowIndexRef.current;

    if (currentSelectedRow === null || currentSelectedRow < 0) {
      setSnackbarMessage('행을 먼저 선택해주세요.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const safeMaxSteps = Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;

    setSpreadsheetData(prevData => {
      const baseFields = [
        { value: '' },
        { value: '', readOnly: true },
        { value: '', readOnly: true },
        { value: '', readOnly: true }, // displayOrder - readOnly (ICT-414)
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
        { value: '' },
      ];

      const stepFields = [];
      for (let i = 0; i < safeMaxSteps; i++) {
        stepFields.push({ value: '' });
        stepFields.push({ value: '' });
      }

      const emptyRow = [...baseFields, ...stepFields];
      const newData = [...prevData];

      // 선택된 행 아래에 삽입
      newData.splice(currentSelectedRow + 1, 0, emptyRow);

      // ICT-414: displayOrder 재계산 (시각적 순서 반영)
      return newData.map((row, index) => {
        const newRow = [...row];
        if (newRow.length > 3) {
          newRow[3] = { ...newRow[3], value: index + 1 };
        }
        return newRow;
      });
    });
    setHasChanges(true);
    setSnackbarMessage(`${currentSelectedRow + 1}번 행 아래에 새 행이 추가되었습니다.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
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

    const safeMaxSteps = Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;

    // 루트 레벨 폴더 및 테스트케이스의 최대 displayOrder 계산
    const rootLevelItems = (data || []).filter(item => !item.parentId);
    const maxDisplayOrder = rootLevelItems.length > 0
      ? Math.max(...rootLevelItems.map(item => item.displayOrder || 0))
      : 0;
    const newDisplayOrder = maxDisplayOrder + 1;

    const folderRow = [
      { value: '' },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
      { value: newDisplayOrder }, // displayOrder를 올바르게 설정
      { value: t('testcase.type.folder', '폴더') },
      { value: '' },
      { value: folderName },
      { value: `${folderName} 폴더` },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
      { value: '', readOnly: true },
    ];

    for (let i = 0; i < safeMaxSteps; i++) {
      folderRow.push({ value: '', readOnly: true });
      folderRow.push({ value: '', readOnly: true });
    }

    setSpreadsheetData(prevData => [folderRow, ...prevData]);
    setHasChanges(true);
    setSnackbarMessage(`폴더 "${folderName}"이 추가되었습니다.`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    handleFolderDialogClose();
  };

  // 검증 실행 함수
  const handleValidateData = useCallback(async () => {
    try {
      const result = validateSpreadsheetData(spreadsheetData, {
        maxSteps,
        data: data || [],
        t
      });

      setValidationResult(result);
      setValidationPanelOpen(true);

      // 검증 결과를 스프레드시트에 시각적으로 표시
      const styledData = applyValidationStyling(spreadsheetData, result, memoizedColumnLabels, theme);
      setStyledSpreadsheetData(styledData);

      let message = '';
      if (result.isValid) {
        message = `검증 완료: 모든 데이터가 유효합니다 (${result.summary.totalRows}개 행)`;
      } else {
        message = `검증 완료: ${result.summary.errorCount}개 오류, ${result.summary.warningCount}개 경고 발견`;
      }

      setSnackbarMessage(message);
      setSnackbarSeverity(result.isValid ? 'success' : 'warning');
      setSnackbarOpen(true);

    } catch (error) {
      logError('검증 중 오류:', error);
      setSnackbarMessage('검증 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [spreadsheetData, maxSteps, data, t, memoizedColumnLabels, theme]);

  // 일괄 저장 핸들러 (Layered Batch Save 적용)
  const handleBulkSave = useCallback(async () => {
    if (!onSave || !hasChanges) return;

    setLocalLoading(true);
    try {
      const safeMaxSteps = Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;

      // 검증
      const validationResult = validateSpreadsheetData(spreadsheetData, {
        maxSteps: safeMaxSteps,
        data: data || [],
        t
      });

      if (!validationResult.isValid) {
        const errorMessages = validationResult.errors.map(error => error.message);
        let detailedMessage = '⚠️ 데이터 검증 실패\n\n';

        if (errorMessages.length > 0) {
          detailedMessage += '🚨 해결이 필요한 오류:\n';
          errorMessages.forEach((msg, index) => {
            detailedMessage += `${index + 1}. ${msg}\n`;
          });
        }

        setSnackbarMessage(detailedMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLocalLoading(false);
        return;
      }

      // 1. 변환: 스프레드시트 데이터 -> 테스트케이스/폴더 객체
      const currentData = prevDataRef.current || spreadsheetData;
      const convertedTestCases = currentData
        .filter(row => Array.isArray(row) && row.some(cell => typeof cell?.value === 'string' && cell.value.trim()))
        .map((row, index) => {
          const isFolder = isFolderRow(row, t);
          const name = extractFolderName(row);
          const parentFolderName = extractParentFolder(row);

          const steps = [];
          if (!isFolder) {
            for (let i = 0; i < safeMaxSteps; i++) {
              const stepDescIndex = 15 + (i * 2);
              const stepExpectedIndex = 15 + (i * 2) + 1;

              if (stepDescIndex < row.length && stepExpectedIndex < row.length) {
                const stepDesc = row[stepDescIndex]?.value || '';
                const stepExpected = row[stepExpectedIndex]?.value || '';

                if (stepDesc.trim()) {
                  steps.push({
                    stepNumber: i + 1,
                    description: stepDesc,
                    expectedResult: stepExpected,
                  });
                }
              }
            }
          }

          // 초기 변환 시에는 기존 데이터(data)에서만 부모를 찾음
          // 신규 폴더 간의 참조는 아래 레이어드 저장 로직에서 해결
          const parentId = parentFolderName ? findFolderIdByName(parentFolderName, data || []) : null;

          return {
            id: row[0]?.testCaseId || (String(row[0]?.value || '').startsWith('temp-') ? row[0]?.value : `temp-${Date.now()}-${index}`),
            name,
            description: row[7]?.value || '',
            preCondition: isFolder ? '' : (row[8]?.value || ''),
            postCondition: isFolder ? '' : (row[9]?.value || ''),
            expectedResults: isFolder ? '' : (row[10]?.value || ''),
            priority: isFolder ? '' : (row[11]?.value || 'MEDIUM'),
            executionType: isFolder ? '' : (row[12]?.value || 'Manual'),
            testTechnique: isFolder ? '' : (row[13]?.value || ''),
            tags: isFolder ? [] : (row[14]?.value ? String(row[14].value).split(',').map(t => t.trim()).filter(Boolean) : []),
            steps,
            type: isFolder ? 'folder' : 'testcase',
            displayOrder: index + 1,
            projectId,
            parentId,
            parentFolderName // 추후 참조 해결을 위해 임시 저장
          };
        });

      // 2. 분리: 폴더 vs 테스트케이스
      let folders = convertedTestCases.filter(tc => tc.type === 'folder');
      const testCasesOnly = convertedTestCases.filter(tc => tc.type === 'testcase');

      let batchResult = { savedTestCases: [], successCount: 0, failureCount: 0, errors: [], isSuccess: true };

      // 3. 폴더 저장 (Layered Save)
      // 부모-자식 의존성 해결을 위해, "부모 ID를 아는 폴더"부터 순차적으로 저장
      if (folders.length > 0) {
        debugLog('Spreadsheet', '📂 폴더 레이어드 저장 시작:', folders.length, '개');

        // 3-1. 폴더 정렬 (부모가 먼저 오도록)
        // sortFoldersByHierarchy는 이미 존재하는 함수를 활용
        folders = sortFoldersByHierarchy(folders, data || []);

        // 3-2. 기존 ID 맵 (이름 -> ID 매핑용)
        // 기존 DB 데이터의 폴더 명과 ID를 미리 맵핑
        const knownFolders = new Map();
        (data || []).forEach(item => {
          if (item.type === 'folder') {
            knownFolders.set(item.name, item.id);
          }
        });

        // 처리된 폴더 추적
        const processedFolders = new Set();
        let remainingFolders = [...folders];
        let loopCount = 0;
        const maxLoops = 10; // 무한루프 방지

        while (remainingFolders.length > 0 && loopCount < maxLoops) {
          loopCount++;
          const currentBatch = [];
          const nextRemaining = [];

          for (const folder of remainingFolders) {
            // 부모가 없거나(루트), 부모가 이미 알려진(저장된/기존) 폴더인 경우
            const parentName = folder.parentFolderName;
            const hasParentName = parentName && parentName.trim() !== '';

            // 부모 ID 해결 시도
            let resolvedParentId = folder.parentId;

            if (hasParentName && !resolvedParentId) {
              // 기존 parentId가 없다면 맵에서 검색
              resolvedParentId = knownFolders.get(parentName);
            }

            // 저장 가능 여부 판단
            const isRoot = !hasParentName;
            const isParentKnown = hasParentName && resolvedParentId;

            if (isRoot || isParentKnown) {
              // 저장 가능한 상태
              // parentId 업데이트
              if (resolvedParentId) {
                folder.parentId = resolvedParentId;
              }
              currentBatch.push(folder);
            } else {
              // 아직 부모가 저장되지 않음 (다음 라운드로)
              nextRemaining.push(folder);
            }
          }

          if (currentBatch.length === 0) {
            // 더 이상 진행 불가 (순환 참조나 부모 이름 오타 등)
            // 남은 폴더들은 그냥 저장 시도 (백엔드 에러 처리 또는 null parent)
            debugLog('Spreadsheet', '⚠️ 더 이상 의존성 해결 불가, 남은 폴더 일괄 처리:', nextRemaining.length);
            currentBatch.push(...nextRemaining);
            nextRemaining.length = 0; // 루프 종료
          }

          // 배치 저장 실행
          if (currentBatch.length > 0) {
            debugLog('Spreadsheet', `📦 폴더 배치 ${loopCount} 저장:`, currentBatch.length, '개');
            const folderBatchResult = await testCaseService.batchSaveTestCases(currentBatch);

            // 결과 처리 및 ID 맵 업데이트
            folderBatchResult.savedTestCases.forEach(savedFolder => {
              knownFolders.set(savedFolder.name, savedFolder.id);
              processedFolders.add(savedFolder.name);
            });

            // 결과 합치기
            batchResult.savedTestCases.push(...folderBatchResult.savedTestCases);
            batchResult.successCount += folderBatchResult.successCount;
            batchResult.failureCount += folderBatchResult.failureCount;
            batchResult.errors.push(...folderBatchResult.errors);
            batchResult.isSuccess = batchResult.isSuccess && folderBatchResult.isSuccess;
          }

          remainingFolders = nextRemaining;
        }
      }

      // 4. 테스트케이스 저장 (최신 폴더 ID 반영)
      if (testCasesOnly.length > 0) {
        // 기존 데이터 + 방금 저장된 폴더들
        const savedFolders = batchResult.savedTestCases.filter(item => item.type === 'folder');
        const updatedAllData = [...(data || []), ...savedFolders];

        // 편의를 위해 Map 다시 구성 (최신 상태)
        const finalFolderMap = new Map();
        updatedAllData.forEach(item => {
          if (item.type === 'folder') {
            finalFolderMap.set(item.name, item.id);
          }
        });

        const updatedTestCases = testCasesOnly.map(tc => {
          // parentFolderName이 있으면 최신 ID로 갱신
          if (tc.parentFolderName) {
            const newParentId = finalFolderMap.get(tc.parentFolderName);
            if (newParentId) {
              return { ...tc, parentId: newParentId };
            }
          }
          // 이미 parentId가 있거나 찾지 못한 경우 그대로 유지
          return tc;
        });

        const testCaseBatchResult = await testCaseService.batchSaveTestCases(updatedTestCases);
        batchResult.savedTestCases.push(...testCaseBatchResult.savedTestCases);
        batchResult.successCount += testCaseBatchResult.successCount;
        batchResult.failureCount += testCaseBatchResult.failureCount;
        batchResult.errors.push(...testCaseBatchResult.errors);
        batchResult.isSuccess = batchResult.isSuccess && testCaseBatchResult.isSuccess;
      }

      // 5. 결과 처리 (기존 로직)
      if (batchResult.isSuccess || batchResult.failureCount === 0) {
        setHasChanges(false);
        const folderCount = batchResult.savedTestCases.filter(tc => tc.type === 'folder').length;
        const testCaseCount = batchResult.savedTestCases.filter(tc => tc.type === 'testcase').length;
        setSnackbarMessage(`✅ 배치 저장 완료: 폴더 ${folderCount}개, 테스트케이스 ${testCaseCount}개`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (onSave) {
          await onSave(batchResult.savedTestCases);
        }

        if (onRefresh) {
          debugLog('Spreadsheet', '✅ 배치 저장 완료 - 리프레시 모니터링 시작');
          await onRefresh();
        }
      } else {
        setHasChanges(false);
        let errorMessage = `⚠️ 배치 저장 부분 실패:\n✅ 성공: ${batchResult.successCount}개\n❌ 실패: ${batchResult.failureCount}개`;
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);

        if (onSave && batchResult.savedTestCases.length > 0) {
          await onSave(batchResult.savedTestCases);
        }

        if (onRefresh) {
          debugLog('Spreadsheet', '⚠️ 배치 저장 부분 실패 - 리프레시 모니터링 시작');
          await onRefresh();
        }
      }
    } catch (error) {
      logError('일괄 저장 실패:', error);
      setSnackbarMessage('저장 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLocalLoading(false);
    }
  }, [spreadsheetData, maxSteps, data, onSave, hasChanges, projectId, onRefresh, t]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setLocalLoading(true);
      try {
        await onRefresh();
        setHasChanges(false);
        setSnackbarMessage('최신 데이터로 새로고침되었습니다.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        logError('새로고침 실패:', error);
        setSnackbarMessage('새로고침 중 오류가 발생했습니다: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLocalLoading(false);
      }
    }
  }, [onRefresh]);

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

  const handleStepCountChangeWithValue = (newStepCount) => {
    if (newStepCount >= 1 && newStepCount <= 10 && newStepCount !== maxSteps) {
      setSpreadsheetData(currentData => {
        const adjustedData = currentData.map(row => {
          const baseRow = row.slice(0, 15);
          const existingSteps = [];
          const currentStepCount = Math.floor((row.length - 15) / 2);
          for (let i = 0; i < currentStepCount; i++) {
            existingSteps.push({
              description: row[15 + i * 2]?.value || '',
              expectedResult: row[15 + i * 2 + 1]?.value || ''
            });
          }

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
      setSpreadsheetKey(prev => prev + 1);
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
      handleStepCountChangeWithValue(newStepCount);
    }
    handleStepMenuClose();
  };

  // Export 관련 함수들
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportCSV = useCallback(() => {
    const result = exportToCSV(spreadsheetData, memoizedColumnLabels);
    setSnackbarMessage(result.message);
    setSnackbarSeverity(result.severity);
    setSnackbarOpen(true);
    handleExportMenuClose();
  }, [spreadsheetData, memoizedColumnLabels]);

  const handleExportExcel = useCallback(() => {
    const result = exportToExcel(spreadsheetData, memoizedColumnLabels);
    setSnackbarMessage(result.message);
    setSnackbarSeverity(result.severity);
    setSnackbarOpen(true);
    handleExportMenuClose();
  }, [spreadsheetData, memoizedColumnLabels]);

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

  // 스프레드시트 컨텐츠 렌더링 함수
  const renderSpreadsheetContent = () => (
    <>
      {/* 사용법 안내 - 접기/펼치기 */}
      {!readOnly && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small"
            onClick={() => setUsageExpanded(!usageExpanded)}
            endIcon={usageExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1 }}
          >
            {t('testcase.spreadsheet.usage.title', '사용법')} {usageExpanded ? t('testcase.spreadsheet.usage.collapse', '접기') : t('testcase.spreadsheet.usage.expand', '펼치기')}
          </Button>
          <Collapse in={usageExpanded}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>{t('testcase.spreadsheet.usage.title', '사용법:')}</strong> {t('testcase.spreadsheet.usage.basicUsage', 'Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.')}
                <br />
                <strong>{t('testcase.spreadsheet.usage.folderFunction', '폴더 기능: "폴더 추가" 버튼을 클릭하거나 이름 셀에 "📁 폴더명" 형태로 입력하면 폴더가 생성됩니다.')}</strong>
                <br />
                <strong>{t('testcase.spreadsheet.usage.stepManagement', '스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).')}</strong>
              </Typography>
            </Alert>
          </Collapse>
        </Box>
      )}

      {/* 스프레드시트 */}
      <Box
        sx={{
          mt: 2,
          minHeight: 300,
          maxHeight: isFullscreen ? 'calc(100vh - 250px)' : 'calc(100vh - 350px)',
          overflow: 'auto',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          '& .Spreadsheet': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
            color: theme.palette.text.primary
          },
          '& .Spreadsheet__table': {
            borderColor: theme.palette.divider
          },
          '& .Spreadsheet__header': {
            backgroundColor: theme.palette.mode === 'dark' ? '#272727' : '#f5f5f5', // Opaque color for sticky header (Paper + elevation approx)
            color: theme.palette.text.primary,
            fontWeight: 600,
            position: 'sticky',
            top: 0,
            zIndex: 10
          },
          '& .Spreadsheet__cell': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider
          },
          '& .Spreadsheet__cell--readonly': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fafafa',
            color: theme.palette.text.secondary
          },
          '& .Spreadsheet__cell input': {
            backgroundColor: `${theme.palette.background.default} !important`,
            color: `${theme.palette.text.primary} !important`,
            WebkitTextFillColor: `${theme.palette.text.primary} !important`,
            border: `1px solid ${theme.palette.divider}`
          },
          '& .Spreadsheet__cell textarea': {
            backgroundColor: `${theme.palette.background.default} !important`,
            color: `${theme.palette.text.primary} !important`,
            WebkitTextFillColor: `${theme.palette.text.primary} !important`,
            border: `1px solid ${theme.palette.divider}`
          },
          '& .Spreadsheet__data-editor': {
            backgroundColor: `${theme.palette.background.default} !important`,
            color: `${theme.palette.text.primary} !important`
          },
          '& input[type="text"]': {
            backgroundColor: `${theme.palette.background.default} !important`,
            color: `${theme.palette.text.primary} !important`,
            WebkitTextFillColor: `${theme.palette.text.primary} !important`
          },
          '& .Spreadsheet__cell--selected': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
            borderColor: theme.palette.primary.main
          }
        }}
      >
        {spreadsheetData.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography>스프레드시트 데이터가 비어있습니다.</Typography>
          </Alert>
        ) : (
          <Spreadsheet
            key={`spreadsheet-${projectId || 'default'}-${maxSteps}-${spreadsheetKey}`}
            data={spreadsheetData}
            onChange={readOnly ? undefined : handleSpreadsheetChange}
            onSelect={handleCellSelect}
            columnLabels={memoizedColumnLabels}
            DataEditor={KoreanAwareDataEditor}
          />
        )}
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
    </>
  );

  return (
    <>
      <Card sx={{ minHeight: 400, display: isFullscreen ? 'none' : 'block' }}>
        <CardContent>
          {/* 헤더 영역 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('testcase.spreadsheet.header.title', '테스트케이스 스프레드시트')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={t('testcase.spreadsheet.status.rows', '{count}개 행', {
                    count: spreadsheetData.filter(row => row.some(cell =>
                      typeof cell?.value === 'string' && cell.value.trim()
                    )).length
                  })}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={t('testcase.spreadsheet.status.steps', '{count}개 스텝', { count: maxSteps })}
                  size="small"
                  variant=" outlined"
                  color="primary"
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

            {/* 액션 버튼들 - 플로팅 메뉴 */}
            {!readOnly && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  position: 'sticky',
                  top: 64, // AppBar 높이
                  zIndex: 1100,
                  backgroundColor: theme.palette.background.paper,
                  padding: theme.spacing(1.5),
                  borderRadius: 1,
                  marginBottom: 2,
                  marginX: -2, // CardContent padding 상쇄
                  paddingX: 2,
                  flexWrap: 'wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderBottom: `2px solid ${theme.palette.divider}`
                }}
              >
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {t('testcase.spreadsheet.button.refresh', '새로고침')}
                </Button>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddRows(5)}
                  disabled={isLoading}
                >
                  {t('testcase.spreadsheet.button.addRows', '행 추가')}
                </Button>

                {/* ICT-414: 중간 행 삽입 버튼 */}
                <Button
                  size="small"
                  startIcon={<ArrowUpwardIcon />}
                  onClick={handleInsertRowAbove}
                  disabled={isLoading || selectedRowIndex === null}
                  color="primary"
                  variant="outlined"
                  title={selectedRowIndex !== null ? `${selectedRowIndex + 1}번 행 위에 추가` : '행을 먼저 선택하세요'}
                >
                  {t('testcase.spreadsheet.button.insertAbove', '위에 추가')}
                </Button>
                <Button
                  size="small"
                  startIcon={<ArrowDownwardIcon />}
                  onClick={handleInsertRowBelow}
                  disabled={isLoading || selectedRowIndex === null}
                  color="primary"
                  variant="outlined"
                  title={selectedRowIndex !== null ? `${selectedRowIndex + 1}번 행 아래에 추가` : '행을 먼저 선택하세요'}
                >
                  {t('testcase.spreadsheet.button.insertBelow', '아래에 추가')}
                </Button>

                <Button
                  size="small"
                  startIcon={<CreateNewFolderIcon />}
                  onClick={handleAddFolder}
                  disabled={isLoading}
                  color="secondary"
                >
                  {t('testcase.spreadsheet.button.addFolder', '폴더 추가')}
                </Button>

                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteRows}
                  disabled={isLoading || selectedRowIndex === null}
                  color="error"
                  variant="outlined"
                  title={selectedRange ? `${Math.abs(selectedRange.end.row - selectedRange.start.row) + 1}개 행 삭제` : '행을 먼저 선택하세요'}
                >
                  {t('testcase.spreadsheet.button.delete', '삭제')}
                </Button>

                <Button
                  size="small"
                  startIcon={<WarningIcon />}
                  onClick={handleValidateData}
                  disabled={isLoading}
                  color="warning"
                  variant="outlined"
                >
                  {t('testcase.spreadsheet.button.validate', '검증')}
                </Button>

                <Button
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={handleExportMenuOpen}
                  disabled={isLoading}
                  color="info"
                  variant="outlined"
                >
                  {t('testcase.spreadsheet.button.export', 'Export')}
                </Button>

                <IconButton
                  size="small"
                  onClick={handleStepMenuOpen}
                  disabled={isLoading}
                  aria-label={t('testcase.spreadsheet.button.stepManagement', '스텝 관리')}
                >
                  <SettingsIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  aria-label={isFullscreen ? t('testcase.spreadsheet.button.exitFullscreen', '전체화면 종료') : t('testcase.spreadsheet.button.fullscreen', '전체화면')}
                  color="primary"
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleBulkSave}
                  disabled={!hasChanges || isLoading || !onSave}
                  color="primary"
                >
                  {isLoading ? t('testcase.spreadsheet.button.saving', '저장 중...') : t('testcase.spreadsheet.button.save', '일괄 저장')}
                </Button>
              </Box>
            )}
          </Box>

          {/* 스프레드시트 컨텐츠 */}
          {renderSpreadsheetContent()}
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
        <StepSettingsDialog
          open={stepSettingsOpen}
          onClose={handleStepSettingsClose}
          tempMaxSteps={tempMaxSteps}
          setTempMaxSteps={setTempMaxSteps}
          maxSteps={maxSteps}
          onApply={handleStepCountChange}
          t={t}
        />

        {/* 폴더 생성 다이얼로그 */}
        <FolderCreateDialog
          open={folderDialogOpen}
          onClose={handleFolderDialogClose}
          folderName={folderName}
          setFolderName={setFolderName}
          onCreate={handleCreateFolder}
          t={t}
        />

        {/* 검증 결과 다이얼로그 */}
        <ValidationResultDialog
          open={validationPanelOpen}
          onClose={() => setValidationPanelOpen(false)}
          validationResult={validationResult}
        />

        {/* 삭제 확인 다이얼로그 */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          items={rowsToDelete}
          description={t('testcase.spreadsheet.delete.description', '{count}개 항목을 삭제하시겠습니까? 삭제된 항목은 복구할 수 없습니다.', { count: rowsToDelete.length })}
        />

        {/* Export 메뉴 */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={handleExportMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={handleExportCSV}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('testcase.spreadsheet.export.csv.title', 'CSV로 내보내기')}
              secondary={t('testcase.spreadsheet.export.csv.description', '스프레드시트 호환 형식')}
            />
          </MenuItem>
          <MenuItem onClick={handleExportExcel}>
            <ListItemIcon>
              <GetAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('testcase.spreadsheet.export.excel.title', 'Excel로 내보내기')}
              secondary={t('testcase.spreadsheet.export.excel.description', 'Microsoft Excel 형식 (.xlsx)')}
            />
          </MenuItem>
        </Menu>
      </Card>

      {/* 전체화면 Dialog */}
      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth={false}
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            m: 0,
            maxHeight: '100vh',
            height: '100vh'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              {t('testcase.spreadsheet.header.title', '테스트케이스 스프레드시트')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={t('testcase.spreadsheet.status.rows', '{count}개 행', {
                  count: spreadsheetData.filter(row => row.some(cell =>
                    typeof cell?.value === 'string' && cell.value.trim()
                  )).length
                })}
                size="small"
                variant="outlined"
              />
              <Chip
                label={t('testcase.spreadsheet.status.steps', '{count}개 스텝', { count: maxSteps })}
                size="small"
                variant="outlined"
                color="primary"
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
          <IconButton
            onClick={() => setIsFullscreen(false)}
            aria-label={t('testcase.spreadsheet.button.exitFullscreen', '전체화면 종료')}
          >
            <FullscreenExitIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* 액션 버튼들 */}
          {!readOnly && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mb: 2,
                flexWrap: 'wrap',
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {t('testcase.spreadsheet.button.refresh', '새로고침')}
              </Button>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleAddRows(5)}
                disabled={isLoading}
              >
                {t('testcase.spreadsheet.button.addRows', '행 추가')}
              </Button>

              <Button
                size="small"
                startIcon={<ArrowUpwardIcon />}
                onClick={handleInsertRowAbove}
                disabled={isLoading || selectedRowIndex === null}
                color="primary"
                variant="outlined"
                title={selectedRowIndex !== null ? `${selectedRowIndex + 1}번 행 위에 추가` : '행을 먼저 선택하세요'}
              >
                {t('testcase.spreadsheet.button.insertAbove', '위에 추가')}
              </Button>
              <Button
                size="small"
                startIcon={<ArrowDownwardIcon />}
                onClick={handleInsertRowBelow}
                disabled={isLoading || selectedRowIndex === null}
                color="primary"
                variant="outlined"
                title={selectedRowIndex !== null ? `${selectedRowIndex + 1}번 행 아래에 추가` : '행을 먼저 선택하세요'}
              >
                {t('testcase.spreadsheet.button.insertBelow', '아래에 추가')}
              </Button>

              <Button
                size="small"
                startIcon={<CreateNewFolderIcon />}
                onClick={handleAddFolder}
                disabled={isLoading}
                color="secondary"
              >
                {t('testcase.spreadsheet.button.addFolder', '폴더 추가')}
              </Button>

              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteRows}
                disabled={isLoading || selectedRowIndex === null}
                color="error"
                variant="outlined"
                title={selectedRange ? `${Math.abs(selectedRange.end.row - selectedRange.start.row) + 1}개 행 삭제` : '행을 먼저 선택하세요'}
              >
                {t('testcase.spreadsheet.button.delete', '삭제')}
              </Button>

              <Button
                size="small"
                startIcon={<WarningIcon />}
                onClick={handleValidateData}
                disabled={isLoading}
                color="warning"
                variant="outlined"
              >
                {t('testcase.spreadsheet.button.validate', '검증')}
              </Button>

              <Button
                size="small"
                startIcon={<GetAppIcon />}
                onClick={handleExportMenuOpen}
                disabled={isLoading}
                color="info"
                variant="outlined"
              >
                {t('testcase.spreadsheet.button.export', 'Export')}
              </Button>

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
                onClick={handleBulkSave}
                disabled={!hasChanges || isLoading || !onSave}
                color="primary"
              >
                {isLoading ? t('testcase.spreadsheet.button.saving', '저장 중...') : t('testcase.spreadsheet.button.save', '일괄 저장')}
              </Button>
            </Box>
          )}

          {/* 스프레드시트 컨텐츠 */}
          {renderSpreadsheetContent()}
        </DialogContent>
      </Dialog>
    </>
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