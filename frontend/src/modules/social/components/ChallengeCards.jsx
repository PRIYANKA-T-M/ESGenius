import React from 'react';
import { Target, Gift, Clock } from 'lucide-react';

const ChallengeCards = ({ challenges, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {challenges.length === 0 ? (
        <div className="col-span-3 text-center text-gray-500 py-10">No active challenges.</div>
      ) : challenges.map(challenge => (
        <div key={challenge.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {challenge.difficulty}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span className="flex items-center text-blue-600 font-bold"><Gift className="h-4 w-4 mr-1" /> {challenge.xp_reward} XP</span>
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {challenge.deadline}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ChallengeCards;
