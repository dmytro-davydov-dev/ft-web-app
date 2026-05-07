/**
 * PeoplePage tests.
 *
 * Mocks useReport so the component can be tested without Firebase / network.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PeopleDayRow } from './Reports/types';

// ── Mock useReport ────────────────────────────────────────────────────────────
const mockUseReport = jest.fn();
jest.mock('../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

import PeoplePage from './PeoplePage';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ROWS: PeopleDayRow[] = [
  {
    tagId:        'tag-001',
    day:          '2026-05-07',
    first_seen:   '2026-05-07T08:00:00Z',
    last_seen:    '2026-05-07T17:00:00Z',
    duration_min: 540,
  },
  {
    tagId:        'tag-002',
    day:          '2026-05-07',
    first_seen:   '2026-05-07T09:30:00Z',
    last_seen:    '2026-05-07T15:30:00Z',
    duration_min: 360,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <PeoplePage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PeoplePage', () => {
  afterEach(() => jest.clearAllMocks());

  test('renders page heading', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
  });

  test('shows loading spinners when fetching', () => {
    mockUseReport.mockReturnValue({ isLoading: true, data: undefined, error: undefined });
    renderPage();
    // KPI values show ellipsis while loading
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  test('shows error alert on fetch failure', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: undefined, error: new Error('fail') });
    renderPage();
    expect(screen.getByText(/Failed to load people data/)).toBeInTheDocument();
  });

  test('renders KPI values from data', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: ROWS, error: undefined });
    renderPage();
    // 2 unique tags → "2" for people tracked; getAllByText handles multiple matches
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
    // Average duration of (540 + 360) / 2 = 450 min = 7h 30m
    expect(screen.getByText('7h 30m')).toBeInTheDocument();
  });

  test('renders badge IDs in table', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: ROWS, error: undefined });
    renderPage();
    expect(screen.getByText('tag-001')).toBeInTheDocument();
    expect(screen.getByText('tag-002')).toBeInTheDocument();
  });

  test('shows empty-state message when no rows', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(screen.getByText('No people tracked for this period.')).toBeInTheDocument();
  });

  test('time filter buttons are rendered', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 days' })).toBeInTheDocument();
  });

  test('initial render calls useReport with today as both from and to', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();

    const firstParams = mockUseReport.mock.calls[0][1] as { from: string; to: string };
    expect(firstParams.from).toBe(firstParams.to);
  });

  test('table columns are rendered', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: ROWS, error: undefined });
    renderPage();
    expect(screen.getByText('Badge ID')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('First Seen')).toBeInTheDocument();
    expect(screen.getByText('Last Seen')).toBeInTheDocument();
  });

  test('summary chip shows record count', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: ROWS, error: undefined });
    renderPage();
    expect(screen.getByText('2 records')).toBeInTheDocument();
  });

  test('useReport is called with people-day report type', () => {
    mockUseReport.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(mockUseReport).toHaveBeenCalledWith('people-day', expect.any(Object));
  });
});
