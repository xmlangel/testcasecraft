import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "../context/ThemeContext.jsx";
import TestResultStatisticsCard from "./TestResultStatisticsCard.jsx";

vi.mock("../context/I18nContext", () => ({
  useTranslation: () => ({
    t: (key, def) => (typeof def === "string" ? def : key),
  }),
}));
// 숫자 애니메이션 없이 최종 값을 바로 그린다
vi.mock("react-countup", () => ({
  default: ({ end, suffix = "" }) => <span>{`${end}${suffix}`}</span>,
}));

// ICT-509: 성공률 0% 를 성공 색(녹색) 큰 글자로 보이지 않는다.
describe("TestResultStatisticsCard 성공률 숫자 색", () => {
  it("성공률 숫자는 성공 색이 아니라 본문 색으로 그린다", () => {
    const theme = createAppTheme("light");
    render(
      <ThemeProvider theme={theme}>
        <TestResultStatisticsCard
          statistics={{
            totalCount: 775,
            passCount: 0,
            failCount: 0,
            blockedCount: 0,
            notRunCount: 775,
            passRate: 0,
            latestSuccessRate: 0,
            isLatestMode: true,
          }}
        />
      </ThemeProvider>,
    );
    const rate = screen.getAllByText("0%")[0].closest("h5");
    expect(rate).not.toBeNull();
    const color = getComputedStyle(rate).color;
    expect(color).not.toBe("rgb(16, 185, 129)");
    expect(color).toBe("rgb(30, 41, 59)"); // text.primary #1E293B
  });
});
