/**
 * DashboardPage — Overview.
 * Rewritten with MUI Grid2 + Typography + Alert.
 */
import { useEffect, useState } from 'react';
import { apiFetch }      from '../api/client';
import { useReport }     from '../hooks/useReport';
import KpiWidget        from '../components/widgets/KpiWidget';
import MapWidget        from '../components/widgets/MapWidget';
import OccupancyWidget  from '../components/widgets/OccupancyWidget';
import ActiveTagsWidget from '../components/widgets/ActiveTagsWidget';
import AlertsWidget     from '../components/widgets/AlertsWidget';

import { Box, Typography, Alert, Grid } from '@mui/material';

interface MeResponse { uid: string; customerId: string; }
type ReportRows = unknown[];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const todayStr = todayIso();

  const { data: tagsData,   isLoading: tagsLoading   } =
    useReport<ReportRows>('people-day', { from: todayStr, to: todayStr });
  const { data: alertsData, isLoading: alertsLoading } =
    useReport<ReportRows>('alerts',     { from: todayStr, to: todayStr });

  useEffect(() => {
    apiFetch('/api/v1/me')
      .then((res) => {
        if (!res.ok) throw new Error(`/api/v1/me returned ${res.status}`);
        return res.json() as Promise<MeResponse>;
      })
      .then(() => setApiError(null))
      .catch((err: unknown) => {
        setApiError((err as Error).message ?? 'API unreachable');
      });
  }, []);

  const tagCount   = tagsLoading   ? '…' : String(tagsData?.length   ?? '—');
  const alertCount = alertsLoading ? '…' : String(alertsData?.length ?? '—');
  const hasAlerts  = !alertsLoading && (alertsData?.length ?? 0) > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {apiError && (
        <Alert severity="error" role="alert">
          API error: {apiError}
        </Alert>
      )}

      {/* Page header */}
      <Box>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}
        >
          Overview
        </Typography>
        <Typography variant="h1">Dashboard</Typography>
      </Box>

      {/* KPI row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget label="Active tags"     value={tagCount} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget label="People tracked"  value={tagCount} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget label="Gateways online" value="—" note="Phase 5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiWidget
            label="Geofence alerts"
            value={alertCount}
            accent={hasAlerts ? 'warning' : 'default'}
          />
        </Grid>
      </Grid>

      {/* Map + alerts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <MapWidget />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <AlertsWidget />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <OccupancyWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ActiveTagsWidget />
        </Grid>
      </Grid>
    </Box>
  );
}
