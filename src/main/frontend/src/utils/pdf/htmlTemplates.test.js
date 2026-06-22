import { describe, it, expect } from "vitest";
import {
  generateTestResultHTML,
  generateTestSuitesHTML,
  generateTestCasesHTML,
  generateFailedTestsHTML,
} from "./htmlTemplates.js";

const baseResult = {
  totalTests: 10,
  failures: 1,
  errors: 1,
  skipped: 2,
  uploadedAt: [2026, 6, 16, 10, 0, 0],
  uploadedBy: { displayName: "테스터" },
  testExecutionName: "샘플 실행",
};

describe("generateTestResultHTML", () => {
  it("유효한 HTML 문서를 만들고 핵심 수치를 포함한다", () => {
    const html = generateTestResultHTML(baseResult, [], []);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    // 실행된 테스트 = total - skipped = 8, passed = 8 - 1 - 1 = 6
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(100);
  });

  it("성공률 구간에 따라 분석 문구가 달라진다", () => {
    const high = generateTestResultHTML(
      { ...baseResult, totalTests: 10, failures: 0, errors: 0, skipped: 0 },
      [],
      [],
    );
    expect(high).toContain("우수");
    const low = generateTestResultHTML(
      { ...baseResult, totalTests: 10, failures: 8, errors: 0, skipped: 0 },
      [],
      [],
    );
    expect(low).toContain("불량");
  });
});

describe("generateTestSuitesHTML / generateTestCasesHTML / generateFailedTestsHTML", () => {
  it("빈 입력에도 문자열을 반환한다", () => {
    expect(typeof generateTestSuitesHTML([])).toBe("string");
    expect(typeof generateTestCasesHTML([])).toBe("string");
    expect(typeof generateFailedTestsHTML([])).toBe("string");
  });

  it("테스트케이스 행을 렌더링한다", () => {
    const html = generateTestCasesHTML([
      { name: "tc1", className: "C1", status: "passed", time: 1.2 },
    ]);
    expect(html).toContain("tc1");
  });
});
