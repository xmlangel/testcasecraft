// src/components/TestCase/TestCaseHybridForm.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useAppContext } from '../../context/AppContext.jsx';
import InputModeToggle from './InputModeToggle.jsx';
import TestCaseForm from '../TestCaseForm.jsx';
import TestCaseSpreadsheet from './TestCaseSpreadsheet.jsx';

const TestCaseHybridForm = ({ testCaseId, projectId, onSave }) => {
  const { testCases, addTestCase, updateTestCase } = useAppContext();
  const [inputMode, setInputMode] = useState('form'); // 'form' | 'spreadsheet'
  const [spreadsheetData, setSpreadsheetData] = useState([]);

  // 프로젝트의 테스트케이스 개수 계산
  const projectTestCases = testCases.filter(tc => 
    String(tc.projectId) === String(projectId) && tc.type === 'testcase'
  );

  // 스프레드시트 모드에서 사용할 데이터 준비
  useEffect(() => {
    if (inputMode === 'spreadsheet') {
      // 현재 프로젝트의 모든 테스트케이스를 스프레드시트 데이터로 설정
      setSpreadsheetData(projectTestCases);
    }
  }, [inputMode, projectTestCases]);

  // 입력 모드 변경 핸들러
  const handleModeChange = (newMode) => {
    setInputMode(newMode);
  };

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = (updatedTestCases) => {
    setSpreadsheetData(updatedTestCases);
  };

  // 스프레드시트 일괄 저장 핸들러
  const handleSpreadsheetSave = async (testCasesToSave) => {
    try {
      const results = [];
      
      for (const testCase of testCasesToSave) {
        if (testCase.id && !testCase.id.startsWith('temp-')) {
          // 기존 테스트케이스 업데이트
          const result = await updateTestCase(testCase);
          results.push(result);
        } else {
          // 새 테스트케이스 추가
          const newTestCase = { ...testCase };
          delete newTestCase.id; // 임시 ID 제거
          const result = await addTestCase(newTestCase);
          results.push(result);
        }
      }

      // 성공 시 콜백 호출
      if (onSave) {
        onSave();
      }

      return results;
    } catch (error) {
      console.error('일괄 저장 중 오류:', error);
      throw error;
    }
  };

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
      ) : (
        <TestCaseSpreadsheet
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
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