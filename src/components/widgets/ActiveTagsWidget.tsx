/**
 * ActiveTagsWidget — active tags bar chart by zone.
 * Derives zone-level tag counts from useGateways() (tagCount per gateway).
 */
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, Typography, Box, CircularProgress } from '@mui/material';
import { CHART_COLORS } from '../../theme';
import { useGateways } from '../../hooks/useGateways';

interface ChartPoint { zone: string; tags: number; }

/** Convert "zone-open-plan" → "Open Plan", "zone-reception" → "Reception", etc. */
function formatZone(zoneId: string): string {
  return zoneId
    .replace(/^zone-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function ActiveTagsWidget() {
  const { data: gateways, isLoading } = useGateways();

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!gateways?.length) return [];
    const byZone: Record<string, number> = {};
    for (const gw of gateways) {
      const zone = gw.zoneId ?? 'Unknown';
      byZone[zone] = (byZone[zone] ?? 0) + gw.tagCount;
    }
    return Object.entries(byZone)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([zoneId, tags]) => ({ zone: formatZone(zoneId), tags }));
  }, [gateways]);

  const isEmpty = !isLoading && chartData.length === 0;

  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Active tags by zone</Typography>
            {isLoading && <CircularProgress size={16} thickness={5} />}
          </Box>
        }
        disableTypography
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        {isEmpty && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
            No gateway data available.
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
            <XAxis dataKey="zone" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8 }}
              labelStyle={{ color: CHART_COLORS.textSecondary }}
              itemStyle={{ color: CHART_COLORS.purple }}
            />
            <Bar dataKey="tags" name="Tags" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
