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

  // 스프레드시트 모드에서 사용할 데이터 준비 (중복 방지)
  useEffect(() => {
    if (inputMode === 'spreadsheet') {
      // 현재 프로젝트의 모든 테스트케이스를 스프레드시트 데이터로 설정 (중복 방지 체크)
      const currentDataJson = JSON.stringify(spreadsheetData);
      const newDataJson = JSON.stringify(projectTestCases);
      
      if (currentDataJson !== newDataJson) {
        console.log(`스프레드시트 데이터 업데이트: ${projectTestCases.length}개 테스트케이스`);
        setSpreadsheetData(projectTestCases);
      }
    }
  }, [inputMode]); // 의존성 최소화

  // 입력 모드 변경 핸들러
  const handleModeChange = (newMode) => {
    setInputMode(newMode);
    // 모드 변경 시 데이터 새로고침
    if (newMode === 'spreadsheet') {
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

      console.log(`저장할 유효한 테스트케이스: ${validTestCases.length}개`, validTestCases);

      const results = [];
      
      for (const testCase of validTestCases) {
        if (testCase.id && !testCase.id.startsWith('temp-')) {
          // 기존 테스트케이스 업데이트
          console.log(`기존 테스트케이스 업데이트: ${testCase.id}`);
          const result = await updateTestCase(testCase);
          results.push(result);
        } else {
          // 새 테스트케이스 추가
          const newTestCase = { ...testCase };
          delete newTestCase.id; // 임시 ID 제거
          console.log(`새 테스트케이스 추가:`, newTestCase.name);
          const result = await addTestCase(newTestCase);
          results.push(result);
        }
      }

      console.log(`총 ${results.length}개 테스트케이스 저장 완료`);

      // 성공 시 콜백 호출 (한 번만)
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