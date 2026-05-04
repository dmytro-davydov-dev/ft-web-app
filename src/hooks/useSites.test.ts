/**
 * useSites hook tests.
 *
 * Mocks: swr (useSWR), apiFetch, useAuth.
 * Mirrors the pattern used in useReport.test.ts.
 */
import { renderHook } from '@testing-library/react';

// ── Mock useAuth ──────────────────────────────────────────────────────────────
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Mock apiFetch ─────────────────────────────────────────────────────────────
const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

// ── Capture SWR key / fetcher ─────────────────────────────────────────────────
let capturedKey: unknown = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown) => {
    capturedKey     = key;
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

import { useSites } from './useSites';

const MOCK_SITE = {
  id: 'site-hq-pilot',
  name: 'HQ Pilot Office',
  description: 'Test',
  floorplan: { width_m: 50, height_m: 40, floors: 2, floor_area_m2: 2000 },
  floors: [],
};

describe('useSites', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey     = undefined;
    capturedFetcher = undefined;
  });

  test('returns null SWR key when customerId is not available', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useSites());
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when customerId is available', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });
    renderHook(() => useSites());
    expect(capturedKey).toBe('/api/v1/customers/cust-123/sites');
  });

  test('fetcher returns the sites array from the response envelope', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ customerId: 'cust-123', sites: [MOCK_SITE] }),
    });

    renderHook(() => useSites());

    const result = await capturedFetcher!('/api/v1/customers/cust-123/sites');
    expect(result).toEqual([MOCK_SITE]);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/customers/cust-123/sites');
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 404 });

    renderHook(() => useSites());

    await expect(
      capturedFetcher!('/api/v1/customers/cust-123/sites'),
    ).rejects.toThrow('Sites fetch failed: 404');
  });
});
