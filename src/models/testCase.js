// /src/models/testCase.js
/**
 * 테스트케이스 데이터 모델
 * 폴더(테스트 그룹)와 테스트케이스를 동일한 구조로 관리
 */

// 기본 테스트케이스 객체 생성 함수
export const createTestCase = (
  id,
  name,
  parentId = null,
  type = 'testcase',
  description = '',
  steps = [],
  expectedResults = ''
) => ({
  id,
  name,
  parentId,
  type,
  description,
  steps,
  expectedResults,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// export const createTestCase = (id, name, parentId = null, type = 'testcase', description = '') => ({
//     id,
//     name,
//     parentId,
//     type, // 'folder' 또는 'testcase'
//     description,
//     steps: [],
//     expectedResults: '',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   });
  
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
  // // 초기 테스트케이스 샘플 데이터
  // export const initialTestCases = [
  //   createTestFolder('folder-1', '로그인 테스트'),
  //   createTestCase(
  //     'test-1',
  //     '유효한 자격 증명으로 로그인',
  //     'folder-1',
  //     'testcase',
  //     '',
  //     [
  //       createTestStep(1, '로그인 페이지 접속', '로그인 폼이 정상적으로 표시된다.'),
  //       createTestStep(2, '유효한 아이디와 비밀번호 입력', '입력 필드에 값이 정상적으로 입력된다.'),
  //       createTestStep(3, '로그인 버튼 클릭', '대시보드 페이지로 이동한다.'),
  //       createTestStep(4, '사용자 이름이 화면에 표시되는지 확인', '로그인한 사용자 이름이 우측 상단에 표시된다.')
  //     ]
  //   ),
  //   createTestCase(
  //     'test-2',
  //     '유효하지 않은 자격 증명으로 로그인',
  //     'folder-1',
  //     'testcase',
  //     '',
  //     [
  //       createTestStep(1, '로그인 페이지 접속', '로그인 폼이 정상적으로 표시된다.'),
  //       createTestStep(2, '유효하지 않은 아이디와/또는 비밀번호 입력', '입력 필드에 값이 정상적으로 입력된다.'),
  //       createTestStep(3, '로그인 버튼 클릭', '오류 메시지(로그인 실패)가 표시된다.'),
  //       createTestStep(4, '로그인 상태 확인', '로그인되지 않고, 로그인 페이지에 머문다.')
  //     ]
  //   ),
  //   createTestFolder('folder-2', '사용자 관리'),
  //   createTestCase(
  //     'test-3',
  //     '사용자 생성',
  //     'folder-2',
  //     'testcase',
  //     '',
  //     [
  //       createTestStep(1, '사용자 관리 페이지 접속', '사용자 목록이 표시된다.'),
  //       createTestStep(2, '“사용자 추가” 버튼 클릭', '사용자 등록 폼이 표시된다.'),
  //       createTestStep(3, '필수 정보 입력(이름, 이메일 등)', '입력한 정보가 폼에 반영된다.'),
  //       createTestStep(4, '“저장” 버튼 클릭', '새 사용자가 목록에 추가된다.')
  //     ]
  //   ),
  //   createTestCase(
  //     'test-4',
  //     '사용자 삭제',
  //     'folder-2',
  //     'testcase',
  //     '',
  //     [
  //       createTestStep(1, '사용자 관리 페이지 접속', '사용자 목록이 표시된다.'),
  //       createTestStep(2, '삭제할 사용자 선택', '선택한 사용자가 강조 표시된다.'),
  //       createTestStep(3, '“삭제” 버튼 클릭', '삭제 확인 다이얼로그가 표시된다.'),
  //       createTestStep(4, '삭제 확인', '선택한 사용자가 목록에서 사라진다.')
  //     ]
  //   ),
  // ];