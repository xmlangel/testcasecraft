import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RequirementListView from "./RequirementListView.jsx";

// ICT-514(리뷰 P1-8): 요구사항 목록이 비면 표 안에 회색 한 줄만 보였다.
// 다른 화면과 같은 빈 상태로 보이고, 쓰기 권한이 있으면 다음에 할 일
// (문서가 없으면 문서 추가, 있으면 요구사항 추가)을 바로 누를 수 있어야 한다.

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));
vi.mock("./RequirementLinkPanel.jsx", () => ({ default: () => null }));
vi.mock("../common/MarkdownViewer.jsx", () => ({ default: () => null }));

const baseProps = () => ({
  specs: [],
  requirements: [],
  testCases: [],
  canEdit: true,
  onAddSpec: vi.fn(),
  onEditSpec: vi.fn(),
  onDeleteSpec: vi.fn(),
  onAddRequirement: vi.fn(),
  onEditRequirement: vi.fn(),
  onDeleteRequirement: vi.fn(),
  onAddLinks: vi.fn(),
  onRemoveLink: vi.fn(),
});

describe("RequirementListView 빈 목록", () => {
  it("문서가 없으면 EmptyState 로 안내하고 문서 추가를 부른다", () => {
    const props = baseProps();
    render(<RequirementListView {...props} />);
    expect(
      screen.getByTestId("requirement-empty-state-title"),
    ).toHaveTextContent("요구사항이 없습니다.");
    expect(
      screen.getByTestId("requirement-empty-state-description"),
    ).toHaveTextContent("요구사항 문서를 먼저 추가하세요.");
    fireEvent.click(screen.getByTestId("requirement-empty-state-action"));
    expect(props.onAddSpec).toHaveBeenCalledWith(null);
  });

  it("문서가 있으면 빈 상태의 동작은 요구사항 추가다", () => {
    const props = {
      ...baseProps(),
      specs: [{ id: "s1", docId: "SRS-1", title: "로그인", parentId: null }],
    };
    render(<RequirementListView {...props} />);
    const action = screen.getByTestId("requirement-empty-state-action");
    expect(action).toHaveTextContent("요구사항 추가");
    fireEvent.click(action);
    expect(props.onAddRequirement).toHaveBeenCalledWith(null);
  });

  it("쓰기 권한이 없으면 빈 상태에 버튼이 없다", () => {
    render(<RequirementListView {...baseProps()} canEdit={false} />);
    expect(screen.getByTestId("requirement-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("requirement-empty-state-action")).toBeNull();
  });
});
