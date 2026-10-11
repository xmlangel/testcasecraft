import { describe, it, expect } from "vitest";
import { flattenSpecTree } from "./requirementConstants.js";

/** 요구사항 문서 트리 펼침. 문서 목록 화면과 상위 문서 선택 칸이 같이 쓴다. */
describe("flattenSpecTree", () => {
  it("부모 다음에 자식이 깊이와 함께 온다", () => {
    const specs = [
      { id: "b", parentId: "a" },
      { id: "a", parentId: null },
      { id: "c", parentId: "b" },
      { id: "d", parentId: null },
    ];
    expect(
      flattenSpecTree(specs).map(({ spec, depth }) => [spec.id, depth]),
    ).toEqual([
      ["a", 0],
      ["b", 1],
      ["c", 2],
      ["d", 0],
    ]);
  });

  it("부모가 목록에 없는 문서도 버리지 않고 최상위로 보여 준다", () => {
    const specs = [
      { id: "x", parentId: "gone" },
      { id: "y", parentId: "x" },
    ];
    expect(
      flattenSpecTree(specs).map(({ spec, depth }) => [spec.id, depth]),
    ).toEqual([
      ["x", 0],
      ["y", 1],
    ]);
  });
});
