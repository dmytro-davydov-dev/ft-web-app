/**
 * ActiveTagsWidget — active tags bar chart placeholder (Phase 2).
 * Recharts <BarChart> imported and stubbed; will be wired in Phase 5.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './ChartWidget.module.css';

const STUB_DATA = [
  { zone: 'A', tags: 0 }, { zone: 'B', tags: 0 },
  { zone: 'C', tags: 0 }, { zone: 'D', tags: 0 },
  { zone: 'E', tags: 0 },
];

export default function ActiveTagsWidget() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Active tags by zone</span>
        <span className={styles.badge}>Phase 5</span>
      </div>
      <div className={styles.body}>
        <p className={styles.note}>Data coming in Phase 4 — live tag counts per zone.</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={STUB_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="zone" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#7c3aed' }}
            />
            <Bar dataKey="tags" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
