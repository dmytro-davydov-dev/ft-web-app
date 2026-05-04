/**
 * AreaOccupancyChart — R1 — LineChart per area.
 * Rewritten with MUI Card; Recharts chart preserved.
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReport } from '../../hooks/useReport';
import type { AreaOccupancyData, AreaOccupancyChartRow } from './types';
import type { DateParams } from './ReportsPage';
import { CHART_COLORS } from '../../theme';

import { Card, CardContent, CardHeader, Typography, CircularProgress, Alert, Box } from '@mui/material';

const LINE_COLORS = [
  CHART_COLORS.cyan, CHART_COLORS.purple, CHART_COLORS.positive,
  CHART_COLORS.warning, CHART_COLORS.negative,
];

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

export default function AreaOccupancyChart({ dateParams = { from: '', to: '' } }: { dateParams?: DateParams }) {
  const { data, error, isLoading } = useReport<AreaOccupancyData>('occupancy/area', dateParams);
  const { chartData, areas } = data?.length ? pivotAreaRows(data) : { chartData: [], areas: [] };

  return (
    <Card>
      <CardHeader
        title={<Typography variant="body1" sx={{ fontWeight: 700 }}>Area Occupancy</Typography>}
        disableTypography
      />
      <CardContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && <Alert severity="error">Failed to load area occupancy data.</Alert>}
        {data && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
              <XAxis dataKey="timestamp" tick={{ fill: CHART_COLORS.textSecondary, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.textSecondary, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.textSecondary }} />
              {areas.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
