import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useSiteCaptures } from '../hooks/useSiteCaptures';
import CaptureStatus from '../components/Drone/CaptureStatus';

const PotreeViewer = lazy(() => import('../components/Drone/PotreeViewer'));

export default function SitePage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: captures, isLoading, error } = useSiteCaptures(siteId);

  const latestCapture = captures?.[0] ?? null;

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
          {latestCapture && (
            <CaptureStatus siteId={siteId!} captureId={latestCapture.id} />
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

        {!isLoading && !error && !latestCapture && (
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

        {!isLoading && !error && latestCapture?.status === 'ready' && latestCapture.tiles_url && (
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
            <PotreeViewer
              key={latestCapture.id}
              tilesUrl={latestCapture.tiles_url}
              captureId={latestCapture.id}
            />
          </Suspense>
        )}

        {!isLoading && !error && latestCapture && latestCapture.status !== 'ready' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CaptureStatus siteId={siteId!} captureId={latestCapture.id} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
