/**
 * useGeofences hook tests.
 *
 * Mocks: swr (useSWR), apiFetch, useAuth.
 * Mirrors the pattern used in useSites.test.ts / useEvents.test.ts:
 *   - Mock swr to capture key + fetcher directly.
 *   - Test fetcher in isolation (URL construction, error throwing).
 *   - Never rely on SWR's internal async scheduling in unit tests.
 */
import { renderHook } from '@testing-library/react';

// ── Mock useAuth ──────────────────────────────────────────────────────────────
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

// ── Mock apiFetch ─────────────────────────────────────────────────────────────
const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

// ── Capture SWR key + fetcher ─────────────────────────────────────────────────
let capturedKey:     unknown                         = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown) => {
    capturedKey     = key;
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

import { useGeofences } from './useGeofences';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const GEOFENCES = [
  {
    id: 'fence-test-1',
    name: 'Test Fence',
    areaIds: ['zone-a'],
    rules: [{ trigger: 'enter', roles: ['visitor'], notify: [] }],
    capacityThreshold: null,
  },
];

function mockJson(data: unknown) {
  return { ok: true, json: async () => ({ customerId: 'cust-1', geofences: data }) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useGeofences', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey     = undefined;
    capturedFetcher = undefined;
  });

  // ── SWR key ────────────────────────────────────────────────────────────────

  test('returns null SWR key when customerId is not available (pre-auth)', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useGeofences());
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when customerId is available', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useGeofences());
    expect(capturedKey).toBe('/api/v1/customers/cust-1/geofences');
  });

  // ── Fetcher ────────────────────────────────────────────────────────────────

  test('fetcher calls apiFetch with correct URL', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(GEOFENCES));

    renderHook(() => useGeofences());
    await capturedFetcher!('/api/v1/customers/cust-1/geofences');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/customers/cust-1/geofences');
  });

  test('fetcher returns geofences array from response envelope', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(GEOFENCES));

    renderHook(() => useGeofences());
    const result = await capturedFetcher!('/api/v1/customers/cust-1/geofences');

    expect(result).toEqual(GEOFENCES);
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 500 });

    renderHook(() => useGeofences());
    await expect(
      capturedFetcher!('/api/v1/customers/cust-1/geofences'),
    ).rejects.toThrow('Geofences fetch failed: 500');
  });

  // ── isLoading ──────────────────────────────────────────────────────────────

  test('isLoading is true while request is in-flight (SWR mock returns isLoading: true)', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    const { result } = renderHook(() => useGeofences());
    expect(result.current.isLoading).toBe(true);
  });
});
