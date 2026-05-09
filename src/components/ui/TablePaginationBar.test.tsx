/**
 * TablePaginationBar tests.
 *
 * Renders the component inside a minimal Table/TableBody structure
 * (required by MUI TableFooter) and verifies:
 *   - displayed rows info text
 *   - rows-per-page options
 *   - page-change callback
 *   - rows-per-page-change callback
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Table, TableBody } from '@mui/material';
import { TablePaginationBar } from './TablePaginationBar';

function renderBar(overrides: Partial<React.ComponentProps<typeof TablePaginationBar>> = {}) {
  const props = {
    count:               100,
    page:                0,
    rowsPerPage:         25,
    onPageChange:        jest.fn(),
    onRowsPerPageChange: jest.fn(),
    ...overrides,
  };
  return {
    ...render(
      <Table>
        <TableBody />
        <TablePaginationBar {...props} />
      </Table>
    ),
    props,
  };
}

describe('TablePaginationBar', () => {

  // ── Displayed info ───────────────────────────────────────────────────────────

  test('shows correct rows range on first page', () => {
    renderBar({ count: 100, page: 0, rowsPerPage: 25 });
    expect(screen.getByText('1–25 of 100')).toBeInTheDocument();
  });

  test('shows correct rows range on second page', () => {
    renderBar({ count: 100, page: 1, rowsPerPage: 25 });
    expect(screen.getByText('26–50 of 100')).toBeInTheDocument();
  });

  test('shows correct range when last page is partial', () => {
    renderBar({ count: 30, page: 1, rowsPerPage: 25 });
    expect(screen.getByText('26–30 of 30')).toBeInTheDocument();
  });

  // ── Default rows-per-page options ────────────────────────────────────────────

  test('renders default rows-per-page options', () => {
    renderBar();
    const select = screen.getByRole('combobox');
    expect(within(select).getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: '25' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: '100' })).toBeInTheDocument();
  });

  test('accepts custom rows-per-page options', () => {
    renderBar({ rowsPerPageOptions: [5, 20, 50] });
    const select = screen.getByRole('combobox');
    expect(within(select).getByRole('option', { name: '5' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: '20' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(within(select).queryByRole('option', { name: '10' })).not.toBeInTheDocument();
  });

  // ── Callbacks ────────────────────────────────────────────────────────────────

  test('calls onPageChange with next page when next button clicked', () => {
    const onPageChange = jest.fn();
    renderBar({ count: 100, page: 0, rowsPerPage: 25, onPageChange });
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('calls onPageChange with prev page when back button clicked', () => {
    const onPageChange = jest.fn();
    renderBar({ count: 100, page: 2, rowsPerPage: 25, onPageChange });
    fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('calls onRowsPerPageChange when rows-per-page selection changes', () => {
    const onRowsPerPageChange = jest.fn();
    renderBar({ onRowsPerPageChange });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
    expect(onRowsPerPageChange).toHaveBeenCalledWith(50);
  });

  // ── Navigation buttons state ─────────────────────────────────────────────────

  test('previous page button is disabled on first page', () => {
    renderBar({ page: 0 });
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  test('next page button is disabled on last page', () => {
    renderBar({ count: 25, page: 0, rowsPerPage: 25 });
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  test('next page button is enabled when more pages exist', () => {
    renderBar({ count: 100, page: 0, rowsPerPage: 25 });
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled();
  });
});
