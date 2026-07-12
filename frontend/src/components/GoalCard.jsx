function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function GoalCard({ goal, deptMap }) {
  const pct    = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
  const radius = 36
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ
  const deptName = deptMap?.[goal.department_id] || `Dept #${goal.department_id}`

  // colour ring based on completion
  const ringColor = pct >= 75 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="goal-card">
      <svg width="90" height="90" className="goal-ring">
        <circle cx="45" cy="45" r={radius} className="ring-bg" />
        <circle
          cx="45" cy="45" r={radius}
          className="ring-fill"
          stroke={ringColor}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="50" textAnchor="middle" className="ring-text">
          {pct.toFixed(0)}%
        </text>
      </svg>

      <div className="goal-info">
        <p className="goal-dept">{deptName}</p>
        <div className="goal-progress-bar">
          <div className="goal-progress-fill" style={{ width: `${pct}%`, background: ringColor }} />
        </div>
        <p className="goal-numbers">
          <span style={{ color: ringColor, fontWeight: 700 }}>{goal.current}</span>
          {' / '}
          <span>{goal.target}</span>
          {' kg CO₂'}
        </p>
        <p className="goal-deadline">Due: {formatDate(goal.deadline)}</p>
      </div>
    </div>
  )
}
