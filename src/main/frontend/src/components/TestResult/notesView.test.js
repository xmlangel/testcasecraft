import { describe, it, expect } from "vitest";
import {
  shouldExpandNotesPreview,
  buildNotesAutoHeightSx,
} from "./notesView.js";

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

describe("buildNotesAutoHeightSx", () => {
  it("확장 조건일 때 MDEditor 높이를 auto 로 푸는 sx 를 반환한다", () => {
    const sx = buildNotesAutoHeightSx({
      previewMode: "preview",
      isFullscreen: false,
      notes: "내용",
    });
    expect(sx["& .w-md-editor"]).toEqual({ height: "auto !important" });
    expect(sx["& .w-md-editor-preview"].overflow).toBe("visible !important");
  });

  it("확장 조건이 아니면 빈 sx 를 반환한다", () => {
    const sx = buildNotesAutoHeightSx({
      previewMode: "live",
      isFullscreen: false,
      notes: "내용",
    });
    expect(sx).toEqual({});
  });
});
