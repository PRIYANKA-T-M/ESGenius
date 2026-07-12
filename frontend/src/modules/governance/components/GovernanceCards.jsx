import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const GovernanceCards = ({ scoreData, issues, policies, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate metrics based on real data
  const score = scoreData?.governance_score || 0;
  const totalIssues = issues.length;
  const openIssues = issues.filter(i => i.status === 'OPEN').length;
  const overdueIssues = issues.filter(i => i.status === 'OVERDUE').length;
  const closedIssues = issues.filter(i => i.status === 'CLOSED').length;
  const complianceRate = totalIssues === 0 ? 100 : Math.round((closedIssues / totalIssues) * 100);
  const policiesCount = policies.length;

  const kpis = [
    {
      title: "Governance Score",
      value: `${score}/100`,
      icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
      color: "border-l-4 border-l-blue-600"
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: "border-l-4 border-l-green-600"
    },
    {
      title: "Open Issues",
      value: openIssues,
      icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
      color: "border-l-4 border-l-yellow-500"
    },
    {
      title: "Overdue Issues",
      value: overdueIssues,
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      color: "border-l-4 border-l-red-600"
    },
    {
      title: "Policies Uploaded",
      value: policiesCount,
      icon: <FileText className="h-6 w-6 text-gray-600" />,
      color: "border-l-4 border-l-gray-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className={`bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between transition-shadow hover:shadow-md ${kpi.color}`}
        >
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
          </div>
          <div className="p-2 bg-gray-50 rounded-full">
            {kpi.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GovernanceCards;
