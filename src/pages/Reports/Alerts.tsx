/**
 * AlertsTable — R5
 * Data table with event-type and severity badges.
 * Data source: /v1/customers/{id}/reporting/alerts
 */
import { useReport } from '../../hooks/useReport';
import type { AlertsData, AlertSeverity } from './types';
import styles from './Reports.module.css';

function severityClass(s: AlertSeverity): string {
  if (s === 'critical') return styles.badgeCritical;
  if (s === 'warning')  return styles.badgeWarning;
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

export default function AlertsTable() {
  const { data, error, isLoading } = useReport<AlertsData>('alerts');

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
                <th>Severity</th>
                <th>Event</th>
                <th>Area</th>
                <th>Person</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(row.timestamp)}</td>
                  <td>
                    <span className={`${styles.badge} ${severityClass(row.severity)}`}>
                      {row.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeInfo}`}>
                      {row.eventType}
                    </span>
                  </td>
                  <td>{row.areaName}</td>
                  <td>{row.personName ?? '—'}</td>
                  <td>{row.message}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
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
