import { renderHook, act } from '@testing-library/react';

const mockApiFetch = jest.fn();
jest.mock('../api/client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { useDroneUpload } from './useDroneUpload';

function makeFiles(names: string[]): File[] {
  return names.map(n => new File(['data'], n, { type: 'image/jpeg' }));
}

function mockCreateCapture(captureId: string, filenames: string[]) {
  return {
    ok: true,
    json: async () => ({
      capture_id: captureId,
      status: 'pending',
      upload_urls: filenames.map(f => ({ filename: f, url: `https://gcs.example.com/${f}` })),
    }),
  };
}

const CAPTURED_AT = '2026-05-01T10:00:00Z';

afterEach(() => jest.clearAllMocks());

describe('useDroneUpload', () => {
  test('initial state is idle', () => {
    const { result } = renderHook(() => useDroneUpload('site-1'));
    expect(result.current.state.phase).toBe('idle');
    expect(result.current.state.total).toBe(0);
    expect(result.current.state.uploaded).toBe(0);
  });

  test('transitions to creating then uploading then done on success', async () => {
    const files = makeFiles(['a.jpg', 'b.jpg']);
    mockApiFetch.mockResolvedValueOnce(mockCreateCapture('cap-1', ['a.jpg', 'b.jpg']));
    mockFetch.mockResolvedValue({ ok: true });
    mockApiFetch.mockResolvedValueOnce({ ok: true }); // process

    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload(files, CAPTURED_AT);
    });

    expect(result.current.state.phase).toBe('done');
    expect(result.current.state.total).toBe(2);
    expect(result.current.state.captureId).toBe('cap-1');
  });

  test('sets error phase when create capture fails', async () => {
    mockApiFetch.mockResolvedValueOnce({ ok: false, status: 422 });

    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload(makeFiles(['a.jpg']), CAPTURED_AT);
    });

    expect(result.current.state.phase).toBe('error');
    expect(result.current.state.errorMessage).toContain('422');
  });

  test('tracks failed files when GCS PUT fails', async () => {
    mockApiFetch.mockResolvedValueOnce(mockCreateCapture('cap-2', ['good.jpg', 'bad.jpg']));
    mockFetch
      .mockResolvedValueOnce({ ok: true })   // good.jpg
      .mockResolvedValueOnce({ ok: false, status: 503 }); // bad.jpg
    mockApiFetch.mockResolvedValueOnce({ ok: true }); // process

    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload(makeFiles(['good.jpg', 'bad.jpg']), CAPTURED_AT);
    });

    expect(result.current.state.failedFiles).toContain('bad.jpg');
    expect(result.current.state.failedFiles).not.toContain('good.jpg');
  });

  test('sets error phase when all files fail to upload', async () => {
    mockApiFetch.mockResolvedValueOnce(mockCreateCapture('cap-3', ['x.jpg']));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload(makeFiles(['x.jpg']), CAPTURED_AT);
    });

    expect(result.current.state.phase).toBe('error');
  });

  test('does nothing when files array is empty', async () => {
    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload([], CAPTURED_AT);
    });

    expect(result.current.state.phase).toBe('idle');
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  test('reset returns state to idle', async () => {
    mockApiFetch.mockResolvedValueOnce(mockCreateCapture('cap-4', ['a.jpg']));
    mockFetch.mockResolvedValueOnce({ ok: true });
    mockApiFetch.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload(makeFiles(['a.jpg']), CAPTURED_AT);
    });

    expect(result.current.state.phase).toBe('done');

    act(() => result.current.reset());

    expect(result.current.state.phase).toBe('idle');
    expect(result.current.state.total).toBe(0);
  });

  test('sends correct payload to create capture endpoint', async () => {
    const files = makeFiles(['p1.jpg', 'p2.jpg']);
    mockApiFetch.mockResolvedValueOnce(mockCreateCapture('cap-5', ['p1.jpg', 'p2.jpg']));
    mockFetch.mockResolvedValue({ ok: true });
    mockApiFetch.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useDroneUpload('site-1'));

    await act(async () => {
      await result.current.startUpload(files, CAPTURED_AT);
    });

    const [url, options] = mockApiFetch.mock.calls[0];
    expect(url).toBe('/api/v1/drone/sites/site-1/captures');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body as string);
    expect(body.photo_count).toBe(2);
    expect(body.filenames).toEqual(['p1.jpg', 'p2.jpg']);
    expect(body.captured_at).toBe(CAPTURED_AT);
  });
});
