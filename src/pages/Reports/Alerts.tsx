/**
 * AlertsTable — R5 — geofence alert history.
 * Rewritten with MUI Table + Chip.
 */
import { useReport } from '../../hooks/useReport';
import type { AlertsData } from './types';
import type { DateParams } from './ReportsPage';

import {
  Card, CardHeader, Typography, CircularProgress, Alert, Box,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip,
} from '@mui/material';

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch { return ts; }
}

function eventChipProps(event: string): { label: string; color: 'info' | 'warning' } {
  return event === 'exit'
    ? { label: 'exit',  color: 'warning' }
    : { label: event,   color: 'info'    };
}

export default function AlertsTable({ dateParams = { from: '', to: '' } }: { dateParams?: DateParams }) {
  const { data, error, isLoading } = useReport<AlertsData>('alerts', dateParams);

  return (
    <Card>
      <CardHeader
        title={<Typography variant="body1" sx={{ fontWeight: 700 }}>Alerts</Typography>}
        disableTypography
      />
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {error && <Box sx={{ p: 2 }}><Alert severity="error">Failed to load alerts data.</Alert></Box>}
      {data && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Geofence</TableCell>
                <TableCell>Badge ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => {
                const { label, color } = eventChipProps(row.event);
                return (
                  <TableRow key={`${row.geofenceId}-${row.tagId}-${row.ts}-${i}`}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTimestamp(row.ts)}</TableCell>
                    <TableCell>
                      <Chip label={label} color={color} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{row.geofenceId}</TableCell>
                    <TableCell>{row.tagId}</TableCell>
                  </TableRow>
                );
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                    No alerts for this period.
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
