import { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useCaptureStatus, type CaptureStatus as CaptureStatusType } from '../../hooks/useCaptureStatus';
import { apiFetch } from '../../api/client';
import CaptureError from './CaptureError';

interface StatusConfig {
  icon: string;
  label: string;
  polling: boolean;
}

const STATUS_CONFIG: Record<CaptureStatusType, StatusConfig> = {
  pending:    { icon: '⏳', label: 'Waiting for upload',     polling: false },
  uploading:  { icon: '⬆️', label: 'Uploading photos…',     polling: false },
  processing: { icon: '🔄', label: 'Processing with ODM…',  polling: true  },
  tiling:     { icon: '🧩', label: 'Generating 3D tiles…',  polling: true  },
  ready:      { icon: '✅', label: '3D model ready',         polling: false },
  error:      { icon: '❌', label: 'Processing failed',      polling: false },
};

export interface CaptureStatusProps {
  siteId: string;
  captureId: string;
}

export default function CaptureStatus({ siteId, captureId }: CaptureStatusProps) {
  const { data, error, mutate } = useCaptureStatus(siteId, captureId);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await apiFetch(`/api/v1/drone/sites/${siteId}/captures/${captureId}/process`, { method: 'POST' });
      await mutate();
    } catch {
      // error surfaced through the next poll
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography>❌</Typography>
        <Typography variant="body2" color="error">
          Failed to load capture status
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Loading status…
        </Typography>
      </Box>
    );
  }

  if (data.status === 'error') {
    return (
      <CaptureError
        errorDetail={data.metadata?.detail ?? data.metadata?.error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const config = STATUS_CONFIG[data.status];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        animation: 'fadeIn 0.3s ease',
        '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
      }}
    >
      {config.polling ? (
        <CircularProgress size={16} />
      ) : (
        <Typography component="span" sx={{ lineHeight: 1 }}>
          {config.icon}
        </Typography>
      )}
      <Typography variant="body2">
        {config.label}
      </Typography>
    </Box>
  );
}
