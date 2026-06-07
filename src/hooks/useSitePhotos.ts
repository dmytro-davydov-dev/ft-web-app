/**
 * useSitePhotos — real-time Firestore listener for a site's photo array.
 *
 * Reads customers/{customerId}/sites/{siteId}.sitePhotos directly from
 * Firestore rather than routing through ft-api. This is intentional:
 * the REST API owns static site config (floors, zones, floorplan); Firestore
 * owns mutable per-site media written by the client.
 *
 * Returns an empty array until the document exists or the user is unauthenticated.
 */
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { SitePhoto } from './useSites';

export function useSitePhotos(siteId: string | undefined): SitePhoto[] {
  const { customerId } = useAuth();
  const [photos, setPhotos] = useState<SitePhoto[]>([]);

  useEffect(() => {
    if (!siteId || !customerId) {
      setPhotos([]);
      return;
    }

    const ref = doc(db, 'customers', customerId, 'sites', siteId);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setPhotos((data.sitePhotos as SitePhoto[]) ?? []);
        } else {
          setPhotos([]);
        }
      },
      () => setPhotos([]),  // on error, fail silently with empty array
    );

    return unsubscribe;
  }, [siteId, customerId]);

  return photos;
}
