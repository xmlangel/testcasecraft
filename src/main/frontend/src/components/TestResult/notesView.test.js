import { describe, it, expect } from "vitest";
import { shouldExpandNotesPreview, resolveNotesMaxLines } from "./notesView.js";

describe("shouldExpandNotesPreview", () => {
  it("미리보기 모드 + 값 존재 + 비전체화면이면 확장한다", () => {
    expect(
      shouldExpandNotesPreview({
        previewMode: "preview",
        isFullscreen: false,
        notes: "내용",
      }),
    ).toBe(true);
  });

  it("편집/라이브 모드에서는 확장하지 않는다 (고정 높이 유지)", () => {
    expect(
      shouldExpandNotesPreview({
        previewMode: "live",
        isFullscreen: false,
        notes: "내용",
      }),
    ).toBe(false);
    expect(
      shouldExpandNotesPreview({
        previewMode: "edit",
        isFullscreen: false,
        notes: "내용",
      }),
    ).toBe(false);
  });

  it("전체화면 모드에서는 확장하지 않는다", () => {
    expect(
      shouldExpandNotesPreview({
        previewMode: "preview",
        isFullscreen: true,
        notes: "내용",
      }),
    ).toBe(false);
  });

  it("노트가 비어 있으면 확장하지 않는다", () => {
    expect(
      shouldExpandNotesPreview({
        previewMode: "preview",
        isFullscreen: false,
        notes: "",
      }),
    ).toBe(false);
  });
});

describe("resolveNotesMaxLines", () => {
  it("확장 조건이면 내용 전체가 보이도록 큰 줄 수를 준다", () => {
    const lines = resolveNotesMaxLines({
      previewMode: "preview",
      isFullscreen: false,
      notes: "내용",
    });
    expect(lines).toBeGreaterThanOrEqual(1000);
  });

  it("확장 조건이 아니면 접힌 줄 수를 유지한다", () => {
    const lines = resolveNotesMaxLines({
      previewMode: "live",
      isFullscreen: false,
      notes: "내용",
    });
    expect(lines).toBe(12);
  });
});
