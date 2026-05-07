/**
 * GeofencesPage tests.
 *
 * Mocks useGeofences + useReport so the component renders without Firebase / network.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock useGeofences ─────────────────────────────────────────────────────────
const mockUseGeofences = jest.fn();
jest.mock('../hooks/useGeofences', () => ({
  useGeofences: () => mockUseGeofences(),
}));

// ── Mock useReport ────────────────────────────────────────────────────────────
const mockUseReport = jest.fn();
jest.mock('../hooks/useReport', () => ({
  useReport: () => mockUseReport(),
}));

import GeofencesPage from './GeofencesPage';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const GEOFENCES = [
  {
    id: 'fence-restricted-server',
    name: 'Server Room (Restricted)',
    areaIds: ['zone-floor2-boardroom'],
    rules: [{ trigger: 'enter', roles: ['visitor'], notify: ['fcm:facility-manager'] }],
    capacityThreshold: null,
  },
  {
    id: 'fence-open-plan-capacity',
    name: 'Open Plan — Capacity Watch',
    areaIds: ['zone-open-plan'],
    rules: [],
    capacityThreshold: 50,
  },
];

const ALERTS = [
  { geofenceId: 'fence-restricted-server', tagId: 'tag-001', event: 'enter', ts: '2026-05-07T10:00:00Z' },
  { geofenceId: 'fence-restricted-server', tagId: 'tag-002', event: 'exit',  ts: '2026-05-07T10:15:00Z' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <GeofencesPage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GeofencesPage', () => {
  afterEach(() => jest.clearAllMocks());

  // ── Header ──────────────────────────────────────────────────────────────────

  test('renders page header', () => {
    mockUseGeofences.mockReturnValue({ isLoading: true });
    mockUseReport.mockReturnValue({ isLoading: true });
    renderPage();
    expect(screen.getByText('Geofences')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  // ── Geofence cards ──────────────────────────────────────────────────────────

  test('shows loading state for geofences', () => {
    mockUseGeofences.mockReturnValue({ isLoading: true });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('Loading geofences…')).toBeInTheDocument();
  });

  test('shows error state for geofences', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, error: new Error('500') });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText(/Could not load geofence config/)).toBeInTheDocument();
  });

  test('renders geofence cards when data is available', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: GEOFENCES });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('Server Room (Restricted)')).toBeInTheDocument();
    expect(screen.getByText('Open Plan — Capacity Watch')).toBeInTheDocument();
  });

  test('shows zone chip for each area ID', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: GEOFENCES });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('zone-floor2-boardroom')).toBeInTheDocument();
    expect(screen.getByText('zone-open-plan')).toBeInTheDocument();
  });

  test('shows trigger chip for rules', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: GEOFENCES });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('enter')).toBeInTheDocument();
  });

  test('shows capacity threshold when set', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: GEOFENCES });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('shows empty state when no geofences', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: [] });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('No geofences configured for this tenant.')).toBeInTheDocument();
  });

  // ── Recent alerts ───────────────────────────────────────────────────────────

  test('shows alerts section heading', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: [] });
    mockUseReport.mockReturnValue({ isLoading: false, data: ALERTS });
    renderPage();
    expect(screen.getByText('Recent alerts')).toBeInTheDocument();
  });

  test('renders alert rows', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: [] });
    mockUseReport.mockReturnValue({ isLoading: false, data: ALERTS });
    renderPage();
    expect(screen.getAllByText('fence-restricted-server')).toHaveLength(2);
    expect(screen.getByText('tag-001')).toBeInTheDocument();
    expect(screen.getByText('exit')).toBeInTheDocument();
  });

  test('shows empty-alerts message when no alerts', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: [] });
    mockUseReport.mockReturnValue({ isLoading: false, data: [] });
    renderPage();
    expect(screen.getByText('No alerts in the last 7 days.')).toBeInTheDocument();
  });

  test('shows alerts error state', () => {
    mockUseGeofences.mockReturnValue({ isLoading: false, data: [] });
    mockUseReport.mockReturnValue({ isLoading: false, error: new Error('bq fail') });
    renderPage();
    expect(screen.getByText('Could not load alert history.')).toBeInTheDocument();
  });
});
