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
    // 폴더 5개 생성
    createTestFolder("folder-1", "Test Folder 1"),
    createTestFolder("folder-2", "Test Folder 2"),
    createTestFolder("folder-3", "Test Folder 3"),
    createTestFolder("folder-4", "Test Folder 4"),
    createTestFolder("folder-5", "Test Folder 5"),
    // 각 폴더에 20개씩 테스트 케이스 생성
    ...Array.from({ length: 100 }, (_, i) => {
      const folderIdx = Math.floor(i / 20) + 1;
      return createTestCase(
        `test-${i + 1}`,
        `테스트 케이스 ${i + 1}`,
        `folder-${folderIdx}`,
        "testcase",
        `테스트 케이스 ${i + 1}의 설명입니다.`,
        [
          createTestStep(1, "Step 1 설명", "Step 1 기대 결과"),
          createTestStep(2, "Step 2 설명", "Step 2 기대 결과"),
        ],
        "전체 기대 결과"
      );
    }),
  ];