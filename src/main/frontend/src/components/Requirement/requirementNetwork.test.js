import { describe, it, expect } from "vitest";
import { buildRequirementNetwork } from "./requirementNetwork.js";

const reqs = [
  {
    id: "a",
    docId: "R-A",
    title: "A",
    coverage: "COVERED",
    linkedTestCaseIds: ["t1", "t2"],
  },
  {
    id: "b",
    docId: "R-B",
    title: "B",
    coverage: "COVERED",
    linkedTestCaseIds: ["t1", "t2", "t3"],
  },
  {
    id: "c",
    docId: "R-C",
    title: "C",
    coverage: "PARTIAL",
    linkedTestCaseIds: ["t3"],
  },
  {
    id: "d",
    docId: "R-D",
    title: "D",
    coverage: "UNCOVERED",
    linkedTestCaseIds: [],
  },
];

describe("buildRequirementNetwork", () => {
  it("공유 보기: 같은 TC 를 나눠 쓰는 요구사항끼리 공유 수만큼 굵은 선", () => {
    const { edges, isolated } = buildRequirementNetwork({
      requirements: reqs,
      mode: "shared",
    });
    const weight = (x, y) => edges.find((e) => e.id === `s:${x}|${y}`)?.weight;
    expect(weight("a", "b")).toBe(2);
    expect(weight("b", "c")).toBe(1);
    expect(weight("a", "c")).toBeUndefined();
    expect(isolated.map((r) => r.id)).toEqual(["d"]);
  });

  it("네트워크 보기: TC 는 한 번만 노드가 되고 연결마다 선이 생긴다", () => {
    const { nodes, edges } = buildRequirementNetwork({
      requirements: reqs,
      relations: [
        { id: "x", sourceId: "a", targetId: "c", type: "DEPENDS_ON" },
      ],
      testCases: [{ id: "t1", displayId: "TC-1", name: "로그인" }],
      resultById: { t1: "FAIL" },
    });
    const tcNodes = nodes.filter((n) => n.type === "testcase");
    expect(tcNodes).toHaveLength(3);
    expect(tcNodes.find((n) => n.entityId === "t1")).toMatchObject({
      label: "TC-1",
      result: "FAIL",
    });
    expect(tcNodes.find((n) => n.entityId === "t2").result).toBe("NOT_RUN");
    expect(edges.filter((e) => e.kind === "LINK")).toHaveLength(6);
    expect(edges.filter((e) => e.kind === "DEPENDS_ON")).toHaveLength(1);
  });

  it("TC 를 끄면 관계가 없는 요구사항은 고립 목록으로 빠진다", () => {
    const { nodes, isolated } = buildRequirementNetwork({
      requirements: reqs,
      relations: [
        { id: "x", sourceId: "a", targetId: "c", type: "RELATED_TO" },
      ],
      showTestCases: false,
    });
    expect(nodes.map((n) => n.entityId).sort()).toEqual(["a", "c"]);
    expect(isolated.map((r) => r.id).sort()).toEqual(["b", "d"]);
  });

  it("문서 거르기 밖의 요구사항으로 가는 관계는 그리지 않는다", () => {
    const { edges } = buildRequirementNetwork({
      requirements: reqs,
      relations: [{ id: "x", sourceId: "a", targetId: "c", type: "PARENT_OF" }],
      showTestCases: false,
      requirementFilter: new Set(["a", "b"]),
    });
    expect(edges).toHaveLength(0);
  });
});
