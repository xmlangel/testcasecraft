// src/components/TestCase/TestCaseHybridForm.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useAppContext } from '../../context/AppContext.jsx';
import InputModeToggle from './InputModeToggle.jsx';
import TestCaseForm from '../TestCaseForm.jsx';
import TestCaseSpreadsheet from './TestCaseSpreadsheet.jsx';
import TestCaseDatasheetGrid from './TestCaseDatasheetGrid.jsx';

const TestCaseHybridForm = ({ testCaseId, projectId, onSave }) => {
  const { testCases, addTestCase, updateTestCase, fetchProjectTestCases } = useAppContext();
  const [inputMode, setInputMode] = useState('form'); // 'form' | 'spreadsheet' | 'advanced-spreadsheet'
  const [spreadsheetData, setSpreadsheetData] = useState([]);

  // 프로젝트의 테스트케이스 및 폴더 개수 계산 (ICT-343: 폴더도 스프레드시트에 표시)
  const projectTestCases = testCases.filter(tc => 
    String(tc.projectId) === String(projectId) && (tc.type === 'testcase' || tc.type === 'folder' || tc.type === null)
  );

  // 스프레드시트 모드에서 사용할 데이터 준비 (중복 방지) - ICT-158 개선
  useEffect(() => {
    if (inputMode === 'spreadsheet' || inputMode === 'advanced-spreadsheet') {
      // 현재 프로젝트의 모든 테스트케이스를 스프레드시트 데이터로 설정 (중복 방지 체크)
      const currentDataJson = JSON.stringify(spreadsheetData);
      const newDataJson = JSON.stringify(projectTestCases);
      
      if (currentDataJson !== newDataJson) {
        
        setSpreadsheetData(projectTestCases);
      }
    }
  }, [inputMode, projectTestCases, spreadsheetData]); // testCases 변경 시에도 업데이트

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
    // 무한 루프 방지를 위해 직접 비교
    if (JSON.stringify(updatedTestCases) !== JSON.stringify(spreadsheetData)) {
      setSpreadsheetData(updatedTestCases);
    }
  };

  // 스프레드시트 일괄 저장 핸들러 (중복 생성 방지)
  const handleSpreadsheetSave = async (testCasesToSave) => {
    try {
      // 중복 방지: 빈 테스트케이스 제거
      const validTestCases = testCasesToSave.filter(tc =>
        tc.name && tc.name.trim().length > 0
      );

      const results = [];

      // 1단계: displayOrder 충돌 회피를 위해 모든 항목을 임시 값으로 업데이트
      for (const testCase of validTestCases) {
        if (testCase.id && !testCase.id.startsWith('temp-') && !testCase.id.startsWith('new-')) {
          // 기존 테스트케이스를 임시 displayOrder (음수)로 업데이트
          const tempOrder = -1000 - (testCase.displayOrder || 0);
          const tempTestCase = { ...testCase, displayOrder: tempOrder };

          try {
            await updateTestCase(tempTestCase);
          } catch (error) {
            throw error;
          }
        }
      }

      // 2단계: 실제 displayOrder로 업데이트
      for (const testCase of validTestCases) {
        if (testCase.id && !testCase.id.startsWith('temp-') && !testCase.id.startsWith('new-')) {
          // 기존 테스트케이스 업데이트 (실제 displayOrder)
          try {
            const result = await updateTestCase(testCase);
            results.push(result);
          } catch (error) {
            throw error;
          }
        } else {
          // 새 테스트케이스 추가
          const newTestCase = { ...testCase };
          delete newTestCase.id; // 임시 ID 제거
          const result = await addTestCase(newTestCase);
          results.push(result);
        }
      }

      // 성공 시 데이터 새로고침 (ICT-158)
      await handleRefreshData();

      // 성공 시 콜백 호출 (한 번만)
      if (onSave) {
        onSave();
      }

      return results;
    } catch (error) {
      throw error;
    }
  };

  // 데이터 새로고침 핸들러 (백엔드에서 최신 데이터 가져오기) - ICT-158 개선
  const handleRefreshData = useCallback(async () => {
    try {


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