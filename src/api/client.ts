/**
 * apiFetch — thin wrapper around fetch that attaches a Firebase ID token.
 *
 * Calls auth.currentUser.getIdToken() before every request so the token is
 * always fresh (Firebase SDK auto-refreshes before expiry). No token is ever
 * written to localStorage or sessionStorage.
 *
 * VITE_API_BASE_URL — optional env var that prefixes all request paths.
 * Set this to the Cloud Run service URL (e.g. https://ft-api-xxx-ew.a.run.app)
 * so the browser can reach the API in dev and prod. Omit for local proxy setups.
 *
 * Usage:
 *   const res = await apiFetch('/api/v1/me');
 *   const data = await res.json();
 */
import { auth }     from '../firebase/config';
import { API_BASE } from './env';

export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${API_BASE}${url}`, { ...options, headers });
}
