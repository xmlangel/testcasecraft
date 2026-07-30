// ICT-428 / ICT-427: 트리 검색이 이름 외에 표시 ID·태그로도 걸리는지 고정하는 테스트.
// 회귀 지점 — 예전 구현은 name 만 봐서 화면에 보이는 표시 ID 로는 케이스를 찾을 수 없었다.

import { describe, it, expect } from "vitest";
import {
  collectQueryMatchedIds,
  collectQueryScopedIds,
  matchesTreeQuery,
  splitQueryTerms,
} from "./treeFilter.js";

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

// ICT-431: 검색으로 좁힌 상태에서 선택 대상을 정하는 집합.
// 회귀 지점 — 필터를 무시하고 프로젝트 전체를 선택해 플랜에 엉뚱한 케이스가 담겼다.
describe("collectQueryMatchedIds / collectQueryScopedIds", () => {
  //  결제(f1)
  //    └ 카드 결제 성공 (c1, tag=smoke)
  //    └ 카드 결제 실패 (c2)
  //  인증(f2)
  //    └ 로그인 잠금 (c3, tag=smoke)
  const items = [
    { id: "f1", type: "folder", name: "결제", parentId: null },
    {
      id: "c1",
      type: "testcase",
      name: "카드 결제 성공",
      parentId: "f1",
      tags: ["smoke"],
    },
    { id: "c2", type: "testcase", name: "카드 결제 실패", parentId: "f1" },
    { id: "f2", type: "folder", name: "인증", parentId: null },
    {
      id: "c3",
      type: "testcase",
      name: "로그인 잠금",
      parentId: "f2",
      tags: ["smoke"],
    },
  ];

  it("검색어가 없으면 null — 제한 없음", () => {
    expect(collectQueryMatchedIds(items, "")).toBeNull();
    expect(collectQueryScopedIds(items, "  ")).toBeNull();
  });

  it("직접 걸린 항목만 모은다", () => {
    expect(collectQueryMatchedIds(items, "smoke")).toEqual(
      new Set(["c1", "c3"]),
    );
  });

  it("걸린 폴더 안의 케이스는 함께 선택 대상 (화면에 보이므로)", () => {
    expect(collectQueryScopedIds(items, "결제")).toEqual(
      new Set(["f1", "c1", "c2"]),
    );
  });

  it("경로만 보여주는 조상 폴더는 선택 대상이 아니다", () => {
    // c1 만 걸렸을 때 f1 은 길을 보여주려고 화면에 남지만 선택 대상에서는 빠진다
    expect(collectQueryScopedIds(items, "카드 결제 성공")).toEqual(
      new Set(["c1"]),
    );
  });

  it("아무것도 안 걸리면 빈 집합", () => {
    expect(collectQueryScopedIds(items, "없는값")).toEqual(new Set());
  });

  it("부모가 목록에 없어도 순환하지 않는다", () => {
    const orphan = [
      { id: "x1", type: "testcase", name: "고아 케이스", parentId: "gone" },
    ];
    expect(collectQueryScopedIds(orphan, "고아")).toEqual(new Set(["x1"]));
  });
});
