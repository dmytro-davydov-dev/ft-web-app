/**
 * Flowterra MUI Theme
 *
 * createAppTheme(mode) returns a full MUI theme for 'dark' or 'light'.
 * Palette values mirror the CSS tokens in src/styles/tokens.css so both
 * MUI components and plain CSS modules stay in sync.
 */
import { createTheme } from '@mui/material/styles';
import type { ThemeMode } from './context/ThemeContext';

// ── Dark palette ─────────────────────────────────────────────────────────────
const DARK = {
  bgPrimary:    '#080c14',
  bgSurface:    '#0b1120',
  bgCard:       '#0f1629',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  textPrimary:   '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted:     '#475569',
  accent:        '#00d4ff',
  accentPurple:  '#7c3aed',
  positive:      '#4ade80',
  negative:      '#f87171',
  warning:       '#fbbf24',
  navSelected:      'rgba(0, 212, 255, 0.10)',
  navSelectedHover: 'rgba(0, 212, 255, 0.15)',
};

// ── Light palette (Option A — White & Blue) ──────────────────────────────────
const LIGHT = {
  bgPrimary:    '#f0f4f8',
  bgSurface:    '#ffffff',
  bgCard:       '#ffffff',
  borderSubtle: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.16)',
  textPrimary:   '#111827',
  textSecondary: '#4b5563',
  textMuted:     '#9ca3af',
  accent:        '#2563eb',
  accentPurple:  '#7c3aed',
  positive:      '#16a34a',
  negative:      '#dc2626',
  warning:       '#d97706',
  navSelected:      'rgba(37, 99, 235, 0.08)',
  navSelectedHover: 'rgba(37, 99, 235, 0.13)',
};

export function createAppTheme(mode: ThemeMode) {
  const p = mode === 'light' ? LIGHT : DARK;

  return createTheme({
    palette: {
      mode,
      primary: {
        main:        p.accent,
        light:       mode === 'light' ? '#3b82f6' : '#33ddff',
        dark:        mode === 'light' ? '#1d4ed8' : '#00a3cc',
        contrastText: mode === 'light' ? '#ffffff' : '#041018',
      },
      secondary: {
        main:        p.accentPurple,
        light:       '#9d5cf0',
        dark:        '#5b26b5',
        contrastText: '#ffffff',
      },
      background: {
        default: p.bgPrimary,
        paper:   p.bgCard,
      },
      text: {
        primary:   p.textPrimary,
        secondary: p.textSecondary,
        disabled:  p.textMuted,
      },
      success: { main: p.positive },
      error:   { main: p.negative },
      warning: { main: p.warning  },
      divider: p.borderSubtle,
    },

    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      h1: { fontWeight: 700, fontSize: '2rem',    lineHeight: '2.5rem',  letterSpacing: '-0.01em' },
      h2: { fontWeight: 700, fontSize: '1.5rem',  lineHeight: '2rem',    letterSpacing: '-0.01em' },
      h3: { fontWeight: 700, fontSize: '1.25rem', lineHeight: '1.75rem', letterSpacing: '-0.005em' },
      body1:   { fontSize: '1rem',     lineHeight: '1.625rem' },
      body2:   { fontSize: '0.875rem', lineHeight: '1.375rem' },
      caption: { fontSize: '0.75rem',  lineHeight: '1.125rem' },
      overline: {
        fontSize: '0.75rem',
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        fontWeight: 700,
        textTransform: 'uppercase',
      },
      button: { fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.02em' },
    },

    shape: { borderRadius: 8 },

    components: {
      // ── CssBaseline ──────────────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          html: { height: '100%' },
          body: {
            height: '100%',
            backgroundColor: p.bgPrimary,
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility',
          },
          '#root': { height: '100%' },
          a: { color: p.accent, textDecoration: 'none' },
        },
      },

      // ── Paper ────────────────────────────────────────────────────────────────
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: p.bgCard,
            border: `1px solid ${p.borderSubtle}`,
          },
        },
      },

      // ── Card ─────────────────────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: p.bgCard,
            border: `1px solid ${p.borderSubtle}`,
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
            backgroundColor: p.bgSurface,
            borderRight: `1px solid ${p.borderSubtle}`,
            backgroundImage: 'none',
          },
        },
      },

      // ── AppBar (topbar) ──────────────────────────────────────────────────────
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: p.bgSurface,
            backgroundImage: 'none',
            borderBottom: `1px solid ${p.borderSubtle}`,
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
            color: p.textSecondary,
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.04)' : p.bgCard,
              color: p.textPrimary,
            },
            '&.Mui-selected': {
              backgroundColor: p.navSelected,
              color: p.accent,
              '&:hover': {
                backgroundColor: p.navSelectedHover,
                color: p.accent,
              },
            },
          },
        },
      },

      MuiListItemIcon: {
        styleOverrides: { root: { minWidth: 32, color: 'inherit' } },
      },

      MuiListItemText: {
        styleOverrides: {
          primary: { fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.375rem' },
        },
      },

      // ── Button ────────────────────────────────────────────────────────────────
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: 'none', fontWeight: 700 },
          containedPrimary: {
            backgroundColor: p.accent,
            color: mode === 'light' ? '#ffffff' : '#041018',
            '&:hover': { backgroundColor: mode === 'light' ? '#1d4ed8' : '#33ddff' },
            '&:disabled': { opacity: 0.6 },
          },
        },
      },

      // ── TextField / OutlinedInput ─────────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: p.bgSurface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: p.borderStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: p.borderStrong },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: p.accent },
          },
          input: {
            color: p.textPrimary,
            '&::placeholder': { color: p.textMuted, opacity: 1 },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: { color: p.textSecondary, '&.Mui-focused': { color: p.accent } },
        },
      },

      // ── IconButton ────────────────────────────────────────────────────────────
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: p.textSecondary,
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
              color: p.textPrimary,
            },
          },
        },
      },

      // ── Tabs ─────────────────────────────────────────────────────────────────
      MuiTabs: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${p.borderSubtle}`, minHeight: 44 },
          indicator: { backgroundColor: p.accent, height: 2 },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 44,
            color: p.textSecondary,
            '&.Mui-selected': { color: p.accent, fontWeight: 700 },
          },
        },
      },

      // ── Table ─────────────────────────────────────────────────────────────────
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: p.bgSurface,
              color: p.textMuted,
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: `1px solid ${p.borderSubtle}`,
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${p.borderSubtle}`,
            color: p.textSecondary,
            fontSize: '0.875rem',
            padding: '10px 16px',
          },
          body: { color: p.textSecondary },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(0,0,0,0.02)'
                : 'rgba(255,255,255,0.02)',
            },
            '&:last-child td': { border: 0 },
          },
        },
      },

      // ── Chip ─────────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' },
        },
      },

      // ── Divider ───────────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: { root: { borderColor: p.borderSubtle } },
      },

      // ── Tooltip ───────────────────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: p.bgCard,
            border: `1px solid ${p.borderSubtle}`,
            color: p.textPrimary,
            fontSize: '0.75rem',
          },
        },
      },

      // ── Alert ─────────────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 8 } },
      },

      // ── ToggleButtonGroup (time-filter pill) ──────────────────────────────────
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: p.bgCard,
            border: `1px solid ${p.borderSubtle}`,
          },
        },
      },

      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: p.textSecondary,
            border: 0,
            '&.Mui-selected': {
              backgroundColor: p.bgSurface,
              color: p.textPrimary,
              '&:hover': { backgroundColor: p.bgSurface },
            },
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(0,0,0,0.04)'
                : 'rgba(255,255,255,0.04)',
            },
          },
        },
      },
    },
  });
}

// Convenience singletons
export const darkTheme  = createAppTheme('dark');
export const lightTheme = createAppTheme('light');

/** Chart colors for Recharts (doesn't read MUI theme directly) */
export function getChartColors(mode: ThemeMode) {
  const p = mode === 'light' ? LIGHT : DARK;
  return {
    accent:        p.accent,
    purple:        p.accentPurple,
    positive:      p.positive,
    warning:       p.warning,
    negative:      p.negative,
    bgCard:        p.bgCard,
    bgSurface:     p.bgSurface,
    textMuted:     p.textMuted,
    textSecondary: p.textSecondary,
    borderSubtle:  p.borderSubtle,
  };
}

// Legacy aliases kept for any file still importing these names
export default darkTheme;
/** @deprecated Use getChartColors(mode) */
export const CHART_COLORS = getChartColors('dark');
