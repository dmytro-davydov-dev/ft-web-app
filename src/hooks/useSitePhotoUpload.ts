import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { addSitePhoto } from './useSites';
import type { SitePhoto } from './useSites';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface SitePhotoUploadState {
  phase: 'idle' | 'uploading' | 'done' | 'error';
  total: number;
  uploaded: number;
  failedFiles: string[];
  errorMessage: string | null;
}

const INITIAL_STATE: SitePhotoUploadState = {
  phase: 'idle',
  total: 0,
  uploaded: 0,
  failedFiles: [],
  errorMessage: null,
};

export function useSitePhotoUpload(siteId: string) {
  const { customerId } = useAuth();
  const [state, setState] = useState<SitePhotoUploadState>(INITIAL_STATE);

  const startUpload = useCallback(async (
    files: File[],
    takenAt: string,
    comment: string,
  ): Promise<SitePhoto[]> => {
    if (!files.length || !customerId) return [];

    const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setState(prev => ({
        ...prev,
        phase: 'error',
        errorMessage: `${oversized.map(f => f.name).join(', ')} exceed the 5 MB limit.`,
      }));
      return [];
    }

    setState({ phase: 'uploading', total: files.length, uploaded: 0, failedFiles: [], errorMessage: null });

    const results = await Promise.allSettled(
      files.map(async file => {
        const path = `sites/${siteId}/site-photos/${crypto.randomUUID()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const photo: SitePhoto = {
          url,
          storagePath: path,
          takenAt,
          comment,
          uploadedAt: new Date().toISOString(),
          filename: file.name,
          sizeBytes: file.size,
        };
        await addSitePhoto(customerId, siteId, photo);
        setState(prev => ({ ...prev, uploaded: prev.uploaded + 1 }));
        return photo;
      }),
    );

    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<SitePhoto> => r.status === 'fulfilled')
      .map(r => r.value);

    const failedFiles = files
      .filter((_, i) => results[i].status === 'rejected')
      .map(f => f.name);

    setState(prev => ({
      ...prev,
      failedFiles,
      phase: uploaded.length === 0 ? 'error' : 'done',
      errorMessage: uploaded.length === 0 ? 'All uploads failed. Check your connection and try again.' : null,
    }));

    return uploaded;
  }, [siteId, customerId]);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { state, startUpload, reset };
}
