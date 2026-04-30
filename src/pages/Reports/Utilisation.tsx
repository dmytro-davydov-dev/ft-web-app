/**
 * BuildingUtilisation — R3
 * AreaChart showing daily building utilisation %.
 * Data source: /v1/customers/{id}/reporting/utilisation-building
 */
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useReport } from '../../hooks/useReport';
import type { UtilisationData } from './types';
import styles from './Reports.module.css';

export default function BuildingUtilisation() {
  const { data, error, isLoading } = useReport<UtilisationData>('utilisation-building');

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Building Utilisation</span>
      </div>
      <div className={styles.cardBody}>
        {isLoading && <div className={styles.stateBox}>Loading…</div>}
        {error   && <div className={`${styles.stateBox} ${styles.errorBox}`}>Failed to load utilisation data.</div>}
        {data && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="utilisationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Utilisation']}
                contentStyle={{
                  background: '#0f1629',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="utilisation"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#utilisationGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#00d4ff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
