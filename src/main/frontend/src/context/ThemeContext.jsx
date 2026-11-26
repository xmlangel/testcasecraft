// src/context/ThemeContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  alpha,
} from "@mui/material/styles";
import PropTypes from "prop-types";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Material 3 Tokens (from docs/design/ui_kits/material3/tokens.js)
const M3Tokens = {
  light: {
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EADDFF",
    onPrimaryContainer: "#21005D",
    secondary: "#625B71",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E8DEF8",
    onSecondaryContainer: "#1D192B",
    tertiary: "#7D5260",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFD8E4",
    onTertiaryContainer: "#31111D",
    error: "#B3261E",
    onError: "#FFFFFF",
    errorContainer: "#F9DEDC",
    onErrorContainer: "#8C1D18",
    background: "#FFFBFE",
    onBackground: "#1C1B1F",
    surface: "#FFFBFE",
    onSurface: "#1C1B1F",
    surfaceVariant: "#E7E0EC",
    onSurfaceVariant: "#49454F",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
  },
  dark: {
    primary: "#D0BCFF",
    onPrimary: "#381E72",
    primaryContainer: "#4F378B",
    onPrimaryContainer: "#EADDFF",
    secondary: "#CCC2DC",
    onSecondary: "#332D41",
    secondaryContainer: "#4A4458",
    onSecondaryContainer: "#E8DEF8",
    tertiary: "#EFB8C8",
    onTertiary: "#492532",
    tertiaryContainer: "#633B48",
    onTertiaryContainer: "#FFD8E4",
    error: "#F2B8B5",
    onError: "#601410",
    errorContainer: "#8C1D18",
    onErrorContainer: "#F9DEDC",
    background: "#1C1B1F",
    onBackground: "#E6E1E5",
    surface: "#1C1B1F",
    onSurface: "#E6E1E5",
    surfaceVariant: "#49454F",
    onSurfaceVariant: "#CAC4D0",
    outline: "#938F99",
    outlineVariant: "#49454F",
  },
};

const createMaterial3Theme = (mode) => {
  const colors = M3Tokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        contrastText: colors.onPrimary,
      },
      secondary: {
        main: colors.secondary,
        contrastText: colors.onSecondary,
      },
      error: {
        main: colors.error,
        contrastText: colors.onError,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.onBackground,
        secondary: colors.onSurfaceVariant,
      },
      divider: colors.outlineVariant,
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontSize: "3.5rem", fontWeight: 400 },
      h2: { fontSize: "3rem", fontWeight: 400 },
      h3: { fontSize: "2.5rem", fontWeight: 400 },
      h4: { fontSize: "2rem", fontWeight: 400 },
      h5: { fontSize: "1.5rem", fontWeight: 400 },
      h6: { fontSize: "1.25rem", fontWeight: 500 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 100, // Pill shaped buttons for M3
            textTransform: "none",
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? "#F3EDF7" : "#211F26", // surfaceContainer
            borderRadius: 16,
            boxShadow: "none",
            border: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: "none",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.outlineVariant}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surface,
            color: colors.onSurface,
            boxShadow: "none",
            borderBottom: `1px solid ${colors.outlineVariant}`,
          },
        },
      },
    },
  });
};

// 본문 글꼴. Bricolage Grotesque·JetBrains Mono 에는 한글 글자가 없어서 한글이 OS 기본 글꼴로
// 넘어가 macOS·Windows 에서 다르게 보였다(ICT-509). 한글은 Pretendard 가 받도록 바로 뒤에 둔다.
export const FONT_KO_FALLBACK =
  "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";
export const FONT_BODY = `'Bricolage Grotesque', ${FONT_KO_FALLBACK}`;
// 고정폭은 ID·버전·코드처럼 영숫자만 담는 곳에만 쓴다.
export const FONT_MONO = `'JetBrains Mono', ${FONT_KO_FALLBACK}`;

// 글자·흰 글자 버튼 배경에 쓰는 주 색. 시안 #06B6D4 는 흰 배경에서 글자 대비가 2.3:1 이라
// 기준(4.5:1)에 못 미쳤다(ICT-509). 라이트 모드는 진한 톤을 주 색으로 쓰고, 넓은 면 장식에만 시안을 남긴다.
export const PRIMARY_LIGHT_MODE = {
  main: "#0E7490", // 흰 배경 대비 5.4:1
  light: "#06B6D4",
  dark: "#155E75",
  contrastText: "#FFFFFF",
};
export const PRIMARY_DARK_MODE = {
  main: "#22D3EE", // 어두운 배경 #0F172A 대비 10:1
  light: "#67E8F9",
  dark: "#06B6D4",
  contrastText: "#0F172A",
};

/** 키보드 포커스 링. 라이트·다크 배경 모두에서 3:1 이상 보이는 색을 쓴다. */
export const focusRing = (isLight) => ({
  outline: `2px solid ${isLight ? "#0E7490" : "#67E8F9"}`,
  outlineOffset: 2,
});

// 테스트에서 팔레트·컴포넌트 오버라이드를 직접 확인할 수 있도록 내보낸다
export const createAppTheme = (mode) => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: isLight ? PRIMARY_LIGHT_MODE : PRIMARY_DARK_MODE,
      secondary: {
        main: "#0EA5E9", // Sky
        light: "#38BDF8",
        dark: "#0284C7",
        contrastText: "#FFFFFF",
      },
      background: {
        default: isLight ? "#F8FAFC" : "#0F172A",
        paper: isLight ? "rgba(255, 255, 255, 0.7)" : "rgba(15, 23, 42, 0.7)",
      },
      text: {
        primary: isLight ? "#1E293B" : "#F1F5F9",
        secondary: isLight ? "#64748B" : "#94A3B8",
      },
      success: {
        main: "#10B981",
        light: "#34D399",
        // 라이트 모드 칩·글자에 쓰는 진한 톤. #059669 는 흰 배경 대비 3.8:1 이었다 (ICT-509)
        dark: isLight ? "#047857" : "#059669",
      },
      error: {
        main: "#EF4444",
        light: "#F87171",
        dark: "#DC2626",
      },
      warning: {
        main: "#F59E0B",
        light: "#FBBF24",
        // #D97706 은 흰 배경 대비 3.2:1 이었다 (ICT-509)
        dark: isLight ? "#B45309" : "#D97706",
      },
      info: {
        main: "#3B82F6",
        light: "#60A5FA",
        dark: "#2563EB",
      },
      divider: isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(71, 85, 105, 0.8)",
    },

    typography: {
      fontFamily: FONT_BODY,
      h1: {
        fontFamily: FONT_BODY,
        fontSize: "4.5rem",
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily: FONT_BODY,
        fontSize: "3.75rem",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontFamily: FONT_BODY,
        fontSize: "3rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "0em",
      },
      h4: {
        fontFamily: FONT_BODY,
        fontSize: "2.125rem",
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: "0.01em",
      },
      h5: {
        fontFamily: FONT_BODY,
        fontSize: "1.5rem",
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "0em",
      },
      h6: {
        fontFamily: FONT_BODY,
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
      },
      body1: {
        fontFamily: FONT_BODY,
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: "0.01em",
      },
      body2: {
        fontFamily: FONT_BODY,
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
      },
      caption: {
        fontFamily: FONT_BODY,  // 한글 문장이 들어가므로 본문 글꼴 (ICT-509)
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.02em",
      },
      button: {
        fontFamily: FONT_BODY,
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.75,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      },
      overline: {
        fontFamily: FONT_BODY,  // 한글 문장이 들어가므로 본문 글꼴 (ICT-509)
        fontSize: "0.75rem",
        fontWeight: 500,
        lineHeight: 2,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      },
      subtitle1: {
        fontFamily: FONT_BODY,
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: "0.01em",
      },
      subtitle2: {
        fontFamily: FONT_BODY,
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.57,
        letterSpacing: "0.01em",
      },
    },

    spacing: 8,
    shape: {
      borderRadius: 16,
    },

    shadows: [
      "none",
      "0 4px 16px 0 rgba(6, 182, 212, 0.08), 0 2px 8px 0 rgba(6, 182, 212, 0.04)",
      "0 6px 20px 0 rgba(6, 182, 212, 0.1), 0 3px 10px 0 rgba(6, 182, 212, 0.05)",
      "0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)",
      "0 10px 36px 0 rgba(6, 182, 212, 0.12), 0 4px 12px 0 rgba(6, 182, 212, 0.06)",
      "0 12px 40px 0 rgba(6, 182, 212, 0.15), 0 4px 12px 0 rgba(6, 182, 212, 0.08)",
      "0 12px 40px 0 rgba(6, 182, 212, 0.15), 0 4px 12px 0 rgba(6, 182, 212, 0.08)",
      "0 12px 40px 0 rgba(6, 182, 212, 0.15), 0 4px 12px 0 rgba(6, 182, 212, 0.08)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)",
      "0 20px 56px 0 rgba(6, 182, 212, 0.25), 0 8px 20px 0 rgba(6, 182, 212, 0.12)",
    ],

    components: {
      // 키보드 포커스 표시 (ICT-509). MUI ButtonBase 는 outline 을 0 으로 지워
      // Tab 으로 이동해도 어디에 있는지 보이지 않았다. 마우스 클릭에는 나타나지 않고
      // 키보드 포커스(:focus-visible)에만 2px 링을 그린다.
      MuiCssBaseline: {
        styleOverrides: {
          ":focus-visible": focusRing(isLight),
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": focusRing(isLight),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: isLight
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderRadius: 16,
            border: isLight
              ? "1px solid rgba(255, 255, 255, 0.3)"
              : "1px solid rgba(71, 85, 105, 0.3)",
            boxShadow:
              "0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)",
          },
          elevation1: {
            boxShadow:
              "0 4px 16px 0 rgba(6, 182, 212, 0.08), 0 2px 8px 0 rgba(6, 182, 212, 0.04)",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.05em",
            boxShadow: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 8px 24px 0 rgba(6, 182, 212, 0.2)",
              transform: "translateY(-2px)",
            },
          },
          // 흰 글자가 얹히므로 그라데이션 양 끝 모두 흰 글자 대비 4.5:1 이상인 진한 톤을 쓴다 (ICT-509).
          // 예전 #06B6D4→#0EA5E9 는 흰 글자 대비 2.4~2.8:1 이었다.
          contained: {
            background: isLight
              ? "linear-gradient(135deg, #0E7490 0%, #0369A1 100%)"
              : "linear-gradient(135deg, #22D3EE 0%, #38BDF8 100%)",
            color: isLight ? "#FFFFFF" : "#0F172A",
            "&:hover": {
              background: isLight
                ? "linear-gradient(135deg, #155E75 0%, #075985 100%)"
                : "linear-gradient(135deg, #67E8F9 0%, #7DD3FC 100%)",
            },
          },
          outlined: {
            borderWidth: 2,
            borderColor: isLight ? "#0E7490" : "#22D3EE",
            color: isLight ? "#0E7490" : "#22D3EE",
            background: isLight
              ? "rgba(6, 182, 212, 0.05)"
              : "rgba(6, 182, 212, 0.1)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              borderWidth: 2,
              backgroundColor: isLight
                ? "rgba(6, 182, 212, 0.1)"
                : "rgba(6, 182, 212, 0.15)",
              backdropFilter: "blur(10px)",
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            background: isLight
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: isLight
              ? "1px solid rgba(255, 255, 255, 0.3)"
              : "1px solid rgba(71, 85, 105, 0.3)",
            boxShadow:
              "0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)",
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isLight
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "none",
            borderBottom: isLight
              ? "1px solid rgba(255, 255, 255, 0.3)"
              : "1px solid rgba(71, 85, 105, 0.3)",
            boxShadow: "0 4px 16px 0 rgba(6, 182, 212, 0.08)",
            color: isLight ? "#1E293B" : "#F1F5F9",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 500,
            fontFamily: FONT_BODY,  // 한글 문장이 들어가므로 본문 글꼴 (ICT-509)
            backdropFilter: "blur(10px)",
          },
          // 채움형 칩은 색을 지정하지 않은 것만 시안으로 물들인다.
          // 예전에는 color 와 무관하게 전부 시안이라, 상태를 색으로 구분하는 칩
          // (진행중 primary / 완료 success / 실패 error 등)이 모두 같은 색으로 보였다.
          // 색을 지정한 칩은 그 팔레트 색을 반투명하게 깔아 유리 질감을 유지하면서 구분된다.
          filled: ({ ownerState, theme: chipTheme }) => {
            const chipColor = ownerState?.color;
            if (!chipColor || chipColor === "default") {
              return {
                backgroundColor: "rgba(6, 182, 212, 0.15)",
                // #0891B2 는 이 배경에서 3.2:1 이었다. 진한 톤으로 4.5:1 을 넘긴다 (ICT-509)
                color: isLight ? "#155E75" : "#67E8F9",
              };
            }
            const paletteColor = chipTheme.palette[chipColor];
            if (!paletteColor?.main) return {};
            return {
              backgroundColor: alpha(paletteColor.main, isLight ? 0.18 : 0.32),
              color: isLight ? paletteColor.dark : paletteColor.light,
              border: `1px solid ${alpha(paletteColor.main, isLight ? 0.35 : 0.5)}`,
              "& .MuiChip-icon, & .MuiChip-deleteIcon": {
                color: "inherit",
              },
            };
          },
          // 테두리형 칩의 글자도 라이트 모드에서는 진한 톤을 쓴다 (ICT-509).
          // 기본값은 palette.main 이라 상단 JIRA 배지(success) 글자가 흰 배경 대비 2.4:1 이었다.
          outlined: ({ ownerState, theme: chipTheme }) => {
            const chipColor = ownerState?.color;
            if (!isLight || !chipColor || chipColor === "default") return {};
            const paletteColor = chipTheme.palette[chipColor];
            if (!paletteColor?.dark) return {};
            return { color: paletteColor.dark };
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isLight
              ? "1px solid rgba(226, 232, 240, 0.8)"
              : "1px solid rgba(71, 85, 105, 0.8)",
            fontFamily: FONT_BODY,
          },
          head: {
            fontWeight: 600,
            backgroundColor: "rgba(6, 182, 212, 0.08)",
            color: isLight ? "#1E293B" : "#F1F5F9",
            backdropFilter: "blur(10px)",
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              background: isLight
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(10px)",
              "& fieldset": {
                borderColor: "rgba(6, 182, 212, 0.3)",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: "rgba(6, 182, 212, 0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#06B6D4",
                borderWidth: 2,
              },
            },
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: "2px solid",
            fontWeight: 500,
            backdropFilter: "blur(10px)",
            background: isLight
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(15, 23, 42, 0.6)",
          },
        },
      },

      MuiDialog: {
        defaultProps: {
          slotProps: {
            root: {
              "aria-hidden": undefined,
            },
          },
        },
        styleOverrides: {
          paper: {
            borderRadius: 20,
            background: isLight
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: isLight
              ? "1px solid rgba(255, 255, 255, 0.3)"
              : "1px solid rgba(71, 85, 105, 0.3)",
            boxShadow:
              "0 20px 56px 0 rgba(6, 182, 212, 0.25), 0 8px 20px 0 rgba(6, 182, 212, 0.12)",
          },
        },
      },
    },
  });
};

export const DENSITY_COMFORTABLE = "comfortable";
export const DENSITY_COMPACT = "compact";

/** 저장된 값이 깨졌거나 모르는 값이면 기본값(촘촘)으로 되돌린다. */
export const normalizeDensity = (value) =>
  value === DENSITY_COMFORTABLE ? DENSITY_COMFORTABLE : DENSITY_COMPACT;

/**
 * 화면 밀도(ICT-491).
 *
 * 「기본」은 디자인 시스템 테마를 그대로 쓴다. 「촘촘」은 그 위에 크기만 덮어써
 * 한 화면에 더 많은 내용이 들어오게 한다. 색·모서리 같은 디자인 요소는 건드리지 않는다.
 *  - 입력칸: size small, 테두리 1px (포커스 때도 1px)
 *  - 버튼: 대문자 변환 없음, 마우스를 올려도 위로 뜨지 않음
 *  - 탭: 높이 36px
 */
export const applyDensity = (baseTheme, density) => {
  if (normalizeDensity(density) !== DENSITY_COMPACT) return baseTheme;

  const thinBorder = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderWidth: 1 },
      "&.Mui-focused fieldset": { borderWidth: 1 },
    },
  };

  return createTheme(baseTheme, {
    density: DENSITY_COMPACT,
    typography: {
      button: { textTransform: "none", letterSpacing: "0.01em" },
    },
    components: {
      MuiTextField: {
        defaultProps: { size: "small" },
        styleOverrides: { root: thinBorder },
      },
      MuiFormControl: { defaultProps: { size: "small" } },
      MuiOutlinedInput: {
        defaultProps: { size: "small" },
        styleOverrides: {
          notchedOutline: { borderWidth: 1 },
        },
      },
      MuiAutocomplete: { defaultProps: { size: "small" } },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            letterSpacing: "0.01em",
            "&:hover": { transform: "none" },
          },
        },
      },
      MuiTabs: {
        styleOverrides: { root: { minHeight: 36 } },
      },
      MuiTab: {
        styleOverrides: {
          root: { minHeight: 36, paddingTop: 6, paddingBottom: 6 },
        },
      },
    },
  });
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  const [designSystem, setDesignSystem] = useState(() => {
    const savedSystem = localStorage.getItem("designSystem");
    return savedSystem || "glass";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // 화면 밀도 — 기본값은 촘촘(ICT-491). 「기본」을 고른 사용자는 저장된 값이 유지된다.
  const [density, setDensityState] = useState(() =>
    normalizeDensity(localStorage.getItem("uiDensity")),
  );

  useEffect(() => {
    localStorage.setItem("uiDensity", density);
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  const setDensity = (next) => setDensityState(normalizeDensity(next));

  useEffect(() => {
    localStorage.setItem("designSystem", designSystem);
    document.documentElement.setAttribute("data-design-system", designSystem);
  }, [designSystem]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => {
    const base =
      designSystem === "material3"
        ? createMaterial3Theme(mode)
        : createAppTheme(mode);
    return applyDensity(base, density);
  }, [mode, designSystem, density]);

  const value = {
    mode,
    setMode,
    toggleTheme,
    designSystem,
    setDesignSystem,
    density,
    setDensity,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
