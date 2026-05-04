/**
 * SitesPage — /dashboard/sites
 *
 * Lists all sites for the tenant.  For each site shows a per-floor breakdown
 * with zone count and gateway count.  Tag-count per zone is Phase 5+ once
 * the Firestore presence feed is wired; shown as "—" until then.
 *
 * Data: GET /api/v1/customers/{customerId}/sites  (useSites hook, SWR)
 */
import { useState }              from 'react';
import { useSites }              from '../hooks/useSites';
import type { Site, SiteFloor } from '../hooks/useSites';
import styles                    from './SitesPage.module.css';

export default function SitesPage() {
  const { data: sites, isLoading, error } = useSites();

  if (isLoading) return <LoadingState />;
  if (error)     return <ErrorState message={(error as Error).message} />;
  if (!sites?.length) return <EmptyState />;

  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Sites &amp; Floors</p>
      <h1 className={styles.title}>Sites</h1>

      <div className={styles.siteList}>
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}

// ── SiteCard ─────────────────────────────────────────────────────────────────

function SiteCard({ site }: { site: Site }) {
  const [activeFloor, setActiveFloor] = useState(site.floors[0]?.floor ?? 1);
  const currentFloor = site.floors.find((f) => f.floor === activeFloor);

  const totalZones    = site.floors.reduce((s, f) => s + f.zones.length, 0);
  const totalGateways = site.floors.reduce((s, f) => s + f.gateway_count, 0);

  return (
    <div className={styles.card}>
      {/* ── Card header ── */}
      <div className={styles.cardHeader}>
        <div className={styles.siteInfo}>
          <span className={styles.siteName}>{site.name}</span>
          <span className={styles.siteMeta}>
            {site.floorplan.floors} floors · {totalZones} zones · {totalGateways} gateways
          </span>
          <span className={styles.siteDim}>
            {site.floorplan.width_m} × {site.floorplan.height_m} m ·{' '}
            {site.floorplan.floor_area_m2.toLocaleString()} m²/floor
          </span>
        </div>

        {/* ── Floor tabs ── */}
        <div className={styles.floorTabs} role="tablist" aria-label="Select floor">
          {site.floors.map((f) => (
            <button
              key={f.floor}
              role="tab"
              aria-selected={f.floor === activeFloor}
              className={`${styles.floorTab} ${f.floor === activeFloor ? styles.floorTabActive : ''}`}
              onClick={() => setActiveFloor(f.floor)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Floor detail ── */}
      {currentFloor && <FloorPanel floor={currentFloor} />}
    </div>
  );
}

// ── FloorPanel ────────────────────────────────────────────────────────────────

function FloorPanel({ floor }: { floor: SiteFloor }) {
  return (
    <div className={styles.floorPanel} role="tabpanel">
      <div className={styles.floorMeta}>
        <span className={styles.floorMetaItem}>
          <IconGateway />
          {floor.gateway_count} gateways
        </span>
        <span className={styles.floorMetaItem}>
          <IconZone />
          {floor.zones.length} zones
        </span>
      </div>

      <table className={styles.zoneTable}>
        <thead>
          <tr>
            <th>Zone</th>
            <th className={styles.thNum}>Area (m²)</th>
            <th className={styles.thNum}>Active tags</th>
            <th>Occupancy</th>
          </tr>
        </thead>
        <tbody>
          {floor.zones.map((zone) => (
            <tr key={zone.id} className={styles.zoneRow}>
              <td className={styles.zoneLabel}>{zone.label}</td>
              <td className={styles.tdNum}>{zone.area_m2.toLocaleString()}</td>
              <td className={styles.tdNum}>—</td>
              <td>
                <div className={styles.barWrap} title="Live data in Phase 5">
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '0%' }} />
                  </div>
                  <span className={styles.barLabel}>Phase 5</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Loading / Error / Empty ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Sites &amp; Floors</p>
      <h1 className={styles.title}>Sites</h1>
      <div className={styles.feedback}>Loading site config…</div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Sites &amp; Floors</p>
      <h1 className={styles.title}>Sites</h1>
      <div className={`${styles.feedback} ${styles.feedbackError}`}>
        Could not load sites: {message}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Sites &amp; Floors</p>
      <h1 className={styles.title}>Sites</h1>
      <div className={styles.feedback}>No sites configured for this tenant.</div>
    </div>
  );
}

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconGateway() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 8a6 6 0 0112 0" />
      <path d="M4.5 8a3.5 3.5 0 017 0" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconZone() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}
