import { describe, it, expect } from "vitest";
import { MARKDOWN_PREWRAP_SX } from "./markdownStyles.js";

// PreviousResultsDialog · JiraHistoryDialog 의 비고 표시가 공유하는 sx.
describe("MARKDOWN_PREWRAP_SX", () => {
  it("pre-wrap 을 p/li 로만 한정한다", () => {
    expect(MARKDOWN_PREWRAP_SX["& .wmde-markdown p, & .wmde-markdown li"]).toEqual({
      whiteSpace: "pre-wrap",
    });
  });

  it("마크다운 루트(.wmde-markdown)나 컨테이너에는 pre-wrap 을 적용하지 않는다", () => {
    expect(MARKDOWN_PREWRAP_SX["& .wmde-markdown"]).toBeUndefined();
    expect(MARKDOWN_PREWRAP_SX.whiteSpace).toBeUndefined();
  });
});
