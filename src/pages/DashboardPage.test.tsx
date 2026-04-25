import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
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
});
