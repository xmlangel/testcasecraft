import { describe, it, expect } from "vitest";
import {
  formatYmd,
  getBrowserTimeZone,
  resolveDisplayTimeZone,
} from "./dateUtils";

/**
 * ICT-511: 날짜 표기를 YYYY-MM-DD(시각 있으면 YYYY-MM-DD HH:mm)로 통일하고,
 * 서버 기본값 UTC 대신 브라우저 시간대로 보인다.
 */
describe("formatYmd — 공통 날짜 표기 (ICT-511)", () => {
  const instant = new Date("2026-05-21T18:13:00Z");

  it("날짜만 YYYY-MM-DD 로 낸다", () => {
    expect(formatYmd(instant, { timeZone: "UTC" })).toBe("2026-05-21");
  });

  it("시각을 포함하면 YYYY-MM-DD HH:mm 로 낸다", () => {
    expect(formatYmd(instant, { withTime: true, timeZone: "UTC" })).toBe(
      "2026-05-21 18:13",
    );
  });

  it("시간대를 반영한다 — 서울은 다음날 03:13", () => {
    expect(formatYmd(instant, { withTime: true, timeZone: "Asia/Seoul" })).toBe(
      "2026-05-22 03:13",
    );
  });

  it("자정은 24 가 아니라 00 으로 낸다", () => {
    expect(
      formatYmd(new Date("2026-11-25T00:05:00Z"), {
        withTime: true,
        timeZone: "UTC",
      }),
    ).toBe("2026-11-25 00:05");
  });

  it("미국식·로캘 표기·(UTC) 접미사가 없다", () => {
    const out = formatYmd(instant, { withTime: true, timeZone: "UTC" });
    expect(out).not.toMatch(/\//);
    expect(out).not.toMatch(/\. /);
    expect(out).not.toMatch(/UTC/);
  });

  it("LocalDateTime 배열도 받는다", () => {
    expect(formatYmd([2026, 11, 25, 9, 30, 0])).toMatch(/^2026-11-2\d$/);
  });

  it("날짜가 아니면 - 를 낸다", () => {
    expect(formatYmd(null)).toBe("-");
    expect(formatYmd("깨진값")).toBe("-");
  });

  it("알 수 없는 시간대 이름이면 던지지 않고 날짜를 낸다", () => {
    expect(formatYmd(instant, { timeZone: "Not/AZone" })).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});

describe("resolveDisplayTimeZone (ICT-511)", () => {
  it("프로필 시간대가 없거나 서버 기본값 UTC 면 브라우저 시간대를 쓴다", () => {
    expect(resolveDisplayTimeZone(undefined)).toBe(getBrowserTimeZone());
    expect(resolveDisplayTimeZone("UTC")).toBe(getBrowserTimeZone());
  });

  it("프로필에서 고른 시간대는 그대로 쓴다", () => {
    expect(resolveDisplayTimeZone("America/New_York")).toBe("America/New_York");
  });
});
