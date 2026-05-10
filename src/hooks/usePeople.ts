/**
 * usePeople — SWR-backed hook for GET /api/v1/customers/{customerId}/people.
 *
 * Returns the list of registered people (personnel records) for the tenant.
 * Data lives in Firestore (customers/{customerId}/people/{personId}).
 * Phase 5: served from ft-api; write path (POST /people) wired in ManagePeoplePage.
 *
 * No key is emitted until customerId resolves from the Firebase JWT.
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth }  from '../context/AuthContext';

// ── Domain types ─────────────────────────────────────────────────────────────

export interface Person {
  id:               string;
  firstName:        string;
  lastName:         string;
  email:            string;
  phone:            string;
  company:          string;
  role:             string;
  nationality:      string;
  tagId:            string | null;   // assigned hardware BLE badge
  pictureUrl:       string | null;   // GCS public URL or null
  supervisor:       string;
  emergencyContact: string;
}

interface PeopleResponse {
  customerId: string;
  people:     Person[];
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function peopleFetcher(url: string): Promise<Person[]> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`People fetch failed: ${res.status}`);
  const json = (await res.json()) as PeopleResponse;
  return json.people;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePeople() {
  const { customerId } = useAuth();
  const key = customerId ? `/api/v1/customers/${customerId}/people` : null;
  return useSWR<Person[]>(key, peopleFetcher);
}
