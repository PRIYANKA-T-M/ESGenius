import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, Bell, BarChart, 
  Search, Settings, Users, LayoutDashboard, Globe
} from 'lucide-react';
import { useGovernanceApi } from './hooks/useGovernanceApi';

import GovernanceCards from './components/GovernanceCards';
import ComplianceTrendChart from './components/ComplianceTrendChart';
import RecentPolicies from './components/RecentPolicies';
import ComplianceTable from './components/ComplianceTable';
import PolicyUpload from './components/PolicyUpload';
import EmailModal from './components/EmailModal';
import GovernanceScore from './components/GovernanceScore';

const Governance = () => {
  const { fetchIssues, fetchPolicies, getScore, loading, error } = useGovernanceApi();
  const [data, setData] = useState({ issues: [], policies: [], scoreData: null });
  const [activeEmailIssue, setActiveEmailIssue] = useState(null);
  
  useEffect(() => {
    // Initial data load
    const loadData = async () => {
      const [issues, policies, score] = await Promise.all([
        fetchIssues(),
        fetchPolicies(),
        getScore(1) // Mocking department_id = 1
      ]);
      setData({ issues, policies, scoreData: score });
    };
    loadData();
  }, [fetchIssues, fetchPolicies, getScore]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-900">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Globe className="h-6 w-6 text-blue-600 mr-2" />
          <span className="font-bold text-xl tracking-tight">ESGenius</span>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 px-3">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarItem icon={<Globe />} label="Environmental" />
          <SidebarItem icon={<Users />} label="Social" />
          <SidebarItem icon={<ShieldCheck />} label="Governance" active />
          <SidebarItem icon={<BarChart />} label="Reports" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVIGATION */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 w-96">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search governance policies, issues..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
              JD
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Governance Dashboard</h1>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
                  Generate Report
                </button>
              </div>
            </div>

            {/* ERROR STATE */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* SECTION 1: TOP KPI CARDS */}
            <GovernanceCards scoreData={data.scoreData} issues={data.issues} policies={data.policies} loading={loading} />

            {/* TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SECTION: COMPLIANCE ISSUES TABLE */}
                <div className="h-[450px]">
                  <ComplianceTable 
                    issues={data.issues} 
                    loading={loading} 
                    onGenerateEmail={(issue) => setActiveEmailIssue(issue)}
                  />
                </div>

                {/* SECTION: RECENT POLICIES */}
                <div className="h-[350px]">
                  <RecentPolicies policies={data.policies} loading={loading} />
                </div>
              </div>

              {/* RIGHT COLUMN (1/3 width) */}
              <div className="space-y-6">
                
                {/* SECTION: SCORE BREAKDOWN */}
                <div className="h-[450px]">
                  <GovernanceScore scoreData={data.scoreData} loading={loading} />
                </div>
                
                {/* SECTION: TREND CHART */}
                <div className="h-[300px]">
                  <ComplianceTrendChart loading={loading} />
                </div>

                {/* SECTION: AI POLICY UPLOAD */}
                <div className="h-[400px]">
                  <PolicyUpload />
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      {activeEmailIssue && (
        <EmailModal issue={activeEmailIssue} onClose={() => setActiveEmailIssue(null)} />
      )}
    </div>
  );
};

// Simple Sidebar Item Component
const SidebarItem = ({ icon, label, active }) => {
  return (
    <a 
      href="#" 
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
        {icon}
      </span>
      {label}
    </a>
  );
};

export default Governance;
