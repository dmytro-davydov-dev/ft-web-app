/**
 * ManageDevicesPage — /dashboard/manage/devices
 * Placeholder — full implementation in Phase 5.
 */
import { Box, Typography, SvgIcon } from '@mui/material';

export default function ManageDevicesPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Manage
        </Typography>
        <Typography variant="h1">Devices</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
        <SvgIcon inheritViewBox sx={{ width: 48, height: 48, color: 'text.disabled' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none"/>
          </svg>
        </SvgIcon>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>Device management</Typography>
          <Typography variant="body2" color="text.secondary">
            Provision and manage BLE tags, gateways, and sensors. Coming in Phase 5.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
