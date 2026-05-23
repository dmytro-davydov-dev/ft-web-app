import { Box, Typography, CircularProgress } from '@mui/material';
import { useCaptureStatus, type CaptureStatus as CaptureStatusType } from '../../hooks/useCaptureStatus';

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
  const { data, error } = useCaptureStatus(siteId, captureId);

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

  const config = STATUS_CONFIG[data.status];
  const errorDetail = data.status === 'error' ? data.metadata?.detail : undefined;

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
        {errorDetail ? ` — ${errorDetail}` : ''}
      </Typography>
    </Box>
  );
}
