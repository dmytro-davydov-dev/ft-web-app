/**
 * AlertsWidget tests
 *
 * Covers:
 *  - loading skeleton
 *  - "No alerts today." empty state
 *  - offline gateway alert
 *  - low battery tag alert
 *  - geofence enter/exit events
 *  - error state
 *  - all three alert kinds visible simultaneously
 *
 * Pattern: factory-based jest.mock() so the firebase/api/client chain
 * (which uses import.meta.env) is never traversed.
 */
import { render, screen } from '@testing-library/react';

// ── Mock hooks with factories (avoids firebase/config import.meta chain) ──────

jest.mock('../../hooks/useReport',   () => ({ useReport:   jest.fn() }));
jest.mock('../../hooks/useTags',     () => ({ useTags:     jest.fn() }));
jest.mock('../../hooks/useGateways', () => ({ useGateways: jest.fn() }));
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ customerId: 'cust-1', uid: 'u1' }),
}));

import { useReport }   from '../../hooks/useReport';
import { useTags }     from '../../hooks/useTags';
import { useGateways } from '../../hooks/useGateways';
import AlertsWidget    from './AlertsWidget';

const mockUseReport   = useReport   as jest.MockedFunction<typeof useReport>;
const mockUseTags     = useTags     as jest.MockedFunction<typeof useTags>;
const mockUseGateways = useGateways as jest.MockedFunction<typeof useGateways>;

// Helper: wire all three hooks at once
function mockAll({
  geofence = { data: [],        error: null,               isLoading: false },
  tags     = { data: [],        error: null,               isLoading: false },
  gateways = { data: [],        error: null,               isLoading: false },
} = {}) {
  mockUseReport  .mockReturnValue(geofence as ReturnType<typeof useReport>);
  mockUseTags    .mockReturnValue(tags     as ReturnType<typeof useTags>);
  mockUseGateways.mockReturnValue(gateways as ReturnType<typeof useGateways>);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAll();
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AlertsWidget', () => {

  test('renders title', () => {
    render(<AlertsWidget />);
    expect(screen.getByText('Recent alerts')).toBeInTheDocument();
  });

  test('shows skeletons while loading', () => {
    mockAll({ tags: { data: undefined, error: null, isLoading: true } });
    const { container } = render(<AlertsWidget />);
    // MUI mock renders Skeleton as <div aria-hidden> (no CSS class in test env)
    expect(container.querySelector('[aria-hidden]')).toBeTruthy();
  });

  test('shows "No alerts today." when all sources are empty', () => {
    render(<AlertsWidget />);
    expect(screen.getByText('No alerts today.')).toBeInTheDocument();
  });

  test('shows offline gateway alert', () => {
    mockAll({
      gateways: {
        data: [{
          id: 'gw-f1-10', label: 'F1 · Open Plan F', model: 'Minew G1',
          siteId: 's1', floor: 1, zoneId: 'zone-open-plan', ipAddress: null,
          status: 'offline', lastHeartbeat: '2026-05-08T09:00:00Z', tagCount: 0,
        }],
        error: null, isLoading: false,
      },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('offline')).toBeInTheDocument();
    expect(screen.getByText('F1 · Open Plan F')).toBeInTheDocument();
  });

  test('shows degraded gateway alert', () => {
    mockAll({
      gateways: {
        data: [{
          id: 'gw-f1-04', label: 'F1 · Reception SE', model: 'Minew G1',
          siteId: 's1', floor: 1, zoneId: 'zone-reception', ipAddress: null,
          status: 'degraded', lastHeartbeat: '2026-05-08T09:58:00Z', tagCount: 1,
        }],
        error: null, isLoading: false,
      },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('degraded')).toBeInTheDocument();
    expect(screen.getByText('F1 · Reception SE')).toBeInTheDocument();
  });

  test('shows low battery tag alert', () => {
    mockAll({
      tags: {
        data: [{
          id: 'tag-0003', label: 'Employee Badge 3', type: 'badge',
          batteryPct: 14, lastSeen: '2026-05-07T09:10:00Z',
          zoneId: 'zone-meeting-a', floor: 1, status: 'low_battery',
        }],
        error: null, isLoading: false,
      },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('low battery')).toBeInTheDocument();
    expect(screen.getByText('Employee Badge 3')).toBeInTheDocument();
  });

  test('shows geofence enter event', () => {
    mockAll({
      geofence: {
        data: [{ geofenceId: 'geo-lobby', tagId: 'tag-0001', event: 'enter', ts: '2026-05-09T08:00:00Z' }],
        error: null, isLoading: false,
      },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('enter')).toBeInTheDocument();
    expect(screen.getByText('geo-lobby')).toBeInTheDocument();
  });

  test('shows geofence exit event chip', () => {
    mockAll({
      geofence: {
        data: [{ geofenceId: 'geo-lobby', tagId: 'tag-0002', event: 'exit', ts: '2026-05-09T08:30:00Z' }],
        error: null, isLoading: false,
      },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('exit')).toBeInTheDocument();
  });

  test('shows all three alert kinds simultaneously', () => {
    mockAll({
      gateways: {
        data: [{
          id: 'gw-1', label: 'GW Offline', model: 'Minew G1',
          siteId: 's1', floor: 1, zoneId: null, ipAddress: null,
          status: 'offline', lastHeartbeat: null, tagCount: 0,
        }],
        error: null, isLoading: false,
      },
      tags: {
        data: [{
          id: 'tag-0008', label: 'Badge LowBat', type: 'badge',
          batteryPct: 11, lastSeen: null, zoneId: null, floor: 1, status: 'low_battery',
        }],
        error: null, isLoading: false,
      },
      geofence: {
        data: [{ geofenceId: 'geo-x', tagId: 'tag-0001', event: 'enter', ts: '2026-05-09T09:00:00Z' }],
        error: null, isLoading: false,
      },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('offline')).toBeInTheDocument();
    expect(screen.getByText('low battery')).toBeInTheDocument();
    expect(screen.getByText('enter')).toBeInTheDocument();
  });

  test('shows error state when a hook fails', () => {
    mockAll({
      gateways: { data: undefined, error: new Error('network'), isLoading: false },
    });
    render(<AlertsWidget />);
    expect(screen.getByText('Failed to load alerts.')).toBeInTheDocument();
  });

});
