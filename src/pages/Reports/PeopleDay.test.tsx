import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PeopleDayTable from './PeopleDay';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

const SAMPLE_DATA = [
  { personId: 'p1', name: 'Alice',   date: '2026-04-02', durationMinutes: 480, primaryArea: 'Lab A'   },
  { personId: 'p2', name: 'Bob',     date: '2026-04-01', durationMinutes: 300, primaryArea: 'Lab B'   },
  { personId: 'p3', name: 'Charlie', date: '2026-04-03', durationMinutes: 120, primaryArea: 'Lounge'  },
];

describe('PeopleDayTable', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<PeopleDayTable />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText(/Failed to load people-day/)).toBeInTheDocument();
  });

  test('renders all rows', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('formats duration correctly', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText('8h 0m')).toBeInTheDocument();  // 480 min
    expect(screen.getByText('5h 0m')).toBeInTheDocument();  // 300 min
    expect(screen.getByText('2h 0m')).toBeInTheDocument();  // 120 min
  });

  test('sorts by name ascending on header click', async () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<PeopleDayTable />);

    await userEvent.click(screen.getByText(/Person/));

    const cells = screen.getAllByRole('cell').filter((c) =>
      ['Alice', 'Bob', 'Charlie'].includes(c.textContent ?? ''),
    );
    expect(cells[0].textContent).toBe('Alice');
    expect(cells[1].textContent).toBe('Bob');
    expect(cells[2].textContent).toBe('Charlie');
  });

  test('shows empty state when data is empty array', () => {
    mockUseReport.mockReturnValue({ data: [], error: undefined, isLoading: false });
    render(<PeopleDayTable />);
    expect(screen.getByText(/No records for this period/)).toBeInTheDocument();
  });

  test('calls useReport with people-day report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<PeopleDayTable />);
    expect(mockUseReport).toHaveBeenCalledWith('people-day');
  });
});
