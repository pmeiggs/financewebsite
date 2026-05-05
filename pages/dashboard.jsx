// pages/dashboard.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from './_app';
import styles from '../styles/Dashboard.module.css';

function StatCard({ label, value, color, icon }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: color + '22', color }}>{icon}</div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue} style={{ color }}>£{Number(value || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, t] = await Promise.all([
        fetch('/api/transactions/summary').then(r => r.json()),
        fetch('/api/transactions').then(r => r.json()),
      ]);
      setSummary(s);
      setRecent(Array.isArray(t) ? t.slice(0, 5) : []);
      setLoading(false);
    }
    load();
  }, []);

  const income   = Number(summary?.totals?.total_income   || 0);
  const expenses = Number(summary?.totals?.total_expenses || 0);
  const balance  = income - expenses;

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Good day, {user?.username} 👋</h1>
            <p className={styles.sub}>Here's your financial overview</p>
          </div>
        </header>

        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : (
          <>
            <div className={styles.stats}>
              <StatCard label="Total Income"   value={income}   color="var(--green)"  icon="↑" />
              <StatCard label="Total Expenses" value={expenses} color="var(--red)"    icon="↓" />
              <StatCard label="Balance"        value={balance}  color={balance >= 0 ? 'var(--accent)' : 'var(--red)'} icon="⚖" />
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Transactions</h2>
              {recent.length === 0 ? (
                <p className={styles.empty}>No transactions yet. <a href="/tracker">Add one →</a></p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th><th>Category</th><th>Description</th><th>Type</th><th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(tx => (
                      <tr key={tx.transaction_id}>
                        <td>{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                        <td><span className={styles.badge}>{tx.category}</span></td>
                        <td className={styles.desc}>{tx.description || '—'}</td>
                        <td>
                          <span className={`${styles.type} ${tx.type === 'income' ? styles.income : styles.expense}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={tx.type === 'income' ? styles.pos : styles.neg}>
                          {tx.type === 'income' ? '+' : '-'}£{Number(tx.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {summary?.byCategory?.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Top Spending Categories</h2>
                <div className={styles.categories}>
                  {summary.byCategory.slice(0, 5).map(c => {
                    const pct = Math.min(100, (c.total / expenses) * 100);
                    return (
                      <div key={c.name} className={styles.catRow}>
                        <span className={styles.catName}>{c.name}</span>
                        <div className={styles.bar}>
                          <div className={styles.barFill} style={{ width: pct + '%' }} />
                        </div>
                        <span className={styles.catAmt}>£{Number(c.total).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
