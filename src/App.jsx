/**
 * App — router root.
 *
 * Routes:
 *   /login                → LoginPage (public)
 *   /dashboard            → DashboardPage (auth-gated)
 *   /dashboard/:siteId    → SitePage (auth-gated, Phase 2 stub)
 *   /*                    → redirect to /login
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import AppShell         from './components/AppShell';
import LoginPage        from './pages/LoginPage';
import DashboardPage    from './pages/DashboardPage';
import SitePage         from './pages/SitePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — wrapped in AppShell layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path=":siteId" element={<SitePage />} />
          </Route>

          {/* Catch-all → /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
