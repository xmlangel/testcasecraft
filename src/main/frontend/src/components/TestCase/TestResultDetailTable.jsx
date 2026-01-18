// src/components/TestCase/TestResultDetailTable.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// ICT-263: URL 쿼리 파라미터 연동을 위한 import
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Link,
  Button,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  gridClasses
} from '@mui/x-data-grid';
import {
  Launch as LaunchIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  GetApp as GetAppIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Autorenew as AutorenewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAppContext } from '../../context/AppContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { TestResult } from '../../models/testExecution.jsx';
import jiraService from '../../services/jiraService.js';
// JIRA 상태 조회를 위한 공통 훅
import { useBatchJiraIssueStatus } from '../../hooks/useJiraStatus.js';
// ICT-194 Phase 2: 통합된 테스트 결과 상수 및 API 상수 사용
import { LEGACY_RESULT_COLORS, getResultLabel } from '../../utils/testResultConstants.js';
import { API_CONFIG, API_ENDPOINTS, buildUrl } from '../../utils/apiConstants.js';
// ICT-344: 디버그 로깅 유틸리티
import { debugLog, debugWarn, debugError } from '../../utils/logger.js';
// ICT-194 Phase 2: 컴포넌트 분할 - 분리된 컴포넌트들
import TestResultExportDialog from './TestResultExportDialog.jsx';
import TestResultColumnMenu from './TestResultColumnMenu.jsx';
// ICT-209: 테스트 결과 편집 기능
import TestResultEditDialog from './TestResultEditDialog.jsx';
import testResultEditService from '../../services/testResultEditService.js';
// ICT-263: 테스트결과 필터링 패널 및 서비스
import TestResultFilterPanel from './TestResultFilterPanel.jsx';
import testResultService from '../../services/testResultService.js';
// ICT-275: 컬럼 순서 변경 다이얼로그
import ColumnOrderDialog from './ColumnOrderDialog.jsx';
// ICT-362: 첨부파일 표시 컴포넌트
import TestResultAttachmentsView from './TestResultAttachmentsView.jsx';
// Markdown 뷰어
import MarkdownViewer from '../common/MarkdownViewer.jsx';

const PRINT_SCALE_PERCENT = 30;
const PRINT_SCALE_FACTOR = PRINT_SCALE_PERCENT / 100;
const GRID_PRINT_PAGE_STYLE = `
  @page {
    size: landscape;
    margin: 10mm;
  }
  body {
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    transform: scale(${PRINT_SCALE_FACTOR});
    transform-origin: top left;
  }
  #root, body, html {
    width: ${100 / PRINT_SCALE_FACTOR}%;
  }
`;

const TestResultDetailTable = ({ projectId, onViewResult, dense = false }) => {
  const { testCases, activeProject, user, api } = useAppContext();
  const { t } = useI18n();
  // ICT-263: URL 쿼리 파라미터 연동
  const location = useLocation();
  const navigate = useNavigate();

  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jiraConfig, setJiraConfig] = useState(null);
  const [columnVisibilityMenuAnchor, setColumnVisibilityMenuAnchor] = useState(null);

  // JIRA 상태 조회를 위한 공통 훅 사용
  const {
    statusMap: jiraStatusMap,
    loading: jiraStatusLoading,
    info: jiraStatusInfo,
    fetchStatuses: handleJiraStatusCheck
  } = useBatchJiraIssueStatus(rawRows, { autoLoad: false });

  const rows = useMemo(() => {
    if (!rawRows.length) {
      return rawRows;
    }

    if (!Object.keys(jiraStatusMap).length) {
      return rawRows;
    }

    let hasChanges = false;
    const enrichedRows = rawRows.map(row => {
      if (!row.jiraId || row.jiraStatusFromApi) {
        return row;
      }

      const statusFromSummary = jiraStatusMap[row.jiraId];
      if (!statusFromSummary || statusFromSummary === row.jiraStatus) {
        return row;
      }

      hasChanges = true;
      return {
        ...row,
        jiraStatus: statusFromSummary
      };
    });

    return hasChanges ? enrichedRows : rawRows;
  }, [rawRows, jiraStatusMap]);
  // ICT-275: 컬럼 설정 localStorage 기본값
  const getDefaultColumnVisibility = () => ({
    folder: true,
    displayId: false,
    testCase: true,
    description: false,
    result: true,
    executedDate: true,
    executor: true,
    notes: true,
    attachments: true, // ICT-362: 첨부파일 컬럼 (기본 표시)
    jiraId: true,
    jiraStatus: true, // JIRA 상태 체크 후 결과 확인을 위해 기본 표시
    preCondition: false, // ICT-275: 사전설정 컬럼 (기본 숨김)
    postCondition: false,
    expectedResults: false, // ICT-275: 전체 예상결과 컬럼 (기본 숨김)
    steps: false, // ICT-275: 스텝 컬럼 (기본 숨김)
    isAutomated: false,
    executionType: false,
    testTechnique: false,
    priority: false,
    tags: false,
    linkedDocuments: false
  });

  // ICT-275: 기본 컬럼 순서 정의
  const getDefaultColumnOrder = () => [
    'folder',
    'displayId',
    'testCase',
    'description',
    'result',
    'preCondition',
    'postCondition',
    'steps',
    'expectedResults',
    'isAutomated',
    'executionType',
    'testTechnique',
    'priority',
    'tags',
    'executor',
    'notes',
    'attachments', // ICT-362: 첨부파일 컬럼
    'linkedDocuments',
    'jiraId',
    'executedDate',
    'jiraStatus'
  ];

  // ICT-275: localStorage에서 컬럼 설정 로드
  const loadColumnVisibilityFromStorage = () => {
    try {
      const storageKey = `testResultTable_columnVisibility_${projectId || 'default'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기본값과 병합하여 새로운 필드 처리
        return { ...getDefaultColumnVisibility(), ...parsed };
      }
    } catch (error) {
      debugWarn('TestResultDetailTable', '컬럼 설정 로드 실패:', error);
    }
    return getDefaultColumnVisibility();
  };

  // ICT-275: localStorage에서 컬럼 순서 로드
  const loadColumnOrderFromStorage = () => {
    try {
      const storageKey = `testResultTable_columnOrder_${projectId || 'default'}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기본값과 병합하여 새로운 필드 처리
        const defaultOrder = getDefaultColumnOrder();
        const savedFields = new Set(parsed);
        const newFields = defaultOrder.filter(field => !savedFields.has(field));
        return [...parsed, ...newFields];
      }
    } catch (error) {
      debugWarn('TestResultDetailTable', '컬럼 순서 로드 실패:', error);
    }
    return getDefaultColumnOrder();
  };

  const [columnVisibility, setColumnVisibility] = useState(loadColumnVisibilityFromStorage);
  const [columnOrder, setColumnOrder] = useState(loadColumnOrderFromStorage);

  // ICT-275: 컬럼 순서 변경 다이얼로그 상태
  const [columnOrderDialogOpen, setColumnOrderDialogOpen] = useState(false);

  // ICT-362: 첨부파일 다이얼로그 상태
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTestResultId, setSelectedTestResultId] = useState(null);

  const hasJiraTargets = useMemo(
    () => rawRows.some(row => Boolean(row.jiraId)),
    [rawRows]
  );

  // ICT-190: 내보내기 기능 상태 (ICT-194 Phase 2: 분리된 컴포넌트로 이동)
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // ICT-209: 테스트 결과 편집 기능 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [activeEdits, setActiveEdits] = useState({});

  // ICT-263: URL 쿼리 파라미터에서 초기 필터 상태 읽기
  const getInitialFiltersFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      testPlanId: searchParams.get('testPlanId') || null,
      testExecutionId: searchParams.get('testExecutionId') || null
    };
  };

  // ICT-263: 필터링 관련 상태
  const [currentFilters, setCurrentFilters] = useState(getInitialFiltersFromURL);
  const [isFiltered, setIsFiltered] = useState(() => {
    const initialFilters = getInitialFiltersFromURL();
    return Boolean(initialFilters.testPlanId || initialFilters.testExecutionId);
  });

  // ICT-194 Phase 2: 통합된 테스트 결과 색상 사용
  const resultColors = LEGACY_RESULT_COLORS;

  // ICT-263: 필터링된 테스트 결과 로드 함수
  const fetchTestResults = useCallback(async (filters = null) => {
    if (!projectId || !testCases) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let reportData;

      // 필터가 적용된 경우 (조건문 개선)
      const hasFilters = filters && (filters.testPlanId || filters.testExecutionId);

      if (hasFilters) {

        // 새로운 필터링 API 사용
        const response = await testResultService.getFilteredTestResults({
          projectId,
          testPlanId: filters.testPlanId,
          testExecutionId: filters.testExecutionId,
          page: 0,
          size: 1000
        });

        if (response.success) {
          reportData = { content: response.data };
        } else {
          throw new Error('필터링된 테스트 결과를 불러올 수 없습니다');
        }
      } else {

        // 기존 전체 데이터 로드 방식
        const apiUrl = buildUrl(API_ENDPOINTS.TEST_RESULTS.REPORT) + `?projectId=${projectId}&page=0&size=1000`;
        const response = await api(apiUrl);
        if (!response.ok) {
          throw new Error('테스트 결과를 불러올 수 없습니다');
        }
        reportData = await response.json();
      }

      const testResults = reportData.content || [];

      // 테이블 데이터 구성 - ICT-185 리포트 응답 구조에 맞춰 수정
      const tableData = testResults.map((result, index) => {
        const testCase = testCases.find(tc => tc.id === result.testCaseId);
        const parentFolder = testCase?.parentId
          ? testCases.find(tc => tc.id === testCase.parentId)
          : null;

        // JIRA ID는 이미 분리되어 있음
        const jiraId = result.jiraIssueKey;
        // 추가 JIRA ID 추출 (비고 필드에서)
        const additionalJiraIds = jiraService.extractIssueKeys(result.notes || '');
        const allJiraIds = jiraId ? [jiraId, ...additionalJiraIds.filter(id => id !== jiraId)] : additionalJiraIds;
        const hasMultipleJiraIds = allJiraIds.length > 1;

        return {
          id: String(result.id || index), // ICT-280: 고유한 문자열 ID 보장 (test result ID 사용)
          testCaseId: result.testCaseId,
          testResultId: result.id, // ICT-362: 실제 테스트 결과 ID (첨부파일 용)
          resultId: String(result.id || index), // 고유 ID로 사용 (test result ID 사용)
          folder: result.folderPath || parentFolder?.name || t('testResult.defaultValue.root', '루트'),
          testCase: result.testCaseName || testCase?.name || t('testResult.defaultValue.unknownTestCase', '알 수 없는 테스트케이스'),
          displayId: testCase?.displayId || '',
          description: testCase?.description || '',
          result: result.result,
          executedDate: result.executedAt ? new Date(result.executedAt) : null,
          executor: result.executorName || t('testResult.defaultValue.system', '시스템'),
          notes: result.notes || '',
          jiraId: jiraId,
          jiraIds: allJiraIds, // 모든 JIRA ID 목록
          hasMultipleJiraIds,
          jiraStatus: result.jiraStatus || null, // ICT-185에서 제공되는 JIRA 상태
          jiraStatusFromApi: result.jiraStatus || null,
          executionId: result.testExecutionId,
          testPlanName: result.testPlanName || '',
          // ICT-275: 테스트케이스의 추가 정보들
          preCondition: testCase?.preCondition || '',
          postCondition: testCase?.postCondition || '',
          expectedResults: testCase?.expectedResults || '',
          steps: testCase?.steps || [],
          isAutomated: typeof testCase?.isAutomated === 'boolean' ? testCase.isAutomated : null,
          executionType: testCase?.executionType || (testCase?.isAutomated ? 'Automation' : 'Manual'),
          testTechnique: testCase?.testTechnique || '',
          priority: testCase?.priority || '',
          tags: Array.isArray(testCase?.tags) ? testCase.tags : [],
          linkedDocuments: Array.isArray(testCase?.linkedDocumentIds) ? testCase.linkedDocumentIds : [],
          attachmentCount: result.attachmentCount || 0
        };
      });

      setRawRows(tableData);

      // ICT-209: 활성 편집본 정보 로드 (비활성화 - 404 에러 방지)
      // await loadActiveEdits(tableData);
    } catch (err) {
      debugError('TestResultDetailTable', '테스트 결과 로드 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, testCases, api]);

  // JIRA 설정 로드
  useEffect(() => {
    const loadJiraConfig = async () => {
      try {
        const config = await jiraService.getActiveConfig();
        setJiraConfig(config);
      } catch (error) {
        debugWarn('TestResultDetailTable', 'JIRA 설정을 불러올 수 없습니다:', error);
      }
    };
    loadJiraConfig();
  }, []);

  // ICT-275: 프로젝트 변경 시 컬럼 설정 다시 로드
  useEffect(() => {
    if (projectId) {
      setColumnVisibility(loadColumnVisibilityFromStorage());
      setColumnOrder(loadColumnOrderFromStorage());
    }
  }, [projectId]);

  // 테스트 결과 데이터 로드
  useEffect(() => {
    fetchTestResults(currentFilters);
  }, [fetchTestResults, currentFilters]);

  // JIRA 상태 체크 완료 후 데이터 새로고침
  const prevLoadingRef = useRef(jiraStatusLoading);
  const prevStatusMapSizeRef = useRef(Object.keys(jiraStatusMap).length);

  useEffect(() => {
    const currentStatusMapSize = Object.keys(jiraStatusMap).length;

    debugLog('TestResultDetailTable', '📊 JIRA 상태 체크 useEffect 실행:', {
      wasLoading: prevLoadingRef.current,
      isNowNotLoading: !jiraStatusLoading,
      prevStatusMapSize: prevStatusMapSizeRef.current,
      currentStatusMapSize: currentStatusMapSize,
      statusMapChanged: currentStatusMapSize > prevStatusMapSizeRef.current
    });

    // 로딩이 true에서 false로 변경되고, statusMap이 업데이트되었으면 데이터 새로고침
    const wasLoading = prevLoadingRef.current;
    const isNowNotLoading = !jiraStatusLoading;
    const statusMapUpdated = currentStatusMapSize > 0;

    if (wasLoading && isNowNotLoading && statusMapUpdated) {
      debugLog('TestResultDetailTable', '🔄 JIRA 상태 업데이트 완료 - 테이블 데이터 새로고침');
      fetchTestResults(currentFilters);
    }

    prevLoadingRef.current = jiraStatusLoading;
    prevStatusMapSizeRef.current = currentStatusMapSize;
  }, [jiraStatusLoading, jiraStatusMap]);

  // jiraStatusInfo 자동 숨김은 훅에서 처리됨 (제거)

  // ICT-263: URL 업데이트 헬퍼 함수
  const updateURLWithFilters = (filters) => {
    const searchParams = new URLSearchParams(location.search);

    // 필터 파라미터 업데이트
    if (filters.testPlanId) {
      searchParams.set('testPlanId', filters.testPlanId);
    } else {
      searchParams.delete('testPlanId');
    }

    if (filters.testExecutionId) {
      searchParams.set('testExecutionId', filters.testExecutionId);
    } else {
      searchParams.delete('testExecutionId');
    }

    // URL 업데이트 (히스토리에 추가하지 않고 교체)
    const newURL = `${location.pathname}?${searchParams.toString()}`;
    navigate(newURL, { replace: true });
  };

  // ICT-263: 필터 변경 핸들러
  const handleFilterChange = async (newFilters) => {
    setCurrentFilters(newFilters);
    setIsFiltered(Boolean(newFilters.testPlanId || newFilters.testExecutionId));

    // URL 업데이트
    updateURLWithFilters(newFilters);

    // 필터 적용된 데이터 다시 로드
    await fetchTestResults(newFilters);
  };

  // handleJiraStatusCheck는 이제 useBatchJiraIssueStatus 훅에서 제공됨 (제거)

  // ICT-209: 활성 편집본 정보 로드 (404 오류 최소화)
  const loadActiveEdits = async (testResults) => {
    try {
      // 편집본 기능이 활성화되어 있는지 확인 (실제 구현 시 조건부 실행)
      if (!testResultEditService) {
        debugWarn('TestResultDetailTable', '편집본 기능을 사용할 수 없습니다');
        return;
      }

      // 404 오류는 정상적인 응답이므로 경고 로그 줄이기
      const editPromises = testResults.slice(0, Math.min(testResults.length, 20)).map(async (result) => {
        try {
          const activeEdit = await testResultEditService.getActiveEdit(result.testCaseId);
          return { testResultId: result.testCaseId, activeEdit };
        } catch (error) {
          // 404는 정상적인 응답으로 간주 (편집본이 없는 경우)
          return { testResultId: result.testCaseId, activeEdit: null };
        }
      });

      const editResults = await Promise.all(editPromises);
      const editsMap = {};
      editResults.forEach(({ testResultId, activeEdit }) => {
        if (activeEdit) {
          editsMap[testResultId] = activeEdit;
        }
      });

      setActiveEdits(editsMap);
    } catch (error) {
      debugWarn('TestResultDetailTable', '활성 편집본 로드 실패:', error);
      // 오류 시 빈 상태로 설정하여 UI가 정상 동작하도록 함
      setActiveEdits({});
    }
  };

  // ICT-209: 편집 다이얼로그 열기
  const handleEditClick = (testResultId, executionId) => {
    const testResult = rows.find(row => row.testCaseId === testResultId && row.executionId === executionId);
    const testCase = testCases.find(tc => tc.id === testResultId);

    if (testResult && testCase) {
      setSelectedTestResult({
        id: testResult.testCaseId, // 실제 테스트 결과 ID
        testCaseId: testResult.testCaseId,
        result: testResult.result,
        notes: testResult.notes,
        jiraIssueKey: testResult.jiraId,
        jiraIssueUrl: testResult.jiraIds?.[0] || '',
        executedAt: testResult.executedDate,
        executorName: testResult.executor
      });
      setSelectedTestCase(testCase);
      setEditDialogOpen(true);
    }
  };

  // ICT-209: 편집 저장 완료 핸들러 (ICT-263: 필터링 고려)
  const handleEditSaved = async (editResult) => {
    // 현재 필터를 유지하며 테스트 결과 데이터 새로고침
    await fetchTestResults(currentFilters);
  };

  // ICT-362: 첨부파일 클릭 핸들러
  const handleAttachmentClick = (testResultId) => {
    setSelectedTestResultId(testResultId);
    setAttachmentDialogOpen(true);
  };

  // DataGrid 컬럼 정의 - ICT-275: 컬럼 순서 변경 (폴더 → 테스트케이스 → 결과 → 사전설정 → 스텝 → 전체예상결과 → 실행자 → 비고 → JIRA ID → 시행일자)
  const columns = useMemo(() => [
    {
      field: 'folder',
      headerName: t('testResult.column.folder', '폴더'),
      width: 150,
      headerClassName: 'table-header',
      renderCell: (params) => {
        const displayValue = (params.value === 'Root' || params.value === '루트') ? '-' : params.value;
        return (
          <Tooltip title={displayValue}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {displayValue}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'displayId',
      headerName: t('testcase.form.displayId', 'Display ID'),
      width: 130,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'testCase',
      headerName: t('testResult.column.testCase', '테스트케이스'),
      flex: 1,
      minWidth: 250,
      headerClassName: 'table-header',
      renderCell: (params) => {
        const hasActiveEdit = activeEdits[params.row.testCaseId];
        const editStatusInfo = hasActiveEdit ? testResultEditService.getEditStatusInfo(hasActiveEdit.editStatus) : null;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={params.value}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {params.value}
                </Typography>
              </Tooltip>
              {hasActiveEdit && (
                <Tooltip title={`편집본: ${editStatusInfo.description}`}>
                  <Chip
                    label={editStatusInfo.label}
                    size="small"
                    color={editStatusInfo.color}
                    variant="outlined"
                    sx={{ mt: 0.5, fontSize: '0.7rem', height: '20px' }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* ICT-209: 편집 버튼 */}
              <Tooltip title={t('testResult.button.edit', '편집')}>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(params.row.testCaseId, params.row.executionId)}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {onViewResult && (
                <Tooltip title={t('testResult.button.viewDetail', '상세보기')}>
                  <IconButton
                    size="small"
                    onClick={() => onViewResult(params.row.testCaseId, params.row.executionId)}
                    sx={{ p: 0.5 }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'description',
      headerName: t('testcase.form.description', '설명'),
      flex: 1,
      minWidth: 220,
      headerClassName: 'table-header',
      renderCell: (params) => {
        const description = params.value;

        if (!description) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const tooltipContent = (
          <Box sx={{ maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
            <MarkdownViewer content={description} />
          </Box>
        );

        return (
          <Tooltip title={tooltipContent} arrow placement="top-start">
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'help'
              }}
            >
              {description}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'result',
      headerName: t('testResult.column.result', '결과'),
      width: 120,
      headerClassName: 'table-header',
      renderCell: (params) => {
        // 백엔드 enum 값(대문자)을 소문자로 변환하여 키 생성
        // 예: PASS -> testResult.status.pass
        const resultKey = params.value ? `testResult.status.${params.value.toLowerCase()}` : '';
        const label = resultKey ? t(resultKey, getResultLabel(params.value)) : '-';

        return (
          <Chip
            label={label}
            color={LEGACY_RESULT_COLORS[params.value] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    // ICT-275: 사전설정 컬럼
    {
      field: 'preCondition',
      headerName: t('testResult.column.preCondition', '사전설정'),
      width: 200,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Tooltip title={params.value || t('testResult.tooltip.noPreCondition', '사전설정 없음')}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: params.value ? 'text.primary' : 'text.secondary'
            }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'postCondition',
      headerName: t('testResult.column.postCondition', '사후 조건'),
      width: 200,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Tooltip title={params.value || t('testResult.tooltip.noPostCondition', '사후 조건 없음')}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: params.value ? 'text.primary' : 'text.secondary'
            }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      )
    },
    // ICT-275: 스텝 정보 컬럼 (세로 배치)
    {
      field: 'steps',
      headerName: t('testResult.column.steps', '스텝 정보'),
      width: 300,
      headerClassName: 'table-header',
      sortable: false,
      renderCell: (params) => {
        const steps = params.value || [];

        if (steps.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {t('testResult.steps.empty', '스텝 없음')}
            </Typography>
          );
        }

        return (
          <Box
            sx={{
              py: 1,
              width: '100%',
              maxHeight: 360, // 최대 높이 제한으로 스크롤 가능
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '2px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '2px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }}
          >
            {steps.map((step, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  mb: index < steps.length - 1 ? 1 : 0,
                  p: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              >
                <CardContent sx={{ p: '8px !important', '&:last-child': { pb: '8px !important' } }}>
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
                  >
                    Step {step.stepNumber || index + 1}
                  </Typography>

                  {step.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.75rem',
                        mb: 0.5,
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      <strong>{t('testResult.steps.description', '설명')}:</strong> {step.description}
                    </Typography>
                  )}

                  {step.expectedResult && (
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{
                        fontSize: '0.75rem',
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      <strong>{t('testResult.steps.expectedResult', '예상결과')}:</strong> {step.expectedResult}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        );
      }
    },
    // ICT-275: 전체 예상결과 컬럼
    {
      field: 'expectedResults',
      headerName: t('testResult.column.expectedResults', '전체 예상결과'),
      width: 200,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Tooltip title={params.value || t('testResult.tooltip.noExpectedResults', '전체 예상결과 없음')}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: params.value ? 'text.primary' : 'text.secondary'
            }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'isAutomated',
      headerName: t('testcase.form.isAutomated', '자동화 여부'),
      width: 140,
      headerClassName: 'table-header',
      renderCell: (params) => {
        if (params.value === null || params.value === undefined) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        return (
          <Chip
            label={params.value ? t('testcase.executionType.automation', 'Automation') : t('testcase.executionType.manual', 'Manual')}
            color={params.value ? 'primary' : 'default'}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'executionType',
      headerName: t('testcase.form.executionType', '실행 타입'),
      width: 150,
      headerClassName: 'table-header',
      renderCell: (params) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const normalized = params.value.toLowerCase();
        const chipColor = normalized === 'automation'
          ? 'primary'
          : normalized === 'manual'
            ? 'default'
            : 'secondary';

        return (
          <Chip
            label={t(`testcase.executionType.${normalized}`, params.value)}
            color={chipColor}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'testTechnique',
      headerName: t('testcase.form.testTechnique', '테스트 기법'),
      width: 200,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Tooltip title={params.value || t('testResult.tooltip.noTestTechnique', '테스트 기법 없음')}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: params.value ? 'text.primary' : 'text.secondary'
            }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'priority',
      headerName: t('testCase.form.priority', '우선순위'),
      width: 140,
      headerClassName: 'table-header',
      renderCell: (params) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const normalized = params.value.toLowerCase();
        const colorMap = {
          high: 'error',
          medium: 'warning',
          low: 'success'
        };

        const labelMap = {
          high: t('testCase.priority.high', '높음'),
          medium: t('testCase.priority.medium', '보통'),
          low: t('testCase.priority.low', '낮음')
        };

        return (
          <Chip
            label={labelMap[normalized] || params.value}
            color={colorMap[normalized] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'tags',
      headerName: t('testCase.form.tags', '태그'),
      flex: 1,
      minWidth: 200,
      headerClassName: 'table-header',
      sortable: false,
      renderCell: (params) => {
        const tags = params.value || [];

        if (!tags.length) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const visibleTags = tags.slice(0, 2);
        const extraCount = tags.length - visibleTags.length;

        return (
          <Tooltip
            arrow
            placement="top"
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {tags.map((tag, index) => (
                  <Chip key={`${tag}-${index}`} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            }
          >
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {visibleTags.map((tag, index) => (
                <Chip key={`${tag}-${index}`} label={tag} size="small" variant="outlined" />
              ))}
              {extraCount > 0 && (
                <Chip label={`+${extraCount}`} size="small" variant="outlined" />
              )}
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: 'executor',
      headerName: t('testResult.column.executor', '실행자'),
      width: 100,
      headerClassName: 'table-header',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'notes',
      headerName: t('testResult.column.notes', '비고'),
      flex: 1,
      minWidth: 150,
      headerClassName: 'table-header',
      renderCell: (params) => {
        const notesContent = params.value;

        if (!notesContent) {
          return (
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              -
            </Typography>
          );
        }

        // Tooltip 내용: Markdown 렌더링
        const tooltipContent = (
          <Box sx={{ maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
            <MarkdownViewer content={notesContent} />
          </Box>
        );

        // 셀 내용: 일반 텍스트 미리보기
        return (
          <Tooltip title={tooltipContent} arrow placement="top-start">
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'help'
              }}
            >
              {notesContent}
            </Typography>
          </Tooltip>
        );
      }
    },
    // ICT-362: 첨부파일 컬럼
    {
      field: 'attachments',
      headerName: t('testResult.column.attachments', '첨부파일'),
      width: 100,
      headerClassName: 'table-header',
      sortable: false,
      renderCell: (params) => {
        // 테스트 결과 ID가 있는지 확인
        const testResultId = params.row.testResultId || params.row.id;
        const hasAttachments = params.row.attachmentCount > 0;

        if (!testResultId || !hasAttachments) {
          return <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>-</Typography>;
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title={t('testResult.button.viewAttachments', '첨부파일 보기')}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttachmentClick(testResultId);
                }}
                sx={{ p: 0.5 }}
              >
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    },
    {
      field: 'linkedDocuments',
      headerName: t('testResult.column.linkedDocuments', '연결된 RAG 문서'),
      width: 220,
      headerClassName: 'table-header',
      sortable: false,
      renderCell: (params) => {
        const linkedDocuments = params.value || [];

        if (!linkedDocuments.length) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const tooltipContent = linkedDocuments.join(', ');

        return (
          <Tooltip title={tooltipContent} arrow placement="top">
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={t('testResult.column.linkedDocCount', '{count}건', { count: linkedDocuments.length })}
                size="small"
                variant="outlined"
              />
              {linkedDocuments.slice(0, 2).map((docId, index) => (
                <Chip key={`${docId}-${index}`} label={docId} size="small" variant="outlined" />
              ))}
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: 'jiraId',
      headerName: 'JIRA ID',
      width: 120,
      headerClassName: 'table-header',
      renderCell: (params) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        const jiraUrl = jiraConfig?.serverUrl
          ? `${jiraConfig.serverUrl}/browse/${params.value}`
          : `https://jira.company.com/browse/${params.value}`;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Link
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {params.value}
            </Link>
            {params.row.hasMultipleJiraIds && (
              <Tooltip title={t('testResult.tooltip.multipleJiraIds', `총 ${params.row.jiraIds.length}개의 JIRA ID`, { count: params.row.jiraIds.length })}>
                <Chip label={`+${params.row.jiraIds.length - 1}`} size="small" variant="outlined" />
              </Tooltip>
            )}
            <IconButton
              size="small"
              component="a"
              href={jiraUrl}
              target="_blank"
              sx={{ p: 0.25 }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    },
    {
      field: 'executedDate',
      headerName: t('testResult.column.executedDate', '시행일자'),
      width: 140,
      headerClassName: 'table-header',
      type: 'dateTime',
      renderCell: (params) => (
        params.value ? (
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {format(params.value, 'yyyy-MM-dd HH:mm', { locale: ko })}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            -
          </Typography>
        )
      )
    },
    {
      field: 'jiraStatus',
      headerName: t('testResult.column.jiraStatus', 'JIRA 상태'),
      width: 140,
      headerClassName: 'table-header',
      renderCell: (params) => {
        if (!params.row?.jiraId) {
          return (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          );
        }

        if (jiraStatusLoading && !params.value) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {t('testResult.status.loading', '불러오는 중...')}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography
            variant="body2"
            color={params.value ? 'text.primary' : 'text.secondary'}
            sx={{ fontSize: '0.875rem' }}
          >
            {params.value || t('testResult.status.unknown', '알 수 없음')}
          </Typography>
        );
      }
    }
  ], [jiraConfig, resultColors, onViewResult, t, jiraStatusLoading]);

  // ICT-275: 컬럼 설정을 localStorage에 저장
  const saveColumnVisibilityToStorage = useCallback((newVisibility) => {
    try {
      const storageKey = `testResultTable_columnVisibility_${projectId || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(newVisibility));
    } catch (error) {
      debugWarn('TestResultDetailTable', '컬럼 설정 저장 실패:', error);
    }
  }, [projectId]);

  // ICT-275: 컬럼 순서를 localStorage에 저장
  const saveColumnOrderToStorage = useCallback((newOrder) => {
    try {
      const storageKey = `testResultTable_columnOrder_${projectId || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(newOrder));
    } catch (error) {
      debugWarn('TestResultDetailTable', '컬럼 순서 저장 실패:', error);
    }
  }, [projectId]);

  // 컬럼 표시/숨김 토글
  const handleColumnVisibilityToggle = useCallback((field) => {
    setColumnVisibility(prev => {
      const newVisibility = {
        ...prev,
        [field]: !prev[field]
      };
      // 즘시 저장
      saveColumnVisibilityToStorage(newVisibility);
      return newVisibility;
    });
  }, [saveColumnVisibilityToStorage]);

  // ICT-275: 컬럼 순서 변경 핸들러
  const handleColumnOrderChange = useCallback((newOrder) => {
    setColumnOrder(newOrder);
    saveColumnOrderToStorage(newOrder);
  }, [saveColumnOrderToStorage]);

  // ICT-276: 동적 행 높이 계산 - 스텝 개수와 내용에 따라 조정
  const getRowHeight = useCallback((params) => {
    const steps = params.model.steps || [];

    // 스텝이 없거나 스텝 컬럼이 비활성화된 경우 기본 높이
    if (!columnVisibility.steps || steps.length === 0) {
      return 52; // 기본 행 높이
    }

    // 기본 높이 + 스텝당 추가 높이 계산
    const baseHeight = 52;
    let additionalHeight = 0;

    steps.forEach(step => {
      // 스텝 헤더 + 패딩
      additionalHeight += 32;

      // 설명 텍스트 높이 계산 (대략적)
      if (step.description) {
        const descriptionLines = Math.ceil(step.description.length / 50); // 50자당 1줄로 추정
        additionalHeight += Math.max(1, descriptionLines) * 16; // 16px per line
      }

      // 예상결과 텍스트 높이 계산
      if (step.expectedResult) {
        const expectedResultLines = Math.ceil(step.expectedResult.length / 50);
        additionalHeight += Math.max(1, expectedResultLines) * 16;
      }

      // 스텝 간 여백
      additionalHeight += 8;
    });

    // 최소 높이 52px, 최대 높이 400px로 제한
    return Math.min(Math.max(baseHeight, baseHeight + additionalHeight), 400);
  }, [columnVisibility.steps]);

  // 표시할 컬럼 필터링 및 순서 적용
  const visibleColumns = useMemo(() => {
    // 순서대로 정렬된 컬럼 배열 생성
    const orderedColumns = columnOrder.map(fieldName =>
      columns.find(col => col.field === fieldName)
    ).filter(col => col && columnVisibility[col.field] !== false);

    return orderedColumns;
  }, [columns, columnVisibility, columnOrder]);

  // ICT-190: 내보내기 기능 핸들러 (ICT-194 Phase 2: 간소화)
  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

  // 커스텀 툴바 컴포넌트
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'space-between', p: 1 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        {/* 컬럼 표시/숨김 설정 */}
        <Button
          size="small"
          startIcon={<SettingsIcon />}
          onClick={(event) => setColumnVisibilityMenuAnchor(event.currentTarget)}
        >
          {t('testResult.button.columnSettings', '컬럼 설정')}
        </Button>

        {/* ICT-275: 컬럼 순서 변경 버튼 */}
        <Button
          size="small"
          variant="outlined"
          onClick={() => setColumnOrderDialogOpen(true)}
          sx={{ ml: 1 }}
        >
          {t('testResult.button.changeOrder', '순서 변경')}
        </Button>

        {/* ICT-275: 컬럼 설정 초기화 버튼 */}
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            const defaultVisibility = getDefaultColumnVisibility();
            const defaultOrder = getDefaultColumnOrder();
            setColumnVisibility(defaultVisibility);
            setColumnOrder(defaultOrder);
            saveColumnVisibilityToStorage(defaultVisibility);
            saveColumnOrderToStorage(defaultOrder);
          }}
          sx={{ ml: 1 }}
        >
          {t('testResult.button.reset', '기본값')}
        </Button>

        <Tooltip title={
          !jiraConfig
            ? t('testResult.tooltip.jiraNotConfigured', 'JIRA 설정이 필요합니다')
            : !hasJiraTargets
              ? t('testResult.tooltip.noJiraTargets', '연결된 JIRA ID가 없습니다')
              : ''
        }>
          <span>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={handleJiraStatusCheck}
              disabled={!jiraConfig || !hasJiraTargets || jiraStatusLoading}
              sx={{ ml: 1 }}
            >
              {jiraStatusLoading
                ? t('testResult.button.jiraStatusLoading', 'JIRA 상태 확인 중...')
                : t('testResult.button.jiraStatusCheck', 'JIRA 상태 체크')}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* ICT-190: 고급 내보내기 버튼 */}
        <Button
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportClick}
          variant="outlined"
          color="primary"
        >
          {t('testResult.button.advancedExport', '고급 내보내기')}
        </Button>

        <GridToolbarExport
          printOptions={{
            fileName: `테스트결과_${activeProject?.name || 'export'}_${format(new Date(), 'yyyyMMdd_HHmm')}`,
            hideFooter: true,
            hideToolbar: true,
            pageStyle: GRID_PRINT_PAGE_STYLE
          }}
        />
      </Box>
    </GridToolbarContainer>
  );

  // ICT-194: 개선된 에러 상태 UI
  if (error) {
    return (
      <Paper sx={{ width: '100%', p: 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          textAlign: 'center'
        }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
            ⚠️
          </Typography>
          <Typography variant="h6" color="error.main" gutterBottom>
            {t('testResult.error.loadFailure', '테스트 결과를 불러올 수 없습니다')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            {error}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              startIcon={<VisibilityIcon />}
            >
              {t('common.button.refresh', '새로고침')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setError(null)}
            >
              {t('common.button.retry', '다시 시도')}
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* ICT-263: 필터링 패널 */}
      <TestResultFilterPanel
        projectId={projectId}
        onFilterChange={handleFilterChange}
        initialFilters={currentFilters}
        disabled={loading}
      />

      <Paper sx={{ width: '100%' }}>
        {jiraStatusInfo && (
          <Alert
            severity={jiraStatusInfo.type || 'info'}
            onClose={() => setJiraStatusInfo(null)}
            sx={{ mb: 2 }}
          >
            {jiraStatusInfo.message}
          </Alert>
        )}
        {/* ICT-194: 개선된 헤더 - 모바일 반응형 */}
        <Box sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 0 }
        }}>
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {t('testResult.title.detailList', '테스트 결과 상세 목록')}
              {isFiltered && (
                <Typography
                  component="span"
                  sx={{
                    ml: 1,
                    fontSize: '0.75rem',
                    color: 'primary.main',
                    backgroundColor: 'primary.light',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1
                  }}
                >
                  {t('testResult.status.filtered', '필터됨')}
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('testResult.count.results', '{count}개의 테스트 결과{filtered}', { count: rows.length, filtered: isFiltered ? ` (${t('testResult.status.filtered', '필터링됨')})` : '' })}
            </Typography>
          </Box>

          {/* 모바일용 빠른 액션 버튼 */}
          <Box sx={{
            display: { xs: 'flex', sm: 'none' },
            gap: 1,
            width: '100%',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <Button
              size="small"
              startIcon={<SettingsIcon />}
              onClick={(event) => setColumnVisibilityMenuAnchor(event.currentTarget)}
              variant="outlined"
            >
              {t('testResult.button.column', '컬럼')}
            </Button>
            <Button
              size="small"
              onClick={() => setColumnOrderDialogOpen(true)}
              variant="outlined"
            >
              {t('testResult.button.order', '순서')}
            </Button>
            <Button
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportClick}
              variant="contained"
              color="primary"
            >
              {t('testResult.button.export', '내보내기')}
            </Button>
          </Box>
        </Box>

        {/* ICT-194: 반응형 데이터그리드 */}
        <Box sx={{
          height: { xs: 400, sm: dense ? 400 : 600 },
          width: '100%',
          '& .MuiDataGrid-root': {
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            },
            '& .MuiDataGrid-cell': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px', sm: '8px' }
            }
          }
        }}>
          <DataGrid
            rows={rows}
            columns={visibleColumns}
            loading={loading}
            pageSize={dense ? 10 : 25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            pagination
            sortingOrder={['desc', 'asc']}
            disableSelectionOnClick
            density={dense ? 'compact' : 'standard'}
            // ICT-280: 행 ID를 고유하게 유지하여 CSV export 오류 방지
            getRowId={(row) => String(row.id)}
            // ICT-275: 컬럼 순서 변경 기능 활성화
            disableColumnReorder={false}
            onColumnOrderChange={(params) => {
              // DataGrid의 컬럼 순서 변경 이벤트 처리
              const newOrder = params.map(col => col.field);
              handleColumnOrderChange(newOrder);
            }}
            // ICT-276: 동적 행 높이 적용
            getRowHeight={getRowHeight}
            slots={{
              toolbar: CustomToolbar
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'executedDate', sort: 'desc' }]
              },
              pagination: {
                pageSize: dense ? 10 : 25
              }
            }}
            sx={{
              border: 'none',
              '& .table-header': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                fontWeight: 600
              },
              [`& .${gridClasses.row}:hover`]: {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
              },
              // 모바일에서 스크롤 개선
              '& .MuiDataGrid-virtualScroller': {
                '&::-webkit-scrollbar': {
                  height: { xs: '6px', sm: '8px' },
                  width: { xs: '6px', sm: '8px' }
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '3px'
                }
              }
            }}
          />
        </Box>

        {/* ICT-194 Phase 2: 분리된 컬럼 설정 메뉴 컴포넌트 사용 */}
        <TestResultColumnMenu
          anchorEl={columnVisibilityMenuAnchor}
          open={Boolean(columnVisibilityMenuAnchor)}
          onClose={() => setColumnVisibilityMenuAnchor(null)}
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityToggle={handleColumnVisibilityToggle}
          visibleColumns={visibleColumns}
        />

        {/* ICT-194 Phase 2: 분리된 내보내기 다이얼로그 컴포넌트 사용 */}
        <TestResultExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          projectId={projectId}
          visibleColumns={visibleColumns}
          rows={rows}
          totalRows={rows.length}
          activeProject={activeProject}
        />

        {/* ICT-209: 테스트 결과 편집 다이얼로그 */}
        <TestResultEditDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedTestResult(null);
            setSelectedTestCase(null);
          }}
          testResult={selectedTestResult}
          testCase={selectedTestCase}
          onEditSaved={handleEditSaved}
        />

        {/* ICT-275: 컬럼 순서 변경 다이얼로그 */}
        <ColumnOrderDialog
          open={columnOrderDialogOpen}
          onClose={() => setColumnOrderDialogOpen(false)}
          columns={columns}
          columnOrder={columnOrder}
          columnVisibility={columnVisibility}
          onOrderChange={handleColumnOrderChange}
        />

        {/* ICT-362: 첨부파일 다이얼로그 */}
        <Dialog
          open={attachmentDialogOpen}
          onClose={() => {
            setAttachmentDialogOpen(false);
            setSelectedTestResultId(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {t('testResult.dialog.attachmentsTitle', '테스트 결과 첨부파일')}
          </DialogTitle>
          <DialogContent>
            {selectedTestResultId && (
              <TestResultAttachmentsView
                testResultId={selectedTestResultId}
                showUpload={false}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAttachmentDialogOpen(false);
              setSelectedTestResultId(null);
            }}>
              {t('common.button.close', '닫기')}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default TestResultDetailTable;
