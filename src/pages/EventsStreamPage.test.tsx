/**
 * EventsStreamPage tests.
 *
 * Mocks: useEvents hook.
 * Verifies render states: loading, error, empty, and populated table.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { EventsResponse, LocationEvent } from '../hooks/useEvents';

// ── Mock useEvents ────────────────────────────────────────────────────────────
const mockUseEvents = jest.fn();
jest.mock('../hooks/useEvents', () => ({
  useEvents: (...args: unknown[]) => mockUseEvents(...args),
}));

import EventsStreamPage from './EventsStreamPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/events']}>
      <EventsStreamPage />
    </MemoryRouter>
  );
}

const MOCK_ROWS: LocationEvent[] = [
  {
    event_ts:    '2026-05-05T10:01:00+00:00',
    ingested_at: '2026-05-05T10:01:01+00:00',
    tag_id:      'tag-001',
    gateway_id:  'gw-floor1-a',
    area_id:     'zone-open-plan',
    floor:       1,
    site_id:     'site-hq-pilot',
    rssi:        -65,
  },
  {
    event_ts:    '2026-05-05T10:00:00+00:00',
    ingested_at: '2026-05-05T10:00:01+00:00',
    tag_id:      'tag-002',
    gateway_id:  null,
    area_id:     null,
    floor:       null,
    site_id:     'site-hq-pilot',
    rssi:        -90,
  },
];

const MOCK_RESPONSE: EventsResponse = {
  customerId: 'cust-abc',
  from:       '2026-05-05',
  to:         '2026-05-05',
  clamped:    false,
  count:      2,
  rows:       MOCK_ROWS,
};

describe('EventsStreamPage', () => {
  afterEach(() => jest.clearAllMocks());

  // ── Loading state ──────────────────────────────────────────────────────────

  test('shows spinner while loading', () => {
    mockUseEvents.mockReturnValue({ isLoading: true, error: undefined, data: undefined, isValidating: false });
    renderPage();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('does not show table while loading', () => {
    mockUseEvents.mockReturnValue({ isLoading: true, error: undefined, data: undefined, isValidating: false });
    renderPage();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────────────────

  test('shows error alert when fetch fails', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: new Error('oops'), data: undefined, isValidating: false });
    renderPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/failed to load events/i)).toBeInTheDocument();
  });

  test('does not show table when error occurs', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: new Error('oops'), data: undefined, isValidating: false });
    renderPage();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  test('shows table with empty state message when no events', () => {
    mockUseEvents.mockReturnValue({
      isLoading: false, error: undefined, isValidating: false,
      data: { ...MOCK_RESPONSE, count: 0, rows: [] },
    });
    renderPage();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/no events for this period/i)).toBeInTheDocument();
  });

  // ── Populated table ────────────────────────────────────────────────────────

  test('renders table with correct column headers', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('Tag ID')).toBeInTheDocument();
    expect(screen.getByText('Gateway')).toBeInTheDocument();
    expect(screen.getByText('RSSI')).toBeInTheDocument();
    expect(screen.queryByText('Battery')).not.toBeInTheDocument();
  });

  test('renders a row for each event', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('tag-001')).toBeInTheDocument();
    expect(screen.getByText('tag-002')).toBeInTheDocument();
  });

  test('shows tag_id in each row', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('tag-001')).toBeInTheDocument();
  });

  test('shows gateway_id in row when present', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('gw-floor1-a')).toBeInTheDocument();
  });

  test('shows rssi as dBm chip', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('-65 dBm')).toBeInTheDocument();
  });

  test('shows area_id in row when present', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('zone-open-plan')).toBeInTheDocument();
  });

  // ── Page header ────────────────────────────────────────────────────────────

  test('renders page heading', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByRole('heading', { name: /events stream/i })).toBeInTheDocument();
  });

  test('renders event count chip', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  // ── useEvents call ────────────────────────────────────────────────────────

  test('calls useEvents with from and to params', () => {
    mockUseEvents.mockReturnValue({ isLoading: true, error: undefined, data: undefined, isValidating: false });
    renderPage();
    expect(mockUseEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          from: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          to:   expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        }),
      }),
    );
  });

  test('calls useEvents with refreshInterval 30000 in live mode (default)', () => {
    mockUseEvents.mockReturnValue({ isLoading: true, error: undefined, data: undefined, isValidating: false });
    renderPage();
    expect(mockUseEvents).toHaveBeenCalledWith(
      expect.objectContaining({ refreshInterval: 30_000 }),
    );
  });

  // ── Pagination ────────────────────────────────────────────────────────────────

  /** Build N mock rows for pagination tests */
  function makeMockRows(count: number): LocationEvent[] {
    return Array.from({ length: count }, (_, i) => ({
      event_ts:    `2026-05-05T10:${String(i).padStart(2, '0')}:00+00:00`,
      ingested_at: `2026-05-05T10:${String(i).padStart(2, '0')}:01+00:00`,
      tag_id:      `tag-${String(i).padStart(3, '0')}`,
      gateway_id:  null,
      area_id:     null,
      floor:       null,
      site_id:     'site-hq-pilot',
      rssi:        -70,
    }));
  }

  test('shows pagination controls when data is loaded', () => {
    mockUseEvents.mockReturnValue({
      isLoading: false, error: undefined, isValidating: false,
      data: { ...MOCK_RESPONSE, count: 2, rows: MOCK_ROWS },
    });
    renderPage();
    // MUI TablePagination renders a combobox for rows-per-page
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('renders only first page of rows when total > rowsPerPage', () => {
    const manyRows = makeMockRows(30);
    mockUseEvents.mockReturnValue({
      isLoading: false, error: undefined, isValidating: false,
      data: { ...MOCK_RESPONSE, count: 30, rows: manyRows },
    });
    renderPage();
    // Default rowsPerPage is 25 — first page rows visible
    expect(screen.getByText('tag-000')).toBeInTheDocument();
    expect(screen.getByText('tag-024')).toBeInTheDocument();
    // Row 26 should not be visible
    expect(screen.queryByText('tag-025')).not.toBeInTheDocument();
  });

  test('navigates to next page showing remaining rows', () => {
    const manyRows = makeMockRows(30);
    mockUseEvents.mockReturnValue({
      isLoading: false, error: undefined, isValidating: false,
      data: { ...MOCK_RESPONSE, count: 30, rows: manyRows },
    });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    // Page 2 should show rows 26–30
    expect(screen.getByText('tag-025')).toBeInTheDocument();
    expect(screen.getByText('tag-029')).toBeInTheDocument();
    expect(screen.queryByText('tag-000')).not.toBeInTheDocument();
  });

  test('shows rows-per-page selector with default options', () => {
    mockUseEvents.mockReturnValue({
      isLoading: false, error: undefined, isValidating: false,
      data: { ...MOCK_RESPONSE, count: 2, rows: MOCK_ROWS },
    });
    renderPage();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    // Verify all default options are present inside the select
    expect(select.querySelector('option[value="10"]')).toBeInTheDocument();
    expect(select.querySelector('option[value="25"]')).toBeInTheDocument();
    expect(select.querySelector('option[value="50"]')).toBeInTheDocument();
    expect(select.querySelector('option[value="100"]')).toBeInTheDocument();
  });

  test('changing rows-per-page resets to page 0', () => {
    const manyRows = makeMockRows(60);
    mockUseEvents.mockReturnValue({
      isLoading: false, error: undefined, isValidating: false,
      data: { ...MOCK_RESPONSE, count: 60, rows: manyRows },
    });
    renderPage();
    // Go to page 2
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByText('tag-025')).toBeInTheDocument();
    // Change rows per page to 50 — should reset to page 0
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
    expect(screen.getByText('tag-000')).toBeInTheDocument();
  });
});
