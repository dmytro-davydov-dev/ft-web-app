/**
 * useSites — SWR-backed hook for GET /api/v1/customers/{customerId}/sites.
 *
 * Returns the list of sites (Phase 4: one static pilot site; multi-site in Phase 6).
 * No key is emitted until customerId resolves from the Firebase JWT.
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth }  from '../context/AuthContext';

// ── Domain types ─────────────────────────────────────────────────────────────

export interface SiteZone {
  id: string;
  label: string;
  area_m2: number;
}

export interface SiteFloor {
  floor: number;
  label: string;
  gateway_count: number;
  zones: SiteZone[];
}

export interface Site {
  id: string;
  name: string;
  description: string;
  floorplan: {
    width_m: number;
    height_m: number;
    floors: number;
    floor_area_m2: number;
  };
  floors: SiteFloor[];
}

interface SitesResponse {
  customerId: string;
  sites: Site[];
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function sitesFetcher(url: string): Promise<Site[]> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Sites fetch failed: ${res.status}`);
  const json = (await res.json()) as SitesResponse;
  return json.sites;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSites() {
  const { customerId } = useAuth();
  const key = customerId ? `/api/v1/customers/${customerId}/sites` : null;
  return useSWR<Site[]>(key, sitesFetcher);
}
