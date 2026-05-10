# ft-web-app

Flowterra frontend — React 19 + Vite SPA served via Firebase Hosting.

## Stack

| Concern | Library |
|---|---|
| Framework | React 19 |
| Bundler | Vite |
| Routing | React Router v7 |
| Auth | Firebase Auth SDK (JWT, `customerId` custom claim) |
| Data fetching | SWR (reports) · `apiFetch` wrapper (one-off calls) |
| Charts | Recharts 2 |
| Styling | CSS Modules + design-system tokens (`src/styles/tokens.css`) |
| Testing | Jest + Testing Library |
| Types | TypeScript (strict) |

## Quick start

```bash
yarn install
yarn dev         # http://localhost:5173
yarn typecheck   # tsc --noEmit
yarn test        # Jest
```

Point to a local ft-api:
```bash
VITE_API_BASE_URL=http://localhost:8080 yarn dev
```

## Project structure

```
src/
  api/          apiFetch wrapper + env helper
  components/   Shared layout (AppShell, ProtectedRoute) + widgets
  context/      AuthContext — Firebase Auth state
  firebase/     Firebase SDK config
  hooks/        SWR hooks — useSites, useReport, useGateways, useTags, ...
  pages/
    LoginPage/
    DashboardPage/
    Reports/        ← Analyze → Reports (lazy-loaded, Recharts code-split)
    OccupancyPage/  ← Analyze → Occupancy trends
    SitesPage/      ← Live → Sites & floors (read-only view)
    SitePage/       ← /dashboard/:siteId detail
    Manage/         ← Manage section
      ManageSitesPage.tsx    ← Sites CRUD + drawing/photo uploads
      ManagePeoplePage.tsx   ← Stub (Phase 5)
      ManageDevicesPage.tsx  ← Stub (Phase 5)
  styles/       Design-system CSS tokens
  test/         Jest setup + mocks
```

## Routes

| Path | Component | Auth | Section |
|---|---|---|---|
| `/login` | `LoginPage` | Public | — |
| `/dashboard` | `DashboardPage` | Required | Live |
| `/dashboard/sites` | `SitesPage` | Required | Live |
| `/dashboard/events` | `EventsStreamPage` | Required | Live |
| `/dashboard/geofences` | `GeofencesPage` | Required | Live |
| `/dashboard/people` | `PeoplePage` | Required | Assets |
| `/dashboard/tags` | `TagsPage` | Required | Assets |
| `/dashboard/gateways` | `GatewaysPage` | Required | Assets |
| `/dashboard/reports` | `ReportsPage` (lazy) | Required | Analyze |
| `/dashboard/occupancy` | `OccupancyPage` | Required | Analyze |
| `/dashboard/manage/sites` | `ManageSitesPage` | Required | **Manage** |
| `/dashboard/manage/people` | `ManagePeoplePage` | Required | **Manage** |
| `/dashboard/manage/devices` | `ManageDevicesPage` | Required | **Manage** |
| `/dashboard/:siteId` | `SitePage` | Required | — |

## Reports page (FLO-37)

`ReportsPage` is **lazy-loaded** (code-split via `React.lazy`) so Recharts is excluded from the main bundle.

Five tabs, each calling one report endpoint via `useReport`:

| Tab | Component | Endpoint slug | Chart type |
|---|---|---|---|
| Area Occupancy | `AreaOccupancy.tsx` | `occupancy-area` | Recharts `LineChart` |
| Floor Occupancy | `FloorOccupancy.tsx` | `occupancy-floor` | Recharts `BarChart` (stacked) |
| Utilisation | `Utilisation.tsx` | `utilisation-building` | Recharts `AreaChart` |
| People Day | `PeopleDay.tsx` | `people-day` | Sortable table |
| Alerts | `Alerts.tsx` | `alerts` | Table with severity badges |

### useReport hook

```typescript
import { useReport } from './hooks/useReport';

const { data, error, isLoading } = useReport<MyType>('occupancy-area');
// Optionally pass query params:
const { data } = useReport('people-day', { days: 7 });
```

Full URL resolved to: `GET /v1/customers/{customerId}/reporting/{reportType}[?params]`

Auth token is attached automatically via `apiFetch` (Firebase `getIdToken()`). SWR key is `null` until `customerId` is available — prevents premature fetches on first render.

## Manage → Sites

Self-service site creation at `/dashboard/manage/sites`. Managers can create a new site with name, description, address, a floor drawing (PNG/JPG/SVG/PDF, drag-and-drop), and up to 10 site photos.

Newly created sites appear immediately via optimistic local state. The API `POST` + GCS signed-URL upload path is stubbed and ready for Phase 5 wiring — see `documentation/manage-sites.md` for details.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `""` | Prefix for all `apiFetch` calls (e.g. Cloud Run URL) |
| `VITE_FIREBASE_*` | — | Firebase project config (see `src/firebase/config.ts`) |

## Tests

```bash
yarn test             # run all suites
yarn test:coverage    # with coverage report
```

90 tests across 23 suites. All report components, the `useReport` hook, `OccupancyPage`, and `ManageSitesPage` are covered.
