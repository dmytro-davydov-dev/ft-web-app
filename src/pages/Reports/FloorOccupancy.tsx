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

/** Format an ISO-8601 timestamp to "04 May 09:00" for X-axis labels. */
function fmtHour(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const mon = d.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
    const hh  = String(d.getUTCHours()).padStart(2, '0');
    const mm  = String(d.getUTCMinutes()).padStart(2, '0');
    return `${day} ${mon} ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

function pivotFloorRows(rows: FloorOccupancyData): { chartData: FloorOccupancyChartRow[]; floors: string[] } {
  const map = new Map<string, FloorOccupancyChartRow>();
  const floors = new Set<string>();
  for (const row of rows) {
    const floorKey = String(row.floor);
    floors.add(floorKey);
    if (!map.has(row.hour)) map.set(row.hour, { timestamp: fmtHour(row.hour) });
    // BQ returns INT64 as JSON string — coerce to number so Recharts plots it.
    (map.get(row.hour) as FloorOccupancyChartRow)[floorKey] = Number(row.tagCount);
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
                // radius is intentionally omitted: Recharts throws when radius is
                // combined with stackId on certain versions. Apply rounding via CSS
                // or upgrade to Recharts ≥ 2.13 if needed.
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="floors"
                  fill={BAR_COLORS[i % BAR_COLORS.length]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
