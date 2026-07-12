export default function CarbonTransactionTable({ transactions }) {
  if (!transactions.length)
    return <p className="empty-state">No transactions recorded yet.</p>

  return (
    <div className="table-wrapper">
      <table className="eco-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Dept ID</th>
            <th>Activity</th>
            <th>Quantity</th>
            <th>EF ID</th>
            <th>CO₂ (kg)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.department_id}</td>
              <td><span className="badge">{t.activity_type}</span></td>
              <td>{t.quantity}</td>
              <td>{t.emission_factor_id}</td>
              <td className="co2-cell">{t.carbon_emission.toFixed(4)}</td>
              <td>{new Date(t.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
