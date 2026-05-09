/**
 * AlertsWidget — recent system alerts.
 *
 * Shows four categories in priority order:
 *   1. Offline gateways   (no heartbeat)
 *   2. Degraded gateways  (intermittent heartbeat)
 *   3. Low battery tags   (batteryPct < LOW_BATTERY_THRESHOLD)
 *   4. Geofence events    (enter / exit from report R5)
 */
import { Card, CardContent, CardHeader, Chip, Typography, Box, Skeleton, Alert } from '@mui/material';
import { useReport }   from '../../hooks/useReport';
import { useTags }     from '../../hooks/useTags';
import { useGateways } from '../../hooks/useGateways';
import type { AlertsData } from '../../pages/Reports/types';

const MAX_ROWS             = 10;
const LOW_BATTERY_THRESHOLD = 20;   // percent

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(ts: string | null): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch { return ts; }
}

// ── Unified alert model ───────────────────────────────────────────────────────

type AlertKind = 'offline_gateway' | 'degraded_gateway' | 'low_battery' | 'geofence';

interface AlertItem {
  id:       string;
  kind:     AlertKind;
  title:    string;
  subtitle: string;
  ts:       string | null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KindChip({ kind, event }: { kind: AlertKind; event?: string }) {
  if (kind === 'offline_gateway') {
    return (
      <Chip label="offline" color="error" size="small" variant="outlined"
        sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
    );
  }
  if (kind === 'degraded_gateway') {
    return (
      <Chip label="degraded" color="warning" size="small" variant="outlined"
        sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
    );
  }
  if (kind === 'low_battery') {
    return (
      <Chip label="low battery" color="warning" size="small" variant="outlined"
        sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
    );
  }
  // geofence
  const isExit = event === 'exit';
  return (
    <Chip label={isExit ? 'exit' : 'enter'} color={isExit ? 'warning' : 'info'}
      size="small" variant="outlined"
      sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
  );
}

function dotColor(kind: AlertKind): string {
  if (kind === 'offline_gateway')  return 'error.main';
  if (kind === 'degraded_gateway') return 'warning.main';
  if (kind === 'low_battery')      return 'warning.main';
  return 'info.main';
}

function AlertRow({ item, event }: { item: AlertItem; event?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
      <Box sx={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, mt: '5px',
        bgcolor: dotColor(item.kind),
      }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <KindChip kind={item.kind} event={event} />
          <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
            {item.title}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.subtitle}{item.ts ? ` · ${formatTime(item.ts)}` : ''}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function AlertsWidget() {
  const todayStr = todayIso();

  const { data: geofenceData, error: geofenceError, isLoading: geofenceLoading } =
    useReport<AlertsData>('alerts', { from: todayStr, to: todayStr });

  const { data: tagsData,     error: tagsError,     isLoading: tagsLoading     } = useTags();
  const { data: gatewaysData, error: gatewaysError, isLoading: gatewaysLoading } = useGateways();

  const isLoading = geofenceLoading || tagsLoading || gatewaysLoading;
  const hasError  = !!(geofenceError || tagsError || gatewaysError);

  // Build unified alert list
  const items: AlertItem[] = [];

  // 1. Offline gateways
  (gatewaysData ?? [])
    .filter(g => g.status === 'offline')
    .forEach(g => items.push({
      id:       `gw-offline-${g.id}`,
      kind:     'offline_gateway',
      title:    g.label || g.id,
      subtitle: `Gateway ${g.id}`,
      ts:       g.lastHeartbeat,
    }));

  // 2. Degraded gateways
  (gatewaysData ?? [])
    .filter(g => g.status === 'degraded')
    .forEach(g => items.push({
      id:       `gw-degraded-${g.id}`,
      kind:     'degraded_gateway',
      title:    g.label || g.id,
      subtitle: `Gateway ${g.id}`,
      ts:       g.lastHeartbeat,
    }));

  // 3. Low battery tags

  (tagsData ?? [])
    .filter(t => t.status === 'low_battery' || (t.batteryPct !== null && t.batteryPct < LOW_BATTERY_THRESHOLD))
    .forEach(t => items.push({
      id:       `tag-lowbat-${t.id}`,
      kind:     'low_battery',
      title:    t.label || t.id,
      subtitle: `${t.batteryPct !== null ? `${t.batteryPct}%` : 'Unknown'} battery · ${t.zoneId ?? 'unknown zone'}`,
      ts:       t.lastSeen,
    }));

  // 3. Geofence events (most recent first, up to remaining slots)
  const remaining = MAX_ROWS - items.length;
  (geofenceData ?? []).slice(0, Math.max(remaining, 0)).forEach((row, i) => items.push({
    id:       `geo-${row.geofenceId}-${row.tagId}-${row.ts}-${i}`,
    kind:     'geofence',
    title:    row.geofenceId,
    subtitle: row.tagId,
    ts:       row.ts,
  }));

  const rows = items.slice(0, MAX_ROWS);

  // Retrieve geofence event type for a row (needed for chip colour)
  const geofenceEventFor = (item: AlertItem): string | undefined => {
    if (item.kind !== 'geofence') return undefined;
    return (geofenceData ?? []).find(r => `geo-${r.geofenceId}-${r.tagId}-${r.ts}` === item.id.replace(/-\d+$/, ''))?.event;
  };

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
        {hasError && !isLoading && (
          <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.5 }}>
            Failed to load alerts.
          </Alert>
        )}

        {/* Empty */}
        {!isLoading && !hasError && rows.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            No alerts today.
          </Typography>
        )}

        {/* Rows */}
        {!isLoading && !hasError && rows.map((item) => (
          <AlertRow key={item.id} item={item} event={geofenceEventFor(item)} />
        ))}

      </CardContent>
    </Card>
  );
}
