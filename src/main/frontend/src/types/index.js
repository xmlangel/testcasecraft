// src/types/index.js
/**
 * 타입 정의 통합 인덱스
 * JSDoc 기반 타입 시스템을 위한 중앙 집중식 타입 관리
 */

// 공통 타입
import './common.js';

// 도메인별 타입
import './user.js';
import './project.js';
import './testCase.js';
import './testPlan.js';
import './testExecution.js';

// 타입 가드 함수들
/**
 * 사용자 객체인지 확인
 * @param {any} obj 
 * @returns {obj is import('./user.js').User}
 */
export function isUser(obj) {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.username === 'string';
}

/**
 * 프로젝트 객체인지 확인
 * @param {any} obj 
 * @returns {obj is import('./project.js').Project}
 */
export function isProject(obj) {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string';
}

/**
 * 테스트케이스 객체인지 확인
 * @param {any} obj 
 * @returns {obj is import('./testCase.js').TestCase}
 */
export function isTestCase(obj) {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' &&
         ['folder', 'testcase'].includes(obj.type);
}

/**
 * 테스트플랜 객체인지 확인
 * @param {any} obj 
 * @returns {obj is import('./testPlan.js').TestPlan}
 */
export function isTestPlan(obj) {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' &&
         Array.isArray(obj.testCaseIds);
}

/**
 * 테스트실행 객체인지 확인
 * @param {any} obj 
 * @returns {obj is import('./testExecution.js').TestExecution}
 */
export function isTestExecution(obj) {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' &&
         typeof obj.testPlanId === 'string' &&
         ['NOTSTARTED', 'INPROGRESS', 'COMPLETED', 'CANCELLED'].includes(obj.status);
}