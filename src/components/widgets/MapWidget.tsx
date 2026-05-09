/**
 * MapWidget — Mapbox GL indoor floor map.
 *
 * Phase 4: renders the pilot site's floor plan with zone polygons and
 * live tag positions (zone-centroid dots, jittered per tag id).
 * Switches floors via a ToggleButtonGroup header control when the site
 * has more than one floor.
 *
 * Requires:
 *   VITE_MAPBOX_TOKEN        — Mapbox public access token
 * Optional overrides (defaults to a London pilot coordinate):
 *   VITE_SITE_CENTER_LNG     — longitude of site centre
 *   VITE_SITE_CENTER_LAT     — latitude of site centre
 */
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { useSites } from '../../hooks/useSites';
import { useTags  } from '../../hooks/useTags';
import type { Site, SiteFloor } from '../../hooks/useSites';
import type { Tag } from '../../hooks/useTags';
import { MAPBOX_TOKEN, PILOT_LNG, PILOT_LAT } from '../../map/env';

// ── Coordinate helpers ────────────────────────────────────────────────────────

const M_PER_DEG_LAT = 111_320;
const mPerDegLng = (lat: number) =>
  M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

/**
 * Convert a floor-local position (x_m, y_m) — (0,0) at the SW corner —
 * to a Mapbox [lng, lat] pair, centred on PILOT_LNG/LAT.
 */
function toCoord(
  x_m: number,
  y_m: number,
  W: number,
  H: number,
): [number, number] {
  return [
    PILOT_LNG + (x_m - W / 2) / mPerDegLng(PILOT_LAT),
    PILOT_LAT + (y_m - H / 2) / M_PER_DEG_LAT,
  ];
}

// ── GeoJSON builders ──────────────────────────────────────────────────────────

type ZoneFeature = GeoJSON.Feature<GeoJSON.Polygon, {
  id: string; label: string; tagCount: number;
}>;

type TagFeature = GeoJSON.Feature<GeoJSON.Point, {
  id: string; label: string; type: string;
}>;

/** Lay zones out as horizontal strips, widths proportional to area_m2. */
function buildZoneFeatures(
  floor: SiteFloor,
  W: number,
  H: number,
  tags: Tag[],
): ZoneFeature[] {
  const total = floor.zones.reduce((s, z) => s + z.area_m2, 0) || W * H;
  let x = 0;

  return floor.zones.map(zone => {
    const zW  = (zone.area_m2 / total) * W;
    const x0  = x;
    const x1  = x + zW;
    x         = x1;
    const cnt = tags.filter(t => t.zoneId === zone.id).length;

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          toCoord(x0, 0, W, H),
          toCoord(x1, 0, W, H),
          toCoord(x1, H, W, H),
          toCoord(x0, H, W, H),
          toCoord(x0, 0, W, H),
        ]],
      },
      properties: { id: zone.id, label: zone.label, tagCount: cnt },
    };
  });
}

/** Place tag dots at their zone centroid, jittered so stacked dots separate. */
function buildTagFeatures(
  floor: SiteFloor,
  W: number,
  H: number,
  tags: Tag[],
): TagFeature[] {
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
      const base    = (t.zoneId && centroids.get(t.zoneId)) ?? toCoord(W / 2, H / 2, W, H);
      // Deterministic per-tag jitter derived from id characters
      const c0      = (t.id.charCodeAt(0) ?? 0) / 255;
      const c1      = (t.id.charCodeAt(1) ?? 0) / 255;
      const jLng    = (c0 - 0.5) * 0.00006;
      const jLat    = (c1 - 0.5) * 0.00004;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [base[0] + jLng, base[1] + jLat],
        },
        properties: { id: t.id, label: t.label, type: t.type },
      };
    });
}

// ── Map initialisation ────────────────────────────────────────────────────────

function createMap(container: HTMLDivElement, site: Site): mapboxgl.Map {
  const { width_m: W, height_m: H } = site.floorplan;
  const sw  = toCoord(0, 0, W, H);
  const ne  = toCoord(W, H, W, H);
  const pad = 0.00006;

  const map = new mapboxgl.Map({
    container,
    accessToken: MAPBOX_TOKEN,
    style:       'mapbox://styles/mapbox/dark-v11',
    bounds:      [[sw[0] - pad, sw[1] - pad], [ne[0] + pad, ne[1] + pad]],
    fitBoundsOptions: { padding: 40 },
    dragRotate:       false,
    pitchWithRotate:  false,
    attributionControl: false,
  });

  map.addControl(
    new mapboxgl.AttributionControl({ compact: true }),
    'bottom-right',
  );
  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: false }),
    'top-right',
  );

  return map;
}

// ── Layer helpers ─────────────────────────────────────────────────────────────

function addLayers(map: mapboxgl.Map): void {
  // Sources (populated by updateSources)
  map.addSource('zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('tags',  { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

  // Zone fill — tinted when occupied
  map.addLayer({
    id: 'zones-fill', type: 'fill', source: 'zones',
    paint: {
      'fill-color': [
        'case', ['>', ['get', 'tagCount'], 0],
        'rgba(0,212,255,0.18)', 'rgba(255,255,255,0.05)',
      ],
      'fill-opacity': 0.9,
    },
  });

  // Zone outline
  map.addLayer({
    id: 'zones-outline', type: 'line', source: 'zones',
    paint: { 'line-color': 'rgba(0,212,255,0.5)', 'line-width': 1.5 },
  });

  // Zone labels
  map.addLayer({
    id: 'zones-labels', type: 'symbol', source: 'zones',
    layout: { 'text-field': ['get', 'label'], 'text-size': 11, 'text-anchor': 'center' },
    paint: {
      'text-color':      'rgba(220,220,255,0.9)',
      'text-halo-color': 'rgba(0,0,0,0.7)',
      'text-halo-width': 1.2,
    },
  });

  // Tag dots
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
}

function updateSources(
  map: mapboxgl.Map,
  site: Site,
  floorIndex: number,
  tags: Tag[],
): void {
  const floor = site.floors[floorIndex];
  if (!floor) return;

  const { width_m: W, height_m: H } = site.floorplan;

  (map.getSource('zones') as mapboxgl.GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: buildZoneFeatures(floor, W, H, tags),
  });
  (map.getSource('tags') as mapboxgl.GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: buildTagFeatures(floor, W, H, tags),
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const popupRef     = useRef<mapboxgl.Popup | null>(null);
  const [ready, setReady] = useState(false);

  const { data: sites, isLoading: sitesLoading } = useSites();
  const { data: tags,  isLoading: tagsLoading  } = useTags();

  const site           = sites?.[0] ?? null;
  const floorList      = site?.floors ?? [];
  const [floorIdx, setFloorIdx] = useState(0);

  // Reset floor selection when site changes
  useEffect(() => { setFloorIdx(0); }, [site?.id]);

  const isLoading = sitesLoading || tagsLoading;
  const noToken   = !MAPBOX_TOKEN;

  // ── Mapbox lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    if (noToken || !site || !containerRef.current) return;

    const map = createMap(containerRef.current, site);
    mapRef.current = map;

    map.on('load', () => {
      addLayers(map);
      updateSources(map, site, floorIdx, tags ?? []);
      setReady(true);
    });

    // Hover popup
    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });
    popupRef.current = popup;

    map.on('mouseenter', 'zones-fill', e => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features?.[0]?.properties as
        { label: string; tagCount: number } | undefined;
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
    // site.id is the stable identity; floorIdx/tags are applied in the next effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noToken, site?.id]);

  // Update GeoJSON when floor selection or tag data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !site || !ready) return;
    updateSources(map, site, floorIdx, tags ?? []);
  }, [site, floorIdx, tags, ready]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Floor map</Typography>

            {floorList.length > 1 && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={floorIdx}
                onChange={(_, v: number | null) => { if (v !== null) setFloorIdx(v); }}
              >
                {floorList.map((f, i) => (
                  <ToggleButton
                    key={f.floor}
                    value={i}
                    sx={{ px: 1.5, py: 0.25, fontSize: '0.7rem', lineHeight: 1.4 }}
                  >
                    {f.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          </Box>
        }
        sx={{ pb: 1 }}
        disableTypography
      />

      <CardContent sx={{ flex: 1, p: '0 !important', position: 'relative', minHeight: 320 }}>
        {/* Loading skeleton */}
        {isLoading && (
          <Skeleton
            variant="rectangular"
            sx={{ position: 'absolute', inset: 0, height: '100%', transform: 'none' }}
          />
        )}

        {/* No token message */}
        {!isLoading && noToken && (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', minHeight: 320,
            gap: 1, p: 3, textAlign: 'center',
          }}>
            <Typography sx={{ fontSize: '1.8rem' }}>🗺</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Mapbox token not configured
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Set <code>VITE_MAPBOX_TOKEN</code> in <code>.env.local</code> to enable the floor map.
            </Typography>
          </Box>
        )}

        {/* No site data */}
        {!isLoading && !noToken && !site && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', minHeight: 320,
          }}>
            <Typography variant="body2" color="text.secondary">No site data available</Typography>
          </Box>
        )}

        {/* Mapbox GL container — hidden until both token + site are present */}
        <div
          ref={containerRef}
          data-testid="map-container"
          style={{
            position: 'absolute',
            inset: 0,
            visibility: (!isLoading && !noToken && !!site) ? 'visible' : 'hidden',
          }}
        />
      </CardContent>
    </Card>
  );
}
