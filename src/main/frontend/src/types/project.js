// src/types/project.js
/**
 * 프로젝트 관련 타입 정의
 */

/**
 * 프로젝트 정보
 * @typedef {import('./common.js').BaseEntity & Object} Project
 * @property {string} name - 프로젝트명
 * @property {string} [description] - 설명
 * @property {string} [status] - 상태
 * @property {string} ownerId - 소유자 ID
 * @property {string[]} [memberIds] - 멤버 ID 목록
 * @property {Object} [settings] - 프로젝트 설정
 */

/**
 * 프로젝트 생성 요청
 * @typedef {Object} CreateProjectRequest
 * @property {string} name - 프로젝트명
 * @property {string} [description] - 설명
 * @property {string} [status] - 상태
 */

/**
 * 프로젝트 수정 요청
 * @typedef {Object} UpdateProjectRequest
 * @property {string} [name] - 프로젝트명
 * @property {string} [description] - 설명
 * @property {string} [status] - 상태
 */

/**
 * 프로젝트 통계
 * @typedef {Object} ProjectStats
 * @property {number} totalTestCases - 전체 테스트케이스 수
 * @property {number} totalTestPlans - 전체 테스트플랜 수
 * @property {number} totalExecutions - 전체 실행 수
 * @property {number} completedExecutions - 완료된 실행 수
 * @property {number} passRate - 통과율 (%)
 */

export {};