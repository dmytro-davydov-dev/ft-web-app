/**
 * PeoplePage — /dashboard/people
 *
 * Shows all people (badges) tracked today or over a selected window,
 * using the people-day report endpoint. Includes KPI summary cards and
 * a sortable presence table.
 */
import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  ToggleButton, ToggleButtonGroup,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, TableSortLabel, Paper,
  CircularProgress, Alert, Chip,
} from '@mui/material';
import { useReport } from '../hooks/useReport';
import type { PeopleDayData, PeopleDayRow } from './Reports/types';

// ── Types ────────────────────────────────────────────────────────────────────

type TimeFilter = 'today' | '7d' | '30d';
type SortKey    = keyof PeopleDayRow;
type SortDir    = 'asc' | 'desc';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString(undefined, { timeStyle: 'short' });
  } catch {
    return ts;
  }
}

function dateRange(filter: TimeFilter): { from: string; to: string } {
  const today = toIsoDate(new Date());
  if (filter === 'today') return { from: today, to: today };
  const days   = filter === '7d' ? 7 : 30;
  const fromDt = toIsoDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
  return { from: fromDt, to: today };
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
  { key: 'tagId',        label: 'Badge ID'  },
  { key: 'day',          label: 'Date'      },
  { key: 'first_seen',   label: 'First Seen' },
  { key: 'last_seen',    label: 'Last Seen'  },
  { key: 'duration_min', label: 'Duration',  align: 'right' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const [filter,  setFilter]  = useState<TimeFilter>('today');
  const [sortKey, setSortKey] = useState<SortKey>('first_seen');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const range = dateRange(filter);
  const { data, error, isLoading } = useReport<PeopleDayData>('people-day', range);

  // ── Derived KPIs ────────────────────────────────────────────────────────────
  const rows       = data ?? [];
  const uniqueTags = new Set(rows.map((r) => r.tagId)).size;
  const avgMin     = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.duration_min, 0) / rows.length)
    : 0;
  const totalMin   = rows.reduce((s, r) => s + r.duration_min, 0);

  // ── Sorted rows ─────────────────────────────────────────────────────────────
  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Assets
          </Typography>
          <Typography variant="h1">People</Typography>
        </Box>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_e: React.MouseEvent<HTMLElement>, val: TimeFilter | null) => {
            if (val) setFilter(val);
          }}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            borderRadius: '999px', p: '4px', gap: '2px',
            '& .MuiToggleButtonGroup-grouped': {
              border: 0, borderRadius: '999px !important',
              px: 1.75, py: 0.75, fontSize: '0.875rem', fontWeight: 600,
              color: 'text.secondary', textTransform: 'none',
              '&.Mui-selected': { bgcolor: 'background.default', color: 'text.primary' },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            },
          }}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="7d">7 days</ToggleButton>
          <ToggleButton value="30d">30 days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ── KPI row ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="People tracked" value={isLoading ? '…' : uniqueTags} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Avg time on site" value={isLoading ? '…' : formatDuration(avgMin)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Total presence" value={isLoading ? '…' : formatDuration(totalMin)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Records" value={isLoading ? '…' : rows.length} sub="badge-days" />
        </Grid>
      </Grid>

      {/* ── States ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error">Failed to load people data. Check your connection and try again.</Alert>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && (
        <>
          {/* Summary chips */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: -2 }}>
            <Chip
              label={`${rows.length} record${rows.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'rgba(124,58,237,0.12)', color: '#9d5cf0', fontWeight: 600 }}
            />
            <Chip
              label={range.from === range.to ? range.from : `${range.from} → ${range.to}`}
              size="small"
              variant="outlined"
              sx={{ color: 'text.secondary' }}
            />
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
                  {sorted.map((row, i) => (
                    <TableRow
                      key={`${row.tagId}-${row.day}-${i}`}
                      hover
                      sx={{ '&:last-child td': { border: 0 } }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
                        {row.tagId}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                        {row.day}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {formatTime(row.first_seen)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {formatTime(row.last_seen)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatDuration(row.duration_min)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                        No people tracked for this period.
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
