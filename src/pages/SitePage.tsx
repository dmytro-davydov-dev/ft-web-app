/**
 * SitePage — /dashboard/:siteId stub (Phase 2).
 */
import { useParams } from 'react-router-dom';
import styles from './SitePage.module.css';

export default function SitePage() {
  const { siteId } = useParams<{ siteId: string }>();

  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Site detail</p>
      <h1 className={styles.title}>Site: {siteId}</h1>
      <div className={styles.placeholder}>
        <span className={styles.badge}>Phase 4</span>
        <p>Site-level data and floor map will be wired in Phase 4.</p>
      </div>
    </div>
  );
}
