import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TestCaseWorkspaceFrame from "./TestCaseWorkspaceFrame.jsx";
import { mockViewportWidth } from "../../test/utils/mockMatchMedia.js";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, def) => def ?? key }),
}));

/**
 * 테스트케이스 화면의 트리 + 상세 틀 (ICT-510).
 *
 * 768px 에서 트리 옆 상세 칸이 좁아져 "폴더나 테스트 케이스를 선택해주세요." 가
 * 한 글자씩 세로로 쌓였다. 768px 미만은 1단(트리 위, 상세 아래)으로 바꾸고,
 * 768px 이상은 이전 2단(트리 · 폭 조절 막대 · 상세) 그대로 둔다.
 */
describe("TestCaseWorkspaceFrame", () => {
  let restoreViewport;
  afterEach(() => {
    restoreViewport?.();
    restoreViewport = undefined;
  });

  const setup = (props = {}) =>
    render(
      <TestCaseWorkspaceFrame
        height="600px"
        treeVisible
        treeShown
        treeWidth={300}
        treeMinWidth={200}
        treeMaxWidth={600}
        onTreeToggle={vi.fn()}
        onResizerDrag={vi.fn()}
        tree={<div data-testid="fake-tree">tree</div>}
        detail={<div data-testid="fake-detail">detail</div>}
        {...props}
      />,
    );

  it("1440px: 트리와 상세가 가로로 놓이고 폭 조절 막대가 있다", () => {
    restoreViewport = mockViewportWidth(1440);
    setup();
    const frame = screen.getByTestId("testcase-workspace-frame");
    expect(frame).toHaveAttribute("data-layout", "split");
    expect(frame).toHaveStyle({ flexDirection: "row" });
    expect(screen.getByTestId("resizer")).toBeInTheDocument();
    expect(screen.getByTestId("testcase-tree-pane")).toHaveStyle({
      width: "300px",
    });
  });

  it("768px 은 아직 2단이다", () => {
    restoreViewport = mockViewportWidth(768);
    setup();
    expect(screen.getByTestId("testcase-workspace-frame")).toHaveAttribute(
      "data-layout",
      "split",
    );
  });

  it("767px 이하: 1단으로 바뀌어 트리가 위, 상세가 아래 전체 폭이다", () => {
    restoreViewport = mockViewportWidth(767);
    setup();
    const frame = screen.getByTestId("testcase-workspace-frame");
    expect(frame).toHaveAttribute("data-layout", "single");
    expect(frame).toHaveStyle({ flexDirection: "column" });
    expect(screen.getByTestId("testcase-tree-pane")).toHaveStyle({
      width: "100%",
    });
    // 1단에서는 좌우 폭 조절이 의미가 없다
    expect(screen.queryByTestId("resizer")).toBeNull();
    // 트리가 상세보다 앞에 온다
    const tree = screen.getByTestId("fake-tree");
    const detail = screen.getByTestId("fake-detail");
    expect(
      tree.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("1단에서도 트리 닫기·열기 버튼이 동작한다", () => {
    restoreViewport = mockViewportWidth(390);
    const onTreeToggle = vi.fn();
    const { rerender } = setup({ onTreeToggle });
    fireEvent.click(screen.getByTestId("testcase-tree-close"));
    expect(onTreeToggle).toHaveBeenCalledTimes(1);

    rerender(
      <TestCaseWorkspaceFrame
        height="600px"
        treeVisible={false}
        treeShown={false}
        treeWidth={300}
        onTreeToggle={onTreeToggle}
        onResizerDrag={vi.fn()}
        tree={<div data-testid="fake-tree">tree</div>}
        detail={<div data-testid="fake-detail">detail</div>}
      />,
    );
    expect(screen.queryByTestId("testcase-tree-pane")).toBeNull();
    expect(screen.getByTestId("fake-detail")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("testcase-tree-open"));
    expect(onTreeToggle).toHaveBeenCalledTimes(2);
  });
});
