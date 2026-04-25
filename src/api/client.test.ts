import { apiFetch } from './client';

const mockGetIdToken = jest.fn();
const mockFetch = jest.fn();

// Prevent import.meta.env (Vite-only) from causing a SyntaxError in Jest.
jest.mock('./env', () => ({ API_BASE: '' }));

jest.mock('../firebase/config', () => ({
  auth: {
    get currentUser() {
      return mockGetIdToken.mock.results.length >= 0
        ? { getIdToken: mockGetIdToken }
        : null;
    },
  },
}));

global.fetch = mockFetch;

describe('apiFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  test('attaches Authorization: Bearer header when user is signed in', async () => {
    mockGetIdToken.mockResolvedValue('test-id-token');

    await apiFetch('/api/sites');

    expect(mockGetIdToken).toHaveBeenCalledTimes(1);

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(url).toBe('/api/sites');
    expect(init.headers.get('Authorization')).toBe('Bearer test-id-token');
  });

  test('passes through custom options (method, body)', async () => {
    mockGetIdToken.mockResolvedValue('tok');

    await apiFetch('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name: 'zone-a' }),
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'zone-a' }));
  });

  test('omits Authorization header when no user is signed in', async () => {
    // Simulate signed-out state: currentUser is null
    jest.resetModules();
    jest.doMock('../firebase/config', () => ({ auth: { currentUser: null } }));

    const { apiFetch: apiFetchNoUser } = await import('./client');

    await apiFetchNoUser('/api/public');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('Authorization')).toBeNull();
  });

  test('merges caller-supplied headers with auth header', async () => {
    mockGetIdToken.mockResolvedValue('tok');

    await apiFetch('/api/sites', {
      headers: { 'Content-Type': 'application/json' },
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('Authorization')).toBe('Bearer tok');
    expect(init.headers.get('Content-Type')).toBe('application/json');
  });
});
