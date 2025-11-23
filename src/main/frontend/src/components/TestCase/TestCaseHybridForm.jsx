// src/components/TestCase/TestCaseHybridForm.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useAppContext } from '../../context/AppContext.jsx';
import InputModeToggle from './InputModeToggle.jsx';
import TestCaseForm from '../TestCaseForm.jsx';
import TestCaseSpreadsheet from './TestCaseSpreadsheet.jsx';
import TestCaseDatasheetGrid from './TestCaseDatasheetGrid.jsx';
import testCaseService from '../../services/testCaseService.js';
import { debugLog } from '../../utils/logger';

const TestCaseHybridForm = ({ testCaseId, projectId, onSave }) => {
  const { testCases, addTestCase, updateTestCase, fetchProjectTestCases } = useAppContext();
  const [inputMode, setInputMode] = useState('form'); // 'form' | 'spreadsheet' | 'advanced-spreadsheet'
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const isUserEditingRef = useRef(false); // 사용자 입력 중 플래그

  // 프로젝트의 테스트케이스 및 폴더 개수 계산 (ICT-343: 폴더도 스프레드시트에 표시)
  // 유령 데이터 필터링: 이름이 없거나 빈 문자열인 경우 제외
  // useMemo로 불필요한 재계산 방지
  const projectTestCases = useMemo(() => {

    const filtered = testCases.filter(tc => {
      const hasValidProjectId = String(tc.projectId) === String(projectId);
      const hasValidType = tc.type === 'testcase' || tc.type === 'folder' || tc.type === null;
      const hasValidName = tc.name && tc.name.trim().length > 0; // 이름이 있고 빈 문자열이 아님

      // 필터링 실패한 케이스 로그
      if (hasValidProjectId && hasValidType && !hasValidName) {
        console.warn('[HybridForm] ⚠️ 유령 데이터 발견 (이름 없음):', tc.id, tc);
      }

      return hasValidProjectId && hasValidType && hasValidName;
    });

    return filtered;
  }, [testCases, projectId]);

  // 스프레드시트 모드에서 사용할 데이터 준비 (중복 방지) - ICT-158 개선
  useEffect(() => {
    if (inputMode === 'spreadsheet' || inputMode === 'advanced-spreadsheet') {
      // 사용자가 입력 중이면 백엔드 데이터로 덮어쓰지 않음
      if (isUserEditingRef.current) {
        return;
      }

      // JSON 비교로 실제 데이터 변경 여부 확인 (무한 루프 방지)
      const currentDataJson = JSON.stringify(spreadsheetData);
      const newDataJson = JSON.stringify(projectTestCases);

      // 데이터가 실제로 다를 때만 업데이트 (사용자 입력 보호)
      if (currentDataJson !== newDataJson) {
        setSpreadsheetData(projectTestCases);
      } else {
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

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = (updatedTestCases) => {

    // 사용자가 입력 중임을 표시
    isUserEditingRef.current = true;

    // 무한 루프 방지를 위해 직접 비교
    if (JSON.stringify(updatedTestCases) !== JSON.stringify(spreadsheetData)) {
      setSpreadsheetData(updatedTestCases);
    }

    // 입력 완료 후 플래그 리셋 (디바운스)
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 500);
  };

  // 스프레드시트 일괄 저장 핸들러 (중복 생성 방지)
  const handleSpreadsheetSave = async (testCasesToSave, explicitDeletedIds = []) => {
    debugLog('Spreadsheet', 'handleSpreadsheetSave called');
    debugLog('Spreadsheet', 'testCasesToSave count:', testCasesToSave.length);
    debugLog('Spreadsheet', 'explicitDeletedIds:', explicitDeletedIds);

    try {
      // 삭제 처리 (명시적으로 전달된 ID만 처리)
      if (explicitDeletedIds && explicitDeletedIds.length > 0) {
        debugLog('Spreadsheet', 'Processing deletions:', explicitDeletedIds.length);
        await Promise.all(explicitDeletedIds.map(id => testCaseService.deleteTestCase(id)));
        debugLog('Spreadsheet', 'Deletions completed');
      }

      // 저장/수정 처리
      const validTestCases = testCasesToSave.filter(tc =>
        tc.name && tc.name.trim().length > 0
      );

      let result = null;
      if (validTestCases.length > 0) {
        debugLog('Spreadsheet', 'Processing batch save:', validTestCases.length);
        result = await testCaseService.batchSaveTestCases(validTestCases);
        debugLog('Spreadsheet', 'Batch save completed:', result);
      }

      // 성공 시 데이터 새로고침
      await handleRefreshData();

      if (onSave) {
        onSave();
      }

      return result;
    } catch (error) {
      console.error('Batch save/delete failed:', error);
      throw error;
    }
  };

  // 데이터 새로고침 핸들러 (백엔드에서 최신 데이터 가져오기) - ICT-158 개선
  const handleRefreshData = useCallback(async () => {
    try {
      // 새로고침 시에는 사용자 입력 플래그 해제
      isUserEditingRef.current = false;

      // 백엔드에서 최신 테스트케이스 데이터 가져오기
      await fetchProjectTestCases(projectId);

      // useEffect가 자동으로 스프레드시트 데이터를 업데이트할 것임
      // 따라서 여기서는 백엔드 호출만 하고 UI 업데이트는 useEffect에 맡김

    } catch (error) {
      throw error;
    }
  }, [projectId, fetchProjectTestCases]);

  // 개별 폼 저장 핸들러
  const handleFormSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <Box>
      {/* 입력 모드 토글 */}
      <InputModeToggle
        mode={inputMode}
        onChange={handleModeChange}
        testCaseCount={projectTestCases.length}
      />

      {/* 모드에 따른 컴포넌트 렌더링 */}
      {inputMode === 'form' ? (
        <TestCaseForm
          testCaseId={testCaseId}
          projectId={projectId}
          onSave={handleFormSave}
        />
      ) : inputMode === 'spreadsheet' ? (
        <TestCaseSpreadsheet
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
          onRefresh={handleRefreshData}
          projectId={projectId}
        />
      ) : (
        <TestCaseDatasheetGrid
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
          onRefresh={handleRefreshData}
          projectId={projectId}
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