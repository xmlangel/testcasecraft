import { describe, it, expect } from "vitest";
import {
  TEST_RESULT_TYPES,
  getResultConfig,
  getResultLabel,
  getResultColor,
  getResultIcon,
  calculateTestStatistics,
  sortResultsByPriority,
  getResultTypeFromKeyboard,
  convertToChartData,
  isValidResultType,
  getLocalizedResultConfig,
  getLatestExecutionResults,
  calculateExecutionSummary,
} from "./testResultConstants.js";

describe("testResultConstants", () => {
  describe("getResultConfig / Label / Color / Icon", () => {
    it("알 수 없는 타입은 NOT_RUN 설정으로 폴백", () => {
      expect(getResultConfig("UNKNOWN")).toBe(
        getResultConfig(TEST_RESULT_TYPES.NOT_RUN),
      );
    });
    it("getResultLabel: 긴/짧은 라벨", () => {
      expect(getResultLabel("PASS")).toBe("성공");
      expect(getResultLabel("PASS", true)).toBe("Pass");
    });
    it("getResultColor: 타입별 색상 + 폴백", () => {
      expect(getResultColor("PASS")).toBe("#00C49F");
      expect(getResultColor("PASS", "muiColor")).toBe("success");
      // 존재하지 않는 색상 타입은 color 로 폴백
      expect(getResultColor("PASS", "nope")).toBe("#00C49F");
    });
    it("getResultIcon: 컴포넌트를 반환", () => {
      expect(getResultIcon("FAIL")).toBeTruthy();
    });
  });

  describe("calculateTestStatistics", () => {
    it("빈 배열은 0 통계", () => {
      const s = calculateTestStatistics([]);
      expect(s.totalTests).toBe(0);
      expect(s.passRate).toBe(0);
      expect(s.successRate).toBe(0);
    });
    it("결과별 카운트와 비율", () => {
      const s = calculateTestStatistics([
        { result: "PASS" },
        { result: "PASS" },
        { result: "FAIL" },
        { result: "NOT_RUN" },
      ]);
      expect(s.totalTests).toBe(4);
      expect(s.passCount).toBe(2);
      expect(s.failCount).toBe(1);
      expect(s.notRunCount).toBe(1);
      expect(s.passRate).toBe(50);
      // 실행된 3건 중 2 PASS → successRate 66.67
      expect(s.successRate).toBeCloseTo((2 / 3) * 100);
      expect(s.executionRate).toBe(75);
    });
    it("알 수 없는 결과는 미실행으로 카운트", () => {
      const s = calculateTestStatistics([{ result: "WAT" }]);
      expect(s.notRunCount).toBe(1);
    });
    it("status 필드도 인식한다", () => {
      const s = calculateTestStatistics([{ status: "BLOCKED" }]);
      expect(s.blockedCount).toBe(1);
    });
  });

  describe("sortResultsByPriority", () => {
    it("우선순위(FAIL<BLOCKED<PASS<NOT_RUN<SKIPPED) 순서로 정렬한다", () => {
      const sorted = sortResultsByPriority([
        { result: "PASS" },
        { result: "FAIL" },
        { result: "BLOCKED" },
      ]);
      expect(sorted.map((r) => r.result)).toEqual(["FAIL", "BLOCKED", "PASS"]);
    });
  });

  describe("getResultTypeFromKeyboard", () => {
    it("대소문자 무관 매핑(p→PASS, f→FAIL), 없으면 null", () => {
      expect(getResultTypeFromKeyboard("p")).toBe("PASS");
      expect(getResultTypeFromKeyboard("F")).toBe("FAIL");
      expect(getResultTypeFromKeyboard("Z")).toBeNull();
    });
  });

  describe("convertToChartData", () => {
    it("0인 항목은 제외", () => {
      const data = convertToChartData({
        passCount: 3,
        failCount: 0,
        blockedCount: 1,
        notRunCount: 0,
      });
      expect(data.map((d) => d.value)).toEqual([3, 1]);
      expect(data.every((d) => d.value > 0)).toBe(true);
    });
    it("null 통계는 빈 배열", () => {
      expect(convertToChartData(null)).toEqual([]);
    });
  });

  describe("isValidResultType", () => {
    it("정의된 타입만 true", () => {
      expect(isValidResultType("PASS")).toBe(true);
      expect(isValidResultType("NOTRUN")).toBe(false); // 별칭은 TYPES 에 없음
      expect(isValidResultType("WAT")).toBe(false);
    });
  });

  describe("getLocalizedResultConfig", () => {
    it("t 가 있으면 translationKey 로 라벨 치환", () => {
      const cfg = getLocalizedResultConfig("PASS", (k) => `T:${k}`);
      expect(cfg.label).toBe("T:testResult.status.pass");
    });
    it("t 가 없으면 기본 설정 그대로", () => {
      expect(getLocalizedResultConfig("PASS", null).label).toBe("성공");
    });
  });

  describe("getLatestExecutionResults", () => {
    it("testCaseId 별 첫(최신) 결과만 유지", () => {
      const latest = getLatestExecutionResults([
        { testCaseId: "a", result: "PASS" },
        { testCaseId: "a", result: "FAIL" },
        { testCaseId: "b", result: "BLOCKED" },
      ]);
      expect(latest).toHaveLength(2);
      expect(latest.find((r) => r.testCaseId === "a").result).toBe("PASS");
    });
    it("배열이 아니면 빈 배열", () => {
      expect(getLatestExecutionResults(null)).toEqual([]);
    });
    it("배열 순서와 무관하게 executedAt 이 가장 최근인 결과를 고른다", () => {
      const latest = getLatestExecutionResults([
        { testCaseId: "a", result: "PASS", executedAt: "2026-08-01T10:00:00" },
        { testCaseId: "a", result: "FAIL", executedAt: "2026-08-02T10:00:00" },
      ]);
      expect(latest.find((r) => r.testCaseId === "a").result).toBe("FAIL");
    });
    it("LocalDateTime 배열 형식도 비교한다", () => {
      const latest = getLatestExecutionResults([
        { testCaseId: "a", result: "PASS", executedAt: [2026, 7, 28, 0, 0, 0] },
        { testCaseId: "a", result: "FAIL", executedAt: [2026, 10, 1, 0, 0, 0] },
      ]);
      expect(latest.find((r) => r.testCaseId === "a").result).toBe("FAIL");
    });
  });

  describe("calculateExecutionSummary", () => {
    it("최신 결과 기준 통계 + 진행률", () => {
      const { stats, progressPercent } = calculateExecutionSummary(
        [
          { testCaseId: "a", result: "PASS" },
          { testCaseId: "b", result: "FAIL" },
          { testCaseId: "a", result: "BLOCKED" }, // 무시됨 (a 는 이미 PASS)
        ],
        4,
      );
      expect(stats.pass).toBe(1);
      expect(stats.fail).toBe(1);
      expect(stats.completedCount).toBe(2);
      expect(stats.notRun).toBe(2);
      expect(progressPercent).toBe(50);
    });
    it("totalCount 0 이면 진행률 0", () => {
      expect(calculateExecutionSummary([], 0).progressPercent).toBe(0);
    });
    it("집계 범위를 주면 범위 밖 케이스의 결과는 세지 않는다", () => {
      // 플랜에서 빠진 케이스(z)의 과거 결과가 분자에 섞이면 진행률이 부풀고 미실행이 줄어든다
      const { stats, progressPercent } = calculateExecutionSummary(
        [
          { testCaseId: "a", result: "PASS" },
          { testCaseId: "b", result: "FAIL" },
          { testCaseId: "z", result: "PASS" },
        ],
        99,
        ["a", "b", "c", "d"],
      );
      expect(stats.total).toBe(4);
      expect(stats.pass).toBe(1);
      expect(stats.fail).toBe(1);
      expect(stats.completedCount).toBe(2);
      expect(stats.notRun).toBe(2);
      expect(progressPercent).toBe(50);
    });
    it("범위 안이라도 최신 결과가 NOT_RUN 이면 미실행", () => {
      const { stats } = calculateExecutionSummary(
        [
          {
            testCaseId: "a",
            result: "PASS",
            executedAt: "2026-08-01T10:00:00",
          },
          {
            testCaseId: "a",
            result: "NOT_RUN",
            executedAt: "2026-08-02T10:00:00",
          },
        ],
        1,
        ["a"],
      );
      expect(stats.pass).toBe(0);
      expect(stats.notRun).toBe(1);
    });
  });
});
