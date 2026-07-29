import { describe, expect, it } from "vitest";
import jiraService from "./jiraService.js";

/**
 * 이슈 키 패턴 회귀 가드.
 *
 * JIRA 프로젝트 키는 첫 글자가 영문이고 이후 영문·숫자가 올 수 있다.
 * 과거 패턴이 `^[A-Z]+-\d+$` 라서 AGV2-100 처럼 숫자를 포함한 프로젝트 키가
 * "잘못된 이슈 키 형식"으로 막혀 검색·검증이 진행되지 않았다.
 */
describe("jiraService 이슈 키 처리", () => {
  it("프로젝트 키에 숫자가 있어도 유효한 키로 본다", () => {
    expect(jiraService.isValidIssueKey("AGV2-100")).toBe(true);
    expect(jiraService.isValidIssueKey("ONT-904")).toBe(true);
  });

  it("소문자 입력도 유효하며 대문자로 정규화한다", () => {
    expect(jiraService.isValidIssueKey("agv2-100")).toBe(true);
    expect(jiraService.normalizeIssueKey("  agv2-100 ")).toBe("AGV2-100");
  });

  it("형식이 아닌 값은 거른다", () => {
    expect(jiraService.normalizeIssueKey("1AGV-100")).toBeNull();
    expect(jiraService.normalizeIssueKey("A-100")).toBeNull();
    expect(jiraService.normalizeIssueKey("AGV2-100 크래시")).toBeNull();
    expect(jiraService.normalizeIssueKey("")).toBeNull();
  });

  it("텍스트·URL에서 숫자 포함 프로젝트 키를 추출한다", () => {
    expect(jiraService.extractIssueKeys("AGV2-100 과 AGV2-101 참고")).toEqual([
      "AGV2-100",
      "AGV2-101",
    ]);
    expect(
      jiraService.extractIssueKeyFromUrl(
        "https://jira.example.com/browse/AGV2-100",
      ),
    ).toBe("AGV2-100");
    expect(jiraService.extractIssueKeyFromUrl("agv2-100")).toBe("AGV2-100");
  });
});
