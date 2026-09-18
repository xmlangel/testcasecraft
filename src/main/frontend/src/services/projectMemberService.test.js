import { describe, it, expect } from "vitest";
import { PROJECT_ROLES } from "./projectMemberService.js";
import { canEditProjectContent } from "../components/TestCaseTree/utils/permissionUtils.js";

/**
 * 역할 목록은 화면의 역할 선택 드롭다운을 그리는 데 쓰이고, 그 드롭다운은 만들 수
 * 있는 역할과 없는 역할을 선으로 갈라 보여준다. 목록 순서가 권한 경계와 어긋나면
 * 두 무리가 뒤섞여 구분선이 뜻을 잃는다.
 *
 * 예전에 테스터가 기여자보다 앞에 있어서 실제로 그런 상태였다. 사람이 순서를 다시
 * 건드리거나 역할이 하나 늘어날 때 같은 일이 반복되지 않게 고정한다.
 */
describe("PROJECT_ROLES", () => {
  it("백엔드 ProjectUser.ProjectRole 여섯 역할을 모두 담는다", () => {
    expect([...PROJECT_ROLES].sort()).toEqual(
      [
        "CONTRIBUTOR",
        "DEVELOPER",
        "LEAD_DEVELOPER",
        "PROJECT_MANAGER",
        "TESTER",
        "VIEWER",
      ].sort(),
    );
  });

  it("만들 수 있는 역할이 모두 앞에 오고 없는 역할이 뒤에 온다", () => {
    const boundary = PROJECT_ROLES.findIndex(
      (role) => !canEditProjectContent(role),
    );
    expect(boundary).toBeGreaterThan(0);
    expect(PROJECT_ROLES.slice(0, boundary).every(canEditProjectContent)).toBe(
      true,
    );
    expect(
      PROJECT_ROLES.slice(boundary).some((role) => canEditProjectContent(role)),
    ).toBe(false);
  });

  it("만들 수 있는 역할은 넷, 없는 역할은 둘이다", () => {
    const canCreate = PROJECT_ROLES.filter((role) =>
      canEditProjectContent(role),
    );
    expect(canCreate).toEqual([
      "PROJECT_MANAGER",
      "LEAD_DEVELOPER",
      "DEVELOPER",
      "CONTRIBUTOR",
    ]);
    expect(
      PROJECT_ROLES.filter((role) => !canEditProjectContent(role)),
    ).toEqual(["TESTER", "VIEWER"]);
  });
});
