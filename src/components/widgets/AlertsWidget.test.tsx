import { render, screen } from '@testing-library/react';
import AlertsWidget from './AlertsWidget';

describe('AlertsWidget', () => {
  test('renders placeholder title and status', () => {
    render(<AlertsWidget />);

    expect(screen.getByText('Recent alerts')).toBeInTheDocument();
    expect(screen.getByText('Phase 4')).toBeInTheDocument();
    expect(
      screen.getByText('Geofence alerts will appear here once EMQX + ingest-fn are live (Phase 4).')
    ).toBeInTheDocument();
  });
});
