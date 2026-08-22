// src/constants/screenIds.test.js
import { describe, it, expect } from "vitest";
import { resolveScreenId, screenDocPath, SCREENS } from "./screenIds.js";

describe("resolveScreenId", () => {
  it.each([
    ["/", "S0"],
    ["/login", "S0"],
    ["/verify-email?token=abc", "S0"],
    ["/manual", "S0"],
    ["/guides/GOOGLE_SHEETS_SETUP_GUIDE", "S0"],
    ["/projects", "S1"],
    ["/projects/p1/bookmarks", "S2"],
    ["/projects/p1/settings", "S1"],
    ["/dashboard", "S3"],
    ["/projects/p1", "S3"],
    ["/projects/p1/", "S3"],
    ["/projects/p1/testcases", "S4"],
    ["/projects/p1/testcases/tc9", "S4"],
    ["/projects/p1/testplans", "S5"],
    ["/projects/p1/testplans/new", "S5"],
    ["/projects/p1/executions", "S6"],
    ["/projects/p1/executions/e1", "S6"],
    ["/projects/p1/executions/e1/testcases/tc1/result", "S6"],
    ["/executions/e1", "S6"],
    ["/projects/p1/results", "S7"],
    ["/projects/p1/automation", "S8"],
    ["/projects/p1/junit", "S8"],
    ["/projects/p1/automation-results/r1", "S8"],
    ["/projects/p1/junit-results/r1", "S8"],
    ["/junit-results/r1", "S8"],
    ["/automation-tests/r1", "S8"],
    ["/projects/p1/rag", "S9"],
    ["/projects/p1/exploratory", "S10"],
    ["/organizations", "S11"],
    ["/organizations/o1", "S11"],
    ["/users", "S11"],
    ["/mail-settings", "S11"],
    ["/llm-config", "S11"],
    ["/scheduler", "S11"],
    ["/translation-management", "S11"],
  ])("%s → %s", (path, expected) => {
    expect(resolveScreenId(path)).toBe(expected);
  });

  it("실행 주소에 viewType 이 붙으면 결과 화면으로 본다", () => {
    expect(
      resolveScreenId("/projects/p1/executions", "?viewType=summary"),
    ).toBe("S7");
    expect(resolveScreenId("/projects/p1/executions", "viewType=summary")).toBe(
      "S7",
    );
    expect(resolveScreenId("/projects/p1/executions", "?page=2")).toBe("S6");
  });

  it("규칙에 없는 주소는 null 을 돌려준다", () => {
    expect(resolveScreenId("/jira-redirect/ABC-1")).toBeNull();
    expect(resolveScreenId("/unknown/path")).toBeNull();
    expect(resolveScreenId("")).toBeNull();
    expect(resolveScreenId(undefined)).toBeNull();
  });
});

describe("화면 정의", () => {
  it("화면 ID 12개가 S0~S11 로 빠짐없이 정의되어 있다", () => {
    const want = Array.from({ length: 12 }, (_, i) => `S${i}`);
    expect(Object.keys(SCREENS).sort()).toEqual(want.sort());
  });

  it("문서 폴더 번호가 화면 ID 번호와 같다", () => {
    Object.entries(SCREENS).forEach(([id, { folder }]) => {
      expect(folder.split(".")[0]).toBe(id.slice(1));
    });
  });

  it("문서 경로를 만든다", () => {
    expect(screenDocPath("S4")).toBe("docs/screen_spec/4.테스트케이스/");
    expect(screenDocPath("S99")).toBeNull();
  });
});
