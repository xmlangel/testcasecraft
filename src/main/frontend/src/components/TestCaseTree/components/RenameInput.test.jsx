import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RenameInput from "./RenameInput.jsx";

describe("RenameInput (트리 이름변경 입력)", () => {
  const setup = (overrides = {}) => {
    const props = {
      renameData: { id: "n1", name: "기존이름" },
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      onChange: vi.fn(),
      ...overrides,
    };
    render(<RenameInput {...props} />);
    return props;
  };

  it("renameData 가 없으면 아무것도 렌더하지 않는다", () => {
    const { container } = render(
      <RenameInput
        renameData={null}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onChange={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("현재 이름을 입력값으로 보여준다", () => {
    setup();
    expect(screen.getByRole("textbox")).toHaveValue("기존이름");
  });

  it("Enter 키를 누르면 onConfirm 이 호출된다", () => {
    const props = setup();
    fireEvent.keyPress(screen.getByRole("textbox"), {
      key: "Enter",
      charCode: 13,
    });
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("입력을 변경하면 onChange 가 호출된다", () => {
    const props = setup();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "새이름" },
    });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it("확인/취소 버튼이 각각 onConfirm/onCancel 을 호출한다", () => {
    const props = setup();
    const buttons = screen.getAllByRole("button");
    // 첫 버튼=확인(Edit), 둘째 버튼=취소(Close)
    fireEvent.click(buttons[0]);
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(buttons[1]);
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
});
