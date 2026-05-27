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
 * 추가 권한이 있는지 확인.
 *
 * 프론트엔드 가드는 시스템 role(ADMIN/MANAGER/TESTER/USER/VIEWER) 기준으로
 * 명백한 차단(VIEWER)만 수행한다. 실제 추가 가능 여부는 프로젝트별 권한
 * (PROJECT_MANAGER/LEAD_DEVELOPER/TESTCASE_EDITOR/DEVELOPER/VIEWER)을 기준으로
 * 백엔드의 ProjectSecurityService.hasEditRole() 가 최종 결정한다.
 *
 * 이렇게 함으로써 시스템 role이 USER인 사용자도 본인이 PM인 프로젝트에서
 * 폴더/케이스를 추가할 수 있다 (이전 정책은 시스템 role만 보고 ADMIN/MANAGER 외 모두 차단해
 * 본인이 만든 프로젝트에서도 추가 버튼이 숨겨졌다).
 *
 * @param {string} role - 시스템 사용자 역할
 * @returns {boolean}
 */
export const canAdd = (role) => role != null && role !== "VIEWER";
