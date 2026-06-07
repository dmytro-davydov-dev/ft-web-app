import { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSites } from '../hooks/useSites';
import type { Site, SiteFloor, SitePhoto } from '../hooks/useSites';
import { useTags } from '../hooks/useTags';
import type { Tag } from '../hooks/useTags';
import { useSiteCaptures } from '../hooks/useSiteCaptures';
import { useSitePhotoUpload } from '../hooks/useSitePhotoUpload';
import { useSitePhotos } from '../hooks/useSitePhotos';
import { MAPBOX_TOKEN, PILOT_LNG, PILOT_LAT } from '../map/env';

const PotreeViewer = lazy(() => import('../components/Drone/PotreeViewer'));

type ViewMode = 'floor-map' | '3d' | 'photos';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Coordinate / GeoJSON helpers ──────────────────────────────────────────────

const M_PER_DEG_LAT = 111_320;
const mPerDegLng = (lat: number) => M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

function toCoord(x_m: number, y_m: number, W: number, H: number): [number, number] {
  return [
    PILOT_LNG + (x_m - W / 2) / mPerDegLng(PILOT_LAT),
    PILOT_LAT + (y_m - H / 2) / M_PER_DEG_LAT,
  ];
}

type ZoneFeature = GeoJSON.Feature<GeoJSON.Polygon, { id: string; label: string; tagCount: number }>;
type TagFeature  = GeoJSON.Feature<GeoJSON.Point,   { id: string; label: string; type: string }>;

function buildZoneFeatures(floor: SiteFloor, W: number, H: number, tags: Tag[]): ZoneFeature[] {
  const total = floor.zones.reduce((s, z) => s + z.area_m2, 0) || W * H;
  let x = 0;
  return floor.zones.map(zone => {
    const zW = (zone.area_m2 / total) * W;
    const x0 = x;
    x += zW;
    const cnt = tags.filter(t => t.zoneId === zone.id).length;
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          toCoord(x0, 0, W, H), toCoord(x, 0, W, H),
          toCoord(x,  H, W, H), toCoord(x0, H, W, H),
          toCoord(x0, 0, W, H),
        ]],
      },
      properties: { id: zone.id, label: zone.label, tagCount: cnt },
    };
  });
}

function buildTagFeatures(floor: SiteFloor, W: number, H: number, tags: Tag[]): TagFeature[] {
  const total = floor.zones.reduce((s, z) => s + z.area_m2, 0) || W * H;
  let x = 0;
  const centroids = new Map<string, [number, number]>();
  floor.zones.forEach(zone => {
    const zW = (zone.area_m2 / total) * W;
    centroids.set(zone.id, toCoord(x + zW / 2, H / 2, W, H));
    x += zW;
  });
  return tags
    .filter(t => t.floor === floor.floor && t.zoneId !== null)
    .map(t => {
      const base = (t.zoneId && centroids.get(t.zoneId)) ?? toCoord(W / 2, H / 2, W, H);
      const c0 = (t.id.charCodeAt(0) ?? 0) / 255;
      const c1 = (t.id.charCodeAt(1) ?? 0) / 255;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [base[0] + (c0 - 0.5) * 0.00006, base[1] + (c1 - 0.5) * 0.00004],
        },
        properties: { id: t.id, label: t.label, type: t.type },
      };
    });
}

// ── SiteFloorMap ──────────────────────────────────────────────────────────────

function SiteFloorMap({ site, tags }: { site: Site; tags: Tag[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady]       = useState(false);
  const [floorIdx, setFloorIdx] = useState(0);

  const { width_m: W, height_m: H } = site.floorplan;
  const floorList = site.floors;
  const noToken   = !MAPBOX_TOKEN;
  const noData    = W === 0 || H === 0;

  useEffect(() => {
    if (noToken || noData || !containerRef.current) return;

    const sw  = toCoord(0, 0, W, H);
    const ne  = toCoord(W, H, W, H);
    const pad = 0.00006;

    const map = new mapboxgl.Map({
      container:        containerRef.current,
      accessToken:      MAPBOX_TOKEN,
      style:            'mapbox://styles/mapbox/dark-v11',
      bounds:           [[sw[0] - pad, sw[1] - pad], [ne[0] + pad, ne[1] + pad]],
      fitBoundsOptions: { padding: 40 },
      dragRotate:       false,
      pitchWithRotate:  false,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      map.addSource('zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addSource('tags',  { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

      map.addLayer({
        id: 'zones-fill', type: 'fill', source: 'zones',
        paint: {
          'fill-color': ['case', ['>', ['get', 'tagCount'], 0], 'rgba(0,212,255,0.18)', 'rgba(255,255,255,0.05)'],
          'fill-opacity': 0.9,
        },
      });
      map.addLayer({
        id: 'zones-outline', type: 'line', source: 'zones',
        paint: { 'line-color': 'rgba(0,212,255,0.5)', 'line-width': 1.5 },
      });
      map.addLayer({
        id: 'zones-labels', type: 'symbol', source: 'zones',
        layout: { 'text-field': ['get', 'label'], 'text-size': 11, 'text-anchor': 'center' },
        paint: { 'text-color': 'rgba(220,220,255,0.9)', 'text-halo-color': 'rgba(0,0,0,0.7)', 'text-halo-width': 1.2 },
      });
      map.addLayer({
        id: 'tags-dots', type: 'circle', source: 'tags',
        paint: {
          'circle-radius':       5,
          'circle-color':        ['match', ['get', 'type'], 'badge', '#00d4ff', 'asset', '#f59e0b', '#9d5cf0'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.65)',
          'circle-opacity':      0.9,
        },
      });

      setReady(true);
    });

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    map.on('mouseenter', 'zones-fill', e => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features?.[0]?.properties as { label: string; tagCount: number } | undefined;
      if (props && e.lngLat) {
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong style="color:#fff;font-size:13px">${props.label}</strong><br/>` +
            `<span style="color:#aaa;font-size:11px">Tags: ${props.tagCount}</span>`,
          )
          .addTo(map);
      }
    });
    map.on('mouseleave', 'zones-fill', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

    return () => {
      setReady(false);
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noToken, noData, site.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const floor = floorList[floorIdx];
    if (!floor) return;
    (map.getSource('zones') as mapboxgl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: buildZoneFeatures(floor, W, H, tags),
    });
    (map.getSource('tags') as mapboxgl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: buildTagFeatures(floor, W, H, tags),
    });
  }, [floorIdx, tags, ready, W, H, floorList]);

  if (noToken) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 1, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '1.8rem' }}>🗺</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Mapbox token not configured
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Set <code>VITE_MAPBOX_TOKEN</code> in <code>.env.local</code> to enable the floor map.
        </Typography>
      </Box>
    );
  }

  if (noData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Typography variant="body2" color="text.secondary">No floor plan data available for this site.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {floorList.length > 1 && (
        <Box sx={{ mb: 1.5 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={floorIdx}
            onChange={(_, v: number | null) => { if (v !== null) setFloorIdx(v); }}
          >
            {floorList.map((f, i) => (
              <ToggleButton key={f.floor} value={i} sx={{ px: 1.5, py: 0.25, fontSize: '0.7rem', lineHeight: 1.4 }}>
                {f.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}
      <Box sx={{ position: 'relative', height: 480, borderRadius: 1, overflow: 'hidden' }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      </Box>
    </Box>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingMap() {
  return <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 1, transform: 'none' }} />;
}

// ── SitePhotosPanel ───────────────────────────────────────────────────────────

function SitePhotosPanel({ photos }: { photos: SitePhoto[] }) {
  const sorted = useMemo(
    () => [...photos].sort((a, b) => b.takenAt.localeCompare(a.takenAt)),
    [photos],
  );

  if (sorted.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
        <Typography variant="body2" color="text.secondary">
          No photos yet — use Upload to add some.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
      {sorted.map(photo => (
        <Paper key={photo.storagePath} variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box
            component="img"
            src={photo.url}
            alt={photo.filename}
            sx={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
          />
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
              {new Date(photo.takenAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Typography>
            {photo.comment && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {photo.comment}
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

// ── SitePhotoDialog ───────────────────────────────────────────────────────────

interface SitePhotoDialogProps {
  open: boolean;
  siteId: string;
  onClose: () => void;
  onUploaded: (photos: SitePhoto[]) => void;
}

function SitePhotoDialog({ open, siteId, onClose, onUploaded }: SitePhotoDialogProps) {
  const { state, startUpload, reset } = useSitePhotoUpload(siteId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles]     = useState<File[]>([]);
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState('');

  const today         = new Date().toISOString().slice(0, 10);
  const oversized     = files.filter(f => f.size > MAX_FILE_SIZE);
  const uploading     = state.phase === 'uploading';
  const canUpload     = files.length > 0 && takenAt.length > 0 && oversized.length === 0 && !uploading;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }

  async function handleUpload() {
    const uploaded = await startUpload(files, takenAt, comment);
    if (uploaded.length > 0) {
      onUploaded(uploaded);
      handleClose();
    }
  }

  function handleClose() {
    reset();
    setFiles([]);
    setTakenAt(today);
    setComment('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload site photos</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              size="small"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose photos
            </Button>

            {files.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                {files.map(f => (
                  <Typography
                    key={f.name}
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: f.size > MAX_FILE_SIZE ? 'error.main' : 'text.secondary',
                    }}
                  >
                    {f.name} — {formatBytes(f.size)}
                  </Typography>
                ))}
                {oversized.length > 0 && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Files must be 5 MB or smaller. Remove or replace the highlighted items.
                  </Alert>
                )}
              </Box>
            )}
          </Box>

          <TextField
            label="Date taken"
            type="date"
            size="small"
            required
            value={takenAt}
            onChange={e => setTakenAt(e.target.value)}
            slotProps={{ htmlInput: { max: today } }}
            disabled={uploading}
          />

          <TextField
            label="Comment"
            multiline
            rows={2}
            size="small"
            placeholder="Optional note…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={uploading}
          />

          {uploading && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={state.total > 0 ? (state.uploaded / state.total) * 100 : 0}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {state.uploaded} / {state.total} uploaded
              </Typography>
            </Box>
          )}

          {state.phase === 'error' && state.errorMessage && (
            <Alert severity="error">{state.errorMessage}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
        <Button variant="contained" onClick={handleUpload} disabled={!canUpload}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── SiteMapsPage ──────────────────────────────────────────────────────────────

export default function SiteMapsPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [viewMode, setViewMode]     = useState<ViewMode>('floor-map');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: sites, isLoading: sitesLoading } = useSites();
  const { data: tags }                            = useTags();
  const { data: captures }                        = useSiteCaptures(siteId);
  const firestorePhotos                           = useSitePhotos(siteId);

  const site          = sites?.find(s => s.id === siteId) ?? null;
  const latestCapture = captures?.[0] ?? null;

  // Photos come directly from Firestore — real-time, persists across reloads.
  const allPhotos = firestorePhotos;

  // If 3D mode but no capture exists, fall back to floor map
  useEffect(() => {
    if (viewMode === '3d' && captures !== undefined && !latestCapture) {
      setViewMode('floor-map');
    }
  }, [captures, latestCapture, viewMode]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handlePhotosUploaded(_photos: SitePhoto[]) {
    // No-op: useSitePhotos listens to Firestore in real-time so the grid
    // updates automatically when the upload writes the document.
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}>
          Site Maps
        </Typography>
        <Typography variant="h1">{site?.name ?? siteId}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6">
              {viewMode === '3d' ? '3D point cloud' : viewMode === 'photos' ? 'Site photos' : 'Floor plan'}
            </Typography>
            {viewMode === 'photos' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Upload
              </Button>
            )}
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v: ViewMode | null) => { if (v) setViewMode(v); }}
          >
            <ToggleButton value="floor-map">
              2D Maps
            </ToggleButton>
            <ToggleButton value="3d" disabled={!latestCapture}>
              3D Maps
            </ToggleButton>
            <ToggleButton value="photos">
              Site Photos
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Floor map (default) */}
        {viewMode === 'floor-map' && (
          sitesLoading ? <LoadingMap /> :
          !site        ? <Alert severity="warning">Site &ldquo;{siteId}&rdquo; not found.</Alert> :
          <SiteFloorMap site={site} tags={tags ?? []} />
        )}

        {/* 3D viewer */}
        {viewMode === '3d' && latestCapture && (
          <Suspense fallback={<LoadingMap />}>
            <PotreeViewer
              key={latestCapture.id}
              tilesUrl={latestCapture.tiles_url!}
              captureId={latestCapture.id}
            />
          </Suspense>
        )}

        {/* Site photos */}
        {viewMode === 'photos' && (
          <SitePhotosPanel photos={allPhotos} />
        )}
      </Paper>

      {dialogOpen && siteId && (
        <SitePhotoDialog
          open={dialogOpen}
          siteId={siteId}
          onClose={() => setDialogOpen(false)}
          onUploaded={handlePhotosUploaded}
        />
      )}
    </Box>
  );
}
