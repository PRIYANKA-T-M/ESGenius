import React from 'react';
import { Target, TrendingUp, TrendingDown, Info } from 'lucide-react';

const GovernanceScore = ({ scoreData, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full border-8 border-gray-100"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const score = scoreData?.governance_score || 0;
  const breakdown = scoreData?.breakdown || [];
  
  // Determine color based on score
  let scoreColor = 'text-blue-600';
  let barColor = 'bg-blue-600';
  if (score < 50) {
    scoreColor = 'text-red-600';
    barColor = 'bg-red-600';
  } else if (score < 80) {
    scoreColor = 'text-yellow-500';
    barColor = 'bg-yellow-500';
  } else {
    scoreColor = 'text-green-600';
    barColor = 'bg-green-600';
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Score Breakdown</h2>
        <Target className="h-5 w-5 text-gray-400" />
      </div>

      <div className="p-6 flex-1 flex flex-col items-center justify-start">
        
        {/* Score Gauge (Simulated with text and progress bar for enterprise look) */}
        <div className="mb-8 w-full text-center">
          <div className="text-5xl font-bold mb-2">
            <span className={scoreColor}>{score}</span>
            <span className="text-2xl text-gray-400 font-medium">/100</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Department Governance Score</p>
          
          <div className="w-full bg-gray-100 rounded-full h-3 mt-6 overflow-hidden">
            <div 
              className={`h-3 rounded-full ${barColor} transition-all duration-1000 ease-out`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="w-full">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Info className="h-4 w-4 mr-1.5 text-gray-400" /> Score Influences
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {breakdown.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No score influences found.</p>
            ) : (
              breakdown.map((item, idx) => {
                const isPositive = item.startsWith('+');
                return (
                  <div key={idx} className="flex items-start text-sm bg-gray-50 p-2.5 rounded border border-gray-100">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={isPositive ? 'text-gray-700' : 'text-gray-700'}>{item}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceScore;
