import { describe, it, expect } from "vitest";
import { preserveLineBreaks } from "./markdownLineBreaks.js";

describe("preserveLineBreaks", () => {
  it("adds a hard break between consecutive non-empty lines", () => {
    expect(preserveLineBreaks("a\nb\nc")).toBe("a  \nb  \nc");
  });

  it("leaves paragraph breaks (blank lines) alone", () => {
    expect(preserveLineBreaks("a\n\nb")).toBe("a\n\nb");
  });

  it("does not touch lines inside code fences", () => {
    const src = "run:\n```\nx\ny\n```\ndone";
    expect(preserveLineBreaks(src)).toBe("run:\n```\nx\ny\n```\ndone");
  });

  it("keeps existing hard breaks unchanged", () => {
    expect(preserveLineBreaks("a  \nb")).toBe("a  \nb");
    expect(preserveLineBreaks("a\\\nb")).toBe("a\\\nb");
  });

  it("normalizes CRLF", () => {
    expect(preserveLineBreaks("a\r\nb")).toBe("a  \nb");
  });

  it("returns empty string for empty input and keeps single lines", () => {
    expect(preserveLineBreaks("")).toBe("");
    expect(preserveLineBreaks(undefined)).toBe("");
    expect(preserveLineBreaks("one line")).toBe("one line");
  });

  it("is idempotent", () => {
    const once = preserveLineBreaks("a\nb\n\n- x\n- y");
    expect(preserveLineBreaks(once)).toBe(once);
  });
});
