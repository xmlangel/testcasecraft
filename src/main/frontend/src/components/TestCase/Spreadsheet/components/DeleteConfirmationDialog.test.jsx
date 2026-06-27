import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// useI18n 을 단순 패스스루로 모킹 (fallback 텍스트 반환)
vi.mock("../../../../context/I18nContext", () => ({
  useI18n: () => ({ t: (k, f) => f || k }),
}));

import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog.jsx";

const testTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

const setup = (overrides = {}) => {
  const props = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    items: [
      { id: "tc1", displayId: "TC-1", name: "케이스1", type: "testcase" },
    ],
    ...overrides,
  };
  render(
    <ThemeProvider theme={testTheme}>
      <DeleteConfirmationDialog {...props} />
    </ThemeProvider>,
  );
  return props;
};

describe("DeleteConfirmationDialog", () => {
  it("열린 상태에서 throw 없이 항목 목록을 렌더한다 (import 회귀 가드)", () => {
    setup();
    expect(screen.getByText("삭제 확인")).toBeInTheDocument();
    expect(screen.getByText("TC-1")).toBeInTheDocument();
    expect(screen.getByText("케이스1")).toBeInTheDocument();
  });

  it("삭제·취소 버튼 클릭 시 콜백을 호출한다", async () => {
    const user = userEvent.setup();
    const p = setup();
    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(p.onConfirm).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(p.onClose).toHaveBeenCalled();
  });

  it("폴더가 포함되면 경고 Alert 를 표시한다", () => {
    setup({
      items: [{ id: "f1", displayId: "F-1", name: "폴더1", type: "folder" }],
    });
    expect(
      screen.getByText("폴더를 삭제하면 하위 테스트 케이스도 모두 삭제됩니다."),
    ).toBeInTheDocument();
  });

  it("항목이 없으면 안내 메시지를 보여준다", () => {
    setup({ items: [] });
    expect(screen.getByText("선택된 항목이 없습니다.")).toBeInTheDocument();
  });
});
