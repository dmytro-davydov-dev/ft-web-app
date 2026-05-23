import { Box, LinearProgress, Typography, Chip, List, ListItem, ListItemText } from '@mui/material';

export interface UploadProgressProps {
  total: number;
  uploaded: number;
  failedFiles: string[];
  startedAt?: number | null;
}

function formatEta(uploaded: number, total: number, startedAt: number): string {
  if (uploaded === 0) return '';
  const elapsed = (Date.now() - startedAt) / 1000;
  const rate = uploaded / elapsed;
  const remaining = Math.ceil((total - uploaded) / rate);
  if (remaining < 60) return `~${remaining}s`;
  return `~${Math.ceil(remaining / 60)} min`;
}

export default function UploadProgress({ total, uploaded, failedFiles, startedAt }: UploadProgressProps) {
  const percent = total > 0 ? Math.round((uploaded / total) * 100) : 0;
  const eta = startedAt && uploaded > 0 && uploaded < total ? formatEta(uploaded, total, startedAt) : '';

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Uploading photos… ({uploaded} / {total})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {percent}%
        </Typography>
      </Box>

      <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4 }} />

      {eta && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Estimated time remaining: {eta}
        </Typography>
      )}

      {failedFiles.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Chip label={`${failedFiles.length} failed`} color="error" size="small" />
            <Typography variant="caption" color="error">
              These files failed to upload:
            </Typography>
          </Box>
          <List dense disablePadding>
            {failedFiles.map(name => (
              <ListItem key={name} disableGutters sx={{ py: 0 }}>
                <ListItemText
                  primary={name}
                  primaryTypographyProps={{ variant: 'caption', color: 'error' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
