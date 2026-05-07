/**
 * GeofencesPage — /dashboard/geofences
 *
 * Two panels:
 *   1. Geofence configurations — loaded from ft-api /geofences (Firestore-backed).
 *   2. Recent alerts          — live-polling BQ via /reporting/alerts (30 s refresh).
 *
 * Phase 4: static pilot config + BQ geofence_events.
 * Phase 5+: real Firestore write path once ingest-fn _check_geofence is wired.
 */
import { useState } from 'react';
import {
  Box, Typography, Card, CardHeader, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Alert, Divider, SvgIcon,
  Tooltip, Stack,
} from '@mui/material';
import { useGeofences } from '../hooks/useGeofences';
import type { Geofence, GeofenceRule } from '../hooks/useGeofences';
import { useReport } from '../hooks/useReport';
import type { AlertsData, AlertRow } from './Reports/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return ts;
  }
}

function today(): string  { return toIsoDate(new Date()); }
function weekAgo(): string {
  return toIsoDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
}

// ── GeofencesPage ─────────────────────────────────────────────────────────────

export default function GeofencesPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

      {/* ── Header ── */}
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Live
        </Typography>
        <Typography variant="h1">Geofences</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Zone-based entry / exit rules evaluated per-event inside the ingest pipeline.
        </Typography>
      </Box>

      {/* ── Geofence config cards ── */}
      <GeofencesSection />

      {/* ── Recent alerts ── */}
      <RecentAlertsSection />

    </Box>
  );
}

// ── GeofencesSection ──────────────────────────────────────────────────────────

function GeofencesSection() {
  const { data: geofences, isLoading, error } = useGeofences();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h3">Configured zones</Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Loading geofences…</Typography>
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error">Could not load geofence config: {(error as Error).message}</Alert>
      )}

      {!isLoading && !error && geofences && geofences.length === 0 && (
        <Typography color="text.secondary">No geofences configured for this tenant.</Typography>
      )}

      {!isLoading && !error && geofences && geofences.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 2,
          }}
        >
          {geofences.map((geo) => (
            <GeofenceCard key={geo.id} geofence={geo} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── GeofenceCard ──────────────────────────────────────────────────────────────

function GeofenceCard({ geofence }: { geofence: Geofence }) {
  const enterRules = geofence.rules.filter((r) => r.trigger === 'enter');
  const exitRules  = geofence.rules.filter((r) => r.trigger === 'exit');

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SvgIcon sx={{ width: 18, height: 18, color: 'primary.main', flexShrink: 0 }}>
              <IconFence />
            </SvgIcon>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {geofence.name}
            </Typography>
          </Box>
        }
        disableTypography
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>

        {/* Zones covered */}
        <Box>
          <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', mb: 0.75 }}>
            Zones
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {geofence.areaIds.map((id) => (
              <Chip
                key={id}
                label={id}
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}
              />
            ))}
            {geofence.areaIds.length === 0 && (
              <Typography variant="body2" color="text.disabled">—</Typography>
            )}
          </Stack>
        </Box>

        {/* Rules */}
        {geofence.rules.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', mb: 0.75 }}>
              Rules
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {[...enterRules, ...exitRules].map((rule, i) => (
                <RuleRow key={i} rule={rule} />
              ))}
            </Box>
          </Box>
        )}

        {/* Capacity threshold */}
        {geofence.capacityThreshold !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SvgIcon sx={{ width: 14, height: 14, color: 'text.disabled' }}>
              <IconCapacity />
            </SvgIcon>
            <Typography variant="body2" color="text.secondary">
              Alert when occupancy exceeds{' '}
              <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {geofence.capacityThreshold}
              </Typography>
            </Typography>
          </Box>
        )}

        {/* Phase badge */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Live evaluation wired in Phase 5">
            <Chip
              label="Phase 5"
              size="small"
              sx={{ height: 18, fontSize: '0.6875rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.disabled' }}
            />
          </Tooltip>
        </Box>

      </CardContent>
    </Card>
  );
}

// ── RuleRow ───────────────────────────────────────────────────────────────────

function RuleRow({ rule }: { rule: GeofenceRule }) {
  const isEnter = rule.trigger === 'enter';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        label={rule.trigger}
        size="small"
        color={isEnter ? 'info' : 'warning'}
        variant="outlined"
        sx={{ fontSize: '0.75rem', minWidth: 48 }}
      />
      {rule.roles.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          roles: {rule.roles.join(', ')}
        </Typography>
      )}
      {rule.notify.length > 0 && (
        <Typography variant="caption" color="text.disabled">
          → {rule.notify.join(', ')}
        </Typography>
      )}
    </Box>
  );
}

// ── RecentAlertsSection ───────────────────────────────────────────────────────

function RecentAlertsSection() {
  const [isValidating, setIsValidating] = useState(false);
  const params = { from: weekAgo(), to: today(), limit: 200 };

  const { data, error, isLoading } = useReport<AlertsData>('alerts', {
    ...params,
    refreshInterval: 30_000,
  });

  const rows: AlertRow[] = Array.isArray(data) ? data : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h3">Recent alerts</Typography>

        {/* Live pulse */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 7, height: 7, borderRadius: '50%',
              bgcolor: isValidating ? 'warning.main' : 'success.main',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%':      { opacity: 0.4 },
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            refreshes every 30 s
          </Typography>
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Loading alerts…</Typography>
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error">Could not load alert history.</Alert>
      )}

      {!isLoading && !error && (
        <Card>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Time</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Geofence</TableCell>
                  <TableCell>Tag ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={`${row.geofenceId}-${row.tagId}-${row.ts}-${i}`}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.8125rem' }}>
                      {formatTs(row.ts)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.event}
                        size="small"
                        color={row.event === 'exit' ? 'warning' : 'info'}
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {row.geofenceId}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {row.tagId}
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                      No alerts in the last 7 days.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {rows.length > 0 && (
            <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.disabled">
                Showing {rows.length} alert{rows.length !== 1 ? 's' : ''} · last 7 days ·{' '}
                <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>
                  full history in Reports → Alerts
                </Typography>
              </Typography>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconFence() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function IconCapacity() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
    </svg>
  );
}
