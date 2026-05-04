import { render, screen } from '@testing-library/react';
import FloorOccupancyChart from './FloorOccupancy';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

global.ResizeObserver = class {
  observe()   { /* noop */ }
  unobserve() { /* noop */ }
  disconnect(){ /* noop */ }
};

describe('FloorOccupancyChart', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<FloorOccupancyChart />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<FloorOccupancyChart />);
    expect(screen.getByText(/Failed to load floor occupancy/)).toBeInTheDocument();
  });

  test('renders chart title when data is available', () => {
    const data = [
      { timestamp: '2026-04-01', 'Floor 1': 20, 'Floor 2': 15 },
    ];
    mockUseReport.mockReturnValue({ data, error: undefined, isLoading: false });
    render(<FloorOccupancyChart />);
    expect(screen.getByText('Floor Occupancy')).toBeInTheDocument();
  });

  test('calls useReport with occupancy/floor report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<FloorOccupancyChart />);
    expect(mockUseReport).toHaveBeenCalledWith('occupancy/floor', expect.any(Object));
  });
});
