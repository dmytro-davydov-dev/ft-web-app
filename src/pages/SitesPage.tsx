/**
 * SitesPage — /dashboard/sites
 * Rewritten with MUI Card, Tabs, Table, LinearProgress.
 */
import { useState }              from 'react';
import { useSites }              from '../hooks/useSites';
import type { Site, SiteFloor } from '../hooks/useSites';

import {
  Box, Card, CardContent, CardHeader, Typography,
  Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  LinearProgress, Chip, Alert, CircularProgress, SvgIcon, Divider,
} from '@mui/material';

export default function SitesPage() {
  const { data: sites, isLoading, error } = useSites();

  if (isLoading) return <LoadingState />;
  if (error)     return <ErrorState message={(error as Error).message} />;
  if (!sites?.length) return <EmptyState />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Sites &amp; Floors
        </Typography>
        <Typography variant="h1">Sites</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </Box>
    </Box>
  );
}

// ── SiteCard ─────────────────────────────────────────────────────────────────

function SiteCard({ site }: { site: Site }) {
  const [activeFloor, setActiveFloor] = useState(site.floors[0]?.floor ?? 1);
  const currentFloor = site.floors.find((f) => f.floor === activeFloor);

  const totalZones    = site.floors.reduce((s, f) => s + f.zones.length, 0);
  const totalGateways = site.floors.reduce((s, f) => s + f.gateway_count, 0);

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h3" sx={{ mb: 0.25 }}>{site.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {site.floorplan.floors} floors · {totalZones} zones · {totalGateways} gateways
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {site.floorplan.width_m} × {site.floorplan.height_m} m ·{' '}
                {site.floorplan.floor_area_m2.toLocaleString()} m²/floor
              </Typography>
            </Box>

            {/* Floor tabs */}
            <Tabs
              value={activeFloor}
              onChange={(_e, val: number) => setActiveFloor(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 36, '& .MuiTabs-indicator': { height: 2 } }}
            >
              {site.floors.map((f) => (
                <Tab
                  key={f.floor}
                  value={f.floor}
                  label={f.label}
                  sx={{ minHeight: 36, py: 0.5, px: 2, fontSize: '0.8125rem' }}
                />
              ))}
            </Tabs>
          </Box>
        }
        disableTypography
        sx={{ pb: 1 }}
      />

      <Divider />

      {currentFloor && <FloorPanel floor={currentFloor} />}
    </Card>
  );
}

// ── FloorPanel ────────────────────────────────────────────────────────────────

function FloorPanel({ floor }: { floor: SiteFloor }) {
  return (
    <CardContent>
      {/* Floor meta */}
      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SvgIcon sx={{ width: 16, height: 16, color: 'text.secondary' }}>
            <IconGateway />
          </SvgIcon>
          <Typography variant="body2" color="text.secondary">
            {floor.gateway_count} gateways
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SvgIcon sx={{ width: 16, height: 16, color: 'text.secondary' }}>
            <IconZone />
          </SvgIcon>
          <Typography variant="body2" color="text.secondary">
            {floor.zones.length} zones
          </Typography>
        </Box>
      </Box>

      {/* Zone table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Zone</TableCell>
              <TableCell align="right">Area (m²)</TableCell>
              <TableCell align="right">Active tags</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Occupancy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {floor.zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {zone.label}
                </TableCell>
                <TableCell align="right">{zone.area_m2.toLocaleString()}</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
                      }}
                    />
                    <Chip
                      label="Phase 5"
                      size="small"
                      sx={{ height: 18, fontSize: '0.6875rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.disabled' }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  );
}

// ── Loading / Error / Empty ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeading />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading site config…</Typography>
      </Box>
    </Box>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeading />
      <Alert severity="error">Could not load sites: {message}</Alert>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeading />
      <Typography color="text.secondary">No sites configured for this tenant.</Typography>
    </Box>
  );
}

function PageHeading() {
  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
        Sites &amp; Floors
      </Typography>
      <Typography variant="h1">Sites</Typography>
    </Box>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function IconGateway() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 0112 0"/>
      <path d="M4.5 8a3.5 3.5 0 017 0"/>
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconZone() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5" height="5" rx="1"/>
      <rect x="9" y="2" width="5" height="5" rx="1"/>
      <rect x="2" y="9" width="5" height="5" rx="1"/>
      <rect x="9" y="9" width="5" height="5" rx="1"/>
    </svg>
  );
}
