import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7']

export default function EnvironmentalDashboard({ dashboard, transactions }) {
  if (!dashboard) return null

  const {
    total_carbon_emission,
    total_transactions,
    highest_emission_department,
    highest_emission_value,
    goal_completion,
  } = dashboard

  /* ── build chart data from transactions ── */
  const deptMap = {}
  const actMap  = {}
  transactions.forEach(({ department_id, activity_type, carbon_emission }) => {
    const dKey = `Dept ${department_id}`
    deptMap[dKey] = (deptMap[dKey] || 0) + carbon_emission
    actMap[activity_type] = (actMap[activity_type] || 0) + carbon_emission
  })
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value: +value.toFixed(2) }))
  const actData  = Object.entries(actMap).map(([name, value])  => ({ name, value: +value.toFixed(2) }))

  return (
    <div className="dashboard-wrapper">

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon">🌿</span>
          <div>
            <p className="kpi-label">Total Carbon Emissions</p>
            <p className="kpi-value">{total_carbon_emission.toFixed(2)} <span>kg CO₂</span></p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">📋</span>
          <div>
            <p className="kpi-label">Total Transactions</p>
            <p className="kpi-value">{total_transactions}</p>
          </div>
        </div>
        <div className="kpi-card kpi-card--warn">
          <span className="kpi-icon">🏭</span>
          <div>
            <p className="kpi-label">Highest Emission Dept</p>
            <p className="kpi-value">{highest_emission_department}</p>
            <p className="kpi-sub">{highest_emission_value.toFixed(2)} kg CO₂</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🎯</span>
          <div>
            <p className="kpi-label">Goal Completion</p>
            <p className="kpi-value">{goal_completion.toFixed(1)}<span>%</span></p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(goal_completion, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      {transactions.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Department-wise Emissions (kg CO₂)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v} kg CO₂`, 'Emission']} />
                <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Activity-wise Emissions</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={actData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {actData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} kg CO₂`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
