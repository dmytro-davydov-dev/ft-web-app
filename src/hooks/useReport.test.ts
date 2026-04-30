/**
 * useReport hook tests.
 *
 * Mocks: swr (useSWR), apiFetch, useAuth.
 * Verifies that the SWR key is constructed correctly and the fetcher
 * calls apiFetch with the right URL + query-string.
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

// ── Capture the SWR key / fetcher that the hook registers ────────────────────
let capturedKey: unknown   = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown) => {
    capturedKey     = key;
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

import { useReport } from './useReport';

describe('useReport', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey     = undefined;
    capturedFetcher = undefined;
  });

  test('returns null SWR key when customerId is not available', () => {
    mockUseAuth.mockReturnValue({ customerId: null });

    renderHook(() => useReport('alerts'));

    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when customerId is available', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });

    renderHook(() => useReport('alerts'));

    expect(capturedKey).toEqual([
      '/v1/customers/cust-123/reporting/alerts',
      {},
    ]);
  });

  test('includes params in the SWR key', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });

    renderHook(() => useReport('occupancy-area', { days: 7 }));

    expect(capturedKey).toEqual([
      '/v1/customers/cust-abc/reporting/occupancy-area',
      { days: 7 },
    ]);
  });

  test('fetcher calls apiFetch without query-string when params is empty', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderHook(() => useReport('alerts'));

    await capturedFetcher!(['/v1/customers/cust-123/reporting/alerts', {}]);

    expect(mockApiFetch).toHaveBeenCalledWith('/v1/customers/cust-123/reporting/alerts');
  });

  test('fetcher appends params as query-string', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderHook(() => useReport('occupancy-floor', { days: 30 }));

    await capturedFetcher!(['/v1/customers/cust-123/reporting/occupancy-floor', { days: 30 }]);

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/v1/customers/cust-123/reporting/occupancy-floor?days=30',
    );
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-123' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 403 });

    renderHook(() => useReport('alerts'));

    await expect(
      capturedFetcher!(['/v1/customers/cust-123/reporting/alerts', {}]),
    ).rejects.toThrow('Report fetch failed: 403');
  });
});
