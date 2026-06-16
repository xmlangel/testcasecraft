import { describe, it, expect } from "vitest";
import { getFilteredNavTestCaseIds, extractTestCaseIds } from "./treeUtils.jsx";

describe("extractTestCaseIds", () => {
  it("테스트케이스 노드의 ID만 순서대로 추출하고 폴더는 제외한다", () => {
    const nodes = [
      { id: "f1", type: "folder" },
      { id: "tc1", type: "testcase" },
      { id: "tc2", type: "testcase" },
    ];
    expect(extractTestCaseIds(nodes)).toEqual(["tc1", "tc2"]);
  });

  it("null/undefined 입력은 빈 배열을 반환한다", () => {
    expect(extractTestCaseIds(null)).toEqual([]);
    expect(extractTestCaseIds(undefined)).toEqual([]);
  });
});

// 필터된 실행 목록 상세화면에서 "이전/다음"이 필터 목록 안에서 이동하는지 검증
describe("getFilteredNavTestCaseIds", () => {
  const allIds = ["tc1", "tc2", "tc3", "tc4", "tc5"];

  // 폴더 + 케이스가 섞인 플래튼 노드 (필터 결과: tc2, tc4 만 통과)
  const filteredData = [
    { id: "folderA", type: "folder" },
    { id: "tc2", type: "testcase" },
    { id: "folderB", type: "folder" },
    { id: "tc4", type: "testcase" },
  ];

  it("필터된 노드에서 테스트케이스 ID만 순서대로 추출한다 (폴더 제외)", () => {
    const nav = getFilteredNavTestCaseIds(filteredData, allIds, "tc2");
    expect(nav).toEqual(["tc2", "tc4"]);
  });

  it("선택 케이스가 필터 목록에 있으면 다음은 필터 목록의 다음 항목이다", () => {
    const nav = getFilteredNavTestCaseIds(filteredData, allIds, "tc2");
    const idx = nav.indexOf("tc2");
    expect(nav[idx + 1]).toBe("tc4"); // 전체 목록의 tc3 가 아니라 필터 다음인 tc4
  });

  it("선택 케이스가 필터 목록 마지막이면 다음 항목이 없다", () => {
    const nav = getFilteredNavTestCaseIds(filteredData, allIds, "tc4");
    expect(nav.indexOf("tc4")).toBe(nav.length - 1);
  });

  it("선택 케이스가 필터 목록에 없으면 전체 목록으로 폴백한다", () => {
    // tc3 는 필터 결과에 없음 → 전체 목록 기준 이동
    const nav = getFilteredNavTestCaseIds(filteredData, allIds, "tc3");
    expect(nav).toEqual(allIds);
  });

  it("필터가 비어(전체 노출) 있고 선택 케이스가 포함되면 그 목록을 사용한다", () => {
    const fullFlatten = allIds.map((id) => ({ id, type: "testcase" }));
    const nav = getFilteredNavTestCaseIds(fullFlatten, allIds, "tc1");
    expect(nav).toEqual(allIds);
  });

  it("filteredData/allTestCaseIds 가 없어도 안전하게 동작한다", () => {
    expect(getFilteredNavTestCaseIds(null, null, "tc1")).toEqual([]);
    expect(getFilteredNavTestCaseIds(undefined, allIds, "tcX")).toEqual(allIds);
  });
});
