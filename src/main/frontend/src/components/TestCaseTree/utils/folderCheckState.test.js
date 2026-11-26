import { describe, it, expect } from "vitest";
import { computeFolderCheckStates } from "./folderCheckState.js";

// ICT-512: 플랜이 케이스 ID 만 저장해도 폴더 체크 상태가 하위 케이스를 따라간다.
const items = [
  { id: "root", parentId: null, type: "folder" },
  { id: "sub", parentId: "root", type: "folder" },
  { id: "empty", parentId: "root", type: "folder" },
  { id: "tc1", parentId: "root", type: "testcase" },
  { id: "tc2", parentId: "sub", type: "testcase" },
  { id: "tc3", parentId: "sub", type: "testcase" },
  { id: "sys", parentId: null, type: "systemFolder" },
  { id: "tc4", parentId: "sys", type: "testcase" },
];

describe("computeFolderCheckStates", () => {
  it("하위 케이스가 모두 선택되면 폴더 ID 가 없어도 all 이다", () => {
    const states = computeFolderCheckStates(items, [
      "tc1",
      "tc2",
      "tc3",
      "tc4",
    ]);
    expect(states.get("root")).toBe("all");
    expect(states.get("sub")).toBe("all");
    expect(states.get("sys")).toBe("all");
  });

  it("일부만 선택되면 some, 하나도 없으면 none 이다", () => {
    const states = computeFolderCheckStates(items, ["tc2"]);
    expect(states.get("root")).toBe("some");
    expect(states.get("sub")).toBe("some");
    expect(states.get("sys")).toBe("none");
  });

  it("하위 폴더가 모두 선택돼도 형제 케이스가 빠지면 상위는 some 이다", () => {
    const states = computeFolderCheckStates(items, ["tc2", "tc3"]);
    expect(states.get("sub")).toBe("all");
    expect(states.get("root")).toBe("some");
  });

  it("하위 케이스가 없는 폴더는 결과에 넣지 않는다", () => {
    const states = computeFolderCheckStates(items, ["tc1"]);
    expect(states.has("empty")).toBe(false);
  });

  it("Set 도 받고, 빈 입력은 빈 결과를 돌려준다", () => {
    expect(computeFolderCheckStates(items, new Set(["tc4"])).get("sys")).toBe(
      "all",
    );
    expect(computeFolderCheckStates([], ["tc1"]).size).toBe(0);
    expect(computeFolderCheckStates(undefined, []).size).toBe(0);
  });

  it("parentId 순환이 있어도 멈추지 않는다", () => {
    const loop = [
      { id: "a", parentId: "b", type: "folder" },
      { id: "b", parentId: "a", type: "folder" },
      { id: "t", parentId: "a", type: "testcase" },
    ];
    expect(() => computeFolderCheckStates(loop, ["t"])).not.toThrow();
  });
});
