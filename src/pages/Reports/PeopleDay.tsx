/**
 * PeopleDayTable — R4 — sortable presence table.
 * Rewritten with MUI Table + TableSortLabel.
 */
import { useState } from 'react';
import { useReport } from '../../hooks/useReport';
import type { PeopleDayData, PeopleDayRow } from './types';
import type { DateParams } from './ReportsPage';

import {
  Card, CardHeader, Typography, CircularProgress, Alert, Box,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TableSortLabel,
} from '@mui/material';

type SortKey = keyof PeopleDayRow;
type SortDir = 'asc' | 'desc';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const COL_HEADERS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'tagId',        label: 'Badge ID'   },
  { key: 'day',          label: 'Date'       },
  { key: 'duration_min', label: 'Duration',  align: 'right' },
  { key: 'first_seen',   label: 'First Seen' },
  { key: 'last_seen',    label: 'Last Seen'  },
];

export default function PeopleDayTable({ dateParams = { from: '', to: '' } }: { dateParams?: DateParams }) {
  const { data, error, isLoading } = useReport<PeopleDayData>('people-day', dateParams);
  const [sortKey, setSortKey] = useState<SortKey>('day');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = data
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : [];

  return (
    <Card>
      <CardHeader
        title={<Typography variant="body1" sx={{ fontWeight: 700 }}>People Day</Typography>}
        disableTypography
      />
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {error && <Box sx={{ p: 2 }}><Alert severity="error">Failed to load people-day data.</Alert></Box>}
      {data && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {COL_HEADERS.map(({ key, label, align }) => (
                  <TableCell key={key} align={align} sortDirection={sortKey === key ? sortDir : false}>
                    <TableSortLabel
                      active={sortKey === key}
                      direction={sortKey === key ? sortDir : 'asc'}
                      onClick={() => handleSort(key)}
                      sx={{ color: 'text.disabled !important', '&.Mui-active': { color: 'text.secondary !important' } }}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={`${row.tagId}-${row.day}`}>
                  <TableCell sx={{ color: 'text.primary' }}>{row.tagId}</TableCell>
                  <TableCell>{row.day}</TableCell>
                  <TableCell align="right">{formatDuration(row.duration_min)}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.first_seen).toLocaleTimeString()}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(row.last_seen).toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                    No records for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
