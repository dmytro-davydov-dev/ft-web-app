/**
 * useTags — SWR-backed hook for GET /api/v1/customers/{customerId}/tags.
 *
 * Returns the list of tag / device records for the authenticated tenant.
 * Data lives in Firestore (customers/{customerId}/tags/{tagId});
 * Phase 4: served as static pilot roster from ft-api.
 * Phase 5+: will reflect live Firestore writes from the ingest function.
 *
 * No key is emitted until customerId resolves from the Firebase JWT.
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth }  from '../context/AuthContext';

// ── Domain types ─────────────────────────────────────────────────────────────

export type TagStatus = 'active' | 'inactive' | 'low_battery';
export type TagType   = 'badge' | 'asset';

export interface Tag {
  id:         string;
  label:      string;
  type:       TagType;
  batteryPct: number | null;
  lastSeen:   string | null;   // ISO-8601 or null
  zoneId:     string | null;
  floor:      number | null;
  status:     TagStatus;
}

interface TagsResponse {
  customerId: string;
  tags:       Tag[];
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function tagsFetcher(url: string): Promise<Tag[]> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Tags fetch failed: ${res.status}`);
  const json = (await res.json()) as TagsResponse;
  return json.tags;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTags() {
  const { customerId } = useAuth();
  const key = customerId ? `/api/v1/customers/${customerId}/tags` : null;
  return useSWR<Tag[]>(key, tagsFetcher);
}
