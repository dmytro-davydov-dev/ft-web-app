/**
 * AppShell — sidebar + topbar layout wrapper.
 * Matches the design from raw/UI-designs/dashboard-ops.html.
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AppShell.module.css';

const NAV_ITEMS = [
  {
    section: 'Live',
    items: [
      { to: '/dashboard', label: 'Overview', icon: IconGrid, end: true },
      { to: '/dashboard/sites', label: 'Sites & floors', icon: IconSites },
      { to: '/dashboard/events', label: 'Events stream', icon: IconEvents },
      { to: '/dashboard/geofences', label: 'Geofences', icon: IconGeofences },
    ],
  },
  {
    section: 'Assets',
    items: [
      { to: '/dashboard/people', label: 'People', icon: IconPeople },
      { to: '/dashboard/tags', label: 'Tags & devices', icon: IconTags },
      { to: '/dashboard/gateways', label: 'Gateways', icon: IconGateways },
    ],
  },
  {
    section: 'Analyze',
    items: [
      { to: '/dashboard/reports', label: 'Reports', icon: IconReports },
      { to: '/dashboard/occupancy', label: 'Occupancy trends', icon: IconOccupancy },
    ],
  },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const initials = (user?.displayName ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} />
          <span>Flowterra</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <div className={styles.navSection}>{section}</div>
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.userRow}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.displayName ?? user?.email}
            </div>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <input className={styles.search} placeholder="Search tags, people, gateways, events…" />
          <div className={styles.grow} />
          <div className={styles.pillGroup}>
            <span className={`${styles.pill} ${styles.pillActive}`}>Live</span>
            <span className={styles.pill}>Last hour</span>
            <span className={styles.pill}>Today</span>
            <span className={styles.pill}>7d</span>
          </div>
        </header>

        <main className={styles.page}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── Inline SVG icons (matches dashboard-ops.html) ── */
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}
function IconSites() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
    </svg>
  );
}
function IconEvents() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h16M4 18h10"/>
    </svg>
  );
}
function IconGeofences() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}
function IconPeople() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
    </svg>
  );
}
function IconTags() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="7" width="18" height="12" rx="2"/>
      <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2"/>
    </svg>
  );
}
function IconGateways() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12a8 8 0 0116 0"/>
      <path d="M8 12a4 4 0 018 0"/>
      <circle cx="12" cy="12" r="1.2"/>
    </svg>
  );
}
function IconReports() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V7M10 19V4M16 19v-7M22 19H2"/>
    </svg>
  );
}
function IconOccupancy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/>
    </svg>
  );
}
