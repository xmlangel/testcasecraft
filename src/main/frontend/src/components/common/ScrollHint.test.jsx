import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScrollHint from "./ScrollHint.jsx";

// 편집기와 뷰어가 공유하는 스크롤 표시.
// 실제로 보이는지(그라데이션·움직임)는 jsdom 이 레이아웃을 계산하지 않아 검증할 수
// 없어 실제 브라우저에서 확인했다. 여기서는 언제 그려지고 언제 감추는지를 고정한다.
describe("ScrollHint", () => {
  it("넘치지 않으면 아무것도 그리지 않는다", () => {
    const { container } = render(
      <ScrollHint overflowing={false} atTop atBottom position="bottom" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("넘치면 해당 위치에 표시를 그린다", () => {
    render(<ScrollHint overflowing atTop atBottom={false} position="bottom" />);
    expect(screen.getByTestId("scroll-hint-bottom")).toBeInTheDocument();
  });

  it("맨 위에서는 위쪽 표시를 감춘다", () => {
    render(<ScrollHint overflowing atTop atBottom={false} position="top" />);
    expect(screen.getByTestId("scroll-hint-top")).toHaveStyle({ opacity: "0" });
  });

  it("끝까지 내리면 아래쪽 표시를 감춘다", () => {
    render(<ScrollHint overflowing atTop={false} atBottom position="bottom" />);
    expect(screen.getByTestId("scroll-hint-bottom")).toHaveStyle({
      opacity: "0",
    });
  });

  it("가운데에서는 위·아래 표시를 모두 보인다", () => {
    const { unmount } = render(
      <ScrollHint overflowing atTop={false} atBottom={false} position="top" />,
    );
    expect(screen.getByTestId("scroll-hint-top")).toHaveStyle({ opacity: "1" });
    unmount();
    render(
      <ScrollHint
        overflowing
        atTop={false}
        atBottom={false}
        position="bottom"
      />,
    );
    expect(screen.getByTestId("scroll-hint-bottom")).toHaveStyle({
      opacity: "1",
    });
  });

  it("표시는 클릭과 글 선택을 막지 않는다", () => {
    render(
      <ScrollHint
        overflowing
        atTop={false}
        atBottom={false}
        position="bottom"
      />,
    );
    expect(screen.getByTestId("scroll-hint-bottom")).toHaveStyle({
      pointerEvents: "none",
    });
  });
});
