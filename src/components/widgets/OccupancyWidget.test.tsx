import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import OccupancyWidget from './OccupancyWidget';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  Area: () => <div data-testid="area-shape" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe('OccupancyWidget', () => {
  test('renders chart placeholder content', () => {
    render(<OccupancyWidget />);

    expect(screen.getByText('Occupancy trends')).toBeInTheDocument();
    expect(screen.getByText('Phase 5')).toBeInTheDocument();
    expect(
      screen.getByText('Data coming in Phase 4 — chart will render live Firestore + BigQuery data.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('area-shape')).toBeInTheDocument();
  });
});
