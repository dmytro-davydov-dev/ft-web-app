import { render, screen } from '@testing-library/react';
import AlertsTable from './Alerts';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

const SAMPLE_DATA = [
  {
    id: 'a1',
    timestamp: '2026-04-01T09:00:00Z',
    eventType: 'geofence-exit',
    severity: 'critical' as const,
    message: 'Tag left restricted zone',
    areaName: 'Server Room',
    personName: 'Alice',
  },
  {
    id: 'a2',
    timestamp: '2026-04-01T10:30:00Z',
    eventType: 'geofence-enter',
    severity: 'warning' as const,
    message: 'Unauthorised entry',
    areaName: 'Lab B',
    personName: undefined,
  },
  {
    id: 'a3',
    timestamp: '2026-04-01T11:00:00Z',
    eventType: 'low-battery',
    severity: 'info' as const,
    message: 'Tag battery below 20%',
    areaName: 'Lounge',
    personName: 'Bob',
  },
];

describe('AlertsTable', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<AlertsTable />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText(/Failed to load alerts/)).toBeInTheDocument();
  });

  test('renders all alert rows', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText('Tag left restricted zone')).toBeInTheDocument();
    expect(screen.getByText('Unauthorised entry')).toBeInTheDocument();
    expect(screen.getByText('Tag battery below 20%')).toBeInTheDocument();
  });

  test('renders severity badges', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  test('renders event-type badges', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText('geofence-exit')).toBeInTheDocument();
    expect(screen.getByText('geofence-enter')).toBeInTheDocument();
    expect(screen.getByText('low-battery')).toBeInTheDocument();
  });

  test('shows — when personName is undefined', () => {
    mockUseReport.mockReturnValue({ data: SAMPLE_DATA, error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('shows empty state when data is empty array', () => {
    mockUseReport.mockReturnValue({ data: [], error: undefined, isLoading: false });
    render(<AlertsTable />);
    expect(screen.getByText(/No alerts for this period/)).toBeInTheDocument();
  });

  test('calls useReport with alerts report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<AlertsTable />);
    expect(mockUseReport).toHaveBeenCalledWith('alerts');
  });
});
