/**
 * AlertsWidget — recent geofence alerts placeholder (Phase 2).
 * Will be populated from Firestore listener in Phase 4.
 */
import styles from './AlertsWidget.module.css';

export default function AlertsWidget() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Recent alerts</span>
        <span className={styles.badge}>Phase 4</span>
      </div>
      <div className={styles.body}>
        <p className={styles.empty}>
          Geofence alerts will appear here once EMQX + ingest-fn are live (Phase 4).
        </p>
        {/* Skeleton rows */}
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skelRow}>
            <div className={styles.skelDot} />
            <div className={styles.skelLines}>
              <div className={`${styles.skel} ${styles.skelLong}`} />
              <div className={`${styles.skel} ${styles.skelShort}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
