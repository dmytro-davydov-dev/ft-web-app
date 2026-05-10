import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeContextProvider, useThemeMode } from './context/ThemeContext';
import { createAppTheme } from './theme';
import App from './App';
import './styles/tokens.css';

/**
 * Inner wrapper reads the theme mode from ThemeContext and feeds the
 * matching MUI theme to ThemeProvider. Separated so the context is
 * available before ThemeProvider consumes it.
 */
function ThemedApp() {
  const { mode } = useThemeMode();
  const muiTheme = createAppTheme(mode);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeContextProvider>
      <ThemedApp />
    </ThemeContextProvider>
  </StrictMode>
);
