import useSWR from 'swr';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

export type CaptureStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'tiling'
  | 'ready'
  | 'error';

export interface Capture {
  id: string;
  siteId: string;
  status: CaptureStatus;
  tiles_url: string | null;
  captured_at: string;
  metadata?: { detail?: string };
}

interface CaptureResponse {
  capture: Capture;
}

const POLLING_STATES: CaptureStatus[] = ['processing', 'tiling'];

async function captureFetcher(url: string): Promise<Capture> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Capture fetch failed: ${res.status}`);
  const json = (await res.json()) as CaptureResponse;
  return json.capture;
}

export function useCaptureStatus(siteId: string | undefined, captureId: string | undefined) {
  const { customerId } = useAuth();

  const key =
    customerId && siteId && captureId
      ? `/api/v1/drone/sites/${siteId}/captures/${captureId}`
      : null;

  return useSWR<Capture>(key, captureFetcher, {
    refreshInterval(data) {
      if (!data) return 0;
      return POLLING_STATES.includes(data.status) ? 15_000 : 0;
    },
  });
}
