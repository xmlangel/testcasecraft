import { createTheme } from '@mui/material/styles';

/* ========================================
   RPG Theme - Material-UI Configuration
   Medieval-inspired design with modern typography
   ======================================== */

const theme = createTheme({
  /* ========== Color Palette ========== */
  palette: {
    mode: 'light',
    primary: {
      main: '#8B4513', // Mud
      light: '#A0522D',
      dark: '#5C2E0A',
      contrastText: '#F4E8D0',
    },
    secondary: {
      main: '#DAA520', // Gold
      light: '#FFD700',
      dark: '#B8860B',
      contrastText: '#2C1810',
    },
    background: {
      default: '#F4E8D0', // Parchment
      paper: '#FEFBF3',
    },
    text: {
      primary: '#2C1810', // Ink
      secondary: '#4A3426',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    warning: {
      main: '#F57C00',
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: '#0277BD',
      light: '#03A9F4',
      dark: '#01579B',
    },
    divider: 'rgba(139, 69, 19, 0.12)',
  },

  /* ========== Typography System ========== */
  typography: {
    fontFamily: "'Bricolage Grotesque', sans-serif",

    // Display Typography (Crimson Pro - Medieval Serif)
    h1: {
      fontFamily: "'Crimson Pro', serif",
      fontSize: '4.5rem', // 72px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      fontFeatureSettings: '"liga" 1, "dlig" 1', // Enable ligatures
    },
    h2: {
      fontFamily: "'Crimson Pro', serif",
      fontSize: '3.75rem', // 60px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
      fontFeatureSettings: '"liga" 1, "dlig" 1',
    },
    h3: {
      fontFamily: "'Crimson Pro', serif",
      fontSize: '3rem', // 48px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0em',
      fontFeatureSettings: '"liga" 1',
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
    borderRadius: 6,
  },

  /* ========== Shadows (Dramatic Multi-layer) ========== */
  shadows: [
    'none',
    '0 1px 2px rgba(44, 24, 16, 0.1), 0 2px 4px rgba(44, 24, 16, 0.05)',
    '0 2px 4px rgba(44, 24, 16, 0.12), 0 4px 8px rgba(44, 24, 16, 0.08)',
    '0 4px 6px rgba(44, 24, 16, 0.15), 0 8px 12px rgba(44, 24, 16, 0.1), 0 12px 16px rgba(44, 24, 16, 0.05)',
    '0 6px 10px rgba(44, 24, 16, 0.18), 0 12px 20px rgba(44, 24, 16, 0.12), 0 18px 28px rgba(44, 24, 16, 0.08)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
    '0 10px 20px rgba(44, 24, 16, 0.25), 0 20px 40px rgba(44, 24, 16, 0.15), 0 30px 60px rgba(44, 24, 16, 0.1), 0 40px 80px rgba(44, 24, 16, 0.05)',
  ],

  /* ========== Component Overrides ========== */
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(232, 215, 184, 0.1))',
          borderRadius: 8,
          border: '1px solid rgba(139, 69, 19, 0.15)',
          boxShadow: '0 4px 6px rgba(44, 24, 16, 0.15), 0 8px 12px rgba(44, 24, 16, 0.1), 0 12px 16px rgba(44, 24, 16, 0.05)',
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(44, 24, 16, 0.12), 0 4px 8px rgba(44, 24, 16, 0.08)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
          boxShadow: '0 2px 4px rgba(44, 24, 16, 0.15)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(44, 24, 16, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
          color: '#2C1810',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#8B4513',
          color: '#8B4513',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(139, 69, 19, 0.08)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '2px solid rgba(139, 69, 19, 0.2)',
          boxShadow: '0 4px 6px rgba(44, 24, 16, 0.15), 0 8px 12px rgba(44, 24, 16, 0.1), 0 12px 16px rgba(44, 24, 16, 0.05)',
          backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(232, 215, 184, 0.15))',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #8B4513 0%, #5C2E0A 100%)',
          boxShadow: '0 4px 6px rgba(44, 24, 16, 0.25), 0 8px 12px rgba(44, 24, 16, 0.15)',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontFamily: "'JetBrains Mono', monospace",
        },
        filled: {
          backgroundColor: 'rgba(139, 69, 19, 0.15)',
          color: '#2C1810',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(139, 69, 19, 0.12)',
          fontFamily: "'Bricolage Grotesque', sans-serif",
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(139, 69, 19, 0.08)',
          color: '#2C1810',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(139, 69, 19, 0.3)',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(139, 69, 19, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#DAA520',
              borderWidth: 2,
            },
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '2px solid',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
