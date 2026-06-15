import { describe, it, expect } from "vitest";
import { createTheme } from "@mui/material/styles";
import { getSummaryMarkdownStyles } from "./llmAnalysisUtils.js";

const makeTheme = (mode = "light") => createTheme({ palette: { mode } });

describe("getSummaryMarkdownStyles", () => {
  it("pre-wrap 을 마크다운 루트가 아닌 p/li 로만 한정한다 (공백 회귀 가드)", () => {
    const styles = getSummaryMarkdownStyles(makeTheme("light"), false);

    // 한정된 규칙이 존재
    expect(styles["& .wmde-markdown p, & .wmde-markdown li"]).toEqual({
      whiteSpace: "pre-wrap",
    });

    // 루트(.wmde-markdown)에는 whiteSpace 가 없어야 함
    expect(styles["& .wmde-markdown"]?.whiteSpace).toBeUndefined();
    // 객체 자체(컨테이너)에도 whiteSpace 가 없어야 함
    expect(styles.whiteSpace).toBeUndefined();
  });

  it("다크 모드에서도 동일한 한정 규칙을 유지한다", () => {
    const styles = getSummaryMarkdownStyles(makeTheme("dark"), true);
    expect(
      styles["& .wmde-markdown p, & .wmde-markdown li"].whiteSpace,
    ).toBe("pre-wrap");
  });
});
