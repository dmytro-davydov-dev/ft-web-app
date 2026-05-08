/**
 * OccupancyPage — Site: Occupancy (/dashboard/occupancy)
 *
 * Dedicated occupancy-trends view in the "Analyze" section.
 * Shows three charts (area, floor, building utilisation) and four KPIs
 * driven by the same ft-api reporting endpoints used in ReportsPage.
 * Date range defaults to the last 7 days; user can adjust inline.
 */
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Grid,
} from '@mui/material';

import KpiWidget          from '../components/widgets/KpiWidget';
import AreaOccupancyChart from './Reports/AreaOccupancy';
import FloorOccupancyChart from './Reports/FloorOccupancy';
import BuildingUtilisation from './Reports/Utilisation';
import { useReport }      from '../hooks/useReport';
import type { AreaOccupancyData, UtilisationData } from './Reports/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function sevenDaysAgo(): string {
  return toIsoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
}

// ── KPI derivations ───────────────────────────────────────────────────────────

function deriveAreaKpis(data: AreaOccupancyData | undefined): {
  peakCount: string;
  uniqueAreas: string;
} {
  if (!data?.length) return { peakCount: '—', uniqueAreas: '—' };
  let peak = 0;
  const areas = new Set<string>();
  for (const row of data) {
    areas.add(row.area_id);
    if (row.tagCount > peak) peak = row.tagCount;
  }
  return { peakCount: String(peak), uniqueAreas: String(areas.size) };
}

function deriveUtilKpis(data: UtilisationData | undefined): {
  avgUtil: string;
  peakUtil: string;
} {
  if (!data?.length) return { avgUtil: '—', peakUtil: '—' };
  let sum = 0;
  let peak = 0;
  for (const row of data) {
    sum += row.utilisation_pct;
    if (row.utilisation_pct > peak) peak = row.utilisation_pct;
  }
  const avg = Math.round(sum / data.length);
  return { avgUtil: `${avg}%`, peakUtil: `${Math.round(peak)}%` };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OccupancyPage() {
  const todayStr = toIsoDate(new Date());
  const [from, setFrom] = useState(sevenDaysAgo());
  const [to,   setTo]   = useState(todayStr);

  // Memoize so SWR key stays stable across re-renders triggered by own data loads.
  // Without this, each render creates a new object reference → SWR treats it as a
  // new key → child charts briefly show loading state and flicker.
  const dateParams = useMemo(() => ({ from, to }), [from, to]);

  const { data: areaData, isLoading: areaLoading } =
    useReport<AreaOccupancyData>('occupancy/area', dateParams);
  const { data: utilData, isLoading: utilLoading } =
    useReport<UtilisationData>('utilisation/building', dateParams);

  const loading = areaLoading || utilLoading;

  const { peakCount, uniqueAreas } = deriveAreaKpis(areaData);
  const { avgUtil,   peakUtil    } = deriveUtilKpis(utilData);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Analyze
          </Typography>
          <Typography variant="h1">Occupancy</Typography>
        </Box>

        {/* Date range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="From"
            type="date"
            size="small"
            value={from}
            slotProps={{ htmlInput: { max: to } }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
            sx={{ width: 160 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={to}
            slotProps={{ htmlInput: { min: from, max: todayStr } }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
            sx={{ width: 160 }}
          />
        </Box>
      </Box>

      {/* KPI row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget
            label="Peak concurrent tags"
            value={loading ? '…' : peakCount}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget
            label="Zones monitored"
            value={loading ? '…' : uniqueAreas}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget
            label="Avg utilisation"
            value={loading ? '…' : avgUtil}
            accent={avgUtil !== '—' && parseInt(avgUtil) >= 80 ? 'warning' : 'default'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget
            label="Peak utilisation"
            value={loading ? '…' : peakUtil}
            accent={peakUtil !== '—' && parseInt(peakUtil) >= 90 ? 'warning' : 'default'}
          />
        </Grid>
      </Grid>

      {/* Area occupancy — line chart per area */}
      <AreaOccupancyChart dateParams={dateParams} />

      {/* Floor occupancy — stacked bar chart per floor */}
      <FloorOccupancyChart dateParams={dateParams} />

      {/* Building utilisation — daily % area chart */}
      <BuildingUtilisation dateParams={dateParams} />

    </Box>
  );
}
