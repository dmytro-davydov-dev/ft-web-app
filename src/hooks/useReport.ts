/**
 * useReport — SWR-backed hook for all 5 report endpoints.
 *
 * URL pattern: /v1/customers/{customerId}/reporting/{reportType}
 * Auth token is attached automatically by apiFetch (Firebase SDK).
 * Returns null SWR key when customerId is not yet available (pre-auth).
 */
import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

export type ReportParams = Record<string, string | number | boolean>;

type SWRKey = [string, ReportParams] | null;

async function reportFetcher([url, params]: [string, ReportParams]): Promise<unknown> {
  const entries = Object.entries(params).map(([k, v]) => [k, String(v)]);
  const qs = entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
  const res = await apiFetch(`${url}${qs}`);
  if (!res.ok) throw new Error(`Report fetch failed: ${res.status}`);
  return res.json() as Promise<unknown>;
}

export function useReport<T = unknown>(reportType: string, params: ReportParams = {}) {
  const { customerId } = useAuth();
  const key: SWRKey = customerId
    ? [`/v1/customers/${customerId}/reporting/${reportType}`, params]
    : null;
  return useSWR<T>(key, reportFetcher);
}
