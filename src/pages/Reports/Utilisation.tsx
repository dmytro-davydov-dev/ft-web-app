/**
 * BuildingUtilisation — R3 — AreaChart of daily utilisation %.
 * Rewritten with MUI Card; Recharts chart preserved.
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReport } from '../../hooks/useReport';
import type { UtilisationData } from './types';
import type { DateParams } from './ReportsPage';
import { CHART_COLORS } from '../../theme';

import { Card, CardContent, CardHeader, Typography, CircularProgress, Alert, Box } from '@mui/material';

export default function BuildingUtilisation({ dateParams = { from: '', to: '' } }: { dateParams?: DateParams }) {
  const { data, error, isLoading } = useReport<UtilisationData>('utilisation/building', dateParams);
  const chartData = data?.map((r) => ({ date: r.day, utilisation: r.utilisation_pct })) ?? [];

  return (
    <Card>
      <CardHeader
        title={<Typography variant="body1" sx={{ fontWeight: 700 }}>Building Utilisation</Typography>}
        disableTypography
      />
      <CardContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && <Alert severity="error">Failed to load utilisation data.</Alert>}
        {data && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="utilisationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.cyan} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
              <XAxis dataKey="date" tick={{ fill: CHART_COLORS.textSecondary, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fill: CHART_COLORS.textSecondary, fontSize: 11 }}
                tickLine={false} axisLine={false} width={40}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Utilisation']}
                contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="utilisation" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#utilisationGrad)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.cyan }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
