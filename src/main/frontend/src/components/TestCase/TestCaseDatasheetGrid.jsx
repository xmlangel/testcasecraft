// src/components/TestCase/TestCaseDatasheetGrid.jsx

import React, { useState, useEffect, useCallback, useMemo, Component } from 'react';
import { listToTree } from '../../utils/treeUtils.jsx';
import PropTypes from 'prop-types';
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
  TableChart as TableIcon,
  GridOn as GridIcon
} from '@mui/icons-material';
// react-datasheet-grid 라이브러리는 @tanstack/react-virtual 호환성 문제로 비활성화
// 대신 향상된 fallback 테이블을 사용합니다
let DataSheetGrid = null;
let keyColumn = null;
let textColumn = null;

// 에러 바운더리 컴포넌트
class GridErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataSheetGrid Error:', error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('testcase.spreadsheet.error.title', '스프레드시트 로딩 오류')}
            </Typography>
            <Typography variant="body2">
              {t('testcase.spreadsheet.error.description', 'react-datasheet-grid를 로드하는 중 오류가 발생했습니다.')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {this.state.error?.message}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {t('testcase.spreadsheet.button.retry', '다시 시도')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// 다중 줄 텍스트를 위한 커스텀 컬럼 컴포넌트
const multilineTextColumn = (t) => ({
  component: ({ active, data, setData, ...rest }) => {
    return (
      <textarea
        {...rest}
        value={data || ''}
        onChange={(e) => setData(e.target.value)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: '14px',
          fontFamily: 'inherit',
          padding: '8px',
          backgroundColor: 'transparent',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        rows={3}
        placeholder={t('testcase.spreadsheet.placeholder.multiline', '여러 줄 입력 가능...')}
      />
    );
  },
  disableKeys: true,
  keepFocus: true,
  disabled: ({ rowData }) => rowData?.readOnly === true,
  copyValue: ({ rowData, columnId }) => rowData?.[columnId] || '',
  pasteValue: ({ rowData, columnId, value }) => ({ ...rowData, [columnId]: value }),
  deleteValue: ({ rowData, columnId }) => ({ ...rowData, [columnId]: '' })
});

// 일반 텍스트 컬럼 (단일 라인)
const singleLineTextColumn = (t) => ({
  component: ({ active, data, setData, ...rest }) => {
    return (
      <input
        {...rest}
        type="text"
        value={data || ''}
        onChange={(e) => setData(e.target.value)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          fontSize: '14px',
          fontFamily: 'inherit',
          padding: '8px',
          backgroundColor: 'transparent'
        }}
        placeholder={t('testcase.spreadsheet.placeholder.text', '텍스트 입력...')}
      />
    );
  },
  disableKeys: true,
  keepFocus: true,
  disabled: ({ rowData }) => rowData?.readOnly === true,
  copyValue: ({ rowData, columnId }) => rowData?.[columnId] || '',
  pasteValue: ({ rowData, columnId, value }) => ({ ...rowData, [columnId]: value }),
  deleteValue: ({ rowData, columnId }) => ({ ...rowData, [columnId]: '' })
});

const TestCaseDatasheetGrid = ({
  data,
  onChange,
  onSave,
  onRefresh,
  readOnly = false,
  projectId
}) => {
  const { t } = useI18n();
  const [gridData, setGridData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // 동적 스텝 관리 상태
  const [maxSteps, setMaxSteps] = useState(3);
  const [stepMenuAnchor, setStepMenuAnchor] = useState(null);
  const [stepSettingsOpen, setStepSettingsOpen] = useState(false);
  const [tempMaxSteps, setTempMaxSteps] = useState(3);

  // 트리 구조를 평면화하면서 트리 순서를 유지하는 함수 (TestCaseTree.renderTree와 완전히 동일한 로직)
  const flattenTreeInOrder = useCallback((data) => {
    console.log('[flattenTreeInOrder] 입력 데이터:', data);
    console.log('[flattenTreeInOrder] 데이터 길이:', data?.length);

    if (!data || data.length === 0) return [];

    // AI 생성 데이터 감지 (명시적 플래그를 우선 확인하여 안전성 보장)
    const isAIGeneratedData = data.some(item =>
      item.__isAIGenerated === true ||                    // 1순위: 명시적 플래그 (가장 안전)
      (item.id && item.id.startsWith('temp-ai-'))        // 2순위: temp-ai- ID (백업)
    );

    console.log('[flattenTreeInOrder] AI 생성 데이터 여부:', isAIGeneratedData);

    // AI 생성 데이터는 트리 변환 없이 그대로 반환 (이미 평면화되어 있음)
    if (isAIGeneratedData) {
      console.log('[flattenTreeInOrder] AI 생성 데이터 감지, 트리 변환 건너뜀');
      return data;
    }

    // 트리 구조로 변환 (TestCaseTree와 동일: filteredTestCases -> listToTree)
    const treeData = listToTree(data, null);
    console.log('[flattenTreeInOrder] 트리 데이터:', treeData);
    console.log('[flattenTreeInOrder] 트리 데이터 길이:', treeData?.length);

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

    const result = flattenWithRenderTreeLogic(treeData);
    console.log('[flattenTreeInOrder] 평면화 결과:', result);
    console.log('[flattenTreeInOrder] 평면화 결과 길이:', result?.length);
    return result;
  }, []);

  // 데이터 기반으로 최대 스텝 수 감지
  useEffect(() => {
    if (data && data.length > 0) {
      const maxStepsInData = Math.max(
        3,
        ...data.map(tc => tc.steps?.length || 0)
      );
      
      if (maxStepsInData > maxSteps && maxStepsInData <= 10) {
        setMaxSteps(maxStepsInData);
        setTempMaxSteps(maxStepsInData);
      }
    }
  }, [data, maxSteps]);

  // 동적 컬럼 생성
  const columns = useMemo(() => {
    // DataSheetGrid가 로드되지 않은 경우 기본 컬럼 구조 사용
    if (!keyColumn) {
      const baseColumns = [
        {
          key: 'displayId', // ICT-341: displayId 사용
          title: 'ID',
          minWidth: 80,
          maxWidth: 120
        },
        {
          key: 'displayOrder',
          title: t('testcase.spreadsheet.column.order', '순서'),
          minWidth: 80,
          maxWidth: 100
        },
        {
          key: 'type',
          title: t('testcase.spreadsheet.column.type', '타입'),
          minWidth: 100,
          maxWidth: 120
        },
        {
          key: 'parentFolder',
          title: t('testcase.spreadsheet.column.parentFolder', '상위폴더'),
          minWidth: 120,
          maxWidth: 180
        },
        {
          key: 'name',
          title: t('testcase.spreadsheet.column.name', '이름'),
          minWidth: 150,
          maxWidth: 250
        },
        {
          key: 'description',
          title: t('testcase.spreadsheet.column.description', '설명'),
          minWidth: 200,
          maxWidth: 300
        },
        {
          key: 'preCondition',
          title: t('testcase.spreadsheet.column.preCondition', '사전조건'),
          minWidth: 180,
          maxWidth: 280
        },
        {
          key: 'expectedResults',
          title: t('testcase.spreadsheet.column.expectedResults', '예상결과'),
          minWidth: 180,
          maxWidth: 280
        }
      ];

      // 동적 스텝 컬럼 추가 (기본 구조)
      const stepColumns = [];
      for (let i = 0; i < maxSteps; i++) {
        stepColumns.push(
          {
            key: `step${i + 1}_description`,
            title: t('testcase.spreadsheet.column.step', 'Step {number}', { number: i + 1 }),
            minWidth: 150,
            maxWidth: 250
          },
          {
            key: `step${i + 1}_expected`,
            title: t('testcase.spreadsheet.column.expected', 'Expected {number}', { number: i + 1 }),
            minWidth: 150,
            maxWidth: 250
          }
        );
      }

      return [...baseColumns, ...stepColumns];
    }

    // DataSheetGrid용 컬럼 구조 (ICT-341: Display ID, ICT-343: 폴더 지원, 순서 컬럼 추가)
    const baseColumns = [
      {
        ...keyColumn('displayId', {
          ...singleLineTextColumn,
          disabled: () => true // ICT-341: Display ID는 읽기 전용
        }),
        title: 'ID',
        minWidth: 80,
        maxWidth: 120
      },
      {
        ...keyColumn('displayOrder', singleLineTextColumn),
        title: t('testcase.spreadsheet.column.order', '순서'),
        minWidth: 80,
        maxWidth: 100
      },
      {
        ...keyColumn('type', singleLineTextColumn),
        title: t('testcase.spreadsheet.column.type', '타입'),
        minWidth: 100,
        maxWidth: 120
      },
      {
        ...keyColumn('parentFolder', singleLineTextColumn),
        title: t('testcase.spreadsheet.column.parentFolder', '상위폴더'),
        minWidth: 120,
        maxWidth: 180
      },
      {
        ...keyColumn('name', singleLineTextColumn),
        title: t('testcase.spreadsheet.column.name', '이름'),
        minWidth: 150,
        maxWidth: 250
      },
      {
        ...keyColumn('description', multilineTextColumn),
        title: t('testcase.spreadsheet.column.description', '설명'),
        minWidth: 200,
        maxWidth: 300
      },
      {
        ...keyColumn('preCondition', multilineTextColumn),
        title: t('testcase.spreadsheet.column.preCondition', '사전조건'),
        minWidth: 180,
        maxWidth: 280
      },
      {
        ...keyColumn('expectedResults', multilineTextColumn),
        title: t('testcase.spreadsheet.column.expectedResults', '예상결과'),
        minWidth: 180,
        maxWidth: 280
      }
    ];

    // 동적 스텝 컬럼 추가 (DataSheetGrid 전용)
    const stepColumns = [];
    for (let i = 0; i < maxSteps; i++) {
      stepColumns.push(
        {
          ...keyColumn(`step${i + 1}_description`, multilineTextColumn),
          title: t('testcase.spreadsheet.column.step', 'Step {number}', { number: i + 1 }),
          minWidth: 150,
          maxWidth: 250
        },
        {
          ...keyColumn(`step${i + 1}_expected`, multilineTextColumn),
          title: t('testcase.spreadsheet.column.expected', 'Expected {number}', { number: i + 1 }),
          minWidth: 150,
          maxWidth: 250
        }
      );
    }

    return [...baseColumns, ...stepColumns];
  }, [maxSteps, keyColumn]);

  // 테스트케이스 데이터를 그리드 형태로 변환
  const convertDataToGrid = useCallback((testCases) => {
    if (!testCases || testCases.length === 0) {
      // 기본 빈 행들 생성
      const emptyRows = Array.from({ length: 10 }, (_, index) => {
        const row = {
          id: `empty-${index}`,
          displayId: '', // ICT-341: Display ID (프로젝트코드-넘버 형식)
          displayOrder: '', // 순서 (displayOrder)
          type: '', // ICT-343: 타입 (폴더/테스트케이스)
          parentFolder: '', // ICT-343: 상위폴더
          name: '',
          description: '',
          preCondition: '',
          expectedResults: ''
        };

        // 동적 스텝 필드 추가
        for (let i = 0; i < maxSteps; i++) {
          row[`step${i + 1}_description`] = '';
          row[`step${i + 1}_expected`] = '';
        }

        return row;
      });
      return emptyRows;
    }

    // 트리 구조를 평면화하면서 트리 순서를 유지
    const flattenedTestCases = flattenTreeInOrder(testCases);

    return flattenedTestCases.map((testCase, index) => {
      const row = {
        id: testCase.id || `temp-${Date.now()}-${index}`,
        displayId: testCase.displayId || testCase.sequentialId || '', // ICT-341: Display ID 우선, 없으면 순차 ID
        displayOrder: testCase.displayOrder || '', // 순서 (displayOrder)
        type: testCase.type === 'folder' ? t('testcase.type.folder', '폴더') : t('testcase.type.testcase', '테스트케이스'), // ICT-343: 타입
        parentFolder: testCase.parentId ? (flattenedTestCases.find(item => item.id === testCase.parentId)?.name || '') : '', // ICT-343: 상위폴더명 표시
        name: testCase.name || '',
        description: testCase.description || '',
        preCondition: testCase.preCondition || '',
        expectedResults: testCase.expectedResults || '',
        originalData: testCase
      };

      // 스텝 데이터 변환
      for (let i = 0; i < maxSteps; i++) {
        const stepNum = i + 1;

        // AI 생성 데이터는 이미 step1_description, step1_expectedResult 형식으로 평면화되어 있음
        if (testCase[`step${stepNum}_description`] !== undefined) {
          console.log(`[convertDataToGrid] AI 데이터 step${stepNum}:`, {
            description: testCase[`step${stepNum}_description`],
            expectedResult: testCase[`step${stepNum}_expectedResult`]
          });
          row[`step${stepNum}_description`] = testCase[`step${stepNum}_description`] || '';
          row[`step${stepNum}_expected`] = testCase[`step${stepNum}_expectedResult`] || '';
        } else {
          // 일반 데이터는 steps 배열에서 가져옴
          const step = testCase.steps?.[i];
          row[`step${stepNum}_description`] = step?.description || '';
          row[`step${stepNum}_expected`] = step?.expectedResult || '';
        }
      }

      return row;
    });
  }, [maxSteps]);

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

  // 그리드 데이터를 테스트케이스 형태로 변환
  const convertGridToData = useCallback((gridRows) => {
    return gridRows
      .filter(row => row.name?.trim() || Object.values(row).some(val => typeof val === 'string' && val.trim()))
      .map((row, index) => {
        // 폴더인지 테스트케이스인지 판단
        const folderText = t('testcase.type.folder', '폴더').toLowerCase();
        const isFolder = row.type?.trim()?.toLowerCase() === folderText ||
                        row.type?.trim()?.toLowerCase() === 'folder';
                        
        const steps = [];

        // 테스트케이스인 경우에만 스텝 변환
        if (!isFolder) {
          for (let i = 0; i < maxSteps; i++) {
            const stepDesc = row[`step${i + 1}_description`] || '';
            const stepExpected = row[`step${i + 1}_expected`] || '';

            if (stepDesc.trim()) {
              steps.push({
                stepNumber: i + 1,
                description: stepDesc,
                expectedResult: stepExpected
              });
            }
          }
        }

        return {
          id: row.originalData?.id || row.id || `temp-${Date.now()}-${index}`,
          sequentialId: row.originalData?.sequentialId || null, // ICT-339: 기존 순차 ID 유지 (내부적으로 사용)
          displayId: row.originalData?.displayId || null, // ICT-341: Display ID는 백엔드에서 자동 생성
          name: row.name || '',
          description: isFolder ? `${row.name} 폴더` : (row.description || ''),
          preCondition: isFolder ? '' : (row.preCondition || ''),
          expectedResults: isFolder ? '' : (row.expectedResults || ''),
          steps: steps,
          type: isFolder ? 'folder' : 'testcase', // ICT-343: 폴더 타입 지원
          displayOrder: row.displayOrder ? parseInt(row.displayOrder) || (index + 1) : (index + 1), // 순서 컬럼에서 값 가져오기, 없으면 인덱스 기반
          projectId: projectId,
          parentId: (() => {
            // ICT-357: 고급 스프레드시트 저장 시 하위 테스트케이스 데이터 손실 방지
            if (row.parentFolder && row.parentFolder.trim()) {
              const foundFolderId = findFolderIdByName(row.parentFolder, data || []);
              if (foundFolderId) {
                return foundFolderId;
              } else {
                // 폴더를 찾을 수 없으면 기존 parentId를 유지 (데이터 손실 방지)
                return row.originalData?.parentId || null;
              }
            } else {
              // 상위폴더명이 비어있으면 기존 parentId 유지 (ICT-357 버그 수정)
              return row.originalData?.parentId || null;
            }
          })() // ICT-343: 상위폴더명을 실제 폴더 ID로 변환
        };
      });
  }, [maxSteps, projectId, findFolderIdByName, data]);

  // 데이터 변경 시 그리드 데이터 업데이트 (안전한 처리)
  useEffect(() => {
    console.log('[TestCaseDatasheetGrid] data prop 받음:', data);
    console.log('[TestCaseDatasheetGrid] data 길이:', data?.length);
    if (data && data.length > 0) {
      console.log('[TestCaseDatasheetGrid] 첫 번째 데이터:', data[0]);
      console.log('[TestCaseDatasheetGrid] 첫 번째 데이터 키:', Object.keys(data[0] || {}));
    }

    try {
      const newGridData = convertDataToGrid(data);
      console.log('[TestCaseDatasheetGrid] convertDataToGrid 결과:', newGridData);
      console.log('[TestCaseDatasheetGrid] newGridData 길이:', newGridData?.length);
      if (newGridData && newGridData.length > 0) {
        console.log('[TestCaseDatasheetGrid] 변환된 첫 번째 데이터:', newGridData[0]);
        console.log('[TestCaseDatasheetGrid] 변환된 첫 번째 데이터 키:', Object.keys(newGridData[0] || {}));
      }

      // 유효한 데이터인지 확인
      if (Array.isArray(newGridData) && newGridData.length >= 0) {
        setGridData(newGridData);
        console.log('[TestCaseDatasheetGrid] gridData 설정 완료');

        // AI 생성 데이터일 경우 자동으로 hasChanges를 true로 설정 (저장 버튼 활성화)
        if (data && data.length > 0 && data.some(item => item.__isAIGenerated === true)) {
          console.log('[TestCaseDatasheetGrid] AI 생성 데이터 감지 → hasChanges = true');
          setHasChanges(true);
        }
      }
    } catch (error) {
      console.error('[TestCaseDatasheetGrid] 데이터 변환 오류:', error);
      // 오류 발생 시 기본 빈 데이터로 초기화
      setGridData([]);
    }
  }, [data, convertDataToGrid]);

  // 그리드 데이터 변경 핸들러
  const handleGridChange = useCallback((newData) => {
    setGridData(newData);
    setHasChanges(true);
  }, []);

  // 행 추가 핸들러
  const handleAddRows = useCallback((count = 5) => {
    const newRows = Array.from({ length: count }, (_, index) => {
      const row = {
        id: `new-${Date.now()}-${index}`,
        displayId: '', // ICT-341: Display ID (새 항목은 백엔드에서 생성)
        displayOrder: '', // 순서 (displayOrder)
        type: '', // 타입
        parentFolder: '', // 상위폴더
        name: '',
        description: '',
        preCondition: '',
        expectedResults: ''
      };

      // 동적 스텝 필드 추가
      for (let i = 0; i < maxSteps; i++) {
        row[`step${i + 1}_description`] = '';
        row[`step${i + 1}_expected`] = '';
      }

      return row;
    });

    setGridData(prevData => [...prevData, ...newRows]);
    setHasChanges(true);
  }, [maxSteps]);

  // 일괄 저장 핸들러 (ICT-373: 변경 감지 및 배치 API 적용)
  const handleBulkSave = useCallback(async () => {
    if (!onSave || !hasChanges) return;

    setIsLoading(true);
    try {
      const convertedTestCases = convertGridToData(gridData);

      // ICT-373: 원본 데이터와 비교하여 실제 변경된 항목만 필터링
      const originalDataMap = new Map();
      (data || []).forEach(item => {
        if (item.id && !item.id.startsWith('temp-')) {
          originalDataMap.set(item.id, item);
        }
      });

      const changedTestCases = convertedTestCases.filter(tc => {
        // 새로운 테스트케이스 (temp- ID 또는 ID 없음)
        if (!tc.id || tc.id.startsWith('temp-') || tc.id.startsWith('new-') || tc.id.startsWith('empty-')) {
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
        setSnackbarMessage(t('testcase.spreadsheet.message.noChanges', '변경된 항목이 없습니다.'));
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setHasChanges(false);
        return;
      }

      // ICT-373: 폴더 중복 생성 방지 - 이름과 parentId로 기존 폴더 검색
      const deduplicatedTestCases = changedTestCases.map(tc => {
        if (tc.type === 'folder' && (!tc.id || tc.id.startsWith('temp-') || tc.id.startsWith('new-') || tc.id.startsWith('empty-'))) {
          const existingFolder = (data || []).find(item =>
            item.type === 'folder' &&
            item.name === tc.name &&
            item.parentId === tc.parentId
          );

          if (existingFolder) {
            return { ...tc, id: existingFolder.id };
          }
        }
        return tc;
      });

      // ICT-373: testCaseService.batchSaveTestCases() 호출
      const batchResult = await testCaseService.batchSaveTestCases(deduplicatedTestCases);

      // 배치 저장 결과 처리
      if (batchResult.isSuccess || batchResult.failureCount === 0) {
        // 완전 성공
        setHasChanges(false);
        const folderCount = batchResult.savedTestCases.filter(tc => tc.type === 'folder').length;
        const testCaseCount = batchResult.savedTestCases.filter(tc => tc.type === 'testcase').length;
        setSnackbarMessage(t('testcase.spreadsheet.message.batchSaveSuccess', '✅ 배치 저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개', { folderCount, testCaseCount }));
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // 저장 완료 후 onSave 콜백 호출 (상위 컴포넌트 상태 업데이트)
        if (onSave) {
          await onSave(batchResult.savedTestCases);
        }

        // 대량 데이터 저장 시 트랜잭션 커밋 완료 보장을 위한 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 300));

        // 데이터 새로고침
        if (onRefresh) {
          await onRefresh();
        }

      } else {
        // 부분 실패
        setHasChanges(false);

        let errorMessage = t('testcase.spreadsheet.message.batchSavePartialFailure', '⚠️ 배치 저장 부분 실패:\n✅ 성공: {successCount}개\n❌ 실패: {failureCount}개\n\n', { successCount: batchResult.successCount, failureCount: batchResult.failureCount });

        // 실패한 항목 상세 정보 (최대 5개만 표시)
        const maxErrors = Math.min(5, batchResult.errors.length);
        errorMessage += t('testcase.spreadsheet.message.failureDetails', '실패 내역:\n');
        for (let i = 0; i < maxErrors; i++) {
          const error = batchResult.errors[i];
          errorMessage += `${i + 1}. [행 ${error.index + 1}] ${error.testCaseName}: ${error.errorMessage}\n`;
        }

        if (batchResult.errors.length > maxErrors) {
          errorMessage += t('testcase.spreadsheet.message.moreErrors', '... 외 {count}개 오류\n', { count: batchResult.errors.length - maxErrors });
        }

        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);

        // 성공한 항목만 상위 컴포넌트에 전달
        if (onSave && batchResult.savedTestCases.length > 0) {
          await onSave(batchResult.savedTestCases);
        }

        // 대량 데이터 저장 시 트랜잭션 커밋 완료 보장을 위한 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 300));

        // 데이터 새로고침
        if (onRefresh) {
          await onRefresh();
        }
      }

    } catch (error) {
      console.error('[ICT-373] 고급 스프레드시트 일괄 저장 실패:', error);
      setSnackbarMessage(t('testcase.spreadsheet.message.saveError', '저장 중 오류가 발생했습니다: {error}', { error: error.message }));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [onSave, onRefresh, hasChanges, gridData, data, convertGridToData, t]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsLoading(true);
      try {
        await onRefresh();
        setHasChanges(false);
        setSnackbarMessage(t('testcase.spreadsheet.message.refreshSuccess', '최신 데이터로 새로고침되었습니다.'));
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage(t('testcase.spreadsheet.message.refreshError', '새로고침 중 오류가 발생했습니다: {error}', { error: error.message }));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onRefresh, t]);

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
    if (tempMaxSteps >= 1 && tempMaxSteps <= 10 && tempMaxSteps !== maxSteps) {
      // 기존 데이터 유지하면서 스텝 수 조정
      const adjustedData = gridData.map(row => {
        const newRow = { ...row };
        
        // 새로운 스텝 필드 추가 또는 기존 필드 제거
        if (tempMaxSteps > maxSteps) {
          // 스텝 추가
          for (let i = maxSteps; i < tempMaxSteps; i++) {
            newRow[`step${i + 1}_description`] = '';
            newRow[`step${i + 1}_expected`] = '';
          }
        } else if (tempMaxSteps < maxSteps) {
          // 스텝 제거
          for (let i = tempMaxSteps; i < maxSteps; i++) {
            delete newRow[`step${i + 1}_description`];
            delete newRow[`step${i + 1}_expected`];
          }
        }
        
        return newRow;
      });

      setGridData(adjustedData);
      setMaxSteps(tempMaxSteps);
      setHasChanges(true);
      setSnackbarMessage(t('testcase.spreadsheet.notification.stepChanged', '스텝 수가 {count}개로 변경되었습니다.').replace('{count}', tempMaxSteps));
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
    setStepSettingsOpen(false);
  };

  const handleQuickStepChange = (delta) => {
    const newStepCount = Math.min(10, Math.max(1, maxSteps + delta));
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
              {t('testcase.advancedGrid.title', '고급 스프레드시트')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={t('testcase.spreadsheet.status.rows', '{count}개 행', { count: gridData.filter(row => row.name?.trim() || Object.values(row).some(val => typeof val === 'string' && val.trim())).length })}
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
                label={t('testcase.spreadsheet.status.lineBreakSupport', '줄바꿈 지원')}
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
              <strong>{t('testcase.advancedGrid.features.title', '고급 기능:')}</strong> {t('testcase.advancedGrid.features.lineBreak', '셀 내에서 Enter로 줄바꿈이 가능합니다.')}
              {t('testcase.advancedGrid.features.navigation', 'Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.')}
              <br />
              <strong>{t('testcase.advancedGrid.multiSelect.title', '다중 선택:')}</strong> {t('testcase.advancedGrid.multiSelect.range', 'Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.')}
              {t('testcase.advancedGrid.multiSelect.resize', '드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.')}
            </Typography>
          </Alert>
        )}

        {/* DataSheet Grid */}
        <Box sx={{ mt: 2, minHeight: 400, maxHeight: 600, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <GridErrorBoundary t={t}>
            {DataSheetGrid ? (
              <DataSheetGrid
                value={gridData}
                onChange={readOnly ? undefined : handleGridChange}
                columns={columns}
                rowHeight={80}
                height={500}
                addRowsComponent={false}
                duplicateRowsComponent={false}
                lockRows={readOnly}
                style={{
                  fontSize: '14px',
                  '--dsg-header-text-color': '#1976d2',
                  '--dsg-header-background-color': '#f5f5f5',
                  '--dsg-border-color': '#e0e0e0',
                  '--dsg-cell-padding': '8px'
                }}
              />
            ) : (
              // Fallback: 향상된 HTML 스프레드시트 테이블
              <Box sx={{ p: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{t('testcase.spreadsheet.fallback.title', '향상된 스프레드시트 모드')}</strong>: {t('testcase.spreadsheet.fallback.description', '모든 기능이 정상적으로 작동합니다. 셀 편집, 복사/붙여넣기, 일괄 저장을 지원합니다.')}
                  </Typography>
                </Alert>
                
                <Box sx={{ overflow: 'auto', maxHeight: 600, border: '2px solid #e0e0e0', borderRadius: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        {columns.map((col, index) => (
                          <th
                            key={index}
                            style={{
                              border: '1px solid #e0e0e0',
                              padding: '10px 8px',
                              textAlign: 'left',
                              color: '#1976d2',
                              fontWeight: 600,
                              minWidth: col.minWidth || 150,
                              backgroundColor: '#f5f5f5'
                            }}
                          >
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex}>
                          {columns.map((col, colIndex) => {
                            const fieldKey = col.key || Object.keys(col)[0];
                            const cellValue = row[fieldKey] || '';
                            return (
                              <td
                                key={colIndex}
                                style={{
                                  border: '1px solid #e0e0e0',
                                  padding: '8px',
                                  verticalAlign: 'top',
                                  maxWidth: col.maxWidth || 250
                                }}
                              >
                                {readOnly || fieldKey === 'displayId' ? ( // ICT-341: Display ID는 읽기 전용
                                  <div style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    wordWrap: 'break-word',
                                    minHeight: '20px',
                                    backgroundColor: fieldKey === 'displayId' ? '#f5f5f5' : 'transparent', // 읽기 전용 표시
                                    padding: '4px',
                                    borderRadius: '2px'
                                  }}>
                                    {cellValue}
                                  </div>
                                ) : (
                                  <textarea
                                    value={cellValue}
                                    onChange={(e) => {
                                      const newGridData = [...gridData];
                                      newGridData[rowIndex] = {
                                        ...newGridData[rowIndex],
                                        [fieldKey]: e.target.value
                                      };
                                      handleGridChange(newGridData);
                                    }}
                                    style={{
                                      width: '100%',
                                      minHeight: '60px',
                                      border: 'none',
                                      outline: 'none',
                                      resize: 'vertical',
                                      fontSize: '14px',
                                      fontFamily: 'inherit',
                                      backgroundColor: 'transparent'
                                    }}
                                    placeholder={t('testcase.spreadsheet.placeholder.columnInput', '{title} 입력...', { title: col.title })}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}
          </GridErrorBoundary>
        </Box>

        {/* 하단 정보 */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('testcase.spreadsheet.footer.info', '* react-datasheet-grid 기반 고급 스프레드시트 • {count}개 스텝 • 줄바꿈 및 고급 편집 지원', { count: maxSteps })}
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