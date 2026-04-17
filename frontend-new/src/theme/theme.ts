import { createTheme } from '@mui/material/styles'

export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: mode === 'dark'
    ? {
      mode: 'dark',
      primary: {
        main: '#37b5c9',
        dark: '#238ca0',
        light: '#67c6d4',
      },
      secondary: {
        main: '#e08f5f',
      },
      success: {
        main: '#39a56f',
      },
      warning: {
        main: '#d39a4c',
      },
      background: {
        default: '#10161f',
        paper: '#1a2330',
      },
      text: {
        primary: '#e6edf5',
        secondary: '#b5c2d0',
      },
    }
    : {
      mode: 'light',
      primary: {
        main: '#127e8f',
        dark: '#0d5c6b',
        light: '#4da3b0',
      },
      secondary: {
        main: '#c4682d',
      },
      success: {
        main: '#2d8f5f',
      },
      warning: {
        main: '#c77d24',
      },
      background: {
        default: '#f7f5ef',
        paper: '#fffdf8',
      },
      text: {
        primary: '#132238',
        secondary: '#526173',
      },
    },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.8rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      lineHeight: 1.65,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  spacing: 8,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: mode === 'dark' ? '1px solid rgba(230, 237, 245, 0.12)' : '1px solid rgba(19, 34, 56, 0.08)',
          boxShadow: mode === 'dark' ? '0 18px 48px rgba(0, 0, 0, 0.4)' : '0 18px 48px rgba(19, 34, 56, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 42,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
          letterSpacing: '0.01em',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: mode === 'dark' ? 'rgba(26, 35, 48, 0.95)' : 'rgba(255, 253, 248, 0.9)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
})
