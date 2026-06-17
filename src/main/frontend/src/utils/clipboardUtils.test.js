import { describe, it, expect, vi, afterEach } from "vitest";
import { copyToClipboard } from "./clipboardUtils.js";

describe("clipboardUtils - copyToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete navigator.clipboard;
  });

  it("빈 텍스트는 false", async () => {
    expect(await copyToClipboard("")).toBe(false);
    expect(await copyToClipboard(null)).toBe(false);
  });

  it("navigator.clipboard 가 있으면 writeText 로 복사하고 true", async () => {
    const writeText = vi.fn().mockResolvedValue();
    navigator.clipboard = { writeText };
    const ok = await copyToClipboard("hello");
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("writeText 가 실패하면 false 를 반환한다", async () => {
    navigator.clipboard = {
      writeText: vi.fn().mockRejectedValue(new Error("denied")),
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await copyToClipboard("x")).toBe(false);
  });

  it("clipboard API 가 없으면 execCommand 폴백을 사용한다", async () => {
    // navigator.clipboard 미설정 → 폴백 경로
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;
    const ok = await copyToClipboard("fallback");
    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});
