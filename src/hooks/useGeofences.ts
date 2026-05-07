/**
 * useGeofences — SWR-backed hook for GET /api/v1/customers/{customerId}/geofences.
 *
 * Returns the list of geofence configurations for the authenticated tenant.
 * Data lives in Firestore (customers/{customerId}/geofences/{geofenceId});
 * Phase 4: served as static pilot config from ft-api; Phase 5+ will read
 * live Firestore docs once ingest-fn geofence evaluation is wired.
 *
 * No key is emitted until customerId resolves from the Firebase JWT.
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth }  from '../context/AuthContext';

// ── Domain types ─────────────────────────────────────────────────────────────

export interface GeofenceRule {
  trigger: 'enter' | 'exit';
  roles:   string[];
  notify:  string[];
}

export interface Geofence {
  id:                 string;
  name:               string;
  areaIds:            string[];
  rules:              GeofenceRule[];
  capacityThreshold:  number | null;
}

interface GeofencesResponse {
  customerId: string;
  geofences:  Geofence[];
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function geofencesFetcher(url: string): Promise<Geofence[]> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Geofences fetch failed: ${res.status}`);
  const json = (await res.json()) as GeofencesResponse;
  return json.geofences;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGeofences() {
  const { customerId } = useAuth();
  const key = customerId ? `/api/v1/customers/${customerId}/geofences` : null;
  return useSWR<Geofence[]>(key, geofencesFetcher);
}
