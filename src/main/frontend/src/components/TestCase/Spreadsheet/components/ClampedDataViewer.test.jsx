import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ClampedDataViewer, { LONG_CELL_CHARS } from "./ClampedDataViewer.jsx";

// ICT-514(리뷰 P1-9): 긴 스텝 셀 하나가 행 높이를 화면 밖으로 늘렸다.
// 셀은 3줄까지만 보이게 줄일 수 있는 표식(클래스)을 달고, 잘릴 수 있는 셀은
// 마우스를 올리면 전체 내용을 볼 수 있어야 한다. 표식이 빠지면 줄임이 걸리지 않고,
// title 이 빠지면 잘린 내용을 편집하지 않고는 읽을 방법이 없다.
describe("ClampedDataViewer", () => {
  it("값을 그대로 보이고 줄임 표식 클래스를 단다", () => {
    const { container } = render(
      <ClampedDataViewer cell={{ value: "짧은 값" }} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveTextContent("짧은 값");
    expect(span).toHaveClass("Spreadsheet__data-viewer");
    expect(span).toHaveClass("Spreadsheet__data-viewer--clampable");
    expect(span).not.toHaveAttribute("title");
  });

  it("긴 값과 여러 줄 값은 전체 내용을 title 로 단다", () => {
    const long = "가".repeat(LONG_CELL_CHARS + 1);
    const { container, rerender } = render(
      <ClampedDataViewer cell={{ value: long }} />,
    );
    expect(container.querySelector("span")).toHaveAttribute("title", long);

    const multi = "1. 접속\n2. 실행\n3. 확인\n4. 정리";
    rerender(<ClampedDataViewer cell={{ value: multi }} />);
    expect(container.querySelector("span")).toHaveAttribute("title", multi);
  });

  it("빈 셀은 빈 문자열로 그린다", () => {
    const { container } = render(<ClampedDataViewer cell={undefined} />);
    expect(container.querySelector("span")).toHaveTextContent("");
  });
});
