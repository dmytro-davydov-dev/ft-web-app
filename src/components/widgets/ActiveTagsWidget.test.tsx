import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import ActiveTagsWidget from './ActiveTagsWidget';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Bar: () => <div data-testid="bar-shape" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe('ActiveTagsWidget', () => {
  test('renders chart placeholder content', () => {
    render(<ActiveTagsWidget />);

    expect(screen.getByText('Active tags by zone')).toBeInTheDocument();
    expect(screen.getByText('Phase 5')).toBeInTheDocument();
    expect(screen.getByText('Data coming in Phase 4 — live tag counts per zone.')).toBeInTheDocument();
    expect(screen.getByTestId('bar-shape')).toBeInTheDocument();
  });
});
