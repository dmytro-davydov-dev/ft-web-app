/**
 * FloorOccupancyChart — R2
 * Stacked BarChart showing occupancy per floor over a fixed window.
 * Data source: /v1/customers/{id}/reporting/occupancy/floor
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useReport } from '../../hooks/useReport';
import type { FloorOccupancyData } from './types';
import styles from './Reports.module.css';

const BAR_COLORS = ['#00d4ff', '#7c3aed', '#4ade80', '#fbbf24', '#f87171'];

export default function FloorOccupancyChart() {
  const { data, error, isLoading } = useReport<FloorOccupancyData>('occupancy/floor');

  const floorKeys = data && data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== 'timestamp')
    : [];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Floor Occupancy</span>
      </div>
      <div className={styles.cardBody}>
        {isLoading && <div className={styles.stateBox}>Loading…</div>}
        {error   && <div className={`${styles.stateBox} ${styles.errorBox}`}>Failed to load floor occupancy data.</div>}
        {data && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f1629',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              {floorKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="floors"
                  fill={BAR_COLORS[i % BAR_COLORS.length]}
                  radius={i === floorKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
