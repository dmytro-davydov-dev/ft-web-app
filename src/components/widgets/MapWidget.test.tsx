import { render, screen } from '@testing-library/react';
import MapWidget from './MapWidget';

describe('MapWidget', () => {
  test('renders map placeholder content', () => {
    render(<MapWidget />);

    expect(screen.getByText('Floor map')).toBeInTheDocument();
    expect(screen.getByText('Phase 4')).toBeInTheDocument();
    expect(screen.getByText('Mapbox GL map — wired in Phase 4')).toBeInTheDocument();
  });
});
