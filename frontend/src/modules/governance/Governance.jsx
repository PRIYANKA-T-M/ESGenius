import React, { useEffect, useState } from 'react';
import { useGovernanceApi } from './hooks/useGovernanceApi';
import ComplianceTable from './components/ComplianceTable';
import PolicyUpload from './components/PolicyUpload';

export default function Governance() {
  const { loading, error, fetchIssues, getScore } = useGovernanceApi();
  const [issues, setIssues] = useState([]);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fetchedIssues = await fetchIssues();
    setIssues(fetchedIssues);
    const fetchedScore = await getScore(1); // Mocking department_id as 1 for demo
    setScoreData(fetchedScore);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Governance Dashboard</h1>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">Error loading data: {error}</p>
              <button onClick={loadData} className="mt-2 text-sm text-red-600 underline">Try Again</button>
            </div>
          </div>
        </div>
      )}

      {/* Score Overview */}
      {scoreData && (
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-2">Governance Score (IT Department)</h2>
          <div className="flex items-end space-x-4">
            <span className="text-5xl font-bold text-blue-600">{scoreData.governance_score}</span>
            <span className="text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p className="font-medium">Score Breakdown:</p>
            {scoreData.breakdown.length === 0 ? (
              <p>No active deductions or additions.</p>
            ) : (
              <ul className="list-disc pl-5">
                {scoreData.breakdown.map((item, idx) => (
                  <li key={idx} className={item.startsWith('-') ? 'text-red-600' : 'text-green-600'}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Compliance Issues</h2>
            </div>
            
            {/* Loading State */}
            {loading && issues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading issues...
              </div>
            ) : (
              /* Empty State handled here */
              issues.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No compliance issues found.</p>
                </div>
              ) : (
                <ComplianceTable issues={issues} onIssueUpdate={loadData} />
              )
            )}
          </div>
        </div>
        
        <div>
          <PolicyUpload onUploadSuccess={loadData} />
        </div>
      </div>
    </div>
  );
}
