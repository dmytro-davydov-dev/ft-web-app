/**
 * ActiveTagsWidget — active tags bar chart placeholder (Phase 2).
 * Rewritten with MUI Card; Recharts chart preserved.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material';
import { CHART_COLORS } from '../../theme';

interface StubPoint { zone: string; tags: number; }

const STUB_DATA: StubPoint[] = [
  { zone: 'A', tags: 0 }, { zone: 'B', tags: 0 },
  { zone: 'C', tags: 0 }, { zone: 'D', tags: 0 },
  { zone: 'E', tags: 0 },
];

export default function ActiveTagsWidget() {
  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Active tags by zone</Typography>
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
          Data coming in Phase 4 — live tag counts per zone.
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={STUB_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.borderSubtle} />
            <XAxis dataKey="zone" tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: CHART_COLORS.bgCard, border: `1px solid ${CHART_COLORS.borderSubtle}`, borderRadius: 8 }}
              labelStyle={{ color: CHART_COLORS.textSecondary }}
              itemStyle={{ color: CHART_COLORS.purple }}
            />
            <Bar dataKey="tags" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
