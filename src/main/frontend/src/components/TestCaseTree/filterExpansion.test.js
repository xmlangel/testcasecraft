import { describe, it, expect } from "vitest";
import {
  resolveFilterExpanded,
  toggleFilterCollapsed,
} from "./filterExpansion.js";

describe("필터가 걸린 동안의 트리 펼침 (ICT-497)", () => {
  it("필터가 없으면 사용자가 펼친 폴더만 쓴다", () => {
    expect(resolveFilterExpanded(["a"], null, new Set(["a"]))).toEqual(["a"]);
  });

  it("필터를 켜면 걸린 폴더를 함께 펼친다", () => {
    expect(resolveFilterExpanded(["a"], ["b", "c"], new Set()).sort()).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("필터가 펼친 폴더도 사용자가 접으면 접힌 채로 둔다", () => {
    const collapsed = toggleFilterCollapsed(new Set(), "b", true);
    expect(resolveFilterExpanded([], ["b", "c"], collapsed)).toEqual(["c"]);
  });

  it("접은 폴더를 다시 누르면 펼친다", () => {
    const collapsed = toggleFilterCollapsed(new Set(["b"]), "b", false);
    expect(resolveFilterExpanded([], ["b"], collapsed)).toEqual(["b"]);
  });
});
