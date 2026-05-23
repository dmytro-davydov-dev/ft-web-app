# Drone 3D Viewer

Documentation for the Phase 6 Potree-based 3D point cloud viewer integrated into the site detail page.

## Component tree

```
SitePage (/sites/:siteId)
  └── useSiteCaptures()            — fetches most-recent ready capture
  └── Paper (Drone 3D View section)
        ├── CaptureStatus           — live pipeline state badge
        └── Suspense
              └── PotreeViewer (lazy)  — Potree canvas + controls
                    └── ViewerControls — point size, colour toggle, reset
```

## Lazy-load strategy

`PotreeViewer` is excluded from the main bundle via `React.lazy`:

```tsx
const PotreeViewer = lazy(() => import('../components/Drone/PotreeViewer'));
```

Potree itself (~800 KB) is loaded from the JSDelivr CDN at runtime using dynamic `<script>` injection inside `PotreeViewer.tsx`. The script is injected once per page session and reused across remounts.

## GCS tile URL pattern

```
https://storage.googleapis.com/flowterra-drone-{env}/captures/{captureId}/tiles/
                                                                              └─ metadata.json  ← Potree entry point
```

The `tiles_url` is returned by `GET /api/v1/drone/sites/{siteId}/captures/{captureId}`.

## PotreeViewer props

| Prop | Type | Description |
|------|------|-------------|
| `tilesUrl` | `string` | GCS tiles prefix URL (must end with `/`) |
| `captureId` | `string` | Used as React `key` — changing it forces a viewer remount and tile swap |

## ViewerControls

Overlaid in the top-right corner of the viewer canvas (≤10% of canvas area).

| Control | Default | Range | Potree API |
|---------|---------|-------|-----------|
| Point size slider | 1.5 | 0.5–5 | `viewer.setPointSize(v)` |
| Colour by height | off | on/off | `viewer.setColorType(HEIGHT \| RGB)` |
| Reset view button | — | — | `viewer.fitToScreen()` |

Mouse controls (Potree built-in): left-drag=orbit, right-drag=pan, scroll=zoom.

## CaptureStatus

Accepts `siteId` and `captureId` props and polls `GET /api/v1/drone/sites/{siteId}/captures/{captureId}` via `useCaptureStatus`.

- Auto-refreshes every 15 s while status is `processing` or `tiling`
- Stops polling on `ready` or `error` (terminal states)
