// src/components/TestCase/TestCaseDatasheetGrid.jsx

import React, { useState, useEffect, useCallback, useMemo, Component } from 'react';
import { listToTree } from '../../utils/treeUtils.jsx';
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
  TableChart as TableIcon,
  GridOn as GridIcon
} from '@mui/icons-material';
// react-datasheet-grid 완전히 비활성화하고 fallback만 사용
let DataSheetGrid = null;
let keyColumn = null;  
let textColumn = null;

// useVirtualizer 오류로 인해 일시적으로 react-datasheet-grid 비활성화
console.warn('react-datasheet-grid가 useVirtualizer 오류로 인해 비활성화되었습니다. Fallback 테이블을 사용합니다.');

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
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              스프레드시트 로딩 오류
            </Typography>
            <Typography variant="body2">
              react-datasheet-grid를 로드하는 중 오류가 발생했습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {this.state.error?.message}
            </Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            다시 시도
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// 다중 줄 텍스트를 위한 커스텀 컬럼 컴포넌트
const multilineTextColumn = {
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
        placeholder="여러 줄 입력 가능..."
      />
    );
  },
  disableKeys: true,
  keepFocus: true,
  disabled: ({ rowData }) => rowData?.readOnly === true,
  copyValue: ({ rowData, columnId }) => rowData?.[columnId] || '',
  pasteValue: ({ rowData, columnId, value }) => ({ ...rowData, [columnId]: value }),
  deleteValue: ({ rowData, columnId }) => ({ ...rowData, [columnId]: '' })
};

// 일반 텍스트 컬럼 (단일 라인)  
const singleLineTextColumn = {
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
        placeholder="텍스트 입력..."
      />
    );
  },
  disableKeys: true,
  keepFocus: true,
  disabled: ({ rowData }) => rowData?.readOnly === true,
  copyValue: ({ rowData, columnId }) => rowData?.[columnId] || '',
  pasteValue: ({ rowData, columnId, value }) => ({ ...rowData, [columnId]: value }),
  deleteValue: ({ rowData, columnId }) => ({ ...rowData, [columnId]: '' })
};

const TestCaseDatasheetGrid = ({
  data,
  onChange,
  onSave,
  onRefresh,
  readOnly = false,
  projectId
}) => {
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
          title: '순서',
          minWidth: 80,
          maxWidth: 100
        },
        {
          key: 'type',
          title: '타입',
          minWidth: 100,
          maxWidth: 120
        },
        {
          key: 'parentFolder',
          title: '상위폴더',
          minWidth: 120,
          maxWidth: 180
        },
        {
          key: 'name',
          title: '이름',
          minWidth: 150,
          maxWidth: 250
        },
        {
          key: 'description',
          title: '설명',
          minWidth: 200,
          maxWidth: 300
        },
        {
          key: 'preCondition',
          title: '사전조건',
          minWidth: 180,
          maxWidth: 280
        },
        {
          key: 'expectedResults',
          title: '예상결과',
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
            title: `Step ${i + 1}`,
            minWidth: 150,
            maxWidth: 250
          },
          {
            key: `step${i + 1}_expected`,
            title: `Expected ${i + 1}`,
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
        title: '순서',
        minWidth: 80,
        maxWidth: 100
      },
      {
        ...keyColumn('type', singleLineTextColumn),
        title: '타입',
        minWidth: 100,
        maxWidth: 120
      },
      {
        ...keyColumn('parentFolder', singleLineTextColumn),
        title: '상위폴더',
        minWidth: 120,
        maxWidth: 180
      },
      {
        ...keyColumn('name', singleLineTextColumn),
        title: '이름',
        minWidth: 150,
        maxWidth: 250
      },
      {
        ...keyColumn('description', multilineTextColumn),
        title: '설명',
        minWidth: 200,
        maxWidth: 300
      },
      {
        ...keyColumn('preCondition', multilineTextColumn),
        title: '사전조건',
        minWidth: 180,
        maxWidth: 280
      },
      {
        ...keyColumn('expectedResults', multilineTextColumn),
        title: '예상결과',
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
          title: `Step ${i + 1}`,
          minWidth: 150,
          maxWidth: 250
        },
        {
          ...keyColumn(`step${i + 1}_expected`, multilineTextColumn),
          title: `Expected ${i + 1}`,
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
        type: testCase.type === 'folder' ? '폴더' : '테스트케이스', // ICT-343: 타입
        parentFolder: testCase.parentId ? (flattenedTestCases.find(item => item.id === testCase.parentId)?.name || '') : '', // ICT-343: 상위폴더명 표시
        name: testCase.name || '',
        description: testCase.description || '',
        preCondition: testCase.preCondition || '',
        expectedResults: testCase.expectedResults || '',
        originalData: testCase
      };

      // 스텝 데이터 변환
      for (let i = 0; i < maxSteps; i++) {
        const step = testCase.steps?.[i];
        row[`step${i + 1}_description`] = step?.description || '';
        row[`step${i + 1}_expected`] = step?.expectedResult || '';
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
        const isFolder = row.type?.trim()?.toLowerCase() === '폴더' || 
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
                console.warn(`행 ${index}: 상위폴더 '${row.parentFolder}'를 찾을 수 없음. 기존 parentId 유지: ${row.originalData?.parentId}`);
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
    try {
      const newGridData = convertDataToGrid(data);
      // 유효한 데이터인지 확인
      if (Array.isArray(newGridData) && newGridData.length >= 0) {
        setGridData(newGridData);
      }
    } catch (error) {
      console.warn('Grid data conversion error:', error);
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

  // 일괄 저장 핸들러
  const handleBulkSave = useCallback(async () => {
    if (!onSave || !hasChanges) return;

    setIsLoading(true);
    try {
      const convertedTestCases = convertGridToData(gridData);
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
  }, [onSave, hasChanges, gridData, convertGridToData]);

  // 새로고침 핸들러
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
        setSnackbarMessage('새로고림 중 오류가 발생했습니다: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
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
              고급 스프레드시트 (react-datasheet-grid)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={`${gridData.filter(row => row.name?.trim() || Object.values(row).some(val => typeof val === 'string' && val.trim())).length}개 행`}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={`${maxSteps}개 스텝`}
                size="small"
                variant="outlined"
                color="secondary"
              />
              <Chip
                label="줄바꿈 지원"
                size="small"
                variant="outlined"
                color="success"
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
              <strong>고급 기능:</strong> 셀 내에서 <kbd>Enter</kbd>로 줄바꿈이 가능합니다. 
              <kbd>Tab</kbd>으로 다음 셀 이동, <kbd>Ctrl+C/V</kbd>로 복사/붙여넣기 지원.
              <br />
              <strong>다중 선택:</strong> <kbd>Shift+클릭</kbd>으로 범위 선택, <kbd>Ctrl+클릭</kbd>으로 개별 선택 가능.
              드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.
            </Typography>
          </Alert>
        )}

        {/* DataSheet Grid */}
        <Box sx={{ mt: 2, minHeight: 400, maxHeight: 600, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <GridErrorBoundary>
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
              // Fallback: 기본 HTML 테이블 구현
              <Box sx={{ p: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    DataSheetGrid 로드 실패
                  </Typography>
                  <Typography variant="body2">
                    react-datasheet-grid 라이브러리에 오류가 있습니다. 기본 테이블로 표시합니다.
                  </Typography>
                </Alert>
                
                <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        {columns.map((col, index) => (
                          <th
                            key={index}
                            style={{
                              border: '1px solid #e0e0e0',
                              padding: '8px',
                              textAlign: 'left',
                              color: '#1976d2',
                              minWidth: col.minWidth || 150
                            }}
                          >
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.slice(0, 10).map((row, rowIndex) => (
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
                                    placeholder={`${col.title} 입력...`}
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
            * react-datasheet-grid 기반 고급 스프레드시트 • {maxSteps}개 스텝 • 줄바꿈 및 고급 편집 지원
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

TestCaseDatasheetGrid.propTypes = {
  data: PropTypes.array,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  onRefresh: PropTypes.func,
  readOnly: PropTypes.bool,
  projectId: PropTypes.string,
};

export default TestCaseDatasheetGrid;