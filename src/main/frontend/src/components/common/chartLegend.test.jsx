import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { legendTextFormatter, LEGEND_TEXT_COLOR } from "./chartLegend.jsx";

// ICT-509: 범례 글자를 계열 색이 아닌 본문 색으로 그린다.
describe("legendTextFormatter", () => {
  it("범례 이름을 본문 색 글자로 감싼다", () => {
    render(<div>{legendTextFormatter("차단됨")}</div>);
    const label = screen.getByText("차단됨");
    expect(label.tagName).toBe("SPAN");
    expect(label.style.color).toBe(LEGEND_TEXT_COLOR);
  });

  it("본문 색은 테마별로 바뀌는 CSS 변수다", () => {
    expect(LEGEND_TEXT_COLOR).toBe("var(--text-primary)");
  });
});
