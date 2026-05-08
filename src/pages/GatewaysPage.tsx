/**
 * GatewaysPage — /dashboard/gateways
 *
 * Shows all BLE RSSI-anchor gateways registered for the tenant.
 * Includes KPI summary cards and a sortable table with status, floor,
 * zone, tag count and last-heartbeat info.
 *
 * Phase 4: static pilot roster from ft-api /gateways endpoint.
 * Phase 5+: live Firestore-backed heartbeat state once ingest-fn writes it.
 */
import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, TableSortLabel, Paper,
  CircularProgress, Alert, Chip,
} from '@mui/material';
import { useGateways } from '../hooks/useGateways';
import type { Gateway, GatewayStatus } from '../hooks/useGateways';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'label' | 'model' | 'floor' | 'zoneId' | 'status' | 'tagCount' | 'lastHeartbeat';
type SortDir = 'asc' | 'desc';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTs(ts: string | null): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return ts;
  }
}

function statusChipProps(status: GatewayStatus): { label: string; sx: object } {
  switch (status) {
    case 'online':   return { label: 'Online',   sx: { bgcolor: 'rgba(34,197,94,0.12)',  color: '#22c55e', fontWeight: 600 } };
    case 'degraded': return { label: 'Degraded', sx: { bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 } };
    case 'offline':  return { label: 'Offline',  sx: { bgcolor: 'rgba(239,68,68,0.12)',  color: '#ef4444', fontWeight: 600 } };
    default:         return { label: status,     sx: {} };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent sx={{ pb: '16px !important' }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.disabled">{sub}</Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'id',            label: 'Gateway ID'    },
  { key: 'label',         label: 'Label'         },
  { key: 'model',         label: 'Model'         },
  { key: 'status',        label: 'Status'        },
  { key: 'floor',         label: 'Floor',        align: 'right' },
  { key: 'zoneId',        label: 'Zone'          },
  { key: 'tagCount',      label: 'Tags seen',    align: 'right' },
  { key: 'lastHeartbeat', label: 'Last heartbeat' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GatewaysPage() {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data, error, isLoading } = useGateways();

  // ── Derived KPIs ────────────────────────────────────────────────────────────
  const gateways = data ?? [];
  const online   = gateways.filter((g) => g.status === 'online').length;
  const offline  = gateways.filter((g) => g.status === 'offline').length;
  const degraded = gateways.filter((g) => g.status === 'degraded').length;

  // ── Sorted rows ─────────────────────────────────────────────────────────────
  const sorted = [...gateways].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minHeight: 0 }}>

      {/* ── Header ── */}
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Assets
        </Typography>
        <Typography variant="h1">Gateways</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          BLE RSSI-anchor gateways — connectivity status, zone placement, and live tag visibility.
        </Typography>
      </Box>

      {/* ── KPI row ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Total gateways" value={isLoading ? '…' : gateways.length} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Online" value={isLoading ? '…' : online} sub="active heartbeat" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Degraded" value={isLoading ? '…' : degraded} sub="intermittent" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Offline" value={isLoading ? '…' : offline} sub="no heartbeat" />
        </Grid>
      </Grid>

      {/* ── States ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error">Failed to load gateways. Check your connection and try again.</Alert>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: -2 }}>
            <Chip
              label={`${gateways.length} gateway${gateways.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(124,58,237,0.12)', color: '#9d5cf0', fontWeight: 600 }}
            />
            {offline > 0 && (
              <Chip
                label={`${offline} offline`}
                size="small"
                sx={{ bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 600 }}
              />
            )}
            {degraded > 0 && (
              <Chip
                label={`${degraded} degraded`}
                size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 }}
              />
            )}
          </Box>

          <Paper sx={{ overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)', overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {COLUMNS.map(({ key, label, align }) => (
                      <TableCell key={key} align={align} sortDirection={sortKey === key ? sortDir : false}>
                        <TableSortLabel
                          active={sortKey === key}
                          direction={sortKey === key ? sortDir : 'asc'}
                          onClick={() => handleSort(key)}
                          sx={{
                            color: 'text.disabled !important',
                            '&.Mui-active': { color: 'text.secondary !important' },
                          }}
                        >
                          {label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.map((gw: Gateway) => {
                    const chip = statusChipProps(gw.status);
                    return (
                      <TableRow
                        key={gw.id}
                        hover
                        sx={{ '&:last-child td': { border: 0 } }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
                          {gw.id}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem' }}>
                          {gw.label}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={gw.model}
                            size="small"
                            sx={{ bgcolor: 'rgba(0,212,255,0.10)', color: '#00d4ff', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={chip.label} size="small" sx={chip.sx} />
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {gw.floor}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {gw.zoneId ?? '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8125rem' }}>
                          {gw.tagCount}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'text.secondary' }}>
                          {formatTs(gw.lastHeartbeat)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                        No gateways registered.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
