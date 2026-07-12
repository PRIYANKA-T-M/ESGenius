import { useState, useEffect, useCallback } from 'react'
import { getDashboard, getTransactions, getGoals } from '../services/environmentApi'
import EnvironmentalDashboard from '../components/EnvironmentalDashboard'
import CarbonTransactionTable from '../components/CarbonTransactionTable'
import GoalCard               from '../components/GoalCard'
import InvoiceUploader        from '../components/InvoiceUploader'

export default function Environmental() {
  const [dashboard,     setDashboard]     = useState(null)
  const [transactions,  setTransactions]  = useState([])
  const [goals,         setGoals]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [toast,         setToast]         = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [db, tx, gl] = await Promise.all([
        getDashboard(),
        getTransactions(),
        getGoals(),
      ])
      setDashboard(db.data)
      setTransactions(tx.data)
      setGoals(gl.data)
    } catch (err) {
      // dashboard 404 means no transactions yet — not a hard error
      if (err.response?.status === 404) {
        setDashboard(null)
      } else {
        setError(err.response?.data?.detail || 'Failed to load data. Is the backend running?')
      }
      // still try to load transactions and goals independently
      try { const tx = await getTransactions(); setTransactions(tx.data) } catch {}
      try { const gl = await getGoals();         setGoals(gl.data)        } catch {}
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function handleImportSuccess() {
    showToast('Invoice processed successfully')
    fetchAll()
  }

  return (
    <div className="env-page">

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}

      {/* ── Header ── */}
      <header className="env-header">
        <div className="env-header__left">
          <span className="env-logo">🌍</span>
          <div>
            <h1>EcoSphere</h1>
            <p>Environmental Management Module</p>
          </div>
        </div>
        <button className="btn-refresh" onClick={fetchAll} disabled={loading}>
          {loading ? <span className="spinner-sm" /> : '↻ Refresh'}
        </button>
      </header>

      {/* ── Global error ── */}
      {error && <div className="alert alert--error">{error}</div>}

      {/* ── Loading ── */}
      {loading && (
        <div className="loading-center">
          <div className="spinner" />
          <p>Loading environmental data…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── Section: Dashboard ── */}
          <section className="env-section">
            <h2 className="section-title">
              <span>📊</span> Environmental Dashboard
            </h2>
            {dashboard
              ? <EnvironmentalDashboard dashboard={dashboard} transactions={transactions} />
              : <div className="alert alert--info">No transaction data yet. Upload an invoice to get started.</div>
            }
          </section>

          {/* ── Section: AI Import ── */}
          <section className="env-section">
            <h2 className="section-title">
              <span>✨</span> EcoPilot AI Invoice Import
            </h2>
            <p className="section-desc">
              Upload a fuel or energy invoice. Gemini AI will extract the data and automatically record the carbon transaction.
            </p>
            <InvoiceUploader onSuccess={handleImportSuccess} />
          </section>

          {/* ── Section: Transactions ── */}
          <section className="env-section">
            <h2 className="section-title">
              <span>⚡</span> Carbon Transactions
              <span className="badge-count">{transactions.length}</span>
            </h2>
            <CarbonTransactionTable transactions={transactions} />
          </section>

          {/* ── Section: Goals ── */}
          <section className="env-section">
            <h2 className="section-title">
              <span>🎯</span> Environmental Goals
              <span className="badge-count">{goals.length}</span>
            </h2>
            {goals.length > 0
              ? <div className="goals-grid">{goals.map(g => <GoalCard key={g.id} goal={g} />)}</div>
              : <p className="empty-state">No goals set yet.</p>
            }
          </section>
        </>
      )}
    </div>
  )
}
