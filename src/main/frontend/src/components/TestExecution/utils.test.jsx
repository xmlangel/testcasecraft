import { describe, it, expect, beforeEach } from "vitest";
import {
  NAV_IDS_STORAGE_PREFIX,
  saveFilteredNavIds,
  readFilteredNavIds,
  clearFilteredNavIds,
  matchesAnyTag,
  buildBulkResultPayload,
  COLLAPSED_FOLDERS_STORAGE_PREFIX,
  saveCollapsedFolders,
  readCollapsedFolders,
  filterCollapsedNodes,
  collectAncestorFolderIds,
  collectFolderIds,
} from "./utils.jsx";

// 전체화면 결과 뷰가 목록 화면의 필터 순서를 그대로 따르도록 하는
// 필터 네비게이션 ID 보존 라운드트립 검증
describe("filtered nav id persistence", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("저장한 ID 목록을 그대로 읽는다 (라운드트립)", () => {
    saveFilteredNavIds("exec-1", ["tc2", "tc4"]);
    expect(readFilteredNavIds("exec-1")).toEqual(["tc2", "tc4"]);
    // 실행별 키로 격리되는지
    expect(sessionStorage.getItem(`${NAV_IDS_STORAGE_PREFIX}exec-1`)).toBe(
      JSON.stringify(["tc2", "tc4"]),
    );
  });

  it("실행 ID 별로 격리된다", () => {
    saveFilteredNavIds("exec-1", ["a"]);
    saveFilteredNavIds("exec-2", ["b", "c"]);
    expect(readFilteredNavIds("exec-1")).toEqual(["a"]);
    expect(readFilteredNavIds("exec-2")).toEqual(["b", "c"]);
  });

  it("저장된 값이 없으면 null 을 반환한다 (전체 목록 폴백 신호)", () => {
    expect(readFilteredNavIds("missing")).toBeNull();
  });

  it("executionId 가 없거나 'new' 면 저장/조회하지 않는다", () => {
    saveFilteredNavIds("new", ["x"]);
    saveFilteredNavIds(undefined, ["y"]);
    expect(readFilteredNavIds("new")).toBeNull();
    expect(readFilteredNavIds(undefined)).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it("깨진 JSON 이 저장돼 있으면 null 을 반환한다", () => {
    sessionStorage.setItem(`${NAV_IDS_STORAGE_PREFIX}exec-x`, "{not-json");
    expect(readFilteredNavIds("exec-x")).toBeNull();
  });

  it("배열이 아닌 값이 저장돼 있으면 null 을 반환한다", () => {
    sessionStorage.setItem(`${NAV_IDS_STORAGE_PREFIX}exec-y`, '{"a":1}');
    expect(readFilteredNavIds("exec-y")).toBeNull();
  });

  // 필터 해제 시 키 제거 — stale 필터 순서가 전체화면 뷰로 새는 것을 방지 (코드리뷰 M1)
  it("clearFilteredNavIds 는 저장된 목록을 제거한다", () => {
    saveFilteredNavIds("exec-1", ["a", "b"]);
    expect(readFilteredNavIds("exec-1")).toEqual(["a", "b"]);
    clearFilteredNavIds("exec-1");
    expect(readFilteredNavIds("exec-1")).toBeNull();
  });

  it("clearFilteredNavIds 는 executionId 가 없거나 'new' 면 아무것도 하지 않는다", () => {
    saveFilteredNavIds("exec-2", ["x"]);
    clearFilteredNavIds("new");
    clearFilteredNavIds(undefined);
    // 다른 실행 키는 영향 없음
    expect(readFilteredNavIds("exec-2")).toEqual(["x"]);
  });
});

// ICT-427: 결과 태그 필터 매칭 — 실행 화면 필터 패널에서 고른 태그로 케이스를 좁힌다
describe("matchesAnyTag", () => {
  it("선택 태그가 없으면 모두 통과", () => {
    expect(matchesAnyTag(["수정필요"], [])).toBe(true);
    expect(matchesAnyTag([], [])).toBe(true);
    expect(matchesAnyTag(undefined, undefined)).toBe(true);
  });

  it("선택 태그 중 하나라도 걸리면 통과 (OR)", () => {
    expect(matchesAnyTag(["로그인", "수정필요"], ["수정필요"])).toBe(true);
    expect(matchesAnyTag(["로그인"], ["수정필요", "로그인"])).toBe(true);
  });

  it("대소문자·공백을 무시한다", () => {
    expect(matchesAnyTag(["NeedsFix"], [" needsfix "])).toBe(true);
  });

  it("직접 입력한 값은 부분 일치로 걸린다", () => {
    expect(matchesAnyTag(["수정필요-스텝"], ["수정필요"])).toBe(true);
  });

  it("결과에 태그가 없으면 제외", () => {
    expect(matchesAnyTag([], ["수정필요"])).toBe(false);
    expect(matchesAnyTag(undefined, ["수정필요"])).toBe(false);
  });

  it("어느 태그에도 걸리지 않으면 제외", () => {
    expect(matchesAnyTag(["로그인"], ["결제"])).toBe(false);
  });

  it("문자열 단일 입력도 받는다", () => {
    expect(matchesAnyTag(["수정필요"], "수정")).toBe(true);
  });
});

// ICT-427: 일괄 결과 입력 페이로드 — 공통 태그를 비워두면 tags 를 싣지 않아야
// 서버가 "케이스별 이전 태그 유지"로 처리한다(빈 배열은 삭제 신호라 매번 지워졌다)
describe("buildBulkResultPayload", () => {
  const base = { testCaseIds: ["tc1", "tc2"], result: "PASS", notes: "" };

  it("공통 태그가 없으면 tags 키를 넣지 않는다", () => {
    const payload = buildBulkResultPayload({ ...base, tags: [] });
    expect("tags" in payload).toBe(false);
  });

  it("tags 가 undefined 여도 키를 넣지 않는다", () => {
    const payload = buildBulkResultPayload({ ...base });
    expect("tags" in payload).toBe(false);
  });

  it("공통 태그를 입력했으면 그대로 싣는다", () => {
    const payload = buildBulkResultPayload({ ...base, tags: ["환경문제"] });
    expect(payload.tags).toEqual(["환경문제"]);
  });

  it("나머지 필드는 그대로 전달한다", () => {
    const payload = buildBulkResultPayload({
      ...base,
      notes: "일괄 처리",
      jiraIssueKey: "ICT-427",
    });
    expect(payload).toMatchObject({
      testCaseIds: ["tc1", "tc2"],
      result: "PASS",
      notes: "일괄 처리",
      jiraIssueKey: "ICT-427",
    });
  });
});

// 결과 입력 리스트의 폴더 접기/펼치기.
// 트리 모양은 아래 플래튼 배열을 공용으로 쓴다(부모가 자식보다 앞에 오는 순서).
//   f1
//    ├ tc1
//    └ f2
//       ├ tc2
//       └ f3
//          └ tc3
//   f4
//    └ tc4
const sampleNodes = [
  { id: "f1", type: "folder", parentId: null, level: 0 },
  { id: "tc1", type: "testcase", parentId: "f1", level: 1 },
  { id: "f2", type: "folder", parentId: "f1", level: 1 },
  { id: "tc2", type: "testcase", parentId: "f2", level: 2 },
  { id: "f3", type: "folder", parentId: "f2", level: 2 },
  { id: "tc3", type: "testcase", parentId: "f3", level: 3 },
  { id: "f4", type: "folder", parentId: null, level: 0 },
  { id: "tc4", type: "testcase", parentId: "f4", level: 1 },
];

describe("filterCollapsedNodes", () => {
  it("접힘이 없으면 원본을 그대로 돌려준다", () => {
    expect(filterCollapsedNodes(sampleNodes, new Set())).toBe(sampleNodes);
  });

  it("접은 폴더 자신은 남기고 직계 자식을 숨긴다", () => {
    const result = filterCollapsedNodes(sampleNodes, new Set(["f4"]));
    expect(result.map((n) => n.id)).toEqual([
      "f1",
      "tc1",
      "f2",
      "tc2",
      "f3",
      "tc3",
      "f4",
    ]);
  });

  it("손자 이하 모든 자손을 숨긴다 (다단계)", () => {
    const result = filterCollapsedNodes(sampleNodes, new Set(["f1"]));
    expect(result.map((n) => n.id)).toEqual(["f1", "f4", "tc4"]);
  });

  it("중간 폴더를 접으면 그 아래만 사라진다", () => {
    const result = filterCollapsedNodes(sampleNodes, new Set(["f2"]));
    expect(result.map((n) => n.id)).toEqual(["f1", "tc1", "f2", "f4", "tc4"]);
  });

  it("이미 숨겨진 하위 폴더가 접혀 있어도 결과가 같다 (중첩 접힘)", () => {
    const result = filterCollapsedNodes(sampleNodes, new Set(["f1", "f3"]));
    expect(result.map((n) => n.id)).toEqual(["f1", "f4", "tc4"]);
  });

  it("배열로 준 접힘 목록도 받는다", () => {
    const result = filterCollapsedNodes(sampleNodes, ["f4"]);
    expect(result.map((n) => n.id)).not.toContain("tc4");
  });

  it("목록에 없는 폴더 ID는 무시한다", () => {
    const result = filterCollapsedNodes(sampleNodes, new Set(["없는폴더"]));
    expect(result).toHaveLength(sampleNodes.length);
  });

  it("빈 입력에 안전하다", () => {
    expect(filterCollapsedNodes(null, new Set(["f1"]))).toEqual([]);
    expect(filterCollapsedNodes(undefined, undefined)).toEqual([]);
  });
});

describe("collectAncestorFolderIds", () => {
  it("가까운 상위부터 루트까지 모은다 (자기 자신 제외)", () => {
    expect(collectAncestorFolderIds(sampleNodes, "tc3")).toEqual([
      "f3",
      "f2",
      "f1",
    ]);
  });

  it("루트 직계는 부모 하나만", () => {
    expect(collectAncestorFolderIds(sampleNodes, "tc4")).toEqual(["f4"]);
  });

  it("루트 노드는 빈 배열", () => {
    expect(collectAncestorFolderIds(sampleNodes, "f1")).toEqual([]);
  });

  it("부모 참조가 순환해도 멈춘다", () => {
    const cyclic = [
      { id: "a", type: "folder", parentId: "b" },
      { id: "b", type: "folder", parentId: "a" },
    ];
    expect(collectAncestorFolderIds(cyclic, "a")).toEqual(["b", "a"]);
  });
});

describe("collectFolderIds", () => {
  it("폴더 ID만 순서대로 모은다", () => {
    expect(collectFolderIds(sampleNodes)).toEqual(["f1", "f2", "f3", "f4"]);
  });

  it("빈 입력에 안전하다", () => {
    expect(collectFolderIds(null)).toEqual([]);
  });
});

describe("collapsed folder persistence", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("저장한 접힘 목록을 Set으로 읽는다 (라운드트립)", () => {
    saveCollapsedFolders("exec-1", new Set(["f1", "f2"]));
    const restored = readCollapsedFolders("exec-1");
    expect(restored).toBeInstanceOf(Set);
    expect([...restored].sort()).toEqual(["f1", "f2"]);
  });

  it("실행 ID 별로 격리된다", () => {
    saveCollapsedFolders("exec-1", ["f1"]);
    saveCollapsedFolders("exec-2", ["f9"]);
    expect([...readCollapsedFolders("exec-1")]).toEqual(["f1"]);
    expect([...readCollapsedFolders("exec-2")]).toEqual(["f9"]);
  });

  it("전체 펼침(빈 목록)이면 저장 키를 지운다", () => {
    saveCollapsedFolders("exec-1", ["f1"]);
    saveCollapsedFolders("exec-1", new Set());
    expect(
      sessionStorage.getItem(`${COLLAPSED_FOLDERS_STORAGE_PREFIX}exec-1`),
    ).toBeNull();
    expect(readCollapsedFolders("exec-1").size).toBe(0);
  });

  it("신규 실행(new)·미지정은 저장하지 않고 빈 Set을 준다", () => {
    saveCollapsedFolders("new", ["f1"]);
    saveCollapsedFolders(undefined, ["f2"]);
    expect(sessionStorage.length).toBe(0);
    expect(readCollapsedFolders("new").size).toBe(0);
    expect(readCollapsedFolders(undefined).size).toBe(0);
  });

  it("저장값이 깨져 있으면 빈 Set으로 폴백한다", () => {
    sessionStorage.setItem(
      `${COLLAPSED_FOLDERS_STORAGE_PREFIX}exec-1`,
      "{깨진 JSON",
    );
    expect(readCollapsedFolders("exec-1").size).toBe(0);
  });
});
