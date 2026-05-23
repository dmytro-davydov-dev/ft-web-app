import { lazy, Suspense, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useSiteCaptures } from '../hooks/useSiteCaptures';
import CaptureStatus from '../components/Drone/CaptureStatus';
import CaptureTimeline from '../components/Drone/CaptureTimeline';
import CaptureDetail from '../components/Drone/CaptureDetail';

const PotreeViewer = lazy(() => import('../components/Drone/PotreeViewer'));

export default function SitePage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: captures, isLoading, error, mutate } = useSiteCaptures(siteId);

  const [activeCaptureId, setActiveCaptureId] = useState<string | null>(null);

  // Default to the first (newest) capture when data loads
  useEffect(() => {
    if (captures && captures.length > 0 && !activeCaptureId) {
      setActiveCaptureId(captures[0].id);
    }
  }, [captures, activeCaptureId]);

  const activeCapture = captures?.find((c) => c.id === activeCaptureId) ?? captures?.[0] ?? null;

  const handleTimelineSelect = (captureId: string) => {
    setActiveCaptureId(captureId);
  };

  const handleCaptureDeleted = async (captureId: string) => {
    // Optimistically remove from local cache and reset active selection
    if (activeCaptureId === captureId) {
      setActiveCaptureId(null);
    }
    await mutate();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Site detail
        </Typography>
        <Typography variant="h1">Site: {siteId}</Typography>
      </Box>

      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Drone 3D View</Typography>
          {activeCapture && (
            <CaptureStatus siteId={siteId!} captureId={activeCapture.id} />
          )}
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">Failed to load captures. Please try again.</Alert>
        )}

        {!isLoading && !error && !activeCapture && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h4" component="p">📷</Typography>
            <Typography>No 3D model yet. Upload drone photos to get started.</Typography>
          </Box>
        )}

        {!isLoading && !error && activeCapture && (
          <Grid container spacing={2}>
            {/* Timeline sidebar */}
            <Grid item xs={12} md={3}>
              <CaptureTimeline
                siteId={siteId!}
                activeCaptureId={activeCaptureId ?? activeCapture.id}
                captures={captures ?? []}
                onSelect={handleTimelineSelect}
              />
            </Grid>

            {/* Viewer + detail */}
            <Grid item xs={12} md={9}>
              {activeCapture.status === 'ready' && activeCapture.tiles_url ? (
                <Suspense
                  fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  }
                >
                  <PotreeViewer
                    key={activeCapture.id}
                    tilesUrl={activeCapture.tiles_url}
                    captureId={activeCapture.id}
                  />
                </Suspense>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CaptureStatus siteId={siteId!} captureId={activeCapture.id} />
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <CaptureDetail
                  siteId={siteId!}
                  capture={activeCapture}
                  onDeleted={handleCaptureDeleted}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
}
