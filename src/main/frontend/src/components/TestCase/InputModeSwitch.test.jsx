import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InputModeSwitch from "./InputModeSwitch.jsx";

const t = (_key, def) => def;

// ICT-514(리뷰 P1-9): 스프레드시트로 바꾼 뒤 「스프레드시트로 일괄 입력」 툴팁이
// 마우스를 올리지 않아도 「3개 스텝」 칩을 덮은 채 떠 있었다.
// 기본 상태에서 툴팁은 닫혀 있어야 하고, 이미 고른 모드의 버튼은 툴팁을 띄우지 않는다.
describe("InputModeSwitch", () => {
  it("처음 그렸을 때 열린 툴팁이 없다", () => {
    render(<InputModeSwitch mode="spreadsheet" onChange={vi.fn()} t={t} />);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(screen.queryByText("스프레드시트로 일괄 입력")).toBeNull();
  });

  it("고른 모드 버튼은 누른 뒤 포커스·마우스가 남아도 툴팁을 띄우지 않는다", async () => {
    render(<InputModeSwitch mode="spreadsheet" onChange={vi.fn()} t={t} />);
    const button = screen.getByTestId("mode-spreadsheet-button");
    fireEvent.focus(button);
    fireEvent.mouseOver(button);
    // 지연(enterDelay)보다 오래 기다려도 열리지 않는다
    await new Promise((r) => setTimeout(r, 600));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("고르지 않은 모드 버튼은 마우스를 올리면 툴팁으로 안내한다", async () => {
    render(<InputModeSwitch mode="spreadsheet" onChange={vi.fn()} t={t} />);
    fireEvent.mouseOver(screen.getByTestId("mode-individual-button"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "개별 폼으로 상세 입력",
    );
  });

  it("다른 모드를 누르면 onChange 로 그 모드를 넘긴다", () => {
    const onChange = vi.fn();
    render(<InputModeSwitch mode="spreadsheet" onChange={onChange} t={t} />);
    fireEvent.click(screen.getByTestId("mode-individual-button"));
    expect(onChange).toHaveBeenCalledWith("form");
  });
});
