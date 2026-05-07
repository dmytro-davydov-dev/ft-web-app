/**
 * TagsPage — /dashboard/tags
 *
 * Shows all BLE tags / devices registered for the tenant.
 * Includes KPI summary cards and a sortable table with battery + status info.
 *
 * Phase 4: static pilot roster from ft-api /tags endpoint.
 * Phase 5+: live Firestore-backed data once ingest-fn writes tag state.
 */
import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, TableSortLabel, Paper,
  CircularProgress, Alert, Chip, LinearProgress,
} from '@mui/material';
import { useTags } from '../hooks/useTags';
import type { Tag, TagStatus } from '../hooks/useTags';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'label' | 'type' | 'batteryPct' | 'lastSeen' | 'zoneId' | 'floor' | 'status';
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

function batteryColor(pct: number | null): 'error' | 'warning' | 'success' {
  if (pct === null) return 'success';
  if (pct < 20)    return 'error';
  if (pct < 40)    return 'warning';
  return 'success';
}

function statusChipProps(status: TagStatus): {
  label: string;
  sx: object;
} {
  switch (status) {
    case 'active':      return { label: 'Active',      sx: { bgcolor: 'rgba(34,197,94,0.12)',  color: '#22c55e', fontWeight: 600 } };
    case 'low_battery': return { label: 'Low battery', sx: { bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 } };
    case 'inactive':    return { label: 'Inactive',    sx: { bgcolor: 'rgba(100,116,139,0.12)',color: '#64748b', fontWeight: 600 } };
    default:            return { label: status,        sx: {} };
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

function BatteryBar({ pct }: { pct: number | null }) {
  if (pct === null) return <Typography variant="caption" color="text.disabled">—</Typography>;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={batteryColor(pct)}
        sx={{ flex: 1, height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right' }}>
        {pct}%
      </Typography>
    </Box>
  );
}

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'id',         label: 'Tag ID'       },
  { key: 'label',      label: 'Label'        },
  { key: 'type',       label: 'Type'         },
  { key: 'status',     label: 'Status'       },
  { key: 'batteryPct', label: 'Battery',  align: 'right' },
  { key: 'zoneId',     label: 'Zone'         },
  { key: 'floor',      label: 'Floor',    align: 'right' },
  { key: 'lastSeen',   label: 'Last Seen'    },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TagsPage() {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data, error, isLoading } = useTags();

  // ── Derived KPIs ────────────────────────────────────────────────────────────
  const tags       = data ?? [];
  const active     = tags.filter((t) => t.status === 'active').length;
  const lowBattery = tags.filter((t) => t.status === 'low_battery').length;
  const avgBattery = tags.length
    ? Math.round(
        tags.reduce((s, t) => s + (t.batteryPct ?? 100), 0) / tags.length,
      )
    : 0;

  // ── Sorted rows ─────────────────────────────────────────────────────────────
  const sorted = [...tags].sort((a, b) => {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

      {/* ── Header ── */}
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Assets
        </Typography>
        <Typography variant="h1">Tags &amp; devices</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          BLE tag registry — battery health, last-seen zone, and live status.
        </Typography>
      </Box>

      {/* ── KPI row ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Total tags" value={isLoading ? '…' : tags.length} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Active" value={isLoading ? '…' : active} sub="seen recently" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Low battery"
            value={isLoading ? '…' : lowBattery}
            sub="< 20 %"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Avg battery" value={isLoading ? '…' : `${avgBattery}%`} />
        </Grid>
      </Grid>

      {/* ── States ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error">Failed to load tags. Check your connection and try again.</Alert>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: -2 }}>
            <Chip
              label={`${tags.length} device${tags.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(124,58,237,0.12)', color: '#9d5cf0', fontWeight: 600 }}
            />
            {lowBattery > 0 && (
              <Chip
                label={`${lowBattery} low battery`}
                size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 }}
              />
            )}
          </Box>

          <Paper sx={{ overflow: 'hidden' }}>
            <TableContainer>
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
                  {sorted.map((tag: Tag) => {
                    const chip = statusChipProps(tag.status);
                    return (
                      <TableRow
                        key={tag.id}
                        hover
                        sx={{ '&:last-child td': { border: 0 } }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
                          {tag.id}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem' }}>
                          {tag.label}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tag.type}
                            size="small"
                            sx={{ bgcolor: 'rgba(0,212,255,0.10)', color: '#00d4ff', fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={chip.label} size="small" sx={chip.sx} />
                        </TableCell>
                        <TableCell align="right">
                          <BatteryBar pct={tag.batteryPct} />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {tag.zoneId ?? '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {tag.floor ?? '—'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'text.secondary' }}>
                          {formatTs(tag.lastSeen)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                        No tags registered.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
