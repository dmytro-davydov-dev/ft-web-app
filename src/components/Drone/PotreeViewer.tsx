import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ViewerControls from './ViewerControls';

declare global {
  interface Window {
    Potree: PotreeStatic | undefined;
  }
}

interface PotreeStatic {
  Viewer: new (container: HTMLElement) => PotreeViewer;
  loadPointCloud: (
    url: string,
    name: string,
    callback: (event: { pointcloud: unknown }) => void,
  ) => void;
  PointColorType: { HEIGHT: number; RGB: number };
}

interface PotreeViewer {
  setFOV(fov: number): void;
  setPointBudget(budget: number): void;
  scene: { addPointCloud(cloud: unknown): void };
  fitToScreen(): void;
  setPointSize(size: number): void;
  setColorType(type: number): void;
}

export interface PotreeViewerProps {
  tilesUrl: string;
  captureId: string;
}

const POTREE_SCRIPT =
  'https://cdn.jsdelivr.net/gh/potree/potree@1.8/build/potree/potree.js';
const POTREE_CSS =
  'https://cdn.jsdelivr.net/gh/potree/potree@1.8/build/potree/potree.css';

function loadPotree(): Promise<PotreeStatic> {
  return new Promise((resolve, reject) => {
    if (window.Potree) {
      resolve(window.Potree);
      return;
    }

    // Link CSS
    if (!document.querySelector(`link[href="${POTREE_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = POTREE_CSS;
      document.head.appendChild(link);
    }

    // Load script
    if (document.querySelector(`script[src="${POTREE_SCRIPT}"]`)) {
      const interval = setInterval(() => {
        if (window.Potree) {
          clearInterval(interval);
          resolve(window.Potree);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = POTREE_SCRIPT;
    script.onload = () => {
      if (window.Potree) resolve(window.Potree);
      else reject(new Error('Potree failed to initialise'));
    };
    script.onerror = () => reject(new Error('Failed to load Potree script'));
    document.head.appendChild(script);
  });
}

export default function PotreeViewer({ tilesUrl, captureId }: PotreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PotreeViewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    loadPotree()
      .then((Potree) => {
        if (cancelled || !containerRef.current) return;

        const viewer = new Potree.Viewer(containerRef.current);
        viewer.setFOV(60);
        viewer.setPointBudget(1_000_000);
        viewerRef.current = viewer;

        Potree.loadPointCloud(
          `${tilesUrl}metadata.json`,
          captureId,
          ({ pointcloud }) => {
            if (cancelled) return;
            viewer.scene.addPointCloud(pointcloud);
            viewer.fitToScreen();
            setLoading(false);
          },
        );
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureId, tilesUrl]);

  const handlePointSizeChange = (value: number) => {
    viewerRef.current?.setPointSize(value);
  };

  const handleColourByHeightChange = (on: boolean) => {
    if (!viewerRef.current || !window.Potree) return;
    viewerRef.current.setColorType(
      on ? window.Potree.PointColorType.HEIGHT : window.Potree.PointColorType.RGB,
    );
  };

  const handleResetView = () => {
    viewerRef.current?.fitToScreen();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 500 }}>
      <Box
        ref={containerRef}
        sx={{ width: '100%', height: '100%', bgcolor: '#1a1a2e', borderRadius: 1 }}
      />

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.6)',
            borderRadius: 1,
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.7)',
            borderRadius: 1,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!loading && !error && (
        <ViewerControls
          onPointSizeChange={handlePointSizeChange}
          onColourByHeightChange={handleColourByHeightChange}
          onResetView={handleResetView}
        />
      )}
    </Box>
  );
}
