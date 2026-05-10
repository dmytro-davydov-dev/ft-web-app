/**
 * ThemeSwitcher — icon button that toggles between light and dark mode.
 * Reads and writes via ThemeContext; renders a sun icon in dark mode
 * and a moon icon in light mode.
 */
import { IconButton, Tooltip } from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { mode, toggle } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
      <IconButton
        onClick={toggle}
        size="small"
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        sx={{ width: 36, height: 36 }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}
