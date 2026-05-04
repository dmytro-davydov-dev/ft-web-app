/**
 * OccupancyWidget — occupancy trends chart placeholder (Phase 2).
 * Rewritten with MUI Card; Recharts chart preserved.
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material';
import { CHART_COLORS } from '../../theme';

interface StubPoint { t: string; v: number; }

const STUB_DATA: StubPoint[] = [
  { t: '00:00', v: 0 }, { t: '04:00', v: 0 },
  { t: '08:00', v: 0 }, { t: '12:00', v: 0 },
  { t: '16:00', v: 0 }, { t: '20:00', v: 0 },
];

export default function OccupancyWidget() {
  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Occupancy trends</Typography>
            <Chip
              label="Phase 5"
              size="small"
              sx={{ bgcolor: 'rgba(0,212,255,0.10)', color: '#00d4ff', fontWeight: 600 }}
            />
          </Box>
        }
        disableTypography
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
          Data coming in Phase 4 — chart will render live Firestore + BigQuery data.
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={STUB_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLORS.cyan} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
            <XAxis dataKey="t" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8 }}
              labelStyle={{ color: CHART_COLORS.textSecondary }}
              itemStyle={{ color: CHART_COLORS.cyan }}
            />
            <Area type="monotone" dataKey="v" stroke={CHART_COLORS.cyan} strokeWidth={2} fill="url(#occ)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
