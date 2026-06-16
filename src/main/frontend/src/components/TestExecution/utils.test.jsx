import { describe, it, expect, beforeEach } from "vitest";
import {
  NAV_IDS_STORAGE_PREFIX,
  saveFilteredNavIds,
  readFilteredNavIds,
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
});
