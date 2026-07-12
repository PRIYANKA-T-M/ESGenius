import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Mail, Eye, Edit2, AlertCircle } from 'lucide-react';

const ComplianceTable = ({ issues, loading, onGenerateEmail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPEN': return <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Open</span>;
      case 'CLOSED': return <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">Closed</span>;
      case 'OVERDUE': return <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>;
      default: return <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      CRITICAL: 'text-red-700 bg-red-50 border border-red-200',
      HIGH: 'text-orange-700 bg-orange-50 border border-orange-200',
      MEDIUM: 'text-yellow-700 bg-yellow-50 border border-yellow-200',
      LOW: 'text-blue-700 bg-blue-50 border border-blue-200',
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs font-medium rounded ${colors[severity] || colors.LOW}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      
      {/* HEADER & CONTROLS */}
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Compliance Issues</h2>
          <p className="text-sm text-gray-500">Manage and track departmental compliance violations.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search issues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            
            {loading && (
              <tr>
                <td colSpan="5" className="px-6 py-8">
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            )}

            {!loading && paginatedIssues.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900">No issues found</h3>
                  <p className="text-sm text-gray-500 mt-1">Adjust your search or filter criteria.</p>
                </td>
              </tr>
            )}

            {!loading && paginatedIssues.map((issue) => (
              <tr 
                key={issue.id} 
                className={`transition-colors hover:bg-gray-50 ${issue.status === 'OVERDUE' ? 'bg-red-50/30' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                  <div className="text-xs text-gray-500 mt-1">Emp ID: {issue.owner_employee_id} • Dept: {issue.department_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSeverityBadge(issue.severity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(issue.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.due_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Issue">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onGenerateEmail(issue)}
                      className="text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Generate AI Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && filteredIssues.length > 0 && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredIssues.length)}</span> of <span className="font-medium">{filteredIssues.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceTable;
