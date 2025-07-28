// src/types/testPlan.js  
/**
 * 테스트플랜 관련 타입 정의
 */

/**
 * 테스트플랜 정보
 * @typedef {import('./common.js').BaseEntity & Object} TestPlan
 * @property {string} name - 테스트플랜명
 * @property {string} [description] - 설명
 * @property {string} projectId - 프로젝트 ID
 * @property {string[]} testCaseIds - 포함된 테스트케이스 ID 목록
 * @property {string} [startDate] - 시작일
 * @property {string} [endDate] - 종료일
 * @property {string} [status] - 상태
 * @property {Object} [settings] - 플랜 설정
 */

/**
 * 테스트플랜 생성 요청
 * @typedef {Object} CreateTestPlanRequest
 * @property {string} name - 테스트플랜명
 * @property {string} [description] - 설명
 * @property {string} projectId - 프로젝트 ID
 * @property {string[]} testCaseIds - 포함된 테스트케이스 ID 목록
 * @property {string} [startDate] - 시작일
 * @property {string} [endDate] - 종료일
 */

/**
 * 테스트플랜 수정 요청
 * @typedef {Object} UpdateTestPlanRequest
 * @property {string} [name] - 테스트플랜명
 * @property {string} [description] - 설명
 * @property {string[]} [testCaseIds] - 포함된 테스트케이스 ID 목록
 * @property {string} [startDate] - 시작일
 * @property {string} [endDate] - 종료일
 * @property {string} [status] - 상태
 */

/**
 * 테스트플랜 통계
 * @typedef {Object} TestPlanStats
 * @property {number} totalTestCases - 전체 테스트케이스 수
 * @property {number} executedTestCases - 실행된 테스트케이스 수
 * @property {number} passedTestCases - 통과한 테스트케이스 수
 * @property {number} failedTestCases - 실패한 테스트케이스 수
 * @property {number} skippedTestCases - 건너뛴 테스트케이스 수
 * @property {number} passRate - 통과율 (%)
 * @property {number} executionRate - 실행률 (%)
 */

export {};