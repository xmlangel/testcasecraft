import { describe, it, expect } from "vitest";
import { splitErrorMessage } from "./errorSummary";

describe("splitErrorMessage", () => {
  it("상태코드 괄호까지만 요약하고 본문은 전문으로 넘긴다", () => {
    const full =
      'OpenRouter API 호출 실패 (상태코드: 429 TOO_MANY_REQUESTS): [호출 주소: https://openrouter.ai/api/v1/chat/completions] {"error":{"message":"Provider returned error","code":429}}';
    const { summary, detail } = splitErrorMessage(full);
    expect(summary).toBe(
      "OpenRouter API 호출 실패 (상태코드: 429 TOO_MANY_REQUESTS)",
    );
    expect(detail).toBe(full);
  });

  it("원인 사슬이 겹쳐도 마지막 괄호까지 남긴다", () => {
    const full =
      '연결 테스트 실패: LLM API 연결 실패: OpenRouter API 호출 실패 (상태코드: 404 NOT_FOUND): {"error":{"code":404}}';
    const { summary, detail } = splitErrorMessage(full);
    expect(summary).toBe(
      "연결 테스트 실패: LLM API 연결 실패: OpenRouter API 호출 실패 (상태코드: 404 NOT_FOUND)",
    );
    expect(detail).toBe(full);
  });

  it("짧은 문구는 그대로 두고 펼칠 것을 만들지 않는다", () => {
    const full =
      "유사도 검색 실패: Connection prematurely closed BEFORE response";
    const { summary, detail } = splitErrorMessage(full);
    expect(summary).toBe(full);
    expect(detail).toBeNull();
  });

  it("HTML 본문이 붙으면 앞머리만 남긴다", () => {
    const full =
      "OpenRouter API 호출 실패 (상태코드: 404 NOT_FOUND): <!DOCTYPE html><html lang=en>…</html>";
    const { summary, detail } = splitErrorMessage(full);
    expect(summary).toBe("OpenRouter API 호출 실패 (상태코드: 404 NOT_FOUND)");
    expect(detail).toBe(full);
  });

  it("여러 줄이면 첫 줄만 요약한다", () => {
    const full =
      "요청을 처리하지 못했습니다\n  at com.example.Foo.bar(Foo.java:1)";
    const { summary, detail } = splitErrorMessage(full);
    expect(summary).toBe("요청을 처리하지 못했습니다");
    expect(detail).toBe(full);
  });

  it("전문이 JSON 하나뿐이면 앞부분을 요약으로 쓴다", () => {
    const full = '{"error":{"message":"' + "x".repeat(400) + '"}}';
    const { summary, detail } = splitErrorMessage(full);
    expect(summary.length).toBeLessThanOrEqual(200);
    expect(detail).toBe(full);
  });

  it("빈 값과 null 은 빈 요약으로 답한다", () => {
    expect(splitErrorMessage(null)).toEqual({ summary: "", detail: null });
    expect(splitErrorMessage("")).toEqual({ summary: "", detail: null });
    expect(splitErrorMessage("   ")).toEqual({ summary: "", detail: null });
  });
});
