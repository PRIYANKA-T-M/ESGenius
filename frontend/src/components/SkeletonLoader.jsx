export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrapper">
      {/* KPI skeletons */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skel skel-icon" />
            <div style={{ flex: 1 }}>
              <div className="skel skel-label" />
              <div className="skel skel-value" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <div className="skeleton-chart"><div className="skel" style={{ height: '100%', borderRadius: 8 }} /></div>
        <div className="skeleton-chart"><div className="skel" style={{ height: '100%', borderRadius: 8 }} /></div>
      </div>

      {/* Table skeleton */}
      <div className="env-section">
        <div className="skel skel-title" style={{ marginBottom: 16 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skel-row">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="skel skel-cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
