/**
 * PeopleDayTable — R4
 * Sortable table of tag-day presence records.
 * Data source: /v1/customers/{id}/reporting/people-day
 *
 * BQ returns: tagId, day, first_seen, last_seen, duration_min
 */
import { useState } from 'react';
import { useReport } from '../../hooks/useReport';
import type { PeopleDayData, PeopleDayRow } from './types';
import type { DateParams } from './ReportsPage';
import styles from './Reports.module.css';

type SortKey = keyof PeopleDayRow;
type SortDir = 'asc' | 'desc';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function PeopleDayTable({ dateParams }: { dateParams: DateParams }) {
  const { data, error, isLoading } = useReport<PeopleDayData>('people-day', dateParams);

  const [sortKey, setSortKey] = useState<SortKey>('day');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = data
    ? [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : [];

  const colHeaders: { key: SortKey; label: string }[] = [
    { key: 'tagId',        label: 'Badge ID'  },
    { key: 'day',          label: 'Date'      },
    { key: 'duration_min', label: 'Duration'  },
    { key: 'first_seen',   label: 'First Seen'},
    { key: 'last_seen',    label: 'Last Seen' },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>People Day</span>
      </div>
      <div className={styles.cardBody} style={{ padding: 0 }}>
        {isLoading && <div className={styles.stateBox}>Loading…</div>}
        {error   && <div className={`${styles.stateBox} ${styles.errorBox}`}>Failed to load people-day data.</div>}
        {data && (
          <table className={styles.table}>
            <thead>
              <tr>
                {colHeaders.map(({ key, label }) => (
                  <th key={key} onClick={() => handleSort(key)}>
                    {label}
                    <span className={styles.sortIcon}>
                      {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={`${row.tagId}-${row.day}`}>
                  <td>{row.tagId}</td>
                  <td>{row.day}</td>
                  <td>{formatDuration(row.duration_min)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(row.first_seen).toLocaleTimeString()}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(row.last_seen).toLocaleTimeString()}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No records for this period.
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
