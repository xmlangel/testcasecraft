// src/components/TestCase/TestCaseSpreadsheet.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { listToTree } from '../../utils/treeUtils.jsx';
import { validationLogger, logInfo, logWarn, logError } from '../../utils/logger.js';
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
  CreateNewFolder as CreateNewFolderIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import Spreadsheet from 'react-spreadsheet';
import * as XLSX from 'xlsx';

const TestCaseSpreadsheet = ({
  data,
  onChange,
  onSave,
  onRefresh,
  readOnly = false,
  projectId
}) => {
  const { t } = useI18n();
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [renderError, setRenderError] = useState(null);
  
  // ICT-344: 검증 결과 표시를 위한 상태
  const [validationResult, setValidationResult] = useState(null);
  const [validationPanelOpen, setValidationPanelOpen] = useState(false);
  
  // 오류 행 스타일 적용을 위한 스프레드시트 데이터 with 스타일링
  const [styledSpreadsheetData, setStyledSpreadsheetData] = useState([]);


  // 동적 스텝 관리 상태
  const [maxSteps, setMaxSteps] = useState(3); // 기본 3개 스텝
  const [stepMenuAnchor, setStepMenuAnchor] = useState(null);
  const [stepSettingsOpen, setStepSettingsOpen] = useState(false);
  const [tempMaxSteps, setTempMaxSteps] = useState(3);
  const [spreadsheetKey, setSpreadsheetKey] = useState(0);

  // 폴더 관련 상태
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Export 관련 상태
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // 트리 구조를 평면화하면서 트리 순서를 유지하는 함수 (TestCaseTree.renderTree와 완전히 동일한 로직)
  const flattenTreeInOrder = useCallback((data) => {
    if (!data || data.length === 0) return [];
    
    // 트리 구조로 변환 (TestCaseTree와 동일: filteredTestCases -> listToTree)
    const treeData = listToTree(data, null);
    
    // renderTree와 완전히 동일한 방식으로 평면화 및 정렬
    const flattenWithRenderTreeLogic = (nodes, result = []) => {
      // TestCaseTree.renderTree와 완전히 동일한 정렬 로직
      let sortedNodes = nodes.slice();
      // orderEditMode는 false라고 가정하고 displayOrder 정렬
      sortedNodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      
      // 정렬된 노드를 순서대로 결과에 추가
      sortedNodes.forEach(node => {
        // 현재 노드 추가
        result.push(node);
        // 자식이 있으면 재귀적으로 처리 (renderTree에서 children을 렌더링하는 것과 동일)
        if (Array.isArray(node.children) && node.children.length > 0) {
          flattenWithRenderTreeLogic(node.children, result);
        }
      });
      
      return result;
    };
    
    return flattenWithRenderTreeLogic(treeData);
  }, []);

  // 폴더 감지 유틸리티 함수 (타입 컬럼은 인덱스 4)
  const isFolderRow = (row) => {
    const cellValue = row[4]?.value;
    const typeValue = typeof cellValue === 'string' ? cellValue.trim().toLowerCase() : '';
    const folderText = t('testcase.type.folder', '폴더').toLowerCase();
    return typeValue === folderText || typeValue === 'folder' || typeValue === '📁';
  };

  // 폴더명 추출 함수 (10컬럼 구조 - ID, 작성자, 수정자, 순서, 타입, 상위폴더, 이름, 설명, 사전조건, 예상결과)
  const extractFolderName = (row) => {
    // 일곱 번째 컬럼(이름)에서 폴더명을 직접 가져옴 (인덱스 6)
    const cellValue = row[6]?.value;
    return typeof cellValue === 'string' ? cellValue.trim() : '';
  };

  // 상위 폴더 추출 함수 (10컬럼 구조 - 상위폴더는 인덱스 5)
  const extractParentFolder = (row) => {
    const cellValue = row[5]?.value;

    // undefined, null, "undefined", "null", 빈 문자열 모두 null 반환
    if (!cellValue ||
        cellValue === 'undefined' ||
        cellValue === 'null' ||
        (typeof cellValue === 'string' && cellValue.trim() === '')) {
      return null;
    }

    return typeof cellValue === 'string' ? cellValue.trim() : null;
  };

  // 동적 컬럼 라벨 생성 함수 (ICT-339: 순차 ID 컬럼 추가, 순서 컬럼 추가, 작성자/수정자 컬럼 추가)
  const generateColumnLabels = (stepCount) => {
    const baseColumns = [
      'ID',
      t('testcase.spreadsheet.column.createdBy', '작성자'),
      t('testcase.spreadsheet.column.updatedBy', '수정자'),
      t('testcase.spreadsheet.column.order', '순서'),
      t('testcase.spreadsheet.column.type', '타입'),
      t('testcase.spreadsheet.column.parentFolder', '상위폴더'),
      t('testcase.spreadsheet.column.name', '이름'),
      t('testcase.spreadsheet.column.description', '설명'),
      t('testcase.spreadsheet.column.preCondition', '사전조건'),
      t('testcase.spreadsheet.column.expectedResults', '예상결과')
    ];
    const stepColumns = [];

    for (let i = 1; i <= stepCount; i++) {
      stepColumns.push(t('testcase.spreadsheet.column.step', 'Step {number}', { number: i }));
      stepColumns.push(t('testcase.spreadsheet.column.expected', 'Expected {number}', { number: i }));
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
      // 기본 빈 행들 생성 (10행) - 10컬럼 구조 (작성자/수정자가 ID 다음에 위치)
      const baseFields = [
        { value: '' }, // ID (순차 ID)
        { value: '', readOnly: true }, // 작성자 (읽기 전용)
        { value: '', readOnly: true }, // 수정자 (읽기 전용)
        { value: '' }, // 순서 (displayOrder)
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

    // 트리 구조를 평면화하면서 트리 순서를 유지 - 10컬럼 구조 (작성자/수정자 컬럼 추가)
    const flattenedData = flattenTreeInOrder(data);

    const convertedData = flattenedData.map(testCase => {
      // 안전한 상위폴더명 추출
      let parentFolderName = '';
      if (testCase.parentId) {
        const parentFolder = data.find(item => item.id === testCase.parentId);
        parentFolderName = parentFolder?.name || '';
      }

      const row = [
        { value: testCase.displayId || testCase.sequentialId || '', readOnly: true }, // ICT-341: Display ID (프로젝트코드-넘버 형식) - 읽기 전용
        { value: testCase.createdBy || '', readOnly: true }, // 작성자 (읽기 전용)
        { value: testCase.updatedBy || '', readOnly: true }, // 수정자 (읽기 전용)
        { value: testCase.displayOrder || '' }, // 순서 (displayOrder)
        { value: testCase.type === 'folder' ? t('testcase.type.folder', '폴더') : t('testcase.type.testcase', '테스트케이스'), readOnly: true }, // 타입 - 읽기 전용
        { value: parentFolderName || '' }, // 상위폴더 - 빈 문자열 또는 실제 폴더명만 허용
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

  // 이전 데이터 참조 (리렌더링 방지)
  const prevDataRef = useRef();

  // 스프레드시트 데이터 변경 핸들러 (최적화 버전)
  const handleSpreadsheetChange = useCallback((newData) => {
    // 데이터가 실제로 변경되었는지 빠른 참조 비교
    if (!newData || newData === prevDataRef.current) {
      return;
    }

    // 더 정밀한 비교가 필요한 경우에만 JSON 비교 수행
    if (JSON.stringify(newData) === JSON.stringify(prevDataRef.current)) {
      return;
    }

    // 이전 데이터 참조 업데이트
    prevDataRef.current = newData;

    // 로컬 상태만 업데이트, onChange는 호출하지 않음
    setSpreadsheetData(newData);
    setHasChanges(true);

    // onChange는 일괄 저장 시에만 호출하도록 변경
    // 이렇게 하면 실시간으로 부모 상태를 업데이트하지 않아서 무한 루프 방지
  }, []); // 의존성 배열을 비워서 함수 재생성 방지

  // 행 추가 핸들러 - 폴더셀 방식
  const handleAddRows = useCallback((count = 5) => {
    setSpreadsheetData(prevData => {
      const baseFields = [
        { value: '' }, // ID (순차 ID)
        { value: '', readOnly: true }, // 작성자 (읽기 전용)
        { value: '', readOnly: true }, // 수정자 (읽기 전용)
        { value: '' }, // 순서 (displayOrder)
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
      { value: '', readOnly: true }, // 작성자 (읽기 전용) - 서버에서 자동 할당
      { value: '', readOnly: true }, // 수정자 (읽기 전용) - 서버에서 자동 할당
      { value: '' }, // 순서 (displayOrder) - 서버에서 자동 할당
      { value: t('testcase.type.folder', '폴더') }, // 타입
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

  // 컬럼 라벨 메모이제이션 (성능 최적화)
  const memoizedColumnLabels = useMemo(() => generateColumnLabels(maxSteps), [maxSteps]);

  // ICT-344: 스프레드시트 데이터에 검증 결과 스타일링 적용 (최적화 버전)
  const applyValidationStyling = useCallback((rows, validationResult) => {
    if (!validationResult || !Array.isArray(rows)) {
      return rows;
    }

    // 검증 결과가 없으면 원본 반환 (빠른 리턴)
    if (validationResult.errors.length === 0 && validationResult.warnings.length === 0) {
      return rows;
    }

    const styledRows = rows.map((row, index) => {
      const rowNumber = index + 1;
      
      // 해당 행에 오류나 경고가 있는지 확인
      const rowErrors = validationResult.errors.filter(error => error.row === rowNumber);
      const rowWarnings = validationResult.warnings.filter(warning => warning.row === rowNumber);
      
      if (rowErrors.length === 0 && rowWarnings.length === 0) {
        return row; // 오류/경고가 없으면 원본 반환
      }

      // 행에 스타일을 적용한 새로운 배열 생성
      const styledRow = row.map((cell, cellIndex) => {
        const columnName = memoizedColumnLabels[cellIndex]; // 메모이제이션된 컬럼 라벨 사용
        
        // 해당 셀에 대한 오류/경고 찾기
        const cellErrors = rowErrors.filter(error => 
          error.column === columnName || error.column === '전체' || error.column === '스텝'
        );
        const cellWarnings = rowWarnings.filter(warning => 
          warning.column === columnName || warning.column === '전체' || warning.column === '스텝'
        );

        if (cellErrors.length === 0 && cellWarnings.length === 0) {
          return cell; // 해당 셀에 문제없으면 원본 반환
        }

        // 스타일 적용 (오류 우선, 없으면 경고)
        const hasError = cellErrors.length > 0;
        const hasWarning = cellWarnings.length > 0;
        
        let backgroundColor = '';
        let borderColor = '';
        let tooltipText = '';
        
        if (hasError) {
          backgroundColor = '#ffebee'; // 연한 빨강
          borderColor = '#f44336'; // 빨강
          tooltipText = cellErrors.map(e => e.message).join('\n');
        } else if (hasWarning) {
          backgroundColor = '#fff3e0'; // 연한 주황
          borderColor = '#ff9800'; // 주황
          tooltipText = cellWarnings.map(w => w.message).join('\n');
        }

        return {
          ...cell,
          style: {
            backgroundColor,
            border: `1px solid ${borderColor}`,
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
            ...cell.style
          },
          title: tooltipText // 툴팁으로 오류 메시지 표시
        };
      });

      return styledRow;
    });

    return styledRows;
  }, [memoizedColumnLabels]);

  // ICT-344: 포괄적인 데이터 검증 시스템
  const validateSpreadsheetData = useCallback((rows) => {
    try {
      
      const errors = [];
      const warnings = [];
      const folderNames = new Set();
      const testCaseNames = new Map(); // 테스트케이스 중복 검증용 (key: name|parent|type, value: id)
      const processedRows = [];

      if (!Array.isArray(rows)) {
        validationLogger.error('rows가 배열이 아닙니다:', typeof rows, rows);
        return {
          isValid: false,
          errors: [{ type: 'invalid_data', message: '검증할 데이터가 올바르지 않습니다.' }],
          warnings: [],
          summary: { totalRows: 0, errorCount: 1, warningCount: 0, folderCount: 0, testCaseCount: 0 }
        };
      }

      // 빈 행 제거 및 기본 데이터 수집
      const validRows = [];
      
      rows.forEach((row, index) => {
        try {
          if (!Array.isArray(row)) {
            validationLogger.warn(`검증 - 행 ${index}이 배열이 아닙니다:`, typeof row, row);
            return;
          }
          
          const hasContent = row.some(cell => 
            typeof cell?.value === 'string' && cell.value.trim()
          );
          
          if (hasContent) {
            validRows.push({ row, originalIndex: index });
          }
          
        } catch (error) {
          validationLogger.error(`행 ${index} 필터링 중 오류:`, error);
        }
      });
      

    // 1단계: 기본 구조 검증 및 폴더 수집
    validRows.forEach(({ row, originalIndex }, index) => {
      try {
        const rowNumber = originalIndex + 1;
        const isFolder = isFolderRow(row);
        const name = extractFolderName(row);
        const parentFolderName = extractParentFolder(row);

        // 필수 필드 검증 (이름)
        if (!name || !name.trim()) {
          errors.push({
            type: 'required_field',
            row: rowNumber,
            column: '이름',
            message: `${rowNumber}번 행: 이름은 필수 입력 항목입니다.`,
            severity: 'error'
          });
        }

        // 폴더명 중복 검증
        if (isFolder && name) {
          if (folderNames.has(name)) {
            errors.push({
              type: 'duplicate_folder',
              row: rowNumber,
              column: '이름',
              message: `${rowNumber}번 행: 폴더명 "${name}"이 중복됩니다. 폴더명은 고유해야 합니다.`,
              severity: 'error'
            });
          } else {
            folderNames.add(name);
          }
        }

        // 테스트케이스 중복 검증 (데이터베이스 제약조건과 일치: project_id, name, parent_id, type)
        // 단, 기존 testcase (id가 있는 경우)는 중복 검증에서 제외 (업데이트 시 자기 자신과 충돌 방지)
        if (!isFolder && name) {
          const testCaseId = row[row.length - 1]?.value; // 마지막 컬럼이 ID
          const duplicateKey = `${name}|${parentFolderName || 'root'}|testcase`;

          // 기존 testcase (id가 있는 경우)는 중복 검증 키에 id를 포함하여 자기 자신과는 충돌하지 않도록 함
          const uniqueKey = testCaseId ? `${duplicateKey}|${testCaseId}` : duplicateKey;

          if (testCaseNames.has(duplicateKey)) {
            // 이미 같은 이름/폴더 조합이 존재하는 경우
            // 하지만 같은 ID를 가진 경우는 자기 자신이므로 허용
            const existingEntry = testCaseNames.get(duplicateKey);
            if (existingEntry !== testCaseId) {
              errors.push({
                type: 'duplicate_testcase',
                row: rowNumber,
                column: '이름',
                message: `${rowNumber}번 행: 테스트케이스명 "${name}"이 같은 폴더에서 중복됩니다. 같은 폴더 내에서 테스트케이스명은 고유해야 합니다.`,
                severity: 'error'
              });
            }
          } else {
            testCaseNames.set(duplicateKey, testCaseId);
          }
        }

        // 타입 검증 (타입 컬럼은 인덱스 4)
        const typeValue = row[4]?.value;
        if (typeValue && typeof typeValue === 'string') {
          const normalizedType = typeValue.trim().toLowerCase();
          if (normalizedType && !['폴더', 'folder', '📁', '테스트케이스', 'testcase', 'test case'].includes(normalizedType)) {
            warnings.push({
              type: 'invalid_type',
              row: rowNumber,
              column: '타입',
              message: `${rowNumber}번 행: 타입 "${typeValue}"이 표준 형식이 아닙니다. '폴더' 또는 '테스트케이스'를 사용하세요.`,
              severity: 'warning'
            });
          }
        }
        
      } catch (error) {
        validationLogger.error(`1단계 - 행 ${index} 처리 중 오류:`, error);
        errors.push({
          type: 'processing_error',
          row: originalIndex + 1,
          column: '전체',
          message: `${originalIndex + 1}번 행 처리 중 오류: ${error.message}`,
          severity: 'error'
        });
      }
    });

    // 2단계: 상위폴더 관계 검증
    validRows.forEach(({ row, originalIndex }, index) => {
      try {
        const rowNumber = originalIndex + 1;
        const isFolder = isFolderRow(row);
        const name = extractFolderName(row);
        const parentFolderName = extractParentFolder(row);

        if (parentFolderName) {
          // 순환 참조 검증 (자기 자신을 상위폴더로 지정)
          if (parentFolderName === name) {
            errors.push({
              type: 'circular_reference',
              row: rowNumber,
              column: '상위폴더',
              message: `${rowNumber}번 행: "${name}"이 자기 자신을 상위폴더로 지정했습니다. 순환 참조는 허용되지 않습니다.`,
              severity: 'error',
              suggestion: '다른 폴더를 상위폴더로 지정하거나 상위폴더 필드를 비워두세요.'
            });
          }

          // 존재하지 않는 상위폴더 검증
          else if (!folderNames.has(parentFolderName)) {
            // 기존 데이터에서도 찾아보기
            const existingFolder = data?.find(item => 
              item.type === 'folder' && item.name === parentFolderName
            );
            
            if (!existingFolder) {
              errors.push({
                type: 'missing_parent_folder',
                row: rowNumber,
                column: '상위폴더',
                message: `${rowNumber}번 행: 상위폴더 "${parentFolderName}"을 찾을 수 없습니다.`,
                severity: 'error',
                suggestion: `"${parentFolderName}" 폴더를 먼저 생성하거나 올바른 폴더명을 입력하세요.`
              });
            }
          }

          // 테스트케이스가 폴더를 상위폴더로 지정하는지 검증
          if (!isFolder && parentFolderName && !folderNames.has(parentFolderName)) {
            // 기존 데이터에서 확인
            const existingItem = data?.find(item => item.name === parentFolderName);
            if (existingItem && existingItem.type !== 'folder') {
              warnings.push({
                type: 'invalid_parent_type',
                row: rowNumber,
                column: '상위폴더',
                message: `${rowNumber}번 행: "${parentFolderName}"은 폴더가 아닙니다. 상위폴더는 폴더 타입이어야 합니다.`,
                severity: 'warning'
              });
            }
          }
        }
      } catch (error) {
        validationLogger.error(`2단계 - 행 ${index} 처리 중 오류:`, error);
        errors.push({
          type: 'processing_error',
          row: originalIndex + 1,
          column: '상위폴더',
          message: `${originalIndex + 1}번 행 상위폴더 검증 중 오류: ${error.message}`,
          severity: 'error'
        });
      }
    });

    // 3단계: 테스트케이스별 스텝 검증
    validRows.forEach(({ row, originalIndex }, index) => {
      try {
        const rowNumber = originalIndex + 1;
        const isFolder = isFolderRow(row);
        
        if (!isFolder) {
          // 스텝이 있는 경우 스텝 내용 검증 (방어적 프로그래밍)
          let hasSteps = false;
          for (let i = 0; i < maxSteps; i++) {
            const stepDescIndex = 8 + (i * 2);
            const stepExpectedIndex = 8 + (i * 2) + 1;
            
            // 배열 범위 검사로 undefined 접근 방지
            if (stepDescIndex >= row.length || stepExpectedIndex >= row.length) {
              continue;
            }
            
            const stepDesc = row[stepDescIndex]?.value;
            const stepExpected = row[stepExpectedIndex]?.value;

            if (stepDesc && typeof stepDesc === 'string' && stepDesc.trim()) {
              hasSteps = true;
              
              // 스텝 설명은 있지만 예상 결과가 없는 경우 경고
              if (!stepExpected || (typeof stepExpected === 'string' && !stepExpected.trim())) {
                warnings.push({
                  type: 'missing_expected_result',
                  row: rowNumber,
                  column: `Expected ${i + 1}`,
                  message: `${rowNumber}번 행: Step ${i + 1}의 예상 결과가 비어있습니다.`,
                  severity: 'warning',
                  suggestion: '각 스텝에 대한 예상 결과를 입력하면 테스트의 명확성이 향상됩니다.'
                });
              }
            }
          }

          // 테스트케이스인데 스텝이 하나도 없는 경우 경고
          if (!hasSteps) {
            warnings.push({
              type: 'no_steps',
              row: rowNumber,
              column: 'Step 1',
              message: `${rowNumber}번 행: 테스트케이스에 실행 단계가 정의되지 않았습니다.`,
              severity: 'warning',
              suggestion: '최소 하나 이상의 테스트 단계를 추가하세요.'
            });
          }
        }
      } catch (error) {
        validationLogger.error(`3단계 - 행 ${index} 처리 중 오류:`, error);
        errors.push({
          type: 'processing_error',
          row: originalIndex + 1,
          column: '스텝',
          message: `${originalIndex + 1}번 행 스텝 검증 중 오류: ${error.message}`,
          severity: 'error'
        });
      }
    });

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRows: validRows.length,
        errorCount: errors.length,
        warningCount: warnings.length,
        folderCount: folderNames.size,
        testCaseCount: validRows.filter(({ row }) => !isFolderRow(row)).length
      }
    };
    
    return result;
    
    } catch (error) {
      validationLogger.error('validateSpreadsheetData 전체 오류:', error);
      return {
        isValid: false,
        errors: [{ type: 'validation_error', message: `데이터 검증 중 오류: ${error.message}` }],
        warnings: [],
        summary: { totalRows: 0, errorCount: 1, warningCount: 0, folderCount: 0, testCaseCount: 0 }
      };
    }
  }, [data, maxSteps, isFolderRow, extractFolderName, extractParentFolder]);

  // ICT-344: 검증 실행 함수 (저장 없이 검증만)
  const handleValidateData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const result = validateSpreadsheetData(spreadsheetData);
      setValidationResult(result);
      setValidationPanelOpen(true);
      
      // 검증 결과를 스프레드시트에 시각적으로 표시
      const styledData = applyValidationStyling(spreadsheetData, result);
      setStyledSpreadsheetData(styledData);
      
      // 결과 요약 알림
      let message = '';
      if (result.isValid) {
        message = `✅ 검증 완료: 모든 데이터가 유효합니다 (${result.summary.totalRows}개 행)`;
      } else {
        message = `⚠️ 검증 완료: ${result.summary.errorCount}개 오류, ${result.summary.warningCount}개 경고 발견`;
      }
      
      setSnackbarMessage(message);
      setSnackbarSeverity(result.isValid ? 'success' : 'warning');
      setSnackbarOpen(true);
      
    } catch (error) {
      validationLogger.error('검증 중 오류:', error);
      setSnackbarMessage('검증 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetData, validateSpreadsheetData, applyValidationStyling]);

  // 일괄 저장 핸들러 (ICT-344: 검증 시스템 통합)
  const handleBulkSave = useCallback(async () => {
    if (!onSave || !hasChanges) return;

    setIsLoading(true);
    try {
      // ICT-344: 저장 전 데이터 검증
      const validationResult = validateSpreadsheetData(spreadsheetData);

      // 검증 오류만 로깅 (경고는 콘솔에 출력하지 않음)
      if (validationResult.errors.length > 0) {
        validationLogger.error('검증 오류:', validationResult.errors);
      }

      // 오류가 있는 경우 저장 중단하고 사용자에게 상세한 피드백 제공
      if (!validationResult.isValid) {
        const errorMessages = validationResult.errors.map(error => error.message);
        const warningMessages = validationResult.warnings.map(warning => warning.message);
        
        let detailedMessage = '⚠️ 데이터 검증 실패\n\n';
        
        // 오류 메시지
        if (errorMessages.length > 0) {
          detailedMessage += '🚨 해결이 필요한 오류:\n';
          errorMessages.forEach((msg, index) => {
            detailedMessage += `${index + 1}. ${msg}\n`;
          });
          detailedMessage += '\n';
        }
        
        // 경고 메시지 (선택적으로 표시)
        if (warningMessages.length > 0) {
          detailedMessage += '⚠️ 권장 사항 (선택사항):\n';
          warningMessages.slice(0, 3).forEach((msg, index) => { // 최대 3개만 표시
            detailedMessage += `${index + 1}. ${msg}\n`;
          });
          if (warningMessages.length > 3) {
            detailedMessage += `... 외 ${warningMessages.length - 3}개 권장 사항\n`;
          }
        }
        
        detailedMessage += `\n📊 검증 요약: ${validationResult.summary.totalRows}개 행 중 ${validationResult.summary.errorCount}개 오류, ${validationResult.summary.warningCount}개 경고`;
        
        setSnackbarMessage(detailedMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setIsLoading(false);
        return; // 저장 중단
      }
      
      // 경고만 있는 경우 알림은 하되 저장은 계속 진행
      if (validationResult.warnings.length > 0) {
        setSnackbarMessage(`⚠️ ${validationResult.warnings.length}개의 권장 사항이 있지만 저장을 진행합니다.`);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }

      // 현재 스프레드시트 데이터를 변환 (상태 업데이트와 분리)

      const convertedTestCases = spreadsheetData
        .filter((row, index) => {
          if (!Array.isArray(row)) {
            logWarn(`행 ${index}이 배열이 아닙니다:`, typeof row, row);
            return false;
          }
          return row.some(cell =>
            typeof cell?.value === 'string' && cell.value.trim()
          );
        })
        .map((row, index) => {
          try {

            // 안전한 배열 접근을 위한 검사
            if (!Array.isArray(row) || row.length < 10) {
              logError(`행 ${index}의 구조가 잘못됨: 길이=${row.length}, 최소 10개 컬럼 필요`);
              throw new Error(`행 ${index + 1}의 데이터 구조가 올바르지 않습니다.`);
            }

            // 폴더인지 테스트케이스인지 판단 - 폴더셀 방식
            const isFolder = isFolderRow(row);

            // ID로 기존 테스트케이스 찾기 (인덱스 대신 ID 매칭)
            // ICT-373: displayId가 없는 경우를 대비하여 다양한 방법으로 검색
            const displayId = row[0]?.value || '';
            let existingTestCase = null;

            if (displayId && data) {
              // 1순위: displayId 또는 sequentialId로 찾기
              existingTestCase = data.find(tc =>
                tc.displayId === displayId ||
                tc.sequentialId?.toString() === displayId
              );

              // 2순위: UUID로 찾기 (displayId가 실제로 UUID인 경우)
              if (!existingTestCase && displayId.includes('-')) {
                existingTestCase = data.find(tc => tc.id === displayId);
              }
            }

            let steps = [];
            let name = row[6]?.value || ''; // 일곱 번째 셀(이름)에서 이름 가져오기 (인덱스 6)

            // 3순위: displayId가 없는 경우, 인덱스로 매칭 시도 (레거시 데이터 대응)
            if (!existingTestCase && index < (data?.length || 0)) {
              const potentialMatch = data[index];
              // 이름이 같으면 같은 항목으로 간주 (조심스럽게)
              if (potentialMatch && potentialMatch.name === name) {
                existingTestCase = potentialMatch;
              }
            }
            let parentFolderName = extractParentFolder(row); // 상위폴더 추출 (ICT-343)

          if (isFolder) {
            // 폴더인 경우: steps는 빈 배열로 유지
            steps = [];
          } else {
            // 테스트케이스인 경우: 스텝 처리 (방어적 프로그래밍)
            for (let i = 0; i < maxSteps; i++) {
              const stepDescIndex = 10 + (i * 2); // 10컬럼 구조로 인덱스 업데이트 (작성자/수정자 컬럼 추가)
              const stepExpectedIndex = 10 + (i * 2) + 1;

              // 배열 범위 검사로 undefined 접근 방지
              if (stepDescIndex >= row.length || stepExpectedIndex >= row.length) {
                logWarn(`배열 범위 초과: row 길이=${row.length}, stepDescIndex=${stepDescIndex}, stepExpectedIndex=${stepExpectedIndex}`);
                continue;
              }

              const stepDesc = row[stepDescIndex]?.value || '';
              const stepExpected = row[stepExpectedIndex]?.value || '';

              if (typeof stepDesc === 'string' && stepDesc.trim()) { // 빈 스텝은 제외
                steps.push({
                  stepNumber: i + 1,
                  description: stepDesc,
                  expectedResult: typeof stepExpected === 'string' ? stepExpected : '',
                });
              }
            }
          }

          // ICT-373: 폴더 중복 생성 방지 - 이름과 parentId로 기존 폴더 찾기
          const parentId = (() => {
            // 상위폴더명이 있으면 폴더 ID 찾기, 없으면 최상위(null)
            if (parentFolderName && parentFolderName.trim()) {
              const foundFolderId = findFolderIdByName(parentFolderName, data || []);
              return foundFolderId || null;
            }
            // 상위폴더명이 비어있으면 무조건 최상위(null)
            return null;
          })();

          // 폴더인 경우 이름과 parentId로 기존 폴더 찾기
          if (isFolder && !existingTestCase && data) {
            existingTestCase = data.find(tc =>
              tc.type === 'folder' &&
              tc.name === name &&
              tc.parentId === parentId
            );
          }

          const result = {
            id: existingTestCase?.id || `temp-${Date.now()}-${index}`,
            sequentialId: existingTestCase?.sequentialId || null, // ICT-339: 새 테스트케이스는 백엔드에서 자동 할당
            name: name,
            description: isFolder ? (row[7]?.value || `${name} 폴더`) : (row[7]?.value || ''), // 설명 컬럼 (인덱스 7)
            preCondition: isFolder ? '' : (row[8]?.value || ''), // 사전조건 컬럼 (인덱스 8)
            expectedResults: isFolder ? '' : (row[9]?.value || ''), // 예상결과 컬럼 (인덱스 9)
            steps: steps,
            type: isFolder ? 'folder' : 'testcase',
            displayOrder: row[3]?.value || existingTestCase?.displayOrder || (index + 1), // 사용자가 수정한 순서 (인덱스 3)
            projectId: projectId,
            parentId: parentId // 이미 위에서 계산한 parentId 사용
          };
          
          return result;
          
          } catch (error) {
            logError(`행 ${index} 변환 중 오류:`, error);
            throw new Error(`행 ${index + 1} 처리 중 오류: ${error.message}`);
          }
        });

      // ICT-373: 원본 데이터와 비교하여 실제 변경된 항목만 필터링
      const originalDataMap = new Map();
      data.forEach(item => {
        if (item.id && !item.id.startsWith('temp-')) {
          originalDataMap.set(item.id, item);
        }
      });

      const changedTestCases = convertedTestCases.filter(tc => {
        // 새로운 테스트케이스 (temp- ID 또는 ID 없음)
        if (!tc.id || tc.id.startsWith('temp-')) {
          return true;
        }

        // 원본 데이터 찾기
        const original = originalDataMap.get(tc.id);
        if (!original) {
          return true; // 원본이 없으면 새 항목으로 간주
        }

        // 필드별 변경 여부 확인
        const isChanged =
          tc.name !== original.name ||
          tc.description !== original.description ||
          tc.type !== original.type ||
          tc.preCondition !== original.preCondition ||
          tc.expectedResults !== original.expectedResults ||
          tc.displayOrder !== original.displayOrder ||
          tc.parentId !== original.parentId ||
          JSON.stringify(tc.steps) !== JSON.stringify(original.steps);

        return isChanged;
      });

      // 변경된 항목이 없으면 조기 리턴
      if (changedTestCases.length === 0) {
        setSnackbarMessage('변경된 항목이 없습니다.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setHasChanges(false);
        return;
      }

      // displayOrder 중복 자동 재조정 (같은 parentId 내에서 중복 제거)
      const displayOrderMap = new Map(); // key: parentId, value: Map<displayOrder, count>
      const adjustedTestCases = changedTestCases.map((tc, index) => {
        const parentKey = tc.parentId || 'root';

        if (!displayOrderMap.has(parentKey)) {
          displayOrderMap.set(parentKey, new Map());
        }

        const orderMap = displayOrderMap.get(parentKey);
        let targetOrder = tc.displayOrder;

        // 중복된 displayOrder 발견 시 자동으로 증가
        while (orderMap.has(targetOrder)) {
          targetOrder += 1;
          logWarn(`행 ${index + 1}: displayOrder ${tc.displayOrder} 중복 발견, ${targetOrder}로 자동 조정 (parentId: ${parentKey})`);
        }

        orderMap.set(targetOrder, (orderMap.get(targetOrder) || 0) + 1);

        return {
          ...tc,
          displayOrder: targetOrder
        };
      });

      // ICT-373: 배치 저장 API 호출 (변경된 항목만)
      const batchResult = await testCaseService.batchSaveTestCases(adjustedTestCases);

      // 배치 저장 결과 처리
      if (batchResult.isSuccess || batchResult.failureCount === 0) {
        // 완전 성공
        setHasChanges(false);
        const folderCount = batchResult.savedTestCases.filter(tc => tc.type === 'folder').length;
        const testCaseCount = batchResult.savedTestCases.filter(tc => tc.type === 'testcase').length;
        setSnackbarMessage(`✅ 배치 저장 완료: 폴더 ${folderCount}개, 테스트케이스 ${testCaseCount}개`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // 저장 완료 후 onSave 콜백 호출 (상위 컴포넌트 상태 업데이트)
        if (onSave) {
          await onSave(batchResult.savedTestCases);
        }

        // 데이터 새로고침
        if (onRefresh) {
          await onRefresh();
        }

      } else {
        // 부분 실패
        setHasChanges(false); // 저장 시도는 완료되었으므로 변경사항 플래그 해제

        let errorMessage = `⚠️ 배치 저장 부분 실패:\n`;
        errorMessage += `✅ 성공: ${batchResult.successCount}개\n`;
        errorMessage += `❌ 실패: ${batchResult.failureCount}개\n\n`;

        // 실패한 항목 상세 정보 (최대 5개만 표시)
        const maxErrors = Math.min(5, batchResult.errors.length);
        errorMessage += '실패 내역:\n';
        for (let i = 0; i < maxErrors; i++) {
          const error = batchResult.errors[i];
          errorMessage += `${i + 1}. [행 ${error.index + 1}] ${error.testCaseName}: ${error.errorMessage}\n`;
        }

        if (batchResult.errors.length > maxErrors) {
          errorMessage += `... 외 ${batchResult.errors.length - maxErrors}개 오류\n`;
        }

        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);

        // 성공한 항목만 상위 컴포넌트에 전달
        if (onSave && batchResult.savedTestCases.length > 0) {
          await onSave(batchResult.savedTestCases);
        }

        // 데이터 새로고침
        if (onRefresh) {
          await onRefresh();
        }
      }
    } catch (error) {
      logError('일괄 저장 실패:', error);
      setSnackbarMessage('저장 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetData, validateSpreadsheetData, data, maxSteps, onSave, hasChanges, isFolderRow, extractParentFolder, findFolderIdByName]);

  // 새로고침 핸들러 (ICT-158: 백엔드에서 최신 데이터 가져오기)
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    } else {
      // onRefresh가 없는 경우 기존 방식으로 폴백
      const originalData = data || [];
      if (originalData.length === 0) {
        const baseFields = [
          { value: '' }, // ID (순차 ID)
          { value: '', readOnly: true }, // 작성자 (읽기 전용)
          { value: '', readOnly: true }, // 수정자 (읽기 전용)
          { value: '' }, // 순서 (displayOrder)
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
        // 트리 구조를 평면화하면서 트리 순서를 유지
        const flattenedOriginalData = flattenTreeInOrder(originalData);

        const convertedData = flattenedOriginalData.map(testCase => {
          // 안전한 상위폴더명 추출 (새로고침 시)
          let parentFolderName = '';
          if (testCase.parentId) {
            const parentFolder = flattenedOriginalData.find(item => item.id === testCase.parentId);
            parentFolderName = parentFolder?.name || '';
          }

          const row = [
            { value: testCase.displayId || testCase.sequentialId || '', readOnly: true }, // ICT-341: Display ID (프로젝트코드-넘버 형식) - 읽기 전용
            { value: testCase.createdBy || '', readOnly: true }, // 작성자 (읽기 전용)
            { value: testCase.updatedBy || '', readOnly: true }, // 수정자 (읽기 전용)
            { value: testCase.displayOrder || '' }, // 순서 (displayOrder)
            { value: testCase.type === 'folder' ? t('testcase.type.folder', '폴더') : t('testcase.type.testcase', '테스트케이스'), readOnly: true }, // 타입 - 읽기 전용
            { value: parentFolderName || '' }, // 상위폴더 - 빈 문자열 또는 실제 폴더명만 허용
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
          // 기본 10개 컬럼은 유지 (ID, 작성자, 수정자, 순서, 타입, 상위폴더, 이름, 설명, 사전조건, 예상결과)
          const baseRow = row.slice(0, 10);

          // 기존 스텝 데이터 추출 (10컬럼 구조)
          const existingSteps = [];
          const currentStepCount = Math.floor((row.length - 10) / 2);
          for (let i = 0; i < currentStepCount; i++) {
            existingSteps.push({
              description: row[10 + i * 2]?.value || '',
              expectedResult: row[10 + i * 2 + 1]?.value || ''
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
      setSnackbarMessage(t('testcase.spreadsheet.notification.stepChanged', '스텝 수가 {count}개로 변경되었습니다.').replace('{count}', newStepCount));
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

  // Export 관련 함수들
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // 스프레드시트 데이터를 export용으로 변환하는 함수
  const convertDataForExport = useCallback(() => {
    if (!spreadsheetData || spreadsheetData.length === 0) {
      return { headers: memoizedColumnLabels, rows: [] };
    }

    // 빈 행 제거
    const validRows = spreadsheetData.filter(row =>
      Array.isArray(row) && row.some(cell =>
        typeof cell?.value === 'string' && cell.value.trim()
      )
    );

    // 헤더와 데이터 행으로 변환
    const exportData = validRows.map(row =>
      row.map(cell => cell?.value || '')
    );

    return {
      headers: memoizedColumnLabels,
      rows: exportData
    };
  }, [spreadsheetData, memoizedColumnLabels]);

  // CSV Export 함수
  const handleExportCSV = useCallback(() => {
    try {
      const { headers, rows } = convertDataForExport();

      if (rows.length === 0) {
        setSnackbarMessage('내보낼 데이터가 없습니다.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      // CSV 형식으로 변환
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      // BOM 추가 (한글 깨짐 방지)
      const BOM = '\uFEFF';
      const csvWithBom = BOM + csvContent;

      // 다운로드
      const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `testcases_${timestamp}.csv`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbarMessage(`CSV 파일이 다운로드되었습니다: ${filename}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      logError('CSV Export 실패:', error);
      setSnackbarMessage('CSV 다운로드 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      handleExportMenuClose();
    }
  }, [convertDataForExport]);

  // Excel Export 함수
  const handleExportExcel = useCallback(() => {
    try {
      const { headers, rows } = convertDataForExport();

      if (rows.length === 0) {
        setSnackbarMessage('내보낼 데이터가 없습니다.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      // 워크북 생성
      const workbook = XLSX.utils.book_new();

      // 워크시트 데이터 구성 (헤더 + 데이터)
      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // 컬럼 너비 자동 조정
      const maxWidths = headers.map((header, colIndex) => {
        const headerLength = String(header).length;
        const maxCellLength = Math.max(
          ...rows.map(row => String(row[colIndex] || '').length)
        );
        return Math.min(Math.max(headerLength, maxCellLength, 10), 50);
      });

      worksheet['!cols'] = maxWidths.map(width => ({ wch: width }));

      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TestCases');

      // 파일 다운로드
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `testcases_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      setSnackbarMessage(`Excel 파일이 다운로드되었습니다: ${filename}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      logError('Excel Export 실패:', error);
      setSnackbarMessage('Excel 다운로드 중 오류가 발생했습니다: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      handleExportMenuClose();
    }
  }, [convertDataForExport]);

  // 컬럼 라벨 정의 (메모이제이션으로 최적화됨)
  const columnLabels = memoizedColumnLabels;

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

  return (
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
        {/* 헤더 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('testcase.spreadsheet.header.title', '테스트케이스 스프레드시트')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={t('testcase.spreadsheet.status.rows', '{count}개 행', { count: spreadsheetData.filter(row => row.some(cell =>
                  typeof cell?.value === 'string' && cell.value.trim()
                )).length })}
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

          {/* 액션 버튼들 */}
          {!readOnly && (
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                startIcon={<CreateNewFolderIcon />}
                onClick={handleAddFolder}
                disabled={isLoading}
                color="secondary"
              >
                {t('testcase.spreadsheet.button.addFolder', '폴더 추가')}
              </Button>

              {/* ICT-344: 데이터 검증 버튼 */}
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

              {/* Export 버튼 */}
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
                onClick={handleBulkSave}
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
              <strong>{t('testcase.spreadsheet.usage.title', '사용법:')}</strong> {t('testcase.spreadsheet.usage.basicUsage', 'Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.')}
              <br />
              <strong>{t('testcase.spreadsheet.usage.folderFunction', '폴더 기능: "폴더 추가" 버튼을 클릭하거나 이름 셀에 "📁 폴더명" 형태로 입력하면 폴더가 생성됩니다.')}</strong>
              <br />
              <strong>{t('testcase.spreadsheet.usage.stepManagement', '스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).')}</strong>
            </Typography>
          </Alert>
        )}

        {/* 스프레드시트 */}
        <Box sx={{ mt: 2, minHeight: 300, overflow: 'auto' }}>
          {spreadsheetData.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography>스프레드시트 데이터가 비어있습니다.</Typography>
            </Alert>
          ) : (
            <Spreadsheet
              key={`spreadsheet-${projectId || 'default'}-${maxSteps}-${spreadsheetKey}`}
              data={spreadsheetData}
              onChange={readOnly ? undefined : handleSpreadsheetChange}
              columnLabels={columnLabels}
              style={{ border: '1px solid #e0e0e0' }} // 디버깅용 보더
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
            onChange={(e) => setTempMaxSteps(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            inputProps={{ min: 1, max: 10 }}
            helperText={t('testcase.spreadsheet.stepDialog.helper', '1개부터 10개까지 설정 가능합니다.')}
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

      {/* 폴더 생성 다이얼로그 */}
      <Dialog
        open={folderDialogOpen}
        onClose={handleFolderDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('testcase.spreadsheet.folderDialog.title', '새 폴더 생성')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('testcase.spreadsheet.folderDialog.description', '새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('testcase.spreadsheet.folderDialog.label', '폴더명')}
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && folderName.trim()) {
                handleCreateFolder();
              }
            }}
            placeholder={t('testcase.spreadsheet.folderDialog.placeholder', '예: API 테스트, UI 테스트')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFolderDialogClose}>{t('testcase.spreadsheet.folderDialog.cancel', '취소')}</Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained" 
            disabled={!folderName.trim()}
            startIcon={<CreateNewFolderIcon />}
          >
            {t('testcase.spreadsheet.folderDialog.create', '생성')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ICT-344: 검증 결과 상세 패널 */}
      <Dialog
        open={validationPanelOpen}
        onClose={() => setValidationPanelOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {validationResult?.isValid ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="success" />
                <Typography variant="h6">데이터 검증 완료</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6">데이터 검증 결과</Typography>
              </Box>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {validationResult && (
            <Box>
              {/* 요약 정보 */}
              <Card sx={{ mb: 2, bgcolor: validationResult.isValid ? 'success.light' : 'warning.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 검증 요약
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${validationResult.summary.totalRows}개 행`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${validationResult.summary.folderCount}개 폴더`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${validationResult.summary.testCaseCount}개 테스트케이스`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                    {validationResult.summary.errorCount > 0 && (
                      <Chip
                        label={`${validationResult.summary.errorCount}개 오류`}
                        size="small"
                        color="error"
                        variant="filled"
                      />
                    )}
                    {validationResult.summary.warningCount > 0 && (
                      <Chip
                        label={`${validationResult.summary.warningCount}개 경고`}
                        size="small"
                        color="warning"
                        variant="filled"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* 오류 목록 */}
              {validationResult.errors.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ErrorIcon color="error" />
                      <Typography variant="h6" color="error.main">
                        해결이 필요한 오류 ({validationResult.errors.length}개)
                      </Typography>
                    </Box>
                    {validationResult.errors.map((error, index) => (
                      <Alert
                        key={index}
                        severity="error"
                        sx={{ mb: 1 }}
                        action={
                          <Chip
                            label={`${error.row}행`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        }
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {error.column} 컬럼
                          </Typography>
                          <Typography variant="body2">
                            {error.message}
                          </Typography>
                          {error.suggestion && (
                            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                              💡 해결 방법: {error.suggestion}
                            </Typography>
                          )}
                        </Box>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 경고 목록 */}
              {validationResult.warnings.length > 0 && (
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <WarningIcon color="warning" />
                      <Typography variant="h6" color="warning.main">
                        권장 사항 ({validationResult.warnings.length}개)
                      </Typography>
                    </Box>
                    {validationResult.warnings.map((warning, index) => (
                      <Alert
                        key={index}
                        severity="warning"
                        sx={{ mb: 1 }}
                        action={
                          <Chip
                            label={`${warning.row}행`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        }
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {warning.column} 컬럼
                          </Typography>
                          <Typography variant="body2">
                            {warning.message}
                          </Typography>
                          {warning.suggestion && (
                            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                              💡 개선 방법: {warning.suggestion}
                            </Typography>
                          )}
                        </Box>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 검증 성공 메시지 */}
              {validationResult.isValid && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    ✅ 모든 데이터가 유효합니다! 저장할 준비가 완료되었습니다.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationPanelOpen(false)}>닫기</Button>
          {validationResult && !validationResult.isValid && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => {
                setValidationPanelOpen(false);
                // 스프레드시트의 첫 번째 오류 행으로 스크롤 (구현 가능하다면)
                if (validationResult.errors.length > 0) {
                }
              }}
            >
              오류 위치로 이동
            </Button>
          )}
        </DialogActions>
      </Dialog>

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