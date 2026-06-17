import { describe, it, expect, vi } from "vitest";

// 서버 타임존을 비-UTC 로 고정 → 로컬 파싱 경로로 결정론적 검증
vi.mock("./apiConstants", () => ({
  getRuntimeConfig: () => ({ serverTimeZone: "Asia/Seoul" }),
}));

import {
  formatRelativeTime,
  formatDuration,
  isValidDate,
  safeParseDate,
  convertLocalDateTimeArrayToDate,
  isoToLocalDateString,
} from "./dateUtils.js";

describe("dateUtils", () => {
  describe("formatRelativeTime", () => {
    const base = new Date("2026-06-17T12:00:00");
    it("1분 미만은 '방금 전'", () => {
      expect(formatRelativeTime(new Date("2026-06-17T11:59:30"), base)).toBe(
        "방금 전",
      );
    });
    it("분/시간/일 단위", () => {
      expect(formatRelativeTime(new Date("2026-06-17T11:30:00"), base)).toBe(
        "30분 전",
      );
      expect(formatRelativeTime(new Date("2026-06-17T09:00:00"), base)).toBe(
        "3시간 전",
      );
      expect(formatRelativeTime(new Date("2026-06-15T12:00:00"), base)).toBe(
        "2일 전",
      );
    });
    it("잘못된 입력은 '-'", () => {
      expect(formatRelativeTime(null, base)).toBe("-");
      expect(formatRelativeTime("nope", base)).toBe("-");
    });
  });

  describe("formatDuration", () => {
    it("초/분/시간/일 단위로 표현한다", () => {
      const s = new Date("2026-06-17T00:00:00");
      expect(formatDuration(s, new Date("2026-06-17T00:00:45"))).toBe("45초");
      expect(formatDuration(s, new Date("2026-06-17T00:02:30"))).toBe(
        "2분 30초",
      );
      expect(formatDuration(s, new Date("2026-06-17T03:15:00"))).toBe(
        "3시간 15분",
      );
      expect(formatDuration(s, new Date("2026-06-19T05:00:00"))).toBe(
        "2일 5시간",
      );
    });
    it("음수 기간은 '0초', 누락 시 '-'", () => {
      const s = new Date("2026-06-17T01:00:00");
      expect(formatDuration(s, new Date("2026-06-17T00:00:00"))).toBe("0초");
      expect(formatDuration(null, s)).toBe("-");
    });
  });

  describe("isValidDate", () => {
    it("유효/무효 판정", () => {
      expect(isValidDate("2026-06-17")).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate("not-a-date")).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });
  });

  describe("safeParseDate", () => {
    it("Date/배열/문자열을 Date 로, 그 외는 null", () => {
      expect(safeParseDate(null)).toBeNull();
      expect(safeParseDate("garbage")).toBeNull();
      expect(safeParseDate(new Date("2026-06-17")) instanceof Date).toBe(true);
      const fromArr = safeParseDate([2026, 6, 17, 9, 30, 0]);
      expect(fromArr instanceof Date).toBe(true);
      expect(fromArr.getFullYear()).toBe(2026);
    });
  });

  describe("convertLocalDateTimeArrayToDate", () => {
    it("[년,월,일,...] 배열을 Date 로 변환 (월 1-based)", () => {
      const d = convertLocalDateTimeArrayToDate([2026, 6, 17, 9, 30, 0]);
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(5); // 6월 → index 5
      expect(d.getDate()).toBe(17);
    });
    it("길이 부족하거나 배열이 아니면 null", () => {
      expect(convertLocalDateTimeArrayToDate([2026, 6])).toBeNull();
      expect(convertLocalDateTimeArrayToDate("nope")).toBeNull();
    });
  });

  describe("isoToLocalDateString", () => {
    it("YYYY-MM-DD 로 변환", () => {
      expect(isoToLocalDateString("2026-06-17T09:00:00")).toBe("2026-06-17");
      expect(isoToLocalDateString("")).toBe("");
      expect(isoToLocalDateString("garbage")).toBe("");
    });
  });
});
