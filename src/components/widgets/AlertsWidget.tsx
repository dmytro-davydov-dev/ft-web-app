/**
 * AlertsWidget — recent geofence alerts placeholder (Phase 2).
 * Rewritten with MUI Card + Skeleton.
 */
import { Card, CardContent, CardHeader, Chip, Typography, Box, Skeleton } from '@mui/material';

export default function AlertsWidget() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              Recent alerts
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
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
          Geofence alerts will appear here once EMQX + ingest-fn are live (Phase 4).
        </Typography>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Skeleton variant="circular" width={8} height={8} sx={{ flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={14} />
              <Skeleton variant="text" width="40%" height={12} sx={{ mt: 0.25 }} />
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
