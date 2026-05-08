/**
 * useGateways hook tests.
 *
 * Mocks: swr (useSWR), apiFetch, useAuth.
 * Mirrors the pattern used in useTags.test.ts.
 */
import { renderHook } from '@testing-library/react';

// ── Mock useAuth ──────────────────────────────────────────────────────────────
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

// ── Mock apiFetch ─────────────────────────────────────────────────────────────
const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

// ── Capture SWR key + fetcher ─────────────────────────────────────────────────
let capturedKey:     unknown                                  = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown) => {
    capturedKey     = key;
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

import { useGateways } from './useGateways';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const GATEWAYS = [
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
    id:            'gw-f1-10',
    label:         'F1 · Open Plan F',
    model:         'Minew G1',
    siteId:        'site-hq-pilot',
    floor:         1,
    zoneId:        'zone-open-plan',
    ipAddress:     '10.0.1.20',
    status:        'offline',
    lastHeartbeat: null,
    tagCount:      0,
  },
];

function mockJson(data: unknown) {
  return { ok: true, json: async () => ({ customerId: 'cust-1', gateways: data }) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useGateways', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey     = undefined;
    capturedFetcher = undefined;
  });

  // ── SWR key ────────────────────────────────────────────────────────────────

  test('returns null SWR key when customerId is not available (pre-auth)', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useGateways());
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when customerId is available', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useGateways());
    expect(capturedKey).toBe('/api/v1/customers/cust-1/gateways');
  });

  // ── Fetcher ────────────────────────────────────────────────────────────────

  test('fetcher calls apiFetch with correct URL', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(GATEWAYS));

    renderHook(() => useGateways());
    await capturedFetcher!('/api/v1/customers/cust-1/gateways');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/customers/cust-1/gateways');
  });

  test('fetcher returns gateways array from response envelope', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(GATEWAYS));

    renderHook(() => useGateways());
    const result = await capturedFetcher!('/api/v1/customers/cust-1/gateways');

    expect(result).toEqual(GATEWAYS);
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 503 });

    renderHook(() => useGateways());
    await expect(
      capturedFetcher!('/api/v1/customers/cust-1/gateways'),
    ).rejects.toThrow('Gateways fetch failed: 503');
  });

  test('isLoading is true while request is in-flight', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    const { result } = renderHook(() => useGateways());
    expect(result.current.isLoading).toBe(true);
  });
});
