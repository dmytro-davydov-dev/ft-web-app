/**
 * TablePaginationBar — reusable pagination footer for MUI tables.
 *
 * Renders a MUI TablePagination inside a TableFooter row so it stays
 * visually anchored to the bottom of any Table it wraps.
 *
 * Usage:
 *   <TablePaginationBar
 *     count={totalRows}
 *     page={page}
 *     rowsPerPage={rowsPerPage}
 *     onPageChange={setPage}
 *     onRowsPerPageChange={setRowsPerPage}
 *   />
 *
 * Drop this as the last child inside a <Table> element.
 */
import {
  TableFooter,
  TableRow,
  TablePagination,
} from '@mui/material';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TablePaginationBarProps {
  /** Total number of rows (unsliced). */
  count: number;
  /** Current zero-based page index. */
  page: number;
  /** Number of rows shown per page. */
  rowsPerPage: number;
  /** Called with the new zero-based page index. */
  onPageChange: (newPage: number) => void;
  /** Called with the new rows-per-page value; page is reset to 0 by parent. */
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  /** Options shown in the rows-per-page dropdown. Defaults to [10, 25, 50, 100]. */
  rowsPerPageOptions?: number[];
}

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ── Component ─────────────────────────────────────────────────────────────────

export function TablePaginationBar({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
}: TablePaginationBarProps) {
  return (
    <TableFooter>
      <TableRow>
        <TablePagination
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onPageChange={(_e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          sx={{
            borderBottom: 0,
            '& .MuiTablePagination-toolbar': { px: 2 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.8125rem',
              color: 'text.secondary',
            },
          }}
        />
      </TableRow>
    </TableFooter>
  );
}
