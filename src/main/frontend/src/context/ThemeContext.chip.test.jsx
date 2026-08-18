import { describe, it, expect } from "vitest";
import { createAppTheme } from "./ThemeContext.jsx";

// Modern Glass 테마에서 상태 칩이 색으로 구분되는지 확인한다.
// 예전에는 채움형 칩 전부에 시안 배경이 박혀 있어 진행중·완료·실패가 같은 색으로 보였다.
describe("Modern Glass 테마의 채움형 칩 색", () => {
  const backgroundFor = (mode, color) => {
    const theme = createAppTheme(mode);
    const filled = theme.components.MuiChip.styleOverrides.filled;
    return filled({ ownerState: { color }, theme }).backgroundColor;
  };

  it.each(["light", "dark"])(
    "%s 모드에서 상태별 배경색이 서로 다르다",
    (mode) => {
      const backgrounds = [
        backgroundFor(mode, "default"),
        backgroundFor(mode, "primary"),
        backgroundFor(mode, "success"),
        backgroundFor(mode, "error"),
        backgroundFor(mode, "warning"),
      ];
      backgrounds.forEach((bg) => expect(bg).toBeTruthy());
      expect(new Set(backgrounds).size).toBe(backgrounds.length);
    },
  );

  it("색을 지정하지 않은 칩은 시안 배경을 유지한다", () => {
    expect(backgroundFor("light", "default")).toBe("rgba(6, 182, 212, 0.15)");
    expect(backgroundFor("light", undefined)).toBe("rgba(6, 182, 212, 0.15)");
  });

  it("아이콘 색은 라벨 색을 따른다", () => {
    const theme = createAppTheme("light");
    const style = theme.components.MuiChip.styleOverrides.filled({
      ownerState: { color: "success" },
      theme,
    });
    expect(style["& .MuiChip-icon, & .MuiChip-deleteIcon"].color).toBe(
      "inherit",
    );
  });
});
