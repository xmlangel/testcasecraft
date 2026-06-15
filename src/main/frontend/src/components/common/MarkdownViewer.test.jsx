import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownViewer from "./MarkdownViewer.jsx";

// 마크다운 표시 과도한 공백 회귀 방지:
// 버그는 whiteSpace:"pre-wrap" 을 마크다운 루트(.wmde-markdown)에 적용해
// 블록 사이 개행까지 빈 줄로 렌더링한 것. 수정 후 루트에는 pre-wrap 이 없고,
// pre-wrap 은 p/li 로만 한정된다.
describe("MarkdownViewer", () => {
  it("내용이 비어 있으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<MarkdownViewer content="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("공백만 있는 내용도 렌더링하지 않는다", () => {
    const { container } = render(<MarkdownViewer content={"   \n  "} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("마크다운 문단 텍스트를 렌더링한다", () => {
    render(<MarkdownViewer content={"첫째 문단\n\n둘째 문단"} />);
    expect(screen.getByText("첫째 문단")).toBeInTheDocument();
    expect(screen.getByText("둘째 문단")).toBeInTheDocument();
  });

  it("마크다운 루트(.wmde-markdown)에 인라인 white-space:pre-wrap 을 적용하지 않는다", () => {
    const { container } = render(
      <MarkdownViewer content={"문단1\n\n문단2\n\n문단3"} />,
    );
    const root = container.querySelector(".wmde-markdown");
    expect(root).toBeTruthy();
    // 회귀 가드: 루트 인라인 스타일에 pre-wrap 이 다시 들어오면 실패
    expect(root.style.whiteSpace).not.toBe("pre-wrap");
  });
});
