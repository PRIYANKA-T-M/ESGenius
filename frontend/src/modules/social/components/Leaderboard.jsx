import React from 'react';
import { Trophy, Award } from 'lucide-react';

const Leaderboard = ({ data, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" /> Top Employees
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded"></div>)}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No leaderboard data.</p>
        ) : (
          data.map((user, index) => (
            <div key={user.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                  #{index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center text-sm font-bold text-gray-700">
                {user.total_xp} <span className="text-xs text-gray-500 font-normal ml-1">XP</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Leaderboard;
