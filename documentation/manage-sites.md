# Manage → Sites — Implementation Notes

**Route:** `/dashboard/manage/sites`  
**Status:** Phase 4 — frontend + Firestore write complete; GCS file upload wired for Phase 5  
**Added:** 2026-05-09  
**Updated:** 2026-05-10

---

## Overview

The **Manage** sidebar section (Sites / People / Devices) gives facility managers a self-service path for creating and maintaining site records. This document covers the frontend implementation details for the Sites sub-page.

---

## Sidebar Changes (`AppShell.tsx`)

A new `NAV_ITEMS` section was appended below "Analyze":

```typescript
{
  section: 'Manage',
  items: [
    { to: '/dashboard/manage/sites',   label: 'Sites',   icon: IconManageSites   },
    { to: '/dashboard/manage/people',  label: 'People',  icon: IconManagePeople  },
    { to: '/dashboard/manage/devices', label: 'Devices', icon: IconManageDevices },
  ],
}
```

Three inline SVG icon functions were added at the bottom of the file: `IconManageSites`, `IconManagePeople`, `IconManageDevices`.

---

## Routes (`App.tsx`)

Three new nested routes were added inside the `/dashboard` layout, **before** the `:siteId` catch-all to avoid shadowing:

```typescript
<Route path="manage/sites"   element={<ManageSitesPage />} />
<Route path="manage/people"  element={<ManagePeoplePage />} />
<Route path="manage/devices" element={<ManageDevicesPage />} />
<Route path=":siteId"        element={<SitePage />} />
```

---

## File Structure

```
src/pages/Manage/
  ManageSitesPage.tsx        ← Main implementation
  ManageSitesPage.test.tsx   ← 9 unit tests
  ManagePeoplePage.tsx        ← Stub (Phase 5)
  ManageDevicesPage.tsx       ← Stub (Phase 5)
```

---

## ManageSitesPage — Component Breakdown

### State

| State var | Type | Purpose |
|---|---|---|
| `localSites` | `Site[]` | Optimistically prepended sites (not yet from API) |
| `dialogOpen` | `boolean` | Controls CreateSiteDialog visibility |

`allSites` merges `useSites()` data with `localSites` so new sites appear immediately after creation.

### `SiteRow`

Renders a single `<Card>` with a building icon, site name, description, and MUI `<Chip>` badges for floors / zones / gateways / floor area. Reuses the `Site` type from `hooks/useSites.ts`.

### `CreateSiteDialog`

MUI `<Dialog>` with three sections:

**1. Basic info** — `name` (required), `description` (multiline), `address`

**2. Floor drawing upload**
- Drag-and-drop `DropZone` component (keyboard-accessible, `role="button"`)
- Hidden `<input type="file">` wired via `useRef`
- Accepts: `.png .jpg .jpeg .svg .pdf`
- Image files → object URL preview via `URL.createObjectURL`; non-images → filename card
- Remove button revokes the object URL

**3. Photos upload**
- Hidden `<input type="file" multiple>` for `.png .jpg .jpeg`
- Renders `PhotoThumb` grid (80 × 80 px, `objectFit: cover`)
- Capped at 10 photos; "Add photos" button hidden once limit reached
- Per-photo remove button revokes the object URL

**Submission flow (Phase 4 — Firestore write):**
```
handleSubmit()
  ├─ validate name !== '' and customerId present
  ├─ setSaving(true)
  ├─ createSite(customerId, { name, description, address })
  │    └─ addDoc → Firestore: customers/{customerId}/sites/{newId}
  │         fields: name, description, address, drawing_gcs: null,
  │                 photo_gcs: [], floorplan defaults, floors: [],
  │                 createdAt: serverTimestamp()
  ├─ call onCreated(site)  → parent prepends to localSites (optimistic)
  └─ setSaving(false), reset form
```

The returned `Site` object uses the real Firestore doc ID, so the optimistic card persists correctly on refresh (the SWR list will include it once the REST API reads from Firestore).

**Phase 5 TODO** — wire file uploads:
1. Upload `drawing` → signed GCS URL `sites/{siteId}/drawing/{name}`, write `drawing_gcs` to Firestore doc
2. Upload `photos` in parallel → signed GCS URLs `sites/{siteId}/photos/{name}`, write `photo_gcs` array
3. `mutate(key)` on the SWR key to sync the canonical list

### `DropZone`

Reusable drag-and-drop target:

```typescript
interface DropZoneProps {
  label: string; accept: string;
  dragOver: boolean;
  onDragOver / onDragLeave / onDrop / onClick: handlers;
  disabled: boolean;
}
```

Keyboard accessible via `role="button"`, `tabIndex`, and `onKeyDown` (Enter/Space triggers click).

### `PhotoThumb`

80 × 80 thumbnail with a 20 × 20 remove button overlaid in the top-right corner. Uses `objectFit: cover`.

### `EmptyState`

Shown when `useSites()` returns `[]` and no `localSites` exist. Displays a building icon, copy, and an "Add site" CTA button.

---

## Object URL Lifecycle

Object URLs are created on file selection (`URL.createObjectURL`) and revoked on:
- Drawing: `removeDrawing()` → `URL.revokeObjectURL(form.drawing.preview)`
- Photos: `removePhoto(idx)` → `URL.revokeObjectURL(removed.preview)`
- Dialog close does **not** explicitly revoke (dialog resets form state; browser GC handles the rest at MVP scale)

**Phase 5 note:** If drawing/photo uploads accumulate, add a `useEffect` cleanup to revoke all object URLs on unmount.

---

## Tests (`ManageSitesPage.test.tsx`)

10 tests covering:

| Test | What it checks |
|---|---|
| shows loading spinner | `isLoading: true` → spinner + text |
| shows error alert | `error` → alert with message |
| shows empty state | `data: []` → "No sites yet" + Add button |
| renders site name and chips | site data → name, description, Chip badges |
| page heading is correct | `<h1>Sites</h1>` present |
| opens create dialog | clicking "Add site" → `role="dialog"` present |
| closes dialog on Cancel | Cancel → dialog removed from DOM |
| shows validation error | empty name + submit → "Site name is required." |
| creates site optimistically | `mockCreateSite` resolves → dialog gone, site in list, args verified |
| shows error when createSite rejects | `mockCreateSite` rejects → error alert shown, dialog stays open |

Mocks: `useSites`, `createSite` (both from `hooks/useSites`), and `useAuth` (returns `customerId: 'cust-test'`). No fake timers needed — `createSite` is mocked as an immediately-resolving promise.

---

## Stub Pages

`ManagePeoplePage` and `ManageDevicesPage` follow the same heading pattern (`variant="overline"` kicker + `variant="h1"` title) and display an icon + "Coming in Phase 5" copy. They are imported and routed identically to `ManageSitesPage`.

---

## Related

- Wiki: `wiki/features/manage-sites.md`
- Domain types: `src/hooks/useSites.ts` (`Site`, `SiteFloor`, `SiteZone`)
- Sidebar: `src/components/AppShell.tsx`
- Router: `src/App.tsx`
