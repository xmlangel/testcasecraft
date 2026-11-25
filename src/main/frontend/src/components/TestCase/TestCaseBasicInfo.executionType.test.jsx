import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TestCaseBasicInfo from "./TestCaseBasicInfo.jsx";

// ICT-493: 예전 값 "Automated" 가 들어온 케이스도 실행 유형 칸이 빈칸이 아니라
// Automation 으로 보이고, Select 범위 밖 값 경고가 나지 않아야 한다.
const theme = createTheme();
const t = (_key, fallback) => fallback;

const renderWith = (testCase) =>
  render(
    <ThemeProvider theme={theme}>
      <TestCaseBasicInfo
        testCase={{ name: "tc", ...testCase }}
        errors={{}}
        availableTags={[]}
        linkedDocuments={[]}
        ragDocuments={[]}
        visibility={{}}
        testCaseInfoOpen
        setTestCaseInfoOpen={() => {}}
        t={t}
        theme={theme}
        onChange={() => () => {}}
        onTestCaseChange={() => {}}
        onTagChange={() => {}}
        onLinkedDocumentsChange={() => {}}
      />
    </ThemeProvider>,
  );

const outOfRangeWarnings = (spy) =>
  spy.mock.calls.filter((args) =>
    args.some((a) => String(a).includes("out-of-range value")),
  );

describe("TestCaseBasicInfo 실행 유형 (ICT-493)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("Automated 를 Automation 으로 보여 주고 범위 밖 경고를 내지 않는다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWith({ executionType: "Automated", isAutomated: true });

    expect(screen.getByDisplayValue("Automation")).toBeInTheDocument();
    expect(outOfRangeWarnings(warn)).toHaveLength(0);
    expect(outOfRangeWarnings(error)).toHaveLength(0);
  });

  it("값이 없으면 isAutomated 로 정한다", () => {
    renderWith({ executionType: undefined, isAutomated: false });

    expect(screen.getByDisplayValue("Manual")).toBeInTheDocument();
  });
});
