// pages/analytics.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from '../styles/Analytics.module.css';

const COLORS = ['#7c6af7','#5b8af7','#34d399','#fbbf24','#f87171','#a78bfa','#60a5fa','#86efac'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions/summary')
      .then(r => r.json())
      .then(d => { setSummary(d); setLoading(false); });
  }, []);

  if (loading) return <Layout><div style={{ color: 'var(--muted)', padding: 40 }}>Loading…</div></Layout>;

  const income   = Number(summary?.totals?.total_income   || 0);
  const expenses = Number(summary?.totals?.total_expenses || 0);

  const monthlyData = (summary?.monthly || []).map(m => ({
    month: m.month,
    Income:   Number(m.income),
    Expenses: Number(m.expenses),
  }));

  const pieData = (summary?.byCategory || []).map(c => ({
    name: c.name,
    value: Number(c.total),
  }));

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Analytics</h1>
          <p className={styles.sub}>Visual breakdown of your financial activity</p>
        </header>

        <div className={styles.grid}>
          {/* Monthly bar chart */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Income vs Expenses — Last 6 Months</h2>
            {monthlyData.length === 0 ? (
              <p className={styles.empty}>Not enough data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                    formatter={v => `£${Number(v).toFixed(2)}`}
                  />
                  <Bar dataKey="Income"   fill="#34d399" radius={[6,6,0,0]} />
                  <Bar dataKey="Expenses" fill="#f87171" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Spending by Category</h2>
            {pieData.length === 0 ? (
              <p className={styles.empty}>No expense data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `£${Number(v).toFixed(2)}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Savings rate card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Financial Health</h2>
            <div className={styles.health}>
              <HealthRow label="Total Income"   value={`£${income.toFixed(2)}`}   color="var(--green)" />
              <HealthRow label="Total Expenses" value={`£${expenses.toFixed(2)}`} color="var(--red)"   />
              <HealthRow label="Net Balance"    value={`£${(income - expenses).toFixed(2)}`} color={income >= expenses ? 'var(--accent)' : 'var(--red)'} />
              <HealthRow
                label="Savings Rate"
                value={income > 0 ? `${(((income - expenses) / income) * 100).toFixed(1)}%` : 'N/A'}
                color="var(--yellow)"
              />
            </div>
          </div>

          {/* Category breakdown table */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Category Breakdown</h2>
            {pieData.length === 0 ? <p className={styles.empty}>No data.</p> : (
              <table className={styles.table}>
                <thead><tr><th>Category</th><th>Total Spent</th><th>% of Expenses</th></tr></thead>
                <tbody>
                  {pieData.map((c, i) => (
                    <tr key={c.name}>
                      <td><span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />{c.name}</td>
                      <td>£{c.value.toFixed(2)}</td>
                      <td>{expenses > 0 ? ((c.value / expenses) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function HealthRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 14, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, color, fontSize: 16 }}>{value}</span>
    </div>
  );
}
