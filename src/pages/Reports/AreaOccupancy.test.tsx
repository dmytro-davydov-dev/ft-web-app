/**
 * AreaOccupancyChart tests — mocks useReport to exercise loading/error/data states.
 */
import { render, screen } from '@testing-library/react';
import AreaOccupancyChart from './AreaOccupancy';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

// Recharts uses ResizeObserver; stub it for jsdom.
global.ResizeObserver = class {
  observe()   { /* noop */ }
  unobserve() { /* noop */ }
  disconnect(){ /* noop */ }
};

describe('AreaOccupancyChart', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<AreaOccupancyChart />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<AreaOccupancyChart />);
    expect(screen.getByText(/Failed to load area occupancy/)).toBeInTheDocument();
  });

  test('renders chart when data is available', () => {
    const data = [
      { timestamp: '2026-04-01', 'Zone A': 10, 'Zone B': 5 },
      { timestamp: '2026-04-02', 'Zone A': 12, 'Zone B': 8 },
    ];
    mockUseReport.mockReturnValue({ data, error: undefined, isLoading: false });
    render(<AreaOccupancyChart />);
    expect(screen.getByText('Area Occupancy')).toBeInTheDocument();
  });

  test('calls useReport with occupancy/area report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<AreaOccupancyChart />);
    expect(mockUseReport).toHaveBeenCalledWith('occupancy/area', expect.any(Object));
  });
});
