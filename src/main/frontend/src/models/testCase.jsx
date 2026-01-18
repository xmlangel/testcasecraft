// /src/models/testCase.js
/**
 * 테스트케이스 데이터 모델
 * 폴더(테스트 그룹)와 테스트케이스를 동일한 구조로 관리
 */

// 기본 테스트케이스 객체 생성 함수
export const createTestCase = (
  id,
  name,
  projectId,
  parentId = null,
  type = 'testcase',
  description = '',
  steps = [],
  expectedResults = ''
) => ({
  id,
  name,
  projectId,
  parentId,
  type,
  description,
  steps,
  expectedResults,
  preCondition: '',
  postCondition: '',
  isAutomated: false,
  executionType: 'Manual',
  testTechnique: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// 테스트케이스 폴더(그룹) 생성 함수
export const createTestFolder = (
  id,
  name,
  projectId,
  parentId = null
) => ({
  id,
  name,
  projectId, // 반드시 프로젝트 지정
  parentId,
  type: "folder",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// 테스트 단계 객체 생성 함수
export const createTestStep = (stepNumber, description = '', expectedResult = '') => ({
  stepNumber,
  description,
  expectedResult
});

// 초기 테스트케이스 샘플 데이터
export const initialTestCases = [
  // 120개 폴더 생성 (상위 10개, 각 폴더마다 하위 11개 폴더)
  ...Array.from({ length: 10 }, (_, i) =>
    createTestFolder(`folder-${i + 1}`, `상위 폴더 ${i + 1}`)
  ),
  ...Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 11 }, (_, j) =>
      createTestFolder(
        `folder-${i + 1}-${j + 1}`,
        `하위 폴더 ${i + 1}-${j + 1}`,
        `folder-${i + 1}`
      )
    )
  ).flat(),
  // 120개 테스트케이스 생성 (각 하위 폴더에 1개씩, 나머지는 상위 폴더에 추가)
  ...Array.from({ length: 110 }, (_, i) => {
    const parentFolder = `folder-${Math.floor(i / 11) + 1}-${(i % 11) + 1}`;
    return createTestCase(
      `test-${i + 1}`,
      `테스트 케이스 ${i + 1}`,
      parentFolder,
      "testcase",
      `테스트 케이스 ${i + 1}의 설명입니다.`,
      [
        createTestStep(1, "Step 1 설명", "Step 1 기대 결과"),
        createTestStep(2, "Step 2 설명", "Step 2 기대 결과"),
      ],
      "전체 기대 결과"
    );
  }),
  ...Array.from({ length: 10 }, (_, i) =>
    createTestCase(
      `test-top-${i + 1}`,
      `상위폴더 테스트케이스 ${i + 1}`,
      `folder-${i + 1}`,
      "testcase",
      `상위폴더 테스트케이스 ${i + 1}의 설명입니다.`,
      [
        createTestStep(1, "Step 1 설명", "Step 1 기대 결과"),
      ],
      "전체 기대 결과"
    )
  ),
];
