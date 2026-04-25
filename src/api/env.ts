/**
 * Vite-injected environment variables for the API client.
 *
 * Isolated here so tests can mock this module (jest.mock('./env'))
 * instead of dealing with import.meta at test-runtime.
 */
export const API_BASE: string =
  (import.meta.env as Record<string, string> | undefined)?.VITE_API_BASE_URL ?? '';
