/**
 * SitesPage tests.
 *
 * Mocks useSites so the component can be tested without Firebase / network.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock useSites ─────────────────────────────────────────────────────────────
const mockUseSites = jest.fn();
jest.mock('../hooks/useSites', () => ({
  useSites: () => mockUseSites(),
}));

import SitesPage from './SitesPage';

const PILOT_SITE = {
  id: 'site-hq-pilot',
  name: 'HQ Pilot Office',
  description: '2-floor office',
  floorplan: { width_m: 50, height_m: 40, floors: 2, floor_area_m2: 2000 },
  floors: [
    {
      floor: 1,
      label: 'Floor 1',
      gateway_count: 20,
      zones: [
        { id: 'zone-reception', label: 'Reception',   area_m2: 400 },
        { id: 'zone-open-plan', label: 'Open Plan',   area_m2: 625 },
      ],
    },
    {
      floor: 2,
      label: 'Floor 2',
      gateway_count: 10,
      zones: [
        { id: 'zone-f2-open', label: 'Floor 2 Open Plan', area_m2: 1400 },
      ],
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <SitesPage />
    </MemoryRouter>
  );
}

describe('SitesPage', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseSites.mockReturnValue({ isLoading: true, data: undefined, error: undefined });
    renderPage();
    expect(screen.getByText('Loading site config…')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseSites.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error('Network error'),
    });
    renderPage();
    expect(screen.getByText(/Could not load sites/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  test('shows empty state when no sites', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(screen.getByText('No sites configured for this tenant.')).toBeInTheDocument();
  });

  test('renders site name and summary stats', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [PILOT_SITE], error: undefined });
    renderPage();
    expect(screen.getByText('HQ Pilot Office')).toBeInTheDocument();
    // 2 floors, 3 zones total, 30 gateways
    expect(screen.getByText(/2 floors/)).toBeInTheDocument();
    expect(screen.getByText(/3 zones/)).toBeInTheDocument();
    expect(screen.getByText(/30 gateways/)).toBeInTheDocument();
  });

  test('renders first floor zones by default', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [PILOT_SITE], error: undefined });
    renderPage();
    expect(screen.getByText('Reception')).toBeInTheDocument();
    expect(screen.getByText('Open Plan')).toBeInTheDocument();
    expect(screen.queryByText('Floor 2 Open Plan')).not.toBeInTheDocument();
  });

  test('switching floor tab shows second floor zones', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [PILOT_SITE], error: undefined });
    renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Floor 2' }));

    expect(screen.getByText('Floor 2 Open Plan')).toBeInTheDocument();
    expect(screen.queryByText('Reception')).not.toBeInTheDocument();
  });

  test('page kicker and heading are present', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [PILOT_SITE], error: undefined });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sites' })).toBeInTheDocument();
  });
});
