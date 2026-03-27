// src/components/TestCase/TestCaseHybridForm.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Backdrop, Button, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { debugLog, debugWarn } from '../../utils/logger.js';
import InputModeToggle from './InputModeToggle.jsx';
import TestCaseForm from '../TestCaseForm.jsx';
import TestCaseSpreadsheet from './TestCaseSpreadsheet.jsx';
import TestCaseDatasheetGrid from './TestCaseDatasheetGrid.jsx';
import NoSelectionPlaceholder from '../common/NoSelectionPlaceholder.jsx';

const TestCaseHybridForm = ({ testCaseId, projectId, onSave }) => {
  const params = useParams();

  // Props가 없으면 URL Params 사용
  // testCaseId가 'new' 문자열이면 null로 처리하여 생성 모드로 진입
  const effectiveTestCaseId = (testCaseId === 'new' || params.testCaseId === 'new')
    ? null
    : (testCaseId || params.testCaseId);
  const effectiveProjectId = projectId || params.projectId;

  const { testCases, addTestCase, updateTestCase, fetchProjectTestCases, testCasesLoading, inputMode, setInputMode } = useAppContext();
  const { t } = useI18n();
  // 'form' | 'spreadsheet' | 'advanced-spreadsheet'
  // 'form' | 'spreadsheet' | 'advanced-spreadsheet'


  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const isUserEditingRef = useRef(false); // 사용자 입력 중 플래그
  const [modeToggleExpanded, setModeToggleExpanded] = useState(false); // 입력 모드 토글 펼침 상태

  // 프로젝트의 테스트케이스 및 폴더 개수 계산 (ICT-343: 폴더도 스프레드시트에 표시)
  // 유령 데이터 필터링: 이름이 없거나 빈 문자열인 경우 제외
  // useMemo로 불필요한 재계산 방지
  // 프로젝트의 테스트케이스 및 폴더 필터링 (ICT-UserReq: 폴더별 필터링 기능)
  const projectTestCases = useMemo(() => {
    debugLog('HybridForm', '🔍 projectTestCases 필터링 시작 (선택 ID:', effectiveTestCaseId, ')');

    // 1. 프로젝트 ID 및 데이터 유효성 기본 필터링
    const baseFiltered = testCases.filter(tc => {
      const hasValidProjectId = String(tc.projectId) === String(effectiveProjectId);
      const hasValidType = tc.type === 'testcase' || tc.type === 'folder' || tc.type === null;
      const hasValidName = tc.name && tc.name.trim().length > 0;

      return hasValidProjectId && hasValidType && hasValidName;
    });

    // 2. 선택된 폴더 기준 계층 필터링 (스프레드시트/데이터시트 모드용)
    if (inputMode === 'spreadsheet' || inputMode === 'advanced-spreadsheet') {
      // 선택된 항목이 테스트케이스인 경우, 그 부모 폴더의 내용을 보여줌
      const selectedItem = baseFiltered.find(tc => String(tc.id) === String(effectiveTestCaseId));
      const targetParentId = selectedItem?.type === 'testcase' ? selectedItem.parentId : effectiveTestCaseId;

      const hierarchicalFiltered = baseFiltered.filter(tc => {
        // 부모 ID가 일치하거나 (선택된 폴더의 자식)
        // 선택된 폴더 자체를 포함 (이름 수정 등을 위해)
        const isChild = String(tc.parentId) === String(targetParentId) || (tc.parentId === null && !targetParentId);
        const isSelf = String(tc.id) === String(targetParentId);

        return isChild || isSelf;
      });

      debugLog('HybridForm', '✅ 계층 필터링 결과:', hierarchicalFiltered.length, '개 (Target Parent ID:', targetParentId, ')');
      return hierarchicalFiltered;
    }

    debugLog('HybridForm', '✅ 기본 필터링 결과:', baseFiltered.length, '개');
    return baseFiltered;
  }, [testCases, effectiveProjectId, effectiveTestCaseId, inputMode]);

  // 스프레드시트 모드에서 사용할 데이터 준비 (중복 방지) - ICT-158 개선
  useEffect(() => {
    // 컴포넌트 마운트 시 데이터 로드 보장 (새로고침 시 빈 목록 방지)
    if (effectiveProjectId) {
      fetchProjectTestCases(effectiveProjectId);
    }
  }, [effectiveProjectId, fetchProjectTestCases]);

  useEffect(() => {
    if (inputMode === 'spreadsheet' || inputMode === 'advanced-spreadsheet') {
      // 사용자가 입력 중이면 백엔드 데이터로 덮어쓰지 않음
      // 단, 현재 스프레드시트 데이터가 비어있다면(초기 로딩) 강제로 업데이트 허용
      if (isUserEditingRef.current && spreadsheetData.length > 0) {
        debugLog('HybridForm', '⏸️ 사용자 입력 중 - 업데이트 스킵');
        return;
      }

      // JSON 비교로 실제 데이터 변경 여부 확인 (무한 루프 방지)
      const currentDataJson = JSON.stringify(spreadsheetData);
      const newDataJson = JSON.stringify(projectTestCases);

      // 데이터가 실제로 다를 때만 업데이트 (사용자 입력 보호)
      if (currentDataJson !== newDataJson) {
        debugLog('HybridForm', '🔄 데이터 업데이트:', projectTestCases.length, '개 테스트케이스');
        setSpreadsheetData(projectTestCases);
      } else {
        debugLog('HybridForm', '✅ 데이터 동일 - 업데이트 스킵');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, projectTestCases]); // spreadsheetData는 의존성에서 제외 (비교만 수행)

  // 입력 모드 변경 핸들러
  const handleModeChange = (newMode) => {
    setInputMode(newMode);

    // 모드 변경 시 데이터 새로고침
    if (newMode === 'spreadsheet' || newMode === 'advanced-spreadsheet') {
      setSpreadsheetData(projectTestCases);
    }
  };

  // 현재 선택된 폴더 이름 추출 (새 행 생성 시 기본값으로 사용)
  const activeFolderName = useMemo(() => {
    const selectedItem = testCases.find(tc => String(tc.id) === String(effectiveTestCaseId));
    if (!selectedItem) return '';
    if (selectedItem.type === 'folder') return selectedItem.name;
    
    // 테스트케이스인 경우 부모 폴더의 이름을 찾음
    const parentFolder = testCases.find(tc => tc.id === selectedItem.parentId);
    return parentFolder ? parentFolder.name : '';
  }, [testCases, effectiveTestCaseId]);

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = (updatedTestCases) => {
    debugLog('HybridForm', '📝 사용자 입력 감지:', updatedTestCases.length, '개 행');

    // 무한 루프 방지를 위해 직접 비교
    if (JSON.stringify(updatedTestCases) !== JSON.stringify(spreadsheetData)) {
      // 데이터가 실제로 변경되었을 때만 사용자 입력으로 간주
      isUserEditingRef.current = true;
      debugLog('HybridForm', '💾 스프레드시트 데이터 상태 업데이트');
      setSpreadsheetData(updatedTestCases);

      // 입력 완료 후 플래그 리셋 (디바운스)
      if (window.spreadsheetDebounceTimer) clearTimeout(window.spreadsheetDebounceTimer);
      window.spreadsheetDebounceTimer = setTimeout(() => {
        isUserEditingRef.current = false;
        debugLog('HybridForm', '✅ 사용자 입력 플래그 해제');
      }, 500);
    }
  };

  // 스프레드시트 일괄 저장 핸들러 (중복 생성 방지)
  const handleSpreadsheetSave = async (testCasesToSave) => {
    try {
      // 이미 자식 컴포넌트(Spreadsheet)에서 저장이 완료된 상태임.
      // 여기서는 추가적인 저장을 수행하지 않고, 상위 이벤트 전파만 수행함.
      // handleRefreshData() 호출 제거: Spreadsheet 컴포넌트의 onRefresh prop으로 이미 호출됨 (중복 GET 방지)

      // 성공 시 콜백 호출 (한 번만)
      if (onSave) {
        onSave();
      }

      return [];
    } catch (error) {
      throw error;
    }
  };

  // 데이터 새로고침 핸들러 (백엔드에서 최신 데이터 가져오기) - ICT-158 개선
  const handleRefreshData = useCallback(async () => {
    try {
      // 새로고침 시에는 사용자 입력 플래그 해제
      isUserEditingRef.current = false;

      // 백엔드에서 최신 테스트케이스 데이터 가져오기
      await fetchProjectTestCases(effectiveProjectId);

      // useEffect가 자동으로 스프레드시트 데이터를 업데이트할 것임
      // 따라서 여기서는 백엔드 호출만 하고 UI 업데이트는 useEffect에 맡김

    } catch (error) {
      throw error;
    }
  }, [effectiveProjectId, fetchProjectTestCases]);

  // 개별 폼 저장 핸들러
  const handleFormSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <Box>
      {/* 입력 모드 선택 - 접기/펼치기 */}
      <Box sx={{ mb: 2 }}>
        <Button
          size="small"
          onClick={() => setModeToggleExpanded(!modeToggleExpanded)}
          endIcon={modeToggleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mb: 1 }}
          data-testid="input-mode-expand-button"
        >
          {t('testcase.inputMode.title', '입력 모드 선택')} {modeToggleExpanded ? t('testcase.inputMode.collapse', '접기') : t('testcase.inputMode.expand', '펼치기')}
        </Button>
        <Collapse in={modeToggleExpanded}>
          <InputModeToggle
            mode={inputMode}
            onChange={handleModeChange}
            testCaseCount={projectTestCases.length}
          />
        </Collapse>
      </Box>

      {/* 로딩 인디케이터 (스프레드시트 모드에서만 표시) */}
      {(inputMode === 'spreadsheet' || inputMode === 'advanced-spreadsheet') && (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute' }}
          open={testCasesLoading && spreadsheetData.length === 0}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      {/* 모드에 따른 컴포넌트 렌더링 */}
      {inputMode === 'form' ? (
        effectiveTestCaseId === undefined ? (
          <NoSelectionPlaceholder />
        ) : (
          <TestCaseForm
            key={effectiveTestCaseId || 'new'}
            testCaseId={effectiveTestCaseId}
            projectId={effectiveProjectId}
            onSave={handleFormSave}
          />
        )
      ) : inputMode === 'spreadsheet' ? (
        <TestCaseSpreadsheet
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
          onRefresh={handleRefreshData}
          projectId={effectiveProjectId}
          isLoading={testCasesLoading}
          activeFolderName={activeFolderName}
        />
      ) : (
        <TestCaseDatasheetGrid
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
          onRefresh={handleRefreshData}
          projectId={effectiveProjectId}
          activeFolderName={activeFolderName}
        />
      )}
    </Box>
  );
};

TestCaseHybridForm.propTypes = {
  testCaseId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};

export default TestCaseHybridForm;