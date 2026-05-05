// components/Layout.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../pages/_app';
import Sidebar from './Sidebar';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user]);

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
