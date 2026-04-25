/**
 * DashboardPage — Overview (Phase 2 skeleton).
 *
 * On mount, calls /api/v1/me to validate the full auth → JWT → API chain.
 * An error banner surfaces if the API is unreachable or returns a non-2xx.
 *
 * Recharts chart components are imported but not yet wired to data (Phase 4+).
 * All widgets show "Data coming in Phase 4" placeholders.
 */
// TODO(Phase 4): wire LineChart, BarChart, AreaChart to live data
// import { LineChart, BarChart, AreaChart } from 'recharts';

import { useEffect, useState } from 'react';
import { apiFetch }      from '../api/client';
import KpiWidget        from '../components/widgets/KpiWidget';
import MapWidget        from '../components/widgets/MapWidget';
import OccupancyWidget  from '../components/widgets/OccupancyWidget';
import ActiveTagsWidget from '../components/widgets/ActiveTagsWidget';
import AlertsWidget     from '../components/widgets/AlertsWidget';
import styles           from './DashboardPage.module.css';

interface MeResponse {
  uid: string;
  customerId: string;
}

export default function DashboardPage() {
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Smoke-test the full auth → JWT → API chain on every dashboard load.
    // On success the response is not rendered (Phase 3 will use it).
    apiFetch('/api/v1/me')
      .then((res) => {
        if (!res.ok) throw new Error(`/api/v1/me returned ${res.status}`);
        return res.json() as Promise<MeResponse>;
      })
      .then(() => setApiError(null))
      .catch((err: unknown) => {
        setApiError((err as Error).message ?? 'API unreachable');
      });
  }, []);

  return (
    <>
      {apiError && (
        <div className={styles.apiError} role="alert">
          API error: {apiError}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Overview</p>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <KpiWidget label="Active tags"     value="—" note="Data coming in Phase 4" />
        <KpiWidget label="People tracked"  value="—" note="Data coming in Phase 4" />
        <KpiWidget label="Gateways online" value="—" note="Data coming in Phase 4" />
        <KpiWidget label="Geofence alerts" value="—" note="Data coming in Phase 4" accent="warning" />
      </div>

      {/* Map + alerts */}
      <div className={styles.row}>
        <MapWidget />
        <AlertsWidget />
      </div>

      {/* Charts */}
      <div className={styles.row}>
        <OccupancyWidget />
        <ActiveTagsWidget />
      </div>
    </>
  );
}
