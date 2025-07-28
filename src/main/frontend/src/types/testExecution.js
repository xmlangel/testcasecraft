// src/types/testExecution.js
/**
 * 테스트실행 관련 타입 정의
 */

/**
 * 테스트 결과 상세
 * @typedef {Object} TestResult
 * @property {string} testCaseId - 테스트케이스 ID
 * @property {import('./common.js').TestResult} result - 실행 결과
 * @property {string} [notes] - 실행 노트
 * @property {string} [executedAt] - 실행일시
 * @property {string} [executedBy] - 실행자
 * @property {string[]} [attachments] - 첨부파일 목록
 */

/**
 * 테스트실행 정보
 * @typedef {import('./common.js').BaseEntity & Object} TestExecution
 * @property {string} name - 실행명
 * @property {string} [description] - 설명
 * @property {string} projectId - 프로젝트 ID
 * @property {string} testPlanId - 테스트플랜 ID
 * @property {import('./common.js').ExecutionStatus} status - 실행 상태
 * @property {string} [startDate] - 시작일시
 * @property {string} [endDate] - 종료일시
 * @property {string} executorId - 실행자 ID
 * @property {TestResult[]} results - 테스트 결과 목록
 * @property {Object} [environment] - 실행 환경 정보
 * @property {string} [notes] - 실행 노트
 */

/**
 * 테스트실행 생성 요청
 * @typedef {Object} CreateTestExecutionRequest
 * @property {string} name - 실행명
 * @property {string} [description] - 설명
 * @property {string} projectId - 프로젝트 ID
 * @property {string} testPlanId - 테스트플랜 ID
 * @property {Object} [environment] - 실행 환경 정보
 * @property {string} [notes] - 실행 노트
 */

/**
 * 테스트실행 수정 요청
 * @typedef {Object} UpdateTestExecutionRequest
 * @property {string} [name] - 실행명
 * @property {string} [description] - 설명
 * @property {import('./common.js').ExecutionStatus} [status] - 실행 상태
 * @property {Object} [environment] - 실행 환경 정보
 * @property {string} [notes] - 실행 노트
 */

/**
 * 테스트 결과 업데이트 요청
 * @typedef {Object} UpdateTestResultRequest
 * @property {string} testCaseId - 테스트케이스 ID
 * @property {import('./common.js').TestResult} result - 실행 결과
 * @property {string} [notes] - 실행 노트
 * @property {string[]} [attachments] - 첨부파일 목록
 */

/**
 * 테스트실행 통계
 * @typedef {Object} TestExecutionStats
 * @property {number} totalTestCases - 전체 테스트케이스 수
 * @property {number} executedTestCases - 실행된 테스트케이스 수
 * @property {number} passedTestCases - 통과한 테스트케이스 수
 * @property {number} failedTestCases - 실패한 테스트케이스 수
 * @property {number} skippedTestCases - 건너뛴 테스트케이스 수
 * @property {number} notRunTestCases - 미실행 테스트케이스 수
 * @property {number} passRate - 통과율 (%)
 * @property {number} executionRate - 실행률 (%)
 * @property {string} [duration] - 실행 소요시간
 */

export {};