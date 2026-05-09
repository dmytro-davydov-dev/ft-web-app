/**
 * AlertsWidget — recent geofence alerts (live, up to 5 rows).
 */
import { Card, CardContent, CardHeader, Chip, Typography, Box, Skeleton, Alert } from '@mui/material';
import { useReport } from '../../hooks/useReport';
import type { AlertsData } from '../../pages/Reports/types';

const MAX_ROWS = 5;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch { return ts; }
}

function EventChip({ event }: { event: string }) {
  const isExit = event === 'exit';
  return (
    <Chip
      label={isExit ? 'exit' : 'enter'}
      color={isExit ? 'warning' : 'info'}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
    />
  );
}

export default function AlertsWidget() {
  const todayStr = todayIso();
  const { data, error, isLoading } = useReport<AlertsData>('alerts', { from: todayStr, to: todayStr });

  const rows = data?.slice(0, MAX_ROWS) ?? [];

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Recent alerts
          </Typography>
        }
        sx={{ pb: 1 }}
        disableTypography
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        {/* Loading */}
        {isLoading && [1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Skeleton variant="circular" width={8} height={8} sx={{ flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={14} />
              <Skeleton variant="text" width="40%" height={12} sx={{ mt: 0.25 }} />
            </Box>
          </Box>
        ))}

        {/* Error */}
        {error && !isLoading && (
          <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.5 }}>
            Failed to load alerts.
          </Alert>
        )}

        {/* Empty */}
        {!isLoading && !error && rows.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            No alerts today.
          </Typography>
        )}

        {/* Rows */}
        {!isLoading && !error && rows.map((row, i) => (
          <Box
            key={`${row.geofenceId}-${row.tagId}-${row.ts}-${i}`}
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}
          >
            <Box
              sx={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, mt: '5px',
                bgcolor: row.event === 'exit' ? 'warning.main' : 'info.main',
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <EventChip event={row.event} />
                <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
                  {row.geofenceId}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" noWrap>
                {row.tagId} · {formatTime(row.ts)}
              </Typography>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
