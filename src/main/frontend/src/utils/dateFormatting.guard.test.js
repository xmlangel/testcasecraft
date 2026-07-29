import { describe, expect, it } from "vitest";
import {
  findRegressions,
  formatRegressionReport,
  readBaseline,
  scanViolations,
  summarize,
} from "../../scripts/dateFormattingScan.mjs";
import { formatDate, formatDateSafe, safeParseDate } from "./dateUtils";

/**
 * "Invalid date" 재발 방지 가드.
 *
 * 1) 정적 검사 — 컴포넌트가 공용 포맷터(useDateFormatter / formatDateSafe)를
 *    우회하는 코드를 새로 넣으면 실패한다. 기존 부채는 baseline 으로 통과시킨다.
 * 2) 런타임 검사 — 공용 포맷터가 어떤 입력에도 "Invalid Date" 를 내보내지 않음을 고정한다.
 *
 * pre-commit 의 프런트 테스트 훅에서 함께 돌기 때문에 별도 훅 등록이 필요 없다.
 */
describe("날짜 표기 안전성 — 정적 검사", () => {
  it("공용 포맷터를 우회하는 코드가 새로 늘어나지 않는다", () => {
    const violations = scanViolations();
    const regressions = findRegressions(summarize(violations), readBaseline());

    expect(
      regressions,
      regressions.length ? formatRegressionReport(regressions, violations) : "",
    ).toEqual([]);
  });
});

describe("날짜 표기 안전성 — 런타임 검사", () => {
  // 백엔드가 실제로 내보내는 형태 + 깨질 수 있는 입력을 모두 넣어본다.
  const inputs = [
    ["LocalDateTime 배열", [2026, 7, 27, 14, 30, 0, 0]],
    ["나노초 없는 배열", [2026, 7, 27, 14, 30, 0]],
    ["ISO 문자열", "2026-07-27T14:30:00"],
    ["Z 붙은 ISO", "2026-07-27T14:30:00Z"],
    ["Date 객체", new Date("2026-07-27T14:30:00Z")],
    ["깨진 문자열", "깨진값"],
    ["빈 문자열", ""],
    ["숫자 아닌 배열", ["a", "b", "c", "d", "e", "f"]],
    ["짧은 배열", [2026, 7]],
    ["null", null],
    ["undefined", undefined],
  ];

  it.each(inputs)(
    "formatDateSafe(%s) 는 Invalid Date 를 내보내지 않는다",
    (_label, value) => {
      expect(formatDateSafe(value)).not.toMatch(/Invalid/i);
    },
  );

  it.each(inputs)(
    "formatDate(%s) 는 던지지 않고 Invalid Date 도 내보내지 않는다",
    (_label, value) => {
      expect(() => formatDate(value)).not.toThrow();
      expect(formatDate(value)).not.toMatch(/Invalid/i);
    },
  );

  it("파싱 실패는 - 로 떨어진다", () => {
    expect(formatDateSafe("깨진값")).toBe("-");
    expect(formatDateSafe(null)).toBe("-");
    expect(safeParseDate("깨진값")).toBeNull();
  });

  it("정상 입력은 배열이든 문자열이든 같은 시각으로 읽힌다", () => {
    const fromArray = safeParseDate([2026, 7, 27, 14, 30, 0, 0]);
    const fromString = safeParseDate("2026-07-27T14:30:00");
    expect(fromArray.getTime()).toBe(fromString.getTime());
  });
});
