/**
 * AlertsTable — R5
 * Data table showing geofence alert history.
 * Data source: /v1/customers/{id}/reporting/alerts
 *
 * BQ returns: geofenceId, tagId, event, ts
 */
import { useReport } from '../../hooks/useReport';
import type { AlertsData } from './types';
import type { DateParams } from './ReportsPage';
import styles from './Reports.module.css';

function eventBadgeClass(event: string): string {
  if (event === 'enter') return styles.badgeInfo;
  if (event === 'exit')  return styles.badgeWarning;
  return styles.badgeInfo;
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return ts;
  }
}

export default function AlertsTable({ dateParams }: { dateParams: DateParams }) {
  const { data, error, isLoading } = useReport<AlertsData>('alerts', dateParams);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Alerts</span>
      </div>
      <div className={styles.cardBody} style={{ padding: 0 }}>
        {isLoading && <div className={styles.stateBox}>Loading…</div>}
        {error   && <div className={`${styles.stateBox} ${styles.errorBox}`}>Failed to load alerts data.</div>}
        {data && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Geofence</th>
                <th>Badge ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={`${row.geofenceId}-${row.tagId}-${row.ts}-${i}`}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(row.ts)}</td>
                  <td>
                    <span className={`${styles.badge} ${eventBadgeClass(row.event)}`}>
                      {row.event}
                    </span>
                  </td>
                  <td>{row.geofenceId}</td>
                  <td>{row.tagId}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No alerts for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
