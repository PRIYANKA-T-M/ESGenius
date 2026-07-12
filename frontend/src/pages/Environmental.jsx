import { useState, useEffect, useCallback } from 'react'
import {
  getDashboard, getTransactions, getGoals,
  getDepartments, getEmissionFactors,
} from '../services/environmentApi'
import EnvironmentalDashboard from '../components/EnvironmentalDashboard'
import CarbonTransactionTable from '../components/CarbonTransactionTable'
import GoalCard               from '../components/GoalCard'
import GoalModal              from '../components/GoalModal'
import InvoiceUploader        from '../components/InvoiceUploader'
import SkeletonLoader         from '../components/SkeletonLoader'

export default function Environmental() {
  const [dashboard,    setDashboard]    = useState(null)
  const [transactions, setTransactions] = useState([])
  const [goals,        setGoals]        = useState([])
  const [departments,  setDepartments]  = useState([])   // full list for modal dropdown
  const [deptMap,      setDeptMap]      = useState({})   // { id: name } for display
  const [efMap,        setEfMap]        = useState({})   // { id: { factor, unit } }
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [toast,        setToast]        = useState(null)
  const [showModal,    setShowModal]    = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dbRes, txRes, glRes, deptRes, efRes] = await Promise.allSettled([
        getDashboard(),
        getTransactions(),
        getGoals(),
        getDepartments(),
        getEmissionFactors(),
      ])

      if (dbRes.status === 'fulfilled') setDashboard(dbRes.value.data)
      else if (dbRes.reason?.response?.status !== 404)
        setError(dbRes.reason?.response?.data?.detail || 'Failed to load dashboard.')

      if (txRes.status === 'fulfilled')  setTransactions(txRes.value.data)
      if (glRes.status === 'fulfilled')  setGoals(glRes.value.data)

      if (deptRes.status === 'fulfilled') {
        const list = deptRes.value.data
        setDepartments(list)
        const map = {}
        list.forEach(d => { map[d.id] = d.name })
        setDeptMap(map)
      }

      if (efRes.status === 'fulfilled') {
        const map = {}
        efRes.value.data.forEach(e => { map[e.id] = { factor: e.factor, unit: e.unit } })
        setEfMap(map)
      }
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

  function handleGoalCreated() {
    setShowModal(false)
    showToast('Goal created successfully')
    fetchAll()
  }

  return (
    <div className="env-page">

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">✅</span> {toast}
        </div>
      )}

      {/* Goal Modal */}
      {showModal && (
        <GoalModal
          departments={departments}
          onClose={() => setShowModal(false)}
          onCreated={handleGoalCreated}
        />
      )}

      {/* Header */}
      <header className="env-header">
        <div className="env-header__left">
          <span className="env-logo">🌍</span>
          <div>
            <h1>EcoSphere</h1>
            <p>Environmental Management Module</p>
          </div>
        </div>
        <button className="btn-refresh" onClick={fetchAll} disabled={loading}>
          {loading ? <span className="spinner-sm" /> : <><span>↻</span> Refresh</>}
        </button>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? <SkeletonLoader /> : (
        <>
          {/* Dashboard */}
          <section className="env-section">
            <h2 className="section-title"><span>📊</span> Environmental Dashboard</h2>
            {dashboard
              ? <EnvironmentalDashboard
                  dashboard={dashboard}
                  transactions={transactions}
                  deptMap={deptMap}
                />
              : <div className="alert alert--info">
                  No transaction data yet. Upload an invoice below to get started.
                </div>
            }
          </section>

          {/* EcoPilot AI Insights */}
          <section className="env-section">
            <h2 className="section-title"><span>🤖</span> EcoPilot AI Insights</h2>
            <div className="insights-grid">
              <div className="insight-item insight--warn">
                <span>🌱</span>
                <p>
                  {dashboard
                    ? `${dashboard.highest_emission_department} contributes the highest emissions (${dashboard.highest_emission_value.toFixed(2)} kg CO₂).`
                    : 'Add transactions to see department insights.'}
                </p>
              </div>
              <div className="insight-item insight--alert">
                <span>⚠️</span>
                <p>Diesel usage dominates emissions across departments.</p>
              </div>
              <div className="insight-item insight--tip">
                <span>💡</span>
                <p>Switching 20% of diesel usage to EVs could reduce emissions by up to 40%.</p>
              </div>
              <div className="insight-item insight--goal">
                <span>🎯</span>
                <p>Set department-level goals to track and improve your ESG score over time.</p>
              </div>
            </div>
          </section>

          {/* AI Invoice Import */}
          <section className="env-section">
            <h2 className="section-title"><span>✨</span> EcoPilot AI Invoice Import</h2>
            <p className="section-desc">
              Upload a fuel or energy invoice. Gemini AI extracts the data and records the carbon transaction automatically.
            </p>
            <InvoiceUploader onSuccess={handleImportSuccess} />
          </section>

          {/* Carbon Transactions */}
          <section className="env-section">
            <h2 className="section-title">
              <span>⚡</span> Carbon Transactions
              <span className="badge-count">{transactions.length}</span>
            </h2>
            <CarbonTransactionTable
              transactions={transactions}
              deptMap={deptMap}
              efMap={efMap}
            />
          </section>

          {/* Environmental Goals */}
          <section className="env-section">
            <div className="section-title-row">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                <span>🎯</span> Environmental Goals
                <span className="badge-count">{goals.length}</span>
              </h2>
              <button className="btn-add-goal-inline" onClick={() => setShowModal(true)}>
                + Add Goal
              </button>
            </div>

            {goals.length > 0
              ? <div className="goals-grid" style={{ marginTop: 18 }}>
                  {goals.map(g => (
                    <GoalCard key={g.id} goal={g} deptMap={deptMap} />
                  ))}
                </div>
              : <div className="empty-goals">
                  <div className="empty-goals__icon">🎯</div>
                  <p className="empty-goals__title">No Goals Yet</p>
                  <p className="empty-goals__sub">Create your first sustainability goal.</p>
                  <button className="btn-add-goal" onClick={() => setShowModal(true)}>
                    + Add Goal
                  </button>
                </div>
            }
          </section>
        </>
      )}
    </div>
  )
}
