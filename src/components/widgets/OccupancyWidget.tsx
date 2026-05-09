/**
 * OccupancyWidget — occupancy trends chart.
 * Fetches live hourly floor-occupancy data via useReport('occupancy/floor').
 */
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, Typography, Box, CircularProgress } from '@mui/material';
import { CHART_COLORS } from '../../theme';
import { useReport } from '../../hooks/useReport';

interface OccupancyFloorRow {
  floor:    number;
  hour:     string; // ISO-8601
  tagCount: number;
}

interface ChartPoint { t: string; v: number; }

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

/** Last N days inclusive, formatted as YYYY-MM-DD */
function dateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { from: isoDate(from), to: isoDate(to) };
}

/** Safely extract a "MM/DD" label from any ISO-8601 timestamp string. */
function parseDayLabel(hour: string): string {
  try {
    const d = new Date(hour);
    if (isNaN(d.getTime())) return hour; // fall back to raw value
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
  } catch {
    return hour;
  }
}

export default function OccupancyWidget() {
  const { from, to } = dateRange(7);
  const { data: rawData, isLoading } = useReport<OccupancyFloorRow[]>(
    'occupancy/floor',
    { from, to },
  );

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!rawData?.length) return [];
    const byDay: Record<string, number> = {};
    for (const row of rawData) {
      const label = parseDayLabel(row.hour);
      byDay[label] = (byDay[label] ?? 0) + row.tagCount;
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([t, v]) => ({ t, v }));
  }, [rawData]);

  const isEmpty = !isLoading && chartData.length === 0;

  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Occupancy trends</Typography>
            {isLoading && <CircularProgress size={16} thickness={5} />}
          </Box>
        }
        disableTypography
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        {isEmpty && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
            No occupancy events recorded in the last 7 days.
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLORS.cyan} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
            <XAxis dataKey="t" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8 }}
              labelStyle={{ color: CHART_COLORS.textSecondary }}
              itemStyle={{ color: CHART_COLORS.cyan }}
            />
            <Area type="monotone" dataKey="v" name="Tags" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#occ)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
