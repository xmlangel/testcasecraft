import { describe, it, expect } from "vitest";
import {
  createAppTheme,
  applyDensity,
  normalizeDensity,
  DENSITY_COMPACT,
  DENSITY_COMFORTABLE,
} from "./ThemeContext.jsx";

// ICT-491: 촘촘 모드는 크기만 줄이고, 기본 모드는 테마를 그대로 둔다.
describe("화면 밀도", () => {
  it("모르는 값과 빈 값은 촘촘으로 되돌린다", () => {
    expect(normalizeDensity(null)).toBe(DENSITY_COMPACT);
    expect(normalizeDensity("weird")).toBe(DENSITY_COMPACT);
    expect(normalizeDensity(DENSITY_COMFORTABLE)).toBe(DENSITY_COMFORTABLE);
  });

  it("기본 모드는 디자인 시스템 테마를 바꾸지 않는다", () => {
    const base = createAppTheme("light");
    expect(applyDensity(base, DENSITY_COMFORTABLE)).toBe(base);
  });

  it.each(["light", "dark"])("%s 촘촘 모드의 크기 값", (mode) => {
    const theme = applyDensity(createAppTheme(mode), DENSITY_COMPACT);
    const c = theme.components;

    expect(c.MuiTextField.defaultProps.size).toBe("small");
    const outlined =
      c.MuiTextField.styleOverrides.root["& .MuiOutlinedInput-root"];
    expect(outlined["& fieldset"].borderWidth).toBe(1);
    expect(outlined["&.Mui-focused fieldset"].borderWidth).toBe(1);

    expect(c.MuiButton.styleOverrides.root.textTransform).toBe("none");
    expect(c.MuiButton.styleOverrides.root["&:hover"].transform).toBe("none");
    expect(theme.typography.button.textTransform).toBe("none");

    expect(c.MuiTab.styleOverrides.root.minHeight).toBe(36);
    expect(c.MuiTabs.styleOverrides.root.minHeight).toBe(36);
  });

  it("촘촘 모드에서도 색과 칩 오버라이드는 그대로 남는다", () => {
    const base = createAppTheme("light");
    const theme = applyDensity(base, DENSITY_COMPACT);
    expect(theme.palette.primary.main).toBe(base.palette.primary.main);
    expect(typeof theme.components.MuiChip.styleOverrides.filled).toBe(
      "function",
    );
    // 입력칸 배경 같은 기존 값도 지워지지 않는다
    expect(
      theme.components.MuiTextField.styleOverrides.root[
        "& .MuiOutlinedInput-root"
      ].background,
    ).toBe(
      base.components.MuiTextField.styleOverrides.root[
        "& .MuiOutlinedInput-root"
      ].background,
    );
  });
});
