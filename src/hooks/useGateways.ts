/**
 * useGateways — SWR-backed hook for GET /api/v1/customers/{customerId}/gateways.
 *
 * Returns the list of BLE gateway / RSSI-anchor records for the authenticated tenant.
 * Phase 4: served as static pilot roster from ft-api.
 * Phase 5+: will reflect live Firestore heartbeat writes from the ingest function.
 *
 * No key is emitted until customerId resolves from the Firebase JWT.
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth }  from '../context/AuthContext';

// ── Domain types ─────────────────────────────────────────────────────────────

export type GatewayStatus = 'online' | 'offline' | 'degraded';

export interface Gateway {
  id:            string;
  label:         string;
  model:         string;
  siteId:        string;
  floor:         number;
  zoneId:        string | null;
  ipAddress:     string | null;
  status:        GatewayStatus;
  lastHeartbeat: string | null;   // ISO-8601 or null
  tagCount:      number;
}

interface GatewaysResponse {
  customerId: string;
  gateways:   Gateway[];
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function gatewaysFetcher(url: string): Promise<Gateway[]> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Gateways fetch failed: ${res.status}`);
  const json = (await res.json()) as GatewaysResponse;
  return json.gateways;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGateways() {
  const { customerId } = useAuth();
  const key = customerId ? `/api/v1/customers/${customerId}/gateways` : null;
  return useSWR<Gateway[]>(key, gatewaysFetcher);
}
