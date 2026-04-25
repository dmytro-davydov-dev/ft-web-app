import styles from './KpiWidget.module.css';

/**
 * @param {string} label
 * @param {string} value  — display value, "—" when no data yet
 * @param {string} note   — secondary note shown below value
 * @param {'default'|'warning'|'positive'|'negative'} accent
 */
export default function KpiWidget({ label, value = '—', note, accent = 'default' }) {
  return (
    <div className={`${styles.kpi} ${styles[`kpi--${accent}`]}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}
