# Drone Timeline Scrubber (Phase 7)

Documentation for the `CaptureTimeline` and `CaptureDetail` components added in Phase 7.

## Component tree

```
SitePage (/sites/:siteId)
  └── useSiteCaptures()           — all ready captures, ordered captured_at desc
  └── Grid (sidebar + main)
        ├── CaptureTimeline       — date list with metadata rows
        └── Grid (main)
              ├── PotreeViewer (lazy, key=activeCaptureId)
              └── CaptureDetail  — expanded metadata + delete button
```

## CaptureTimeline

**Props**

| Prop | Type | Description |
|------|------|-------------|
| `siteId` | `string` | Site identifier |
| `activeCaptureId` | `string` | Currently selected capture ID (highlighted row) |
| `captures` | `Capture[]` | Ready captures ordered newest-first |
| `onSelect` | `(captureId: string, tilesUrl: string) => void` | Called when the user clicks a row |

**Behaviour**
- Rows ordered newest-first (caller's responsibility — `useSiteCaptures` returns `order=captured_at:desc`)
- Active row has a left accent border and bold date text
- Rows without a `tiles_url` are rendered disabled
- Empty state: "No ready captures yet."

## CaptureDetail

**Props**

| Prop | Type | Description |
|------|------|-------------|
| `siteId` | `string` | Site identifier |
| `capture` | `Capture` | Active capture object |
| `onDeleted` | `(captureId: string) => void` | Called after successful deletion |

**Metadata displayed**

| Field | Source field | Null handling |
|-------|-------------|---------------|
| Flight date | `capture.captured_at` | Always present |
| Photos | `capture.photo_count` | Hidden if null |
| GSD | `capture.metadata.gsd_cm` | Shows "—" if null |
| GSD badge | derived | High < 3 cm · Medium 3–5 · Low > 5 |
| ODM version | `capture.metadata.odm_version` | Hidden if absent |
| Processed | `capture.metadata.processed_at` | Hidden if absent |

**Delete flow**

1. User clicks **Delete capture** → confirmation `Dialog` opens
2. User confirms → `DELETE /api/v1/drone/sites/{siteId}/captures/{captureId}` called
3. HTTP 204 → `onDeleted(captureId)` called; parent removes capture from list
4. HTTP 409 → error message shown in dialog (capture is in-flight)
5. Network error → generic error message shown

## State management pattern in SitePage

```tsx
const [activeCaptureId, setActiveCaptureId] = useState<string | null>(null);

// Default to newest capture on load
useEffect(() => {
  if (captures?.length && !activeCaptureId) {
    setActiveCaptureId(captures[0].id);
  }
}, [captures, activeCaptureId]);

// PotreeViewer remounts when key changes — old GPU memory released
<PotreeViewer key={activeCapture.id} tilesUrl={activeCapture.tiles_url} ... />
```

Using `key={captureId}` on `PotreeViewer` is intentional: it forces a full React remount which tears down the Potree canvas and releases GPU resources before the new tile set loads. No explicit cleanup API is needed.
