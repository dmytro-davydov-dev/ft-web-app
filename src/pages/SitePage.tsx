/**
 * SitePage — /dashboard/:siteId stub (Phase 2).
 * Rewritten with MUI.
 */
import { useParams } from 'react-router-dom';
import { Box, Typography, Chip, Paper } from '@mui/material';

export default function SitePage() {
  const { siteId } = useParams<{ siteId: string }>();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Site detail
        </Typography>
        <Typography variant="h1">Site: {siteId}</Typography>
      </Box>

      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minHeight: 200,
          textAlign: 'center',
        }}
      >
        <Chip
          label="Phase 4"
          sx={{ bgcolor: 'rgba(124,58,237,0.15)', color: '#9d5cf0', fontWeight: 700 }}
        />
        <Typography color="text.secondary">
          Site-level data and floor map will be wired in Phase 4.
        </Typography>
      </Paper>
    </Box>
  );
}
