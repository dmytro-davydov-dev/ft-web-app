import { render, screen } from '@testing-library/react';
import AlertsTable from './Alerts';
import type { AlertRow } from './types';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

// Data matching AlertRow — field names mirror BigQuery column names
const SAMPLE_DATA: AlertRow[] = [
  { geofenceId: 'g-server-room', tagId: 'tag-001', event: 'exit',  ts: '2026-04-01T09:00:00Z' },
  { geofenceId: 'g-lab-b',      tagId: 'tag-002', event: 'enter', ts: '2026-04-01T10:30:00Z' },
  { geofenceId: 'g-lounge',     tagId: 'tag-003', event: 'exit',  ts: '2026-04-01T11:00:00Z' },
];

describe('AlertsTable', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<AlertsTable />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText(/Failed to load alerts/)).toBeInTheDocument();
  });

  test('renders all alert rows', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText('g-server-room')).toBeInTheDocument();
    expect(screen.getByText('g-lab-b')).toBeInTheDocument();
    expect(screen.getByText('g-lounge')).toBeInTheDocument();
  });

  test('renders event-type badges', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    // exit appears on rows 0 and 2; enter on row 1
    expect(screen.getAllByText('exit').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('enter')).toBeInTheDocument();
  });

  test('renders tag IDs', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText('tag-001')).toBeInTheDocument();
    expect(screen.getByText('tag-002')).toBeInTheDocument();
    expect(screen.getByText('tag-003')).toBeInTheDocument();
  });

  test('shows empty state when data is empty array', () => {
    mockUseReport.mockReturnValue({ data: [], error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText(/No alerts for this period/)).toBeInTheDocument();
  });

  test('calls useReport with alerts report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<AlertsTable />);
    expect(mockUseReport).toHaveBeenCalledWith('alerts', expect.any(Object));
  });
});
