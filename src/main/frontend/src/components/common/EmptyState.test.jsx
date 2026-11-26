import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Assignment from "@mui/icons-material/Assignment";
import EmptyState from "./EmptyState.jsx";

// ICT-514(리뷰 P1-8): 빈 상태가 화면마다 달라 사용자가 "비어 있다"와 "아직 안 골랐다"를
// 화면마다 다르게 읽어야 했다. 모든 화면이 이 컴포넌트 하나로 같은 모양을 쓴다.
describe("EmptyState", () => {
  it("아이콘 · 제목 · 설명을 그린다", () => {
    render(
      <EmptyState
        icon={Assignment}
        title="등록된 테스트 플랜이 없습니다."
        description="플랜을 고르면 내용이 여기에 열립니다."
      />,
    );
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state-icon")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state-title")).toHaveTextContent(
      "등록된 테스트 플랜이 없습니다.",
    );
    expect(screen.getByTestId("empty-state-description")).toHaveTextContent(
      "플랜을 고르면 내용이 여기에 열립니다.",
    );
  });

  it("주요 동작 버튼을 누르면 콜백을 부른다", () => {
    const onAction = vi.fn();
    render(
      <EmptyState title="없음" actionLabel="플랜 만들기" onAction={onAction} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "플랜 만들기" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("설명과 동작은 선택이다 — 없으면 그리지 않는다", () => {
    render(<EmptyState title="없음" actionLabel="만들기" />);
    expect(screen.queryByTestId("empty-state-description")).toBeNull();
    // 콜백 없이 라벨만 오면 누를 수 없는 버튼을 만들지 않는다
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("아이콘을 넘기지 않아도 기본 아이콘을 그린다", () => {
    render(<EmptyState title="없음" data-testid="x" />);
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });
});
