import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import RagStatusBadge from "./RagStatusBadge.jsx";

describe("RagStatusBadge 상태 칩 (ICT-494 tl-2)", () => {
  it("미등록이면 칩만 그리고 등록 버튼은 그리지 않는다", () => {
    render(<RagStatusBadge status="notVectorized" />);
    expect(screen.getByTestId("rag-status-chip")).toHaveAttribute(
      "data-status",
      "notVectorized",
    );
    expect(screen.queryByRole("button", { name: /RAG 등록/ })).toBeNull();
  });

  it("등록됨·확인 중 상태를 그린다", () => {
    const { rerender } = render(<RagStatusBadge status="vectorized" />);
    expect(screen.getByText("RAG 등록됨")).toBeInTheDocument();
    rerender(<RagStatusBadge status="checking" />);
    expect(screen.getByText("상태 확인 중...")).toBeInTheDocument();
  });

  it("hidden 이면 아무것도 그리지 않는다", () => {
    const { container } = render(<RagStatusBadge status="hidden" />);
    expect(container).toBeEmptyDOMElement();
  });
});
