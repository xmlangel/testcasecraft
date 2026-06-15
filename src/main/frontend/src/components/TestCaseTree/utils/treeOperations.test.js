import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAllChildIds,
  sortByDisplayOrder,
  countTestCasesRecursive,
} from "./treeOperations.js";

describe("getAllChildIds", () => {
  beforeEach(() => {
    // 엣지 케이스의 console.error/warn 노이즈 억제
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  const items = [
    { id: "a", parentId: null },
    { id: "b", parentId: "a" },
    { id: "c", parentId: "a" },
    { id: "d", parentId: "b" },
    { id: "e", parentId: null },
  ];

  it("직계 + 중첩 하위 ID 를 모두 반환한다", () => {
    const result = getAllChildIds(items, "a");
    expect(result.sort()).toEqual(["b", "c", "d"]);
  });

  it("리프 노드는 빈 배열을 반환한다", () => {
    expect(getAllChildIds(items, "d")).toEqual([]);
  });

  it("items 가 배열이 아니면 빈 배열을 반환한다", () => {
    expect(getAllChildIds(null, "a")).toEqual([]);
    expect(getAllChildIds(undefined, "a")).toEqual([]);
  });

  it("parentId 가 없으면 빈 배열을 반환한다", () => {
    expect(getAllChildIds(items, undefined)).toEqual([]);
  });

  it("순환 참조가 있어도 무한 루프 없이 종료한다", () => {
    const cyclic = [
      { id: "x", parentId: "y" },
      { id: "y", parentId: "x" },
    ];
    const result = getAllChildIds(cyclic, "x");
    // 순환이라도 방문 집합으로 보호되어 유한하게 끝나야 한다
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThan(10);
  });
});

describe("sortByDisplayOrder", () => {
  it("displayOrder 오름차순으로 정렬한다", () => {
    const input = [
      { id: "a", displayOrder: 3 },
      { id: "b", displayOrder: 1 },
      { id: "c", displayOrder: 2 },
    ];
    expect(sortByDisplayOrder(input).map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("displayOrder 누락 항목은 0 으로 취급한다", () => {
    const input = [{ id: "a", displayOrder: 2 }, { id: "b" }];
    expect(sortByDisplayOrder(input).map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("원본 배열을 변형하지 않는다", () => {
    const input = [
      { id: "a", displayOrder: 2 },
      { id: "b", displayOrder: 1 },
    ];
    const copy = [...input];
    sortByDisplayOrder(input);
    expect(input).toEqual(copy);
  });
});

describe("countTestCasesRecursive", () => {
  it("폴더 트리 전체의 testcase 개수를 재귀적으로 센다", () => {
    const node = {
      type: "folder",
      children: [
        { type: "testcase" },
        {
          type: "folder",
          children: [{ type: "testcase" }, { type: "testcase" }],
        },
        { type: "testcase" },
      ],
    };
    expect(countTestCasesRecursive(node)).toBe(4);
  });

  it("children 이 없으면 0 을 반환한다", () => {
    expect(countTestCasesRecursive({ type: "folder" })).toBe(0);
    expect(countTestCasesRecursive({ type: "folder", children: [] })).toBe(0);
  });
});
