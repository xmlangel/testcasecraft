import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NoSelectionPlaceholder from "./NoSelectionPlaceholder.jsx";

vi.mock("../../context/I18nContext", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

// ICT-514(리뷰 P1-8): 테스트케이스 화면의 빈 상태도 공통 EmptyState 모양을 쓴다.
// 플랜·실행·자동화·요구사항 화면과 같은 아이콘·제목·설명 구성이어야 한다.
describe("NoSelectionPlaceholder", () => {
  it("EmptyState 로 제목과 설명을 보인다", () => {
    render(<NoSelectionPlaceholder />);
    expect(screen.getByTestId("testcase-empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("testcase-empty-state-icon")).toBeTruthy();
    expect(
      screen.getByTestId("testcase-empty-state-title"),
    ).toHaveTextContent("폴더나 테스트 케이스를 선택해주세요.");
    expect(
      screen.getByTestId("testcase-empty-state-description"),
    ).toHaveTextContent("좌측 트리에서 항목을 선택하면");
  });
});
