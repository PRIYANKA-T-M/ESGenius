export default function GoalCard({ goal }) {
  const pct = goal.target > 0
    ? Math.min((goal.current / goal.target) * 100, 100)
    : 0

  const radius = 36
  const circ   = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="goal-card">
      <svg width="90" height="90" className="goal-ring">
        <circle cx="45" cy="45" r={radius} className="ring-bg" />
        <circle
          cx="45" cy="45" r={radius}
          className="ring-fill"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="50" textAnchor="middle" className="ring-text">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div className="goal-info">
        <p className="goal-dept">Dept #{goal.department_id}</p>
        <p className="goal-numbers">
          {goal.current} / {goal.target} kg CO₂
        </p>
        <p className="goal-deadline">
          Due: {new Date(goal.deadline).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
