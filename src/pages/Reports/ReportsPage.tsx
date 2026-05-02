/**
 * ReportsPage — container for all 5 report charts/tables.
 *
 * This file is lazy-loaded from App.tsx (React.lazy), which causes Vite to
 * code-split it into its own chunk — Recharts is pulled into that chunk only,
 * keeping the main bundle lean.
 *
 * Tab navigation keeps only the active report in the DOM to avoid kicking off
 * all 5 SWR fetches at once.
 */
import { useState } from 'react';
import AreaOccupancyChart  from './AreaOccupancy';
import FloorOccupancyChart from './FloorOccupancy';
import BuildingUtilisation from './Utilisation';
import PeopleDayTable      from './PeopleDay';
import AlertsTable         from './Alerts';
import styles from './Reports.module.css';

export interface DateParams {
  from: string;
  to: string;
}

type TabId = 'area' | 'floor' | 'utilisation' | 'people-day' | 'alerts';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'area',        label: 'Area Occupancy'   },
  { id: 'floor',       label: 'Floor Occupancy'  },
  { id: 'utilisation', label: 'Utilisation'      },
  { id: 'people-day',  label: 'People Day'       },
  { id: 'alerts',      label: 'Alerts'           },
];

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('area');

  const defaultTo   = toIsoDate(new Date());
  const defaultFrom = toIsoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)); // last 7 days

  const [from, setFrom] = useState<string>(defaultFrom);
  const [to,   setTo]   = useState<string>(defaultTo);

  const dateParams: DateParams = { from, to };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Analyze</p>
          <h1 className={styles.title}>Reports</h1>
        </div>
        <div className={styles.dateRange}>
          <label htmlFor="reports-from">From</label>
          <input
            id="reports-from"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
          <label htmlFor="reports-to">To</label>
          <input
            id="reports-to"
            type="date"
            value={to}
            min={from}
            max={defaultTo}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <nav className={styles.tabs} role="tablist">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'area'        && <AreaOccupancyChart  dateParams={dateParams} />}
      {activeTab === 'floor'       && <FloorOccupancyChart dateParams={dateParams} />}
      {activeTab === 'utilisation' && <BuildingUtilisation dateParams={dateParams} />}
      {activeTab === 'people-day'  && <PeopleDayTable      dateParams={dateParams} />}
      {activeTab === 'alerts'      && <AlertsTable         dateParams={dateParams} />}
    </div>
  );
}
