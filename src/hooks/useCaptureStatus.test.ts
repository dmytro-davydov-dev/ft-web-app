import { renderHook } from '@testing-library/react';

const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

let capturedKey: unknown = undefined;
let capturedFetcher: ((key: unknown) => unknown) | undefined = undefined;
let capturedOptions: Record<string, unknown> = {};

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: (key: unknown) => unknown, options?: Record<string, unknown>) => {
    capturedKey = key;
    capturedFetcher = fetcher;
    capturedOptions = options ?? {};
    return { data: undefined, error: undefined, isLoading: true };
  },
}));

import { useCaptureStatus } from './useCaptureStatus';

const CAPTURE_PROCESSING = {
  id: 'cap-1',
  siteId: 'site-1',
  status: 'processing' as const,
  tiles_url: null,
  captured_at: '2026-05-01T00:00:00Z',
};

const CAPTURE_READY = { ...CAPTURE_PROCESSING, status: 'ready' as const };
const CAPTURE_ERROR = { ...CAPTURE_PROCESSING, status: 'error' as const };
const CAPTURE_TILING = { ...CAPTURE_PROCESSING, status: 'tiling' as const };

function mockJson(data: unknown) {
  return { ok: true, json: async () => ({ capture: data }) };
}

describe('useCaptureStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
    capturedKey = undefined;
    capturedFetcher = undefined;
    capturedOptions = {};
  });

  test('returns null key when customerId is not available', () => {
    mockUseAuth.mockReturnValue({ customerId: null });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    expect(capturedKey).toBeNull();
  });

  test('returns null key when siteId is undefined', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus(undefined, 'cap-1'));
    expect(capturedKey).toBeNull();
  });

  test('returns null key when captureId is undefined', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', undefined));
    expect(capturedKey).toBeNull();
  });

  test('builds correct SWR key when authenticated', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    expect(capturedKey).toBe('/api/v1/drone/sites/site-1/captures/cap-1');
  });

  test('fetcher returns capture from response envelope', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue(mockJson(CAPTURE_PROCESSING));

    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    const result = await capturedFetcher!('/api/v1/drone/sites/site-1/captures/cap-1');
    expect(result).toEqual(CAPTURE_PROCESSING);
  });

  test('fetcher throws when response is not ok', async () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    mockApiFetch.mockResolvedValue({ ok: false, status: 404 });

    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    await expect(
      capturedFetcher!('/api/v1/drone/sites/site-1/captures/cap-1'),
    ).rejects.toThrow('Capture fetch failed: 404');
  });

  test('refreshInterval returns 15000 when status is processing', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    const fn = capturedOptions.refreshInterval as (data: unknown) => number;
    expect(fn(CAPTURE_PROCESSING)).toBe(15_000);
  });

  test('refreshInterval returns 15000 when status is tiling', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    const fn = capturedOptions.refreshInterval as (data: unknown) => number;
    expect(fn(CAPTURE_TILING)).toBe(15_000);
  });

  test('refreshInterval returns 0 when status is ready (terminal)', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    const fn = capturedOptions.refreshInterval as (data: unknown) => number;
    expect(fn(CAPTURE_READY)).toBe(0);
  });

  test('refreshInterval returns 0 when status is error (terminal)', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    const fn = capturedOptions.refreshInterval as (data: unknown) => number;
    expect(fn(CAPTURE_ERROR)).toBe(0);
  });

  test('refreshInterval returns 0 when data is undefined', () => {
    mockUseAuth.mockReturnValue({ customerId: 'cust-1' });
    renderHook(() => useCaptureStatus('site-1', 'cap-1'));
    const fn = capturedOptions.refreshInterval as (data: unknown) => number;
    expect(fn(undefined)).toBe(0);
  });
});
