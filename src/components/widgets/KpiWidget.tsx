import styles from './KpiWidget.module.css';

interface KpiWidgetProps {
  label: string;
  value?: string;
  note?: string;
  accent?: 'default' | 'warning' | 'positive' | 'negative';
}

export default function KpiWidget({ label, value = '—', note, accent = 'default' }: KpiWidgetProps) {
  return (
    <div className={`${styles.kpi} ${styles[`kpi--${accent}`]}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}
