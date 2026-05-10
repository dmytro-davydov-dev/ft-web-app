/**
 * ManageSitesPage tests.
 *
 * Mocks useSites / createSite and useAuth so the component can be tested without
 * Firebase / network. Tests cover: loading, error, empty state, site list rendering,
 * dialog open/close, form validation, and optimistic site creation.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock useSites + createSite ────────────────────────────────────────────────
const mockUseSites  = jest.fn();
const mockCreateSite = jest.fn();
jest.mock('../../hooks/useSites', () => ({
  useSites:   () => mockUseSites(),
  createSite: (...args: unknown[]) => mockCreateSite(...args),
}));

// ── Mock useAuth ──────────────────────────────────────────────────────────────
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ customerId: 'cust-test' }),
}));

import ManageSitesPage from './ManageSitesPage';

const PILOT_SITE = {
  id: 'site-hq-pilot',
  name: 'HQ Pilot Office',
  description: '2-floor office',
  floorplan: { width_m: 50, height_m: 40, floors: 2, floor_area_m2: 2000 },
  floors: [
    {
      floor: 1, label: 'Floor 1', gateway_count: 20,
      zones: [{ id: 'z1', label: 'Reception', area_m2: 400 }],
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ManageSitesPage />
    </MemoryRouter>
  );
}

describe('ManageSitesPage', () => {
  afterEach(() => jest.clearAllMocks());

  // ── Loading / Error / Empty ─────────────────────────────────────────────────

  test('shows loading spinner', () => {
    mockUseSites.mockReturnValue({ isLoading: true, data: undefined, error: undefined });
    renderPage();
    expect(screen.getByText('Loading sites…')).toBeInTheDocument();
  });

  test('shows error alert', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: undefined, error: new Error('Network fail') });
    renderPage();
    expect(screen.getByText(/Could not load sites/)).toBeInTheDocument();
    expect(screen.getByText(/Network fail/)).toBeInTheDocument();
  });

  test('shows empty state with Add site button', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    expect(screen.getByText('No sites yet')).toBeInTheDocument();
    // Two "Add site" buttons: header + empty state
    expect(screen.getAllByRole('button', { name: /add site/i }).length).toBeGreaterThanOrEqual(1);
  });

  // ── Site list ───────────────────────────────────────────────────────────────

  test('renders site name and chips', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [PILOT_SITE], error: undefined });
    renderPage();
    expect(screen.getByText('HQ Pilot Office')).toBeInTheDocument();
    expect(screen.getByText('2-floor office')).toBeInTheDocument();
    expect(screen.getByText('2 floors')).toBeInTheDocument();
    expect(screen.getByText('1 zones')).toBeInTheDocument();
    expect(screen.getByText('20 gateways')).toBeInTheDocument();
  });

  test('page heading is correct', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [PILOT_SITE], error: undefined });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sites' })).toBeInTheDocument();
  });

  // ── Dialog open / close ─────────────────────────────────────────────────────

  test('opens create dialog when Add site is clicked', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add site/i })[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New site')).toBeInTheDocument();
  });

  test('closes dialog on Cancel', () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add site/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ── Form validation ─────────────────────────────────────────────────────────

  test('shows validation error when name is empty', async () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: /add site/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /create site/i }));
    expect(await screen.findByText('Site name is required.')).toBeInTheDocument();
  });

  // ── Optimistic creation ─────────────────────────────────────────────────────

  test('creates site and adds it to the list optimistically', async () => {
    const newSite = {
      id: 'site-firestore-abc',
      name: 'New Test Site',
      description: '',
      address: '',
      drawing_gcs: null,
      photo_gcs: [],
      floorplan: { width_m: 0, height_m: 0, floors: 1, floor_area_m2: 0 },
      floors: [],
    };
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    mockCreateSite.mockResolvedValue(newSite);
    renderPage();

    // Open dialog
    fireEvent.click(screen.getAllByRole('button', { name: /add site/i })[0]);

    // Fill in name
    fireEvent.change(screen.getByLabelText(/site name/i), { target: { value: 'New Test Site' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create site/i }));

    // Dialog should close and new site should appear once createSite resolves
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('New Test Site')).toBeInTheDocument();

    // Verify createSite was called with correct args
    expect(mockCreateSite).toHaveBeenCalledWith('cust-test', {
      name: 'New Test Site',
      description: '',
      address: '',
    });
  });

  test('shows error when createSite rejects', async () => {
    mockUseSites.mockReturnValue({ isLoading: false, data: [], error: undefined });
    mockCreateSite.mockRejectedValue(new Error('Firestore unavailable'));
    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: /add site/i })[0]);
    fireEvent.change(screen.getByLabelText(/site name/i), { target: { value: 'Fail Site' } });
    fireEvent.click(screen.getByRole('button', { name: /create site/i }));

    await waitFor(() =>
      expect(screen.getByText('Firestore unavailable')).toBeInTheDocument()
    );
    // Dialog stays open on error
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
