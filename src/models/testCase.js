// /src/models/testCase.js
/**
 * 테스트케이스 데이터 모델
 * 폴더(테스트 그룹)와 테스트케이스를 동일한 구조로 관리
 */

// 기본 테스트케이스 객체 생성 함수
export const createTestCase = (id, name, parentId = null, type = 'testcase', description = '') => ({
    id,
    name,
    parentId,
    type, // 'folder' 또는 'testcase'
    description,
    steps: [],
    expectedResults: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // 테스트케이스 폴더(그룹) 생성 함수
  export const createTestFolder = (id, name, parentId = null) => ({
    id,
    name,
    parentId,
    type: 'folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // 테스트 단계 객체 생성 함수
  export const createTestStep = (stepNumber, description = '', expectedResult = '') => ({
    stepNumber,
    description,
    expectedResult
  });
  
  // 초기 테스트케이스 샘플 데이터
  export const initialTestCases = [
    createTestFolder('folder-1', '로그인 테스트'),
    createTestCase('test-1', '유효한 자격 증명으로 로그인', 'folder-1'),
    createTestCase('test-2', '유효하지 않은 자격 증명으로 로그인', 'folder-1'),
    createTestFolder('folder-2', '사용자 관리'),
    createTestCase('test-3', '사용자 생성', 'folder-2'),
    createTestCase('test-4', '사용자 삭제', 'folder-2'),
  ];
  