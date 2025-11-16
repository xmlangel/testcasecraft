import { createTheme } from '@mui/material/styles';

/* ========================================
   Glassmorphism Theme - Material-UI Configuration
   Modern bright design with glass effects
   ======================================== */

const theme = createTheme({
  /* ========== Color Palette ========== */
  palette: {
    mode: 'light',
    primary: {
      main: '#06B6D4', // Cyan
      light: '#22D3EE',
      dark: '#0891B2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0EA5E9', // Sky
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: 'rgba(255, 255, 255, 0.7)',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    divider: 'rgba(226, 232, 240, 0.8)',
  },

  /* ========== Typography System ========== */
  typography: {
    fontFamily: "'Bricolage Grotesque', sans-serif",

    // Display Typography (Bricolage Grotesque)
    h1: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '4.5rem', // 72px
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '3.75rem', // 60px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '3rem', // 48px
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '0em',
    },
    h4: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '2.125rem', // 34px
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: '0.01em',
    },
    h5: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '1.5rem', // 24px (base)
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },

    // Body Typography
    body1: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },

    // Monospace (Code & Data)
    caption: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.02em',
    },

    // UI Elements
    button: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.75,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    overline: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 2,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    subtitle1: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.01em',
    },
  },

  /* ========== Spacing ========== */
  spacing: 8, // Base unit: 8px

  /* ========== Shape & Borders ========== */
  shape: {
    borderRadius: 16,
  },

  /* ========== Shadows (Glass Effect) ========== */
  shadows: [
    'none',
    '0 4px 16px 0 rgba(6, 182, 212, 0.08), 0 2px 8px 0 rgba(6, 182, 212, 0.04)',
    '0 6px 20px 0 rgba(6, 182, 212, 0.1), 0 3px 10px 0 rgba(6, 182, 212, 0.05)',
    '0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)',
    '0 10px 36px 0 rgba(6, 182, 212, 0.12), 0 4px 12px 0 rgba(6, 182, 212, 0.06)',
    '0 12px 40px 0 rgba(6, 182, 212, 0.15), 0 4px 12px 0 rgba(6, 182, 212, 0.08)',
    '0 12px 40px 0 rgba(6, 182, 212, 0.15), 0 4px 12px 0 rgba(6, 182, 212, 0.08)',
    '0 12px 40px 0 rgba(6, 182, 212, 0.15), 0 4px 12px 0 rgba(6, 182, 212, 0.08)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
    '0 16px 48px 0 rgba(6, 182, 212, 0.2), 0 6px 16px 0 rgba(6, 182, 212, 0.1)',
  ],

  /* ========== Component Overrides ========== */
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)',
        },
        elevation1: {
          boxShadow: '0 4px 16px 0 rgba(6, 182, 212, 0.08), 0 2px 8px 0 rgba(6, 182, 212, 0.04)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px 0 rgba(6, 182, 212, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #22D3EE 0%, #38BDF8 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#06B6D4',
          color: '#06B6D4',
          background: 'rgba(6, 182, 212, 0.05)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 16px 0 rgba(6, 182, 212, 0.08)',
          color: '#1E293B',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          fontFamily: "'JetBrains Mono', monospace",
          backdropFilter: 'blur(10px)',
        },
        filled: {
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          color: '#0891B2',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          fontFamily: "'Bricolage Grotesque', sans-serif",
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          color: '#1E293B',
          backdropFilter: 'blur(10px)',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            '& fieldset': {
              borderColor: 'rgba(6, 182, 212, 0.3)',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(6, 182, 212, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#06B6D4',
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
          border: '2px solid',
          fontWeight: 500,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
  },
});

export default theme;
