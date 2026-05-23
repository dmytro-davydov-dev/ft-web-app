import { renderHook } from '@testing-library/react';

const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

let capturedKey: unknown = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown) => {
    capturedKey = key;
    capturedFetcher = fetcher;
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

import { useSiteCaptures } from './useSiteCaptures';

const CAPTURE = {
  id: 'cap-1',
  siteId: 'site-1',
  status: 'ready' as const,
  tiles_url: 'https://storage.googleapis.com/bucket/captures/cap-1/tiles/',
  captured_at: '2026-05-01T00:00:00Z',
};

function mockJson(data: unknown) {
  return { ok: true, json: async () => ({ captures: data }) };
}

describe('useSiteCaptures', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey = undefined;
    capturedFetcher = undefined;
  });

  test('returns null key when customerId is not available', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useSiteCaptures('site-1'));
    expect(capturedKey).toBeNull();
  });

  test('returns null key when siteId is undefined', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useSiteCaptures(undefined));
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when authenticated', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useSiteCaptures('site-1'));
    expect(capturedKey).toBe(
      '/api/v1/drone/sites/site-1/captures?status=ready&limit=1&order=captured_at:desc',
    );
  });

  test('fetcher returns captures array from response envelope', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson([CAPTURE]));

    renderHook(() => useSiteCaptures('site-1'));
    const result = await capturedFetcher!(
      '/api/v1/drone/sites/site-1/captures?status=ready&limit=1&order=captured_at:desc',
    );
    expect(result).toEqual([CAPTURE]);
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 403 });

    renderHook(() => useSiteCaptures('site-1'));
    await expect(
      capturedFetcher!('/api/v1/drone/sites/site-1/captures?status=ready&limit=1&order=captured_at:desc'),
    ).rejects.toThrow('Captures fetch failed: 403');
  });
});
