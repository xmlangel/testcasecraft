import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// useI18n 을 fallback 텍스트 패스스루로 모킹
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key, fallback, params) => {
      let s = fallback || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          s = s.replace(`{${k}}`, String(v));
        });
      }
      return s;
    },
  }),
}));

import TestCaseBulkOperations from "./TestCaseBulkOperations.jsx";

const theme = createTheme({
  components: { MuiButtonBase: { defaultProps: { disableRipple: true } } },
});

const setup = (overrides = {}) => {
  const props = {
    selectedTestCases: [
      { id: "tc1", name: "로그인 테스트" },
      { id: "tc2", name: "로그아웃 테스트" },
    ],
    projects: [
      { id: "projB", name: "프로젝트 B" },
      { id: "projC", name: "프로젝트 C" },
    ],
    onBulkUpdate: vi.fn(),
    onBulkDelete: vi.fn(),
    onBulkMove: vi.fn().mockResolvedValue({}),
    onBulkCopy: vi.fn().mockResolvedValue({}),
    onClose: vi.fn(),
    loadProjectFolders: vi
      .fn()
      .mockResolvedValue([{ id: "fA", name: "폴더 A", projectId: "projB" }]),
    ...overrides,
  };
  render(
    <ThemeProvider theme={theme}>
      <TestCaseBulkOperations {...props} />
    </ThemeProvider>,
  );
  return props;
};

// MUI Select 열기 + 옵션 선택 헬퍼
const chooseOption = async (user, combobox, optionName) => {
  await user.click(combobox);
  const option = await screen.findByRole("option", { name: optionName });
  await user.click(option);
};

describe("TestCaseBulkOperations (프로젝트 간 이동/복사)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("선택 항목 수와 작업 유형 선택기를 렌더한다 (import 회귀 가드)", () => {
    setup();
    expect(screen.getByText("선택된 항목: 2개")).toBeInTheDocument();
    expect(screen.getByText("로그인 테스트")).toBeInTheDocument();
  });

  it("이동: 대상 프로젝트 선택 시 폴더를 로드하고, 실행하면 onBulkMove 가 호출된다", async () => {
    const user = userEvent.setup();
    const props = setup();

    // 작업 유형 = 이동
    const comboboxes = screen.getAllByRole("combobox");
    await chooseOption(user, comboboxes[0], "이동");

    // 대상 프로젝트 = 프로젝트 B
    const afterCbx = screen.getAllByRole("combobox");
    await chooseOption(user, afterCbx[1], "프로젝트 B");

    // 대상 프로젝트의 폴더 온디맨드 로드 확인
    await waitFor(() =>
      expect(props.loadProjectFolders).toHaveBeenCalledWith("projB"),
    );

    // 실행
    await user.click(screen.getByRole("button", { name: "실행" }));

    await waitFor(() => expect(props.onBulkMove).toHaveBeenCalledTimes(1));
    const [selected, targetProjectId] = props.onBulkMove.mock.calls[0];
    expect(selected).toHaveLength(2);
    expect(targetProjectId).toBe("projB");
    expect(props.onBulkCopy).not.toHaveBeenCalled();
  });

  it("복사: 실행하면 onBulkCopy 가 대상 프로젝트와 함께 호출된다", async () => {
    const user = userEvent.setup();
    const props = setup();

    const comboboxes = screen.getAllByRole("combobox");
    await chooseOption(user, comboboxes[0], "복사");

    const afterCbx = screen.getAllByRole("combobox");
    await chooseOption(user, afterCbx[1], "프로젝트 C");

    await user.click(screen.getByRole("button", { name: "실행" }));

    await waitFor(() => expect(props.onBulkCopy).toHaveBeenCalledTimes(1));
    expect(props.onBulkCopy.mock.calls[0][1]).toBe("projC");
    expect(props.onBulkMove).not.toHaveBeenCalled();
  });

  it("대상 프로젝트 미선택 시 검증 오류를 보여준다", async () => {
    const user = userEvent.setup();
    const props = setup();

    const comboboxes = screen.getAllByRole("combobox");
    await chooseOption(user, comboboxes[0], "이동");

    await user.click(screen.getByRole("button", { name: "실행" }));

    expect(
      screen.getByText("대상 프로젝트를 선택해주세요."),
    ).toBeInTheDocument();
    expect(props.onBulkMove).not.toHaveBeenCalled();
  });
});
