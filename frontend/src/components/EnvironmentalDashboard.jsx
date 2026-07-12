import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, Sector,
} from 'recharts'
import { useState } from 'react'

const PALETTE = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#f59e0b', '#3b82f6']

// Custom active shape for donut chart
function ActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#166534" fontSize={13} fontWeight={700}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize={11}>
        {value.toFixed(2)} kg
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  )
}

export default function EnvironmentalDashboard({ dashboard, transactions, deptMap }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const {
    total_carbon_emission,
    total_transactions,
    highest_emission_department,
    highest_emission_value,
    goal_completion,
  } = dashboard

  // Build chart data — use real dept names from deptMap
  const deptAgg = {}
  const actAgg  = {}
  transactions.forEach(({ department_id, activity_type, carbon_emission }) => {
    const name = deptMap[department_id] || `Dept ${department_id}`
    deptAgg[name] = (deptAgg[name] || 0) + carbon_emission
    actAgg[activity_type] = (actAgg[activity_type] || 0) + carbon_emission
  })
  const deptData = Object.entries(deptAgg).map(([name, value]) => ({ name, value: +value.toFixed(2) }))
  const actData  = Object.entries(actAgg).map(([name, value])  => ({ name, value: +value.toFixed(2) }))

  return (
    <div className="dashboard-wrapper">

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card--green">
          <div className="kpi-icon-wrap kpi-icon-wrap--green">🌿</div>
          <div>
            <p className="kpi-label">Total Carbon Emissions</p>
            <p className="kpi-value">{total_carbon_emission.toFixed(2)}</p>
            <p className="kpi-unit">kg CO₂</p>
          </div>
        </div>

        <div className="kpi-card kpi-card--blue">
          <div className="kpi-icon-wrap kpi-icon-wrap--blue">📋</div>
          <div>
            <p className="kpi-label">Total Transactions</p>
            <p className="kpi-value">{total_transactions}</p>
            <p className="kpi-unit">recorded entries</p>
          </div>
        </div>

        <div className="kpi-card kpi-card--amber">
          <div className="kpi-icon-wrap kpi-icon-wrap--amber">🏭</div>
          <div>
            <p className="kpi-label">Highest Emission Dept</p>
            <p className="kpi-value kpi-value--md">{highest_emission_department}</p>
            <p className="kpi-unit">{highest_emission_value.toFixed(2)} kg CO₂</p>
          </div>
        </div>

        <div className="kpi-card kpi-card--green">
          <div className="kpi-icon-wrap kpi-icon-wrap--green">🎯</div>
          <div>
            <p className="kpi-label">Goal Completion</p>
            <p className="kpi-value">{goal_completion.toFixed(1)}<span className="kpi-pct">%</span></p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(goal_completion, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="charts-grid">
          {/* Gradient Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Department-wise Emissions</h3>
            <p className="chart-sub">kg CO₂ per department</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={deptData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}
                  formatter={(v) => [`${v} kg CO₂`, 'Emissions']}
                  cursor={{ fill: 'rgba(22,163,74,.08)' }}
                />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Activity-wise Emissions</h3>
            <p className="chart-sub">Click a segment to inspect</p>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={actData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  activeIndex={activeIdx}
                  activeShape={ActiveShape}
                  onMouseEnter={(_, i) => setActiveIdx(i)}
                >
                  {actData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}
                  formatter={(v) => [`${v} kg CO₂`]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
