import { describe, it, expect } from "vitest";
import {
  findFolderIdByName,
  sortFoldersByHierarchy,
} from "./FolderManagement.js";

describe("findFolderIdByName", () => {
  const data = [
    { id: "f1", type: "folder", name: "로그인", displayId: "1", sequentialId: 1, displayOrder: 10 },
    { id: "f2", type: "folder", name: "결제", displayId: "2", sequentialId: 2, displayOrder: 20 },
    { id: "t1", type: "testcase", name: "로그인", displayId: "1" },
  ];

  it("빈 값이면 null", () => {
    expect(findFolderIdByName("", data)).toBeNull();
    expect(findFolderIdByName(null, data)).toBeNull();
    expect(findFolderIdByName("   ", data)).toBeNull();
  });

  it("숫자 문자열은 displayId 로 폴더를 찾는다", () => {
    expect(findFolderIdByName("2", data)).toBe("f2");
  });

  it("숫자는 sequentialId 로도 찾는다", () => {
    expect(findFolderIdByName(1, data)).toBe("f1");
  });

  it("displayId/sequentialId 미스 시 displayOrder 로 폴백한다", () => {
    expect(findFolderIdByName("20", data)).toBe("f2");
  });

  it("폴더명으로 찾는다 (testcase 타입은 무시)", () => {
    expect(findFolderIdByName("로그인", data)).toBe("f1");
  });

  it("일치하는 폴더가 없으면 null", () => {
    expect(findFolderIdByName("없는폴더", data)).toBeNull();
  });
});

describe("sortFoldersByHierarchy", () => {
  it("배열이 아니거나 비어 있으면 빈 배열", () => {
    expect(sortFoldersByHierarchy(null, [])).toEqual([]);
    expect(sortFoldersByHierarchy([], [])).toEqual([]);
  });

  it("부모 폴더가 자식보다 먼저 오도록 정렬한다", () => {
    const folders = [
      { name: "child", parentFolderName: "parent" },
      { name: "parent", parentFolderName: "" },
    ];
    const sorted = sortFoldersByHierarchy(folders, []);
    expect(sorted.map((f) => f.name)).toEqual(["parent", "child"]);
  });

  it("부모가 기존 데이터에만 있으면 자식만 결과에 포함한다", () => {
    const folders = [{ name: "child", parentFolderName: "existingParent" }];
    const existing = [{ type: "folder", name: "existingParent" }];
    const sorted = sortFoldersByHierarchy(folders, existing);
    expect(sorted.map((f) => f.name)).toEqual(["child"]);
  });

  it("순환 참조가 있어도 무한 루프 없이 종료한다", () => {
    const folders = [
      { name: "a", parentFolderName: "b" },
      { name: "b", parentFolderName: "a" },
    ];
    const sorted = sortFoldersByHierarchy(folders, []);
    // 두 폴더 모두 정확히 한 번씩 포함되어야 한다
    expect(sorted.map((f) => f.name).sort()).toEqual(["a", "b"]);
  });
});
