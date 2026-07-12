import React, { useState } from 'react';
import { useGovernanceApi } from '../hooks/useGovernanceApi';

export default function ComplianceTable({ issues, onIssueUpdate }) {
  const { draftEmail, loading } = useGovernanceApi();
  const [draftedEmail, setDraftedEmail] = useState(null);

  const handleDraftEmail = async (issueId) => {
    const emailData = await draftEmail(issueId);
    if (emailData) {
      setDraftedEmail(emailData);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {issues.map((issue) => (
            <tr key={issue.id} className={issue.status === 'OVERDUE' ? 'bg-red-50' : ''}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                <div className="text-sm text-gray-500">Employee ID: {issue.owner_employee_id}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  issue.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                  issue.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {issue.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{issue.due_date}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{issue.severity}</td>
              <td className="px-6 py-4 text-sm font-medium">
                {issue.status === 'OVERDUE' && (
                  <button 
                    onClick={() => handleDraftEmail(issue.id)}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Draft Email
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {draftedEmail && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-semibold text-gray-700 mb-2">AI Drafted Email:</h4>
          <div className="bg-white p-3 border rounded">
            <p className="font-medium border-b pb-2 mb-2">Subject: {draftedEmail.subject}</p>
            <p className="whitespace-pre-wrap text-gray-600 text-sm">{draftedEmail.body}</p>
          </div>
          <button 
            onClick={() => setDraftedEmail(null)}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
