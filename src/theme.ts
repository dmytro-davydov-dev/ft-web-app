/**
 * Flowterra MUI Theme
 * Maps design tokens from src/styles/tokens.css into a MUI v6 dark theme.
 */
import { createTheme } from '@mui/material/styles';

// ── Flowterra palette constants ──────────────────────────────────────────────
const BG_PRIMARY    = '#080c14';
const BG_SURFACE    = '#0b1120';
const BG_CARD       = '#0f1629';
const BORDER_SUBTLE = 'rgba(255, 255, 255, 0.08)';
const BORDER_STRONG = 'rgba(255, 255, 255, 0.14)';

const TEXT_PRIMARY   = '#e2e8f0';
const TEXT_SECONDARY = '#94a3b8';
const TEXT_MUTED     = '#475569';

const ACCENT_CYAN   = '#00d4ff';
const ACCENT_PURPLE = '#7c3aed';

const COLOR_POSITIVE = '#4ade80';
const COLOR_NEGATIVE = '#f87171';
const COLOR_WARNING  = '#fbbf24';

// ── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main:        ACCENT_CYAN,
      light:       '#33ddff',
      dark:        '#00a3cc',
      contrastText: '#041018',
    },
    secondary: {
      main:        ACCENT_PURPLE,
      light:       '#9d5cf0',
      dark:        '#5b26b5',
      contrastText: '#ffffff',
    },
    background: {
      default: BG_PRIMARY,
      paper:   BG_CARD,
    },
    text: {
      primary:   TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
      disabled:  TEXT_MUTED,
    },
    success: { main: COLOR_POSITIVE },
    error:   { main: COLOR_NEGATIVE },
    warning: { main: COLOR_WARNING  },
    divider: BORDER_SUBTLE,
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 700, fontSize: '2rem',    lineHeight: '2.5rem',  letterSpacing: '-0.01em' },
    h2: { fontWeight: 700, fontSize: '1.5rem',  lineHeight: '2rem',    letterSpacing: '-0.01em' },
    h3: { fontWeight: 700, fontSize: '1.25rem', lineHeight: '1.75rem', letterSpacing: '-0.005em' },
    body1: { fontSize: '1rem',    lineHeight: '1.625rem' },
    body2: { fontSize: '0.875rem', lineHeight: '1.375rem' },
    caption: { fontSize: '0.75rem', lineHeight: '1.125rem' },
    overline: {
      fontSize: '0.75rem',
      lineHeight: '1.125rem',
      letterSpacing: '0.1em',
      fontWeight: 700,
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 700,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    // ── CssBaseline ──────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: {
          height: '100%',
          backgroundColor: BG_PRIMARY,
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
        },
        '#root': { height: '100%' },
        a: { color: ACCENT_CYAN, textDecoration: 'none' },
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
        },
      },
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 12,
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
      },
    },

    // ── Drawer (sidebar) ─────────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_SURFACE,
          borderRight: `1px solid ${BORDER_SUBTLE}`,
          backgroundImage: 'none',
        },
      },
    },

    // ── AppBar (topbar) ──────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: BG_SURFACE,
          backgroundImage: 'none',
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
          boxShadow: 'none',
        },
      },
    },

    // ── ListItemButton (nav items) ────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 40,
          color: TEXT_SECONDARY,
          '&:hover': {
            backgroundColor: BG_CARD,
            color: TEXT_PRIMARY,
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 212, 255, 0.10)',
            color: ACCENT_CYAN,
            '&:hover': {
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: ACCENT_CYAN,
            },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 32,
          color: 'inherit',
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: '1.375rem',
        },
      },
    },

    // ── Button ────────────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
        },
        containedPrimary: {
          backgroundColor: ACCENT_CYAN,
          color: '#041018',
          '&:hover': { backgroundColor: '#33ddff' },
          '&:disabled': { opacity: 0.6 },
        },
      },
    },

    // ── TextField / OutlinedInput ─────────────────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: BG_SURFACE,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: BORDER_STRONG,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: BORDER_STRONG,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: ACCENT_CYAN,
          },
        },
        input: {
          color: TEXT_PRIMARY,
          '&::placeholder': { color: TEXT_MUTED, opacity: 1 },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: TEXT_SECONDARY,
          '&.Mui-focused': { color: ACCENT_CYAN },
        },
      },
    },

    // ── Tabs ─────────────────────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
          minHeight: 44,
        },
        indicator: {
          backgroundColor: ACCENT_CYAN,
          height: 2,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 44,
          color: TEXT_SECONDARY,
          '&.Mui-selected': {
            color: ACCENT_CYAN,
            fontWeight: 700,
          },
        },
      },
    },

    // ── Table ─────────────────────────────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: BG_SURFACE,
            color: TEXT_MUTED,
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${BORDER_SUBTLE}`,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
          color: TEXT_SECONDARY,
          fontSize: '0.875rem',
          padding: '10px 16px',
        },
        body: {
          color: TEXT_SECONDARY,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
          '&:last-child td': { border: 0 },
        },
      },
    },

    // ── Chip ─────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: BORDER_SUBTLE },
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: BG_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
          color: TEXT_PRIMARY,
          fontSize: '0.75rem',
        },
      },
    },

    // ── Alert ─────────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

// Export palette colors for use in Recharts (which doesn't read MUI theme)
export const CHART_COLORS = {
  cyan:     ACCENT_CYAN,
  purple:   ACCENT_PURPLE,
  positive: COLOR_POSITIVE,
  warning:  COLOR_WARNING,
  negative: COLOR_NEGATIVE,
  bgCard:   BG_CARD,
  bgSurface: BG_SURFACE,
  textMuted:     TEXT_MUTED,
  textSecondary: TEXT_SECONDARY,
  borderSubtle:  BORDER_SUBTLE,
};

export default theme;
