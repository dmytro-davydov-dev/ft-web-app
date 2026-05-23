import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/Error';

export type ErrorCode = 'too_few_features' | 'nodeodm_unreachable' | 'potree_conversion_failed' | 'unknown';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  too_few_features:        'Too few matched features — ensure 70%+ image overlap between photos',
  nodeodm_unreachable:     'Processing server unavailable — please try again in a few minutes',
  potree_conversion_failed:'Tile generation failed — the point cloud may be corrupted',
  unknown:                 'An unexpected error occurred. Please retry or contact support.',
};

function resolveMessage(raw: string | undefined): string {
  if (!raw) return ERROR_MESSAGES.unknown;
  for (const code of Object.keys(ERROR_MESSAGES) as ErrorCode[]) {
    if (raw.includes(code)) return ERROR_MESSAGES[code];
  }
  return ERROR_MESSAGES.unknown;
}

export interface CaptureErrorProps {
  errorDetail?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function CaptureError({ errorDetail, onRetry, isRetrying = false }: CaptureErrorProps) {
  const message = resolveMessage(errorDetail);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        border: '1px solid',
        borderColor: 'error.light',
        borderRadius: 1,
        bgcolor: 'error.50',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <ErrorOutlineIcon color="error" fontSize="small" sx={{ mt: 0.25 }} />
        <Typography variant="body2" color="error.main">
          {message}
        </Typography>
      </Box>

      <Box>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onRetry}
          disabled={isRetrying}
          startIcon={isRetrying ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {isRetrying ? 'Retrying…' : 'Retry'}
        </Button>
      </Box>
    </Box>
  );
}
