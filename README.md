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
  hooks/        useReport — SWR hook for all 5 report endpoints
  pages/
    LoginPage/
    DashboardPage/
    Reports/      ← FLO-37: 5 chart/table components + ReportsPage
    SitePage/
  styles/       Design-system CSS tokens
  test/         Jest setup + mocks
```

## Routes

| Path | Component | Auth |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/dashboard` | `DashboardPage` | Required |
| `/dashboard/reports` | `ReportsPage` (lazy) | Required |
| `/dashboard/:siteId` | `SitePage` | Required |

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

72 tests across 21 suites. All new Reports components and the `useReport` hook are covered.
