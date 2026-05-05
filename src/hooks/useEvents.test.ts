/**
 * useEvents hook tests.
 *
 * Mocks: swr (useSWR), apiFetch, useAuth.
 * Verifies SWR key construction, URL + query-string building,
 * refreshInterval passthrough, and error handling.
 */
import { renderHook } from '@testing-library/react';
import type { EventsParams } from './useEvents';

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

// ── Capture SWR key / fetcher / options ──────────────────────────────────────
let capturedKey:     unknown = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;
let capturedOptions: Record<string, unknown> = {};

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown, options?: Record<string, unknown>) => {
    capturedKey     = key;
    capturedFetcher = fetcher;
    capturedOptions = options ?? {};
    return { data: undefined, error: undefined, isLoading: true, isValidating: false };
  },
}));

import { useEvents } from './useEvents';

const BASE_PARAMS: EventsParams = { from: '2026-05-05', to: '2026-05-05' };

describe('useEvents', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey     = undefined;
    capturedFetcher = undefined;
    capturedOptions = {};
  });

  // ── SWR key ────────────────────────────────────────────────────────────────

  test('returns null SWR key when customerId is not available', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useEvents({ params: BASE_PARAMS }));
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when customerId is available', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-xyz' });
    renderHook(() => useEvents({ params: BASE_PARAMS }));
    expect(capturedKey).toEqual([
      '/api/v1/customers/cust-xyz/events',
      BASE_PARAMS,
    ]);
  });

  test('includes siteId and limit in SWR key when supplied', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    const params: EventsParams = { from: '2026-05-01', to: '2026-05-05', siteId: 'site-hq', limit: 200 };
    renderHook(() => useEvents({ params }));
    expect(capturedKey).toEqual(['/api/v1/customers/cust-abc/events', params]);
  });

  // ── refreshInterval ────────────────────────────────────────────────────────

  test('passes refreshInterval 0 by default', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    renderHook(() => useEvents({ params: BASE_PARAMS }));
    expect(capturedOptions.refreshInterval).toBe(0);
  });

  test('passes custom refreshInterval to SWR', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    renderHook(() => useEvents({ params: BASE_PARAMS, refreshInterval: 30_000 }));
    expect(capturedOptions.refreshInterval).toBe(30_000);
  });

  // ── Fetcher URL building ───────────────────────────────────────────────────

  test('fetcher calls apiFetch with from and to in query-string', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ customerId: 'cust-abc', from: '2026-05-05', to: '2026-05-05', clamped: false, count: 0, rows: [] }),
    });

    renderHook(() => useEvents({ params: BASE_PARAMS }));

    await capturedFetcher!(['/api/v1/customers/cust-abc/events', BASE_PARAMS]);

    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/v1/customers/cust-abc/events');
    expect(calledUrl).toContain('from=2026-05-05');
    expect(calledUrl).toContain('to=2026-05-05');
  });

  test('fetcher appends siteId when supplied', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ customerId: 'cust-abc', from: '2026-05-05', to: '2026-05-05', clamped: false, count: 0, rows: [] }),
    });

    const params: EventsParams = { ...BASE_PARAMS, siteId: 'site-hq' };
    renderHook(() => useEvents({ params }));

    await capturedFetcher!(['/api/v1/customers/cust-abc/events', params]);

    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('siteId=site-hq');
  });

  test('fetcher appends limit when supplied', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ customerId: 'cust-abc', from: '2026-05-05', to: '2026-05-05', clamped: false, count: 0, rows: [] }),
    });

    const params: EventsParams = { ...BASE_PARAMS, limit: 500 };
    renderHook(() => useEvents({ params }));

    await capturedFetcher!(['/api/v1/customers/cust-abc/events', params]);

    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=500');
  });

  test('fetcher does not append siteId when absent', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ customerId: 'cust-abc', from: '2026-05-05', to: '2026-05-05', clamped: false, count: 0, rows: [] }),
    });

    renderHook(() => useEvents({ params: BASE_PARAMS }));
    await capturedFetcher!(['/api/v1/customers/cust-abc/events', BASE_PARAMS]);

    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('siteId');
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-abc' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 403 });

    renderHook(() => useEvents({ params: BASE_PARAMS }));

    await expect(
      capturedFetcher!(['/api/v1/customers/cust-abc/events', BASE_PARAMS]),
    ).rejects.toThrow('Events fetch failed: 403');
  });
});
