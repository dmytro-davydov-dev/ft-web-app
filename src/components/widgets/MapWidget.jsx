/**
 * MapWidget — floor map placeholder (Phase 2).
 * Will be replaced with Mapbox GL in Phase 4+.
 */
import styles from './MapWidget.module.css';

export default function MapWidget() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Floor map</span>
        <span className={styles.badge}>Phase 4</span>
      </div>
      <div className={styles.mapPlaceholder}>
        {/* Grid overlay mimics the design mock */}
        <div className={styles.centerMsg}>
          <span>🗺</span>
          <p>Mapbox GL map — wired in Phase 4</p>
          <p className={styles.sub}>Site config and zone boundaries coming once EMQX + ingest are live.</p>
        </div>
      </div>
    </div>
  );
}
