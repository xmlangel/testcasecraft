// src/components/TestCaseTree/utils/permissionUtils.js

/**
 * 권한 관련 유틸리티 함수들
 *
 * 입력값은 시스템 role(User.role: ADMIN/MANAGER/TESTER/null)이 아니라
 * useProjectRole() 훅이 반환하는 "현재 프로젝트에서의 역할"이다
 * (PROJECT_MANAGER/LEAD_DEVELOPER/DEVELOPER/TESTER/CONTRIBUTOR/VIEWER,
 * 시스템 ADMIN인 경우 "ADMIN" 센티널 값).
 *
 * 백엔드 ProjectSecurityService.hasEditRole() / canEditProject() 와 동일한 규칙을 따른다:
 * PROJECT_MANAGER, LEAD_DEVELOPER, DEVELOPER, CONTRIBUTOR(+시스템 ADMIN)만 편집 가능하고,
 * TESTER/VIEWER 및 역할을 알 수 없는 경우(null/undefined)는 편집 불가로 처리한다(fail-closed).
 */
const EDIT_ROLES = new Set([
  "ADMIN", // 시스템 관리자 (useProjectRole 의 우회 센티널)
  "PROJECT_MANAGER",
  "LEAD_DEVELOPER",
  "DEVELOPER",
  "CONTRIBUTOR",
]);

/**
 * 프로젝트 콘텐츠(테스트케이스/폴더) 편집 가능 여부
 * @param {string|null|undefined} projectRole - 현재 프로젝트에서의 역할
 * @returns {boolean}
 */
export const canEditProjectContent = (projectRole) => EDIT_ROLES.has(projectRole);

/**
 * 조회 전용(편집 불가) 역할인지 확인 — VIEWER/TESTER 및 역할 미확정 상태를 모두 포함한다.
 * @param {string|null|undefined} projectRole - 현재 프로젝트에서의 역할
 * @returns {boolean}
 */
export const isViewer = (projectRole) => !canEditProjectContent(projectRole);

/**
 * 추가 권한이 있는지 확인
 * @param {string|null|undefined} projectRole - 현재 프로젝트에서의 역할
 * @returns {boolean}
 */
export const canAdd = (projectRole) => canEditProjectContent(projectRole);

/**
 * 삭제 권한이 있는지 확인
 * @param {string|null|undefined} projectRole - 현재 프로젝트에서의 역할
 * @returns {boolean}
 */
export const canDelete = (projectRole) => canEditProjectContent(projectRole);

/**
 * 테스트 실행 결과 기록(PASS/FAIL 등) 가능 여부.
 * 백엔드 ProjectSecurityService.canRecordTestResult()와 동일하게 편집 가능 role에 TESTER를 더한다 —
 * TESTER는 테스트케이스/플랜 자체를 편집할 권한은 없지만 결과 기록은 본연의 업무이기 때문이다.
 * @param {string|null|undefined} projectRole - 현재 프로젝트에서의 역할
 * @returns {boolean}
 */
export const canRecordTestResult = (projectRole) =>
  canEditProjectContent(projectRole) || projectRole === "TESTER";
