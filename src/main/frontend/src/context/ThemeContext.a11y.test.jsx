import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { createAppTheme, focusRing } from "./ThemeContext.jsx";

// ICT-509: 주 색 대비·포커스 링·한글 글꼴을 테마에서 확인한다.

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// 반투명 색을 흰 배경 위에 섞은 결과
const overWhite = (hex, alphaValue) =>
  "#" +
  hexToRgb(hex)
    .map((v) => Math.round(v * alphaValue + 255 * (1 - alphaValue)))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");

const WHITE = "#FFFFFF";
const DARK_BG = "#0F172A";
const AA = 4.5;

describe("주 색 대비 (ICT-509)", () => {
  it("라이트 모드 primary.main 은 흰 배경에서 4.5:1 이상이다", () => {
    const theme = createAppTheme("light");
    expect(contrast(theme.palette.primary.main, WHITE)).toBeGreaterThanOrEqual(AA);
  });

  it("다크 모드 primary.main 은 어두운 배경에서 4.5:1 이상이다", () => {
    const theme = createAppTheme("dark");
    expect(contrast(theme.palette.primary.main, DARK_BG)).toBeGreaterThanOrEqual(AA);
  });

  it("라이트 모드 채움 버튼 그라데이션 양 끝은 흰 글자 대비 4.5:1 이상이다", () => {
    const theme = createAppTheme("light");
    const contained = theme.components.MuiButton.styleOverrides.contained;
    const stops = contained.background.match(/#[0-9A-Fa-f]{6}/g);
    expect(stops).toHaveLength(2);
    stops.forEach((stop) =>
      expect(contrast(stop, contained.color)).toBeGreaterThanOrEqual(AA),
    );
  });

  it("라이트 모드 테두리 버튼 글자는 흰 배경에서 4.5:1 이상이다", () => {
    const theme = createAppTheme("light");
    const outlined = theme.components.MuiButton.styleOverrides.outlined;
    expect(contrast(outlined.color, WHITE)).toBeGreaterThanOrEqual(AA);
  });

  it("색을 지정하지 않은 채움 칩 글자는 시안 배경 위에서 4.5:1 이상이다", () => {
    const theme = createAppTheme("light");
    const style = theme.components.MuiChip.styleOverrides.filled({
      ownerState: {},
      theme,
    });
    const bg = overWhite("#06B6D4", 0.15);
    expect(contrast(style.color, bg)).toBeGreaterThanOrEqual(AA);
  });

  it.each(["success", "warning", "error", "info", "primary"])(
    "라이트 모드 테두리 칩(%s) 글자는 흰 배경에서 4.5:1 이상이다",
    (color) => {
      const theme = createAppTheme("light");
      const style = theme.components.MuiChip.styleOverrides.outlined({
        ownerState: { color },
        theme,
      });
      expect(contrast(style.color, WHITE)).toBeGreaterThanOrEqual(AA);
    },
  );

  it("다크 모드 테두리 칩은 기본 색을 그대로 쓴다", () => {
    const theme = createAppTheme("dark");
    const style = theme.components.MuiChip.styleOverrides.outlined({
      ownerState: { color: "success" },
      theme,
    });
    expect(style).toEqual({});
  });
});

describe("키보드 포커스 링 (ICT-509)", () => {
  it.each(["light", "dark"])("%s 모드 ButtonBase 에 포커스 링이 있다", (mode) => {
    const theme = createAppTheme(mode);
    const root = theme.components.MuiButtonBase.styleOverrides.root;
    expect(root["&.Mui-focusVisible"]).toEqual(focusRing(mode === "light"));
    expect(root["&.Mui-focusVisible"].outline).toMatch(/^2px solid #/);
  });

  it("전역 :focus-visible 에도 같은 링을 건다", () => {
    const theme = createAppTheme("light");
    expect(
      theme.components.MuiCssBaseline.styleOverrides[":focus-visible"],
    ).toEqual(focusRing(true));
  });

  it("포커스 링 색은 각 배경에서 3:1 이상 보인다", () => {
    const light = focusRing(true).outline.match(/#[0-9A-Fa-f]{6}/)[0];
    const dark = focusRing(false).outline.match(/#[0-9A-Fa-f]{6}/)[0];
    expect(contrast(light, WHITE)).toBeGreaterThanOrEqual(3);
    expect(contrast(dark, DARK_BG)).toBeGreaterThanOrEqual(3);
  });
});

describe("한글 글꼴 (ICT-509)", () => {
  const theme = createAppTheme("light");

  it.each(["fontFamily", "body1", "body2", "button", "caption", "overline", "h5"])(
    "typography.%s 는 Pretendard 를 한글 대체 글꼴로 둔다",
    (key) => {
      const family =
        key === "fontFamily"
          ? theme.typography.fontFamily
          : theme.typography[key].fontFamily;
      expect(family).toMatch(/Pretendard/);
    },
  );

  it("한글 문장이 들어가는 caption·overline·칩은 고정폭 글꼴을 쓰지 않는다", () => {
    expect(theme.typography.caption.fontFamily).not.toMatch(/JetBrains Mono/);
    expect(theme.typography.overline.fontFamily).not.toMatch(/JetBrains Mono/);
    expect(
      theme.components.MuiChip.styleOverrides.root.fontFamily,
    ).not.toMatch(/JetBrains Mono/);
  });

  it("칩을 렌더하면 Pretendard 가 포함된 글꼴로 그린다", () => {
    render(
      <MuiThemeProvider theme={theme}>
        <Chip label="최종 업데이트" />
      </MuiThemeProvider>,
    );
    const chip = screen.getByText("최종 업데이트").closest(".MuiChip-root");
    expect(getComputedStyle(chip).fontFamily).toMatch(/Pretendard/);
  });
});

describe("보조 색·아바타 대비 (ICT-509 재측정 후속)", () => {
  it("라이트 모드 secondary.main·dark 는 흰 배경에서 4.5:1 이상이다", () => {
    const theme = createAppTheme("light");
    expect(contrast(theme.palette.secondary.main, WHITE)).toBeGreaterThanOrEqual(AA);
    expect(contrast(theme.palette.secondary.dark, WHITE)).toBeGreaterThanOrEqual(AA);
  });

  it("다크 모드 secondary.main 은 어두운 배경에서 4.5:1 이상이다", () => {
    const theme = createAppTheme("dark");
    expect(contrast(theme.palette.secondary.main, DARK_BG)).toBeGreaterThanOrEqual(AA);
  });

  it.each(["light", "dark"])("%s 모드 기본 아바타 글자는 바탕 대비 4.5:1 이상이다", (mode) => {
    const theme = createAppTheme(mode);
    const { backgroundColor, color } =
      theme.components.MuiAvatar.styleOverrides.colorDefault;
    expect(contrast(color, backgroundColor)).toBeGreaterThanOrEqual(AA);
  });
});
