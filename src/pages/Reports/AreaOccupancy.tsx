/**
 * AreaOccupancyChart — R1
 * LineChart showing occupancy per area over a fixed window.
 * Data source: /v1/customers/{id}/reporting/occupancy/area
 *
 * BQ returns tall rows {areaId, hour, tagCount}[]; we pivot to wide format
 * {timestamp, [areaId]: tagCount}[] for Recharts.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useReport } from '../../hooks/useReport';
import type { AreaOccupancyData, AreaOccupancyChartRow } from './types';
import type { DateParams } from './ReportsPage';
import styles from './Reports.module.css';

const LINE_COLORS = ['#00d4ff', '#7c3aed', '#4ade80', '#fbbf24', '#f87171'];

/** Pivot tall BQ rows into wide format for Recharts. */
function pivotAreaRows(rows: AreaOccupancyData): { chartData: AreaOccupancyChartRow[]; areas: string[] } {
  const map = new Map<string, AreaOccupancyChartRow>();
  const areas = new Set<string>();
  for (const row of rows) {
    areas.add(row.areaId);
    if (!map.has(row.hour)) map.set(row.hour, { timestamp: row.hour });
    (map.get(row.hour) as AreaOccupancyChartRow)[row.areaId] = row.tagCount;
  }
  return { chartData: Array.from(map.values()), areas: Array.from(areas) };
}

export default function AreaOccupancyChart({ dateParams }: { dateParams: DateParams }) {
  const { data, error, isLoading } = useReport<AreaOccupancyData>('occupancy/area', dateParams);

  const { chartData, areas } = data && data.length > 0
    ? pivotAreaRows(data)
    : { chartData: [], areas: [] };

  const seriesKeys = areas;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Area Occupancy</span>
      </div>
      <div className={styles.cardBody}>
        {isLoading && <div className={styles.stateBox}>Loading…</div>}
        {error   && <div className={`${styles.stateBox} ${styles.errorBox}`}>Failed to load area occupancy data.</div>}
        {data && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
              {seriesKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
