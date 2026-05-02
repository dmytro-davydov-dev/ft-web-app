import { render, screen } from '@testing-library/react';
import BuildingUtilisation from './Utilisation';

const mockUseReport = jest.fn();
jest.mock('../../hooks/useReport', () => ({
  useReport: (...args: unknown[]) => mockUseReport(...args),
}));

global.ResizeObserver = class {
  observe()   { /* noop */ }
  unobserve() { /* noop */ }
  disconnect(){ /* noop */ }
};

describe('BuildingUtilisation', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<BuildingUtilisation />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<BuildingUtilisation />);
    expect(screen.getByText(/Failed to load utilisation/)).toBeInTheDocument();
  });

  test('renders chart title when data is available', () => {
    const data = [
      { date: '2026-04-01', utilisation: 72 },
      { date: '2026-04-02', utilisation: 68 },
    ];
    mockUseReport.mockReturnValue({ data, error: undefined, isLoading: false });
    render(<BuildingUtilisation />);
    expect(screen.getByText('Building Utilisation')).toBeInTheDocument();
  });

  test('calls useReport with utilisation/building report type', () => {
    mockUseReport.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<BuildingUtilisation />);
    expect(mockUseReport).toHaveBeenCalledWith('utilisation/building');
  });
});
