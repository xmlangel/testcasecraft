import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TestResultFloatingMenu from "./TestResultFloatingMenu.jsx";

const t = (key, fallback) => fallback || key;

const renderMenu = (props = {}) =>
  render(
    <TestResultFloatingMenu
      result="NOT_RUN"
      onResultChange={vi.fn()}
      onPrevious={vi.fn()}
      onNext={vi.fn()}
      onSave={vi.fn()}
      onClose={vi.fn()}
      currentIndex={1}
      totalCount={5}
      isViewer={false}
      loading={false}
      testCase={{ id: "tc1" }}
      t={t}
      {...props}
    />,
  );

describe("TestResultFloatingMenu 결과 칸 하단 바 (ICT-491)", () => {
  it("docked 이면 화면 가운데가 아니라 칸 하단에 붙고 저장 후 다음 선택을 보인다", () => {
    const onSaveAndNextChange = vi.fn();
    renderMenu({ docked: true, saveAndNext: true, onSaveAndNextChange });

    const bar = screen.getByTestId("result-docked-bar");
    expect(bar).toHaveStyle({ position: "sticky" });
    // 이전 · n/N · 다음 이 바 안에 함께 있다
    expect(bar.textContent.replace(/\s/g, "")).toContain("2/5");

    const checkbox = screen.getByTestId("save-and-next-checkbox");
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(onSaveAndNextChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("floating-save-button")).toBeInTheDocument();
  });

  it("docked 가 아니면 예전처럼 떠 있는 메뉴이고 저장 후 다음 선택이 없다", () => {
    renderMenu();
    expect(screen.getByTestId("result-floating-menu")).toHaveStyle({
      position: "fixed",
    });
    expect(screen.queryByTestId("save-and-next-checkbox")).toBeNull();
  });
});
