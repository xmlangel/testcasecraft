// ICT-428 / ICT-427: 트리 검색이 이름 외에 표시 ID·태그로도 걸리는지 고정하는 테스트.
// 회귀 지점 — 예전 구현은 name 만 봐서 화면에 보이는 표시 ID 로는 케이스를 찾을 수 없었다.

import { describe, it, expect } from "vitest";
import { matchesTreeQuery, splitQueryTerms } from "./treeFilter.js";

const caseNode = {
  id: "1",
  type: "testcase",
  name: "로그인 실패 시 잠금",
  displayId: "AGG-1016",
  tags: ["수정필요", "로그인"],
};

const folderNode = {
  id: "2",
  type: "folder",
  name: "인증",
  displayId: null,
  tags: [],
};

describe("splitQueryTerms", () => {
  it("콤마로 여러 검색어를 쪼개고 공백·빈 항목을 버린다", () => {
    expect(splitQueryTerms(" AGG-1016 , 수정필요 ,, ")).toEqual([
      "agg-1016",
      "수정필요",
    ]);
  });

  it("빈 입력은 빈 배열", () => {
    expect(splitQueryTerms("")).toEqual([]);
    expect(splitQueryTerms(undefined)).toEqual([]);
  });
});

describe("matchesTreeQuery", () => {
  it("검색어가 없으면 모두 통과", () => {
    expect(matchesTreeQuery(caseNode, "")).toBe(true);
    expect(matchesTreeQuery(caseNode, "   ")).toBe(true);
  });

  it("이름 부분 일치", () => {
    expect(matchesTreeQuery(caseNode, "잠금")).toBe(true);
  });

  it("표시 ID 로 찾는다 (ICT-428)", () => {
    expect(matchesTreeQuery(caseNode, "AGG-1016")).toBe(true);
    expect(matchesTreeQuery(caseNode, "agg-1016")).toBe(true);
    expect(matchesTreeQuery(caseNode, "1016")).toBe(true);
  });

  it("태그로 찾는다 (ICT-427)", () => {
    expect(matchesTreeQuery(caseNode, "수정필요")).toBe(true);
  });

  it("콤마 다중 검색어는 하나만 걸려도 통과", () => {
    expect(matchesTreeQuery(caseNode, "없는값, AGG-1016")).toBe(true);
  });

  it("어디에도 없으면 제외", () => {
    expect(matchesTreeQuery(caseNode, "결제")).toBe(false);
  });

  it("표시 ID·태그가 없는 폴더도 이름으로 걸린다", () => {
    expect(matchesTreeQuery(folderNode, "인증")).toBe(true);
    expect(matchesTreeQuery(folderNode, "AGG")).toBe(false);
  });

  it("노드가 없으면 false", () => {
    expect(matchesTreeQuery(null, "AGG")).toBe(false);
  });
});
