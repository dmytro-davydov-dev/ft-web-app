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

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('area');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Analyze</p>
          <h1 className={styles.title}>Reports</h1>
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

      {activeTab === 'area'        && <AreaOccupancyChart  />}
      {activeTab === 'floor'       && <FloorOccupancyChart />}
      {activeTab === 'utilisation' && <BuildingUtilisation />}
      {activeTab === 'people-day'  && <PeopleDayTable      />}
      {activeTab === 'alerts'      && <AlertsTable         />}
    </div>
  );
}
