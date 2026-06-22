import { describe, it, expect } from "vitest";
import { computeMarkdownEditorHeight } from "./markdownEditorHeight.js";

// 내부 상수에 의존하지 않도록, 줄 수 동등성으로 동작을 검증한다.
const lines = (n) => Array.from({ length: n }, (_, i) => `l${i}`).join("\n");

describe("computeMarkdownEditorHeight", () => {
  it("기본 동작은 유지된다 — 빈 내용은 1줄, 내용 있으면 최소 2줄", () => {
    // 빈 내용(기본) < 1줄 내용은 같다? 빈=1줄, 내용 1줄→floor 2줄
    expect(computeMarkdownEditorHeight("x")).toBe(
      computeMarkdownEditorHeight(lines(2)),
    );
    expect(computeMarkdownEditorHeight("")).toBeLessThan(
      computeMarkdownEditorHeight("x"),
    );
  });

  it("minLines 하한이 빈 내용과 내용 있는 경우 모두에 적용된다 (단계 5줄)", () => {
    const opt = { minLines: 5 };
    // 빈 내용·1줄 내용 모두 5줄로 동일 높이
    expect(computeMarkdownEditorHeight("", opt)).toBe(
      computeMarkdownEditorHeight(lines(5)),
    );
    expect(computeMarkdownEditorHeight("한 줄", opt)).toBe(
      computeMarkdownEditorHeight(lines(5)),
    );
    // 5줄 하한은 기본(2줄 하한)보다 크다
    expect(computeMarkdownEditorHeight("한 줄", opt)).toBeGreaterThan(
      computeMarkdownEditorHeight("한 줄"),
    );
  });

  it("내용이 minLines 보다 많으면 줄 수만큼 늘어난다", () => {
    expect(computeMarkdownEditorHeight(lines(7), { minLines: 5 })).toBe(
      computeMarkdownEditorHeight(lines(7)),
    );
  });

  it("maxLines(기본 10) 를 넘으면 더 커지지 않는다 (스크롤)", () => {
    expect(computeMarkdownEditorHeight(lines(20))).toBe(
      computeMarkdownEditorHeight(lines(10)),
    );
  });
});
