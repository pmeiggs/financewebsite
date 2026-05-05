// pages/profile.jsx
import { useAuth } from './_app';
import Layout from '../components/Layout';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { user, logout } = useAuth();

  // uid is a 16-char hmac-sha256 hash of the real database id.
  // if the stored session pre-dates the hashing feature, show a prompt to re-login.
  const isHashedUid = user?.uid && typeof user.uid === 'string' && isNaN(Number(user.uid));
  const displayUid  = isHashedUid
    ? user.uid.toUpperCase() // show the full 16-char hash, uppercased for readability
    : null;

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Your Profile</h1>
          <p className={styles.sub}>Account information and settings</p>
        </header>

        <div className={styles.card}>
          <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div className={styles.info}>
            <h2 className={styles.username}>{user?.username}</h2>
            <p className={styles.email}>{user?.email}</p>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Username</span>
            <span className={styles.detailValue}>{user?.username}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{user?.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>User ID</span>
            <span className={styles.detailValue}>
              {displayUid
                ? <code className={styles.uidCode}>{displayUid}</code>
                // old session without hashed uid — prompt to sign in again
                : <span className={styles.uidStale} onClick={logout}>Sign out and back in to see your ID</span>
              }
            </span>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
      </div>
    </Layout>
  );
}
