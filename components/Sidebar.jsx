// components/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../pages/_app';
import styles from '../styles/Sidebar.module.css';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',    icon: '◈' },
  { href: '/tracker',    label: 'Tracker',       icon: '⊞' },
  { href: '/analytics',  label: 'Analytics',     icon: '◑' },
  { href: '/profile',    label: 'Profile',       icon: '◎' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>₤</span>
        <span className={styles.logoText}>FinTrack</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${router.pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.username}>{user?.username}</span>
            <span className={styles.email}>{user?.email}</span>
          </div>
        </div>
        <button className={styles.logout} onClick={logout} title="Sign out">⏻</button>
      </div>
    </aside>
  );
}
