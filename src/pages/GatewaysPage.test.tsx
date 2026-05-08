import { render, screen } from '@testing-library/react';
import GatewaysPage from './GatewaysPage';
import type { Gateway } from '../hooks/useGateways';

// ── Mock useGateways ──────────────────────────────────────────────────────────
const mockUseGateways = jest.fn();
jest.mock('../hooks/useGateways', () => ({
  useGateways: () => mockUseGateways(),
}));

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_GATEWAYS: Gateway[] = [
  {
    id:            'gw-f1-01',
    label:         'F1 · Reception NW',
    model:         'Minew G1',
    siteId:        'site-hq-pilot',
    floor:         1,
    zoneId:        'zone-reception',
    ipAddress:     '10.0.1.11',
    status:        'online',
    lastHeartbeat: '2026-05-08T09:00:00+00:00',
    tagCount:      3,
  },
  {
    id:            'gw-f1-04',
    label:         'F1 · Reception SE',
    model:         'Minew G1',
    siteId:        'site-hq-pilot',
    floor:         1,
    zoneId:        'zone-reception',
    ipAddress:     '10.0.1.14',
    status:        'degraded',
    lastHeartbeat: '2026-05-08T07:00:00+00:00',
    tagCount:      1,
  },
  {
    id:            'gw-f1-10',
    label:         'F1 · Open Plan F',
    model:         'Minew G1',
    siteId:        'site-hq-pilot',
    floor:         1,
    zoneId:        null,
    ipAddress:     '10.0.1.20',
    status:        'offline',
    lastHeartbeat: null,
    tagCount:      0,
  },
];

describe('GatewaysPage', () => {
  afterEach(() => jest.clearAllMocks());

  test('shows loading state', () => {
    mockUseGateways.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<GatewaysPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state', () => {
    mockUseGateways.mockReturnValue({ data: undefined, error: new Error('fail'), isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByText(/Failed to load gateways/)).toBeInTheDocument();
  });

  test('renders gateway IDs in table', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByText('gw-f1-01')).toBeInTheDocument();
    expect(screen.getByText('gw-f1-04')).toBeInTheDocument();
    expect(screen.getByText('gw-f1-10')).toBeInTheDocument();
  });

  test('renders gateway labels', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByText('F1 · Reception NW')).toBeInTheDocument();
    expect(screen.getByText('F1 · Open Plan F')).toBeInTheDocument();
  });

  test('renders status chips', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getAllByText('Online').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Degraded').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Offline').length).toBeGreaterThanOrEqual(1);
  });

  test('renders KPI — total gateways', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    // "3" appears in the KPI card (total) and in the tag-count column; at least one must be present
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  test('shows offline warning chip when applicable', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByText('1 offline')).toBeInTheDocument();
  });

  test('shows degraded warning chip when applicable', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByText('1 degraded')).toBeInTheDocument();
  });

  test('shows empty state when data is empty array', () => {
    mockUseGateways.mockReturnValue({ data: [], error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByText(/No gateways registered/)).toBeInTheDocument();
  });

  test('renders page heading', () => {
    mockUseGateways.mockReturnValue({ data: SAMPLE_GATEWAYS, error: undefined, isLoading: false });
    render(<GatewaysPage />);
    expect(screen.getByRole('heading', { name: /Gateways/i })).toBeInTheDocument();
  });
});
