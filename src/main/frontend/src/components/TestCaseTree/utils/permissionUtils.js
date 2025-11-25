// src/components/TestCaseTree/utils/permissionUtils.js

/**
 * 권한 관련 유틸리티 함수들
 */

/**
 * Viewer 권한인지 확인
 * @param {string} role - 사용자 역할
 * @returns {boolean}
 */
export const isViewer = (role) => role === "VIEWER";

/**
 * 삭제 권한이 있는지 확인 (ADMIN, MANAGER만 가능)
 * @param {string} role - 사용자 역할
 * @returns {boolean}
 */
export const canDelete = (role) => role === "ADMIN" || role === "MANAGER";

/**
 * 추가 권한이 있는지 확인 (ADMIN, MANAGER만 가능)
 * @param {string} role - 사용자 역할
 * @returns {boolean}
 */
export const canAdd = (role) => role === "ADMIN" || role === "MANAGER";
