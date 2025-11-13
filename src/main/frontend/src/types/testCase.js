// src/types/testCase.js
/**
 * 테스트케이스 관련 타입 정의
 */

/**
 * 테스트케이스 타입
 * @typedef {'folder'|'testcase'} TestCaseType
 */

/**
 * 테스트케이스 우선순위
 * @typedef {'HIGH'|'MEDIUM'|'LOW'} TestCasePriority
 */

/**
 * 테스트 단계
 * @typedef {Object} TestStep
 * @property {number} order - 순서
 * @property {string} action - 수행 동작
 * @property {string} expected - 예상 결과
 * @property {string} [notes] - 참고사항
 */

/**
 * 테스트케이스 정보
 * @typedef {import('./common.js').BaseEntity & Object} TestCase
 * @property {string} name - 테스트케이스명
 * @property {string} [description] - 설명
 * @property {TestCaseType} type - 타입 (폴더 또는 테스트케이스)
 * @property {string} projectId - 프로젝트 ID
 * @property {string} [parentId] - 부모 ID (폴더 구조)
 * @property {TestCasePriority} [priority] - 우선순위
 * @property {string} [tags] - 태그 (콤마 구분)
 * @property {TestStep[]} [steps] - 테스트 단계들
 * @property {string} [preconditions] - 전제조건
  * @property {string} [postCondition] - 사후조건
  * @property {boolean} [isAutomated] - 자동화 여부
  * @property {string} [executionType] - Manual/Automation 구분
  * @property {string} [testTechnique] - 테스트 기법
  * @property {string} [expectedResults] - 예상 결과
  * @property {number} [order] - 정렬 순서
  * @property {boolean} [isActive] - 활성 상태
 */

/**
 * 테스트케이스 생성 요청
 * @typedef {Object} CreateTestCaseRequest
 * @property {string} name - 테스트케이스명
 * @property {string} [description] - 설명
 * @property {TestCaseType} type - 타입
 * @property {string} projectId - 프로젝트 ID
 * @property {string} [parentId] - 부모 ID
 * @property {TestCasePriority} [priority] - 우선순위
 * @property {string} [tags] - 태그
 * @property {TestStep[]} [steps] - 테스트 단계들
 * @property {string} [preconditions] - 전제조건
 * @property {string} [postCondition] - 사후조건
 * @property {boolean} [isAutomated] - 자동화 여부
 * @property {string} [executionType] - Manual/Automation 구분
 * @property {string} [testTechnique] - 테스트 기법
 * @property {string} [expectedResults] - 예상 결과
 */

/**
 * 테스트케이스 수정 요청
 * @typedef {Object} UpdateTestCaseRequest
 * @property {string} [name] - 테스트케이스명
 * @property {string} [description] - 설명
 * @property {TestCasePriority} [priority] - 우선순위
 * @property {string} [tags] - 태그
 * @property {TestStep[]} [steps] - 테스트 단계들
 * @property {string} [preconditions] - 전제조건
 * @property {string} [postCondition] - 사후조건
 * @property {boolean} [isAutomated] - 자동화 여부
 * @property {string} [executionType] - Manual/Automation 구분
 * @property {string} [testTechnique] - 테스트 기법
 * @property {string} [expectedResults] - 예상 결과
 * @property {boolean} [isActive] - 활성 상태
 */

export {};
