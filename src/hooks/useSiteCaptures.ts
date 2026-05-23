import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Capture } from './useCaptureStatus';

interface CapturesResponse {
  captures: Capture[];
}

async function capturesFetcher(url: string): Promise<Capture[]> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Captures fetch failed: ${res.status}`);
  const json = (await res.json()) as CapturesResponse;
  return json.captures;
}

export function useSiteCaptures(siteId: string | undefined) {
  const { customerId } = useAuth();

  const key =
    customerId && siteId
      ? `/api/v1/drone/sites/${siteId}/captures?status=ready&order=captured_at:desc`
      : null;

  return useSWR<Capture[]>(key, capturesFetcher);
}
