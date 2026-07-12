import React from 'react';

const EmissionTable = ({ transactions, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <p className="text-sm text-gray-500">Log of recorded carbon emissions.</p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-400">No transactions recorded.</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.activity_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.quantity}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{tx.carbon_emission.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EmissionTable;
