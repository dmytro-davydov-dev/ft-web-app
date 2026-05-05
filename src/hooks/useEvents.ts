/**
 * useEvents — SWR-backed hook for GET /api/v1/customers/{customerId}/events.
 *
 * Fetches recent BLE tag detection events from the ft-api events endpoint,
 * scoped to the authenticated tenant.
 *
 * Supports live polling via SWR's refreshInterval option.
 * Returns null SWR key when customerId is not yet available (pre-auth).
 *
 * URL pattern: /api/v1/customers/{customerId}/events?from=YYYY-MM-DD&to=YYYY-MM-DD[&siteId=...][&limit=...]
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth }  from '../context/AuthContext';

// ── Domain types ─────────────────────────────────────────────────────────────

export interface LocationEvent {
  event_ts:    string;       // ISO 8601 timestamp
  tag_id:      string;
  gateway_id:  string | null;
  area_id:     string | null;
  zone_id:     string | null;
  floor:       number | null;
  site_id:     string | null;
  rssi:        number | null;
  battery_pct: number | null;
}

export interface EventsResponse {
  customerId: string;
  from:       string;
  to:         string;
  clamped:    boolean;
  count:      number;
  rows:       LocationEvent[];
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface EventsParams {
  from:    string;        // YYYY-MM-DD (required)
  to:      string;        // YYYY-MM-DD (required)
  siteId?: string;
  limit?:  number;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function eventsFetcher([url, params]: [string, EventsParams]): Promise<EventsResponse> {
  const entries: [string, string][] = [
    ['from', params.from],
    ['to',   params.to],
    ...(params.siteId ? [['siteId', params.siteId] as [string, string]] : []),
    ...(params.limit  ? [['limit',  String(params.limit)] as [string, string]] : []),
  ];
  const qs = entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
  const res = await apiFetch(`${url}${qs}`);
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
  return res.json() as Promise<EventsResponse>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseEventsOptions {
  params:          EventsParams;
  /** SWR refreshInterval in ms. Pass 0 (default) to disable polling. */
  refreshInterval?: number;
}

export function useEvents({ params, refreshInterval = 0 }: UseEventsOptions) {
  const { customerId } = useAuth();
  const key = customerId
    ? [`/api/v1/customers/${customerId}/events`, params]
    : null;
  return useSWR<EventsResponse>(key, eventsFetcher, { refreshInterval });
}
