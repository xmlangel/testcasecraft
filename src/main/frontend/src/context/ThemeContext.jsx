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
} from "@mui/material/styles";
import PropTypes from "prop-types";
import "../styles/design-systems/createspace.css";

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

const createAppTheme = (mode) => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#06B6D4", // Cyan
        light: "#22D3EE",
        dark: "#0891B2",
        contrastText: "#FFFFFF",
      },
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
        dark: "#059669",
      },
      error: {
        main: "#EF4444",
        light: "#F87171",
        dark: "#DC2626",
      },
      warning: {
        main: "#F59E0B",
        light: "#FBBF24",
        dark: "#D97706",
      },
      info: {
        main: "#3B82F6",
        light: "#60A5FA",
        dark: "#2563EB",
      },
      divider: isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(71, 85, 105, 0.8)",
    },

    typography: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      h1: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "4.5rem",
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "3.75rem",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "3rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "0em",
      },
      h4: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "2.125rem",
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: "0.01em",
      },
      h5: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "1.5rem",
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "0em",
      },
      h6: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
      },
      body1: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: "0.01em",
      },
      body2: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
      },
      caption: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.02em",
      },
      button: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.75,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      },
      overline: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.75rem",
        fontWeight: 500,
        lineHeight: 2,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      },
      subtitle1: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: "0.01em",
      },
      subtitle2: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
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
          contained: {
            background: "linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)",
            color: "#FFFFFF",
            "&:hover": {
              background: "linear-gradient(135deg, #22D3EE 0%, #38BDF8 100%)",
            },
          },
          outlined: {
            borderWidth: 2,
            borderColor: "#06B6D4",
            color: "#06B6D4",
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
            fontFamily: "'JetBrains Mono', monospace",
            backdropFilter: "blur(10px)",
          },
          filled: {
            backgroundColor: "rgba(6, 182, 212, 0.15)",
            color: "#0891B2",
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isLight
              ? "1px solid rgba(226, 232, 240, 0.8)"
              : "1px solid rgba(71, 85, 105, 0.8)",
            fontFamily: "'Bricolage Grotesque', sans-serif",
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

// CreateSpace Design System
// NOTE: dark mode spec is missing in tokens; light tokens are reused for dark
// (mode is accepted only for palette.mode consistency).
const createCreateSpaceTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#E11D48",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#2563EB",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#16A34A",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: "#D97706",
        contrastText: "#FFFFFF",
      },
      error: {
        main: "#DC2626",
        contrastText: "#FFFFFF",
      },
      info: {
        main: "#2563EB",
        contrastText: "#FFFFFF",
      },
      background: {
        default: "#FFFFFF",
        paper: "#FFFFFF",
      },
      text: {
        primary: "#1F2937",
        secondary: "#6B7280",
        disabled: "#9CA3AF",
      },
      divider: "#E5E7EB",
      action: {
        hover: "#F3F4F6",
        selected: "#FFF1F2",
        disabled: "#9CA3AF",
        disabledBackground: "#F3F4F6",
      },
    },
    typography: {
      fontFamily:
        "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "48px",
        fontWeight: 700,
        lineHeight: 1.1,
      },
      h2: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "32px",
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h3: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "24px",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "20px",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h5: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "18px",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "18px",
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: 1.6,
      },
      caption: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: 1.5,
      },
      button: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: 1.5,
        textTransform: "none",
      },
      overline: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: 1.5,
        textTransform: "uppercase",
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 16,
    },
    shadows: [
      "none",
      "0px 4px 16px rgba(0, 0, 0, 0.1)",
      "0px 4px 16px rgba(0, 0, 0, 0.1)",
      "0px 4px 16px rgba(0, 0, 0, 0.1)",
      "0px 8px 32px rgba(0, 0, 0, 0.08)",
      "0px 8px 32px rgba(0, 0, 0, 0.08)",
      "0px 8px 32px rgba(0, 0, 0, 0.08)",
      "0px 8px 32px rgba(0, 0, 0, 0.08)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
      "0px 12px 40px rgba(0, 0, 0, 0.15)",
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "#FFFFFF",
            color: "#1F2937",
            fontFamily: "'DM Sans', sans-serif",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            transition: "all 150ms ease",
            boxShadow: "none",
            "&.Mui-disabled": {
              opacity: 0.4,
              cursor: "not-allowed",
            },
          },
          contained: {
            backgroundColor: "#E11D48",
            color: "#FFFFFF",
            border: "none",
            "&:hover": {
              backgroundColor: "#E11D48",
              boxShadow: "0px 8px 24px rgba(225, 29, 72, 0.25)",
            },
          },
          containedPrimary: {
            backgroundColor: "#E11D48",
            color: "#FFFFFF",
          },
          containedSecondary: {
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
          },
          containedError: {
            backgroundColor: "#DC2626",
            color: "#FFFFFF",
          },
          outlined: {
            backgroundColor: "transparent",
            color: "#E11D48",
            border: "1.5px solid #E11D48",
            "&:hover": {
              backgroundColor: "rgba(225, 29, 72, 0.04)",
              border: "1.5px solid #E11D48",
            },
          },
          text: {
            backgroundColor: "transparent",
            color: "#E11D48",
          },
          sizeSmall: {
            height: 32,
            padding: "0 14px",
            fontSize: 13,
            minWidth: 72,
          },
          sizeMedium: {
            height: 40,
            padding: "0 20px",
            fontSize: 14,
            minWidth: 100,
          },
          sizeLarge: {
            height: 48,
            padding: "0 28px",
            fontSize: 16,
            minWidth: 140,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
            transition: "transform 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "#FFFFFF",
            backgroundImage: "none",
          },
        },
        variants: [
          {
            props: { variant: "glass" },
            style: {
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
            },
          },
        ],
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontFamily: "'DM Sans', sans-serif",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            height: 40,
            borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            backgroundColor: "#FFFFFF",
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "1.5px",
              borderColor: "#D1D5DB",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9CA3AF",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563EB",
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.35)",
            },
            "&.Mui-error": {
              backgroundColor: "#FEF2F2",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#DC2626",
                boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.2)",
              },
            },
            "&.Mui-disabled": {
              backgroundColor: "#F3F4F6",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E7EB",
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            height: 30,
            borderRadius: 9999,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
          },
          filled: {
            backgroundColor: "#F3F4F6",
            color: "#1F2937",
            border: "1px solid #E5E7EB",
            "&:hover": {
              backgroundColor: "#E5E7EB",
              border: "1px solid #D1D5DB",
            },
          },
          filledPrimary: {
            backgroundColor: "#E11D48",
            color: "#FFFFFF",
            border: "1px solid #E11D48",
          },
          outlined: {
            backgroundColor: "transparent",
            border: "1px solid #E5E7EB",
            color: "#1F2937",
          },
        },
        variants: [
          {
            props: { color: "info" },
            style: {
              backgroundColor: "#DBEAFE",
              color: "#1E40AF",
            },
          },
          {
            props: { color: "success" },
            style: {
              backgroundColor: "#DCFCE7",
              color: "#166534",
            },
          },
          {
            props: { color: "warning" },
            style: {
              backgroundColor: "#FEF3C7",
              color: "#92400E",
            },
          },
          {
            props: { color: "default" },
            style: {
              backgroundColor: "#F3F4F6",
              color: "#6B7280",
            },
          },
        ],
      },
      MuiList: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: 0,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            height: 48,
            padding: "0 16px",
            borderBottom: "1px solid #E5E7EB",
            "&:hover": {
              backgroundColor: "#F3F4F6",
            },
            "&.Mui-selected": {
              backgroundColor: "#FFF1F2",
              "&:hover": {
                backgroundColor: "#FFF1F2",
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 32,
            marginRight: 12,
            "& svg": {
              fontSize: 20,
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            width: 20,
            height: 20,
            borderRadius: 4,
            transition: "all 150ms ease",
            color: "#D1D5DB",
            "&.Mui-checked": {
              color: "#E11D48",
            },
            "&.Mui-disabled": {
              color: "#E5E7EB",
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            width: 20,
            height: 20,
            color: "#D1D5DB",
            "&.Mui-checked": {
              color: "#2563EB",
            },
            "&.Mui-disabled": {
              color: "#E5E7EB",
            },
            "&.Mui-focusVisible": {
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.35)",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#1F2937",
            color: "#FFFFFF",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            padding: "8px 14px",
            borderRadius: 8,
            maxWidth: 240,
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
          },
          arrow: {
            color: "#1F2937",
            fontSize: 6,
          },
        },
        defaultProps: {
          enterDelay: 200,
          leaveDelay: 50,
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
    // Migration mode: new-users-only
    // Only apply "createspace" default when no previous selection exists.
    // Existing users keep their saved choice (e.g. "glass", "material3").
    const savedSystem = localStorage.getItem("designSystem");
    if (savedSystem === null || savedSystem === undefined) {
      return "createspace";
    }
    return savedSystem;
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("designSystem", designSystem);
    document.documentElement.setAttribute("data-design-system", designSystem);
  }, [designSystem]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => {
    if (designSystem === "material3") {
      return createMaterial3Theme(mode);
    }
    if (designSystem === "createspace") {
      return createCreateSpaceTheme(mode);
    }
    return createAppTheme(mode);
  }, [mode, designSystem]);

  const value = {
    mode,
    setMode,
    toggleTheme,
    designSystem,
    setDesignSystem,
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
