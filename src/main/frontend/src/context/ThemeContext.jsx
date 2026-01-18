// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const createAppTheme = (mode) => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
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
        default: isLight ? '#F8FAFC' : '#0F172A',
        paper: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)',
      },
      text: {
        primary: isLight ? '#1E293B' : '#F1F5F9',
        secondary: isLight ? '#64748B' : '#94A3B8',
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
      divider: isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.8)',
    },

    typography: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      h1: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '4.5rem',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '3.75rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '0em',
      },
      h4: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '2.125rem',
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: '0.01em',
      },
      h5: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0em',
      },
      h6: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
      body1: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.01em',
      },
      body2: {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
      caption: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
      },
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

    spacing: 8,
    shape: {
      borderRadius: 16,
    },

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
      '0 20px 56px 0 rgba(6, 182, 212, 0.25), 0 8px 20px 0 rgba(6, 182, 212, 0.12)',
    ],

    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 16,
            border: isLight ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
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
            background: isLight ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.1)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderWidth: 2,
              backgroundColor: isLight ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)',
              backdropFilter: 'blur(10px)',
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: isLight ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1), 0 2px 8px 0 rgba(6, 182, 212, 0.05)',
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: 'none',
            borderBottom: isLight ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 4px 16px 0 rgba(6, 182, 212, 0.08)',
            color: isLight ? '#1E293B' : '#F1F5F9',
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
            borderBottom: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(71, 85, 105, 0.8)',
            fontFamily: "'Bricolage Grotesque', sans-serif",
          },
          head: {
            fontWeight: 600,
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            color: isLight ? '#1E293B' : '#F1F5F9',
            backdropFilter: 'blur(10px)',
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)',
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
            background: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.6)',
          },
        },
      },

      MuiDialog: {
        defaultProps: {
          // 접근성 개선: aria-hidden 경고 방지
          // Dialog가 열릴 때 root 요소에 aria-hidden을 설정하지 않도록 함
          // 마크다운 에디터 등 포커스 가능한 요소와의 충돌 방지
          slotProps: {
            root: {
              // root 요소에 aria-hidden이 설정되는 것을 방지
              // Material-UI는 기본적으로 Modal이 열릴 때 다른 요소들을 숨기기 위해
              // root에 aria-hidden="true"를 설정하는데, 이것이 포커스된 요소와 충돌
              'aria-hidden': undefined,
            },
          },
        },
        styleOverrides: {
          paper: {
            borderRadius: 20,
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: isLight ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 20px 56px 0 rgba(6, 182, 212, 0.25), 0 8px 20px 0 rgba(6, 182, 212, 0.12)',
          },
        },
      },
    },
  });
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = {
    mode,
    setMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
