// pages/tracker.jsx
import { useEffect, useState } from 'react';
import { useAuth } from './_app';
import Layout from '../components/Layout';
import styles from '../styles/Tracker.module.css';

// max amount allowed — matches the decimal(19,2) mysql column.
// 999 trillion covers any realistic personal or business transaction.
const MAX_AMOUNT = 999_999_999_999_999;

const EMPTY = {
  amount:      '',
  type:        'expense',
  category_id: '',
  description: '',
  date:        new Date().toISOString().split('T')[0],
};

export default function Tracker() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories]     = useState([]);
  const [form, setForm]                 = useState(EMPTY);
  const [editing, setEditing]           = useState(null);  // transaction_id being edited
  const [confirmDelete, setConfirmDelete] = useState(null); // transaction_id awaiting confirm
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('all');

  useEffect(() => {
    loadAll();
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  async function loadAll() {
    setLoading(true);
    const data = await fetch('/api/transactions').then(r => r.json());
    setTransactions(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // validate amount on the client before sending to the server
  function handleAmountChange(e) {
    const raw = e.target.value;
    // allow empty string so the user can clear the field
    if (raw === '') { setForm(f => ({ ...f, amount: '' })); return; }
    const num = parseFloat(raw);
    if (!isNaN(num) && num > MAX_AMOUNT) {
      setError(`Amount cannot exceed £${MAX_AMOUNT.toLocaleString('en-GB')}.`);
      return;
    }
    setError('');
    setForm(f => ({ ...f, amount: raw }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const num = parseFloat(form.amount);
    if (isNaN(num) || num <= 0)   { setError('Please enter a valid amount.'); return; }
    if (num > MAX_AMOUNT)         { setError(`Amount cannot exceed £${MAX_AMOUNT.toLocaleString('en-GB')}.`); return; }

    setSaving(true);
    try {
      const url    = editing ? `/api/transactions/${editing}` : '/api/transactions';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, amount: num }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        setSaving(false);
        return;
      }
      setForm(EMPTY);
      setEditing(null);
      loadAll();
    } catch {
      setError('Could not reach the server.');
    }
    setSaving(false);
  }

  function startEdit(tx) {
    setConfirmDelete(null); // clear any pending delete when editing
    setEditing(tx.transaction_id);
    setForm({
      amount:      tx.amount,
      type:        tx.type,
      category_id: tx.category_id,
      description: tx.description || '',
      date:        tx.date?.split('T')[0] || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
  }

  // first click sets the id as pending, second click confirms and deletes
  async function handleDelete(id) {
    if (confirmDelete !== id) {
      setConfirmDelete(id); // show the confirm button for this row
      return;
    }
    // confirmed — proceed with delete
    setConfirmDelete(null);
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    loadAll();
  }

  // clicking anywhere else cancels a pending delete
  function cancelDelete() {
    setConfirmDelete(null);
  }

  const filtered = transactions.filter(tx => {
    const matchType   = filterType === 'all' || tx.type === filterType;
    const q           = search.toLowerCase();
    const matchSearch = !q ||
      tx.category?.toLowerCase().includes(q) ||
      tx.description?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <Layout>
      <div className={styles.page} onClick={cancelDelete}>
        <header className={styles.header}>
          <div>
            <h1>{editing ? 'Edit Transaction' : 'Transaction Tracker'}</h1>
            <p className={styles.sub}>
              {editing ? 'Update the transaction below' : 'Manage all your income and expenses'}
            </p>
          </div>
        </header>

        <section className={styles.formSection}>
          <h2 className={styles.formTitle}>{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>

              <div className={styles.field}>
                <label>Amount (£)</label>
                <input
                  type="number"
                  min="0.01"
                  max={MAX_AMOUNT}
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleAmountChange}
                />
                <span className={styles.fieldHint}>Max £{MAX_AMOUNT.toLocaleString('en-GB')}</span>
              </div>

              <div className={styles.field}>
                <label>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Category</label>
                <select required value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Select...</option>
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label>Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>

              <div className={`${styles.field} ${styles.span2}`}>
                <label>Description (optional)</label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Transaction' : 'Add Transaction'}
              </button>
              {editing && (
                <button type="button" className={styles.btnSecondary} onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle}>All Transactions</h2>
            <div className={styles.filters}>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.search}
              />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className={styles.empty}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>No transactions found.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => (
                    <tr
                      key={tx.transaction_id}
                      className={editing === tx.transaction_id ? styles.editingRow : ''}
                    >
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
                      <td>
                        {/* two-step delete: first click shows confirm, second click deletes */}
                        <div className={styles.actions} onClick={e => e.stopPropagation()}>
                          <button
                            className={styles.editBtn}
                            onClick={() => startEdit(tx)}
                          >Edit</button>

                          {confirmDelete === tx.transaction_id ? (
                            // confirmation state — show confirm and cancel side by side
                            <>
                              <button
                                className={styles.confirmBtn}
                                onClick={() => handleDelete(tx.transaction_id)}
                              >Confirm</button>
                              <button
                                className={styles.cancelDeleteBtn}
                                onClick={cancelDelete}
                              >Cancel</button>
                            </>
                          ) : (
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(tx.transaction_id)}
                            >Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
