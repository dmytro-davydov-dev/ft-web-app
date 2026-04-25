/**
 * OccupancyWidget — occupancy trends chart placeholder (Phase 2).
 * Recharts <AreaChart> imported and stubbed; will be wired in Phase 5.
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './ChartWidget.module.css';

interface StubPoint {
  t: string;
  v: number;
}

// Placeholder flat data so Recharts renders without errors
const STUB_DATA: StubPoint[] = [
  { t: '00:00', v: 0 }, { t: '04:00', v: 0 },
  { t: '08:00', v: 0 }, { t: '12:00', v: 0 },
  { t: '16:00', v: 0 }, { t: '20:00', v: 0 },
];

export default function OccupancyWidget() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Occupancy trends</span>
        <span className={styles.badge}>Phase 5</span>
      </div>
      <div className={styles.body}>
        <p className={styles.note}>Data coming in Phase 4 — chart will render live Firestore + BigQuery data.</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={STUB_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#00d4ff' }}
            />
            <Area type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={2} fill="url(#occ)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
