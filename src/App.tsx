/**
 * App — router root.
 *
 * Routes:
 *   /login                         → LoginPage (public)
 *   /dashboard                     → DashboardPage (auth-gated)
 *   /dashboard/sites               → SitesPage (auth-gated, Phase 4)
 *   /dashboard/events              → EventsStreamPage (auth-gated, live BQ polling)
 *   /dashboard/geofences           → GeofencesPage (auth-gated, config + alert history)
 *   /dashboard/people              → PeoplePage (auth-gated, people-day report)
 *   /dashboard/tags                → TagsPage (auth-gated, BLE tag registry)
 *   /dashboard/gateways            → GatewaysPage (auth-gated, BLE gateway registry)
 *   /dashboard/reports             → ReportsPage (auth-gated, lazy-loaded + code-split)
 *   /dashboard/occupancy           → OccupancyPage (auth-gated, site occupancy trends)
 *   /dashboard/manage/sites        → ManageSitesPage (auth-gated, create/upload)
 *   /dashboard/manage/people       → ManagePeoplePage (auth-gated, Phase 5 stub)
 *   /dashboard/manage/assets       → ManageAssetsPage (auth-gated, asset tag management)
 *   /dashboard/:siteId             → SitePage (auth-gated, individual site detail stub)
 *   /*                             → redirect to /login
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider }      from './context/AuthContext';
import ProtectedRoute        from './components/ProtectedRoute';
import AppShell              from './components/AppShell';
import LoginPage             from './pages/LoginPage';
import DashboardPage         from './pages/DashboardPage';
import SitesPage             from './pages/SitesPage';
import SitePage              from './pages/SitePage';
import PeoplePage            from './pages/PeoplePage';
import EventsStreamPage      from './pages/EventsStreamPage';
import GeofencesPage         from './pages/GeofencesPage';
import GatewaysPage          from './pages/GatewaysPage';
import TagsPage              from './pages/TagsPage';
import OccupancyPage         from './pages/OccupancyPage';
import ManageSitesPage       from './pages/Manage/ManageSitesPage';
import ManagePeoplePage      from './pages/Manage/ManagePeoplePage';
import ManageAssetsPage      from './pages/Manage/ManageAssetsPage';

// Lazy-load ReportsPage so Recharts is code-split into its own chunk.
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));

function ReportsFallback() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6 }}>
      <CircularProgress size={32} />
    </Box>
  );
}

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
            {/* Named routes must come before the :siteId catch-all */}
            <Route path="sites"      element={<SitesPage />} />
            <Route path="events"     element={<EventsStreamPage />} />
            <Route path="geofences"  element={<GeofencesPage />} />
            <Route path="people"     element={<PeoplePage />} />
            <Route path="tags"       element={<TagsPage />} />
            <Route path="gateways"   element={<GatewaysPage />} />
            <Route
              path="reports"
              element={
                <Suspense fallback={<ReportsFallback />}>
                  <ReportsPage />
                </Suspense>
              }
            />
            <Route path="occupancy"      element={<OccupancyPage />} />
            {/* Manage — must come before :siteId catch-all */}
            <Route path="manage/sites"   element={<ManageSitesPage />} />
            <Route path="manage/people"  element={<ManagePeoplePage />} />
            <Route path="manage/assets"  element={<ManageAssetsPage />} />
            <Route path=":siteId"        element={<SitePage />} />
          </Route>

          {/* Catch-all → /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
