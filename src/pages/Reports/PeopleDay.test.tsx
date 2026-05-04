import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PeopleDayTable from './PeopleDay';
import type { PeopleDayRow } from './types';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

// Data matching PeopleDayRow — field names mirror BigQuery column names
const SAMPLE_DATA: PeopleDayRow[] = [
  { tagId: 'tag-001', day: '2026-04-02', duration_min: 480, first_seen: '2026-04-02T08:00:00Z', last_seen: '2026-04-02T16:00:00Z' },
  { tagId: 'tag-002', day: '2026-04-01', duration_min: 300, first_seen: '2026-04-01T09:00:00Z', last_seen: '2026-04-01T14:00:00Z' },
  { tagId: 'tag-003', day: '2026-04-03', duration_min: 120, first_seen: '2026-04-03T10:00:00Z', last_seen: '2026-04-03T12:00:00Z' },
];

describe('PeopleDayTable', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<PeopleDayTable />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText(/Failed to load people-day/)).toBeInTheDocument();
  });

  test('renders all rows', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText('tag-001')).toBeInTheDocument();
    expect(screen.getByText('tag-002')).toBeInTheDocument();
    expect(screen.getByText('tag-003')).toBeInTheDocument();
  });

  test('formats duration correctly', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText('8h 0m')).toBeInTheDocument();  // 480 min
    expect(screen.getByText('5h 0m')).toBeInTheDocument();  // 300 min
    expect(screen.getByText('2h 0m')).toBeInTheDocument();  // 120 min
  });

  test('sorts by tagId ascending on header click', async () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<PeopleDayTable />);

    // Click the Badge ID header to sort ascending
    await userEvent.click(screen.getByText('Badge ID'));

    const cells = screen.getAllByRole('cell').filter((c) =>
      ['tag-001', 'tag-002', 'tag-003'].includes(c.textContent ?? ''),
    );
    expect(cells[0].textContent).toBe('tag-001');
    expect(cells[1].textContent).toBe('tag-002');
    expect(cells[2].textContent).toBe('tag-003');
  });

  test('shows empty state when data is empty array', () => {
    mockUseReport.mockReturnValue({ data: [], error: undefined, isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText(/No records for this period/)).toBeInTheDocument();
  });

  test('calls useReport with people-day report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<PeopleDayTable />);
    expect(mockUseReport).toHaveBeenCalledWith('people-day', expect.any(Object));
  });
});
