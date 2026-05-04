/**
 * FloorOccupancyChart — R2 — Stacked BarChart per floor.
 * Rewritten with MUI Card; Recharts chart preserved.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReport } from '../../hooks/useReport';
import type { FloorOccupancyData, FloorOccupancyChartRow } from './types';
import type { DateParams } from './ReportsPage';
import { CHART_COLORS } from '../../theme';

import { Card, CardContent, CardHeader, Typography, CircularProgress, Alert, Box } from '@mui/material';

const BAR_COLORS = [
  CHART_COLORS.cyan, CHART_COLORS.purple, CHART_COLORS.positive,
  CHART_COLORS.warning, CHART_COLORS.negative,
];

function pivotFloorRows(rows: FloorOccupancyData): { chartData: FloorOccupancyChartRow[]; floors: string[] } {
  const map = new Map<string, FloorOccupancyChartRow>();
  const floors = new Set<string>();
  for (const row of rows) {
    const floorKey = String(row.floor);
    floors.add(floorKey);
    if (!map.has(row.hour)) map.set(row.hour, { timestamp: row.hour });
    (map.get(row.hour) as FloorOccupancyChartRow)[floorKey] = row.tagCount;
  }
  return { chartData: Array.from(map.values()), floors: Array.from(floors) };
}

export default function FloorOccupancyChart({ dateParams = { from: '', to: '' } }: { dateParams?: DateParams }) {
  const { data, error, isLoading } = useReport<FloorOccupancyData>('occupancy/floor', dateParams);
  const { chartData, floors } = data?.length ? pivotFloorRows(data) : { chartData: [], floors: [] };

  return (
    <Card>
      <CardHeader
        title={<Typography variant="body1" sx={{ fontWeight: 700 }}>Floor Occupancy</Typography>}
        disableTypography
      />
      <CardContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && <Alert severity="error">Failed to load floor occupancy data.</Alert>}
        {data && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
              <XAxis dataKey="timestamp" tick={{ fill: CHART_COLORS.textSecondary, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textSecondary, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.textSecondary }} />
              {floors.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="floors"
                  fill={BAR_COLORS[i % BAR_COLORS.length]}
                  radius={i === floors.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
