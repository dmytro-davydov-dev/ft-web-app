import { useState, useCallback, useRef } from 'react';
import { apiFetch } from '../api/client';

const BATCH_SIZE = 20;

export interface DroneUploadState {
  phase: 'idle' | 'creating' | 'uploading' | 'processing' | 'done' | 'error';
  captureId: string | null;
  total: number;
  uploaded: number;
  failedFiles: string[];
  errorMessage: string | null;
  startedAt: number | null;
}

interface SignedUrl {
  filename: string;
  url: string;
}

interface CreateCaptureResponse {
  capture_id: string;
  status: string;
  upload_urls: SignedUrl[];
}

const INITIAL_STATE: DroneUploadState = {
  phase: 'idle',
  captureId: null,
  total: 0,
  uploaded: 0,
  failedFiles: [],
  errorMessage: null,
  startedAt: null,
};

export function useDroneUpload(siteId: string) {
  const [state, setState] = useState<DroneUploadState>(INITIAL_STATE);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const updateState = useCallback((patch: Partial<DroneUploadState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const startUpload = useCallback(async (files: File[], capturedAt: string) => {
    if (!files.length) return;

    fileMapRef.current = new Map(files.map(f => [f.name, f]));

    updateState({ phase: 'creating', total: files.length, uploaded: 0, failedFiles: [], errorMessage: null, startedAt: null });

    let captureId: string;
    let uploadUrls: SignedUrl[];

    try {
      const res = await apiFetch(`/api/v1/drone/sites/${siteId}/captures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captured_at: capturedAt,
          photo_count: files.length,
          filenames: files.map(f => f.name),
        }),
      });
      if (!res.ok) throw new Error(`Create capture failed: ${res.status}`);
      const data = (await res.json()) as CreateCaptureResponse;
      captureId = data.capture_id;
      uploadUrls = data.upload_urls;
    } catch (err) {
      updateState({ phase: 'error', errorMessage: err instanceof Error ? err.message : 'Failed to create capture' });
      return;
    }

    updateState({ phase: 'uploading', captureId, startedAt: Date.now() });

    const failed: string[] = [];
    let uploadedCount = 0;

    for (let i = 0; i < uploadUrls.length; i += BATCH_SIZE) {
      const batch = uploadUrls.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async ({ filename, url }) => {
          const file = fileMapRef.current.get(filename);
          if (!file) {
            failed.push(filename);
            return;
          }
          try {
            const res = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'image/jpeg' } });
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
          } catch {
            failed.push(filename);
          }
        }),
      );

      uploadedCount += batch.length - batch.filter(b => failed.includes(b.filename)).length;
      updateState({ uploaded: uploadedCount, failedFiles: [...failed] });
    }

    if (failed.length > 0 && failed.length === uploadUrls.length) {
      updateState({ phase: 'error', errorMessage: 'All file uploads failed. Please check your connection and retry.' });
      return;
    }

    updateState({ phase: 'processing' });

    try {
      const res = await apiFetch(`/api/v1/drone/sites/${siteId}/captures/${captureId}/process`, { method: 'POST' });
      if (!res.ok) throw new Error(`Trigger processing failed: ${res.status}`);
    } catch (err) {
      updateState({ phase: 'error', errorMessage: err instanceof Error ? err.message : 'Failed to trigger processing' });
      return;
    }

    updateState({ phase: 'done' });
  }, [siteId, updateState]);

  const retryFailed = useCallback(async () => {
    const { captureId, failedFiles } = state;
    if (!captureId || !failedFiles.length) return;

    const filesToRetry = failedFiles
      .map(name => fileMapRef.current.get(name))
      .filter((f): f is File => f !== undefined);

    if (!filesToRetry.length) return;

    try {
      const res = await apiFetch(`/api/v1/drone/sites/${siteId}/captures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captured_at: new Date().toISOString(),
          photo_count: filesToRetry.length,
          filenames: filesToRetry.map(f => f.name),
        }),
      });
      if (!res.ok) throw new Error(`Retry failed: ${res.status}`);
      const data = (await res.json()) as CreateCaptureResponse;

      updateState({ failedFiles: [], uploaded: state.uploaded });

      const retryFailed: string[] = [];
      for (let i = 0; i < data.upload_urls.length; i += BATCH_SIZE) {
        const batch = data.upload_urls.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async ({ filename, url }) => {
            const file = fileMapRef.current.get(filename);
            if (!file) { retryFailed.push(filename); return; }
            try {
              const r = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'image/jpeg' } });
              if (!r.ok) throw new Error();
            } catch {
              retryFailed.push(filename);
            }
          }),
        );
        updateState({ uploaded: state.uploaded + batch.length - batch.filter(b => retryFailed.includes(b.filename)).length });
      }

      updateState({ failedFiles: retryFailed });
    } catch (err) {
      updateState({ errorMessage: err instanceof Error ? err.message : 'Retry failed' });
    }
  }, [siteId, state, updateState]);

  const reset = useCallback(() => {
    fileMapRef.current.clear();
    setState(INITIAL_STATE);
  }, []);

  return { state, startUpload, retryFailed, reset };
}
