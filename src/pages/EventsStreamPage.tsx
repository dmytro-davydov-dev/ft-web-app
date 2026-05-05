/**
 * EventsStreamPage — /dashboard/events
 *
 * Live-polling table of recent BLE tag detection events from the
 * ft-api /events endpoint.  Mirrors the AppShell time-filter toggle
 * (Live / Last hour / Today / 7 d) with a local copy of the same widget,
 * and polls BQ every 30 s in Live mode.
 */
import React, { useState } from 'react';
import {
  Box, Typography, ToggleButton, ToggleButtonGroup,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, CircularProgress, Alert, Chip,
  Tooltip,
} from '@mui/material';
import { useEvents } from '../hooks/useEvents';
import type { LocationEvent } from '../hooks/useEvents';

// ── Time-filter config ────────────────────────────────────────────────────────

type TimeFilter = 'live' | '1h' | 'today' | '7d';

interface FilterConfig {
  label:           string;
  /** Derive { from, to } from today's date */
  dateRange: (today: string, sevenDaysAgo: string) => { from: string; to: string };
  /** SWR refreshInterval in ms (0 = no auto-refresh) */
  refreshInterval: number;
}

const FILTER_CONFIG: Record<TimeFilter, FilterConfig> = {
  live: {
    label:           'Live',
    dateRange:       (today) => ({ from: today, to: today }),
    refreshInterval: 30_000,
  },
  '1h': {
    label:           'Last hour',
    dateRange:       (today) => ({ from: today, to: today }),
    refreshInterval: 60_000,
  },
  today: {
    label:           'Today',
    dateRange:       (today) => ({ from: today, to: today }),
    refreshInterval: 300_000,
  },
  '7d': {
    label:           '7d',
    dateRange:       (_today, sevenDaysAgo) => ({ from: sevenDaysAgo, to: _today }),
    refreshInterval: 0,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return ts;
  }
}

function RssiBadge({ rssi }: { rssi: number | null }) {
  if (rssi === null) return <Typography variant="body2" color="text.disabled">—</Typography>;
  const color = rssi >= -65 ? 'success' : rssi >= -80 ? 'warning' : 'error';
  return (
    <Chip
      label={`${rssi} dBm`}
      color={color}
      size="small"
      variant="outlined"
      sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
    />
  );
}

function BatteryCell({ pct }: { pct: number | null }) {
  if (pct === null) return <Typography variant="body2" color="text.disabled">—</Typography>;
  return <Typography variant="body2">{pct}%</Typography>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EventsStreamPage() {
  const [filter, setFilter] = useState<TimeFilter>('live');

  const today        = toIsoDate(new Date());
  const sevenDaysAgo = toIsoDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const config    = FILTER_CONFIG[filter];
  const dateRange = config.dateRange(today, sevenDaysAgo);

  const { data, error, isLoading, isValidating } = useEvents({
    params:          { from: dateRange.from, to: dateRange.to, limit: 500 },
    refreshInterval: config.refreshInterval,
  });

  const rows: LocationEvent[] = data?.rows ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
            Live
          </Typography>
          <Typography variant="h1">Events stream</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Live pulse indicator */}
          {filter === 'live' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: isValidating ? 'warning.main' : 'success.main',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%':      { opacity: 0.4 },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {isValidating ? 'Refreshing…' : 'Live — refreshes every 30 s'}
              </Typography>
            </Box>
          )}

          {/* Time filter */}
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_e: React.MouseEvent<HTMLElement>, val: TimeFilter | null) => {
              if (val) setFilter(val);
            }}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '999px',
              p: '4px',
              gap: '2px',
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                borderRadius: '999px !important',
                px: 1.75, py: 0.75,
                fontSize: '0.875rem', fontWeight: 600,
                color: 'text.secondary', textTransform: 'none',
                '&.Mui-selected': { bgcolor: 'background.default', color: 'text.primary' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
              },
            }}
          >
            {(Object.entries(FILTER_CONFIG) as [TimeFilter, FilterConfig][]).map(([key, cfg]) => (
              <ToggleButton key={key} value={key}>{cfg.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Summary chips ── */}
      {data && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={`${data.count} event${data.count !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: 'rgba(124,58,237,0.12)', color: '#9d5cf0', fontWeight: 600 }}
          />
          <Chip
            label={`${dateRange.from === dateRange.to ? dateRange.from : `${dateRange.from} → ${dateRange.to}`}`}
            size="small"
            variant="outlined"
            sx={{ color: 'text.secondary' }}
          />
          {data.clamped && (
            <Tooltip title="Date range was clamped to 90-day maximum">
              <Chip label="Range clamped" size="small" color="warning" variant="outlined" />
            </Tooltip>
          )}
        </Box>
      )}

      {/* ── States ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && !isLoading && (
        <Alert severity="error">
          Failed to load events. Check your connection and try again.
        </Alert>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Time</TableCell>
                  <TableCell>Tag ID</TableCell>
                  <TableCell>Gateway</TableCell>
                  <TableCell>Area / Zone</TableCell>
                  <TableCell align="right">Floor</TableCell>
                  <TableCell align="right">RSSI</TableCell>
                  <TableCell align="right">Battery</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={`${row.tag_id}-${row.event_ts}-${i}`}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.8125rem' }}>
                      {formatTs(row.event_ts)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
                      {row.tag_id}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {row.gateway_id ?? '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {row.area_id ?? row.zone_id ?? '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {row.floor !== null ? row.floor : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <RssiBadge rssi={row.rssi} />
                    </TableCell>
                    <TableCell align="right">
                      <BatteryCell pct={row.battery_pct} />
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                      No events for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
