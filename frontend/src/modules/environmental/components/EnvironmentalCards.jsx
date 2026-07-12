import React from 'react';
import { Cloud, Zap, Target, TrendingDown } from 'lucide-react';

const EnvironmentalCards = ({ dashboardData, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
      </div>
    );
  }

  const kpis = [
    { title: "Total Emissions", value: `${dashboardData.total_emissions} tCO2e`, icon: <Cloud className="text-blue-600" /> },
    { title: "Monthly Emissions", value: `${dashboardData.monthly_emissions} tCO2e`, icon: <Zap className="text-orange-500" /> },
    { title: "Department Score", value: `${dashboardData.department_score}/100`, icon: <Target className="text-green-600" /> },
    { title: "Goals Achieved", value: dashboardData.goals_achieved, icon: <TrendingDown className="text-purple-600" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</h3>
          </div>
          <div className="p-3 bg-gray-50 rounded-full">{kpi.icon}</div>
        </div>
      ))}
    </div>
  );
};
export default EnvironmentalCards;
