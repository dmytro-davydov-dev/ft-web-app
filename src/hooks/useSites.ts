/**
 * useSites — SWR-backed hook for GET /api/v1/customers/{customerId}/sites.
 *
 * Returns the list of sites (Phase 4: one static pilot site; multi-site in Phase 6).
 * No key is emitted until customerId resolves from the Firebase JWT.
 *
 * Also exports createSite() — writes a new site document directly to Firestore
 * under customers/{customerId}/sites. File uploads (drawing / photos) remain a
 * Phase 5 concern (GCS signed URLs via ft-api).
 */
import useSWR from 'swr';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
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
  address?: string;
  drawing_gcs?: string | null;
  photo_gcs?: string[];
  floorplan: {
    width_m: number;
    height_m: number;
    floors: number;
    floor_area_m2: number;
  };
  floors: SiteFloor[];
}

// ── Firestore create ──────────────────────────────────────────────────────────

export interface CreateSiteInput {
  name: string;
  description: string;
  address: string;
}

/**
 * Write a new site document to Firestore and return the canonical Site object.
 * File uploads (drawing / photos) are handled separately in Phase 5.
 */
export async function createSite(
  customerId: string,
  input: CreateSiteInput,
): Promise<Site> {
  const sitesRef = collection(db, 'customers', customerId, 'sites');
  const docRef = await addDoc(sitesRef, {
    name:        input.name,
    description: input.description,
    address:     input.address,
    drawing_gcs: null,
    photo_gcs:   [],
    floorplan:   { width_m: 0, height_m: 0, floors: 1, floor_area_m2: 0 },
    floors:      [],
    createdAt:   serverTimestamp(),
  });

  return {
    id:          docRef.id,
    name:        input.name,
    description: input.description,
    address:     input.address,
    drawing_gcs: null,
    photo_gcs:   [],
    floorplan:   { width_m: 0, height_m: 0, floors: 1, floor_area_m2: 0 },
    floors:      [],
  };
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
