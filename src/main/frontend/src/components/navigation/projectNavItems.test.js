import { describe, it, expect } from "vitest";
import {
  PROJECT_NAV_ITEMS,
  getVisibleNavItems,
} from "./projectNavItems.js";

/**
 * 가로 탭과 좌측 사이드바가 공유하는 항목 정의 테스트.
 *
 * 회귀 지점 — tabIndex 는 "보이는 항목 중 몇 번째"라서, 조건부 항목(RAG·탐색 세션)이
 * 숨겨지면 뒤 항목의 번호가 당겨진다. App.jsx 의 본문 스위치가 그 규칙으로 화면을
 * 고르므로, 이 목록이 규칙을 어기면 사용자가 고른 메뉴와 다른 화면이 뜬다.
 */
describe("projectNavItems", () => {
  it("항목 key 와 testId 는 중복이 없다", () => {
    const keys = PROJECT_NAV_ITEMS.map((i) => i.key);
    const testIds = PROJECT_NAV_ITEMS.map((i) => i.testId);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(testIds).size).toBe(testIds.length);
  });

  it("조건 없는 항목 6개가 항상 먼저 온다", () => {
    const always = getVisibleNavItems();
    expect(always.map((i) => i.key)).toEqual([
      "dashboard",
      "testcases",
      "testplans",
      "executions",
      "results",
      "automation",
    ]);
  });

  it("RAG·탐색 세션 모두 켜지면 8개, 탐색 세션이 마지막", () => {
    const items = getVisibleNavItems({
      isRagEnabled: true,
      showExploratory: true,
    });
    expect(items).toHaveLength(8);
    expect(items[6].key).toBe("rag");
    expect(items[7].key).toBe("exploratory");
  });

  it("RAG 만 꺼지면 탐색 세션이 6번째 위치로 당겨진다 (App.jsx EXPLORATORY_TAB 규칙)", () => {
    const items = getVisibleNavItems({
      isRagEnabled: false,
      showExploratory: true,
    });
    expect(items).toHaveLength(7);
    expect(items.findIndex((i) => i.key === "exploratory")).toBe(6);
  });

  it("개수 배지는 케이스·플랜·실행 세 항목에만 붙는다", () => {
    const withCount = PROJECT_NAV_ITEMS.filter((i) => i.countKey).map(
      (i) => i.key,
    );
    expect(withCount).toEqual(["testcases", "testplans", "executions"]);
  });

  it("모든 항목이 번역 키와 폴백 라벨을 갖는다", () => {
    for (const item of PROJECT_NAV_ITEMS) {
      expect(item.i18nKey).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
    }
  });
});
