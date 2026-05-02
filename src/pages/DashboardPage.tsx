/**
 * DashboardPage — Overview.
 *
 * KPI row is wired to live BigQuery data via useReport():
 *   - Active tags / People tracked → people-day count of distinct tags today
 *   - Gateways online              → placeholder until /reporting/gateways lands
 *   - Geofence alerts              → alerts count of today's events
 *
 * Also calls /api/v1/me on mount to validate the full auth → JWT → API chain.
 */
import { useEffect, useState } from 'react';
import { apiFetch }      from '../api/client';
import { useReport }     from '../hooks/useReport';
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

interface ReportEnvelope {
  count: number;
}

/** ISO date string for today, e.g. "2026-05-02" */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const todayStr = todayIso();

  // KPI data — both queries keyed to today so BigQuery prunes a single partition.
  const { data: tagsData,   isLoading: tagsLoading   } =
    useReport<ReportEnvelope>('people-day', { from: todayStr, to: todayStr });
  const { data: alertsData, isLoading: alertsLoading } =
    useReport<ReportEnvelope>('alerts',     { from: todayStr, to: todayStr });

  useEffect(() => {
    // Smoke-test the full auth → JWT → API chain on every dashboard load.
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

  const tagCount   = tagsLoading   ? '…' : String(tagsData?.count   ?? '—');
  const alertCount = alertsLoading ? '…' : String(alertsData?.count ?? '—');
  const hasAlerts  = !alertsLoading && (alertsData?.count ?? 0) > 0;

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
        <KpiWidget label="Active tags"     value={tagCount}   />
        <KpiWidget label="People tracked"  value={tagCount}   />
        <KpiWidget label="Gateways online" value="—"          note="Phase 5" />
        <KpiWidget
          label="Geofence alerts"
          value={alertCount}
          accent={hasAlerts ? 'warning' : 'default'}
        />
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
