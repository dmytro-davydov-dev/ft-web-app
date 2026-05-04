import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './DashboardPage';

// Mock apiFetch so the /api/v1/me useEffect doesn't hit the network in tests.
const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

// Mock useReport so KPI widgets don't issue real SWR fetches.
const mockUseReport = jest.fn();
jest.mock('../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ uid: 'u-test', customerId: 'c-test' }),
    });
    // Default: data not yet loaded
    mockUseReport.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard overview sections and widgets', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Active tags')).toBeInTheDocument();
    expect(screen.getByText('People tracked')).toBeInTheDocument();
    expect(screen.getByText('Gateways online')).toBeInTheDocument();
    expect(screen.getByText('Geofence alerts')).toBeInTheDocument();
    expect(screen.getByText('Floor map')).toBeInTheDocument();
    expect(screen.getByText('Recent alerts')).toBeInTheDocument();
    expect(screen.getByText('Occupancy trends')).toBeInTheDocument();
    expect(screen.getByText('Active tags by zone')).toBeInTheDocument();
  });

  test('KPI widgets show loading state while data is fetching', () => {
    mockUseReport.mockReturnValue({ data: undefined, isLoading: true, error: undefined });
    render(<DashboardPage />);
    // Both tag-backed KPIs show "…" while loading
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(2);
  });

  test('KPI widgets show live counts when data resolves', () => {
    // Component uses data.length — pass arrays of the correct size
    mockUseReport
      .mockReturnValueOnce({ data: Array(42).fill({}), isLoading: false, error: undefined }) // people-day
      .mockReturnValueOnce({ data: Array(3).fill({}),  isLoading: false, error: undefined }); // alerts
    render(<DashboardPage />);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1); // active tags + people tracked
    expect(screen.getByText('3')).toBeInTheDocument();                  // geofence alerts
  });

  test('KPI widgets fall back to "—" when data is null', () => {
    mockUseReport.mockReturnValue({ data: null, isLoading: false, error: undefined });
    render(<DashboardPage />);
    // At least one "—" visible (gateways always shows "—")
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  test('calls /api/v1/me on mount to validate auth chain', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/me');
    });
  });

  test('shows error banner when /api/v1/me returns non-2xx', async () => {
    mockApiFetch.mockResolvedValue({ ok: false, status: 401 });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('/api/v1/me returned 401');
    });
  });

  test('shows error banner when /api/v1/me throws (network error)', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  test('no error banner shown on successful API response', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
