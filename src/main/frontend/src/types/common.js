// src/types/common.js
/**
 * 공통 타입 정의 (JSDoc으로 작성)
 */

/**
 * API 응답 기본 구조
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 성공 여부
 * @property {string} [message] - 메시지
 * @property {any} [data] - 응답 데이터
 * @property {Object} [errors] - 에러 정보
 */

/**
 * 페이지네이션 정보
 * @typedef {Object} Pagination
 * @property {number} page - 현재 페이지
 * @property {number} size - 페이지 크기
 * @property {number} total - 전체 항목 수
 * @property {number} totalPages - 전체 페이지 수
 */

/**
 * 정렬 정보
 * @typedef {Object} Sort
 * @property {string} field - 정렬 필드
 * @property {'asc'|'desc'} direction - 정렬 방향
 */

/**
 * 기본 엔티티 속성
 * @typedef {Object} BaseEntity
 * @property {string} id - 고유 식별자
 * @property {string} createdAt - 생성일시
 * @property {string} updatedAt - 수정일시
 * @property {string} [createdBy] - 생성자
 * @property {string} [updatedBy] - 수정자
 */

/**
 * 사용자 역할
 * @typedef {'ADMIN'|'MANAGER'|'USER'} UserRole
 */

/**
 * 테스트 결과
 * @typedef {'PASS'|'FAIL'|'SKIP'|'NOTRUN'} TestResult
 */

/**
 * 실행 상태
 * @typedef {'NOTSTARTED'|'INPROGRESS'|'COMPLETED'|'CANCELLED'} ExecutionStatus
 */

export {}; // 모듈로 인식되도록