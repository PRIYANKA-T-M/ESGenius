// Maps activity type to a badge colour class
const BADGE_CLASS = {
  Diesel:      'badge--diesel',
  Petrol:      'badge--petrol',
  Electricity: 'badge--electricity',
  Flight:      'badge--flight',
  Train:       'badge--train',
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CarbonTransactionTable({ transactions, deptMap, efMap }) {
  if (!transactions.length)
    return <p className="empty-state">No transactions recorded yet.</p>

  return (
    <div className="table-wrapper">
      <table className="eco-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Department</th>
            <th>Activity</th>
            <th>Quantity</th>
            <th>Emission Factor</th>
            <th>CO₂ (kg)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, idx) => {
            const deptName = deptMap[t.department_id] || `Dept ${t.department_id}`
            const ef       = efMap[t.emission_factor_id]
            const efLabel  = ef ? `${ef.factor} kg/${ef.unit}` : `EF #${t.emission_factor_id}`
            const badgeCls = BADGE_CLASS[t.activity_type] || 'badge--default'

            return (
              <tr key={t.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                <td className="td-id">{t.id}</td>
                <td className="td-dept">{deptName}</td>
                <td><span className={`badge ${badgeCls}`}>{t.activity_type}</span></td>
                <td>{t.quantity}</td>
                <td className="td-ef">{efLabel}</td>
                <td className="co2-cell">{t.carbon_emission.toFixed(4)}</td>
                <td className="td-date">{formatDate(t.created_at)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
