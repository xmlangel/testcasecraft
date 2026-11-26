import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectHeaderSlot, {
  PROJECT_HEADER_SLOT_ID,
} from "./ProjectHeaderSlot.jsx";

describe("ProjectHeaderSlot (ICT-496)", () => {
  it("머리 줄 자리가 있으면 그 안에 그린다", () => {
    render(
      <>
        <div id={PROJECT_HEADER_SLOT_ID} data-testid="slot" />
        <div data-testid="body">
          <ProjectHeaderSlot fallback={<span>fallback</span>}>
            <span data-testid="tool">tool</span>
          </ProjectHeaderSlot>
        </div>
      </>,
    );
    expect(screen.getByTestId("slot")).toContainElement(
      screen.getByTestId("tool"),
    );
    expect(screen.queryByText("fallback")).toBeNull();
  });

  it("머리 줄 자리가 없으면 fallback 을 제자리에 그린다", () => {
    render(
      <ProjectHeaderSlot fallback={<span>fallback</span>}>
        <span data-testid="tool">tool</span>
      </ProjectHeaderSlot>,
    );
    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("tool")).toBeNull();
  });
});
