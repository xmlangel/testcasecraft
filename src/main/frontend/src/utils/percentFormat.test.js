import { describe, it, expect } from "vitest";
import { formatPercent, RATE_TEXT_COLOR } from "./percentFormat.js";

describe("formatPercent", () => {
  it.each([
    [0, "0%"],
    [80, "80%"],
    [80.0, "80%"],
    [87.46, "87.5%"],
    [33.333, "33.3%"],
    [99.96, "100%"],
    [100, "100%"],
  ])("%s 는 %s 로 표기한다", (input, expected) => {
    expect(formatPercent(input)).toBe(expected);
  });

  it.each([undefined, null, NaN, "abc"])(
    "숫자가 아닌 값(%s)은 0%% 로 표기한다",
    (input) => {
      expect(formatPercent(input)).toBe("0%");
    },
  );

  it("숫자 문자열도 받는다", () => {
    expect(formatPercent("12.34")).toBe("12.3%");
  });
});

describe("RATE_TEXT_COLOR", () => {
  it("성공 색이 아닌 중립색이다", () => {
    expect(RATE_TEXT_COLOR).not.toMatch(/success/);
  });
});
