import { describe, it, expect, beforeEach } from "vitest";
import {
  NAV_IDS_STORAGE_PREFIX,
  saveFilteredNavIds,
  readFilteredNavIds,
  clearFilteredNavIds,
  matchesAnyTag,
  buildBulkResultPayload,
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
