/**
 * DashboardPage — Overview (Phase 2 skeleton).
 *
 * Recharts is imported but not yet wired to data (Phase 4+).
 * All widgets show "Data coming in Phase 4" placeholders.
 */
// Recharts imported — will be wired in Phase 4/5
import { LineChart, BarChart, AreaChart } from 'recharts'; // eslint-disable-line no-unused-vars

import KpiWidget       from '../components/widgets/KpiWidget';
import MapWidget       from '../components/widgets/MapWidget';
import OccupancyWidget from '../components/widgets/OccupancyWidget';
import ActiveTagsWidget from '../components/widgets/ActiveTagsWidget';
import AlertsWidget    from '../components/widgets/AlertsWidget';
import styles          from './DashboardPage.module.css';

export default function DashboardPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Overview</p>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <KpiWidget label="Active tags"    value="—" note="Data coming in Phase 4" />
        <KpiWidget label="People tracked" value="—" note="Data coming in Phase 4" />
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
