import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const ComplianceTrendChart = ({ loading }) => {
  // Mock data for the trend chart since the API only returns current score, not historical
  // In a real ERP, this would come from a historical metrics endpoint
  const data = [
    { name: 'Jan', score: 65 },
    { name: 'Feb', score: 68 },
    { name: 'Mar', score: 75 },
    { name: 'Apr', score: 72 },
    { name: 'May', score: 80 },
    { name: 'Jun', score: 84 },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full p-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-48 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Compliance Trend</h2>
          <p className="text-sm text-gray-500">6-month historical score.</p>
        </div>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>

      <div className="p-5 flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#2563EB" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComplianceTrendChart;
