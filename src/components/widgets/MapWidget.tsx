/**
 * MapWidget — floor map placeholder (Phase 2).
 * Rewritten with MUI Card.
 */
import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material';

export default function MapWidget() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Floor map
            </Typography>
            <Chip
              label="Phase 4"
              size="small"
              sx={{ bgcolor: 'rgba(124,58,237,0.15)', color: '#9d5cf0', fontWeight: 600 }}
            />
          </Box>
        }
        sx={{ pb: 1 }}
        disableTypography
      />
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 240,
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 32px)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2rem', mb: 1 }}>🗺</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
            Mapbox GL map — wired in Phase 4
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Site config and zone boundaries coming once EMQX + ingest are live.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
