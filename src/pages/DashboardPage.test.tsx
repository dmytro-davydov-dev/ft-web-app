import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './DashboardPage';

// Mock apiFetch so the /api/v1/me useEffect doesn't hit the network in tests.
const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ uid: 'u-test', customerId: 'c-test' }),
    });
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
