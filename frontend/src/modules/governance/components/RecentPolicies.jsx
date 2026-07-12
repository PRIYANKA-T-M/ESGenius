import React from 'react';
import { FileText, Download, Clock, AlertCircle } from 'lucide-react';

const RecentPolicies = ({ policies, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Policies</h2>
          <p className="text-sm text-gray-500">Governance documents and frameworks.</p>
        </div>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && (
          <div className="space-y-3 p-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && policies.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <AlertCircle className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">No policies found</p>
            <p className="text-xs text-gray-500 mt-1">Upload a policy to get started.</p>
          </div>
        )}

        {!loading && policies.map((policy) => (
          <div 
            key={policy.id} 
            className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
          >
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{policy.title}</p>
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <span className="mr-3">v{policy.version}</span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(policy.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 transition-all">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPolicies;
