import { Box, Typography, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import type { Capture } from '../../hooks/useCaptureStatus';

export interface CaptureTimelineProps {
  siteId: string;
  activeCaptureId: string;
  captures: Capture[];
  onSelect: (captureId: string, tilesUrl: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function gsdLabel(gsd: number | null | undefined): string {
  if (gsd == null) return '—';
  return `${gsd.toFixed(1)} cm/px`;
}

export default function CaptureTimeline({
  activeCaptureId,
  captures,
  onSelect,
}: CaptureTimelineProps) {
  if (captures.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No ready captures yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="overline" sx={{ px: 2, display: 'block', color: 'text.secondary' }}>
        Timeline
      </Typography>
      <List dense disablePadding>
        {captures.map((capture, idx) => {
          const isActive = capture.id === activeCaptureId;
          return (
            <Box key={capture.id}>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  if (capture.tiles_url) {
                    onSelect(capture.id, capture.tiles_url);
                  }
                }}
                disabled={!capture.tiles_url}
                sx={{
                  borderLeft: isActive ? '3px solid' : '3px solid transparent',
                  borderColor: isActive ? 'primary.main' : 'transparent',
                  transition: 'border-color 0.2s',
                }}
              >
                <ListItemText
                  primary={formatDate(capture.captured_at)}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', gap: 1.5 }}>
                      {capture.photo_count != null && (
                        <span>{capture.photo_count} photos</span>
                      )}
                      <span>{gsdLabel(capture.metadata?.gsd_cm)}</span>
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 400 }}
                />
              </ListItemButton>
              {idx < captures.length - 1 && <Divider component="li" />}
            </Box>
          );
        })}
      </List>
    </Box>
  );
}
