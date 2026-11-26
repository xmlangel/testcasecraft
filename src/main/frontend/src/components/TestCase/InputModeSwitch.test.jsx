import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InputModeSwitch from "./InputModeSwitch.jsx";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, def) => def ?? key }),
}));

/**
 * 입력 모드 전환 (ICT-510).
 *
 * 768px 화면에서 "개별 폼" 토글이 세 줄로 꺾였다. 라벨은 한 줄로 남고
 * 토글 묶음은 칸이 좁아져도 줄어들지 않아야 한다.
 */
describe("InputModeSwitch", () => {
  it("라벨이 줄바꿈되지 않고 토글 묶음이 줄어들지 않는다", () => {
    render(<InputModeSwitch value="form" onChange={vi.fn()} />);
    expect(screen.getByTestId("mode-individual-button")).toHaveStyle({
      whiteSpace: "nowrap",
    });
    expect(screen.getByTestId("mode-spreadsheet-button")).toHaveStyle({
      whiteSpace: "nowrap",
    });
    expect(screen.getByTestId("input-mode-switch")).toHaveStyle({
      flexShrink: "0",
    });
  });

  it("글자 라벨을 보여 주고, compact 이면 아이콘만 남긴다", () => {
    const { rerender } = render(
      <InputModeSwitch value="form" onChange={vi.fn()} />,
    );
    expect(screen.getByTestId("mode-individual-button")).toHaveTextContent(
      "개별 폼",
    );
    rerender(<InputModeSwitch value="form" onChange={vi.fn()} compact />);
    expect(screen.getByTestId("mode-individual-button")).not.toHaveTextContent(
      "개별 폼",
    );
  });

  it("다른 모드를 누르면 그 모드로 바꾸고, 같은 모드를 다시 눌러도 비우지 않는다", () => {
    const onChange = vi.fn();
    render(<InputModeSwitch value="form" onChange={onChange} />);
    fireEvent.click(screen.getByTestId("mode-spreadsheet-button"));
    expect(onChange).toHaveBeenCalledWith("spreadsheet");
    fireEvent.click(screen.getByTestId("mode-individual-button"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
