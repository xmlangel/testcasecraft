import { describe, it, expect } from "vitest";
import { extractTestCasesFromAIResponse } from "./testCaseParser.js";

describe("testCaseParser - extractTestCasesFromAIResponse", () => {
  it("문자열이 아니면 빈 배열", () => {
    expect(extractTestCasesFromAIResponse(null)).toEqual([]);
    expect(extractTestCasesFromAIResponse(123)).toEqual([]);
    expect(extractTestCasesFromAIResponse("")).toEqual([]);
  });

  it("JSON 코드 블록(단일 객체)을 파싱한다", () => {
    const content =
      "설명\n```json\n" +
      JSON.stringify({ name: "TC1", description: "d", priority: "High" }) +
      "\n```";
    const tcs = extractTestCasesFromAIResponse(content);
    expect(tcs).toHaveLength(1);
    expect(tcs[0].name).toBe("TC1");
  });

  it("JSON 배열을 파싱한다", () => {
    const content =
      "```json\n" + JSON.stringify([{ name: "A" }, { name: "B" }]) + "\n```";
    const tcs = extractTestCasesFromAIResponse(content);
    expect(tcs.map((t) => t.name)).toEqual(["A", "B"]);
  });

  it("testCases 래퍼 객체를 파싱한다", () => {
    const content =
      "```json\n" +
      JSON.stringify({ testCases: [{ name: "W1" }, { name: "W2" }] }) +
      "\n```";
    const tcs = extractTestCasesFromAIResponse(content);
    expect(tcs.map((t) => t.name)).toEqual(["W1", "W2"]);
  });

  it("name 없는 객체는 제외한다", () => {
    const content =
      "```json\n" +
      JSON.stringify([{ name: "OK" }, { description: "no name" }]) +
      "\n```";
    const tcs = extractTestCasesFromAIResponse(content);
    expect(tcs).toHaveLength(1);
    expect(tcs[0].name).toBe("OK");
  });

  it("name 기준으로 중복을 제거한다", () => {
    const content =
      "```json\n" +
      JSON.stringify([{ name: "dup" }, { name: "dup" }, { name: "uniq" }]) +
      "\n```";
    const tcs = extractTestCasesFromAIResponse(content);
    expect(tcs.map((t) => t.name)).toEqual(["dup", "uniq"]);
  });

  it("깨진 JSON 블록은 throw 없이 건너뛴다", () => {
    const content = "```json\n{ not valid json \n```";
    expect(extractTestCasesFromAIResponse(content)).toEqual([]);
  });
});
