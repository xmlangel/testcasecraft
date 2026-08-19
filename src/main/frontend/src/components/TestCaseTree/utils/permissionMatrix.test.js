import { describe, it, expect } from "vitest";
import {
  canEditProjectContent,
  isViewer,
  canAdd,
  canDelete,
  canRecordTestResult,
  canManageProjectMembers,
  canManageProjectSettings,
} from "./permissionUtils.js";

/**
 * 여섯 프로젝트 역할이 사용자 매뉴얼 18-4 대로 갈리는지 한 표에서 확인한다.
 *
 * 개별 함수 테스트는 이미 있지만 역할 하나가 여러 함수에서 어긋나는 것은 잡지 못한다.
 * 여기서는 역할 × 능력 조합을 전부 적어 두고 하나라도 어긋나면 어느 조합인지 밝힌다.
 * VIEWER 만 보지 않는 이유는 반대 방향 결함(프로젝트 매니저에게 기능이 잠기는 것)도
 * 같은 표에서 드러나야 하기 때문이다.
 *
 * "ADMIN" 은 역할이 아니라 useProjectRole 이 시스템 관리자에게 주는 센티널 값이다.
 */
const MATRIX = [
  // 역할              편집   조회전용  추가   삭제  결과기록 멤버관리 설정변경
  ["PROJECT_MANAGER", true, false, true, true, true, true, true],
  ["LEAD_DEVELOPER", true, false, true, true, true, true, false],
  ["DEVELOPER", true, false, true, true, true, false, false],
  ["CONTRIBUTOR", true, false, true, true, true, false, false],
  ["TESTER", false, true, false, false, true, false, false],
  ["VIEWER", false, true, false, false, false, false, false],
  // 역할을 아직 모르는 상태는 조회 전용으로 다룬다 (fail-closed)
  [null, false, true, false, false, false, false, false],
  [undefined, false, true, false, false, false, false, false],
  // 시스템 관리자 센티널 — 멤버 관리·설정까지 열리고, 그 둘의 백엔드 술어도 관리자를 받는다
  ["ADMIN", true, false, true, true, true, true, true],
];

const CAPABILITIES = [
  ["편집", canEditProjectContent],
  ["조회전용", isViewer],
  ["추가", canAdd],
  ["삭제", canDelete],
  ["결과기록", canRecordTestResult],
  ["멤버관리", canManageProjectMembers],
  ["설정변경", canManageProjectSettings],
];

describe("프로젝트 역할 × 능력 매트릭스", () => {
  it("모든 조합이 매뉴얼 18-4 와 일치한다", () => {
    const mismatches = [];
    for (const [role, ...expected] of MATRIX) {
      CAPABILITIES.forEach(([name, fn], index) => {
        const actual = fn(role);
        if (actual !== expected[index]) {
          mismatches.push(
            `${String(role)} × ${name} → 실제 ${actual}, 규정 ${expected[index]}`,
          );
        }
      });
    }
    expect(mismatches).toEqual([]);
  });

  it("모르는 역할 값은 전부 차단된다", () => {
    for (const unknown of [
      "OWNER",
      "MEMBER",
      "MANAGER",
      "USER",
      "",
      "viewer",
    ]) {
      expect(canEditProjectContent(unknown)).toBe(false);
      expect(canRecordTestResult(unknown)).toBe(false);
      expect(canManageProjectMembers(unknown)).toBe(false);
      expect(canManageProjectSettings(unknown)).toBe(false);
    }
  });

  it("권한 단계가 포함 관계를 지킨다", () => {
    const roles = MATRIX.map(([role]) => role);
    const passing = (fn) => roles.filter((role) => fn(role));
    const members = passing(canManageProjectMembers);
    const editors = passing(canEditProjectContent);
    const recorders = passing(canRecordTestResult);

    expect(editors).toEqual(expect.arrayContaining(members));
    expect(recorders).toEqual(expect.arrayContaining(editors));
    expect(editors.length).toBeGreaterThan(members.length);
    expect(recorders.length).toBeGreaterThan(editors.length);
  });
});
