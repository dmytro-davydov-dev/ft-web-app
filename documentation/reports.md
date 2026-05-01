# Reports Page — FLO-37

**Route:** `/dashboard/reports`  
**Status:** Implemented (frontend complete; backend FLO-31 pending)

---

## Overview

The Reports page provides five analytics views sourced from the `ft-api` reporting endpoints (BigQuery-backed). It is lazy-loaded so that Recharts is code-split into its own bundle chunk, keeping the main bundle lean.

---

## Components

| File | Component | Endpoint slug | Chart/Table |
|---|---|---|---|
| `AreaOccupancy.tsx` | `AreaOccupancyChart` | `occupancy-area` | Recharts `LineChart` — one line per area |
| `FloorOccupancy.tsx` | `FloorOccupancyChart` | `occupancy-floor` | Recharts `BarChart` — stacked floors |
| `Utilisation.tsx` | `BuildingUtilisation` | `utilisation-building` | Recharts `AreaChart` — daily % |
| `PeopleDay.tsx` | `PeopleDayTable` | `people-day` | Sortable data table |
| `Alerts.tsx` | `AlertsTable` | `alerts` | Data table with severity/event badges |

---

## Data Fetching

All five components share a single hook:

```typescript
// src/hooks/useReport.ts
export function useReport<T>(reportType: string, params?: ReportParams)
```

- SWR-backed; key is `null` until `customerId` is available (prevents premature requests)
- URL: `GET /v1/customers/{customerId}/reporting/{slug}`
- Firebase ID token attached automatically via `apiFetch`
- Query parameters serialised from `params` object

---

## Type Definitions

`src/pages/Reports/types.ts` exports:

| Type | Description |
|---|---|
| `AreaOccupancyData` | `AreaOccupancyRow[]` — timestamp + dynamic area keys |
| `FloorOccupancyData` | `FloorOccupancyRow[]` — timestamp + dynamic floor keys |
| `UtilisationData` | `UtilisationRow[]` — date + utilisation % |
| `PeopleDayData` | `PeopleDayRow[]` — personId, name, date, durationMinutes, primaryArea |
| `AlertsData` | `AlertRow[]` — id, timestamp, eventType, severity, message, areaName, personName? |

---

## Code-split / Lazy-loading

`ReportsPage` is imported via `React.lazy()` in `App.tsx`:

```typescript
const ReportsPage = React.lazy(() => import('./pages/Reports/ReportsPage'));
```

Vite splits Recharts into a separate chunk that is only downloaded when the user navigates to `/dashboard/reports`.

---

## Tests

7 test suites, 41 tests — all passing (`yarn test`):

- `useReport.test.ts` — hook key construction, fetcher query-string building, error handling
- `ReportsPage.test.tsx` — tab navigation, aria-selected, default tab
- `AreaOccupancy.test.tsx` — loading/error/data states
- `FloorOccupancy.test.tsx` — loading/error/data states
- `Utilisation.test.tsx` — loading/error/data states
- `PeopleDay.test.tsx` — loading/error/data/sort/empty states
- `Alerts.test.tsx` — loading/error/data, badges, empty state

---

## Related

- Linear: [FLO-37](https://linear.app/flowterra/issue/FLO-37)
- Backend blocker: FLO-31 (ft-api report endpoints)
- Wiki: `wiki/features/analytics.md`
