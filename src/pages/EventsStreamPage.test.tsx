/**
 * EventsStreamPage tests.
 *
 * Mocks: useEvents hook.
 * Verifies render states: loading, error, empty, and populated table.
 */
import { render, screen } from '@testing-library/react';
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
    tag_id:      'tag-001',
    gateway_id:  'gw-floor1-a',
    area_id:     'zone-open-plan',
    zone_id:     'zone-open-plan',
    floor:       1,
    site_id:     'site-hq-pilot',
    rssi:        -65,
    battery_pct: 82,
  },
  {
    event_ts:    '2026-05-05T10:00:00+00:00',
    tag_id:      'tag-002',
    gateway_id:  null,
    area_id:     null,
    zone_id:     null,
    floor:       null,
    site_id:     'site-hq-pilot',
    rssi:        -90,
    battery_pct: null,
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
    expect(screen.getByText('Battery')).toBeInTheDocument();
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

  test('shows battery percentage when present', () => {
    mockUseEvents.mockReturnValue({ isLoading: false, error: undefined, isValidating: false, data: MOCK_RESPONSE });
    renderPage();
    expect(screen.getByText('82%')).toBeInTheDocument();
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
});
