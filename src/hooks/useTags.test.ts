/**
 * useTags hook tests.
 *
 * Mocks: swr (useSWR), apiFetch, useAuth.
 * Mirrors the pattern used in useGeofences.test.ts.
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

import { useTags } from './useTags';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TAGS = [
  {
    id: 'tag-0001', label: 'Badge 1', type: 'badge',
    batteryPct: 87, lastSeen: '2026-05-07T08:30:00Z',
    zoneId: 'zone-reception', floor: 1, status: 'active',
  },
  {
    id: 'tag-0002', label: 'Badge 2', type: 'badge',
    batteryPct: 14, lastSeen: '2026-05-07T08:10:00Z',
    zoneId: 'zone-open-plan', floor: 1, status: 'low_battery',
  },
];

function mockJson(data: unknown) {
  return { ok: true, json: async () => ({ customerId: 'cust-1', tags: data }) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTags', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey     = undefined;
    capturedFetcher = undefined;
  });

  // ── SWR key ────────────────────────────────────────────────────────────────

  test('returns null SWR key when customerId is not available (pre-auth)', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useTags());
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when customerId is available', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useTags());
    expect(capturedKey).toBe('/api/v1/customers/cust-1/tags');
  });

  // ── Fetcher ────────────────────────────────────────────────────────────────

  test('fetcher calls apiFetch with correct URL', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(TAGS));

    renderHook(() => useTags());
    await capturedFetcher!('/api/v1/customers/cust-1/tags');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/customers/cust-1/tags');
  });

  test('fetcher returns tags array from response envelope', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(TAGS));

    renderHook(() => useTags());
    const result = await capturedFetcher!('/api/v1/customers/cust-1/tags');

    expect(result).toEqual(TAGS);
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 503 });

    renderHook(() => useTags());
    await expect(
      capturedFetcher!('/api/v1/customers/cust-1/tags'),
    ).rejects.toThrow('Tags fetch failed: 503');
  });

  test('isLoading is true while request is in-flight', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    const { result } = renderHook(() => useTags());
    expect(result.current.isLoading).toBe(true);
  });
});
